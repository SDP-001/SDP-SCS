import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { AddStudentModal } from "@/components/students/AddStudentModal";
import Link from "next/link";
import {
  FileSpreadsheet,
  Users,
  Download,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

export default async function FacultyStudentsExcelPage() {
  const user = await getCurrentUser();
  const db = getDB();

  const deptId = user?.faculty?.department_id;
  const deptName = user?.faculty?.department?.name || "Department";
  const deptCode = user?.faculty?.department?.code || "ENGG";

  const totalEnrolled = db.students.filter((s) => s.department_id === deptId).length;

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/faculty/students"
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Department Students</span>
            </Link>
          </div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-flex text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider">
              {deptCode} Roster
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Excel Sheet Enrollment
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk upload and verify student rosters for {deptName} via spreadsheet (.xlsx, .csv).
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
            buttonLabel="Upload Excel Sheet (OK to Submit)"
            defaultTab="EXCEL"
            buttonVariant="banner"
          />
        </div>
      </div>

      {/* Main Excel Operations Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Excel Spreadsheet Batch Enrollment Engine</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Upload class rosters or department cohorts in bulk. If your uploaded spreadsheet contains no records or empty columns, the system automatically populates verified template records: <em>it&apos;s OK to submit!</em>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/NEC-SCS_Sample_Students_60.xlsx"
              download="NEC-SCS_Sample_Students_60.xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Download Template (.xlsx)</span>
            </a>

            <AddStudentModal
              defaultDepartmentId={deptId}
              defaultDepartmentName={deptName}
              buttonLabel="Launch Excel Uploader"
              defaultTab="EXCEL"
              buttonVariant="banner"
            />
          </div>
        </div>
      </div>

      {/* Current Department Statistics */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Current Registered Students in {deptName}
            </p>
            <p className="text-[11px] text-slate-500">
              Total active student profiles in department database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-slate-900 font-mono">
            {totalEnrolled} <span className="text-xs font-bold text-slate-500 font-sans">Students</span>
          </span>
          <Link
            href="/faculty/students"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            View Student Roster →
          </Link>
        </div>
      </div>
    </div>
  );
}
