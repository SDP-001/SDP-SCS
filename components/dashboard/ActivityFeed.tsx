"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/formatters";
import { Activity, Bell, FileCheck, CheckCircle2, AlertTriangle, Award } from "lucide-react";
import Link from "next/link";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "submission" | "approval" | "correction" | "points" | "system";
  link?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  emptyMessage?: string;
}

export function ActivityFeed({
  activities,
  emptyMessage = "No recent activity recorded.",
}: ActivityFeedProps) {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "approval":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "correction":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "points":
        return <Award className="h-4 w-4 text-cyan-400" />;
      case "submission":
        return <FileCheck className="h-4 w-4 text-indigo-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Card className="p-5 border-slate-800/80 bg-[#0d1322]/90 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Institutional Activity Ledger
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>LIVE_STREAM</span>
        </span>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center font-mono">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-850/80 border border-slate-800/60 transition-all hover:border-cyan-500/30"
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 shrink-0">
                {getIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-bold text-white truncate">{act.title}</p>
                  <span className="text-[10px] text-cyan-400 font-mono shrink-0">
                    {formatDateTime(act.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{act.description}</p>
                {act.link && (
                  <Link
                    href={act.link}
                    className="text-[11px] font-mono font-semibold text-cyan-400 hover:text-cyan-300 hover:underline mt-1 inline-block"
                  >
                    View audit →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
