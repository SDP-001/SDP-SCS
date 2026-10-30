"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { CampusCredLogo } from "@/components/layout/CampusCredLogo";
import { formatDate } from "@/lib/utils/formatters";
import {
  X,
  Printer,
  Sparkles,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PassportRecord {
  id: string;
  achievement_id?: string | null;
  title: string;
  achievement: string;
  categoryName?: string;
  organizer: string;
  event_date: string;
  points: number;
}

export interface DigitalPassportPopModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  registerNumber?: string;
  departmentName?: string;
  academicYear?: number;
  totalPoints?: number;
  records?: PassportRecord[];
  collegeName?: string;
}

export function DigitalPassportPopModal({
  isOpen,
  onClose,
  studentName = "Student Name",
  registerNumber = "710022CS0101",
  departmentName = "Computer Science & Engineering",
  academicYear = 3,
  totalPoints = 70,
  records = [],
  collegeName = "Nandha Engineering College (Autonomous)",
}: DigitalPassportPopModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !mounted) return null;

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="passport-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/95 sm:bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 isolate"
      onClick={onClose}
    >
      <div
        className="relative z-[100000] w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Action Toolbar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  id="passport-modal-title"
                  className="text-sm sm:text-base font-bold text-white truncate"
                >
                  Digital Achievement Passport
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified Pop View
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {collegeName} • Official Verification Record
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handlePrint}
              size="sm"
              className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              title="Print Official Passport Document"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Passport</span>
            </Button>

            <Button
              onClick={onClose}
              size="sm"
              className="h-8 w-8 p-0 rounded-xl bg-slate-800 hover:bg-rose-600 text-white border border-slate-700 transition-colors"
              title="Close Pop View (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Scrollable Canvas Body */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8 bg-slate-100 opacity-100 text-slate-900">
          <div className="print-passport bg-white opacity-100 border border-slate-300 rounded-2xl p-5 sm:p-10 shadow-lg space-y-6 max-w-3xl mx-auto relative z-10">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between border-b-2 border-slate-900 pb-5 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                    NANDHA AUTONOMOUS VERIFICATION CELL
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  {collegeName}
                </h2>
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Office of Academic Affairs • Student Achievement Directorate
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200 mt-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary-600" />
                  <span>Official Co-Curricular Achievement Passport</span>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <CampusCredLogo size={34} />
                <p className="text-[10px] font-mono font-bold text-slate-400 mt-1">
                  SHA-256 VERIFIED RECORD
                </p>
              </div>
            </div>

            {/* Student Credential Header Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Student Name</span>
                <span className="font-bold text-slate-900 text-sm">{studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Register Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{registerNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Department &amp; Year</span>
                <span className="font-bold text-slate-900">
                  {departmentName} (Yr {academicYear})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Verified Credits</span>
                <span className="font-black text-emerald-700 text-base">+{totalPoints} PTS</span>
              </div>
            </div>

            {/* Achievements Ledger Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Verified Achievement Records Ledger
                </h4>
                <span className="text-xs font-semibold text-slate-500">
                  {records.length} Approved Entries
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Achievement ID</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Credential Title &amp; Standing</th>
                      <th className="py-2.5 px-3">Organizer</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                          No approved certificates recorded yet.
                        </td>
                      </tr>
                    ) : (
                      records.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-emerald-700">
                            {cert.achievement_id || "ACH-VERIFIED"}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                              {cert.categoryName || "General"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-slate-900">{cert.title}</p>
                            <p className="text-[11px] text-slate-500">{cert.achievement}</p>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{cert.organizer}</td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {formatDate(cert.event_date)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700 font-mono">
                            +{cert.points} PTS
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Certification Affirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t-2 border-slate-900 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Institutional Verification Affirmation</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  This Achievement Passport is an official co-curricular record generated from the Nandha Engineering College Autonomous Verification Vault. Each credential has undergone verification by authorized faculty evaluators.
                </p>
              </div>

              <div className="flex flex-col justify-end items-end text-right space-y-1">
                <div className="h-10 w-44 border-b border-slate-400 flex items-center justify-center text-slate-300 italic font-serif text-[11px]">
                  [Authorized Faculty / HOD Seal]
                </div>
                <p className="text-[11px] font-bold text-slate-800">Department Coordinator / Dean</p>
                <p className="text-[10px] text-slate-400">Date Issued: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Status Bar */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px] text-emerald-400 font-semibold">
            ✓ Digital Passport Pop View Active
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
