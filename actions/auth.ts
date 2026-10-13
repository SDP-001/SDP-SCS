"use server";

import { loginSchema, LoginFormData } from "@/lib/validators/user";
import { getDB } from "@/lib/db/store";
import { setSessionUser, clearSessionUser, getCurrentUser } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit/logger";
import {
  sendPasswordResetRequestEmail,
  sendPasswordChangedNotificationEmail,
} from "@/lib/email/service";
import { revalidatePath } from "next/cache";
import { Profile, Student, Faculty, UserRole } from "@/types/database.types";
import { logSessionActivityAction } from "@/actions/sessionActivity";

export async function loginAction(data: LoginFormData) {
  const validation = loginSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Invalid input",
    };
  }

  const { identifier, password } = validation.data;
  const db = getDB();

  // Find profile by email (supports @nandhaengg.org, @nandha.edu, @nec.edu.in, @abctech.edu), username prefix, student register number, or faculty employee ID
  const normalizedId = identifier.toLowerCase().trim();
  const getUsername = (email: string) => email.split("@")[0].toLowerCase();
  const inputUser = getUsername(normalizedId);

  let matchedProfile = db.profiles.find((p) => {
    if (!p.is_active) return false;
    const profileEmail = p.email.toLowerCase();
    const profileUser = getUsername(profileEmail);
    return (
      profileEmail === normalizedId ||
      profileUser === normalizedId ||
      (profileUser === inputUser &&
        (normalizedId.includes("@nandha") ||
          normalizedId.includes("@nec.") ||
          normalizedId.includes("@abctech.")))
    );
  });

  if (!matchedProfile) {
    // Check student register number
    const student = db.students.find(
      (s) => s.register_number.toLowerCase() === normalizedId
    );
    if (student) {
      matchedProfile = db.profiles.find((p) => p.id === student.profile_id && p.is_active);
    }
  }

  if (!matchedProfile) {
    // Check faculty employee ID
    const faculty = db.faculty.find(
      (f) => f.employee_id.toLowerCase() === normalizedId
    );
    if (faculty) {
      matchedProfile = db.profiles.find((p) => p.id === faculty.profile_id && p.is_active);
    }
  }

  if (!matchedProfile) {
    return {
      success: false,
      notFound: true,
      error: `Account not found for "${identifier}". New to the portal? Please click "Create New Account" below.`,
    };
  }

  // Verify account password
  if (!db.passwords) db.passwords = {};
  const storedPassword = db.passwords[matchedProfile.id] || "password123";
  if (password !== storedPassword) {
    return {
      success: false,
      error: "Incorrect password. Please verify your password and try again.",
    };
  }

  // Set session cookie
  await setSessionUser(matchedProfile.id);

  // Log session LOGIN event with exact time, date, role and identifier
  await logSessionActivityAction(matchedProfile.id, "LOGIN");

  return {
    success: true,
    role: matchedProfile.role,
  };
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) {
    // Log session LOGOUT event with exact time, date, role and identifier
    await logSessionActivityAction(user.profile.id, "LOGOUT");
  }
  await clearSessionUser();
  revalidatePath("/");
  return { success: true };
}

export async function getSessionAction() {
  const user = await getCurrentUser();
  return { user };
}

export interface IdentifiedUser {
  found: boolean;
  role?: "STUDENT" | "FACULTY" | "HOD" | "ADMIN";
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  identifier?: string;
  departmentName?: string;
}

export async function identifyUserAction(identifier: string): Promise<IdentifiedUser> {
  if (!identifier || identifier.trim().length < 2) {
    return { found: false };
  }

  const db = getDB();
  const normalizedId = identifier.toLowerCase().trim();
  const getUsername = (email: string) => email.split("@")[0].toLowerCase();
  const inputUser = getUsername(normalizedId);

  let matchedProfile = db.profiles.find((p) => {
    if (!p.is_active) return false;
    const profileEmail = p.email.toLowerCase();
    const profileUser = getUsername(profileEmail);
    return (
      profileEmail === normalizedId ||
      profileUser === normalizedId ||
      (profileUser === inputUser &&
        (normalizedId.includes("@nandha") ||
          normalizedId.includes("@nec.") ||
          normalizedId.includes("@abctech.")))
    );
  });

  let deptName = "";
  let studentReg = "";
  let facultyEmpId = "";

  if (!matchedProfile) {
    // Check student register number
    const student = db.students.find(
      (s) => s.register_number.toLowerCase() === normalizedId
    );
    if (student) {
      matchedProfile = db.profiles.find((p) => p.id === student.profile_id && p.is_active);
      if (matchedProfile) {
        studentReg = student.register_number;
        const dept = db.departments.find((d) => d.id === student.department_id);
        deptName = dept ? dept.name : "";
      }
    }
  } else if (matchedProfile.role === "STUDENT") {
    const student = db.students.find((s) => s.profile_id === matchedProfile!.id);
    if (student) {
      studentReg = student.register_number;
      const dept = db.departments.find((d) => d.id === student.department_id);
      deptName = dept ? dept.name : "";
    }
  }

  if (!matchedProfile) {
    // Check faculty employee ID
    const faculty = db.faculty.find(
      (f) => f.employee_id.toLowerCase() === normalizedId
    );
    if (faculty) {
      matchedProfile = db.profiles.find((p) => p.id === faculty.profile_id && p.is_active);
      if (matchedProfile) {
        facultyEmpId = faculty.employee_id;
        const dept = db.departments.find((d) => d.id === faculty.department_id);
        deptName = dept ? dept.name : "";
      }
    }
  } else if (matchedProfile.role === "FACULTY" || matchedProfile.role === "HOD") {
    const faculty = db.faculty.find((f) => f.profile_id === matchedProfile!.id);
    if (faculty) {
      facultyEmpId = faculty.employee_id;
      const dept = db.departments.find((d) => d.id === faculty.department_id);
      deptName = dept ? dept.name : "";
    }
  }

  if (!matchedProfile) {
    return { found: false };
  }

  return {
    found: true,
    role: matchedProfile.role,
    fullName: matchedProfile.full_name,
    email: matchedProfile.email,
    avatarUrl: matchedProfile.avatar_url,
    identifier: studentReg || facultyEmpId || matchedProfile.email,
    departmentName: deptName,
  };
}

