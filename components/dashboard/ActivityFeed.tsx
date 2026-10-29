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
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "correction":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "points":
        return <Award className="h-4 w-4 text-blue-600" />;
      case "submission":
        return <FileCheck className="h-4 w-4 text-indigo-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <Card className="p-5 border-slate-200/90 bg-white shadow-xs rounded-2xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Activity Ledger
          </h3>
        </div>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition-all"
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-200 shrink-0 shadow-2xs">
                {getIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {formatDateTime(act.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{act.description}</p>
                {act.link && (
                  <Link
                    href={act.link}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline mt-1 inline-block"
                  >
                    View details →
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
