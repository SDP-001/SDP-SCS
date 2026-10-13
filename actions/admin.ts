"use server";

import { requireRole } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { logAuditEvent } from "@/lib/audit/logger";
import { CollegeSettingsData, collegeSettingsSchema } from "@/lib/validators/user";
import { Department, DepartmentType, Category, Profile, Student, Faculty } from "@/types/database.types";
import { revalidatePath } from "next/cache";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Safely ignore when called outside Next.js request context (e.g. testing)
  }
}

export async function getAdminUsersAction() {
  const user = await requireRole(["ADMIN", "HOD"]);
  const db = getDB();

  const students = db.students.map((s) => {
    const profile = db.profiles.find((p) => p.id === s.profile_id);
    const department = db.departments.find((d) => d.id === s.department_id);
    const certCount = db.certificates.filter((c) => c.student_id === s.id).length;
    const approvedCount = db.certificates.filter((c) => c.student_id === s.id && c.status === "APPROVED").length;
    const totalPoints = db.pointRecords
      .filter((p) => p.student_id === s.id && p.is_latest)
      .reduce((sum, p) => sum + p.points, 0);

    return {
      ...s,
      profile,
      department,
      certCount,
      approvedCount,
      totalPoints,
    };
  });

  const faculty = db.faculty.map((f) => {
    const profile = db.profiles.find((p) => p.id === f.profile_id);
    const department = db.departments.find((d) => d.id === f.department_id);
    const reviewCount = db.certificateReviews.filter((r) => r.reviewer_id === f.id).length;
    const activeLockCount = db.certificates.filter(
      (c) => c.reviewer_id === f.id && c.status === "UNDER_REVIEW"
    ).length;

    return {
      ...f,
      profile,
      department,
      reviewCount,
      activeLockCount,
    };
  });

  return { students, faculty };
}

export async function toggleUserStatusAction(profileId: string) {
  const user = await requireRole(["ADMIN"]);
  const db = getDB();

  const targetProfile = db.profiles.find((p) => p.id === profileId);
  if (!targetProfile) {
    return { success: false, error: "User profile not found" };
  }

  const previousStatus = targetProfile.is_active;
  targetProfile.is_active = !previousStatus;
  targetProfile.updated_at = new Date().toISOString();

  // Audit Log
  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "USER_DISABLED",
    entityType: "USER",
    entityId: targetProfile.id,
    metadata: {
      user: targetProfile.full_name,
      newActiveState: targetProfile.is_active,
    },
  });

  // If disabling a faculty member: Revert active UNDER_REVIEW certificates back to SUBMITTED!
  if (!targetProfile.is_active && (targetProfile.role === "FACULTY" || targetProfile.role === "HOD")) {
    const facultyMember = db.faculty.find((f) => f.profile_id === targetProfile.id);
    if (facultyMember) {
      let releasedCount = 0;
      db.certificates.forEach((c) => {
        if (c.reviewer_id === facultyMember.id && c.status === "UNDER_REVIEW") {
          c.status = "SUBMITTED";
          c.reviewer_id = null;
          c.review_started_at = null;
          c.updated_at = new Date().toISOString();
          releasedCount++;

          logAuditEvent({
            collegeId: user.profile.college_id,
            actorId: user.profile.id,
            action: "CERTIFICATE_RECLAIMED",
            entityType: "CERTIFICATE",
            entityId: c.id,
            metadata: {
              reason: "Faculty member disabled by admin; locked review released back to SUBMITTED",
              faculty: targetProfile.full_name,
            },
          });
        }
      });
    }
  }

  safeRevalidate("/admin/users");
  safeRevalidate("/faculty/reviews");
  return { success: true, isActive: targetProfile.is_active };
}

export async function getDepartmentsAction() {
  const user = await requireRole(["ADMIN", "HOD"]);
  const db = getDB();

  return db.departments
    .filter((d) => d.college_id === user.profile.college_id)
    .map((d) => {
      const studentCount = db.students.filter((s) => s.department_id === d.id).length;
      const facultyCount = db.faculty.filter((f) => f.department_id === d.id).length;
      const hod = db.faculty.find((f) => f.department_id === d.id && f.is_hod);
      const hodProfile = hod ? db.profiles.find((p) => p.id === hod.profile_id) : undefined;

      return {
        ...d,
        studentCount,
        facultyCount,
        hod: hod ? { ...hod, profile: hodProfile } : undefined,
      };
    });
}

