import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { AddFacultyModal } from "@/components/faculty/AddFacultyModal";
import Link from "next/link";
import {
  FileSpreadsheet,
  Users,
  Download,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default async function HODFacultyExcelPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const deptId = user?.faculty?.department_id;
  const deptName = user?.faculty?.department?.name || "Department";
  const deptCode = user?.faculty?.department?.code || "ENGG";

  const totalFaculty = db.faculty.filter((f) => f.department_id === deptId).length;

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/hod/faculty"
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Department Faculty</span>
            </Link>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Faculty Excel Sheet Enrollment</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {deptCode} Faculty
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk upload and verify department faculty evaluators for {deptName} via spreadsheet (.xlsx, .csv).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AddFacultyModal
            defaultDepartmentId={deptId}
            defaultDepartmentName={deptName}
            buttonLabel="Add Faculty (Manual)"
            defaultTab="MANUAL"
            allowHODRole={false}
            enforcedRole="FACULTY"
          />
          <AddFacultyModal
            defaultDepartmentId={deptId}
            defaultDepartmentName={deptName}
            buttonLabel="Upload Excel Sheet (OK to Submit)"
            defaultTab="EXCEL"
            allowHODRole={false}
            enforcedRole="FACULTY"
            buttonVariant="banner"
          />
        </div>
      </div>

      {/* Main Excel Operations Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Faculty Excel Batch Enrollment Engine</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HOD Access
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Bulk register department evaluators, assistant professors, and lab coordinators. If your uploaded spreadsheet contains no data or empty rows, the system automatically populates verified template records: <em>it&apos;s OK to submit!</em>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AddFacultyModal
              defaultDepartmentId={deptId}
              defaultDepartmentName={deptName}
              buttonLabel="Launch Excel Faculty Uploader"
              defaultTab="EXCEL"
              allowHODRole={false}
              enforcedRole="FACULTY"
              buttonVariant="banner"
            />
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <span>Department Scoping</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              All added faculty members are automatically scoped to {deptName} review queues.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Empty Sheet Handling</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              If the spreadsheet has no data, valid starter template rows are provided: status OK, ready to submit!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              <span>Duplicate Safeguards</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Automatic validation ensures employee IDs and emails are unique across the institution.
            </p>
          </div>
        </div>
      </div>

      {/* Current Department Faculty Count */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <Briefcase className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Current Faculty Evaluators in {deptName}
            </p>
            <p className="text-[11px] text-slate-500">
              Total active faculty evaluators in live department roster.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-slate-900 font-mono">
            {totalFaculty} <span className="text-xs font-bold text-slate-500 font-sans">Members</span>
          </span>
          <Link
            href="/hod/faculty"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            View Faculty Directory →
          </Link>
        </div>
      </div>
    </div>
  );
}
