import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { StatCards, StatItem } from "@/components/dashboard/StatCards";
import {
  DepartmentDistributionChart,
  DepartmentMetric,
} from "@/components/charts/DepartmentDistributionChart";
import { CategoryPieChart, CategoryMetric } from "@/components/charts/CategoryPieChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/formatters";
import { getSessionActivityLogsAction } from "@/actions/sessionActivity";
import { SessionActivityFeed } from "@/components/dashboard/SessionActivityFeed";
import {
  Building2,
  Users,
  Award,
  FileCheck2,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  FolderTree,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const sessionActivities = await getSessionActivityLogsAction({ limit: 30 });

  const collegeId = user?.profile.college_id;
  const college = db.colleges.find((c) => c.id === collegeId);

  const totalStudents = db.students.filter((s) => s.college_id === collegeId).length;
  const totalFaculty = db.faculty.filter((f) => f.college_id === collegeId).length;
  const allCerts = db.certificates.filter((c) => c.college_id === collegeId);
  const approvedCerts = allCerts.filter((c) => c.status === "APPROVED");
  const pendingCerts = allCerts.filter(
    (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW"
  );

  const totalPoints = db.pointRecords
    .filter((p) => p.is_latest)
    .reduce((sum, p) => sum + p.points, 0);

  const stats: StatItem[] = [
    {
      title: "Enrolled Students",
      value: totalStudents,
      description: "Across all academic departments",
      iconName: "award",
      variant: "primary",
    },
    {
      title: "Faculty Evaluators",
      value: totalFaculty,
      description: "Department review coordinators",
      iconName: "trending",
      variant: "indigo",
    },
    {
      title: "Certified Achievements",
      value: approvedCerts.length,
      description: "Verified institutional credentials",
      iconName: "check",
      variant: "emerald",
    },
    {
      title: "Institutional Credits",
      value: `${totalPoints} PTS`,
      description: "Points awarded college-wide",
      iconName: "award",
      variant: "amber",
    },
  ];

  // Department distribution data for bar chart
  const deptData: DepartmentMetric[] = db.departments
    .filter((d) => d.college_id === collegeId)
    .map((d) => {
      const studentIds = new Set(
        db.students.filter((s) => s.department_id === d.id).map((s) => s.id)
      );
      const approved = allCerts.filter(
        (c) => studentIds.has(c.student_id) && c.status === "APPROVED"
      ).length;
      const underReview = allCerts.filter(
        (c) =>
          studentIds.has(c.student_id) &&
          (c.status === "SUBMITTED" || c.status === "UNDER_REVIEW")
      ).length;
      const deptPoints = db.pointRecords
        .filter((p) => studentIds.has(p.student_id) && p.is_latest)
        .reduce((sum, p) => sum + p.points, 0);

      return {
        department: `${d.code}${d.type === "PG" ? " (PG)" : ""}`,
        approved,
        underReview,
        totalPoints: deptPoints,
      };
    });

  // Category data for pie chart
  const categoryCounts: Record<string, number> = {};
  allCerts.forEach((c) => {
    const cat = db.categories.find((cat) => cat.id === c.category_id)?.name || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categoryData: CategoryMetric[] = Object.entries(categoryCounts).map(
    ([name, value]) => ({ name, value })
  );

  // Recent system audit events
  const recentAudit = db.auditLogs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      {/* Admin Executive Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 sm:p-7 lg:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-200 shrink-0" />
                <span>Apex Institutional Dean & Admin</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-blue-100 text-[11px] font-medium backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>Active Portal</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
              <div className="h-14 w-28 sm:h-16 sm:w-32 rounded-2xl bg-white p-1.5 shadow-sm border border-white/20 shrink-0 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/nec-logo.png"
                  alt="Nandha Engineering College Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Nandha Engineering College (NEC)
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl leading-relaxed">
                  Institutional Credential & Achievement Management System • Dean & Administrator Dashboard
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 pt-0.5 text-xs text-blue-100">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold">{user?.profile.full_name}</span>
                <span className="text-blue-700 font-semibold text-[11px] bg-white px-2 py-0.5 rounded shadow-xs">
                  Institutional Dean
                </span>
              </div>
              <span className="hidden sm:inline text-blue-200">•</span>
              <span className="text-blue-100 text-[11px] truncate max-w-full">
                {user?.profile.email}
              </span>
            </div>
          </div>

          {/* Executive Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto shrink-0">
            <Link href="/admin/departments" className="w-full sm:w-auto flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full border-white/30 bg-white/10 hover:bg-white/20 text-white text-xs font-bold h-11 sm:h-10 px-3.5 shadow-sm flex items-center justify-center gap-1.5 rounded-xl whitespace-nowrap backdrop-blur-md">
                <Building2 className="h-4 w-4 text-white shrink-0" />
                <span>Branches</span>
              </Button>
            </Link>
            <Link href="/admin/reports" className="w-full sm:w-auto flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full border-white/30 bg-white/10 hover:bg-white/20 text-white text-xs font-bold h-11 sm:h-10 px-3.5 shadow-sm flex items-center justify-center gap-1.5 rounded-xl whitespace-nowrap backdrop-blur-md">
                <FileSpreadsheet className="h-4 w-4 text-white shrink-0" />
                <span>Reports CSV</span>
              </Button>
            </Link>
            <Link href="/admin/settings" className="w-full sm:w-auto flex-1 sm:flex-initial">
              <Button className="w-full bg-white hover:bg-slate-50 text-blue-700 text-xs font-bold h-11 sm:h-10 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                <Settings className="h-4 w-4 shrink-0" />
                <span>Settings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Institutional Accreditation Readiness KPI Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm min-w-0">
            <span className="text-[10px] uppercase font-semibold text-blue-100 block truncate">NAAC Criteria 5</span>
            <span className="text-white font-bold text-xs sm:text-sm flex items-center gap-1 mt-0.5 truncate">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
              <span className="truncate">100% Export Ready</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm min-w-0">
            <span className="text-[10px] uppercase font-semibold text-blue-100 block truncate">NBA Tier-1 Status</span>
            <span className="text-white font-bold text-xs sm:text-sm flex items-center gap-1 mt-0.5 truncate">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              <span className="truncate">Outcome Verified</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm min-w-0">
            <span className="text-[10px] uppercase font-semibold text-blue-100 block truncate">SHA-256 Duplicates</span>
            <span className="text-white font-bold text-xs sm:text-sm flex items-center gap-1 mt-0.5 truncate">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
              <span className="truncate">Zero Conflicts</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm min-w-0">
            <span className="text-[10px] uppercase font-semibold text-blue-100 block truncate">Verification Velocity</span>
            <span className="text-white font-bold text-xs sm:text-sm flex items-center gap-1 mt-0.5 truncate">
              <Award className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              <span className="truncate">Active Evaluated</span>
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Scorecard */}
      <StatCards stats={stats} />

      {/* Executive Quick Launchpad */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              NEC Administrative Command Deck
            </h3>
            <p className="text-xs text-slate-500">
              Direct access to departmental configurations, reviewer queues, and reports
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all duration-200 group block shadow-xs"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-blue-100">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              User & Faculty Registry
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Manage student registries, assign department faculty reviewers, and manage permissions.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600">
              <span>Inspect users</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/departments"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all duration-200 group block shadow-xs"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-indigo-100">
              <Building2 className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Department Governance
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Oversee departmental isolation, point caps, reviewer lock timeouts, and HOD assignments.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600">
              <span>Departments</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all duration-200 group block shadow-xs"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-emerald-100">
              <FolderTree className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Achievement Categories
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Configure co-curricular classifications: Hackathons, Research, Technical, Sports, and Arts.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span>Classifications</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-200 group block shadow-xs"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-amber-100">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Accreditation Reports
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              1-click export of verified student records formatted for NAAC Criteria 5 & NBA accreditation.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-600">
              <span>Export CSV</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentDistributionChart
          data={deptData}
          title="Institutional Achievements by Department"
          subtitle="Comparison of approved credentials, reviews, and points awarded"
        />

        <CategoryPieChart
          data={categoryData}
          title="College Category Distribution"
          subtitle="Proportion of credentials across co-curricular classifications"
        />
      </div>

      {/* Audit Logs & College Settings Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 border-slate-200 bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Immutable Ledger Audit Trail
              </h3>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Full audit log</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentAudit.map((log) => {
              const actor = db.profiles.find((p) => p.id === log.actor_id);
              const actionColors: Record<string, string> = {
                LOGIN: "bg-blue-50 text-blue-700 border-blue-200",
                CERTIFICATE_APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                POINTS_AWARDED: "bg-amber-50 text-amber-700 border-amber-200",
                CERTIFICATE_SUBMITTED: "bg-indigo-50 text-indigo-700 border-indigo-200",
                CORRECTION_REQUESTED: "bg-rose-50 text-rose-700 border-rose-200",
              };
              const badgeStyle = actionColors[log.action] || "bg-slate-50 text-slate-700 border-slate-200";

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                      {log.action}
                    </span>
                    <div>
                      <span className="text-slate-900 font-semibold">
                        {actor?.full_name || "System"}
                      </span>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Entity: <span className="text-blue-600">{log.entity_type}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Institution Highlights Card */}
        <Card className="p-5 border-slate-200 bg-white rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                NEC Governance
              </h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Institution</span>
                <span className="font-bold text-slate-900 text-sm">Nandha Engineering College</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Erode, TN • Autonomous</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Policy Max Points / Cert</span>
                <span className="font-bold text-blue-700 text-sm font-mono">100 Points Cap</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Enforces NAAC criteria distribution caps</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Review Lock Timeout</span>
                <span className="font-bold text-blue-700 text-sm font-mono">30 Minutes</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Auto-reclaims idle locks to review queue</p>
              </div>
            </div>
          </div>

          <Link href="/admin/settings" className="block w-full">
            <Button variant="outline" className="w-full text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl h-10 shadow-xs">
              <Settings className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
              Configure College Policy
            </Button>
          </Link>
        </Card>
      </div>

      {/* Institutional Session Activity Monitor for HOD, Faculty & Students */}
      <SessionActivityFeed
        initialActivities={sessionActivities}
        callerRole="ADMIN"
        title="Apex Institutional Session & Password Monitor (HOD, Faculty & Students)"
        subtitle="Complete institutional oversight of all Department Heads (HODs), Faculty members, and Students logging in, logging out, and resetting passwords with exact date and time."
      />
    </div>
  );
}
