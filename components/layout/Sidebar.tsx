"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CampusCredLogo } from "./CampusCredLogo";
import { UserRole } from "@/types/database.types";
import { logoutAction } from "@/actions/auth";
import {
  LayoutDashboard,
  Award,
  UploadCloud,
  FileCheck2,
  UserCheck,
  Bell,
  Users,
  Building2,
  FolderTree,
  BarChart3,
  FileSpreadsheet,
  ShieldAlert,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DigitalPassportTrigger } from "@/components/student/DigitalPassportTrigger";

interface SidebarProps {
  role: UserRole;
  userName: string;
  departmentName?: string;
  unreadNotifications?: number;
}

export function Sidebar({
  role,
  userName,
  departmentName,
  unreadNotifications = 0,
}: SidebarProps) {
  const pathname = usePathname();

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/certificates", label: "Certificates", icon: FileCheck2 },
    { href: "/student/submit", label: "Submit Certificate", icon: UploadCloud },
    { href: "/student/achievements", label: "Achievement Wallet", icon: Award },
    { href: "/student/profile", label: "Achievement Passport", icon: Sparkles },
    { href: "/student/settings", label: "Profile & Security", icon: Settings },
    {
      href: "/student/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
  ];

  const facultyLinks = [
    { href: "/faculty/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/faculty/reviews", label: "Review Queue", icon: FileCheck2 },
    { href: "/faculty/students", label: "Department Students", icon: Users },
    { href: "/faculty/students/excel", label: "Excel Student Sheet", icon: FileSpreadsheet },
    { href: "/faculty/settings", label: "Profile & Security", icon: Settings },
    {
      href: "/faculty/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
  ];

  const hodLinks = [
    { href: "/hod/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/faculty/reviews", label: "Department Reviews", icon: FileCheck2 },
    { href: "/hod/faculty", label: "Faculty Members", icon: UserCheck },
    { href: "/hod/faculty/excel", label: "Excel Faculty Sheet", icon: FileSpreadsheet },
    { href: "/hod/students", label: "Students", icon: Users },
    { href: "/hod/analytics", label: "Department Analytics", icon: BarChart3 },
    { href: "/hod/reports", label: "Reports Export", icon: FileSpreadsheet },
    { href: "/hod/settings", label: "Profile & Security", icon: Settings },
    {
      href: "/faculty/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users & Faculty", icon: Users },
    { href: "/admin/departments", label: "Departments", icon: Building2 },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/reports", label: "Reports & Exports", icon: FileSpreadsheet },
    { href: "/admin/analytics", label: "Institutional Analytics", icon: BarChart3 },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
    { href: "/admin/settings", label: "Profile & Settings", icon: Settings },
  ];

  let links = studentLinks;
  if (role === "FACULTY") links = facultyLinks;
  else if (role === "HOD") links = hodLinks;
  else if (role === "ADMIN") links = adminLinks;

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/login";
  };

  const homeUrl =
    role === "STUDENT"
      ? "/student/dashboard"
      : role === "FACULTY"
      ? "/faculty/dashboard"
      : role === "HOD"
      ? "/hod/dashboard"
      : "/admin/dashboard";

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 bg-[#070a14]/95 border-r border-cyan-500/20 backdrop-blur-2xl shadow-2xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-cyan-500/15 bg-slate-950/40">
        <Link href={homeUrl}>
          <CampusCredLogo size={32} isDark={true} />
        </Link>
      </div>

      {/* Role Pill & Dept Info */}
      <div className="px-5 py-3.5 bg-slate-950/60 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
            {role}
          </span>
          {departmentName && (
            <span className="text-[11px] font-mono font-semibold text-slate-400 truncate max-w-[120px]">
              {departmentName}
            </span>
          )}
        </div>
        <p className="text-xs font-bold text-white mt-1.5 truncate">
          {userName}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          if (link.href === "/student/profile" && role === "STUDENT") {
            return (
              <div key="passport-trigger" className="py-0.5">
                <DigitalPassportTrigger variant="sidebar" label={link.label} />
              </div>
            );
          }
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/50 text-cyan-300 border-l-2 border-cyan-400 shadow-[inset_0_0_15px_rgba(6,182,212,0.15)]"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "text-slate-500 group-hover:text-cyan-400"
                  )}
                />
                <span className="tracking-wide">{link.label}</span>
              </div>
              {link.badge ? (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-black leading-none text-black bg-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff]">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Telemetry Footer & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/70 space-y-2">
        <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            SECURE NODE
          </span>
          <span className="text-slate-500">AUTONOMOUS</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-200 rounded-xl hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
