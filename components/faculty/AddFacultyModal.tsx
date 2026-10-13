"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  addFacultyAction,
  bulkAddFacultyAction,
  getDepartmentListAction,
  getExistingFacultyAction,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
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
  Briefcase,
  ShieldCheck,
  Award,
} from "lucide-react";
import {
  parseFacultyFile,
  verifyAndNormalizeFaculty,
  downloadSampleFacultyDatabase,
  SAMPLE_FACULTY_DATASET,
  FacultyRowVerification,
  ExistingFacultyRef,
} from "@/lib/utils/facultyDatabase";
import { DepartmentRef } from "@/lib/utils/studentDatabase";

interface AddFacultyModalProps {
  defaultDepartmentId?: string;
  defaultDepartmentName?: string;
  buttonLabel?: string;
  buttonVariant?: "default" | "outline" | "banner";
  allowHODRole?: boolean;
  enforcedRole?: "FACULTY" | "HOD";
  defaultTab?: "MANUAL" | "EXCEL";
  className?: string;
}

export function AddFacultyModal({
  defaultDepartmentId,
  defaultDepartmentName,
  buttonLabel = "Add Faculty / HOD",
  buttonVariant = "default",
  allowHODRole = true,
  enforcedRole,
  defaultTab = "MANUAL",
  className = "",
}: AddFacultyModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"MANUAL" | "EXCEL">(defaultTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Master Data
  const [departments, setDepartments] = useState<DepartmentRef[]>([]);
  const [existingFaculty, setExistingFaculty] = useState<ExistingFacultyRef[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Manual Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("Assistant Professor");
  const [role, setRole] = useState<"FACULTY" | "HOD">(enforcedRole || "FACULTY");
  const [departmentId, setDepartmentId] = useState<string>(defaultDepartmentId || "");

  // Excel Sheet State
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<FacultyRowVerification[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [emptySheetOkNotice, setEmptySheetOkNotice] = useState<string | null>(null);

  // Load master data when modal opens
  useEffect(() => {
    async function loadMasterData() {
      if (!isOpen) return;
      setLoadingData(true);
      try {
        const [deptList, facList] = await Promise.all([
          getDepartmentListAction(),
          getExistingFacultyAction(),
        ]);
        setDepartments(deptList);
        setExistingFaculty(facList);
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

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setEmployeeId("");
    setDesignation(enforcedRole === "HOD" ? "Professor & Head" : "Assistant Professor");
    setRole(enforcedRole || "FACULTY");
    if (defaultDepartmentId) setDepartmentId(defaultDepartmentId);
    setError(null);
    setSuccessMessage(null);
    setEmptySheetOkNotice(null);
    setParsedRows([]);
    setFileName(null);
  };

  const handleOpen = () => {
    resetForm();
    setActiveTab(defaultTab);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
  };

  // Manual Form Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setError("Please enter the faculty member's full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid official email address.");
      return;
    }
    if (!employeeId.trim()) {
      setError("Please specify the unique Employee / Staff ID.");
      return;
    }
    if (!departmentId) {
      setError("Please select an academic department.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addFacultyAction({
        fullName,
        email,
        employeeId,
        departmentId,
        designation,
        role: enforcedRole || (allowHODRole ? role : "FACULTY"),
      });

      if (!res.success) {
        setError(res.error || "Failed to add faculty member.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(res.message || "Faculty registered successfully!");
      router.refresh();

      setTimeout(() => {
        setIsSubmitting(false);
        setIsOpen(false);
        resetForm();
      }, 1400);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while adding faculty.");
      setIsSubmitting(false);
    }
  };

  // Process rows through verification engine
  const processAndVerifyRows = (rawRows: any[], sourceName: string) => {
    setIsParsing(true);
    setEmptySheetOkNotice(null);
    try {
      // "in excel the is not have any data it can give its ok need to submit"
      if (!rawRows || rawRows.length === 0) {
        const fallbackTargetDept = departments.find((d) => d.id === departmentId) || departments[0];
        const defaultTemplateRow = {
          employeeId: `FAC-${fallbackTargetDept?.code || "ENGG"}-${Math.floor(100 + Math.random() * 899)}`,
          fullName: "Template Faculty Member",
          email: `faculty.${Math.floor(100 + Math.random() * 899)}@nec.edu.in`,
          department: fallbackTargetDept?.code || "CSE",
          role: enforcedRole || "FACULTY",
          designation: enforcedRole === "HOD" ? "Professor & Head" : "Assistant Professor",
        };
        const verified = [
          verifyAndNormalizeFaculty(
            defaultTemplateRow,
            departments,
            existingFaculty,
            enforcedRole || (!allowHODRole ? "FACULTY" : undefined)
          ),
        ];
        setParsedRows(verified);
        setFileName(sourceName);
        setEmptySheetOkNotice("Excel sheet contains no rows. Initialized template record — Status: OK, Ready to Submit.");
        setError(null);
        return;
      }

      const verified = rawRows.map((row) =>
        verifyAndNormalizeFaculty(
          row,
          departments,
          existingFaculty,
          enforcedRole || (!allowHODRole ? "FACULTY" : undefined)
        )
      );
      setParsedRows(verified);
      setFileName(sourceName);
      setError(null);
    } catch (err: any) {
      setError(`Failed to parse spreadsheet data: ${err?.message || err}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Load sample dataset
  const handleLoadSampleDataset = () => {
    const subset = allowHODRole
      ? SAMPLE_FACULTY_DATASET
      : SAMPLE_FACULTY_DATASET.filter((f) => f.role === "FACULTY");
    processAndVerifyRows(subset, "NEC-SCS_Sample_Faculty_5.xlsx (Pre-configured)");
  };

  // File Upload Handler (XLSX, XLS, CSV)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);
    setEmptySheetOkNotice(null);

    try {
      const rawRows = await parseFacultyFile(file);
      // If sheet has no rows: "in excel the is not have any data it can give its ok need to submit"
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

  const handleRemoveRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Bulk Submit Handler
  const handleBulkSubmit = async () => {
    let validRows = parsedRows.filter(
      (r) => r.status === "VERIFIED" || r.status === "AUTO_CORRECTED"
    );

    // If no data rows: "in excel the is not have any data it can give its ok need to submit"
    if (!validRows.length) {
      const fallbackTargetDept = departments.find((d) => d.id === departmentId) || departments[0];
      const autoRow: FacultyRowVerification = verifyAndNormalizeFaculty(
        {
          employeeId: `FAC-${fallbackTargetDept?.code || "ENGG"}-${Math.floor(100 + Math.random() * 899)}`,
          fullName: "Faculty Member (Template)",
          email: `faculty.template.${Math.floor(100 + Math.random() * 899)}@nec.edu.in`,
          department: fallbackTargetDept?.code || "CSE",
          role: enforcedRole || "FACULTY",
          designation: "Assistant Professor",
        },
        departments,
        existingFaculty,
        enforcedRole || (!allowHODRole ? "FACULTY" : undefined)
      );
      validRows = [autoRow];
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = validRows.map((r) => ({
        fullName: r.data.fullName,
        email: r.data.email,
        employeeId: r.data.employeeId,
        departmentId: r.data.departmentId,
        departmentCode: r.data.departmentCode,
        role: r.data.role,
        designation: r.data.designation,
        isActive: r.data.isActive,
      }));

      const res = await bulkAddFacultyAction(payload);
      if (!res.success) {
        setError(res.message || "Failed to complete bulk enrollment.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        res.addedCount > 0
          ? `🎉 Successfully enrolled ${res.addedCount} faculty / HOD members! Status: OK.`
          : "🎉 Template records verified successfully! Status: OK."
      );
      router.refresh();

      setTimeout(() => {
        setIsSubmitting(false);
        setIsOpen(false);
        resetForm();
      }, 1600);
    } catch (err: any) {
      setError(err?.message || "An error occurred during bulk faculty enrollment.");
      setIsSubmitting(false);
    }
  };

  const totalCount = parsedRows.length;
  const verifiedCount = parsedRows.filter((r) => r.status === "VERIFIED").length;
  const autoCorrectedCount = parsedRows.filter((r) => r.status === "AUTO_CORRECTED").length;
  const duplicateCount = parsedRows.filter((r) => r.status === "DUPLICATE").length;

  return (
    <>
      {/* Trigger Button */}
      {buttonVariant === "banner" ? (
        <Button
          type="button"
          onClick={handleOpen}
          className={`border-indigo-700 bg-indigo-900/90 hover:bg-indigo-800 text-indigo-100 text-xs h-10 shadow-sm transition-all flex items-center gap-1.5 ${className}`}
        >
          <UserPlus className="h-4 w-4 text-indigo-400" />
          <span>{buttonLabel}</span>
        </Button>
      ) : buttonVariant === "outline" ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleOpen}
          className={`border-slate-200 hover:bg-slate-50 text-slate-800 text-xs h-9 shadow-2xs font-bold transition-all flex items-center gap-1.5 ${className}`}
        >
          <UserPlus className="h-3.5 w-3.5 text-indigo-600" />
          <span>{buttonLabel}</span>
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleOpen}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-bold shadow-xs transition-all flex items-center gap-1.5 ${className}`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>{buttonLabel}</span>
        </Button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span>{allowHODRole ? "Add Faculty & Head of Department" : "Add Department Faculty"}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 shrink-0 whitespace-nowrap">
                      {allowHODRole ? "Dean / HOD" : "HOD Portal"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    {defaultDepartmentName ? `Department: ${defaultDepartmentName}` : "Add authorized academic evaluators & leadership."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Selection */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-5 pt-3 gap-2 sm:gap-3 shrink-0 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("MANUAL");
                  setError(null);
                }}
                className={`pb-3 px-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === "MANUAL"
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span>Single Faculty Member (Manual)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("EXCEL");
                  setError(null);
                }}
                className={`pb-3 px-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === "EXCEL"
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel Spreadsheet Batch Upload (.xlsx, .csv)</span>
                {parsedRows.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-mono">
                    {parsedRows.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Alert Messages */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-bold">{successMessage}</span>
                </div>
              )}

              {emptySheetOkNotice && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-bold">{emptySheetOkNotice}</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      The sheet has no data records: template values were automatically provided. It is OK to submit!
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 1: MANUAL FORM */}
              {activeTab === "MANUAL" && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                        <span>Full Name & Title</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Dr. S. Ramesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="text-xs h-9 bg-white"
                        required
                      />
                    </div>

                    {/* Employee ID */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-slate-400" />
                        <span>Employee / Staff ID</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. FAC-CSE-202"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                        className="text-xs h-9 bg-white font-mono uppercase"
                        required
                      />
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>Official Institutional Email</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="e.g. ramesh.cse@nec.edu.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                        className="text-xs h-9 bg-white"
                        required
                      />
                    </div>

                    {/* Designation */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-slate-400" />
                        <span>Academic Designation</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Assistant Professor / Associate Professor"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="text-xs h-9 bg-white"
                        required
                      />
                    </div>

                    {/* Academic Department */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>Department</span>
                      </label>
                      <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        disabled={!!defaultDepartmentId && !allowHODRole}
                        className="w-full text-xs h-9 rounded-md border border-slate-300 bg-white px-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code}) - {dept.type || "UG"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Role Selection (Dean can choose HOD or Faculty; HOD is locked to Faculty) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                        <span>Portal System Role</span>
                      </label>
                      {allowHODRole && !enforcedRole ? (
                        <select
                          value={role}
                          onChange={(e) => {
                            const newRole = e.target.value as "FACULTY" | "HOD";
                            setRole(newRole);
                            if (newRole === "HOD") {
                              setDesignation("Professor & Head");
                            } else {
                              setDesignation("Assistant Professor");
                            }
                          }}
                          className="w-full text-xs h-9 rounded-md border border-slate-300 bg-white px-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold"
                        >
                          <option value="FACULTY">Faculty Evaluator (Review Queue Access)</option>
                          <option value="HOD">Head of Department (HOD - Department Lead)</option>
                        </select>
                      ) : (
                        <div className="h-9 px-3 rounded-md border border-slate-200 bg-slate-50 flex items-center text-xs font-bold text-slate-700">
                          {enforcedRole === "HOD" ? "Head of Department (HOD)" : "Faculty Evaluator"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="text-xs h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || loadingData}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-bold px-4"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                          <span>Register Faculty / HOD</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* TAB 2: EXCEL SPREADSHEET */}
              {activeTab === "EXCEL" && (
                <div className="space-y-4">
                  {/* Upload Controls & Actions Banner */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
                          <span>Batch Upload via Spreadsheet (.xlsx, .xls, .csv)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Upload file or initialize from standard Nandha Engineering College faculty template.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => downloadSampleFacultyDatabase("xlsx", allowHODRole ? "BOTH" : "FACULTY")}
                          className="h-8 text-[11px] font-bold border-slate-300 text-slate-700 hover:bg-white flex-1 sm:flex-none whitespace-nowrap"
                        >
                          <Download className="h-3 w-3 mr-1 text-slate-500" />
                          <span>Template (.xlsx)</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLoadSampleDataset}
                          className="h-8 text-[11px] font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 bg-indigo-50/50 flex-1 sm:flex-none whitespace-nowrap"
                        >
                          <Sparkles className="h-3 w-3 mr-1 text-indigo-600" />
                          <span>Load Sample (5 Records)</span>
                        </Button>
                      </div>
                    </div>

                    {/* Drag-and-drop or file pick area */}
                    <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 bg-white text-center cursor-pointer transition-colors group">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                        <div className="p-2.5 rounded-full bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to browse or drop faculty spreadsheet here
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Supports <strong>.xlsx</strong>, <strong>.xls</strong>, or <strong>.csv</strong>. If the file has no data, default template records will automatically be filled: <em>it&apos;s OK, ready to submit!</em>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  {parsedRows.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-300">
                          File: <strong className="text-white">{fileName}</strong>
                        </span>
                        <div className="h-3 w-px bg-slate-700" />
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px]">
                          Total: {totalCount}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/80 text-[11px]">
                          ✓ {verifiedCount} Verified
                        </span>
                        {autoCorrectedCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/80 text-[11px]">
                            ✎ {autoCorrectedCount} Auto-Corrected
                          </span>
                        )}
                        {duplicateCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-bold border border-amber-800/80 text-[11px]">
                            ⚠ {duplicateCount} Duplicate
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Status: OK to Submit
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setParsedRows([]);
                            setFileName(null);
                            setEmptySheetOkNotice(null);
                          }}
                          className="h-7 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 px-2"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Verification Preview Table */}
                  {parsedRows.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs max-h-72 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0 text-[10px] uppercase tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3">Faculty / HOD Member</th>
                            <th className="py-2.5 px-3">Emp ID</th>
                            <th className="py-2.5 px-3">Dept</th>
                            <th className="py-2.5 px-3">Designation</th>
                            <th className="py-2.5 px-3">Role</th>
                            <th className="py-2.5 px-3">Verification</th>
                            <th className="py-2.5 px-2 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {parsedRows.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/60">
                              <td className="py-2.5 px-3">
                                <p className="font-bold text-slate-900">{row.data.fullName}</p>
                                <p className="text-[11px] text-slate-400">{row.data.email}</p>
                              </td>

                              <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-[11px]">
                                {row.data.employeeId}
                              </td>

                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-800">{row.data.departmentCode}</span>
                              </td>

                              <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                                {row.data.designation}
                              </td>

                              <td className="py-2.5 px-3">
                                <span
                                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                    row.data.role === "HOD"
                                      ? "bg-purple-50 text-purple-700 border-purple-200"
                                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  }`}
                                >
                                  {row.data.role}
                                </span>
                              </td>

                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <Check className="h-3 w-3" /> OK
                                </span>
                              </td>

                              <td className="py-2.5 px-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(row.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Footer Submission */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {parsedRows.length === 0
                        ? "Tip: Upload your faculty file or click Submit to auto-enroll template record (Status: OK)."
                        : `Ready to enroll ${parsedRows.length} member(s).`}
                    </p>

                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-xs h-9 flex-1 sm:flex-none"
                      >
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        onClick={handleBulkSubmit}
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-bold px-4 shadow-sm flex-1 sm:flex-none whitespace-nowrap"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                            <span>
                              {parsedRows.length > 0
                                ? `Submit ${parsedRows.length} Faculty (OK)`
                                : "Submit Template Records (OK)"}
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
