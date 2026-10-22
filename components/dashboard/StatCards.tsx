"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Award, FileCheck2, Clock, AlertTriangle, ArrowUpRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface StatItem {
  title: string;
  value: number | string;
  description?: string;
  iconName: "award" | "check" | "clock" | "alert" | "trending";
  change?: string;
  variant?: "primary" | "emerald" | "amber" | "rose" | "indigo";
}

interface StatCardsProps {
  stats: StatItem[];
}

export function StatCards({ stats }: StatCardsProps) {
  const getIcon = (name: StatItem["iconName"]) => {
    switch (name) {
      case "award":
        return Award;
      case "check":
        return FileCheck2;
      case "clock":
        return Clock;
      case "alert":
        return AlertTriangle;
      case "trending":
        return TrendingUp;
    }
  };

  const getVariantStyles = (variant: StatItem["variant"] = "primary") => {
    switch (variant) {
      case "emerald":
        return {
          iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
          valColor: "text-slate-900",
          topBar: "from-emerald-500 to-teal-500",
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          glowDot: "bg-emerald-500",
        };
      case "amber":
        return {
          iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
          valColor: "text-slate-900",
          topBar: "from-amber-500 to-orange-500",
          badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
          glowDot: "bg-amber-500",
        };
      case "rose":
        return {
          iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
          valColor: "text-slate-900",
          topBar: "from-rose-500 to-pink-500",
          badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
          glowDot: "bg-rose-500",
        };
      case "indigo":
        return {
          iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
          valColor: "text-slate-900",
          topBar: "from-indigo-500 to-violet-500",
          badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          glowDot: "bg-indigo-500",
        };
      case "primary":
      default:
        return {
          iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
          valColor: "text-slate-900",
          topBar: "from-blue-500 to-indigo-500",
          badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
          glowDot: "bg-blue-500",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((stat, i) => {
        const Icon = getIcon(stat.iconName);
        const styles = getVariantStyles(stat.variant);

        return (
          <Card
            key={i}
            className="p-5 bg-white border border-slate-200/90 rounded-2xl relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group cursor-default shadow-xs"
          >
            {/* Top Color Accent Line */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-90 transition-all duration-200",
                styles.topBar
              )}
            />

            <div className="relative z-10 flex items-start justify-between mt-1">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", styles.glowDot)} />
                  <p className="text-xs font-semibold text-slate-500">
                    {stat.title}
                  </p>
                </div>
                <h3 className={cn("text-2xl sm:text-3xl font-extrabold tracking-tight", styles.valColor)}>
                  {stat.value}
                </h3>
              </div>
              <div
                className={cn(
                  "p-3 rounded-xl transition-all duration-200 group-hover:scale-105 shadow-2xs",
                  styles.iconBg
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            {(stat.description || stat.change) && (
              <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span className="truncate pr-2 font-medium text-[11px] text-slate-500">
                  {stat.description}
                </span>
                {stat.change && (
                  <span
                    className={cn(
                      "inline-flex items-center font-semibold text-[10px] px-2 py-0.5 rounded-full border shrink-0",
                      styles.badgeBg
                    )}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    {stat.change}
                  </span>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
