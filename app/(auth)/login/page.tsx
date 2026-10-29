"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Users,
  Building2,
  UserPlus,
  Phone,
  Mail,
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
  sampleId: string;
}

const ROLES: RoleOption[] = [
  {
    key: "STUDENT",
    label: "Student",
    badge: "UG & PG",
    idLabel: "Register No. / Email",
    placeholder: "e.g. 732226CS001",
    icon: GraduationCap,
    sampleId: "",
  },
  {
    key: "FACULTY",
    label: "Faculty",
    badge: "Evaluator",
    idLabel: "Employee ID / Email",
    placeholder: "e.g. FAC-CSE-101",
    icon: Users,
    sampleId: "FAC-CSE-101",
  },
  {
    key: "HOD",
    label: "HOD",
    badge: "Dept Head",
    idLabel: "HOD ID / Email",
    placeholder: "e.g. FAC-CSE-001",
    icon: Building2,
    sampleId: "FAC-CSE-001",
  },
  {
    key: "ADMIN",
    label: "Dean / Admin",
    badge: "Apex Admin",
    idLabel: "Admin Email / ID",
    placeholder: "e.g. admin@nandhaengg.org",
    icon: ShieldCheck,
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

  // Real-Time Auto-Detection of User Account
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

    getDepartmentsForRegistrationAction()
      .then((depts) => {
        setDepartments(depts);
        if (depts.length > 0) {
          setRegDepartmentId(depts[0].id);
        }
      })
      .catch((err) => console.error("Failed to load departments:", err));

    // Warm up and prefetch all dashboards for instant sub-second transitions
    router.prefetch("/student/dashboard");
    router.prefetch("/faculty/dashboard");
    router.prefetch("/hod/dashboard");
    router.prefetch("/admin/dashboard");
  }, [searchParams, router]);

  // Identity detection on typing identifier in Login mode
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
          const target =
            res.role === "STUDENT"
              ? "/student/dashboard"
              : res.role === "FACULTY"
              ? "/faculty/dashboard"
              : res.role === "HOD"
              ? "/hod/dashboard"
              : "/admin/dashboard";
          router.prefetch(target);
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
  }, [identifier, authMode, router]);

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

    setLoading(true);
    setError(null);
    setShowRegisterPrompt(false);

    try {
      const res = await loginAction({ identifier: identifier.trim(), password: password || "" });
      if (!res.success) {
        setError(res.error || "Authentication failed. Please verify your credentials.");
        if ((res as any).notFound) {
          setShowRegisterPrompt(true);
        }
        setLoading(false);
        return;
      }

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

      router.push(targetUrl);
      router.refresh();
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
    <div className="w-full max-w-md mx-auto my-auto">
      {/* Clean Institutional Header */}
      <div className="text-center mb-6">
        <Link
          href="/login"
          className="inline-block transition-transform hover:scale-105 active:scale-95"
          title="Nandha Engineering College"
        >
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nec-logo.png"
              alt="Nandha Engineering College (NEC) Logo"
              className="h-14 sm:h-16 w-auto object-contain select-none"
            />
          </div>
        </Link>

        <div className="mt-3.5 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            <span>Autonomous Institution • NAAC &apos;A+&apos;</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Nandha Engineering College
          </h1>
          <p className="text-xs text-slate-500">
            {authMode === "LOGIN"
              ? "Student & Faculty Achievement Portal"
              : "Register your account & set your credentials"}
          </p>
        </div>
      </div>

      {/* Clean Modern White Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        
        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setAuthMode("LOGIN");
              setError(null);
              setShowRegisterPrompt(false);
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === "LOGIN"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
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
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === "REGISTER"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Role Selector Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              Select Your Role
            </label>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {activeConfig.label}
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
                  className={`py-2 px-1.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/70 text-blue-700 ring-1 ring-blue-600/30 shadow-xs"
                      : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-[11px] font-bold truncate leading-none">
                    {role.label}
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal leading-none">
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
            {/* Detected User Card */}
            {detectedUser ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
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
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {detectedUser.fullName}
                      </span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-emerald-700 font-medium truncate">
                      {detectedUser.role} • {detectedUser.departmentName || detectedUser.identifier}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  Verified
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Signing in as:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <ActiveRoleIcon className="h-3.5 w-3.5 text-blue-600" />
                    <span>{activeConfig.label}</span>
                  </span>
                </div>
                {isDetecting && (
                  <span className="text-[10px] text-blue-600 font-medium animate-pulse">
                    Checking ID...
                  </span>
                )}
              </div>
            )}

            {/* Direct Login Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              {error && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex flex-col gap-2 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{error}</span>
                  </div>

                  {showRegisterPrompt && (
                    <Button
                      type="button"
                      onClick={() => switchToRegisterWithId(identifier)}
                      className="w-full h-8 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Create New Account with &quot;{identifier}&quot;</span>
                    </Button>
                  )}
                </div>
              )}

              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="h-11 pl-9 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl font-mono shadow-2xs"
                  />
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Password Input (Optional if signing in with verified ID) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password <span className="text-slate-400 font-normal">(Optional with ID)</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password (or leave blank to sign in with ID)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-9 pr-10 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-xl shadow-2xs"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter your assigned password, or leave blank to open with ID.
                </p>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying & Opening...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {detectedUser?.fullName
                        ? `Sign In as ${detectedUser.fullName.split(" ")[0]} (${detectedUser.identifier || detectedUser.role})`
                        : "Sign In"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Credentials (Faculty, HOD & Admin only; Student demo removed) */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 text-center">
                Demo Quick Logins (Click to fill)
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                {ROLES.filter((role) => role.key !== "STUDENT").map((role) => (
                  <button
                    key={`sample-${role.key}`}
                    type="button"
                    onClick={() => handleQuickSampleSelect(role.key, role.sampleId)}
                    className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors truncate text-center cursor-pointer shadow-2xs"
                    title={`Fill ${role.label} test account: ${role.sampleId}`}
                  >
                    <span className="font-semibold text-blue-600">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* MODE 2: REGISTRATION FORM                               */}
        {/* ======================================================== */}
        {authMode === "REGISTER" && (
          <form onSubmit={handleRegister} className="space-y-3 animate-in fade-in">
            {error && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="leading-relaxed font-semibold">{regSuccess}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g. Karthik Raja S"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                  className="h-10 pl-9 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 rounded-xl"
                />
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  className="h-10 pl-9 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 rounded-xl"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {regRole === "STUDENT"
                  ? "Student Register Number"
                  : regRole === "FACULTY"
                  ? "Faculty Employee ID"
                  : regRole === "HOD"
                  ? "HOD Employee ID"
                  : "Admin ID / Email"}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={
                    regRole === "STUDENT"
                      ? "e.g. 732226CS001"
                      : regRole === "FACULTY"
                      ? "e.g. FAC-CSE-150"
                      : regRole === "HOD"
                      ? "e.g. FAC-CSE-001"
                      : "e.g. admin@nec.edu.in"
                  }
                  value={regIdentifier}
                  onChange={(e) => setRegIdentifier(e.target.value)}
                  required
                  className="h-10 pl-9 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 rounded-xl font-mono"
                />
                <GraduationCap className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Department */}
            {regRole !== "ADMIN" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <select
                    value={regDepartmentId}
                    onChange={(e) => setRegDepartmentId(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 text-xs bg-white border border-slate-200 text-slate-900 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 appearance-none cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id} className="text-slate-900">
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                  <Building className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number (Password Reset)
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="+91 98421 12345"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="h-10 pl-9 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 rounded-xl font-mono"
                />
                <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Input
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="h-10 pl-8 pr-8 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 rounded-xl"
                  />
                  <Lock className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showRegConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    className="h-10 pl-8 pr-8 text-xs bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 rounded-xl"
                  />
                  <Lock className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Create Account Submit */}
            <Button
              type="submit"
              disabled={regLoading}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {regLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account & Sign In</span>
                </>
              )}
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("LOGIN");
                  setError(null);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer hover:underline"
              >
                Already have an account? Sign In here →
              </button>
            </div>
          </form>
        )}

        {/* Security Assurance */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Encrypted Session</span>
          </span>
          <span className="text-[10px] text-slate-400">
            Nandha Engineering College
          </span>
        </div>
      </div>

      {/* Institutional Copyright Footer */}
      <div className="text-center mt-5">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Nandha Engineering College (Autonomous) • Erode, TN
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative clean-grid-bg">
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