export async function requestPasswordResetAction(identifier: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  email?: string;
  code?: string;
}> {
  if (!identifier || identifier.trim().length < 2) {
    return { success: false, error: "Please enter your registered User ID or institutional email." };
  }

  const db = getDB();
  const normalizedId = identifier.toLowerCase().trim();
  const getUsername = (email: string) => email.split("@")[0].toLowerCase();
  const inputUser = getUsername(normalizedId);

  let matchedProfile = db.profiles.find((p) => {
    if (!p.is_active) return false;
    const profileEmail = p.email.toLowerCase();
    const profileUser = getUsername(profileEmail);
    return (
      profileEmail === normalizedId ||
      profileUser === normalizedId ||
      (profileUser === inputUser &&
        (normalizedId.includes("@nandha") ||
          normalizedId.includes("@nec.") ||
          normalizedId.includes("@abctech.")))
    );
  });

  if (!matchedProfile) {
    const student = db.students.find(
      (s) => s.register_number.toLowerCase() === normalizedId
    );
    if (student) {
      matchedProfile = db.profiles.find((p) => p.id === student.profile_id && p.is_active);
    }
  }

  if (!matchedProfile) {
    const faculty = db.faculty.find(
      (f) => f.employee_id.toLowerCase() === normalizedId
    );
    if (faculty) {
      matchedProfile = db.profiles.find((p) => p.id === faculty.profile_id && p.is_active);
    }
  }

  if (!matchedProfile) {
    return {
      success: false,
      error: "No active account found for the entered ID or email. Please check your credentials.",
    };
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await sendPasswordResetRequestEmail({
    userId: matchedProfile.id,
    email: matchedProfile.email,
    fullName: matchedProfile.full_name,
    role: matchedProfile.role,
    code,
  });

  await logAuditEvent({
    collegeId: matchedProfile.college_id,
    actorId: matchedProfile.id,
    action: "USER_UPDATED",
    entityType: "USER",
    entityId: matchedProfile.id,
    metadata: { action: "PASSWORD_RESET_REQUESTED", email: matchedProfile.email },
  });

  return {
    success: true,
    email: matchedProfile.email,
    code,
    message: `A password reset request and 6-digit verification code has been dispatched to your registered email: ${matchedProfile.email}.`,
  };
}

export async function completePasswordResetAction(params: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const { email, code, newPassword } = params;

  if (!email || !email.includes("@")) {
    return { success: false, error: "Invalid email address." };
  }
  if (!code || code.trim().length !== 6) {
    return { success: false, error: "Please enter the 6-digit verification code sent to your email." };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  const db = getDB();
  const normalizedEmail = email.toLowerCase().trim();

  // Verify code in db.passwordResets
  const resetRecord = db.passwordResets?.[normalizedEmail];
  if (!resetRecord || resetRecord.code !== code.trim()) {
    return { success: false, error: "Invalid or expired verification code. Please check your email or request a new code." };
  }

  if (new Date(resetRecord.expiresAt).getTime() < Date.now()) {
    return { success: false, error: "Verification code has expired. Please request a new code." };
  }

  const profile = db.profiles.find((p) => p.email.toLowerCase() === normalizedEmail && p.is_active);
  if (!profile) {
    return { success: false, error: "User account not found." };
  }

  if (!db.passwords) db.passwords = {};
  db.passwords[profile.id] = newPassword;

  // Clear reset record
  if (db.passwordResets) {
    delete db.passwordResets[normalizedEmail];
  }

  // Send security confirmation email
  await sendPasswordChangedNotificationEmail({
    userId: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
  });

  await logAuditEvent({
    collegeId: profile.college_id,
    actorId: profile.id,
    action: "USER_UPDATED",
    entityType: "USER",
    entityId: profile.id,
    metadata: { action: "PASSWORD_RESET_COMPLETED", email: profile.email },
  });

  // Log password reset event into hierarchical session activity trail
  await logSessionActivityAction(profile.id, "PASSWORD_RESET");

  return {
    success: true,
    message: `Password reset successfully! You can now sign into your ${profile.role.toLowerCase()} portal with your new password.`,
  };
}

export interface RegisterAccountParams {
  role: "STUDENT" | "FACULTY" | "HOD" | "ADMIN";
  fullName: string;
  email: string;
  identifier: string; // Register No (Student) / Employee ID (Faculty/HOD) / Email (Admin)
  password: string;
  confirmPassword?: string;
  departmentId?: string;
  phoneNumber?: string;
  academicYear?: number;
}

export async function getDepartmentsForRegistrationAction(): Promise<
  Array<{ id: string; name: string; code: string; type: string }>
> {
  const db = getDB();
  return (db.departments || [])
    .filter((d) => d.is_active)
    .map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      type: d.type,
    }));
}