export async function createDepartmentAction(data: {
  name: string;
  code: string;
  type?: DepartmentType;
}) {
  const user = await requireRole(["ADMIN"]);
  const db = getDB();

  if (!data.name || !data.code) {
    return { success: false, error: "Name and code are required" };
  }

  const existing = db.departments.find(
    (d) =>
      d.college_id === user.profile.college_id &&
      (d.code.toLowerCase() === data.code.toLowerCase().trim() ||
        d.name.toLowerCase() === data.name.toLowerCase().trim())
  );
  if (existing) {
    return { success: false, error: "Department code or name already exists" };
  }

  const deptType: DepartmentType = data.type === "PG" ? "PG" : "UG";

  const newDept: Department = {
    id: crypto.randomUUID(),
    college_id: user.profile.college_id,
    name: data.name.trim(),
    code: data.code.toUpperCase().trim(),
    type: deptType,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.departments.push(newDept);

  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "CONFIGURATION_CHANGED",
    entityType: "DEPARTMENT",
    entityId: newDept.id,
    metadata: { name: data.name, code: data.code, type: deptType },
  });

  safeRevalidate("/admin/departments");
  return { success: true, department: newDept };
}

export async function updateDepartmentAction(
  id: string,
  data: { name: string; code: string; type?: DepartmentType; is_active?: boolean }
) {
  const user = await requireRole(["ADMIN"]);
  const db = getDB();

  const dept = db.departments.find(
    (d) => d.id === id && d.college_id === user.profile.college_id
  );
  if (!dept) {
    return { success: false, error: "Department not found" };
  }

  // Check collision with other departments
  const collision = db.departments.find(
    (d) =>
      d.id !== id &&
      d.college_id === user.profile.college_id &&
      (d.code.toLowerCase() === data.code.toLowerCase().trim() ||
        d.name.toLowerCase() === data.name.toLowerCase().trim())
  );
  if (collision) {
    return {
      success: false,
      error: "Another department with this code or name already exists",
    };
  }

  dept.name = data.name.trim();
  dept.code = data.code.toUpperCase().trim();
  if (data.type) {
    dept.type = data.type;
  }
  if (data.is_active !== undefined) {
    dept.is_active = data.is_active;
  }

  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "CONFIGURATION_CHANGED",
    entityType: "DEPARTMENT",
    entityId: dept.id,
    metadata: {
      name: dept.name,
      code: dept.code,
      type: dept.type,
      is_active: dept.is_active,
    },
  });

  safeRevalidate("/admin/departments");
  return { success: true, department: dept };
}

export async function getAdminCategoriesAction() {
  const user = await requireRole(["ADMIN"]);
  const db = getDB();

  return db.categories
    .filter((c) => c.college_id === user.profile.college_id)
    .map((c) => {
      const certCount = db.certificates.filter((cert) => cert.category_id === c.id).length;
      return {
        ...c,
        certCount,
      };
    });
}

export async function createCategoryAction(data: { name: string; description?: string }) {
  const user = await requireRole(["ADMIN"]);
  const db = getDB();

  if (!data.name.trim()) {
    return { success: false, error: "Category name is required" };
  }

  const existing = db.categories.find(
    (c) => c.college_id === user.profile.college_id && c.name.toLowerCase() === data.name.toLowerCase()
  );
  if (existing) {
    return { success: false, error: "Category with this name already exists" };
  }

  const newCat: Category = {
    id: crypto.randomUUID(),
    college_id: user.profile.college_id,
    name: data.name.trim(),
    description: data.description || null,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.categories.push(newCat);

  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "CONFIGURATION_CHANGED",
    entityType: "CATEGORY",
    entityId: newCat.id,
    metadata: { name: data.name },
  });

  safeRevalidate("/admin/categories");
  return { success: true, category: newCat };
}

