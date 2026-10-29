"use client";

import React, { useState, useEffect } from "react";
import {
  getAdminUsersAction,
  toggleUserStatusAction,
  getDepartmentListAction,
} from "@/actions/admin";
import { AddFacultyModal } from "@/components/faculty/AddFacultyModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Award,
  Lock,
  FileSpreadsheet,
  Download,
  Sparkles,
  FileCheck2,
  UserCheck,
  Activity,
} from "lucide-react";
import {
  downloadSampleFacultyDatabase,
} from "@/lib/utils/facultyDatabase";
import { SessionActivityFeed } from "@/components/dashboard/SessionActivityFeed";
import {
  getSessionActivityLogsAction,
  SessionActivityItem,
} from "@/actions/sessionActivity";

export default function HODFacultyPage() {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [department, setDepartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"LIST" | "EXCEL" | "SESSIONS">("LIST");
  const [facultyActivities, setFacultyActivities] = useState<SessionActivityItem[]>([]);

  const loadData = async () => {
    try {
      const res = await getAdminUsersAction();
      // Current user is HOD, find their department or list
      setFaculty(res.faculty);
      if (res.faculty.length > 0) {
        setDepartment(res.faculty[0].department);
      }

      // Load faculty session activity logs
      const actRes = await getSessionActivityLogsAction({ roleFilter: "FACULTY", limit: 50 });
      setFacultyActivities(actRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (profileId: string, name: string) => {
    setTogglingId(profileId);
    setNotice(null);
    try {
      const res = await toggleUserStatusAction(profileId);
      if (res.success) {
        setNotice(
          res.isActive
            ? `Account for ${name} is now Active.`
            : `Security Notice: ${name} deactivated. Active certificate reviews were safely returned to department queue.`
        );
        await loadData();
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update faculty status");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredFaculty = faculty.filter((f) => {
    return (
      f.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      f.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      f.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.department?.code?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const activeCount = faculty.filter((f) => f.profile?.is_active).length;
  const inReviewCount = faculty.reduce((acc, f) => acc + (f.activeLockCount || 0), 0);
  const totalReviews = faculty.reduce((acc, f) => acc + (f.reviewCount || 0), 0);

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-flex text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 tracking-wider shrink-0">
              HOD Portal
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Department Faculty Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authorized faculty evaluators, review workload, and batch enroll via Excel spreadsheet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <AddFacultyModal
            defaultDepartmentId={department?.id}
            defaultDepartmentName={department?.name}
            buttonLabel="Add Faculty (Manual)"
            defaultTab="MANUAL"
            allowHODRole={false}
            enforcedRole="FACULTY"
            className="w-full sm:w-auto justify-center"
          />
          <AddFacultyModal
            defaultDepartmentId={department?.id}
            defaultDepartmentName={department?.name}
            buttonLabel="Add Faculty with Excel"
            defaultTab="EXCEL"
            allowHODRole={false}
            enforcedRole="FACULTY"
            buttonVariant="banner"
            className="w-full sm:w-auto justify-center"
          />
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Users className="h-4 w-4 text-indigo-600" />
            <span>Total Faculty</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{faculty.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <span>Active Reviewers</span>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Lock className="h-4 w-4 text-amber-600" />
            <span>Under Review</span>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-1">{inReviewCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <FileCheck2 className="h-4 w-4 text-sky-600" />
            <span>Completed Reviews</span>
          </div>
          <p className="text-2xl font-black text-sky-700 mt-1">{totalReviews}</p>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-semibold">{notice}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs overflow-x-auto scrollbar-none max-w-full">
        <button
          onClick={() => setActiveTab("LIST")}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === "LIST"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Faculty Directory ({faculty.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("EXCEL")}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === "EXCEL"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Excel Sheet Operations</span>
        </button>

        <button
          onClick={() => setActiveTab("SESSIONS")}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === "SESSIONS"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Faculty Sessions & Activity ({facultyActivities.length})</span>
        </button>
      </div>

      {/* TAB 1: FACULTY DIRECTORY (LIST) */}
      {activeTab === "LIST" && (
        <div className="space-y-4">
          {/* Search & Filter Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1 sm:max-w-md">
              <Input
                type="text"
                placeholder="Search faculty name, employee ID, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 text-xs bg-slate-50 border-slate-200 h-9"
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500">
              <span className="font-semibold">
                Showing <strong className="text-slate-800">{filteredFaculty.length}</strong> of{" "}
                <strong className="text-slate-800">{faculty.length}</strong>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("EXCEL")}
                className="h-8 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                <span>Bulk Excel</span>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-200/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-white space-y-3">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800">No faculty members found</p>
                <p className="text-xs text-slate-500 mt-1">
                  {search
                    ? `No results matching "${search}". Try a different keyword.`
                    : "No faculty records enrolled yet in this department."}
                </p>
              </div>
              {search ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch("")}
                  className="text-xs"
                >
                  Clear Search Filter
                </Button>
              ) : (
                <div className="flex justify-center gap-2 pt-2">
                  <AddFacultyModal
                    defaultDepartmentId={department?.id}
                    defaultDepartmentName={department?.name}
                    buttonLabel="Add Faculty Member"
                    allowHODRole={false}
                    enforcedRole="FACULTY"
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View (Tablet & Up) */}
              <div className="hidden md:block overflow-hidden border border-slate-200 rounded-xl bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Faculty Member</th>
                        <th className="py-3.5 px-4">Employee ID</th>
                        <th className="py-3.5 px-4">Designation & Role</th>
                        <th className="py-3.5 px-4">Department</th>
                        <th className="py-3.5 px-4">Review Workload</th>
                        <th className="py-3.5 px-4">Account Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredFaculty.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{f.profile?.full_name}</p>
                            <p className="text-[11px] text-slate-400">{f.profile?.email}</p>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                            {f.employee_id}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">{f.designation}</span>
                              {f.is_hod && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                  HOD
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-700">{f.department?.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {f.department?.code} • {f.department?.type || "UG"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-700">
                                {f.reviewCount} total reviews
                              </span>
                              {f.activeLockCount > 0 && (
                                <p className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                                  <Lock className="h-3 w-3" /> {f.activeLockCount} active lock
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {f.profile?.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="h-3 w-3" /> Disabled
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {f.is_hod ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                Department Head (Self)
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant={f.profile?.is_active ? "outline" : "default"}
                                onClick={() =>
                                  handleToggle(f.profile?.id, f.profile?.full_name || "Faculty")
                                }
                                disabled={togglingId === f.profile?.id}
                                className={`text-xs h-8 ${
                                  f.profile?.is_active
                                    ? "text-rose-600 hover:bg-rose-50 border-rose-200"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                }`}
                              >
                                {togglingId === f.profile?.id
                                  ? "Processing..."
                                  : f.profile?.is_active
                                  ? "Disable"
                                  : "Activate"}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View (Phone Screens - No Horizontal Clipped Tables) */}
              <div className="block md:hidden space-y-3">
                {filteredFaculty.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm">{f.profile?.full_name}</p>
                          {f.is_hod && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              HOD
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{f.profile?.email}</p>
                      </div>

                      {f.profile?.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                          <XCircle className="h-3 w-3" /> Disabled
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Employee ID
                        </span>
                        <span className="font-mono font-bold text-slate-800">{f.employee_id}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Designation
                        </span>
                        <span className="font-medium text-slate-700 truncate block">
                          {f.designation}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Department
                        </span>
                        <span className="font-medium text-slate-700">
                          {f.department?.code || department?.code || "ENGG"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Review Workload
                        </span>
                        <span className="font-medium text-slate-700">
                          {f.reviewCount || 0} reviews
                          {f.activeLockCount > 0 && (
                            <span className="text-amber-600 font-bold ml-1">
                              ({f.activeLockCount} lock)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      {f.is_hod ? (
                        <div className="text-center py-1">
                          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                            Department Head (Self)
                          </span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant={f.profile?.is_active ? "outline" : "default"}
                          onClick={() =>
                            handleToggle(f.profile?.id, f.profile?.full_name || "Faculty")
                          }
                          disabled={togglingId === f.profile?.id}
                          className={`w-full text-xs h-8.5 font-bold ${
                            f.profile?.is_active
                              ? "text-rose-600 hover:bg-rose-50 border-rose-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {togglingId === f.profile?.id
                            ? "Processing..."
                            : f.profile?.is_active
                            ? "Disable Account"
                            : "Activate Account"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: EXCEL SPREADSHEET OPERATIONS HUB */}
      {activeTab === "EXCEL" && (
        <div className="space-y-4">
          {/* Main Excel Engine Hero Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 mt-0.5">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Excel Spreadsheet Faculty Enrollment Engine
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Bulk import and manage faculty members via spreadsheet (.xlsx, .xls, .csv). If the uploaded sheet contains no data, standard template records will automatically be populated:{" "}
                    <em className="text-emerald-300 font-semibold not-italic">it&apos;s OK, ready to submit!</em>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Clean full-width stack on mobile, horizontal row on desktop */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadSampleFacultyDatabase("xlsx", "FACULTY")}
                  className="h-10 text-xs font-bold bg-slate-800/80 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 w-full sm:w-auto justify-center"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                  <span>Download Template (.xlsx)</span>
                </Button>

                <AddFacultyModal
                  defaultDepartmentId={department?.id}
                  defaultDepartmentName={department?.name}
                  buttonLabel="Upload Excel Sheet (OK to Submit)"
                  defaultTab="EXCEL"
                  allowHODRole={false}
                  enforcedRole="FACULTY"
                  buttonVariant="banner"
                  className="w-full sm:w-auto justify-center"
                />
              </div>
            </div>
          </div>

          {/* Quick Guidance & Directory Shortcut */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Current Faculty Evaluators in Directory
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Currently managing <strong>{faculty.length}</strong> active &amp; registered faculty members.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("LIST")}
              className="text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 border-slate-300 self-start sm:self-auto"
            >
              <span>View Faculty Directory ({faculty.length}) →</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: SESSIONS FEED */}
      {activeTab === "SESSIONS" && (
        <SessionActivityFeed
          initialActivities={facultyActivities}
          callerRole="HOD"
          title="Department Faculty Session & Password Tracking"
          subtitle="Real-time chronological log of faculty evaluators logging into, out of the portal, and resetting passwords with exact time and date."
        />
      )}
    </div>
  );
}
