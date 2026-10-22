import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  subtitle?: string;
  isDark?: boolean;
  variant?: "standard" | "showcase";
}

export function CampusCredLogo({
  className = "",
  size = 38,
  showText = true,
  subtitle,
  isDark = false,
  variant = "standard",
}: LogoProps) {
  // Respect official logo's aspect ratio (~1.46)
  const emblemWidth = Math.round(size * 1.46);

  if (variant === "showcase") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Clean Institutional Emblem Card */}
        <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nec-logo.png"
            alt="Nandha Engineering College (NEC) Official Crest"
            className="h-14 sm:h-16 w-auto object-contain select-none"
          />
        </div>

        {showText && (
          <div className="mt-3.5 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Nandha Engineering College
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Autonomous
              </span>
            </div>
            <p className={`text-xs mt-1 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {subtitle || "Accredited by NAAC with 'A+' Grade • Affiliated to Anna University • Erode"}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Official Nandha Engineering College Emblem */}
      <div className="relative shrink-0">
        <div
          className="relative flex items-center justify-center rounded-xl bg-white p-1 border border-slate-200 shadow-2xs hover:shadow-xs transition-all duration-200 overflow-hidden"
          style={{ height: size, width: emblemWidth }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nec-logo.png"
            alt="Nandha Engineering College (NEC) Official Logo"
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold text-xl tracking-tight leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              NEC <span className="text-blue-600">Portal</span>
            </span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 tracking-wider">
              Autonomous
            </span>
          </div>
          {subtitle ? (
            <span className={`text-[11px] font-medium tracking-tight leading-none mt-0.5 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              {subtitle}
            </span>
          ) : (
            <span className={`text-[10px] font-medium tracking-tight leading-none mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Nandha Engineering College • Erode
            </span>
          )}
        </div>
      )}
    </div>
  );
}
