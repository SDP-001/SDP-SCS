import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { Card } from "@/components/ui/card";
import { FileCheck2, Award, GraduationCap, FileSpreadsheet } from "lucide-react";

import { AddStudentModal } from "@/components/students/AddStudentModal";
import { getSessionActivityLogsAction } from "@/actions/sessionActivity";
import { SessionActivityFeed } from "@/components/dashboard/SessionActivityFeed";

export default async function HODStudentsPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const sessionActivities = await getSessionActivityLogsAction({ roleFilter: "STUDENT", limit: 20 });

  const deptId = user?.faculty?.department_id;
  const students = db.students
    .filter((s) => s.department_id === deptId)
    .map((s) => {
      const profile = db.profiles.find((p) => p.id === s.profile_id);
      const studentCerts = db.certificates.filter((c) => c.student_id === s.id);
      const approvedCount = studentCerts.filter((c) => c.status === "APPROVED").length;
      const totalPoints = db.pointRecords
        .filter((p) => p.student_id === s.id && p.is_latest)
        .reduce((sum, p) => sum + p.points, 0);

      return {
        ...s,
        profile,
        approvedCount,
        totalPoints,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Department Student Performance & Credits
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Student achievement standings for {user?.faculty?.department?.name || "Department"}.
          </p>
        </div>

        <AddStudentModal
          defaultDepartmentId={deptId}
          defaultDepartmentName={user?.faculty?.department?.name}
          buttonLabel="Enroll Student (Manual / Excel)"
        />
      </div>

      {/* Excel Spreadsheet Quick Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-500/20 text-primary-300 border border-primary-500/30">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Student Excel Database Engine</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Bulk enroll student records via spreadsheet. If the uploaded sheet contains no data, template records are ready: <em>it&apos;s OK to submit!</em>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AddStudentModal
            defaultDepartmentId={deptId}
            defaultDepartmentName={user?.faculty?.department?.name}
            buttonLabel="Upload Excel Sheet (OK to Submit)"
            buttonVariant="banner"
          />
        </div>
      </div>

      <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Register Number</th>
                <th className="py-3.5 px-4">Year</th>
                <th className="py-3.5 px-4">Verified Submissions</th>
                <th className="py-3.5 px-4 text-right">Points Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {students.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{student.profile?.full_name}</p>
                    <p className="text-[11px] text-slate-400">{student.profile?.email}</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {student.register_number}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">Year {student.academic_year}</td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                      <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{student.approvedCount} Approved</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono font-black text-emerald-700 text-sm">
                      +{student.totalPoints} PTS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Students Session Activity Feed */}
      <SessionActivityFeed
        initialActivities={sessionActivities}
        callerRole="HOD"
        title="Department Students Session & Password Log"
        subtitle="Live chronological monitoring of enrolled department students logging in, logging out, and resetting passwords with date, time, and register number."
      />
    </div>
  );
}
