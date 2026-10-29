import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Award, FileCheck2, Search, ArrowRight, FileSpreadsheet } from "lucide-react";
import { AddStudentModal } from "@/components/students/AddStudentModal";
import { getSessionActivityLogsAction } from "@/actions/sessionActivity";
import { SessionActivityFeed } from "@/components/dashboard/SessionActivityFeed";
import { DepartmentStudentsTable } from "@/components/students/DepartmentStudentsTable";

export default async function FacultyStudentsPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const sessionActivities = await getSessionActivityLogsAction({ limit: 15 });

  const deptId = user?.faculty?.department_id;
  const deptName = user?.faculty?.department?.name || "Department";

  // Pre-index for instant lookup
  const profileMap = new Map(db.profiles.map((p) => [p.id, p]));
  const certsByStudent = new Map<string, any[]>();
  for (const c of db.certificates) {
    if (!certsByStudent.has(c.student_id)) certsByStudent.set(c.student_id, []);
    certsByStudent.get(c.student_id)!.push(c);
  }

  const pointsByStudent = new Map<string, number>();
  for (const p of db.pointRecords) {
    if (p.is_latest) {
      pointsByStudent.set(p.student_id, (pointsByStudent.get(p.student_id) || 0) + p.points);
    }
  }

  const students = db.students
    .filter((s) => s.department_id === deptId)
    .map((s) => {
      const profile = profileMap.get(s.profile_id);
      const studentCerts = certsByStudent.get(s.id) || [];
      const approvedCount = studentCerts.filter((c) => c.status === "APPROVED").length;
      const pendingCount = studentCerts.filter(
        (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW"
      ).length;
      const totalPoints = pointsByStudent.get(s.id) || 0;

      return {
        id: s.id,
        register_number: s.register_number,
        academic_year: s.academic_year,
        department_id: s.department_id,
        approvedCount,
        pendingCount,
        totalPoints,
        profile: profile
          ? {
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
              is_active: profile.is_active,
              role: profile.role,
            }
          : null,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Department Students & Account Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Directory of registered students in {deptName}. You are authorized to manage achievements and activate/disable student accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AddStudentModal
            defaultDepartmentId={deptId}
            defaultDepartmentName={deptName}
            buttonLabel="Add Student (Manual)"
            defaultTab="MANUAL"
          />
          <AddStudentModal
            defaultDepartmentId={deptId}
            defaultDepartmentName={deptName}
            buttonLabel="Add with Excel Sheet"
            defaultTab="EXCEL"
            buttonVariant="banner"
          />
        </div>
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
              Upload class roster or batch spreadsheet (.xlsx, .csv). If no data is present, template records are ready: <em>it&apos;s OK to submit!</em>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AddStudentModal
            defaultDepartmentId={deptId}
            defaultDepartmentName={deptName}
            buttonLabel="Upload Excel Sheet (OK to Submit)"
            buttonVariant="banner"
          />
        </div>
      </div>

      {/* Interactive Table with Live Search & Disable/Activate Action */}
      <DepartmentStudentsTable
        initialStudents={students}
        callerRole="FACULTY"
        departmentName={deptName}
      />

      {/* Student Session Authentication & Activity Feed */}
      <SessionActivityFeed
        initialActivities={sessionActivities}
        callerRole="FACULTY"
        title="Department Students Session & Password Log"
        subtitle="Chronological feed of student login, logout, and password reset events with exact date, time, and register number."
      />
    </div>
  );
}
