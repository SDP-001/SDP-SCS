"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  loginAction,
  identifyUserAction,
  registerNewAccountAction,
  getDepartmentsForRegistrationAction,
  IdentifiedUser,
} from "@/actions/auth";
import {
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Users,
  Building2,
  Sparkles,
  UserPlus,
  Phone,
  Mail,
  KeyRound,
  RefreshCw,
  Building,
} from "lucide-react";

type UserRole = "STUDENT" | "FACULTY" | "HOD" | "ADMIN";

interface RoleOption {
  key: UserRole;
  label: string;
  badge: string;
  idLabel: string;
  placeholder: string;
  icon: React.ElementType;
  activeColor: string;
  activeBadge: string;
  sampleId: string;
}

const ROLES: RoleOption[] = [
  {
    key: "STUDENT",
    label: "Student",
    badge: "UG & PG",
    idLabel: "Student Register No. / Email",
    placeholder: "e.g. 710022CS0101 or student email",
    icon: GraduationCap,
    activeColor: "border-cyan-400 bg-cyan-950/60 text-cyan-200 ring-2 ring-cyan-500/30",
    activeBadge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    sampleId: "710022CS0101",
  },
  {
    key: "FACULTY",
    label: "Faculty",
    badge: "Evaluator",
    idLabel: "Faculty Employee ID / Email",
    placeholder: "e.g. FAC-CSE-101 or faculty email",
    icon: Users,
    activeColor: "border-emerald-400 bg-emerald-950/60 text-emerald-200 ring-2 ring-emerald-500/30",
    activeBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    sampleId: "FAC-CSE-101",
  },
  {
    key: "HOD",
    label: "HOD",
    badge: "Dept Head",
    idLabel: "HOD Employee ID / Email",
    placeholder: "e.g. FAC-CSE-001 or hod email",
    icon: Building2,
    activeColor: "border-purple-400 bg-purple-950/60 text-purple-200 ring-2 ring-purple-500/30",
    activeBadge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    sampleId: "FAC-CSE-001",
  },
  {
    key: "ADMIN",
    label: "Dean / Admin",
    badge: "Apex Admin",
    idLabel: "Administrator Email / User ID",
    placeholder: "e.g. admin@nandhaengg.org or admin",
    icon: ShieldCheck,
    activeColor: "border-amber-400 bg-amber-950/60 text-amber-200 ring-2 ring-amber-500/30",
    activeBadge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    sampleId: "admin@nandhaengg.org",
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: LOGIN vs REGISTER (Create New Account)
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Sign In Form state
  const [selectedRole, setSelectedRole] = useState<UserRole>("STUDENT");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  // Live Auto-Detection of User Account
  const [detectedUser, setDetectedUser] = useState<IdentifiedUser | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Registration Form State
  const [regRole, setRegRole] = useState<UserRole>("STUDENT");
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regIdentifier, setRegIdentifier] = useState("");
  const [regDepartmentId, setRegDepartmentId] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Departments for registration dropdown
  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string; code: string; type: string }>
  >([]);

  // Load URL query parameters and departments
  useEffect(() => {
    const modeParam = searchParams.get("mode")?.toLowerCase();
    const createParam = searchParams.get("create");
    if (modeParam === "register" || modeParam === "signup" || createParam === "true") {
      setAuthMode("REGISTER");
    }

    const roleParam = searchParams.get("role")?.toUpperCase();
    if (
      roleParam &&
      (roleParam === "STUDENT" ||
        roleParam === "FACULTY" ||
        roleParam === "HOD" ||
        roleParam === "ADMIN")
    ) {
      setSelectedRole(roleParam as UserRole);
      setRegRole(roleParam as UserRole);
    }

    const idParam = searchParams.get("id");
    if (idParam) {
      setIdentifier(idParam);
      setRegIdentifier(idParam);
    }

    // Fetch active departments for registration
    getDepartmentsForRegistrationAction()
      .then((depts) => {
        setDepartments(depts);
        if (depts.length > 0) {
          setRegDepartmentId(depts[0].id);
        }
      })
      .catch((err) => console.error("Failed to load departments:", err));
  }, [searchParams]);

  // Live identity detection on typing identifier in Login mode
  useEffect(() => {
    if (authMode !== "LOGIN") return;
    if (!identifier || identifier.trim().length < 2) {
      setDetectedUser(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsDetecting(true);
      try {
        const res = await identifyUserAction(identifier.trim());
        if (res.found && res.role) {
          setDetectedUser(res);
          setSelectedRole(res.role);
          setError(null);
          setShowRegisterPrompt(false);
        } else {
          setDetectedUser(null);
        }
      } catch (err) {
        setDetectedUser(null);
      } finally {
        setIsDetecting(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [identifier, authMode]);

  const activeConfig = ROLES.find((r) => r.key === (authMode === "LOGIN" ? selectedRole : regRole)) || ROLES[0];
  const ActiveRoleIcon = activeConfig.icon;

  const handleRoleSelect = (roleKey: UserRole) => {
    if (authMode === "LOGIN") {
      setSelectedRole(roleKey);
    } else {
      setRegRole(roleKey);
    }
    setError(null);
  };

  const handleQuickSampleSelect = (roleKey: UserRole, sampleId: string) => {
    setAuthMode("LOGIN");
    setSelectedRole(roleKey);
    setIdentifier(sampleId);
    setPassword("password123");
    setError(null);
    setShowRegisterPrompt(false);
  };

  const switchToRegisterWithId = (idToUse: string) => {
    setAuthMode("REGISTER");
    setError(null);
    setShowRegisterPrompt(false);
    setRegRole(selectedRole);
    if (idToUse.includes("@")) {
      setRegEmail(idToUse);
    } else {
      setRegIdentifier(idToUse);
    }
  };

  // Sign In submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(`Please enter your ${activeConfig.idLabel.toLowerCase()}.`);
      return;
    }
    if (!password) {
      setError("Please enter your account password.");
      return;
    }

    setLoading(true);
    setError(null);
    setShowRegisterPrompt(false);

    try {
      const res = await loginAction({ identifier: identifier.trim(), password });
      if (!res.success) {
        setError(res.error || "Authentication failed. Please verify your credentials.");
        if ((res as any).notFound) {
          setShowRegisterPrompt(true);
        }
        setLoading(false);
        return;
      }

      // Route directly to the user's authentic dashboard
      const targetUrl =
        res.role === "STUDENT"
          ? "/student/dashboard"
          : res.role === "FACULTY"
          ? "/faculty/dashboard"
          : res.role === "HOD"
          ? "/hod/dashboard"
          : res.role === "ADMIN"
          ? "/admin/dashboard"
          : "/login";

      window.location.href = targetUrl;
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during login.");
      setLoading(false);
    }
  };

  // Create New Account submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegSuccess(null);

    if (!regFullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      setError("Please enter a valid institutional email address.");
      return;
    }
    if (!regIdentifier.trim()) {
      setError(
        regRole === "STUDENT"
          ? "Please enter your Student Register Number."
          : "Please enter your Employee ID / User ID."
      );
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError("Password and confirmation password do not match.");
      return;
    }

    setRegLoading(true);

    try {
      const res = await registerNewAccountAction({
        role: regRole,
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        identifier: regIdentifier.trim(),
        departmentId: regDepartmentId || (departments[0]?.id ?? undefined),
        phoneNumber: regPhone.trim() || undefined,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });

      if (!res.success) {
        setError(res.error || "Failed to create account. Please check your information.");
        setRegLoading(false);
        return;
      }

      setRegSuccess(res.message || "Account created successfully! Entering portal...");

      // Automatically navigate to user dashboard via full page load to guarantee cookie persistence
      const targetUrl =
        res.role === "STUDENT"
          ? "/student/dashboard"
          : res.role === "FACULTY"
          ? "/faculty/dashboard"
          : res.role === "HOD"
          ? "/hod/dashboard"
          : res.role === "ADMIN"
          ? "/admin/dashboard"
          : "/";

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 500);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during registration.");
      setRegLoading(false);
    }
  };

  return (
    <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md my-auto">
      {/* Animated Brand Showcase Header */}
      <div className="text-center mb-5">
        <Link
          href="/login"
          className="group relative inline-block cursor-pointer transition-transform duration-500 hover:scale-105 active:scale-95"
          title="Nandha Engineering College"
        >
          {/* Outer Glowing Rotating Halo */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-400 opacity-70 blur-xl group-hover:opacity-100 group-hover:blur-2xl transition-all duration-700 pointer-events-none animate-spin-slow" />

          {/* Glassmorphic Frame with Floating Levitation */}
          <div className="relative rounded-2xl p-2 bg-gradient-to-b from-white/30 via-slate-800/80 to-slate-950/90 border border-white/40 shadow-2xl backdrop-blur-xl animate-float-levitate">
            <div className="relative flex items-center justify-center rounded-xl bg-white px-6 py-3 overflow-hidden shadow-inner">
              {/* Light Sweep Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none animate-beam-pass" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/nec-logo.png"
                alt="Nandha Engineering College (NEC) Logo"
                className="h-14 sm:h-18 w-auto object-contain drop-shadow-sm select-none"
              />
            </div>
          </div>
        </Link>

        {/* Institutional Title & Badge */}
        <div className="mt-3.5 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Autonomous Institution • NAAC &apos;A+&apos;</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
            {authMode === "LOGIN" ? "Institutional Sign In" : "Create New Account"}
          </h2>
          <p className="text-xs text-slate-400">
            {authMode === "LOGIN"
              ? "Nandha Engineering College • Achievement & Credential Management"
              : "Register with your Register Number or Email & set your own password"}
          </p>
        </div>
      </div>

      {/* Modern Mobile App Style Glassmorphic Card */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900/85 border border-slate-700/80 shadow-2xl shadow-indigo-950/40 backdrop-blur-2xl p-4 sm:p-6 space-y-4">
        
        {/* Mode Switcher Tabs: Sign In vs Create New Account */}
        <div className="flex rounded-2xl bg-slate-950/70 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setAuthMode("LOGIN");
              setError(null);
              setShowRegisterPrompt(false);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === "LOGIN"
                ? "bg-slate-800 text-white shadow-md border border-slate-700/80"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("REGISTER");
              setError(null);
              setShowRegisterPrompt(false);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
              authMode === "REGISTER"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5 text-white" />
            <span>Create New Account</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping absolute right-2.5 top-2.5" />
          </button>
        </div>

        {/* Role Selector: Student, Faculty, HOD, Dean */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Select Your Role</span>
              {authMode === "LOGIN" && (
                <span className="text-[10px] text-slate-500 font-normal">
                  (or type ID below to auto-detect)
                </span>
              )}
            </label>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeConfig.activeBadge}`}>
              {activeConfig.label} {authMode === "LOGIN" ? "Portal" : "Registration"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const currentRole = authMode === "LOGIN" ? selectedRole : regRole;
              const isSelected = currentRole === role.key;
              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => handleRoleSelect(role.key)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                    isSelected
                      ? role.activeColor
                      : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-[11px] font-bold truncate leading-none">
                    {role.label}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium leading-none">
                    {role.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODE 1: LOGIN FORM                                      */}
        {/* ======================================================== */}
        {authMode === "LOGIN" && (
          <>
            {/* Live Detected User Profile Card */}
            {detectedUser ? (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-850 to-indigo-950/60 border border-emerald-500/40 shadow-inner flex items-center justify-between gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                    {detectedUser.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={detectedUser.avatarUrl}
                        alt={detectedUser.fullName || ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (detectedUser.fullName || "User")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-white truncate block">
                        {detectedUser.fullName}
                      </span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-emerald-300 font-medium truncate">
                      {detectedUser.role} • {detectedUser.departmentName || detectedUser.identifier}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Verified
                </span>
              </div>
            ) : (
              /* Role Status Banner when no user is typed yet */
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Signing in as:</span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ActiveRoleIcon className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{activeConfig.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({activeConfig.badge})
                    </span>
                  </span>
                </div>
                {isDetecting && (
                  <span className="text-[10px] text-emerald-400 animate-pulse font-mono">
                    Checking ID...
                  </span>
                )}
              </div>
            )}

            {/* Direct Login Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              {error && (
                <div className="p-3 text-xs bg-rose-950/70 border border-rose-500/40 text-rose-200 rounded-xl flex flex-col gap-2.5 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-semibold">{error}</span>
                  </div>

                  {/* Immediate option to create account if user not found */}
                  {showRegisterPrompt && (
                    <Button
                      type="button"
                      onClick={() => switchToRegisterWithId(identifier)}
                      className="w-full h-8 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Create New Account with &quot;{identifier}&quot;</span>
                    </Button>
                  )}
                </div>
              )}

              {/* User ID / Register Number / Employee ID Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {activeConfig.idLabel}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={activeConfig.placeholder}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoFocus
                    className="h-11 pl-9 text-xs bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl font-mono"
                  />
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-9 pr-10 text-xs bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Default initial password:{" "}
                  <span className="font-mono text-emerald-400">password123</span>
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-950/50 hover:shadow-cyan-900/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Sign In as{" "}
                      {detectedUser?.fullName
                        ? `${activeConfig.label} (${detectedUser.fullName.split(" ")[0]})`
                        : activeConfig.label}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Link to Create New Account */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-1.5">
              <p className="text-[11px] text-slate-300 font-medium">
                Don&apos;t have an account or new to the portal?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAuthMode("REGISTER");
                  setError(null);
                  setShowRegisterPrompt(false);
                }}
                className="w-full h-9 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
                <span>Create New Account (Set Own Password)</span>
              </Button>
            </div>

            {/* Quick Testing Role Pills: Click to test any role */}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-center">
                Tap Role to Pre-fill Sample Login ID
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px]">
                {ROLES.map((role) => (
                  <button
                    key={`sample-${role.key}`}
                    type="button"
                    onClick={() => handleQuickSampleSelect(role.key, role.sampleId)}
                    className="py-1 px-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-300 hover:text-white transition-colors truncate text-center"
                    title={`Click to fill ${role.label} test ID: ${role.sampleId}`}
                  >
                    <span className="font-bold text-emerald-400">{role.label}:</span>{" "}
                    <span className="font-mono text-[9px] text-slate-400">{role.sampleId}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* MODE 2: CREATE NEW ACCOUNT (SELF-REGISTRATION)          */}
        {/* ======================================================== */}
        {authMode === "REGISTER" && (
          <form onSubmit={handleRegister} className="space-y-3 animate-in fade-in duration-200">
            {error && (
              <div className="p-3 text-xs bg-rose-950/70 border border-rose-500/40 text-rose-200 rounded-xl flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{error}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3.5 text-xs bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 rounded-xl flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="leading-relaxed font-bold">{regSuccess}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g. Karthik Raja S"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                  className="h-10 pl-9 text-xs bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 rounded-xl"
                />
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder={
                    regRole === "STUDENT"
                      ? "e.g. karthik.raja@student.nec.edu.in"
                      : "e.g. faculty.cse@nec.edu.in"
                  }
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="h-10 pl-9 text-xs bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 rounded-xl"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Register Number / Employee ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {regRole === "STUDENT"
                  ? "Student Register Number (Used for Login)"
                  : regRole === "FACULTY"
                  ? "Faculty Employee ID (Used for Login)"
                  : regRole === "HOD"
                  ? "HOD Employee ID (Used for Login)"
                  : "Administrator User ID / Email"}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={
                    regRole === "STUDENT"
                      ? "e.g. 710022CS0150"
                      : regRole === "FACULTY"
                      ? "e.g. FAC-CSE-150"
                      : regRole === "HOD"
                      ? "e.g. FAC-CSE-001"
                      : "e.g. admin@nec.edu.in"
                  }
                  value={regIdentifier}
                  onChange={(e) => setRegIdentifier(e.target.value)}
                  required
                  className="h-10 pl-9 text-xs bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 rounded-xl font-mono"
                />
                <GraduationCap className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Department (for Students, Faculty, HOD) */}
            {regRole !== "ADMIN" && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Department
                </label>
                <div className="relative">
                  <select
                    value={regDepartmentId}
                    onChange={(e) => setRegDepartmentId(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 text-xs bg-slate-800/90 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                  <Building className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Mobile Contact Number (SMS Recovery) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mobile Number (SMS Password Reset)
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="+91 98421 12345"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="h-10 pl-9 text-xs bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 rounded-xl font-mono"
                />
                <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Custom Password Fields (Set Own Password) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Create Password (Min 6)
                </label>
                <div className="relative">
                  <Input
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Create your password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="h-10 pl-8 pr-8 text-xs bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 rounded-xl"
                  />
                  <Lock className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showRegConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    className="h-10 pl-8 pr-8 text-xs bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 rounded-xl"
                  />
                  <Lock className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-2.5 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showRegConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Create Account Submit Button */}
            <Button
              type="submit"
              disabled={regLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-950/50 hover:shadow-cyan-900/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-3"
            >
              {regLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Creating Account & Setting Credentials...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account & Sign In as {activeConfig.label}</span>
                </>
              )}
            </Button>

            {/* Back to Sign In Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("LOGIN");
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors hover:underline"
              >
                Already have an account? Sign In here →
              </button>
            </div>
          </form>
        )}

        {/* Security Assurance */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Encrypted Session</span>
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            Nandha Engineering College (Autonomous)
          </span>
        </div>
      </div>

      {/* Institutional Copyright Footer */}
      <div className="relative z-10 max-w-md mx-auto w-full text-center mt-4">
        <p className="text-[11px] text-slate-500">
          © {new Date().getFullYear()} Nandha Engineering College (Autonomous) • Erode, TN
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-6 px-3 sm:px-6 overflow-hidden">
      {/* Animated Glowing Halos */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-emerald-600/20 via-indigo-600/20 to-cyan-500/25 blur-[140px] rounded-full pointer-events-none animate-pulse-halo" />
      <div className="fixed bottom-1/4 right-1/4 w-[450px] h-[450px] bg-emerald-500/15 blur-[130px] rounded-full pointer-events-none animate-float-gentle" />

      {/* Background Starfield Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />



      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
            Loading portal credentials...
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
