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
    files: db.certificateFiles
      .filter((f) => f.certificate_id === c.id)
      .sort((a, b) => {
        if (a.file_type === "PRIMARY" && b.file_type !== "PRIMARY") return -1;
        if (b.file_type === "PRIMARY" && a.file_type !== "PRIMARY") return 1;
        return b.version - a.version;
      }),
    points: db.pointRecords.filter((p) => p.certificate_id === c.id),
  }));

  return (
    <div className="space-y-8 pb-28 md:pb-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md border border-white/20">
                <Sparkles className="h-3.5 w-3.5 text-blue-200" />
                <span>Student Portal</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-[11px] font-medium border border-white/15">
                Year {user?.student?.academic_year || 3} • {user?.student?.department?.code || "CSE"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome, {user?.profile.full_name}
            </h2>
            <div className="text-xs text-blue-100 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-medium">
              <span>Nandha Engineering College (Autonomous)</span>
              <span className="hidden sm:inline text-blue-200">•</span>
              <span>
                Register No:{" "}
                <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">
                  {user?.student?.register_number}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <DigitalPassportTrigger variant="dashboard" label="Digital Passport" />
            <Link href="/student/submit" prefetch={true} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs h-11 px-5 rounded-xl shadow-xs flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                <UploadCloud className="h-4 w-4 mr-2 text-blue-600" />
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
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Recent Submissions</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {certificates.length} Total
                </span>
              </h3>
              <p className="text-xs text-slate-500">Status of your submitted certificates and points</p>
            </div>
            <Link
              href="/student/certificates"
              prefetch={true}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
            >
              <span>View all ({certificates.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentCerts.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/90 shadow-xs">
              <UploadCloud className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-900">No certificates submitted yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Submit your first certificate for faculty evaluation and points.
              </p>
              <Link href="/student/submit" prefetch={true}>
                <Button className="text-xs text-white font-medium h-10 px-5 rounded-xl">
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
