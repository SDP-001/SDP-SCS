"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

export interface DepartmentMetric {
  department: string;
  approved: number;
  underReview: number;
  totalPoints: number;
}

interface DepartmentDistributionChartProps {
  data: DepartmentMetric[];
  title?: string;
  subtitle?: string;
}

interface CustomDeptTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
}

function CustomDeptTooltip({ active, payload, label }: CustomDeptTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#070a14]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] text-xs space-y-1.5 z-50">
        <p className="font-bold text-cyan-300 font-mono text-xs border-b border-slate-800 pb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`entry-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function DepartmentDistributionChart({
  data,
  title = "Department Achievement Distribution",
  subtitle = "Approved certificates and points earned across academic departments",
}: DepartmentDistributionChartProps) {
  return (
    <Card className="p-5 sm:p-6 rounded-3xl bg-[#0d1322]/90 border border-slate-800/80 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-4">
      {/* Laser Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80" />

      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <p className="text-xs text-slate-400 font-mono mt-0.5">{subtitle}</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis
              dataKey="department"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <Tooltip
              content={<CustomDeptTooltip />}
              cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              iconType="circle"
            />
            <Bar
              dataKey="approved"
              name="Approved Certs"
              fill="#06b6d4"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="underReview"
              name="In Verification"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="totalPoints"
              name="Points Awarded"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
