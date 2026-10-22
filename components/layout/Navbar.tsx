"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CampusCredLogo } from "./CampusCredLogo";
import { UserRole } from "@/types/database.types";
import { Bell, Sparkles, LogOut, ArrowLeft } from "lucide-react";
import { DigitalPassportTrigger } from "@/components/student/DigitalPassportTrigger";
import { cn } from "@/lib/utils/cn";

interface NavbarProps {
  title?: string;
  collegeName?: string;
  role: UserRole;
  userName: string;
  avatarUrl?: string | null;
  unreadCount?: number;
}

export function Navbar({
  title = "Dashboard",
  collegeName = "Nandha Engineering College (NEC)",
  role,
  userName,
  avatarUrl,
  unreadCount = 0,
}: NavbarProps) {
  const router = useRouter();

  const homeUrl =
    role === "STUDENT"
      ? "/student/dashboard"
      : role === "FACULTY"
      ? "/faculty/dashboard"
      : role === "HOD"
      ? "/hod/dashboard"
      : "/admin/dashboard";

  const notifUrl =
    role === "STUDENT"
      ? "/student/notifications"
      : role === "ADMIN"
      ? "/admin/dashboard"
      : "/faculty/notifications";

  const settingsUrl =
    role === "STUDENT"
      ? "/student/settings"
      : role === "FACULTY"
      ? "/faculty/settings"
      : role === "HOD"
      ? "/hod/settings"
      : "/admin/settings";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-cyan-500/20 bg-[#070a14]/90 px-4 md:px-8 backdrop-blur-2xl shadow-xl">
      {/* Left: Back Button, Mobile Logo & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center h-9 w-9 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/40 transition-all shadow-sm hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          title="Go Back in App"
          aria-label="Go Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="md:hidden shrink-0">
          <Link href={homeUrl}>
            <CampusCredLogo size={28} showText={false} isDark={true} />
          </Link>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base md:text-xl font-black text-white tracking-tight truncate leading-tight">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)] shrink-0">
              NEC // NODE
            </span>
          </div>
          <p className="hidden sm:block text-xs text-slate-400 font-mono truncate">
            {collegeName}
          </p>
        </div>
      </div>

      {/* Right: Telemetry sync, Notifications, Digital Passport Pop View & User Card */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>LEDGER: SYNCED</span>
        </div>

        {role === "STUDENT" && (
          <div className="hidden xl:block">
            <DigitalPassportTrigger variant="navbar" label="Digital Passport" />
          </div>
        )}

        <Link
          href={notifUrl}
          className="relative rounded-xl p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 border border-slate-800 hover:border-cyan-500/30 transition-all"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-mono font-bold text-black shadow-[0_0_8px_#00f0ff] animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User profile avatar & link to settings */}
        <Link
          href={settingsUrl}
          title="Click to view Profile & Security Settings"
          className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-90 transition-opacity group"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={userName}
              className="h-8 w-8 rounded-full object-cover shadow-sm border border-cyan-500/40 group-hover:ring-2 group-hover:ring-cyan-400 transition-all"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm border border-cyan-400/50 group-hover:ring-2 group-hover:ring-cyan-400 transition-all">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight group-hover:text-cyan-400 transition-colors">
              {userName}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono capitalize">{role.toLowerCase()} • Edit</span>
          </div>
        </Link>

        {/* Sign Out button for both mobile and web */}
        <Link
          href="/logout"
          title="Sign Out of Account"
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 transition-all hover:scale-105 active:scale-95 shrink-0 shadow-sm"
        >
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Link>
      </div>
    </header>
  );
}
