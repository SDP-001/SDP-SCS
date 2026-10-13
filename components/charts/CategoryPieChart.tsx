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
  "#0284c7", // primary sky
  "#10b981", // emerald
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
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
    const color = item.payload?.fill || item.color || "#10b981";

    return (
      <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-xl text-xs space-y-1 z-50">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: color }}
          />
          <span className="font-bold text-slate-800 text-xs">{categoryName}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 text-[11px]">
          <span className="text-slate-500 font-medium">Approved Credits:</span>
          <span className="font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-xs">
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
    <Card className="p-5 border-slate-200 bg-white">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
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
              <Tooltip
                content={<CustomCategoryTooltip />}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  color: "#0f172a",
                  fontSize: "12px",
                }}
                itemStyle={{
                  color: "#0f172a",
                  fontWeight: "bold",
                }}
                labelStyle={{
                  color: "#334155",
                  fontWeight: "bold",
                }}
              />
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
