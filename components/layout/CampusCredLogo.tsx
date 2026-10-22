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
      <div className={`relative flex flex-col items-center text-center group ${className}`}>
        {/* Ambient Pulsing Glow Halo */}
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/25 via-indigo-500/30 to-cyan-500/25 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 pointer-events-none" />

        {/* Emblem Container Card with Glassmorphic Rim */}
        <div className="relative p-1 rounded-2xl bg-gradient-to-b from-white/90 via-slate-100/80 to-white/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-white/60 dark:border-slate-700/80 shadow-xl shadow-indigo-950/20 backdrop-blur-md transition-all duration-300 group-hover:-translate-y-1">
          <div className="relative flex items-center justify-center rounded-xl bg-white px-3 py-2 overflow-hidden shadow-inner">
            {/* Subtle animated light sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nec-logo.png"
              alt="Nandha Engineering College (NEC) Official Crest"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm select-none"
            />
          </div>
        </div>

        {showText && (
          <div className="mt-3 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                NANDHA <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300">ENGINEERING COLLEGE</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-xs">
                Autonomous
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              Affiliated to Anna University • Accredited by NAAC with &apos;A+&apos; Grade • Erode, TN
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Official Nandha Engineering College Emblem with Attractive Aura */}
      <div className="relative shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-emerald-500/20 rounded-xl blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div
          className="relative flex items-center justify-center rounded-xl bg-white p-1.5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden ring-1 ring-slate-900/5 group-hover:scale-[1.02]"
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
            <span className={`font-black text-xl tracking-tight leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              NEC <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-emerald-500">Portal</span>
            </span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary-500/15 text-primary-400 border border-primary-500/30 tracking-wider">
              Autonomous
            </span>
          </div>
          {subtitle ? (
            <span className={`text-[11px] font-medium tracking-tight leading-none mt-0.5 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              {subtitle}
            </span>
          ) : (
            <span className={`text-[10px] font-semibold tracking-tight leading-none mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Nandha Engineering College • Erode
            </span>
          )}
        </div>
      )}
    </div>
  );
}
