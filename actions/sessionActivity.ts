"use server";

import { getDB } from "@/lib/db/store";
import { getCurrentUser } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit/logger";
import { revalidatePath } from "next/cache";

export interface SessionActivityItem {
  id: string;
  actorId: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "HOD" | "ADMIN";
  identifier: string; // Student Reg No / Faculty Emp ID / HOD Emp ID / Admin Email
  departmentName: string;
  departmentId?: string;
  action: "LOGIN" | "LOGOUT" | "PASSWORD_RESET";
  timestamp: string;
  formattedDate: string; // e.g. "12 Oct 2026"
  formattedTime: string; // e.g. "11:24 PM"
  relativeTime: string; // e.g. "Just now", "5m ago"
}

/**
 * Records a detailed LOGIN, LOGOUT, or PASSWORD_RESET event into immutable audit trail
 */
export async function logSessionActivityAction(
  profileId: string,
  action: "LOGIN" | "LOGOUT" | "PASSWORD_RESET"
) {
  const db = getDB();
  const profile = db.profiles.find((p) => p.id === profileId);
  if (!profile) return;

  let identifier = profile.email;
  let departmentId = "";
  let departmentName = "Nandha Engineering College";

  if (profile.role === "STUDENT") {
    const student = db.students.find((s) => s.profile_id === profile.id);
    if (student) {
      identifier = student.register_number;
      departmentId = student.department_id;
      const dept = db.departments.find((d) => d.id === student.department_id);
      if (dept) departmentName = dept.name;
    }
  } else if (profile.role === "FACULTY" || profile.role === "HOD") {
    const faculty = db.faculty.find((f) => f.profile_id === profile.id);
    if (faculty) {
      identifier = faculty.employee_id;
      departmentId = faculty.department_id;
      const dept = db.departments.find((d) => d.id === faculty.department_id);
      if (dept) departmentName = dept.name;
    }
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const formattedTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const log = await logAuditEvent({
    collegeId: profile.college_id,
    actorId: profile.id,
    action: action as any,
    entityType: "USER_SESSION",
    entityId: profile.id,
    metadata: {
      action,
      role: profile.role,
      full_name: profile.full_name,
      email: profile.email,
      identifier,
      department_id: departmentId,
      department_name: departmentName,
      date: formattedDate,
      time: formattedTime,
      timestamp: now.toISOString(),
    },
  });

  try {
    revalidatePath("/faculty/dashboard");
    revalidatePath("/faculty/students");
    revalidatePath("/hod/dashboard");
    revalidatePath("/hod/students");
    revalidatePath("/hod/faculty");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/audit-logs");
  } catch {
    // Non-fatal if invoked outside Next.js request context (e.g. test runner)
  }

  return log;
}

/**
 * Retrieves session login, logout, and password reset activity respecting the institutional hierarchy:
 * - Faculty: Views Student logins, logouts, & password resets in their department
 * - HOD: Views Student & Faculty logins, logouts, & password resets in their department
 * - Dean / Admin: Views Student, Faculty, and HOD logins, logouts, & password resets across all departments
 */
export async function getSessionActivityLogsAction(params?: {
  roleFilter?: string;
  limit?: number;
}): Promise<SessionActivityItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const db = getDB();
  const callerRole = user.profile.role;
  const userDeptId =
    user.faculty?.department_id ||
    db.faculty.find((f) => f.profile_id === user.profile.id)?.department_id;
  const limit = params?.limit || 50;

  // Filter audit logs that are LOGIN, LOGOUT, or PASSWORD_RESET
  const sessionLogs = db.auditLogs.filter(
    (l) =>
      l.action === "LOGIN" ||
      l.action === "LOGOUT" ||
      l.action === "PASSWORD_RESET" ||
      (l.entity_type === "USER_SESSION" && (l.metadata as any)?.action === "PASSWORD_RESET") ||
      (l.metadata as any)?.action === "PASSWORD_RESET_COMPLETED" ||
      (l.metadata as any)?.action === "PASSWORD_CHANGED" ||
      (l.metadata as any)?.action === "PROFILE_PASSWORD_RESET_COMPLETED"
  );

  const items: SessionActivityItem[] = [];

  for (const log of sessionLogs) {
    const actor = db.profiles.find((p) => p.id === log.actor_id);
    const actorRole = (log.metadata?.role || actor?.role) as
      | "STUDENT"
      | "FACULTY"
      | "HOD"
      | "ADMIN"
      | undefined;
    if (!actorRole) continue;

    let actorDeptId = log.metadata?.department_id;
    let actorDeptName = log.metadata?.department_name;
    let actorIdentifier = log.metadata?.identifier;
    const actorFullName = log.metadata?.full_name || actor?.full_name || "Unknown User";
    const actorEmail = log.metadata?.email || actor?.email || "";

    // Resolve missing department or identifier from database relations
    if (!actorDeptId || !actorIdentifier) {
      if (actorRole === "STUDENT") {
        const student = db.students.find((s) => s.profile_id === (actor?.id || log.actor_id));
        if (student) {
          actorIdentifier = actorIdentifier || student.register_number;
          actorDeptId = actorDeptId || student.department_id;
          const dept = db.departments.find((d) => d.id === student.department_id);
          actorDeptName = actorDeptName || (dept ? dept.name : "Engineering");
        }
      } else if (actorRole === "FACULTY" || actorRole === "HOD") {
        const faculty = db.faculty.find((f) => f.profile_id === (actor?.id || log.actor_id));
        if (faculty) {
          actorIdentifier = actorIdentifier || faculty.employee_id;
          actorDeptId = actorDeptId || faculty.department_id;
          const dept = db.departments.find((d) => d.id === faculty.department_id);
          actorDeptName = actorDeptName || (dept ? dept.name : "Engineering");
        }
      } else {
        actorIdentifier = actorIdentifier || actorEmail;
        actorDeptName = actorDeptName || "Apex Administration";
      }
    }

    // Enforce Hierarchy Rules:
    // 1. Faculty: sees only Student logins/logouts in their department
    if (callerRole === "FACULTY") {
      if (actorRole !== "STUDENT") continue;
      if (userDeptId && actorDeptId && actorDeptId !== userDeptId) continue;
    }
    // 2. HOD: sees Student and Faculty logins/logouts in their department
    else if (callerRole === "HOD") {
      if (actorRole !== "STUDENT" && actorRole !== "FACULTY") continue;
      if (userDeptId && actorDeptId && actorDeptId !== userDeptId) continue;
    }
    // 3. Dean / Admin: sees Student, Faculty, and HOD logins/logouts
    else if (callerRole === "ADMIN") {
      if (actorRole !== "STUDENT" && actorRole !== "FACULTY" && actorRole !== "HOD") continue;
    } else {
      // Students do not have supervisor access to session activity
      continue;
    }

    // Role filter from caller
    if (params?.roleFilter && params.roleFilter !== "ALL") {
      if (actorRole !== params.roleFilter) continue;
    }

    const logDate = new Date(log.created_at || log.metadata?.timestamp || Date.now());
    const formattedDate =
      log.metadata?.date ||
      logDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });

    const formattedTime =
      log.metadata?.time ||
      logDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

    // Relative time calculation
    const diffMs = Math.max(0, Date.now() - logDate.getTime());
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    let relativeTime = "Just now";
    if (diffMin < 1) relativeTime = "Just now";
    else if (diffMin < 60) relativeTime = `${diffMin}m ago`;
    else if (diffHour < 24) relativeTime = `${diffHour}h ago`;
    else relativeTime = `${Math.floor(diffHour / 24)}d ago`;

    // Determine action: LOGIN, LOGOUT, or PASSWORD_RESET
    let actionType: "LOGIN" | "LOGOUT" | "PASSWORD_RESET" = "LOGIN";
    if (log.action === "LOGOUT" || (log.metadata as any)?.action === "LOGOUT") {
      actionType = "LOGOUT";
    } else if (
      log.action === "PASSWORD_RESET" ||
      (log.metadata as any)?.action === "PASSWORD_RESET" ||
      (log.metadata as any)?.action === "PASSWORD_RESET_COMPLETED" ||
      (log.metadata as any)?.action === "PASSWORD_CHANGED" ||
      (log.metadata as any)?.action === "PROFILE_PASSWORD_RESET_COMPLETED"
    ) {
      actionType = "PASSWORD_RESET";
    } else {
      actionType = "LOGIN";
    }

    items.push({
      id: log.id,
      actorId: log.actor_id || "",
      fullName: actorFullName,
      email: actorEmail,
      role: actorRole,
      identifier: actorIdentifier || "N/A",
      departmentName: actorDeptName || "NEC Department",
      departmentId: actorDeptId,
      action: actionType,
      timestamp: log.created_at,
      formattedDate,
      formattedTime,
      relativeTime,
    });
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return items.slice(0, limit);
}