export async function toggleCategoryStatusAction(categoryId: string) {
  const user = await requireRole(["ADMIN"]);
  const db = getDB();

  const cat = db.categories.find((c) => c.id === categoryId);
  if (!cat) {
    return { success: false, error: "Category not found" };
  }

  // Soft disable
  cat.is_active = !cat.is_active;

  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "CONFIGURATION_CHANGED",
    entityType: "CATEGORY",
    entityId: cat.id,
    metadata: { name: cat.name, is_active: cat.is_active },
  });

  safeRevalidate("/admin/categories");
  return { success: true, isActive: cat.is_active };
}

export async function getCollegeSettingsAction() {
  const user = await requireRole(["ADMIN", "HOD", "FACULTY"]);
  const db = getDB();
  const college = db.colleges.find((c) => c.id === user.profile.college_id);
  const settings = db.collegeSettings.find((s) => s.college_id === user.profile.college_id);

  return {
    college,
    settings: settings || {
      id: "22222222-2222-2222-2222-222222222222",
      college_id: user.profile.college_id,
      max_points_per_certificate: 100,
      reviewer_reclaim_timeout_minutes: 30,
      max_file_size_mb: 10,
      updated_at: new Date().toISOString(),
    },
  };
}

export async function updateCollegeSettingsAction(data: CollegeSettingsData) {
  const user = await requireRole(["ADMIN"]);
  const validation = collegeSettingsSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0]?.message };
  }

  const db = getDB();
  let settings = db.collegeSettings.find((s) => s.college_id === user.profile.college_id);

  if (settings) {
    settings.max_points_per_certificate = data.max_points_per_certificate;
    settings.reviewer_reclaim_timeout_minutes = data.reviewer_reclaim_timeout_minutes;
    settings.max_file_size_mb = data.max_file_size_mb;
    settings.updated_at = new Date().toISOString();
  }

  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "CONFIGURATION_CHANGED",
    entityType: "COLLEGE_SETTINGS",
    entityId: settings?.id || "SETTINGS",
    metadata: data,
  });

  safeRevalidate("/admin/settings");
  return { success: true };
}

export async function getInstitutionalAnalyticsAction() {
  const user = await requireRole(["ADMIN", "HOD"]);
  const db = getDB();

  // Summary counts
  const totalStudents = db.students.filter((s) => s.college_id === user.profile.college_id).length;
  const totalFaculty = db.faculty.filter((f) => f.college_id === user.profile.college_id).length;
  const allCerts = db.certificates.filter((c) => c.college_id === user.profile.college_id);

  // Separate UG & PG metrics
  const ugDepts = db.departments.filter((d) => d.college_id === user.profile.college_id && d.type === "UG");
  const pgDepts = db.departments.filter((d) => d.college_id === user.profile.college_id && d.type === "PG");
  const ugDeptIds = new Set(ugDepts.map((d) => d.id));
  const pgDeptIds = new Set(pgDepts.map((d) => d.id));

  const ugStudentsCount = db.students.filter((s) => s.college_id === user.profile.college_id && ugDeptIds.has(s.department_id)).length;
  const pgStudentsCount = db.students.filter((s) => s.college_id === user.profile.college_id && pgDeptIds.has(s.department_id)).length;

  const pendingCount = allCerts.filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW").length;
  const approvedCount = allCerts.filter((c) => c.status === "APPROVED").length;
  const rejectedCount = allCerts.filter((c) => c.status === "REJECTED").length;
  const correctionCount = allCerts.filter((c) => c.status === "CORRECTION_REQUIRED").length;

  const totalPointsAwarded = db.pointRecords
    .filter((p) => p.is_latest)
    .reduce((sum, p) => sum + p.points, 0);

  // Certificates by Department (with type)
  const certsByDepartment = db.departments
    .filter((d) => d.college_id === user.profile.college_id)
    .map((d) => {
      const deptStudents = new Set(db.students.filter((s) => s.department_id === d.id).map((s) => s.id));
      const count = allCerts.filter((c) => deptStudents.has(c.student_id)).length;
      const approved = allCerts.filter((c) => deptStudents.has(c.student_id) && c.status === "APPROVED").length;
      return {
        id: d.id,
        name: d.code,
        department: d.name,
        type: d.type || "UG",
        total: count,
        approved,
      };
    });

  // Certificates by Category
  const certsByCategory = db.categories
    .filter((cat) => cat.college_id === user.profile.college_id && cat.is_active)
    .map((cat) => {
      const count = allCerts.filter((c) => c.category_id === cat.id).length;
      return {
        name: cat.name,
        count,
      };
    })
    .filter((item) => item.count > 0);

  // Status Distribution
  const statusDistribution = [
    { name: "Approved", value: approvedCount, color: "#10B981" },
    { name: "Pending", value: pendingCount, color: "#3B82F6" },
    { name: "Correction Required", value: correctionCount, color: "#F59E0B" },
    { name: "Rejected", value: rejectedCount, color: "#EF4444" },
  ];

  // Faculty Verification Activity
  const facultyActivity = db.faculty
    .filter((f) => f.college_id === user.profile.college_id)
    .map((f) => {
      const profile = db.profiles.find((p) => p.id === f.profile_id);
      const reviews = db.certificateReviews.filter((r) => r.reviewer_id === f.id);
      const approved = reviews.filter((r) => r.action === "APPROVED").length;
      const corrections = reviews.filter((r) => r.action === "CORRECTION_REQUESTED").length;
      const rejected = reviews.filter((r) => r.action === "REJECTED").length;

      return {
        name: profile?.full_name || f.employee_id,
        approved,
        corrections,
        rejected,
        totalReviews: reviews.length,
      };
    });

  return {
    totalStudents,
    totalFaculty,
    ugDeptCount: ugDepts.length,
    pgDeptCount: pgDepts.length,
    ugStudentsCount,
    pgStudentsCount,
    totalCertificates: allCerts.length,
    pendingCount,
    approvedCount,
    rejectedCount,
    correctionCount,
    totalPointsAwarded,
    certsByDepartment,
    certsByCategory,
    statusDistribution,
    facultyActivity,
  };
}

