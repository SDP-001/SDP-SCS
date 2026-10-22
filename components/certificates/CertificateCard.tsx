"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Certificate, CertificateFile, Category, PointRecord } from "@/types/database.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { Calendar, Award, Building, FileText, ChevronRight, AlertCircle, Clock, Eye } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import { CertificatePopViewModal } from "./CertificatePopViewModal";

interface CertificateCardProps {
  certificate: Certificate & {
    category?: Category;
    files?: CertificateFile[];
    points?: PointRecord[];
  };
  baseHref?: string;
}

export function CertificateCard({ certificate, baseHref = "/student/certificates" }: CertificateCardProps) {
  const [isPopOpen, setIsPopOpen] = useState(false);
  const latestPoints = certificate.points?.find((p) => p.is_latest)?.points;
  const primaryFile = certificate.files?.find((f) => f.file_type === "PRIMARY");
  const targetHref = `${baseHref}/${certificate.id}`;

  const getStatusAccent = () => {
    switch (certificate.status) {
      case "APPROVED":
        return "from-emerald-500 via-teal-400 to-emerald-600";
      case "CORRECTION_REQUIRED":
        return "from-amber-500 via-orange-400 to-amber-600";
      case "REJECTED":
        return "from-rose-500 via-red-400 to-rose-600";
      default:
        return "from-primary-500 via-sky-400 to-indigo-600";
    }
  };

  return (
    <Link
      href={targetHref}
      className="block group h-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded-2xl transition-all"
    >
      <Card className="h-full hover:-translate-y-1.5 transition-all duration-300 border-slate-800/80 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col justify-between cursor-pointer bg-[#0d1322]/90 relative rounded-2xl card-sheen">
        {/* Top Status Laser Beam */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${getStatusAccent()}`} />

        <div className="p-5">
          {/* Header row: Category & Status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-500/30 truncate">
              {certificate.category?.name || "General"}
            </span>
            <StatusBadge status={certificate.status} />
          </div>

          {/* Title & Achievement ID */}
          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 mb-1">
            {certificate.title}
          </h3>

          {certificate.achievement_id && (
            <p className="text-xs font-mono font-bold text-emerald-400 mb-2">
              {certificate.achievement_id}
            </p>
          )}

          {/* Event Details */}
          <div className="space-y-1.5 text-xs text-slate-400 my-3">
            <div className="flex items-center gap-2">
              <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{certificate.event_name} • {certificate.organizer}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate font-medium text-slate-300">{certificate.achievement}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>Event: {formatDate(certificate.event_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 pt-1.5 border-t border-slate-800/80">
              <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px] truncate">
                Logged: <strong className="font-mono text-cyan-300 font-medium">{formatDateTime(certificate.submitted_at || certificate.created_at)}</strong>
              </span>
            </div>
          </div>

          {/* Warning if correction required */}
          {certificate.status === "CORRECTION_REQUIRED" && (
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Correction requested by faculty reviewer. Tap to view notes & upload revision.</span>
            </div>
          )}
        </div>

        {/* Footer bar */}
        <div className="px-5 py-3 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            {certificate.status === "APPROVED" && latestPoints !== undefined ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                +{latestPoints} PTS
              </span>
            ) : (
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                {primaryFile ? primaryFile.original_filename : "No attachment"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsPopOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:scale-105 active:scale-95"
              title="Open Certificate Pop View"
            >
              <Eye className="h-3.5 w-3.5 text-cyan-400" />
              <span>Pop View</span>
            </button>

            <div className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">
              <span className="hidden sm:inline">Details</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </Card>

      <CertificatePopViewModal
        isOpen={isPopOpen}
        onClose={() => setIsPopOpen(false)}
        title={certificate.title}
        achievementId={certificate.achievement_id}
        status={certificate.status}
        points={latestPoints}
        eventName={certificate.event_name}
        organizer={certificate.organizer}
        eventDate={certificate.event_date}
        eventLevel={certificate.event_level}
        achievement={certificate.achievement}
        submittedAt={certificate.submitted_at || certificate.created_at}
        files={certificate.files || []}
      />
    </Link>
  );
}