export async function registerNewAccountAction(params: RegisterAccountParams): Promise<{
  success: boolean;
  role?: "STUDENT" | "FACULTY" | "HOD" | "ADMIN";
  message?: string;
  error?: string;
}> {
  const {
    role,
    fullName,
    email,
    identifier,
    password,
    confirmPassword,
    departmentId,
    phoneNumber,
    academicYear,
  } = params;

  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: "Please enter your full name (at least 2 characters)." };
  }

  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid institutional email address." };
  }

  if (!identifier || identifier.trim().length < 2) {
    return {
      success: false,
      error:
        role === "STUDENT"
          ? "Please enter your Student Register Number."
          : "Please enter your Employee ID / User ID.",
    };
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  if (confirmPassword && password !== confirmPassword) {
    return { success: false, error: "Password and Confirm Password do not match." };
  }

  const db = getDB();
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedId = identifier.trim().toUpperCase();

  // Check duplicate email
  const existingEmail = db.profiles.find((p) => p.email.toLowerCase() === normalizedEmail);
  if (existingEmail) {
    return {
      success: false,
      error: `An account with email '${email}' already exists. Please sign in or use forgot password.`,
    };
  }

  // Check role-specific duplicate ID
  if (role === "STUDENT") {
    const existingStudent = db.students.find(
      (s) => s.register_number.toUpperCase() === normalizedId
    );
    if (existingStudent) {
      return {
        success: false,
        error: `Student register number '${identifier}' is already registered. Please sign in.`,
      };
    }
  } else if (role === "FACULTY" || role === "HOD") {
    const existingFaculty = db.faculty.find(
      (f) => f.employee_id.toUpperCase() === normalizedId
    );
    if (existingFaculty) {
      return {
        success: false,
        error: `Employee ID '${identifier}' is already registered. Please sign in.`,
      };
    }
  }

  const collegeId = db.colleges[0]?.id || "11111111-1111-1111-1111-111111111111";
  const now = new Date().toISOString();
  const newProfileId = crypto.randomUUID();

  // Selected department or default
  const defaultDeptId = db.departments[0]?.id || "33333333-3333-3333-3333-333333333301";
  const chosenDeptId = departmentId || defaultDeptId;

  // Create Profile
  const newProfile: Profile = {
    id: newProfileId,
    college_id: collegeId,
    role,
    email: normalizedEmail,
    phone_number: phoneNumber ? phoneNumber.trim() : "+91 98421 12345",
    full_name: fullName.trim(),
    avatar_url: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  };
  db.profiles.push(newProfile);

  // Create role entity
  if (role === "STUDENT") {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      profile_id: newProfileId,
      college_id: collegeId,
      department_id: chosenDeptId,
      register_number: normalizedId,
      academic_year: academicYear || 2026,
      created_at: now,
    };
    db.students.push(newStudent);
  } else if (role === "FACULTY" || role === "HOD") {
    const newFaculty: Faculty = {
      id: crypto.randomUUID(),
      profile_id: newProfileId,
      college_id: collegeId,
      department_id: chosenDeptId,
      designation: role === "HOD" ? "Head of Department (HOD)" : "Assistant Professor",
      employee_id: normalizedId,
      is_hod: role === "HOD",
      created_at: now,
    };
    db.faculty.push(newFaculty);
  }

  // Store user's own custom password
  if (!db.passwords) db.passwords = {};
  db.passwords[newProfileId] = password;

  // Log audit event
  await logAuditEvent({
    collegeId,
    actorId: newProfileId,
    action: "USER_CREATED",
    entityType: "USER",
    entityId: newProfileId,
    metadata: {
      action: "ACCOUNT_SELF_REGISTERED",
      role,
      email: normalizedEmail,
      identifier: normalizedId,
    },
  });

  // Automatically sign in the user
  await setSessionUser(newProfileId);

  // Record initial LOGIN session log
  await logSessionActivityAction(newProfileId, "LOGIN");

  revalidatePath("/");
  revalidatePath("/login");
  revalidatePath("/admin/users");

  return {
    success: true,
    role,
    message: `Account created successfully! Welcome to Nandha Engineering College, ${fullName.trim()}.`,
  };
}

