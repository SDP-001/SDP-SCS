import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { StatCards, StatItem } from "@/components/dashboard/StatCards";
import { CategoryPieChart, CategoryMetric } from "@/components/charts/CategoryPieChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessionActivityLogsAction } from "@/actions/sessionActivity";
import { SessionActivityFeed } from "@/components/dashboard/SessionActivityFeed";
import {
  Building2,
  FileCheck2,
  Users,
  Award,
  FileSpreadsheet,
  BarChart3,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default async function HODDashboardPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const sessionActivities = await getSessionActivityLogsAction({ limit: 25 });

  const deptId = user?.faculty?.department_id;
  const deptStudentIds = new Set(
    db.students.filter((s) => s.department_id === deptId).map((s) => s.id)
  );

  const deptFaculty = db.faculty.filter((f) => f.department_id === deptId);
  const deptCertificates = db.certificates.filter((c) => deptStudentIds.has(c.student_id));
  const approved = deptCertificates.filter((c) => c.status === "APPROVED");
  const inQueue = deptCertificates.filter(
    (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW"
  );

  const totalPoints = db.pointRecords
    .filter((p) => deptStudentIds.has(p.student_id) && p.is_latest)
    .reduce((sum, p) => sum + p.points, 0);

  const stats: StatItem[] = [
    {
      title: "Department Points",
      value: `${totalPoints} PTS`,
      description: "Verified co-curricular points",
      iconName: "award",
      variant: "amber",
    },
    {
      title: "Approved Records",
      value: approved.length,
      description: "Officially certified",
      iconName: "check",
      variant: "emerald",
    },
    {
      title: "Queue Pending",
      value: inQueue.length,
      description: "Awaiting faculty evaluation",
      iconName: "clock",
      variant: "primary",
    },
    {
      title: "Faculty Evaluators",
      value: deptFaculty.length,
      description: "Assigned departmental reviewers",
      iconName: "trending",
      variant: "indigo",
    },
  ];

  // Category breakdown for chart
  const categoryCounts: Record<string, number> = {};
  deptCertificates.forEach((c) => {
    const cat = db.categories.find((cat) => cat.id === c.category_id)?.name || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryData: CategoryMetric[] = Object.entries(categoryCounts).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="space-y-8 pb-28 md:pb-8">
      {/* Top Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
                <Building2 className="h-3.5 w-3.5 text-blue-200" />
                <span>{user?.faculty?.department?.code} Department Head</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 text-blue-100 text-[11px] font-medium backdrop-blur-md">
                Administrative Overview
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {user?.profile.full_name}
            </h2>
            <p className="text-xs text-blue-100 mt-1.5">
              Head of Department — <span className="text-white font-bold">{user?.faculty?.department?.name}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Link href="/hod/reports" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-white/30 bg-white/10 hover:bg-white/20 text-white text-xs font-bold h-11 px-4 shadow-sm flex items-center justify-center rounded-xl backdrop-blur-md">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-white" />
                <span>Ledger Export</span>
              </Button>
            </Link>
            <Link href="/faculty/reviews" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-blue-700 text-xs font-bold h-11 px-5 shadow-sm flex items-center justify-center rounded-xl transition-all">
                <FileCheck2 className="h-4 w-4 mr-2 text-blue-600" />
                <span>Review Workbench ({inQueue.length})</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <StatCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Category Breakdown */}
        <CategoryPieChart
          data={categoryData}
          title="Department Achievement Categories"
          subtitle="Distribution of student achievements across co-curricular categories"
        />

        {/* Quick Nav & Department Faculty */}
        <div className="space-y-4">
          <Card className="p-5 border-slate-200 bg-white shadow-xs rounded-2xl">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Department Faculty Evaluators</span>
              <span className="text-blue-600 font-semibold">{deptFaculty.length} Faculty</span>
            </h3>
            <div className="space-y-2">
              {deptFaculty.map((f) => {
                const profile = db.profiles.find((p) => p.id === f.profile_id);
                return (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{profile?.full_name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {f.designation} • ID: <span className="text-slate-700 font-mono font-semibold">{f.employee_id}</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 border-slate-200 bg-white shadow-xs rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Reports & Institutional Accreditations
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Export NAAC / NBA ready verified achievement ledgers for criteria 3.3 and 5.3 audits.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/hod/reports" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-10 rounded-xl shadow-xs transition-colors">
                  Generate Department Ledger CSV →
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Department Student & Faculty Session Activity Feed */}
      <SessionActivityFeed
        initialActivities={sessionActivities}
        callerRole="HOD"
        title="Department Session & Password Tracker (Students & Faculty Activity)"
        subtitle="Chronological monitoring of all enrolled students and faculty members in your department logging in, logging out, and resetting passwords with date, time, and credentials."
      />
    </div>
  );
}
