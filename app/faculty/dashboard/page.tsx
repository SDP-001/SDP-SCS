import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { StatCards, StatItem } from "@/components/dashboard/StatCards";
import { ActivityFeed, ActivityItem } from "@/components/dashboard/ActivityFeed";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/formatters";
import { getSessionActivityLogsAction } from "@/actions/sessionActivity";
import { SessionActivityFeed } from "@/components/dashboard/SessionActivityFeed";
import {
  FileCheck2,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
} from "lucide-react";
import { CertificatePopViewTrigger } from "@/components/certificates/CertificatePopViewTrigger";

export default async function FacultyDashboardPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const sessionActivities = await getSessionActivityLogsAction({ limit: 15 });

  const deptId = user?.faculty?.department_id;
  const deptStudentIds = new Set(
    db.students.filter((s) => s.department_id === deptId).map((s) => s.id)
  );

  const deptCertificates = db.certificates
    .filter((c) => deptStudentIds.has(c.student_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const pendingQueue = deptCertificates.filter((c) => c.status === "SUBMITTED");
  const underReview = deptCertificates.filter((c) => c.status === "UNDER_REVIEW");
  const approved = deptCertificates.filter((c) => c.status === "APPROVED");
  const corrections = deptCertificates.filter((c) => c.status === "CORRECTION_REQUIRED");

  const stats: StatItem[] = [
    {
      title: "Pending Queue",
      value: pendingQueue.length,
      description: "Submissions awaiting review",
      iconName: "clock",
      variant: "primary",
    },
    {
      title: "Under Evaluation",
      value: underReview.length,
      description: "Claimed with active lock",
      iconName: "alert",
      variant: "amber",
    },
    {
      title: "Approved Records",
      value: approved.length,
      description: "Points awarded & certified",
      iconName: "check",
      variant: "emerald",
    },
    {
      title: "Corrections Sent",
      value: corrections.length,
      description: "Awaiting student resubmission",
      iconName: "trending",
      variant: "indigo",
    },
  ];

  // Urgent submissions needing faculty review
  const urgentSubmissions = deptCertificates
    .filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW")
    .slice(0, 6)
    .map((c) => {
      const student = db.students.find((s) => s.id === c.student_id);
      const studentProfile = student ? db.profiles.find((p) => p.id === student.profile_id) : undefined;
      const category = db.categories.find((cat) => cat.id === c.category_id);
      const reviewer = c.reviewer_id ? db.faculty.find((f) => f.id === c.reviewer_id) : undefined;
      const reviewerProfile = reviewer ? db.profiles.find((p) => p.id === reviewer.profile_id) : undefined;
      const files = db.certificateFiles.filter((f) => f.certificate_id === c.id);
      const points = db.pointRecords.find((p) => p.certificate_id === c.id && p.is_latest);

      return {
        ...c,
        student: student ? { ...student, profile: studentProfile } : undefined,
        category,
        reviewer: reviewer ? { ...reviewer, profile: reviewerProfile } : undefined,
        files,
        points,
      };
    });

  // Department activity feed
  const deptAudit = db.auditLogs
    .filter((l) => l.action.startsWith("CERTIFICATE_") || l.action.startsWith("POINTS_"))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const activities: ActivityItem[] = deptAudit.map((l) => {
    let actType: ActivityItem["type"] = "submission";
    if (l.action === "CERTIFICATE_APPROVED") actType = "approval";
    else if (l.action === "CORRECTION_REQUESTED") actType = "correction";
    else if (l.action === "POINTS_AWARDED") actType = "points";

    return {
      id: l.id,
      title: l.action.replace("_", " "),
      description: (l.metadata as any)?.comment || (l.metadata as any)?.title || "Review action processed",
      timestamp: l.created_at,
      type: actType,
      link: `/faculty/reviews/${l.entity_id}`,
    };
  });

  return (
    <div className="space-y-8 pb-28 md:pb-8">
      {/* Faculty Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-200" />
                <span>{user?.faculty?.department?.code || "CSE"} Faculty Reviewer</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 text-blue-100 text-[11px] font-medium backdrop-blur-md">
                Verification Portal
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {user?.profile.full_name}
            </h2>
            <div className="text-xs text-blue-100 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Designation: <span className="text-white font-semibold">{user?.faculty?.designation || "Faculty"}</span></span>
              <span className="hidden sm:inline text-blue-200">•</span>
              <span>
                Employee ID:{" "}
                <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded">
                  {user?.faculty?.employee_id}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/faculty/reviews">
              <Button className="bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs h-11 px-5 rounded-xl shadow-sm flex items-center justify-center transition-all">
                <FileCheck2 className="h-4 w-4 mr-2 text-blue-600" />
                <span>Open Review Queue ({pendingQueue.length + underReview.length})</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Scorecard */}
      <StatCards stats={stats} />

      {/* Department Review Queue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Active Verification Queue</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {urgentSubmissions.length} Pending
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Department certificates awaiting primary proof evaluation
              </p>
            </div>
            <Link
              href="/faculty/reviews"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
            >
              <span>View full queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {urgentSubmissions.length === 0 ? (
            <Card className="p-10 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
              <FileCheck2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">Verification Queue is Clear</p>
              <p className="text-xs text-slate-500 mt-1">
                All certificate submissions have been processed.
              </p>
            </Card>
          ) : (
            <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Achievement & Event</th>
                      <th className="py-3 px-4">Status / Lock</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {urgentSubmissions.map((cert) => {
                      const isLockedByOther =
                        cert.status === "UNDER_REVIEW" &&
                        cert.reviewer_id &&
                        cert.reviewer_id !== user?.faculty?.id;

                      return (
                        <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">
                              {cert.student?.profile?.full_name || "Student"}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500">
                              {cert.student?.register_number}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="font-bold text-slate-900 truncate">{cert.title}</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span className="truncate">{cert.event_name}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-700">
                                {cert.category?.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <StatusBadge status={cert.status} />
                              {cert.status === "UNDER_REVIEW" && (
                                <p className="text-[10px] text-slate-500 truncate">
                                  {isLockedByOther
                                    ? `Reviewing: ${cert.reviewer?.profile?.full_name || "Faculty"}`
                                    : "Claimed by you"}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <CertificatePopViewTrigger
                                title={cert.title}
                                achievementId={cert.achievement_id}
                                status={cert.status}
                                points={cert.points?.points}
                                eventName={cert.event_name}
                                organizer={cert.organizer}
                                eventDate={cert.event_date}
                                eventLevel={cert.event_level}
                                achievement={cert.achievement}
                                submittedAt={cert.submitted_at || cert.created_at}
                                files={cert.files || []}
                                buttonText="Pop View"
                                variant="compact"
                                showDownload={false}
                              />

                              <Link href={`/faculty/reviews/${cert.id}`}>
                                <Button
                                  size="sm"
                                  className="text-xs h-8 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold"
                                >
                                  {isLockedByOther ? "Inspect" : "Evaluate →"}
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* Student Session Authentication & Activity Feed */}
      <SessionActivityFeed
        initialActivities={sessionActivities}
        callerRole="FACULTY"
        title="Student Live Session & Password Activity Log"
        subtitle="Real-time chronological log of enrolled students logging into, out of the portal, and resetting passwords with exact date, time, and register number."
      />
    </div>
  );
}
