"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  UserPlus,
} from "lucide-react";

export default function PortalLandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Animated Ambient Background Glows */}
      <div className="fixed top-[-15%] left-[20%] w-[650px] h-[650px] bg-gradient-to-tr from-indigo-600/25 via-emerald-500/20 to-cyan-500/25 blur-[160px] rounded-full pointer-events-none animate-pulse-halo" />
      <div className="fixed bottom-[-10%] right-[15%] w-[600px] h-[600px] bg-gradient-to-bl from-teal-500/20 via-indigo-600/20 to-purple-600/20 blur-[150px] rounded-full pointer-events-none animate-pulse-halo" />
      <div className="fixed top-[45%] left-[-10%] w-[450px] h-[450px] bg-cyan-600/15 blur-[140px] rounded-full pointer-events-none animate-float-gentle" />

      {/* Modern Starfield & Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Top Floating Glass Navigation Bar */}
      <header className="relative z-20 w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white p-1 shadow-md border border-white/40 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/nec-logo.png"
                alt="NEC App Icon"
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors truncate block">
                NANDHA ENGINEERING COLLEGE
              </span>
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 truncate">
                Institutional Autonomous Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>NAAC &apos;A+&apos; Autonomous</span>
            </div>

            <Link
              href="/login?mode=register"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-bold text-xs tracking-wide transition-all"
            >
              <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
              <span>Create Account</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Showcase with Animated Emblem & Floating Aesthetics */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 max-w-4xl mx-auto w-full my-auto">
        
        {/* Animated Centerpiece: Floating Shield & Pulsing Ring Halo */}
        <div className="flex flex-col items-center text-center animate-in fade-in duration-700 w-full">
          
          <Link
            href="/login"
            className="group relative cursor-pointer block transition-transform duration-500 hover:scale-105 active:scale-95 mb-6 sm:mb-8"
            title="Click to Enter NEC Portal Login"
          >
            {/* Outer Slow-Spinning Neon Gradient Ring */}
            <div className="absolute -inset-6 sm:-inset-8 rounded-[36px] sm:rounded-[44px] bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-400 opacity-70 blur-xl sm:blur-2xl group-hover:opacity-100 group-hover:blur-3xl transition-all duration-700 animate-spin-slow pointer-events-none" />

            {/* Counter-Spinning Subtle Inner Aura */}
            <div className="absolute -inset-3 sm:-inset-4 rounded-[30px] sm:rounded-[36px] bg-gradient-to-tr from-cyan-400 via-teal-400 to-indigo-500 opacity-60 blur-md sm:blur-lg animate-spin-reverse-slow pointer-events-none" />

            {/* Glowing Levitation Glassmorphic Container Frame */}
            <div className="relative rounded-[26px] sm:rounded-[32px] p-2.5 sm:p-3 bg-gradient-to-b from-white/40 via-slate-800/90 to-slate-950 border border-white/50 shadow-2xl backdrop-blur-2xl animate-float-levitate">
              
              {/* White Interior Plaque with Sweeping Light Beam */}
              <div className="relative flex items-center justify-center rounded-[20px] sm:rounded-[26px] bg-white px-8 py-6 sm:px-16 sm:py-10 overflow-hidden shadow-2xl">
                
                {/* Light Sweep Reflection Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none animate-beam-pass" />

                {/* Official Nandha Engineering College Crest */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/nec-logo.png"
                  alt="Nandha Engineering College (NEC) Official Logo"
                  className="h-24 sm:h-40 w-auto object-contain drop-shadow-md select-none transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </Link>

          {/* Institutional Titles & Verification Indicators */}
          <div className="space-y-3 max-w-2xl mx-auto px-2">
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-950/30">
              <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500" />
              </span>
              <span>Official Institutional Portal • Autonomous</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-lg leading-tight">
              NANDHA{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-300 animate-gradient-shift">
                ENGINEERING COLLEGE
              </span>
            </h1>

            <p className="text-xs sm:text-base font-semibold text-slate-300 max-w-xl mx-auto leading-relaxed">
              Approved by AICTE • Affiliated to Anna University • Accredited by NAAC with &apos;A+&apos; Grade • Erode, Tamil Nadu
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              Student Co-Curricular Management, Verified Activity Credits & Faculty Verification Suite
            </p>
          </div>

          {/* Action Buttons: Enter Portal Sign In & Create New Account */}
          <div className="mt-8 w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="group relative w-full sm:flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-xl shadow-emerald-950/50 hover:shadow-cyan-900/50 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Enter Sign In</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/login?mode=register"
              className="group relative w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 text-white border border-slate-700/90 font-bold text-sm tracking-wide shadow-lg hover:border-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <UserPlus className="h-4 w-4 text-emerald-400" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Institutional Security Footer */}
      <footer className="relative z-20 w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Nandha Engineering College (Autonomous) • Student Credential Management System</span>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} Nandha Engineering College. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
