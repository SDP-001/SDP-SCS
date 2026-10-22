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
          iconBg: "bg-emerald-950/70 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/20",
          valColor: "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]",
          topBar: "from-emerald-500 via-teal-400 to-cyan-400",
          hoverBorder: "hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
          badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 font-mono",
          glowDot: "bg-emerald-400 shadow-[0_0_8px_#10b981]",
        };
      case "amber":
        return {
          iconBg: "bg-amber-950/70 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/20",
          valColor: "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]",
          topBar: "from-amber-500 via-orange-400 to-yellow-400",
          hoverBorder: "hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
          badgeBg: "bg-amber-950/80 text-amber-300 border-amber-500/40 font-mono",
          glowDot: "bg-amber-400 shadow-[0_0_8px_#f59e0b]",
        };
      case "rose":
        return {
          iconBg: "bg-rose-950/70 text-rose-400 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/20",
          valColor: "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]",
          topBar: "from-rose-500 via-pink-400 to-red-400",
          hoverBorder: "hover:border-rose-500/60 hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]",
          badgeBg: "bg-rose-950/80 text-rose-300 border-rose-500/40 font-mono",
          glowDot: "bg-rose-400 shadow-[0_0_8px_#f43f5e]",
        };
      case "indigo":
        return {
          iconBg: "bg-indigo-950/70 text-indigo-400 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.3)] ring-1 ring-indigo-500/20",
          valColor: "text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]",
          topBar: "from-indigo-500 via-violet-400 to-cyan-400",
          hoverBorder: "hover:border-indigo-500/60 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]",
          badgeBg: "bg-indigo-950/80 text-indigo-300 border-indigo-500/40 font-mono",
          glowDot: "bg-indigo-400 shadow-[0_0_8px_#6366f1]",
        };
      case "primary":
      default:
        return {
          iconBg: "bg-cyan-950/70 text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/20",
          valColor: "text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]",
          topBar: "from-cyan-500 via-sky-400 to-indigo-500",
          hoverBorder: "hover:border-cyan-500/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]",
          badgeBg: "bg-cyan-950/80 text-cyan-300 border-cyan-500/40 font-mono",
          glowDot: "bg-cyan-400 shadow-[0_0_8px_#06b6d4]",
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
            className={cn(
              "p-5 bg-[#0d1322]/90 border border-slate-800/90 rounded-2xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group cursor-default shadow-xl backdrop-blur-xl cyber-hud-corner",
              styles.hoverBorder
            )}
          >
            {/* Top Glowing Laser Accent Bar */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-90 group-hover:h-1.5 transition-all duration-200",
                styles.topBar
              )}
            />

            {/* Subtle Tech Telemetry Background Grid */}
            <div className="absolute inset-0 cyber-dots-bg opacity-30 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between mt-1">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", styles.glowDot)} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                    {stat.title}
                  </p>
                </div>
                <h3 className={cn("text-2xl sm:text-3xl font-black tracking-tight font-mono", styles.valColor)}>
                  {stat.value}
                </h3>
              </div>
              <div
                className={cn(
                  "p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110",
                  styles.iconBg
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            {(stat.description || stat.change) && (
              <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                <span className="truncate pr-2 font-medium text-[11px] text-slate-400">
                  {stat.description}
                </span>
                {stat.change && (
                  <span
                    className={cn(
                      "inline-flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full border shrink-0 tracking-wider",
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
