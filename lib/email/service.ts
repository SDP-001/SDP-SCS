import { getDB } from "@/lib/db/store";
import { sendNotification } from "@/lib/notifications/dispatcher";
import { generateUUID } from "@/lib/utils/uuid";

export interface EmailDispatchResult {
  success: boolean;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  code?: string;
}

/**
 * Dispatches an email notification when user changes password from profile settings
 */
export async function sendPasswordChangedNotificationEmail(params: {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}): Promise<EmailDispatchResult> {
  const db = getDB();
  if (!db.emailLogs) db.emailLogs = [];

  const subject = "Security Alert: NEC Portal Password Updated Successfully";
  const sentAt = new Date().toISOString();
  const formattedTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const body = `Dear ${params.fullName},

This is an official security confirmation from Nandha Engineering College (Autonomous).
Your account password for ${params.email} (${params.role}) was updated successfully on ${formattedTime}.

If you performed this change, no further action is necessary.
If you did not authorize this change, please contact the college IT administration immediately or use the Forgot Password link to secure your account.

Regards,
Nandha Engineering College IT Security Team
Erode, Tamil Nadu`;

  // Log simulated email dispatch
  db.emailLogs.unshift({
    id: generateUUID(),
    to: params.email,
    subject,
    body,
    sentAt,
  });

  // Also send in-app notification
  await sendNotification({
    userId: params.userId,
    type: "SECURITY",
    title: "Password Changed Successfully",
    message: `Your account password was updated. A security receipt has been dispatched to ${params.email}.`,
  });

  console.log(`[EMAIL DISPATCH] Sent to ${params.email} | Subject: "${subject}"`);

  return {
    success: true,
    to: params.email,
    subject,
    body,
    sentAt,
  };
}

/**
 * Dispatches a password reset request email with verification code
 */
export async function sendPasswordResetRequestEmail(params: {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  code: string;
}): Promise<EmailDispatchResult> {
  const db = getDB();
  if (!db.emailLogs) db.emailLogs = [];
  if (!db.passwordResets) db.passwordResets = {};

  const subject = "Password Reset Request - Nandha Engineering College Portal";
  const sentAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

  db.passwordResets[params.email.toLowerCase()] = {
    code: params.code,
    email: params.email.toLowerCase(),
    expiresAt,
  };

  const body = `Dear ${params.fullName},

We received a request to reset the password for your Nandha Engineering College portal account (${params.email} - ${params.role}).

Your 6-digit Security Verification Code is: ${params.code}

This code will expire in 15 minutes. Enter this code on the password reset page to set a new password.
If you did not request this password reset, you can safely ignore this email.

Regards,
Nandha Engineering College IT Services
Erode, Tamil Nadu`;

  db.emailLogs.unshift({
    id: generateUUID(),
    to: params.email,
    subject,
    body,
    sentAt,
  });

  await sendNotification({
    userId: params.userId,
    type: "SECURITY",
    title: "Password Reset Requested",
    message: `A password reset request was initiated. A verification code has been dispatched to ${params.email}.`,
  });

  console.log(`[EMAIL DISPATCH] Sent reset code ${params.code} to ${params.email}`);

  return {
    success: true,
    to: params.email,
    subject,
    body,
    sentAt,
    code: params.code,
  };
}

/**
 * Dispatches an SMS verification code to user's mobile number
 */
export async function sendMobileSMSResetCode(params: {
  phone: string;
  fullName: string;
  code: string;
}): Promise<{ success: boolean; phone: string; code: string; sentAt: string }> {
  const sentAt = new Date().toISOString();
  console.log(`[SMS DISPATCH] Sent OTP verification code ${params.code} to ${params.phone} for ${params.fullName}`);
  return {
    success: true,
    phone: params.phone,
    code: params.code,
    sentAt,
  };
}

