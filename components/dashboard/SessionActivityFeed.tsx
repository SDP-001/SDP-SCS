"use client";

import React, { useState, useEffect } from "react";
import {
  SessionActivityItem,
  getSessionActivityLogsAction,
} from "@/actions/sessionActivity";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  LogOut,
  KeyRound,
  Search,
  RefreshCw,
  Clock,
  Calendar,
  GraduationCap,
  Users,
  Building2,
  ShieldCheck,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface SessionActivityFeedProps {
  initialActivities: SessionActivityItem[];
  callerRole: "FACULTY" | "HOD" | "ADMIN";
  title?: string;
  subtitle?: string;
}

export function SessionActivityFeed({
  initialActivities,
  callerRole,
  title,
  subtitle,
}: SessionActivityFeedProps) {
  const [activities, setActivities] = useState<SessionActivityItem[]>(initialActivities);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<"ALL" | "LOGIN" | "LOGOUT" | "PASSWORD_RESET">("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh the live feed every 12 seconds to ensure real-time synchronization
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updated = await getSessionActivityLogsAction({
          roleFilter: roleFilter === "ALL" ? undefined : roleFilter,
          limit: 100,
        });
        if (updated && updated.length > 0) {
          setActivities(updated);
        }
      } catch {
        // Silent catch for background poll
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [roleFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updated = await getSessionActivityLogsAction({
        roleFilter: roleFilter === "ALL" ? undefined : roleFilter,
        limit: 100,
      });
      setActivities(updated);
    } catch (err) {
      console.error("Failed to refresh session logs", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter and strictly sort items descending by timestamp
  const filteredActivities = activities
    .filter((item) => {
      // Action filter
      if (actionFilter !== "ALL" && item.action !== actionFilter) return false;

      // Role filter
      if (roleFilter !== "ALL" && item.role !== roleFilter) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = item.fullName.toLowerCase().includes(q);
        const matchId = item.identifier.toLowerCase().includes(q);
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchDept = item.departmentName.toLowerCase().includes(q);
        return matchName || matchId || matchEmail || matchDept;
      }

      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getDefaultTitle = () => {
    switch (callerRole) {
      case "FACULTY":
        return "Student Live Session & Password Activity";
      case "HOD":
        return "Department Session & Password Tracker (Students & Faculty Activity)";
      case "ADMIN":
        return "Apex Institutional Session Monitor (HOD, Faculty & Students)";
    }
  };

  const getDefaultSubtitle = () => {
    switch (callerRole) {
      case "FACULTY":
        return "Live chronological log of enrolled students logging in, logging out, and resetting passwords with exact date and time.";
      case "HOD":
        return "Departmental live monitoring of Student and Faculty member sessions and password resets with credentials, time, and date.";
      case "ADMIN":
        return "Comprehensive institutional oversight of all Department Heads (HODs), Faculty members, and Students.";
    }
  };

  const getActionBadge = (action: "LOGIN" | "LOGOUT" | "PASSWORD_RESET") => {
    switch (action) {
      case "LOGIN":
        return {
          label: "LOGIN",
          className: "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs",
          icon: LogIn,
          iconClass: "text-emerald-600",
        };
      case "LOGOUT":
        return {
          label: "LOGOUT",
          className: "bg-rose-50 text-rose-800 border-rose-300 shadow-2xs",
          icon: LogOut,
          iconClass: "text-rose-600",
        };
      case "PASSWORD_RESET":
        return {
          label: "PASSWORD RESET",
          className: "bg-amber-50 text-amber-800 border-amber-300 shadow-2xs",
          icon: KeyRound,
          iconClass: "text-amber-600",
        };
      default:
        return {
          label: action,
          className: "bg-slate-100 text-slate-800 border-slate-300",
          icon: Activity,
          iconClass: "text-slate-600",
        };
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "STUDENT":
        return {
          label: "Student",
          className: "bg-cyan-50 text-cyan-700 border-cyan-200",
          icon: GraduationCap,
        };
      case "FACULTY":
        return {
          label: "Faculty",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: Users,
        };
      case "HOD":
        return {
          label: "HOD",
          className: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Building2,
        };
      case "ADMIN":
        return {
          label: "Dean / Admin",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: ShieldCheck,
        };
      default:
        return {
          label: role,
          className: "bg-slate-100 text-slate-700 border-slate-200",
          icon: Users,
        };
    }
  };

  return (
    <Card className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center shrink-0 shadow-md">
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {title || getDefaultTitle()}
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Feed</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {subtitle || getDefaultSubtitle()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
            <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
          </Button>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
            {filteredActivities.length} logs
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Input
            type="text"
            placeholder="Search by name, reg no, or emp id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-xs rounded-xl border-slate-200 bg-slate-50/50"
          />
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Action and Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Action Chips */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setActionFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                actionFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All Actions
            </button>
            <button
              type="button"
              onClick={() => setActionFilter("LOGIN")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                actionFilter === "LOGIN"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-slate-500 hover:text-emerald-700"
              }`}
            >
              <LogIn className="h-3 w-3" />
              <span>Logins</span>
            </button>
            <button
              type="button"
              onClick={() => setActionFilter("LOGOUT")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                actionFilter === "LOGOUT"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "text-slate-500 hover:text-rose-700"
              }`}
            >
              <LogOut className="h-3 w-3" />
              <span>Logouts</span>
            </button>
            <button
              type="button"
              onClick={() => setActionFilter("PASSWORD_RESET")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                actionFilter === "PASSWORD_RESET"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "text-slate-500 hover:text-amber-700"
              }`}
            >
              <KeyRound className="h-3 w-3" />
              <span>Password Resets</span>
            </button>
          </div>

          {/* Role Filter Chips (For HOD & Dean) */}
          {callerRole === "ADMIN" && (
            <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setRoleFilter("ALL")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  roleFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All Roles
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("HOD")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  roleFilter === "HOD"
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "text-slate-500 hover:text-purple-700"
                }`}
              >
                HODs
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("FACULTY")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  roleFilter === "FACULTY"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-500 hover:text-emerald-700"
                }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("STUDENT")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  roleFilter === "STUDENT"
                    ? "bg-cyan-600 text-white shadow-2xs"
                    : "text-slate-500 hover:text-cyan-700"
                }`}
              >
                Students
              </button>
            </div>
          )}

          {callerRole === "HOD" && (
            <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setRoleFilter("ALL")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  roleFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All Department
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("FACULTY")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  roleFilter === "FACULTY"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-500 hover:text-emerald-700"
                }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("STUDENT")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  roleFilter === "STUDENT"
                    ? "bg-cyan-600 text-white shadow-2xs"
                    : "text-slate-500 hover:text-cyan-700"
                }`}
              >
                Students
              </button>
            </div>
          )}
        </div>
      </div>

      {/* List / Table of Activities */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/30">
        {filteredActivities.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Clock className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No session activity found</p>
            <p className="text-[11px] text-slate-400">
              Try adjusting your search criteria or filter options above.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Role / Department</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Exact Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90 bg-white font-medium">
                  {filteredActivities.map((log) => {
                    const roleConfig = getRoleBadge(log.role);
                    const RoleIcon = roleConfig.icon;
                    const actionConfig = getActionBadge(log.action);
                    const ActionIcon = actionConfig.icon;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Action Pill */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${actionConfig.className}`}
                          >
                            <ActionIcon className={`h-3 w-3 ${actionConfig.iconClass} shrink-0`} />
                            <span>{actionConfig.label}</span>
                          </span>
                        </td>

                        {/* User Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                              {log.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">
                                {log.fullName}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 font-mono">
                                <span className="font-bold text-slate-600">{log.identifier}</span>
                                <span>•</span>
                                <span className="truncate max-w-[160px]">{log.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Department */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleConfig.className}`}
                            >
                              <RoleIcon className="h-3 w-3" />
                              <span>{roleConfig.label}</span>
                            </span>
                            <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                              {log.departmentName}
                            </p>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{log.formattedDate}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {log.relativeTime}
                          </span>
                        </td>

                        {/* Exact Time */}
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 font-mono font-bold text-xs">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span>{log.formattedTime}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Native Card View (visible below sm breakpoint) */}
            <div className="sm:hidden divide-y divide-slate-100 bg-white">
              {filteredActivities.map((log) => {
                const roleConfig = getRoleBadge(log.role);
                const RoleIcon = roleConfig.icon;
                const actionConfig = getActionBadge(log.action);
                const ActionIcon = actionConfig.icon;

                return (
                  <div key={log.id} className="p-3.5 space-y-2.5">
                    {/* Top Row: Action Pill + Time Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${actionConfig.className}`}
                      >
                        <ActionIcon className={`h-3 w-3 ${actionConfig.iconClass} shrink-0`} />
                        <span>{actionConfig.label}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono font-bold text-[11px]">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{log.formattedTime}</span>
                      </span>
                    </div>

                    {/* Middle Row: User Details */}
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                        {log.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-xs truncate">
                          {log.fullName}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono truncate">
                          <span className="font-bold text-slate-700">{log.identifier}</span>
                          <span>•</span>
                          <span className="truncate">{log.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Role & Department + Date */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${roleConfig.className}`}
                        >
                          <RoleIcon className="h-2.5 w-2.5" />
                          <span>{roleConfig.label}</span>
                        </span>
                        <span className="text-slate-500 text-[10px] truncate max-w-[140px]">
                          {log.departmentName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium shrink-0">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{log.formattedDate}</span>
                        <span className="text-emerald-700 font-bold">({log.relativeTime})</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
