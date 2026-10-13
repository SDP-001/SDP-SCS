"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getUserAccountAction,
  updateUserAccountAction,
  changeUserPasswordAction,
  requestProfilePasswordResetAction,
  resetProfilePasswordWithCodeAction,
  UserAccountData,
} from "@/actions/user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Smartphone,
  Download,
  ShieldCheck,
  GraduationCap,
  Users,
  Building2,
  Sparkles,
  Trash2,
  LogOut,
  KeyRound,
  Send,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  X,
  Phone,
  ArrowRight,
  Check,
} from "lucide-react";

interface AccountSettingsFormProps {
  role: "STUDENT" | "FACULTY" | "HOD" | "ADMIN";
}

export function AccountSettingsForm({ role }: AccountSettingsFormProps) {
  const [data, setData] = useState<UserAccountData | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordEmailSent, setPasswordEmailSent] = useState<string | null>(null);

  // Forgot Password Modal / Drawer State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetMethod, setResetMethod] = useState<"BOTH" | "EMAIL" | "PHONE">("BOTH");
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [sendingResetRequest, setSendingResetRequest] = useState(false);
  const [submittingReset, setSubmittingReset] = useState(false);
  const [resetModalError, setResetModalError] = useState<string | null>(null);
  const [resetModalSuccess, setResetModalSuccess] = useState<string | null>(null);
  const [dispatchedCodeHint, setDispatchedCodeHint] = useState<string | null>(null);
  const [resetVerificationCode, setResetVerificationCode] = useState("");
  const [modalNewPassword, setModalNewPassword] = useState("");
  const [modalConfirmPassword, setModalConfirmPassword] = useState("");
  const [showModalNewPassword, setShowModalNewPassword] = useState(false);
  const [showModalConfirmPassword, setShowModalConfirmPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch user account info
    const loadUser = async () => {
      try {
        const res = await getUserAccountAction();
        if (res.success && res.data) {
          setData(res.data);
          setFullName(res.data.fullName);
          setEmail(res.data.email);
          setPhoneNumber(res.data.phoneNumber || "+91 98421 12345");
          setIdentifier(res.data.identifier);
          setAvatarPreview(res.data.avatarUrl);
        }
      } catch (err) {
        console.error("Failed to load user account", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Handle Photo File selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setAvatarPreview(base64Url);
      setProfileError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Save Profile Info & Picture
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await updateUserAccountAction({
        fullName,
        email,
        identifier,
        phoneNumber,
        avatarUrl: avatarPreview,
      });

      if (!res.success) {
        setProfileError(res.error || "Failed to update profile.");
        setProfileSaving(false);
        return;
      }

      setProfileSuccess(res.message || "Profile and User ID updated successfully!");
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err?.message || "An unexpected error occurred.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Reset Password Modal Handlers
  const handleOpenForgotModal = () => {
    setShowForgotModal(true);
    setResetStep(1);
    setResetModalError(null);
    setResetModalSuccess(null);
    setDispatchedCodeHint(null);
    setResetVerificationCode("");
    setModalNewPassword("");
    setModalConfirmPassword("");
  };

  const handleSendResetRequest = async () => {
    setSendingResetRequest(true);
    setResetModalError(null);
    setResetModalSuccess(null);

    try {
      const res = await requestProfilePasswordResetAction({
        deliveryMethod: resetMethod,
      });

      if (!res.success) {
        setResetModalError(res.error || "Failed to dispatch reset request.");
        setSendingResetRequest(false);
        return;
      }

      setResetModalSuccess(res.message || "Verification code dispatched successfully!");
      if (res.code) {
        setDispatchedCodeHint(res.code);
      }
      setResetStep(2);
    } catch (err: any) {
      setResetModalError(err?.message || "An unexpected error occurred.");
    } finally {
      setSendingResetRequest(false);
    }
  };

  const handleCompletePasswordResetWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReset(true);
    setResetModalError(null);

    try {
      const res = await resetProfilePasswordWithCodeAction({
        code: resetVerificationCode.trim(),
        newPassword: modalNewPassword,
        confirmPassword: modalConfirmPassword,
      });

      if (!res.success) {
        setResetModalError(res.error || "Failed to reset password.");
        setSubmittingReset(false);
        return;
      }

      setShowForgotModal(false);
      setPasswordSuccess(
        res.message ||
          `Password reset successfully! Security notice dispatched to ${email} & SMS to ${phoneNumber}.`
      );
      setPasswordEmailSent(email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSuccess(null);
        setPasswordEmailSent(null);
      }, 10000);
    } catch (err: any) {
      setResetModalError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmittingReset(false);
    }
  };

  // Save Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const res = await changeUserPasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!res.success) {
        setPasswordError(res.error || "Failed to change password.");
        setPasswordSaving(false);
        return;
      }

      setPasswordSuccess(res.message || "Password updated successfully!");
      setPasswordEmailSent((res as any).emailSentTo || email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSuccess(null);
        setPasswordEmailSent(null);
      }, 8000);
    } catch (err: any) {
      setPasswordError(err?.message || "An unexpected error occurred.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const getRoleHeaderInfo = () => {
    switch (role) {
      case "STUDENT":
        return {
          title: "Student Profile & Security",
          subtitle: "Manage your register number, password, photo, and achievement credentials.",
          idLabel: "Student Register Number",
          idPlaceholder: "e.g. 710022CS0101",
          icon: GraduationCap,
          badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
        };
      case "FACULTY":
        return {
          title: "Faculty Profile & Security",
          subtitle: "Manage your employee ID, official email, password, and evaluator avatar.",
          idLabel: "Faculty Employee ID",
          idPlaceholder: "e.g. FAC-CSE-101",
          icon: Users,
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "HOD":
        return {
          title: "HOD Leadership Profile & Security",
          subtitle: "Manage departmental leadership credentials, employee ID, and secure access.",
          idLabel: "HOD Employee ID",
          idPlaceholder: "e.g. FAC-CSE-001",
          icon: Building2,
          badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "ADMIN":
        return {
          title: "Dean / Admin Security & Credentials",
          subtitle: "Institutional administrative governance, root email ID, and master password.",
          idLabel: "Administrator User ID / Email",
          idPlaceholder: "e.g. admin@abctech.edu",
          icon: ShieldCheck,
          badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        };
    }
  };

  const roleInfo = getRoleHeaderInfo();
  const RoleIcon = roleInfo.icon;

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl animate-pulse">
        <div className="h-28 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Role Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* User Profile Avatar with Online Beacon */}
            <div className="relative shrink-0">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-slate-800 border-2 border-white/40 shadow-xl overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleInfo.badgeColor}`}>
                  <RoleIcon className="h-3.5 w-3.5" />
                  <span>{role}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Nandha Engineering College
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{fullName}</h2>
              <div className="text-xs text-slate-300 font-mono mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {identifier && email && identifier.toLowerCase() === email.toLowerCase() ? (
                  <span>
                    ID / Email: <span className="text-amber-300 font-bold">{identifier}</span>
                  </span>
                ) : (
                  <>
                    <span>
                      ID: <span className="text-amber-300 font-bold">{identifier}</span>
                    </span>
                    {email && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span className="break-all sm:break-normal">{email}</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Master Block: Profile Details & Account Password */}
      <Card className="p-4 sm:p-8 border border-slate-200/90 shadow-sm rounded-3xl bg-white space-y-8">
        
        {/* Block 1: Personal Information & User ID */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-primary-600 min-w-0">
              <User className="h-5 w-5 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">
                Personal Identification & User ID
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
              Block 1 of 2
            </span>
          </div>

          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Profile Picture Uploader */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Profile Picture / Avatar
              </label>
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="h-16 w-16 rounded-2xl bg-white border border-slate-300 shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-slate-400" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="profile-avatar-input"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold h-8 border-slate-300"
                    >
                      <Camera className="h-3.5 w-3.5 mr-1 text-primary-600" />
                      {avatarPreview ? "Change Photo" : "Upload Photo"}
                    </Button>

                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePhoto}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    PNG, JPG, or WebP up to 5MB. Shows on certificates and review records.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Full Name
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              {/* Role-Specific User ID / Register No / Employee ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {roleInfo.idLabel} (Login ID)
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Used at login
                  </span>
                </div>
                <Input
                  type="text"
                  placeholder={roleInfo.idPlaceholder}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="h-10 text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            {/* Email & Mobile Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 pl-9 text-xs rounded-xl"
                  />
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Official alerts and password reset codes are sent here.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (SMS Password Recovery)
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="+91 98421 12345"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-10 pl-9 text-xs rounded-xl font-mono"
                  />
                  <Smartphone className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Used for SMS OTP password reset and mobile authentication.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={profileSaving}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-11 sm:h-10 px-6 rounded-xl shadow-sm transition-all"
              >
                {profileSaving ? "Saving Changes..." : "Save Profile Details"}
              </Button>
            </div>
          </form>
        </div>

        {/* Block 2: Integrated Change Password & Email Request Block */}
        <div className="pt-6 border-t-2 border-slate-100 space-y-6">
          <div className="pb-3 border-b border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-600 min-w-0">
                <Lock className="h-5 w-5 shrink-0" />
                <h3 className="text-base font-bold text-slate-900">
                  Account Password & Security
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                Block 2 of 2
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal pl-7">
              Updating your password will automatically dispatch an official security confirmation to{" "}
              <strong className="text-slate-800 break-all">{email}</strong>.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Password Updated Successfully!</span>
              </div>
              <p className="text-emerald-700 leading-relaxed pl-6">
                {passwordSuccess}
              </p>
              {passwordEmailSent && (
                <div className="pl-6 pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                  <Mail className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Security confirmation dispatched to: <span className="font-mono text-emerald-950 font-bold">{passwordEmailSent}</span></span>
                </div>
              )}
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Current Password with Forgot Password trigger */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Current Password
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenForgotModal}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Forgot Password?</span>
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="h-10 pl-9 pr-10 text-xs rounded-xl"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-1 text-[10px]">
                  <span className="text-slate-400">Required if updating password</span>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password (Min 6 chars)
                </label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-10 pl-9 pr-10 text-xs rounded-xl"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-10 pl-9 pr-10 text-xs rounded-xl"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Security alert will be emailed to <strong className="text-slate-700">{email}</strong></span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenForgotModal}
                  className="w-full sm:w-auto border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/50 font-bold text-xs h-11 sm:h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Forgot Current Password?</span>
                </Button>
                <Button
                  type="submit"
                  disabled={passwordSaving}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs h-11 sm:h-10 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{passwordSaving ? "Updating Password..." : "Update Password"}</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>

      {/* Session Security & Sign Out Card */}
      <Card className="p-4 sm:p-6 rounded-3xl bg-white border border-rose-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <LogOut className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Active Session Sign Out
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely sign out of your account on this device.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <Link href="/logout" className="block w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-xs h-10 px-5 rounded-xl transition-all"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign Out of Account
            </Button>
          </Link>
        </div>
      </Card>

      {/* Forgot Password Reset Modal / Drawer */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                      <span>Reset Forgotten Password</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {resetStep === 1
                        ? "Select where to send your reset link / verification code"
                        : "Enter 6-digit verification code and set your new password"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Step Pill Indicators */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                    resetStep === 1
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "bg-white/15 text-emerald-300"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full bg-slate-950/30 text-center leading-4 text-[10px]">
                    1
                  </span>
                  <span>Choose Destination</span>
                </div>
                <ArrowRight className="h-3 w-3 text-white/40" />
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                    resetStep === 2
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full bg-slate-950/30 text-center leading-4 text-[10px]">
                    2
                  </span>
                  <span>Verify Code & Reset</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {resetModalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{resetModalError}</span>
                </div>
              )}

              {resetModalSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{resetModalSuccess}</span>
                </div>
              )}

              {resetStep === 1 ? (
                /* Step 1: Destination Selection */
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    If you do not remember your current account password, choose where you want to dispatch your secure 6-digit verification code and reset request:
                  </p>

                  <div className="space-y-2.5">
                    {/* Option 1: Both Email and Phone */}
                    <div
                      onClick={() => setResetMethod("BOTH")}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        resetMethod === "BOTH"
                          ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="resetDestination"
                        checked={resetMethod === "BOTH"}
                        onChange={() => setResetMethod("BOTH")}
                        className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            Both Email & Mobile SMS
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Dispatches to Email: <strong className="text-slate-700 font-mono">{email}</strong> and Mobile: <strong className="text-slate-700 font-mono">{phoneNumber || "+91 98421 12345"}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Option 2: Email Only */}
                    <div
                      onClick={() => setResetMethod("EMAIL")}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        resetMethod === "EMAIL"
                          ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="resetDestination"
                        checked={resetMethod === "EMAIL"}
                        onChange={() => setResetMethod("EMAIL")}
                        className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-700" />
                          <span className="text-xs font-bold text-slate-900">
                            Institutional Email Address Only
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Dispatches official verification code to: <strong className="text-slate-700 font-mono">{email}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Option 3: Phone Only */}
                    <div
                      onClick={() => setResetMethod("PHONE")}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        resetMethod === "PHONE"
                          ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="resetDestination"
                        checked={resetMethod === "PHONE"}
                        onChange={() => setResetMethod("PHONE")}
                        className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-3.5 w-3.5 text-slate-700" />
                          <span className="text-xs font-bold text-slate-900">
                            Mobile Phone SMS (OTP) Only
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Dispatches SMS OTP verification code to: <strong className="text-slate-700 font-mono">{phoneNumber || "+91 98421 12345"}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
                    <span className="text-indigo-800 text-[11px]">
                      Need standalone recovery page?
                    </span>
                    <Link
                      href="/forgot-password"
                      className="font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 text-[11px] hover:underline"
                    >
                      <span>Public Reset Page</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForgotModal(false)}
                      className="w-full sm:w-auto text-xs text-slate-500 h-10 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={sendingResetRequest}
                      onClick={handleSendResetRequest}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center justify-center gap-2"
                    >
                      {sendingResetRequest ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Dispatching Code...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Send Reset Code & Link</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Step 2: Verification Code & Set New Password Form */
                <form onSubmit={handleCompletePasswordResetWithCode} className="space-y-4">
                  {/* Simulation Code Helper Badge */}
                  {dispatchedCodeHint && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-in fade-in">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                          Official Security Code Dispatched
                        </span>
                        <div className="font-mono text-base font-black tracking-widest text-emerald-950 mt-0.5">
                          {dispatchedCodeHint}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setResetVerificationCode(dispatchedCodeHint)}
                        className="h-7 text-[11px] font-bold border-emerald-400 text-emerald-900 bg-white hover:bg-emerald-100 rounded-lg shrink-0"
                      >
                        Auto-fill Code
                      </Button>
                    </div>
                  )}

                  {/* 6-Digit Code Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        6-Digit Security Verification Code
                      </label>
                      <button
                        type="button"
                        disabled={sendingResetRequest}
                        onClick={handleSendResetRequest}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${sendingResetRequest ? "animate-spin" : ""}`} />
                        <span>Resend Code</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={resetVerificationCode}
                        onChange={(e) => setResetVerificationCode(e.target.value.replace(/\D/g, ""))}
                        required
                        className="h-12 text-center text-lg font-mono font-black tracking-widest rounded-xl border-2 border-emerald-200 focus:border-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Check your email inbox ({email}) or SMS ({phoneNumber || "+91 98421 12345"}). Code is valid for 15 minutes.
                    </p>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Create New Password (Min 6 characters)
                    </label>
                    <div className="relative">
                      <Input
                        type={showModalNewPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={modalNewPassword}
                        onChange={(e) => setModalNewPassword(e.target.value)}
                        required
                        className="h-10 pl-9 pr-10 text-xs rounded-xl"
                      />
                      <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowModalNewPassword(!showModalNewPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showModalNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showModalConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={modalConfirmPassword}
                        onChange={(e) => setModalConfirmPassword(e.target.value)}
                        required
                        className="h-10 pl-9 pr-10 text-xs rounded-xl"
                      />
                      <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowModalConfirmPassword(!showModalConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showModalConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium hover:underline"
                    >
                      ← Change Destination
                    </button>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowForgotModal(false)}
                        className="text-xs text-slate-500 h-10 rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submittingReset}
                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center justify-center gap-2"
                      >
                        {submittingReset ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Verifying & Updating...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Verify Code & Reset Password</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
