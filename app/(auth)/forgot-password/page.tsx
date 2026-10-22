"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  requestPasswordResetAction,
  completePasswordResetAction,
} from "@/actions/auth";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  User,
  ArrowRight,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Identifier input
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dispatched details from server
  const [dispatchedEmail, setDispatchedEmail] = useState("");
  const [dispatchedCode, setDispatchedCode] = useState("");

  // Step 2: Verification code and new password
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Step 1: Request reset code
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your User ID, Register Number, Employee ID, or Email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await requestPasswordResetAction(identifier.trim());
      if (!res.success) {
        setError(res.error || "Unable to find an account for this identifier.");
        setLoading(false);
        return;
      }

      setDispatchedEmail(res.email || identifier.trim());
      setDispatchedCode(res.code || "");
      setCode(res.code || ""); // Pre-fill verification code for smooth demo/testing
      setStep(2);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and set new password
  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.trim().length !== 6) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setResetLoading(true);
    setError(null);

    try {
      const res = await completePasswordResetAction({
        email: dispatchedEmail,
        code: code.trim(),
        newPassword,
      });

      if (!res.success) {
        setError(res.error || "Failed to reset password. Please verify the code.");
        setResetLoading(false);
        return;
      }

      setStep(3);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative clean-grid-bg">
      <div className="w-full max-w-md mx-auto my-auto">
        {/* Back link */}
        <div className="mb-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        {/* Clean Header */}
        <div className="text-center mb-6">
          <Link
            href="/login"
            className="inline-block transition-transform hover:scale-105 active:scale-95"
            title="Nandha Engineering College"
          >
            <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs inline-flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/nec-logo.png"
                alt="Nandha Engineering College (NEC) Logo"
                className="h-14 sm:h-16 w-auto object-contain select-none"
              />
            </div>
          </Link>

          <div className="mt-3.5 space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Password Recovery
            </h1>
            <p className="text-xs text-slate-500">
              Nandha Engineering College (Autonomous)
            </p>
          </div>
        </div>

        {/* Clean Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* STEP 1: Enter User ID / Email */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  User ID / Register No. / Employee ID / Email
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="e.g. 710022CS0101, FAC-CSE-101, or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoFocus
                    className="h-11 pl-9 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl font-mono shadow-2xs"
                  />
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-tight">
                  Enter your registered identifier. A 6-digit security code will be sent to your registered email address.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Code to Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </Button>

              <div className="text-center pt-1">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Return to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Verification Code & Set New Password */}
          {step === 2 && (
            <form onSubmit={handleCompleteReset} className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Verification Code Dispatched!</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  We have sent a verification email to: <strong className="text-emerald-900">{dispatchedEmail}</strong>
                </p>
                {dispatchedCode && (
                  <p className="text-[10px] text-emerald-800 font-mono pt-1">
                    Demo Code: <span className="font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-300">{dispatchedCode}</span>
                  </p>
                )}
              </div>

              {/* 6-Digit Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 482910"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="h-11 pl-9 text-xs font-mono tracking-widest text-slate-900 bg-white border-slate-200 rounded-xl text-center text-sm font-bold shadow-2xs"
                  />
                  <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (Minimum 6 characters)
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-11 pl-9 pr-10 text-xs bg-white border-slate-200 text-slate-900 rounded-xl shadow-2xs"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 pl-9 pr-10 text-xs bg-white border-slate-200 text-slate-900 rounded-xl shadow-2xs"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={resetLoading}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {resetLoading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Code & Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verify Code & Reset Password</span>
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Change Email / ID
                </button>
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Password Reset Successfully!
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your password has been updated. You can now sign in using your new password.
                </p>
              </div>

              <Link href="/login" className="block pt-2">
                <Button className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer">
                  <span>Sign In with New Password</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-5">
          © {new Date().getFullYear()} Nandha Engineering College (Autonomous) • Erode, TN
        </p>
      </div>
    </div>
  );
}
