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
      <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-xl text-xs space-y-1.5 z-50">
        <p className="font-black text-slate-800 text-xs border-b border-slate-100 pb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`entry-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
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
    <Card className="p-5 border-slate-200 bg-white">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="department"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <Tooltip
              content={<CustomDeptTooltip />}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                color: "#0f172a",
                fontSize: "12px",
              }}
              cursor={{ fill: "#f8fafc" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              iconType="circle"
            />
            <Bar
              dataKey="approved"
              name="Approved Certs"
              fill="#0284c7"
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
