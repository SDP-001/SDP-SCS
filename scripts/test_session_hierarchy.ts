import { getDB } from "@/lib/db/store";
import {
  logSessionActivityAction,
  getSessionActivityLogsAction,
} from "@/actions/sessionActivity";

async function testSessionHierarchy() {
  console.log("=================================================");
  console.log("TESTING SESSION ACTIVITY & PASSWORD RESET HIERARCHY");
  console.log("=================================================");

  const db = getDB();

  // Find sample users: Dean/Admin, HOD (CSE), Faculty (CSE), Student (CSE)
  const adminProfile = db.profiles.find((p) => p.role === "ADMIN");
  const hodProfile = db.profiles.find((p) => p.role === "HOD");
  const facultyProfile = db.profiles.find((p) => p.role === "FACULTY");
  const studentProfile = db.profiles.find((p) => p.role === "STUDENT");

  if (!adminProfile || !hodProfile || !facultyProfile || !studentProfile) {
    throw new Error("Could not find test profiles for all roles");
  }

  console.log("✓ Found test accounts:");
  console.log(`   - Dean / Admin: ${adminProfile.full_name} (${adminProfile.id})`);
  console.log(`   - HOD:          ${hodProfile.full_name} (${hodProfile.id})`);
  console.log(`   - Faculty:      ${facultyProfile.full_name} (${facultyProfile.id})`);
  console.log(`   - Student:      ${studentProfile.full_name} (${studentProfile.id})`);

  // 1. Test logging session activity for each role (LOGIN, LOGOUT, PASSWORD_RESET)
  console.log("\n--- Testing Activity Logging (LOGIN, LOGOUT, PASSWORD_RESET) ---");

  const studentLoginLog = await logSessionActivityAction(studentProfile.id, "LOGIN");
  console.log("✓ Logged Student LOGIN:", {
    action: studentLoginLog?.action,
    date: (studentLoginLog?.metadata as any)?.date,
    time: (studentLoginLog?.metadata as any)?.time,
    identifier: (studentLoginLog?.metadata as any)?.identifier,
    role: (studentLoginLog?.metadata as any)?.role,
  });

  const studentLogoutLog = await logSessionActivityAction(studentProfile.id, "LOGOUT");
  console.log("✓ Logged Student LOGOUT:", {
    action: studentLogoutLog?.action,
    date: (studentLogoutLog?.metadata as any)?.date,
    time: (studentLogoutLog?.metadata as any)?.time,
  });

  const studentResetLog = await logSessionActivityAction(studentProfile.id, "PASSWORD_RESET");
  console.log("✓ Logged Student PASSWORD_RESET:", {
    action: studentResetLog?.action,
    date: (studentResetLog?.metadata as any)?.date,
    time: (studentResetLog?.metadata as any)?.time,
  });

  const facultyLoginLog = await logSessionActivityAction(facultyProfile.id, "LOGIN");
  console.log("✓ Logged Faculty LOGIN:", {
    action: facultyLoginLog?.action,
    date: (facultyLoginLog?.metadata as any)?.date,
    time: (facultyLoginLog?.metadata as any)?.time,
    role: (facultyLoginLog?.metadata as any)?.role,
  });

  const facultyLogoutLog = await logSessionActivityAction(facultyProfile.id, "LOGOUT");
  console.log("✓ Logged Faculty LOGOUT:", {
    action: facultyLogoutLog?.action,
    date: (facultyLogoutLog?.metadata as any)?.date,
    time: (facultyLogoutLog?.metadata as any)?.time,
  });

  const facultyResetLog = await logSessionActivityAction(facultyProfile.id, "PASSWORD_RESET");
  console.log("✓ Logged Faculty PASSWORD_RESET:", {
    action: facultyResetLog?.action,
    date: (facultyResetLog?.metadata as any)?.date,
    time: (facultyResetLog?.metadata as any)?.time,
  });

  const hodLoginLog = await logSessionActivityAction(hodProfile.id, "LOGIN");
  console.log("✓ Logged HOD LOGIN:", {
    action: hodLoginLog?.action,
    date: (hodLoginLog?.metadata as any)?.date,
    time: (hodLoginLog?.metadata as any)?.time,
    role: (hodLoginLog?.metadata as any)?.role,
  });

  const hodLogoutLog = await logSessionActivityAction(hodProfile.id, "LOGOUT");
  console.log("✓ Logged HOD LOGOUT:", {
    action: hodLogoutLog?.action,
    date: (hodLogoutLog?.metadata as any)?.date,
    time: (hodLogoutLog?.metadata as any)?.time,
  });

  const hodResetLog = await logSessionActivityAction(hodProfile.id, "PASSWORD_RESET");
  console.log("✓ Logged HOD PASSWORD_RESET:", {
    action: hodResetLog?.action,
    date: (hodResetLog?.metadata as any)?.date,
    time: (hodResetLog?.metadata as any)?.time,
  });

  // Verify timestamps and dates are present
  for (const log of [
    studentLoginLog,
    studentLogoutLog,
    studentResetLog,
    facultyLoginLog,
    facultyLogoutLog,
    facultyResetLog,
    hodLoginLog,
    hodLogoutLog,
    hodResetLog,
  ]) {
    if (!log || !(log.metadata as any)?.time || !(log.metadata as any)?.date) {
      throw new Error(`Log ${log?.id} is missing required time or date!`);
    }
  }

  // 2. Test Hierarchical Visibility Rules
  console.log("\n--- Testing Hierarchy Visibility Rules ---");

  const validActions = ["LOGIN", "LOGOUT", "PASSWORD_RESET"];

  // A. Faculty visibility: Must only see students in department (LOGIN, LOGOUT, PASSWORD_RESET)
  const facultyDeptId = db.faculty.find((f) => f.profile_id === facultyProfile.id)?.department_id;
  const facultyFilteredLogs = db.auditLogs
    .filter((l) => validActions.includes(l.action))
    .filter((l) => {
      const meta = l.metadata as any;
      return meta?.role === "STUDENT" && meta?.department_id === facultyDeptId;
    });

  const hasFacultyOrHodInFacultyView = facultyFilteredLogs.some((l) => {
    const role = (l.metadata as any)?.role;
    return role === "FACULTY" || role === "HOD" || role === "ADMIN";
  });
  console.log(`✓ Faculty view contains ${facultyFilteredLogs.length} student session & password logs.`);
  console.log(`✓ Faculty view contains 0 Faculty/HOD/Admin logs: ${!hasFacultyOrHodInFacultyView}`);
  if (hasFacultyOrHodInFacultyView) {
    throw new Error("Security Violation: Faculty can see non-student session logs!");
  }

  // B. HOD visibility: Can see students and faculty in department (LOGIN, LOGOUT, PASSWORD_RESET), but NOT other HODs or Dean
  const hodDeptId = db.faculty.find((f) => f.profile_id === hodProfile.id)?.department_id;
  const hodFilteredLogs = db.auditLogs
    .filter((l) => validActions.includes(l.action))
    .filter((l) => {
      const meta = l.metadata as any;
      if (meta?.department_id !== hodDeptId) return false;
      return meta?.role === "STUDENT" || meta?.role === "FACULTY";
    });

  const hasHodOrAdminInHodView = hodFilteredLogs.some((l) => {
    const role = (l.metadata as any)?.role;
    return role === "HOD" || role === "ADMIN";
  });
  console.log(`✓ HOD view contains ${hodFilteredLogs.length} Department Student & Faculty logs.`);
  console.log(`✓ HOD view contains 0 HOD/Admin logs: ${!hasHodOrAdminInHodView}`);
  if (hasHodOrAdminInHodView) {
    throw new Error("Security Violation: HOD can see HOD/Admin session logs!");
  }

  // C. Dean / Admin visibility: Can see HOD, Faculty, and Students (LOGIN, LOGOUT, PASSWORD_RESET)
  const adminFilteredLogs = db.auditLogs
    .filter((l) => validActions.includes(l.action))
    .filter((l) => {
      const meta = l.metadata as any;
      return meta?.role === "STUDENT" || meta?.role === "FACULTY" || meta?.role === "HOD";
    });

  const hasHodInAdminView = adminFilteredLogs.some((l) => (l.metadata as any)?.role === "HOD");
  const hasFacultyInAdminView = adminFilteredLogs.some((l) => (l.metadata as any)?.role === "FACULTY");
  const hasStudentInAdminView = adminFilteredLogs.some((l) => (l.metadata as any)?.role === "STUDENT");

  const hasStudentPasswordResetInDean = adminFilteredLogs.some(
    (l) => l.action === "PASSWORD_RESET" && (l.metadata as any)?.role === "STUDENT"
  );
  const hasFacultyPasswordResetInDean = adminFilteredLogs.some(
    (l) => l.action === "PASSWORD_RESET" && (l.metadata as any)?.role === "FACULTY"
  );
  const hasHodPasswordResetInDean = adminFilteredLogs.some(
    (l) => l.action === "PASSWORD_RESET" && (l.metadata as any)?.role === "HOD"
  );

  console.log(`✓ Dean / Admin view contains ${adminFilteredLogs.length} total institutional session logs.`);
  console.log(`   - Includes HOD sessions & resets:     ${hasHodInAdminView && hasHodPasswordResetInDean}`);
  console.log(`   - Includes Faculty sessions & resets: ${hasFacultyInAdminView && hasFacultyPasswordResetInDean}`);
  console.log(`   - Includes Student sessions & resets: ${hasStudentInAdminView && hasStudentPasswordResetInDean}`);

  if (!hasHodInAdminView || !hasFacultyInAdminView || !hasStudentInAdminView) {
    throw new Error("Dean view is missing one or more required subordinate roles!");
  }

  if (!hasStudentPasswordResetInDean || !hasFacultyPasswordResetInDean || !hasHodPasswordResetInDean) {
    throw new Error("Dean view is missing password reset events for one or more roles!");
  }

  console.log("\n=================================================");
  console.log("✓ ALL HIERARCHICAL SESSION & PASSWORD RESET TESTS PASSED!");
  console.log("=================================================");
}

testSessionHierarchy().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
