"use client";

import React from "react";
import Link from "next/link";
import { CampusCredLogo } from "./CampusCredLogo";
import { UserRole } from "@/types/database.types";
import { Bell, Sparkles, LogOut } from "lucide-react";
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-8 backdrop-blur-md">
      {/* Left: Mobile Logo & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
        <div className="md:hidden shrink-0">
          <Link href="/">
            <CampusCredLogo size={28} showText={false} />
          </Link>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base md:text-xl font-bold text-slate-900 tracking-tight truncate leading-tight">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-primary-50 text-primary-700 border border-primary-200 shrink-0">
              NEC
            </span>
          </div>
          <p className="hidden sm:block text-xs text-slate-500 font-medium truncate">
            {collegeName}
          </p>
        </div>
      </div>

      {/* Right: Notifications & User Card */}
      <div className="flex items-center gap-2.5 sm:gap-3">

        {role === "STUDENT" && (
          <Link
            href="/student/profile"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-600/10 text-amber-900 border border-amber-300 hover:shadow-sm transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Digital Passport</span>
          </Link>
        )}

        <Link
          href={notifUrl}
          className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User profile avatar & link to settings */}
        <Link
          href={settingsUrl}
          title="Click to view Profile & Security Settings"
          className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-85 transition-opacity group"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={userName}
              className="h-8 w-8 rounded-full object-cover shadow-xs border border-slate-300 group-hover:ring-2 group-hover:ring-primary-500 transition-all"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm group-hover:ring-2 group-hover:ring-primary-500 transition-all">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-primary-600 transition-colors">
              {userName}
            </span>
            <span className="text-[10px] text-slate-400 capitalize">{role.toLowerCase()} • Edit</span>
          </div>
        </Link>

        {/* Sign Out button for both mobile and web */}
        <Link
          href="/logout"
          title="Sign Out of Account"
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50/90 hover:bg-rose-100/90 border border-rose-200/90 transition-all hover:scale-105 active:scale-95 shrink-0 shadow-2xs"
        >
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Link>
      </div>
    </header>
  );
}
