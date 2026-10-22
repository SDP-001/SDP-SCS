"use client";

import React, { useState } from "react";
import { CertificateFile } from "@/types/database.types";
import { CertificatePopViewModal } from "./CertificatePopViewModal";
import { Button } from "@/components/ui/button";
import { Eye, Download, Maximize2 } from "lucide-react";

interface CertificatePopViewTriggerProps {
  title: string;
  achievementId?: string | null;
  status: string;
  points?: number;
  eventName?: string;
  organizer?: string;
  eventDate?: string;
  eventLevel?: string;
  achievement?: string;
  submittedAt?: string;
  files?: CertificateFile[];
  buttonText?: string;
  variant?: "primary" | "outline" | "compact";
  className?: string;
  showDownload?: boolean;
}

export function CertificatePopViewTrigger({
  title,
  achievementId,
  status,
  points,
  eventName,
  organizer,
  eventDate,
  eventLevel,
  achievement,
  submittedAt,
  files = [],
  buttonText = "Pop View",
  variant = "primary",
  className = "",
  showDownload,
}: CertificatePopViewTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const safeFiles = files || [];
  const primaryFile = safeFiles.find((f) => f.file_type === "PRIMARY") || safeFiles[0];
  const shouldShowDownload = showDownload !== undefined ? showDownload : (variant === "primary");

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!primaryFile) return;

    try {
      setIsDownloading(true);
      const downloadUrl = `/api/files/download?path=${encodeURIComponent(
        primaryFile.storage_path
      )}&filename=${encodeURIComponent(primaryFile.original_filename)}&download=1`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("File fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = primaryFile.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      const fallbackUrl = `/api/files/download?path=${encodeURIComponent(
        primaryFile.storage_path
      )}&filename=${encodeURIComponent(primaryFile.original_filename)}&download=1`;
      window.location.href = fallbackUrl;
    } finally {
      setIsDownloading(false);
    }
  };

  const renderTriggerButton = () => {
    if (variant === "compact") {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200/80 rounded-xl transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0"
          title="Open Certificate Pop View"
        >
          <Eye className="h-3.5 w-3.5 text-primary-600" />
          <span>{buttonText}</span>
        </button>
      );
    }

    if (variant === "outline") {
      return (
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-primary-700 hover:bg-primary-50/50 border-slate-200 rounded-xl transition-all shadow-2xs shrink-0"
          title="Open Certificate Pop View"
        >
          <Eye className="h-3.5 w-3.5 text-primary-600" />
          <span>{buttonText}</span>
        </Button>
      );
    }

    return (
      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shrink-0"
      >
        <Eye className="h-4 w-4" />
        <span>{buttonText}</span>
      </Button>
    );
  };

  return (
    <>
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {renderTriggerButton()}

        {shouldShowDownload && primaryFile && (
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            variant="outline"
            className="border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Download className={`h-3.5 w-3.5 ${isDownloading ? "animate-bounce" : ""}`} />
            <span>{isDownloading ? "Saving..." : "Download File"}</span>
          </Button>
        )}
      </div>

      <CertificatePopViewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        achievementId={achievementId}
        status={status}
        points={points}
        eventName={eventName}
        organizer={organizer}
        eventDate={eventDate}
        eventLevel={eventLevel}
        achievement={achievement}
        submittedAt={submittedAt}
        files={safeFiles}
      />
    </>
  );
}
