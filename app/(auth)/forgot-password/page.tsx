"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
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
  ShieldCheck,
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
      setCode(res.code || ""); // Pre-fill verification code for effortless demo/testing
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 overflow-hidden select-none">
      {/* Background Neon Glowing Halos */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-emerald-600/20 via-indigo-600/20 to-cyan-500/25 blur-[140px] rounded-full pointer-events-none animate-pulse-halo" />
      <div className="fixed bottom-1/4 right-1/4 w-[450px] h-[450px] bg-emerald-500/15 blur-[130px] rounded-full pointer-events-none animate-float-gentle" />

      {/* Top Header Link */}
      <div className="relative z-20 max-w-md mx-auto w-full flex items-center justify-between mb-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md my-auto">
        {/* Animated Brand Showcase Header */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="group relative inline-block cursor-pointer transition-transform duration-500 hover:scale-105 active:scale-95"
            title="Click to go to Homepage"
          >
            {/* Outer Glowing Rotating Halo */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-400 opacity-70 blur-xl group-hover:opacity-100 group-hover:blur-2xl transition-all duration-700 pointer-events-none animate-spin-slow" />

            {/* Glassmorphic Frame with Floating Levitation */}
            <div className="relative rounded-2xl p-2 bg-gradient-to-b from-white/30 via-slate-800/80 to-slate-950/90 border border-white/40 shadow-2xl backdrop-blur-xl animate-float-levitate">
              <div className="relative flex items-center justify-center rounded-xl bg-white px-6 py-3 overflow-hidden shadow-inner">
                {/* Light Sweep Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none animate-beam-pass" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/nec-logo.png"
                  alt="Nandha Engineering College (NEC) Logo"
                  className="h-14 sm:h-18 w-auto object-contain drop-shadow-sm select-none"
                />
              </div>
            </div>
          </Link>

          {/* Institutional Title & Badge */}
          <div className="mt-3.5 space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
              Password Recovery
            </h2>
            <p className="text-xs text-slate-400">
              Nandha Engineering College • Autonomous Institutional Portal
            </p>
          </div>
        </div>

        {/* Modern Mobile App Style Glassmorphic Card */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900/85 border border-slate-700/80 shadow-2xl shadow-indigo-950/40 backdrop-blur-2xl p-5 sm:p-7 space-y-4">
          
          {error && (
            <div className="p-3 text-xs bg-rose-950/70 border border-rose-500/40 text-rose-200 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-semibold">{error}</span>
            </div>
          )}

          {/* STEP 1: Enter User ID / Email to Send Reset Request */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
                    className="h-11 pl-9 text-xs bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl"
                  />
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">
                  Enter your registered institutional identifier or email. A secure 6-digit password reset request will be dispatched to your email address.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-950/50 hover:shadow-cyan-900/50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Dispatching Request to Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>Send Reset Request to Email</span>
                  </>
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Return to Login
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Verification Code & Set New Password */}
          {step === 2 && (
            <form onSubmit={handleCompleteReset} className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Request Dispatched to Email!</span>
                </div>
                <p className="text-[11px] text-emerald-300 leading-relaxed">
                  We have dispatched a verification email to: <strong className="text-white underline">{dispatchedEmail}</strong>
                </p>
                {dispatchedCode && (
                  <p className="text-[10px] text-emerald-400 font-mono pt-1">
                    Security Code: <span className="font-bold text-white bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">{dispatchedCode}</span>
                  </p>
                )}
              </div>

              {/* 6-Digit Code */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
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
                    className="h-11 pl-9 text-xs font-mono tracking-widest text-white bg-slate-800/90 border-slate-700 rounded-xl text-center text-sm font-bold"
                  />
                  <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  New Password (Minimum 6 characters)
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-11 pl-9 pr-10 text-xs bg-slate-800/90 border-slate-700 text-white rounded-xl"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 pl-9 pr-10 text-xs bg-slate-800/90 border-slate-700 text-white rounded-xl"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={resetLoading}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
              >
                {resetLoading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Code & Setting Password...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verify Code & Reset Password</span>
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-white"
                >
                  Change Email / ID
                </button>
                <Link
                  href="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Password Reset Successfully!
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Your password has been updated. An official confirmation alert has also been dispatched to <strong className="text-emerald-400">{dispatchedEmail}</strong>.
                </p>
              </div>

              <Link href="/login" className="block pt-2">
                <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2">
                  <span>Sign In with New Password</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 mt-4">
          © {new Date().getFullYear()} Nandha Engineering College (Autonomous) • Erode, TN
        </p>
      </div>
    </div>
  );
}
