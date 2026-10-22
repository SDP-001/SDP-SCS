"use client";

import React, { useState } from "react";
import { Sparkles, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DigitalPassportPopModal, PassportRecord } from "./DigitalPassportPopModal";

interface PassportData {
  studentName: string;
  registerNumber: string;
  departmentName: string;
  academicYear: number;
  totalPoints: number;
  records: PassportRecord[];
  collegeName: string;
}

interface DigitalPassportTriggerProps {
  initialData?: PassportData;
  variant?: "navbar" | "dashboard" | "outline" | "sidebar";
  label?: string;
  className?: string;
}

export function DigitalPassportTrigger({
  initialData,
  variant = "dashboard",
  label = "Digital Passport",
  className = "",
}: DigitalPassportTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [passportData, setPassportData] = useState<PassportData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!passportData) {
      try {
        setIsLoading(true);
        const res = await fetch("/api/student/passport");
        if (res.ok) {
          const data = await res.json();
          setPassportData(data);
        }
      } catch (err) {
        console.error("Failed to load passport data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    setIsOpen(true);
  };

  const renderButton = () => {
    if (variant === "navbar") {
      return (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-600/10 text-amber-900 border border-amber-300 hover:shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer ${className}`}
          title="Open Verified Digital Passport in Pop View"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          <span>{label}</span>
        </button>
      );
    }

    if (variant === "sidebar") {
      return (
        <button
          type="button"
          onClick={handleOpen}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all text-left group cursor-pointer ${className}`}
          title="Open Digital Passport Pop View"
        >
          <Sparkles className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
          <span className="flex-1">{label}</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            Pop View
          </span>
        </button>
      );
    }

    if (variant === "outline") {
      return (
        <Button
          type="button"
          onClick={handleOpen}
          variant="outline"
          className={`border-slate-300 text-slate-700 font-bold text-xs h-10 px-4 rounded-xl shadow-xs flex items-center gap-1.5 hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 cursor-pointer ${className}`}
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>{label}</span>
        </Button>
      );
    }

    // Default: dashboard button
    return (
      <Button
        type="button"
        onClick={handleOpen}
        variant="outline"
        className={`w-full sm:w-auto border-white/25 bg-white/15 hover:bg-white/25 text-white text-xs h-11 px-4 rounded-xl shadow-xs backdrop-blur-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${className}`}
      >
        <Award className="h-4 w-4 text-amber-300" />
        <span className="font-semibold">{isLoading ? "Loading..." : label}</span>
      </Button>
    );
  };

  return (
    <>
      {renderButton()}

      <DigitalPassportPopModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        studentName={passportData?.studentName}
        registerNumber={passportData?.registerNumber}
        departmentName={passportData?.departmentName}
        academicYear={passportData?.academicYear}
        totalPoints={passportData?.totalPoints}
        records={passportData?.records}
        collegeName={passportData?.collegeName}
      />
    </>
  );
}
