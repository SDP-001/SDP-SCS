import { cookies } from "next/headers";
import { getDB, getDBIndices } from "@/lib/db/store";
import { Profile, Student, Faculty, Department, UserRole } from "@/types/database.types";

export interface AuthenticatedUser {
  profile: Profile;
  student?: Student & { department?: Department };
  faculty?: Faculty & { department?: Department };
}

const SESSION_COOKIE_NAME = "campuscred_session_user_id";

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const db = getDB();

  let sessionUserId: string | undefined;
  try {
    const cookieStore = await cookies();
    sessionUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  } catch {
    // When called outside request scope (e.g. testing scripts), fallback to admin profile
    const adminProfile = db.profiles.find((p) => p.role === "ADMIN" && p.is_active);
    if (adminProfile) {
      return buildAuthenticatedUser(adminProfile, db);
    }
    return null;
  }

  // 1. Direct cookie session (instant sub-millisecond local in-memory lookup via O(1) Map)
  if (sessionUserId) {
    const indices = getDBIndices();
    const profile = indices.profileById.get(sessionUserId);
    if (profile && profile.is_active) {
      return buildAuthenticatedUser(profile, db);
    }
  }

  // Instant zero-lag return when not authenticated (no blocking external network requests)
  return null;
}

function buildAuthenticatedUser(profile: Profile, db: ReturnType<typeof getDB>): AuthenticatedUser {
  const indices = getDBIndices();

  if (profile.role === "STUDENT") {
    const student = indices.studentByProfileId.get(profile.id);
    if (student) {
      const department = indices.departmentById.get(student.department_id);
      return {
        profile,
        student: { ...student, department },
      };
    }
  }

  if (profile.role === "FACULTY" || profile.role === "HOD") {
    const faculty = indices.facultyByProfileId.get(profile.id);
    if (faculty) {
      const department = indices.departmentById.get(faculty.department_id);
      return {
        profile,
        faculty: { ...faculty, department },
      };
    }
  }

  return { profile };
}

export async function setSessionUser(profileId: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, profileId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 365 days persistent session across app closes
    });
  } catch {
    // Graceful fallback when called outside request scope (e.g. testing or CLI scripts)
  }
}

export async function clearSessionUser(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Ignore outside request scope
  }
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to continue");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.profile.role)) {
    throw new Error(`Forbidden: Access restricted to roles: ${allowedRoles.join(", ")}`);
  }
  return user;
}
