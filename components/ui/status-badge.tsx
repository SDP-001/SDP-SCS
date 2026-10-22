import React from "react";
import { CertificateStatus } from "@/types/database.types";
import {
  CheckCircle2,
  Clock,
  Search,
  AlertTriangle,
  XCircle,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatusBadgeProps {
  status: CertificateStatus;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function StatusBadge({ status, className, size = "default" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    default: "px-2.5 py-1 text-xs font-semibold gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  switch (status) {
    case "APPROVED":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-mono text-[11px] shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/20 uppercase tracking-wider",
            sizeClasses[size],
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <CheckCircle2 className={cn("text-emerald-400", iconSizes[size])} />
          <span>Verified</span>
        </span>
      );

    case "SUBMITTED":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-mono text-[11px] shadow-[0_0_12px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/20 uppercase tracking-wider",
            sizeClasses[size],
            className
          )}
        >
          <Clock className={cn("text-cyan-400", iconSizes[size])} />
          <span>Queueing</span>
        </span>
      );

    case "UNDER_REVIEW":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 font-mono text-[11px] shadow-[0_0_12px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/20 uppercase tracking-wider",
            sizeClasses[size],
            className
          )}
        >
          <Search className={cn("text-indigo-400", iconSizes[size])} />
          <span>Evaluating</span>
        </span>
      );

    case "CORRECTION_REQUIRED":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-amber-950/70 text-amber-300 border border-amber-500/40 font-mono text-[11px] shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/20 uppercase tracking-wider",
            sizeClasses[size],
            className
          )}
        >
          <AlertTriangle className={cn("text-amber-400", iconSizes[size])} />
          <span>Action Req</span>
        </span>
      );

    case "REJECTED":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-rose-950/70 text-rose-300 border border-rose-500/40 font-mono text-[11px] shadow-[0_0_12px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/20 uppercase tracking-wider",
            sizeClasses[size],
            className
          )}
        >
          <XCircle className={cn("text-rose-400", iconSizes[size])} />
          <span>Rejected</span>
        </span>
      );

    case "DRAFT":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/80 font-mono text-[11px] uppercase tracking-wider",
            sizeClasses[size],
            className
          )}
        >
          <FileEdit className={cn("text-slate-400", iconSizes[size])} />
          <span>Draft</span>
        </span>
      );
  }
}
