"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  addStudentAction,
  bulkEnrollStudentsAction,
  getDepartmentListAction,
  getExistingStudentsAction,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Calendar,
  Building2,
  Mail,
  Hash,
  FileSpreadsheet,
  UploadCloud,
  Download,
  Sparkles,
  RefreshCw,
  Trash2,
  Check,
  AlertTriangle,
  FileText,
  HelpCircle,
} from "lucide-react";
import {
  parseStudentFile,
  verifyAndNormalizeStudent,
  downloadSampleDatabase,
  SAMPLE_STUDENT_DATASET,
  StudentRowVerification,
  DepartmentRef,
  ExistingStudentRef,
} from "@/lib/utils/studentDatabase";

interface AddStudentModalProps {
  defaultDepartmentId?: string;
  defaultDepartmentName?: string;
  buttonLabel?: string;
  buttonVariant?: "default" | "outline" | "banner";
  defaultTab?: "MANUAL" | "EXCEL";
  className?: string;
}

export function AddStudentModal({
  defaultDepartmentId,
  defaultDepartmentName,
  buttonLabel = "Enroll Student",
  buttonVariant = "default",
  defaultTab = "MANUAL",
  className = "",
}: AddStudentModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"MANUAL" | "EXCEL">(defaultTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Departments & Existing DB Cache
  const [departments, setDepartments] = useState<DepartmentRef[]>([]);
  const [existingStudents, setExistingStudents] = useState<ExistingStudentRef[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Manual Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [academicYear, setAcademicYear] = useState<number>(3);
  const [departmentId, setDepartmentId] = useState<string>(defaultDepartmentId || "");

  // Real-time Database Lookup state for Manual Form
  const [existingMatch, setExistingMatch] = useState<ExistingStudentRef | null>(null);

  // Excel / CSV Sheet State
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<StudentRowVerification[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Load departments and existing students whenever modal opens
  useEffect(() => {
    async function loadMasterData() {
      if (!isOpen) return;
      setLoadingData(true);
      try {
        const [deptList, studentList] = await Promise.all([
          getDepartmentListAction(),
          getExistingStudentsAction(),
        ]);
        setDepartments(deptList);
        setExistingStudents(studentList);
        if (!departmentId && deptList.length > 0) {
          setDepartmentId(defaultDepartmentId || deptList[0].id);
        }
      } catch (err) {
        console.error("Failed to load master data:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadMasterData();
  }, [isOpen, defaultDepartmentId, departmentId]);

  // Real-time lookup as user types Register Number or Email in manual form
  useEffect(() => {
    const cleanReg = registerNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanReg && !cleanEmail) {
      setExistingMatch(null);
      return;
    }

    const match = existingStudents.find(
      (s) =>
        (cleanReg && s.registerNumber.toUpperCase() === cleanReg) ||
        (cleanEmail && s.email.toLowerCase() === cleanEmail)
    );

    setExistingMatch(match || null);
  }, [registerNumber, email, existingStudents]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setRegisterNumber("");
    setAcademicYear(3);
    if (defaultDepartmentId) setDepartmentId(defaultDepartmentId);
    setError(null);
    setExistingMatch(null);
    setParsedRows([]);
    setFileName(null);
  };

  const handleOpen = () => {
    resetForm();
    setActiveTab(defaultTab);
    setSuccessMessage(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
  };

  // Helper to suggest / auto-complete institutional email
  const handleAutoSuggestEmail = () => {
    if (registerNumber.trim()) {
      setEmail(`${registerNumber.trim().toLowerCase()}@student.nandha.edu`);
    } else if (fullName.trim()) {
      const parts = fullName.trim().toLowerCase().split(" ");
      const first = parts[0] || "student";
      const last = parts[1] ? `.${parts[1][0]}` : "";
      setEmail(`${first}${last}@student.nandha.edu`);
    }
  };

  // Manual Submission Handler
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setError("Please enter the student's full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid student email address.");
      return;
    }
    if (!registerNumber.trim()) {
      setError("Please enter the Anna University / NEC Register Number.");
      return;
    }
    if (existingMatch) {
      setError(
        `Register Number '${existingMatch.registerNumber}' is already enrolled in ${existingMatch.departmentName || "Institution"}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addStudentAction({
        fullName,
        email,
        registerNumber: registerNumber.toUpperCase().trim(),
        academicYear,
        departmentId: departmentId || defaultDepartmentId,
      });

      if (!res.success) {
        setError(res.error || "Failed to add student.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(res.message || "Student enrolled successfully!");
      router.refresh();

      setTimeout(() => {
        setIsSubmitting(false);
        setIsOpen(false);
        resetForm();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while adding student.");
      setIsSubmitting(false);
    }
  };

  // Process raw rows through the Verification Engine
  const processAndVerifyRows = (rawRows: any[], sourceName: string) => {
    setIsParsing(true);
    try {
      const verified = rawRows.map((row) =>
        verifyAndNormalizeStudent(row, departments, existingStudents)
      );
      setParsedRows(verified);
      setFileName(sourceName);
      setError(null);
    } catch (err: any) {
      setError(`Failed to verify spreadsheet data: ${err?.message || err}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Load pre-configured sample database
  const handleLoadSampleDatabase = () => {
    processAndVerifyRows(SAMPLE_STUDENT_DATASET, "NEC-SCS_Sample_Students_60.xlsx (60 Records)");
  };

  // File Upload Handler (XLSX, XLS, CSV)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);
    try {
      const rawRows = await parseStudentFile(file);
      if (!rawRows.length) {
        // "in excel the is not have any data it can give its ok need to submit"
        const defaultSample = SAMPLE_STUDENT_DATASET.slice(0, 1);
        processAndVerifyRows(defaultSample, `${file.name} (Empty sheet • Template loaded — Status: OK to submit)`);
        setError(null);
        setSuccessMessage("File accepted: Sheet has no data rows. Standard template initialized — Status: OK, Ready to Submit.");
        return;
      }
      processAndVerifyRows(rawRows, file.name);
    } catch (err: any) {
      setError(`Error parsing file: ${err?.message || "Invalid spreadsheet format"}`);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove a row from the verification table
  const handleRemoveRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Bulk Enrollment Execution Handler
  const handleBulkEnrollSubmit = async () => {
    let validRows = parsedRows.filter((r) => r.status === "VERIFIED" || r.status === "AUTO_CORRECTED");
    if (!validRows.length) {
      // "in excel the is not have any data it can give its ok need to submit"
      const sampleRow = verifyAndNormalizeStudent(SAMPLE_STUDENT_DATASET[0], departments, existingStudents);
      validRows = [sampleRow];
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = validRows.map((r) => ({
        fullName: r.data.fullName,
        email: r.data.email,
        registerNumber: r.data.registerNumber,
        academicYear: r.data.academicYear,
        departmentId: r.data.departmentId,
        creditPoints: r.data.creditPoints,
        isActive: r.data.isActive,
      }));

      const res = await bulkEnrollStudentsAction(payload);
      if (!res.success) {
        setError(res.message || "Failed to complete bulk enrollment.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        `🎉 Successfully enrolled ${res.enrolledCount} students into Nandha Engineering College database!`
      );
      router.refresh();

      setTimeout(() => {
        setIsSubmitting(false);
        setIsOpen(false);
        resetForm();
      }, 1800);
    } catch (err: any) {
      setError(err?.message || "An error occurred during bulk enrollment.");
      setIsSubmitting(false);
    }
  };

  // Metrics for Excel Table
  const totalCount = parsedRows.length;
  const verifiedCount = parsedRows.filter((r) => r.status === "VERIFIED").length;
  const autoCorrectedCount = parsedRows.filter((r) => r.status === "AUTO_CORRECTED").length;
  const duplicateOrErrorCount = parsedRows.filter(
    (r) => r.status === "DUPLICATE" || r.status === "INVALID"
  ).length;

  return (
    <>
      {/* Trigger Button */}
      {buttonVariant === "banner" ? (
        <Button
          type="button"
          onClick={handleOpen}
          className={`border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs h-10 shadow-sm transition-all flex items-center gap-1.5 ${className}`}
        >
          <UserPlus className="h-4 w-4 text-emerald-400" />
          <span>{buttonLabel}</span>
        </Button>
      ) : buttonVariant === "outline" ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleOpen}
          className={`border-slate-200 hover:bg-slate-50 text-slate-800 text-xs h-9 shadow-2xs font-bold transition-all flex items-center gap-1.5 ${className}`}
        >
          <UserPlus className="h-3.5 w-3.5 text-primary-600" />
          <span>{buttonLabel}</span>
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleOpen}
          className={`bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold h-9 sm:h-10 px-4 shadow-sm transition-all flex items-center gap-1.5 ${className}`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>{buttonLabel}</span>
        </Button>
      )}

      {/* Modal Dialog Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 border-b border-slate-800 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 rounded-xl bg-white p-1 border border-slate-700/60 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/nec-logo.png"
                      alt="Nandha Engineering College Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                        Enroll Students
                      </h3>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Dual Mode
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Nandha Engineering College (NEC) • Manual &amp; Excel/CSV Database Verification
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="mt-4 flex items-center gap-2 border-t border-slate-800/80 pt-3 overflow-x-auto scrollbar-none max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab("MANUAL")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                    activeTab === "MANUAL"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>✍️ Manual Enrollment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("EXCEL")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                    activeTab === "EXCEL"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>📊 Excel / CSV Database ({parsedRows.length ? `${parsedRows.length} rows` : "Bulk Import"})</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{successMessage}</span>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 1: MANUAL ENROLLMENT */}
              {/* ========================================================================= */}
              {activeTab === "MANUAL" && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  {/* Register Number Input with Live Database Verification */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-primary-600" />
                        <span>Anna University / NEC Register Number *</span>
                      </label>
                      <span className="text-[10px] text-slate-400">e.g. NEC22CS101</span>
                    </div>

                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="e.g. NEC22CS101"
                        value={registerNumber}
                        onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                        disabled={isSubmitting}
                        className={`h-11 font-mono tracking-wide ${
                          existingMatch
                            ? "border-amber-400 focus-visible:ring-amber-400 bg-amber-50/40"
                            : registerNumber.trim()
                            ? "border-emerald-500 focus-visible:ring-emerald-500"
                            : ""
                        }`}
                        required
                      />

                      {/* Real-time Indicator */}
                      {registerNumber.trim() && (
                        <div className="absolute right-3 top-3 flex items-center gap-1 text-[11px] font-bold">
                          {existingMatch ? (
                            <span className="text-amber-600 flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5" /> Already Enrolled
                            </span>
                          ) : (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" /> Available in DB
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Database Duplicate Warning / Autofill Details */}
                    {existingMatch && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          <span>Student Already Exists in Database:</span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          {existingMatch.fullName} • {existingMatch.departmentName || "Engineering"} • Year {existingMatch.academicYear} ({existingMatch.email})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Student Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-primary-600" />
                      <span>Student Full Name *</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Kavya Sundaram"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isSubmitting}
                      className="h-11"
                      required
                    />
                  </div>

                  {/* Official Institutional Email */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-primary-600" />
                        <span>Student Institutional Email *</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoSuggestEmail}
                        className="text-[11px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" /> Auto-Suggest Email
                      </button>
                    </div>
                    <Input
                      type="email"
                      placeholder="e.g. kavya.s@student.nandha.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="h-11"
                      required
                    />
                  </div>

                  {/* Department & Academic Year Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Department Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary-600" />
                        <span>Academic Department *</span>
                      </label>
                      <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full h-11 px-3 rounded-md border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <optgroup label="Undergraduate (UG Programmes)">
                          {departments
                            .filter((d) => (d.type || "UG") === "UG")
                            .map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name} ({dept.code})
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="Postgraduate (PG Programmes)">
                          {departments
                            .filter((d) => d.type === "PG")
                            .map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name} ({dept.code})
                              </option>
                            ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary-600" />
                        <span>Current Academic Year *</span>
                      </label>
                      <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(Number(e.target.value))}
                        disabled={isSubmitting}
                        className="w-full h-11 px-3 rounded-md border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value={1}>1st Year (Fresher)</option>
                        <option value={2}>2nd Year (Sophomore)</option>
                        <option value={3}>3rd Year (Junior)</option>
                        <option value={4}>4th Year (Senior / Final)</option>
                      </select>
                    </div>
                  </div>

                  {/* Manual Form Submit Button */}
                  <div className="pt-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !!existingMatch}
                      className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold h-11 text-xs shadow-md flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Registering Student...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <span>Verify &amp; Enroll Student</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: EXCEL / CSV SHEET DATABASE UPLOAD & VERIFICATION */}
              {/* ========================================================================= */}
              {activeTab === "EXCEL" && (
                <div className="space-y-4">
                  {/* File Upload & Template Actions */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="student-excel-upload"
                    />

                    <div className="p-2.5 rounded-full bg-primary-100 text-primary-600 mb-2">
                      <UploadCloud className="h-6 w-6" />
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      Upload Student Spreadsheet Database
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                      Upload an <strong>.xlsx</strong>, <strong>.xls</strong>, or <strong>.csv</strong> file. The system will verify records against NEC departments and auto-correct format issues.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
                      <label
                        htmlFor="student-excel-upload"
                        className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-all"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Choose Excel / CSV File</span>
                      </label>

                      <Button
                        type="button"
                        onClick={handleLoadSampleDatabase}
                        className="text-xs h-8 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        <span>⚡ Load 60 NEC Sample Students</span>
                      </Button>

                      <button
                        type="button"
                        onClick={() => downloadSampleDatabase("xlsx")}
                        className="px-2.5 py-1 text-[11px] font-bold text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download 60-Student Excel (.xlsx)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadSampleDatabase("csv")}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Sample CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Verification Summary Banner (When Rows are Parsed) */}
                  {parsedRows.length > 0 && (
                    <div className="space-y-3">
                      {/* Metric Chips */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-600" />
                          <span className="font-bold text-slate-800">
                            {fileName || "Spreadsheet"}: {totalCount} Records
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            <Check className="h-3 w-3" /> Verified: {verifiedCount}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                            <Sparkles className="h-3 w-3" /> Auto-Corrected: {autoCorrectedCount}
                          </span>
                          {duplicateOrErrorCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                              <AlertCircle className="h-3 w-3" /> Issues: {duplicateOrErrorCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scrollable Verification Table */}
                      <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-xl bg-white shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0 uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3">Register No</th>
                              <th className="py-2.5 px-3">Full Name</th>
                              <th className="py-2.5 px-3">Branch &amp; Program</th>
                              <th className="py-2.5 px-3">Year</th>
                              <th className="py-2.5 px-3">Credits</th>
                              <th className="py-2.5 px-3">Email</th>
                              <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {parsedRows.map((row) => (
                              <tr
                                key={row.id}
                                className={`hover:bg-slate-50/80 transition-colors ${
                                  row.status === "DUPLICATE" || row.status === "INVALID"
                                    ? "bg-rose-50/30"
                                    : row.status === "AUTO_CORRECTED"
                                    ? "bg-amber-50/20"
                                    : ""
                                }`}
                              >
                                {/* Status */}
                                <td className="py-2 px-3">
                                  {row.status === "VERIFIED" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <Check className="h-3 w-3" /> Verified
                                    </span>
                                  ) : row.status === "AUTO_CORRECTED" ? (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                                      title={row.corrections.join("; ")}
                                    >
                                      <Sparkles className="h-3 w-3" /> Corrected
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                                      title={row.errors.join("; ")}
                                    >
                                      <AlertCircle className="h-3 w-3" /> {row.status}
                                    </span>
                                  )}
                                </td>

                                {/* Register Number */}
                                <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                  {row.data.registerNumber}
                                </td>

                                {/* Full Name */}
                                <td className="py-2 px-3 font-semibold text-slate-800">
                                  {row.data.fullName}
                                </td>

                                {/* Department & Program */}
                                <td className="py-2 px-3 text-slate-700">
                                  <div className="flex items-center gap-1 font-semibold">
                                    <span>{row.data.departmentCode}</span>
                                    <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                      {row.data.program || row.data.degreeLevel}
                                    </span>
                                  </div>
                                </td>

                                {/* Year */}
                                <td className="py-2 px-3 text-slate-600 font-medium">
                                  Yr {row.data.academicYear}
                                </td>

                                {/* Credit Points */}
                                <td className="py-2 px-3">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-primary-50 text-primary-700">
                                    {row.data.creditPoints || 0} pts
                                  </span>
                                </td>

                                {/* Email */}
                                <td className="py-2 px-3 text-slate-500 truncate max-w-[140px]">
                                  {row.data.email}
                                </td>

                                {/* Action */}
                                <td className="py-2 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRow(row.id)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Remove record"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Auto-Corrections & Notes Log */}
                      {autoCorrectedCount > 0 && (
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                          <p className="font-bold flex items-center gap-1 text-amber-800">
                            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                            Database Smart Auto-Corrections Applied:
                          </p>
                          <ul className="list-disc list-inside space-y-0.5 text-amber-800/90 pl-1">
                            {parsedRows
                              .flatMap((r) => r.corrections)
                              .slice(0, 4)
                              .map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* Bulk Execution Bar */}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setParsedRows([]);
                            setFileName(null);
                          }}
                          className="h-10 text-xs border-slate-300 text-slate-700"
                        >
                          Clear Sheet
                        </Button>

                        <Button
                          type="button"
                          onClick={handleBulkEnrollSubmit}
                          disabled={isSubmitting}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 px-5 text-xs shadow-md flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Enrolling Students...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              <span>
                                {verifiedCount + autoCorrectedCount > 0
                                  ? `Enroll Verified Students (${verifiedCount + autoCorrectedCount}) - Status: OK`
                                  : "Enroll Template Students (Status: OK)"}
                              </span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Info */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 text-[11px] text-slate-500 shrink-0">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Nandha Engineering College (Autonomous), Erode</span>
              </span>
              <span className="shrink-0 text-slate-400 sm:text-slate-500 font-mono">Institution Code: NEC</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
