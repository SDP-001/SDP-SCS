"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toggleUserStatusAction } from "@/actions/admin";
import {
  Search,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Users,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export interface StudentTableItem {
  id: string;
  register_number: string;
  academic_year: number;
  department_id: string;
  approvedCount: number;
  pendingCount?: number;
  totalPoints: number;
  profile?: {
    id: string;
    full_name: string;
    email: string;
    is_active: boolean;
    role: string;
  } | null;
}

interface DepartmentStudentsTableProps {
  initialStudents: StudentTableItem[];
  callerRole: "FACULTY" | "HOD";
  departmentName?: string;
}

export function DepartmentStudentsTable({
  initialStudents,
  callerRole,
  departmentName = "Department",
}: DepartmentStudentsTableProps) {
  const [students, setStudents] = useState<StudentTableItem[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleToggle = async (profileId: string, name: string) => {
    setTogglingId(profileId);
    setNotice(null);
    setErrorNotice(null);

    try {
      const res = await toggleUserStatusAction(profileId);
      if (res.success) {
        setStudents((prev) =>
          prev.map((s) => {
            if (s.profile?.id === profileId) {
              return {
                ...s,
                profile: {
                  ...s.profile,
                  is_active: res.isActive ?? !s.profile.is_active,
                },
              };
            }
            return s;
          })
        );
        setNotice(
          res.isActive
            ? `Student account for ${name} is now ACTIVE and can sign in.`
            : `Student account for ${name} is now DISABLED and blocked from signing in.`
        );
      } else {
        setErrorNotice(res.error || "Failed to update student account status.");
      }
    } catch (err: any) {
      setErrorNotice(err?.message || "An unexpected error occurred.");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase().trim();
    const nameMatch = s.profile?.full_name?.toLowerCase().includes(q);
    const regMatch = s.register_number?.toLowerCase().includes(q);
    const emailMatch = s.profile?.email?.toLowerCase().includes(q);
    const matchesSearch = !q || nameMatch || regMatch || emailMatch;

    const isActive = s.profile?.is_active ?? true;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && isActive) ||
      (statusFilter === "DISABLED" && !isActive);

    const matchesYear =
      yearFilter === "ALL" || s.academic_year.toString() === yearFilter;

    return matchesSearch && matchesStatus && matchesYear;
  });

  const activeCount = students.filter((s) => s.profile?.is_active).length;
  const disabledCount = students.length - activeCount;

  return (
    <div className="space-y-4">
      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorNotice(null)}
            className="text-rose-700 hover:text-rose-900 text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Role Authority Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="font-bold text-slate-800">
              {callerRole === "FACULTY"
                ? `Faculty Account Management (${departmentName})`
                : `HOD Department Authority (${departmentName})`}
            </p>
            <p className="text-[11px] text-slate-500">
              {callerRole === "FACULTY"
                ? "You have direct authority to disable or activate student accounts within your department."
                : "You have authority to disable or activate both student accounts and faculty members in your department."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-700 border border-emerald-200 shadow-2xs">
            {activeCount} Active Students
          </span>
          {disabledCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-rose-700 border border-rose-200 shadow-2xs">
              {disabledCount} Disabled
            </span>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search student by name, register number (e.g. 732226CS...), or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs bg-white border-slate-200 rounded-xl shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status Filter */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("DISABLED")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === "DISABLED"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Disabled ({disabledCount})
            </button>
          </div>

          {/* Academic Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="h-10 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>
      </div>

      {/* Main Student Roster Table */}
      <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Register Number</th>
                <th className="py-3.5 px-4">Year</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Achievements</th>
                <th className="py-3.5 px-4">Points</th>
                <th className="py-3.5 px-4 text-right">Account Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-700">No matching students found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {search ? `No students matched "${search}"` : "No student records enrolled."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isActive = student.profile?.is_active ?? true;
                  const profileId = student.profile?.id;
                  const isProcessing = togglingId === profileId;

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !isActive ? "bg-rose-50/30" : ""
                      }`}
                    >
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isActive
                                ? "bg-blue-100 text-blue-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {student.profile?.full_name?.charAt(0) || "S"}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`font-bold truncate ${
                                isActive ? "text-slate-900" : "text-rose-950 line-through"
                              }`}
                            >
                              {student.profile?.full_name || "Student"}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {student.profile?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Register Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {student.register_number}
                      </td>

                      {/* Academic Year */}
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">
                        Year {student.academic_year}
                      </td>

                      {/* Account Status Badge */}
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="h-3 w-3 text-rose-600" /> Disabled
                          </span>
                        )}
                      </td>

                      {/* Approved Achievements */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{student.approvedCount} Approved</span>
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-emerald-700 text-sm">
                          +{student.totalPoints} PTS
                        </span>
                      </td>

                      {/* Action Button: Disable / Activate */}
                      <td className="py-3.5 px-4 text-right">
                        {profileId ? (
                          <Button
                            size="sm"
                            variant={isActive ? "outline" : "default"}
                            onClick={() =>
                              handleToggle(profileId, student.profile?.full_name || "Student")
                            }
                            disabled={isProcessing}
                            className={`text-xs h-8 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                              isActive
                                ? "text-rose-600 hover:bg-rose-50 hover:border-rose-300 border-rose-200"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                            }`}
                          >
                            {isProcessing ? (
                              "Processing..."
                            ) : isActive ? (
                              <span className="flex items-center gap-1">
                                <XCircle className="h-3.5 w-3.5" /> Disable Account
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Activate Account
                              </span>
                            )}
                          </Button>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

