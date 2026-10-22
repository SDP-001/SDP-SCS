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
  User,
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
      }, 1200);
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
        <span className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-semibold">Checking active session...</p>
      </div>
    );
  }

  // Already Signed Out
  if (loggedOut) {
    return (
      <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900/85 border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-center space-y-5 backdrop-blur-2xl">
        <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Successfully Signed Out
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            Your session has been securely closed. All encrypted access tokens on this device have been cleared.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login" className="block w-full">
            <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2">
              <span>Sign In Again</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="pt-1">
          <Link
            href="/login"
            className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 font-semibold"
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
    <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900/85 border border-slate-700/80 shadow-2xl p-5 sm:p-7 space-y-5 backdrop-blur-2xl">
      {/* Session User Identity Card */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-3.5">
        <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
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
            <span className="text-sm font-black text-white truncate block">
              {profile?.full_name}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {roleName}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {profile?.email}
          </p>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed text-[11px]">
          <span className="font-bold text-rose-100 block">Sign Out Confirmation</span>
          <p className="text-rose-200/90">
            Signing out will securely terminate your active session on this device. You will need to sign in again to submit or verify certificates.
          </p>
        </div>
      </div>

      {/* Actions: Sign Out vs Cancel */}
      <div className="space-y-2.5 pt-1">
        <Button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs tracking-wide shadow-lg shadow-rose-950/50 hover:shadow-rose-900/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {signingOut ? (
            <>
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing Out Safely...</span>
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              <span>Yes, Sign Out Now</span>
            </>
          )}
        </Button>

        <Link href={getDashboardUrl()} className="block w-full">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors"
          >
            Cancel & Stay Signed In
          </Button>
        </Link>
      </div>

      {/* Security Footer Info */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Encrypted Session</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          Session ID Protected
        </span>
      </div>
    </div>
  );
}

export default function LogoutPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 overflow-hidden select-none">
      {/* Background Neon Glowing Halos */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-rose-600/15 via-indigo-600/20 to-cyan-500/20 blur-[140px] rounded-full pointer-events-none animate-pulse-halo" />
      <div className="fixed bottom-1/4 right-1/4 w-[450px] h-[450px] bg-rose-500/10 blur-[130px] rounded-full pointer-events-none animate-float-gentle" />

      {/* Top Header Link */}
      <div className="relative z-20 max-w-sm sm:max-w-md mx-auto w-full flex items-center justify-between mb-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Login</span>
        </Link>
        <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 flex items-center gap-1">
          <LogOut className="h-3 w-3" />
          <span>Secure Sign Out</span>
        </span>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md my-auto">
        {/* Animated Brand Showcase Header */}
        <div className="text-center mb-6">
          <Link
            href="/login"
            className="group relative inline-block cursor-pointer transition-transform duration-500 hover:scale-105 active:scale-95"
            title="Click to go to Login"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-rose-500 via-indigo-500 to-cyan-400 opacity-60 blur-xl group-hover:opacity-100 group-hover:blur-2xl transition-all duration-700 pointer-events-none animate-spin-slow" />

            <div className="relative rounded-2xl p-2 bg-gradient-to-b from-white/30 via-slate-800/80 to-slate-950/90 border border-white/40 shadow-2xl backdrop-blur-xl animate-float-levitate">
              <div className="relative flex items-center justify-center rounded-xl bg-white px-6 py-3 overflow-hidden shadow-inner">
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

          <div className="mt-3.5 space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
              Sign Out Session
            </h2>
            <p className="text-xs text-slate-400">
              Nandha Engineering College (Autonomous) • Institutional Portal
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
        <p className="text-center text-[11px] text-slate-500 mt-5">
          © {new Date().getFullYear()} Nandha Engineering College • Erode, Tamil Nadu
        </p>
      </div>
    </div>
  );
}
