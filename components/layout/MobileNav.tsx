"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types/database.types";
import {
  LayoutDashboard,
  Award,
  UploadCloud,
  FileCheck2,
  Bell,
  Users,
  BarChart3,
  Settings,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MobileNavProps {
  role: UserRole;
  unreadNotifications?: number;
}

export function MobileNav({ role, unreadNotifications = 0 }: MobileNavProps) {
  const pathname = usePathname();

  const studentLinks = [
    { href: "/student/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/student/certificates", label: "Certs", icon: FileCheck2 },
    { href: "/student/submit", label: "Submit", icon: UploadCloud, highlight: true },
    { href: "/student/settings", label: "Profile", icon: Settings },
    {
      href: "/student/notifications",
      label: "Alerts",
      icon: Bell,
      badge: unreadNotifications,
    },
  ];

  const facultyLinks = [
    { href: "/faculty/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/faculty/reviews", label: "Queue", icon: FileCheck2 },
    { href: "/faculty/students", label: "Students", icon: Users },
    { href: "/faculty/settings", label: "Profile", icon: Settings },
    {
      href: "/faculty/notifications",
      label: "Alerts",
      icon: Bell,
      badge: unreadNotifications,
    },
  ];

  const hodLinks = [
    { href: "/hod/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/faculty/reviews", label: "Reviews", icon: FileCheck2 },
    { href: "/hod/faculty", label: "Faculty", icon: Users },
    { href: "/hod/settings", label: "Profile", icon: Settings },
    {
      href: "/faculty/notifications",
      label: "Alerts",
      icon: Bell,
      badge: unreadNotifications,
    },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Profile", icon: Settings },
  ];

  let links = studentLinks;
  if (role === "FACULTY") links = facultyLinks;
  else if (role === "HOD") links = hodLinks;
  else if (role === "ADMIN") links = adminLinks;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070a14]/95 backdrop-blur-2xl border-t border-cyan-500/20 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <nav className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-xs font-bold transition-all relative",
                isActive
                  ? "text-cyan-400"
                  : "text-slate-400 hover:text-white",
                link.highlight && "text-cyan-300"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 mb-0.5 transition-all",
                    isActive ? "text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "text-slate-500",
                    link.highlight && "text-cyan-400"
                  )}
                />
                {link.badge && link.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-mono font-bold text-black shadow-[0_0_8px_#00f0ff] animate-pulse">
                    {link.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-wider uppercase font-mono">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
