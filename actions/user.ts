"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { logAuditEvent } from "@/lib/audit/logger";
import {
  sendPasswordChangedNotificationEmail,
  sendPasswordResetRequestEmail,
  sendMobileSMSResetCode,
} from "@/lib/email/service";
import { revalidatePath } from "next/cache";
import { logSessionActivityAction } from "@/actions/sessionActivity";

export interface UserAccountData {
  profileId: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl: string | null;
  role: "STUDENT" | "FACULTY" | "HOD" | "ADMIN";
  identifier: string; // Register Number (Student), Employee ID (Faculty/HOD), Email (Admin)
  departmentName?: string;
  designation?: string;
  academicYear?: number;
}

export async function getUserAccountAction(): Promise<{
  success: boolean;
  data?: UserAccountData;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated. Please sign in." };
  }

  const db = getDB();
  const profile = user.profile;

  let identifier = profile.email;
  let departmentName = "";
  let designation = "";
  let academicYear: number | undefined;

  if (profile.role === "STUDENT" && user.student) {
    identifier = user.student.register_number;
    departmentName = user.student.department?.name || "";
    academicYear = user.student.academic_year;
  } else if ((profile.role === "FACULTY" || profile.role === "HOD") && user.faculty) {
    identifier = user.faculty.employee_id;
    departmentName = user.faculty.department?.name || "";
    designation = user.faculty.designation;
  }

  return {
    success: true,
    data: {
      profileId: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      phoneNumber: profile.phone_number || "+91 98421 12345",
      avatarUrl: profile.avatar_url,
      role: profile.role,
      identifier,
      departmentName,
      designation,
      academicYear,
    },
  };
}

export async function updateUserAccountAction(params: {
  fullName: string;
  email: string;
  identifier: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated. Please sign in." };
  }

  const { fullName, email, identifier, phoneNumber, avatarUrl } = params;

  if (!fullName.trim()) {
    return { success: false, error: "Full name cannot be empty." };
  }
  if (!email.trim() || !email.includes("@")) {
    return { success: false, error: "Please provide a valid institutional email." };
  }
  if (!identifier.trim()) {
    return { success: false, error: "User ID / Identifier cannot be empty." };
  }

  const db = getDB();
  const profileIndex = db.profiles.findIndex((p) => p.id === user.profile.id);
  if (profileIndex === -1) {
    return { success: false, error: "Profile not found in database." };
  }

  // Update profile
  db.profiles[profileIndex].full_name = fullName.trim();
  db.profiles[profileIndex].email = email.trim().toLowerCase();
  if (phoneNumber !== undefined) {
    db.profiles[profileIndex].phone_number = phoneNumber ? phoneNumber.trim() : null;
  }
  db.profiles[profileIndex].updated_at = new Date().toISOString();
  if (avatarUrl !== undefined) {
    db.profiles[profileIndex].avatar_url = avatarUrl;
  }

  // Update role-specific identifier
  if (user.profile.role === "STUDENT") {
    const studentIndex = db.students.findIndex((s) => s.profile_id === user.profile.id);
    if (studentIndex !== -1) {
      db.students[studentIndex].register_number = identifier.trim().toUpperCase();
    }
  } else if (user.profile.role === "FACULTY" || user.profile.role === "HOD") {
    const facultyIndex = db.faculty.findIndex((f) => f.profile_id === user.profile.id);
    if (facultyIndex !== -1) {
      db.faculty[facultyIndex].employee_id = identifier.trim().toUpperCase();
    }
  }

  // Log audit
  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "USER_UPDATED",
    entityType: "USER",
    entityId: user.profile.id,
    metadata: {
      email: email.trim(),
      identifier: identifier.trim(),
      hasAvatar: !!avatarUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/student/settings");
  revalidatePath("/faculty/settings");
  revalidatePath("/hod/settings");
  revalidatePath("/admin/settings");

  return { success: true, message: "Profile and User ID updated successfully." };
}

export async function changeUserPasswordAction(params: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; message?: string; error?: string; emailSentTo?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated. Please sign in." };
  }

  const { currentPassword, newPassword, confirmPassword } = params;

  if (!currentPassword) {
    return { success: false, error: "Please enter your current password." };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: "New password and confirmation password do not match." };
  }

  const db = getDB();
  if (!db.passwords) db.passwords = {};

  const currentStored = db.passwords[user.profile.id] || "password123";
  if (currentPassword !== currentStored) {
    return { success: false, error: "Current password is incorrect. Please check and try again." };
  }

  // Save new password
  db.passwords[user.profile.id] = newPassword;

  // Dispatch email notification to the user's institutional email address
  await sendPasswordChangedNotificationEmail({
    userId: user.profile.id,
    email: user.profile.email,
    fullName: user.profile.full_name,
    role: user.profile.role,
  });

  // Log audit
  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "USER_UPDATED",
    entityType: "USER",
    entityId: user.profile.id,
    metadata: { action: "PASSWORD_CHANGED", email: user.profile.email },
  });

  // Log password reset event into hierarchical session activity trail
  await logSessionActivityAction(user.profile.id, "PASSWORD_RESET");

  return {
    success: true,
    message: `Password updated successfully! An official security confirmation has been dispatched to your email (${user.profile.email}).`,
    emailSentTo: user.profile.email,
  };
}