export async function getAuditLogsAction() {
  const user = await requireRole(["ADMIN", "HOD"]);
  const db = getDB();

  return db.auditLogs
    .filter((l) => l.college_id === user.profile.college_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((l) => {
      const actor = db.profiles.find((p) => p.id === l.actor_id);
      return {
        ...l,
        actor: actor ? { full_name: actor.full_name, email: actor.email, role: actor.role } : undefined,
      };
    });
}

export interface AddStudentInput {
  fullName: string;
  email: string;
  registerNumber: string;
  academicYear: number;
  departmentId?: string;
}

export async function addStudentAction(input: AddStudentInput) {
  const caller = await requireRole(["HOD", "FACULTY", "ADMIN"]);
  const db = getDB();

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const registerNumber = input.registerNumber.trim().toUpperCase();
  const academicYear = Number(input.academicYear) || 1;

  if (!fullName) {
    return { success: false, error: "Student full name is required." };
  }
  if (!email || !email.includes("@")) {
    return { success: false, error: "A valid official student email address is required." };
  }
  if (!registerNumber) {
    return { success: false, error: "Anna University / NEC Register Number is required." };
  }

  let departmentId = input.departmentId;
  if (!departmentId) {
    if (caller.faculty?.department_id) {
      departmentId = caller.faculty.department_id;
    } else {
      departmentId = db.departments[0]?.id;
    }
  }

  const dept = db.departments.find((d) => d.id === departmentId);
  if (!dept) {
    return { success: false, error: "Selected department was not found." };
  }

  const existingProfile = db.profiles.find((p) => p.email.toLowerCase() === email);
  if (existingProfile) {
    return { success: false, error: `A profile with email '${email}' already exists.` };
  }

  const existingRegister = db.students.find(
    (s) => s.register_number.toUpperCase() === registerNumber
  );
  if (existingRegister) {
    return { success: false, error: `Register Number '${registerNumber}' is already registered.` };
  }

  const collegeId = caller.profile.college_id;
  const newProfileId = crypto.randomUUID();
  const newStudentId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newProfile: Profile = {
    id: newProfileId,
    college_id: collegeId,
    role: "STUDENT",
    email,
    full_name: fullName,
    avatar_url: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  const newStudent: Student = {
    id: newStudentId,
    profile_id: newProfileId,
    college_id: collegeId,
    department_id: departmentId,
    register_number: registerNumber,
    academic_year: academicYear,
    created_at: now,
  };

  db.profiles.push(newProfile);
  db.students.push(newStudent);

  logAuditEvent({
    collegeId,
    actorId: caller.profile.id,
    action: "USER_CREATED",
    entityType: "STUDENT",
    entityId: newStudentId,
    metadata: {
      student_name: fullName,
      register_number: registerNumber,
      department_name: dept.name,
      academic_year: academicYear,
      enrolled_by: caller.profile.full_name,
      enrolled_by_role: caller.profile.role,
      enrolled_at: now,
    },
  });

  safeRevalidate("/hod/students");
  safeRevalidate("/faculty/students");
  safeRevalidate("/hod/dashboard");
  safeRevalidate("/faculty/dashboard");
  safeRevalidate("/admin/users");
  safeRevalidate("/admin/dashboard");

  return {
    success: true,
    message: `Student ${fullName} (${registerNumber}) registered successfully in ${dept.name}!`,
    student: {
      ...newStudent,
      profile: newProfile,
      department: dept,
    },
  };
}

export async function getDepartmentListAction(filter?: { type?: DepartmentType }) {
  const db = getDB();
  return db.departments
    .filter((d) => d.is_active && (!filter?.type || d.type === filter.type));
}

export interface BulkStudentItem {
  fullName: string;
  email: string;
  registerNumber: string;
  academicYear: number;
  departmentId: string;
  creditPoints?: number;
  isActive?: boolean;
}

export async function bulkEnrollStudentsAction(students: BulkStudentItem[]) {
  const caller = await requireRole(["HOD", "FACULTY", "ADMIN"]);
  const db = getDB();
  const collegeId = caller.profile.college_id;
  const now = new Date().toISOString();

  let enrolledCount = 0;
  const skipped: string[] = [];
  const enrolledNames: string[] = [];

  for (const item of students) {
    const fullName = item.fullName.trim();
    const email = item.email.trim().toLowerCase();
    const registerNumber = item.registerNumber.trim().toUpperCase();
    const academicYear = Number(item.academicYear) || 1;
    const departmentId = item.departmentId;

    if (!fullName || !email || !registerNumber || !departmentId) {
      skipped.push(`${registerNumber || fullName || "Record"}: Missing required fields`);
      continue;
    }

    const existingEmail = db.profiles.find((p) => p.email.toLowerCase() === email);
    if (existingEmail) {
      skipped.push(`${registerNumber}: Email '${email}' already registered`);
      continue;
    }

    const existingReg = db.students.find((s) => s.register_number.toUpperCase() === registerNumber);
    if (existingReg) {
      skipped.push(`${registerNumber}: Already enrolled`);
      continue;
    }

    const dept = db.departments.find((d) => d.id === departmentId);
    if (!dept) {
      skipped.push(`${registerNumber}: Department ID not found`);
      continue;
    }

    const newProfileId = crypto.randomUUID();
    const newStudentId = crypto.randomUUID();
    const isActive = item.isActive !== false;

    const newProfile: Profile = {
      id: newProfileId,
      college_id: collegeId,
      role: "STUDENT",
      email,
      full_name: fullName,
      avatar_url: null,
      is_active: isActive,
      created_at: now,
      updated_at: now,
    };

    const newStudent: Student = {
      id: newStudentId,
      profile_id: newProfileId,
      college_id: collegeId,
      department_id: departmentId,
      register_number: registerNumber,
      academic_year: academicYear,
      created_at: now,
    };

    db.profiles.push(newProfile);
    db.students.push(newStudent);

    // Initial Credit Points imported from Excel
    if (item.creditPoints && item.creditPoints > 0) {
      db.pointRecords.push({
        id: crypto.randomUUID(),
        student_id: newStudentId,
        certificate_id: "00000000-0000-0000-0000-000000000000",
        points: item.creditPoints,
        awarded_by: caller.profile.id,
        comment: "Initial Credit Points imported from official NEC Excel database",
        is_latest: true,
        created_at: now,
      });
    }

    enrolledCount++;
    enrolledNames.push(`${fullName} (${registerNumber})`);
  }

  if (enrolledCount > 0) {
    logAuditEvent({
      collegeId,
      actorId: caller.profile.id,
      action: "USER_CREATED",
      entityType: "STUDENT",
      entityId: caller.profile.id,
      metadata: {
        type: "BULK_EXCEL_IMPORT",
        enrolled_count: enrolledCount,
        skipped_count: skipped.length,
        enrolled_by: caller.profile.full_name,
        enrolled_by_role: caller.profile.role,
        enrolled_names: enrolledNames.slice(0, 20),
        enrolled_at: now,
      },
    });

    safeRevalidate("/hod/students");
    safeRevalidate("/faculty/students");
    safeRevalidate("/hod/dashboard");
    safeRevalidate("/faculty/dashboard");
    safeRevalidate("/admin/users");
    safeRevalidate("/admin/dashboard");
  }

  return {
    success: true,
    enrolledCount,
    skippedCount: skipped.length,
    skippedReasons: skipped,
    message: `Successfully enrolled ${enrolledCount} students!${skipped.length > 0 ? ` (${skipped.length} skipped)` : ""}`,
  };
}

export async function getExistingStudentsAction() {
  const db = getDB();
  return db.students.map((s) => {
    const profile = db.profiles.find((p) => p.id === s.profile_id);
    const department = db.departments.find((d) => d.id === s.department_id);
    return {
      id: s.id,
      registerNumber: s.register_number,
      fullName: profile?.full_name || "Unknown",
      email: profile?.email || "",
      departmentId: s.department_id,
      departmentName: department?.name || "Department",
      departmentCode: department?.code || "",
      degreeLevel: (department?.type || "UG") as "UG" | "PG",
      academicYear: s.academic_year,
      isActive: profile?.is_active ?? true,
    };
  });
}

export async function verifyStudentLookupAction(query: string) {
  const db = getDB();
  const q = query.trim().toLowerCase();
  if (!q) return { found: false, student: null, suggestions: [] };

  const matchedStudent = db.students.find((s) => {
    const profile = db.profiles.find((p) => p.id === s.profile_id);
    return (
      s.register_number.toLowerCase() === q ||
      profile?.email.toLowerCase() === q ||
      profile?.full_name.toLowerCase() === q
    );
  });

  if (matchedStudent) {
    const profile = db.profiles.find((p) => p.id === matchedStudent.profile_id);
    const dept = db.departments.find((d) => d.id === matchedStudent.department_id);
    return {
      found: true,
      exactMatch: true,
      student: {
        id: matchedStudent.id,
        registerNumber: matchedStudent.register_number,
        fullName: profile?.full_name || "",
        email: profile?.email || "",
        departmentId: matchedStudent.department_id,
        departmentName: dept?.name || "",
        departmentCode: dept?.code || "",
        degreeLevel: (dept?.type || "UG") as "UG" | "PG",
        academicYear: matchedStudent.academic_year,
      },
      suggestions: [],
    };
  }

  const partials = db.students
    .filter((s) => {
      const profile = db.profiles.find((p) => p.id === s.profile_id);
      return (
        s.register_number.toLowerCase().includes(q) ||
        profile?.full_name.toLowerCase().includes(q)
      );
    })
    .slice(0, 5)
    .map((s) => {
      const profile = db.profiles.find((p) => p.id === s.profile_id);
      const dept = db.departments.find((d) => d.id === s.department_id);
      return {
        registerNumber: s.register_number,
        fullName: profile?.full_name || "",
        departmentCode: dept?.code || "",
        academicYear: s.academic_year,
      };
    });

  return {
    found: false,
    exactMatch: false,
    student: null,
    suggestions: partials,
  };
}

export interface AddFacultyInput {
  fullName: string;
  email: string;
  employeeId: string;
  departmentId?: string;
  designation?: string;
  role?: "FACULTY" | "HOD";
}

export async function addFacultyAction(input: AddFacultyInput) {
  const caller = await requireRole(["HOD", "ADMIN"]);
  const db = getDB();

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const employeeId = input.employeeId.trim().toUpperCase();
  const role: "FACULTY" | "HOD" = caller.profile.role === "HOD" ? "FACULTY" : (input.role || "FACULTY");
  const designation = input.designation?.trim() || (role === "HOD" ? "Professor & Head" : "Assistant Professor");

  if (!fullName) {
    return { success: false, error: "Faculty full name is required." };
  }
  if (!email || !email.includes("@")) {
    return { success: false, error: "A valid official faculty email address is required." };
  }
  if (!employeeId) {
    return { success: false, error: "Faculty / Employee ID is required." };
  }

  let departmentId = input.departmentId;
  if (!departmentId) {
    if (caller.faculty?.department_id) {
      departmentId = caller.faculty.department_id;
    } else {
      departmentId = db.departments[0]?.id;
    }
  }

  const dept = db.departments.find((d) => d.id === departmentId);
  if (!dept) {
    return { success: false, error: "Selected department was not found." };
  }

  const existingProfile = db.profiles.find((p) => p.email.toLowerCase() === email);
  if (existingProfile) {
    return { success: false, error: `A profile with email '${email}' already exists.` };
  }

  const existingEmp = db.faculty.find(
    (f) => f.employee_id.toUpperCase() === employeeId
  );
  if (existingEmp) {
    return { success: false, error: `Employee ID '${employeeId}' is already registered.` };
  }

  const collegeId = caller.profile.college_id;
  const newProfileId = crypto.randomUUID();
  const newFacultyId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newProfile: Profile = {
    id: newProfileId,
    college_id: collegeId,
    role,
    email,
    full_name: fullName,
    avatar_url: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  const newFaculty: Faculty = {
    id: newFacultyId,
    profile_id: newProfileId,
    college_id: collegeId,
    department_id: departmentId,
    designation,
    employee_id: employeeId,
    is_hod: role === "HOD",
    created_at: now,
  };

  db.profiles.push(newProfile);
  db.faculty.push(newFaculty);

  logAuditEvent({
    collegeId,
    actorId: caller.profile.id,
    action: "USER_CREATED",
    entityType: role === "HOD" ? "HOD" : "FACULTY",
    entityId: newFacultyId,
    metadata: {
      faculty_name: fullName,
      employee_id: employeeId,
      department_name: dept.name,
      role,
      designation,
      enrolled_by: caller.profile.full_name,
      enrolled_by_role: caller.profile.role,
      enrolled_at: now,
    },
  });

  safeRevalidate("/admin/users");
  safeRevalidate("/admin/dashboard");
  safeRevalidate("/hod/faculty");
  safeRevalidate("/hod/dashboard");
  safeRevalidate("/faculty/dashboard");

  return {
    success: true,
    message: `${role === "HOD" ? "Head of Department (HOD)" : "Faculty"} ${fullName} (${employeeId}) registered successfully in ${dept.name}!`,
    faculty: newFaculty,
  };
}

export interface BulkFacultyItem {
  fullName: string;
  email: string;
  employeeId: string;
  departmentId?: string;
  departmentCode?: string;
  designation?: string;
  role?: "FACULTY" | "HOD";
  isActive?: boolean;
}

export async function bulkAddFacultyAction(facultyList: BulkFacultyItem[]) {
  const caller = await requireRole(["HOD", "ADMIN"]);
  const db = getDB();
  const collegeId = caller.profile.college_id;
  const now = new Date().toISOString();

  if (!facultyList || facultyList.length === 0) {
    return {
      success: true,
      addedCount: 0,
      skippedCount: 0,
      message: "Template validated successfully. Status: OK, Ready to Submit.",
      skipped: [],
    };
  }

  let addedCount = 0;
  const skipped: string[] = [];
  const addedNames: string[] = [];

  for (const item of facultyList) {
    const fullName = item.fullName?.trim();
    const email = item.email?.trim().toLowerCase();
    const employeeId = item.employeeId?.trim().toUpperCase();
    const role: "FACULTY" | "HOD" = caller.profile.role === "HOD" ? "FACULTY" : (item.role === "HOD" ? "HOD" : "FACULTY");
    const designation = item.designation?.trim() || (role === "HOD" ? "Professor & Head" : "Assistant Professor");

    if (!fullName || !email || !employeeId) {
      skipped.push(`${employeeId || fullName || "Record"}: Missing required name, email, or employee ID`);
      continue;
    }

    const existingEmail = db.profiles.find((p) => p.email.toLowerCase() === email);
    if (existingEmail) {
      skipped.push(`${employeeId}: Email '${email}' already registered`);
      continue;
    }

    const existingEmp = db.faculty.find((f) => f.employee_id.toUpperCase() === employeeId);
    if (existingEmp) {
      skipped.push(`${employeeId}: Already registered`);
      continue;
    }

    let departmentId = item.departmentId;
    if (!departmentId && item.departmentCode) {
      const match = db.departments.find(
        (d) => d.code.toLowerCase() === item.departmentCode?.toLowerCase() ||
               d.name.toLowerCase() === item.departmentCode?.toLowerCase()
      );
      if (match) departmentId = match.id;
    }

    if (!departmentId) {
      if (caller.faculty?.department_id) {
        departmentId = caller.faculty.department_id;
      } else {
        departmentId = db.departments[0]?.id;
      }
    }

    const dept = db.departments.find((d) => d.id === departmentId);
    if (!dept) {
      skipped.push(`${employeeId}: Department not found`);
      continue;
    }

    const newProfileId = crypto.randomUUID();
    const newFacultyId = crypto.randomUUID();
    const isActive = item.isActive !== false;

    const newProfile: Profile = {
      id: newProfileId,
      college_id: collegeId,
      role,
      email,
      full_name: fullName,
      avatar_url: null,
      is_active: isActive,
      created_at: now,
      updated_at: now,
    };

    const newFaculty: Faculty = {
      id: newFacultyId,
      profile_id: newProfileId,
      college_id: collegeId,
      department_id: departmentId,
      designation,
      employee_id: employeeId,
      is_hod: role === "HOD",
      created_at: now,
    };

    db.profiles.push(newProfile);
    db.faculty.push(newFaculty);
    addedCount++;
    addedNames.push(`${fullName} (${employeeId})`);
  }

  if (addedCount > 0) {
    logAuditEvent({
      collegeId,
      actorId: caller.profile.id,
      action: "USER_CREATED",
      entityType: "FACULTY",
      entityId: caller.profile.id,
      metadata: {
        total_attempted: facultyList.length,
        successfully_added: addedCount,
        skipped_count: skipped.length,
        first_few_names: addedNames.slice(0, 5),
        enrolled_by: caller.profile.full_name,
        enrolled_by_role: caller.profile.role,
        enrolled_at: now,
      },
    });
  }

  safeRevalidate("/admin/users");
  safeRevalidate("/admin/dashboard");
  safeRevalidate("/hod/faculty");
  safeRevalidate("/hod/dashboard");
  safeRevalidate("/faculty/dashboard");

  return {
    success: true,
    addedCount,
    skippedCount: skipped.length,
    message: addedCount > 0
      ? `🎉 Successfully added ${addedCount} faculty / HOD members into Nandha Engineering College database!`
      : "Excel template processed. Status: OK, Ready to Submit.",
    skipped,
  };
}

export async function getDepartmentFacultyAction(departmentId?: string) {
  const caller = await requireRole(["HOD", "FACULTY", "ADMIN"]);
  const db = getDB();
  const targetDeptId = departmentId || caller.faculty?.department_id;

  const list = db.faculty
    .filter((f) => !targetDeptId || f.department_id === targetDeptId)
    .map((f) => {
      const profile = db.profiles.find((p) => p.id === f.profile_id);
      const department = db.departments.find((d) => d.id === f.department_id);
      const reviewCount = db.certificateReviews.filter((r) => r.reviewer_id === f.id).length;
      const activeLockCount = db.certificates.filter(
        (c) => c.reviewer_id === f.id && c.status === "UNDER_REVIEW"
      ).length;
      return {
        ...f,
        profile,
        department,
        reviewCount,
        activeLockCount,
      };
    });

  return list;
}

export async function getExistingFacultyAction() {
  const db = getDB();
  return db.faculty.map((f) => {
    const profile = db.profiles.find((p) => p.id === f.profile_id);
    const department = db.departments.find((d) => d.id === f.department_id);
    return {
      id: f.id,
      employeeId: f.employee_id,
      email: profile?.email || "",
      fullName: profile?.full_name || "",
      departmentCode: department?.code || "",
      role: (profile?.role === "HOD" ? "HOD" : "FACULTY") as "FACULTY" | "HOD",
    };
  });
}




