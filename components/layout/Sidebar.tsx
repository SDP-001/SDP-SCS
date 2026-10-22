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
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 bg-white border-r border-slate-200/90 shadow-xs">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-white">
        <Link href={homeUrl}>
          <CampusCredLogo size={32} isDark={false} />
        </Link>
      </div>

      {/* Role Pill & Dept Info */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
            {role}
          </span>
          {departmentName && (
            <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">
              {departmentName}
            </span>
          )}
        </div>
        <p className="text-xs font-bold text-slate-900 mt-1.5 truncate">
          {userName}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                "group flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 font-bold border-r-2 border-blue-600 shadow-2xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-700"
                  )}
                />
                <span className="tracking-wide">{link.label}</span>
              </div>
              {link.badge ? (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-blue-600 rounded-full shadow-2xs">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Institutional Footer & Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        <div className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium shadow-2xs">
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            Verified Portal
          </span>
          <span className="text-slate-400 text-[10px]">Autonomous</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
