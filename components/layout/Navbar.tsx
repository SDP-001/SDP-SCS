"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { CampusCredLogo } from "./CampusCredLogo";
import { UserRole } from "@/types/database.types";
import { Bell, Sparkles, LogOut, ArrowLeft } from "lucide-react";
import { DigitalPassportTrigger } from "@/components/student/DigitalPassportTrigger";
import { logoutAction } from "@/actions/auth";
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
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const homeUrl =
    role === "STUDENT"
      ? "/student/dashboard"
      : role === "FACULTY"
      ? "/faculty/dashboard"
      : role === "HOD"
      ? "/hod/dashboard"
      : "/admin/dashboard";

  const isDashboard = pathname === homeUrl;

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

  const handleBack = () => {
    if (isDashboard) return;
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(homeUrl);
    }
  };

  const handleConfirmSignOut = async () => {
    try {
      setIsSigningOut(true);
      await logoutAction();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-8 backdrop-blur-md shadow-xs">
      {/* Left: Back Button, Mobile Logo & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
        {!isDashboard && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        <div className="md:hidden shrink-0">
          <Link href={homeUrl} prefetch={true}>
            <CampusCredLogo size={28} showText={false} isDark={false} />
          </Link>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base md:text-xl font-bold text-slate-900 tracking-tight truncate leading-tight">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              Autonomous
            </span>
          </div>
          <p className="hidden sm:block text-xs text-slate-500 truncate">
            {collegeName}
          </p>
        </div>
      </div>

      {/* Right: Notifications, Digital Passport Pop View & User Card */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {role === "STUDENT" && (
          <div className="hidden xl:block">
            <DigitalPassportTrigger variant="navbar" label="Digital Passport" />
          </div>
        )}

        <Link
          href={notifUrl}
          prefetch={true}
          className="relative rounded-xl p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User profile avatar & link to settings */}
        <Link
          href={settingsUrl}
          prefetch={true}
          title="Click to view Profile & Security Settings"
          className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-90 transition-opacity group"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={userName}
              className="h-8 w-8 rounded-full object-cover shadow-xs border border-slate-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:ring-2 group-hover:ring-blue-500 transition-all">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
              {userName}
            </span>
            <span className="text-[10px] text-slate-500 capitalize">{role.toLowerCase()}</span>
          </div>
        </Link>

        {/* Manual Sign Out button for both mobile and web */}
        <button
          type="button"
          onClick={() => setShowSignOutConfirm(true)}
          title="Sign Out of Account"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      {/* Manual Sign Out Confirmation Modal */}
      {mounted &&
        showSignOutConfirm &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signout-dialog-title"
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => !isSigningOut && setShowSignOutConfirm(false)}
          >
            <div
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 text-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <LogOut className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 id="signout-dialog-title" className="text-base font-bold text-slate-900">
                  Sign Out of Account?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to end your active session on this device?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSigningOut}
                  onClick={() => setShowSignOutConfirm(false)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSigningOut}
                  onClick={handleConfirmSignOut}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSigningOut ? "Signing Out..." : "Yes, Sign Out"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
