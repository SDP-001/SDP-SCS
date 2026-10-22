"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logoutAction, getSessionAction } from "@/actions/auth";
import {
  LogOut,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

function LogoutContent() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await getSessionAction();
        if (res.user) {
          setCurrentUser(res.user);
        } else {
          setLoggedOut(true);
        }
      } catch (err) {
        setLoggedOut(true);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logoutAction();
      setLoggedOut(true);
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      router.push("/login");
    } finally {
      setSigningOut(false);
    }
  };

  const getDashboardUrl = () => {
    const role = currentUser?.profile?.role;
    if (role === "STUDENT") return "/student/dashboard";
    if (role === "FACULTY") return "/faculty/dashboard";
    if (role === "HOD") return "/hod/dashboard";
    if (role === "ADMIN") return "/admin/dashboard";
    return "/";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
        <span className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Checking active session...</p>
      </div>
    );
  }

  // Already Signed Out
  if (loggedOut) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-5">
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">
            Successfully Signed Out
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Your session has been securely ended. All credentials on this device have been cleared.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login" className="block w-full">
            <Button className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer">
              <span>Sign In Again</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="pt-1">
          <Link
            href="/login"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to Login
          </Link>
        </div>
      </div>
    );
  }

  const profile = currentUser?.profile;
  const roleName = profile?.role || "USER";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-5">
      {/* Session User Identity Card */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name || ""}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            (profile?.full_name || "User")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 truncate block">
              {profile?.full_name}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {roleName}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {profile?.email}
          </p>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-bold text-amber-900 block">Sign Out Confirmation</span>
          <p className="text-amber-700">
            Are you sure you want to sign out? You will need to sign in again to submit or verify certificates.
          </p>
        </div>
      </div>

      {/* Actions: Sign Out vs Cancel */}
      <div className="space-y-2 pt-1">
        <Button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {signingOut ? (
            <>
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing Out Safely...</span>
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              <span>Yes, Sign Out</span>
            </>
          )}
        </Button>

        <Link href={getDashboardUrl()} className="block w-full">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel & Return to Dashboard
          </Button>
        </Link>
      </div>

      {/* Security Footer Info */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-500 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Encrypted Session</span>
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Session ID Protected
        </span>
      </div>
    </div>
  );
}

export default function LogoutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative clean-grid-bg">
      <div className="w-full max-w-md mx-auto my-auto">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Login</span>
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
              Sign Out Session
            </h1>
            <p className="text-xs text-slate-500">
              Nandha Engineering College (Autonomous)
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
              Loading session details...
            </div>
          }
        >
          <LogoutContent />
        </Suspense>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-5">
          © {new Date().getFullYear()} Nandha Engineering College • Erode, TN
        </p>
      </div>
    </div>
  );
}
