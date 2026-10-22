import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { StatCards, StatItem } from "@/components/dashboard/StatCards";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { ActivityFeed, ActivityItem } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/button";
import { UploadCloud, ArrowRight, Award, Sparkles } from "lucide-react";
import { DigitalPassportTrigger } from "@/components/student/DigitalPassportTrigger";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const studentId = user?.student?.id;
  const certificates = db.certificates
    .filter((c) => c.student_id === studentId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const approved = certificates.filter((c) => c.status === "APPROVED");
  const underReview = certificates.filter((c) => c.status === "UNDER_REVIEW" || c.status === "SUBMITTED");
  const corrections = certificates.filter((c) => c.status === "CORRECTION_REQUIRED");

  // Sum total points
  const studentPoints = db.pointRecords
    .filter((p) => p.student_id === studentId)
    .reduce((sum, p) => sum + p.points, 0);

  const stats: StatItem[] = [
    {
      title: "Co-Curricular Points",
      value: `${studentPoints} PTS`,
      description: "Human-verified by faculty",
      iconName: "award",
      variant: "amber",
    },
    {
      title: "Approved Achievements",
      value: approved.length,
      description: "Official institutional records",
      iconName: "check",
      variant: "emerald",
    },
    {
      title: "In Review Queue",
      value: underReview.length,
      description: "Pending faculty evaluation",
      iconName: "clock",
      variant: "primary",
    },
    {
      title: "Action Required",
      value: corrections.length,
      description: "Revision requested by faculty",
      iconName: "alert",
      variant: "rose",
    },
  ];

  // Activities for this student
  const studentNotifications = db.notifications
    .filter((n) => n.user_id === user?.profile.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const activities: ActivityItem[] = studentNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.message,
    timestamp: n.created_at,
    type: n.type.includes("APPROVED")
      ? "approval"
      : n.type.includes("CORRECTION")
      ? "correction"
      : "submission",
    link: n.entity_id ? `/student/certificates/${n.entity_id}` : undefined,
  }));

  // Map certificates with category, files, points
  const recentCerts = certificates.slice(0, 4).map((c) => ({
    ...c,
    category: db.categories.find((cat) => cat.id === c.category_id),
    files: db.certificateFiles.filter((f) => f.certificate_id === c.id),
    points: db.pointRecords.filter((p) => p.certificate_id === c.id),
  }));

  return (
    <div className="space-y-8 pb-28 md:pb-8">
      {/* Top Cyber Telemetry Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a0e1a] via-[#0f172a] to-[#0a0e1a] text-white p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.12)] cyber-hud-corner">
        {/* Ambient Neon Halos */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-halo" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-float-gentle" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span>STUDENT_TELEMETRY // VERIFIED</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-900/90 text-slate-300 text-[11px] font-mono border border-slate-700/80">
                Year {user?.student?.academic_year || 3} • {user?.student?.department?.code || "CSE"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300">{user?.profile.full_name}</span>
            </h2>
            <div className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono">
              <span className="text-slate-300">Nandha Engineering College (Autonomous)</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span>
                Register ID:{" "}
                <span className="font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {user?.student?.register_number}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <DigitalPassportTrigger variant="dashboard" label="Digital Passport" />
            <Link href="/student/submit" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold h-11 px-5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                <UploadCloud className="h-4 w-4 mr-2" />
                <span>Submit Certificate</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Scorecard */}
      <StatCards stats={stats} />

      {/* Main Grid: Recent Submissions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Recent Submissions</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  {certificates.length} Total
                </span>
              </h3>
              <p className="text-xs text-slate-400">Live ledger status of submitted credentials</p>
            </div>
            <Link
              href="/student/certificates"
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>View ledger ({certificates.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentCerts.length === 0 ? (
            <div className="p-10 text-center bg-[#0d1322]/85 rounded-2xl border border-slate-800/80 shadow-xl">
              <UploadCloud className="h-12 w-12 text-cyan-500/40 mx-auto mb-3 animate-bounce" />
              <p className="text-sm font-bold text-white">No certificates registered in ledger</p>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                Submit your first verified activity certificate for evaluation and institutional credit.
              </p>
              <Link href="/student/submit">
                <Button className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-xs text-white font-bold h-10 px-5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  Submit Now →
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentCerts.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} />
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}
