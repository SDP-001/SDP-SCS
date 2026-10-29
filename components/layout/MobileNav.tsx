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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg">
      <nav className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-xs transition-all relative",
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-900 font-medium",
                link.highlight && "text-blue-600"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 mb-0.5 transition-all",
                    isActive ? "text-blue-600 scale-105" : "text-slate-400",
                    link.highlight && "text-blue-600"
                  )}
                />
                {link.badge && link.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-2xs">
                    {link.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
