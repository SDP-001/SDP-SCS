import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";
import { formatDate } from "@/lib/utils/formatters";
import { DigitalPassportTrigger } from "@/components/student/DigitalPassportTrigger";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  Award,
  Calendar,
  Building,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

export default async function StudentProfilePassportPage() {
  const user = await getCurrentUser();
  const db = getDB();

  // Find currently authenticated student
  const student = user?.student || db.students[0];
  const profile = db.profiles.find((p) => p.id === student?.profile_id) || user?.profile;
  const department = db.departments.find((d) => d.id === student?.department_id);
  const college = db.colleges.find((c) => c.id === profile?.college_id) || db.colleges[0];

  const approvedCerts = db.certificates
    .filter((c) => c.student_id === student?.id && c.status === "APPROVED")
    .map((c) => ({
      id: c.id,
      achievement_id: c.achievement_id,
      title: c.title,
      achievement: c.achievement,
      categoryName: db.categories.find((cat) => cat.id === c.category_id)?.name || "General",
      organizer: c.organizer,
      event_date: c.event_date,
      points: db.pointRecords.find((p) => p.certificate_id === c.id && p.is_latest)?.points || 0,
    }))
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const totalPoints = approvedCerts.reduce((acc, c) => acc + c.points, 0);

  const passportData = {
    studentName: profile?.full_name || "Student",
    registerNumber: student?.register_number || "710022CS0101",
    departmentName: department?.name || "Computer Science & Engineering",
    academicYear: student?.academic_year || 3,
    totalPoints,
    records: approvedCerts,
    collegeName: college?.name || "Nandha Engineering College (Autonomous)",
  };

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        {/* Digital Passport Pop View Action Button */}
        <DigitalPassportTrigger
          initialData={passportData}
          variant="outline"
          label="Open Digital Passport (Pop View)"
          className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
        />
      </div>

      {/* Student Profile & Achievement Overview Card */}
      <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-2xs rounded-3xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
              {profile?.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || "ST"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {profile?.full_name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Verified Student
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Reg No: <span className="font-mono font-bold text-slate-700">{student?.register_number}</span> • Year {student?.academic_year || 3} • {department?.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {college?.name || "Nandha Engineering College (Autonomous)"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-left md:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Total Verified Credits
              </span>
              <span className="text-2xl font-black text-amber-700">+{totalPoints} PTS</span>
            </div>
            <DigitalPassportTrigger
              initialData={passportData}
              variant="outline"
              label="View Passport Pop View"
              className="bg-primary-600 hover:bg-primary-500 text-white border-0"
            />
          </div>
        </div>

        {/* Ledger Summary */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Approved Co-Curricular Credentials ({approvedCerts.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Human-verified achievements accredited under autonomous college governance.
              </p>
            </div>
            <DigitalPassportTrigger
              initialData={passportData}
              variant="navbar"
              label="Pop View Passport"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {approvedCerts.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileCheck2 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium">No approved achievements yet.</p>
              </div>
            ) : (
              approvedCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {cert.achievement_id || "ACH-VERIFIED"}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-500">
                        {cert.categoryName}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {cert.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {cert.achievement} • {cert.organizer}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-mono font-black text-emerald-700 bg-white px-2 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                    +{cert.points} PTS
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