export async function requestProfilePasswordResetAction(params?: {
  deliveryMethod?: "EMAIL" | "PHONE" | "BOTH";
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  email?: string;
  phone?: string;
  code?: string;
  deliveryMethod?: "EMAIL" | "PHONE" | "BOTH";
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated. Please sign in." };
  }

  const db = getDB();
  const profile = user.profile;
  const targetEmail = profile.email.toLowerCase().trim();
  const targetPhone = profile.phone_number || "+91 98421 12345";
  const method = params?.deliveryMethod || "BOTH";

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  if (!db.passwordResets) db.passwordResets = {};
  db.passwordResets[targetEmail] = {
    code,
    email: targetEmail,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };

  if (method === "EMAIL" || method === "BOTH") {
    await sendPasswordResetRequestEmail({
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      code,
    });
  }

  if (method === "PHONE" || method === "BOTH") {
    await sendMobileSMSResetCode({
      phone: targetPhone,
      fullName: profile.full_name,
      code,
    });
  }

  await logAuditEvent({
    collegeId: profile.college_id,
    actorId: profile.id,
    action: "USER_UPDATED",
    entityType: "USER",
    entityId: profile.id,
    metadata: {
      action: "PROFILE_PASSWORD_RESET_REQUESTED",
      deliveryMethod: method,
      email: targetEmail,
      phone: targetPhone,
    },
  });

  let message = "";
  if (method === "BOTH") {
    message = `Verification code dispatched to your institutional email (${targetEmail}) and mobile phone (${targetPhone}).`;
  } else if (method === "PHONE") {
    message = `Verification OTP dispatched via SMS to your registered mobile number: ${targetPhone}.`;
  } else {
    message = `Verification code dispatched to your institutional email: ${targetEmail}.`;
  }

  return {
    success: true,
    message,
    email: targetEmail,
    phone: targetPhone,
    code,
    deliveryMethod: method,
  };
}

export async function resetProfilePasswordWithCodeAction(params: {
  code: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  emailSentTo?: string;
  phoneSentTo?: string;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated. Please sign in." };
  }

  const { code, newPassword, confirmPassword } = params;

  if (!code || code.trim().length !== 6) {
    return { success: false, error: "Please enter the 6-digit verification code." };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: "New password and confirmation password do not match." };
  }

  const db = getDB();
  const targetEmail = user.profile.email.toLowerCase().trim();
  const resetRecord = db.passwordResets?.[targetEmail];

  if (!resetRecord || resetRecord.code !== code.trim()) {
    return {
      success: false,
      error: "Invalid or expired verification code. Please check your email/phone or request a new code.",
    };
  }

  if (new Date(resetRecord.expiresAt).getTime() < Date.now()) {
    return {
      success: false,
      error: "Verification code has expired (15 minute validity). Please request a new code.",
    };
  }

  // Update password
  if (!db.passwords) db.passwords = {};
  db.passwords[user.profile.id] = newPassword;

  // Clear reset record
  if (db.passwordResets) {
    delete db.passwordResets[targetEmail];
  }

  // Dispatch confirmation notifications
  await sendPasswordChangedNotificationEmail({
    userId: user.profile.id,
    email: user.profile.email,
    fullName: user.profile.full_name,
    role: user.profile.role,
  });

  const targetPhone = user.profile.phone_number || "+91 98421 12345";
  await sendMobileSMSResetCode({
    phone: targetPhone,
    fullName: user.profile.full_name,
    code: "UPDATED",
  });

  await logAuditEvent({
    collegeId: user.profile.college_id,
    actorId: user.profile.id,
    action: "USER_UPDATED",
    entityType: "USER",
    entityId: user.profile.id,
    metadata: {
      action: "PROFILE_PASSWORD_RESET_COMPLETED",
      email: targetEmail,
      phone: targetPhone,
    },
  });

  // Log password reset event into hierarchical session activity trail
  await logSessionActivityAction(user.profile.id, "PASSWORD_RESET");

  revalidatePath("/");
  revalidatePath("/student/settings");
  revalidatePath("/faculty/settings");
  revalidatePath("/hod/settings");
  revalidatePath("/admin/settings");

  return {
    success: true,
    message: `Password reset successfully! Official security receipts have been dispatched to ${targetEmail} and SMS to ${targetPhone}.`,
    emailSentTo: targetEmail,
    phoneSentTo: targetPhone,
  };
}
