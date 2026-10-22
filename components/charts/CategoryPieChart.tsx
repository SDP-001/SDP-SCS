"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

export interface CategoryMetric {
  name: string;
  value: number;
}

interface CategoryPieChartProps {
  data: CategoryMetric[];
  title?: string;
  subtitle?: string;
}

const COLORS = [
  "#06b6d4", // cyber cyan
  "#10b981", // cyber emerald
  "#8b5cf6", // cyber violet
  "#f59e0b", // cyber amber
  "#f43f5e", // cyber rose
  "#38bdf8", // neon sky
  "#d946ef", // neon fuchsia
  "#64748b", // slate
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    payload?: {
      name: string;
      value: number;
      fill?: string;
    };
  }>;
}

function CustomCategoryTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const categoryName = item.name || item.payload?.name || "Category";
    const count = item.value ?? item.payload?.value ?? 0;
    const color = item.payload?.fill || item.color || "#06b6d4";

    return (
      <div className="bg-[#070a14]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] text-xs space-y-1.5 z-50">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
            style={{ backgroundColor: color, color }}
          />
          <span className="font-bold text-white font-mono text-xs">{categoryName}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 text-[11px]">
          <span className="text-slate-400 font-medium">Approved Credits:</span>
          <span className="font-mono font-bold text-cyan-300 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-xs">
            {count}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function CategoryPieChart({
  data,
  title = "Achievement Category Breakdown",
  subtitle = "Distribution of student credentials by institutional category",
}: CategoryPieChartProps) {
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
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
            No categorized achievements to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomCategoryTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
