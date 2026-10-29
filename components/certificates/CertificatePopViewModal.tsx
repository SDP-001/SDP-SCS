"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CertificateFile } from "@/types/database.types";
import { formatFileSize, formatDateTime } from "@/lib/utils/formatters";
import {
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  X,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CertificatePopViewProps {
  isOpen: boolean;
  onClose: () => void;
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
  files: CertificateFile[];
}

export function CertificatePopViewModal({
  isOpen,
  onClose,
  title,
  achievementId,
  points,
  eventLevel,
  submittedAt,
  files,
}: CertificatePopViewProps) {
  // Sort files: Primary file first, then highest version to lowest version
  const sortedFiles = [...files].sort((a, b) => {
    if (a.file_type === "PRIMARY" && b.file_type !== "PRIMARY") return -1;
    if (b.file_type === "PRIMARY" && a.file_type !== "PRIMARY") return 1;
    return b.version - a.version;
  });

  const [selectedFileId, setSelectedFileId] = useState<string>(sortedFiles[0]?.id || "");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  useEffect(() => {
    if (sortedFiles.length > 0 && (!selectedFileId || !sortedFiles.some((f) => f.id === selectedFileId))) {
      setSelectedFileId(sortedFiles[0].id);
    }
  }, [sortedFiles, selectedFileId]);

  useEffect(() => {
    setUseIframeFallback(false);
  }, [selectedFileId]);

  const selectedFile = sortedFiles.find((f) => f.id === selectedFileId) || sortedFiles[0];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "r" || e.key === "R") {
        handleRotate();
      } else if (e.key === "0") {
        handleResetZoom();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
      setZoomLevel(1);
      setRotation(0);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const downloadUrl = selectedFile
    ? `/api/files/download?path=${encodeURIComponent(
        selectedFile.storage_path
      )}&filename=${encodeURIComponent(selectedFile.original_filename)}`
    : "";

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedFile) return;

    try {
      setIsDownloading(true);
      const targetUrl = `${downloadUrl}&download=1`;
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error("File fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const downloadName = selectedFile.original_filename;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.location.href = `${downloadUrl}&download=1`;
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!downloadUrl) return;
    const printWindow = window.open(downloadUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="popview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl h-[95dvh] sm:h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/nec-logo.png"
                alt="Nandha Engineering College Logo"
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  id="popview-title"
                  className="text-sm sm:text-base font-bold text-white truncate"
                >
                  {title}
                </h3>
                {achievementId && (
                  <span className="hidden sm:inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {achievementId}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Nandha Engineering College • Official Evidence Pop View
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700">
              <Button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-slate-300 hover:text-white"
                title="Zoom Out (-)"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <button
                onClick={handleResetZoom}
                className="px-2 text-[11px] font-mono font-bold text-primary-300 hover:text-white"
                title="Reset Zoom (0)"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <Button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-slate-300 hover:text-white"
                title="Zoom In (+)"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Rotate */}
            <Button
              onClick={handleRotate}
              variant="outline"
              size="sm"
              className="h-8 px-2.5 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              title="Rotate 90° (R)"
            >
              <RotateCw className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden md:inline">Rotate</span>
            </Button>

            {/* Direct Download Button */}
            <Button
              onClick={handleDownload}
              disabled={isDownloading || !selectedFile}
              size="sm"
              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm"
              title="Download Certificate File"
            >
              <Download className={`h-3.5 w-3.5 sm:mr-1.5 ${isDownloading ? "animate-bounce" : ""}`} />
              <span>{isDownloading ? "Saving..." : "Download"}</span>
            </Button>

            {/* Print */}
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex h-8 px-2.5 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              title="Print Certificate"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              <span>Print</span>
            </Button>

            {/* Close Button */}
            <Button
              onClick={onClose}
              size="sm"
              className="h-8 w-8 p-0 rounded-xl bg-slate-800 hover:bg-rose-600 text-white border border-slate-700 transition-colors ml-1"
              title="Close Pop View (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Versions Strip if multiple files */}
        {sortedFiles.length > 1 && (
          <div className="px-4 sm:px-6 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2 text-xs overflow-x-auto">
            <span className="text-slate-400 font-semibold shrink-0">Attached Versions:</span>
            {sortedFiles.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFileId(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  selectedFileId === f.id
                    ? "bg-primary-600 text-white shadow-xs"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                v{f.version} {f.file_type === "PRIMARY" ? "(Latest)" : "(Supp)"}
              </button>
            ))}
          </div>
        )}

        {/* Certificate Pop View Canvas */}
        <div
          className={`flex-1 min-h-0 ${
            zoomLevel > 1 ? "overflow-auto" : "overflow-hidden"
          } p-2 sm:p-4 flex items-center justify-center relative bg-slate-950/60`}
        >
          {/* Subtle Ambient Backlight */}
          <div className="absolute w-[450px] h-[300px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />

          {selectedFile ? (
            <div
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
              className="w-full h-full flex items-center justify-center max-w-full max-h-full"
            >
              {useIframeFallback ? (
                <iframe
                  src={downloadUrl}
                  title={title}
                  className="w-full h-full max-h-full rounded-xl shadow-2xl border border-slate-700 bg-white"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={downloadUrl}
                  alt={title}
                  onError={() => setUseIframeFallback(true)}
                  className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl border border-slate-700 bg-white select-none pointer-events-auto"
                />
              )}
            </div>
          ) : (
            <div className="text-center p-8 text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold text-sm">No Document Available</p>
            </div>
          )}
        </div>

        {/* Bottom Metadata & Info Strip */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {selectedFile && (
              <span className="font-mono text-slate-300 font-semibold truncate max-w-xs">
                {selectedFile.original_filename} ({formatFileSize(selectedFile.file_size)})
              </span>
            )}
            {eventLevel && (
              <>
                <span className="hidden sm:inline text-slate-700">•</span>
                <span className="capitalize text-slate-300 font-medium">
                  {eventLevel.toLowerCase().replace("_", " ")}
                </span>
              </>
            )}
            {submittedAt && (
              <>
                <span className="hidden sm:inline text-slate-700">•</span>
                <span className="text-slate-400">
                  Submitted: {formatDateTime(submittedAt)}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {points !== undefined && points > 0 && (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                +{points} PTS Verified
              </span>
            )}
            <span className="text-[11px] text-slate-500 font-semibold hidden md:inline">
              Nandha Engineering College Autonomous Archive
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
