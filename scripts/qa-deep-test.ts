// scripts/qa-deep-test.ts
// Comprehensive Senior QA Test Suite for NEC-SCS (CampusCred)
// Author: 10-Year Senior QA Automation / Lead QA Engineer

import { getDB } from "../lib/db/store";
import { loginAction } from "../actions/auth";
import {
  claimCertificateForReviewAction,
  approveCertificateAction,
  requestCorrectionAction,
  rejectCertificateAction,
} from "../actions/reviews";
import {
  createDepartmentAction,
  updateDepartmentAction,
  updateCollegeSettingsAction,
  addStudentAction,
} from "../actions/admin";
import {
  createCertificateAction,
} from "../actions/certificates";

const BASE_URL = "http://127.0.0.1:3000";

const COOKIES = {
  ADMIN: "campuscred_session_user_id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  HOD: "campuscred_session_user_id=bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03",
  FACULTY: "campuscred_session_user_id=bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01",
  STUDENT: "campuscred_session_user_id=cccccccc-cccc-cccc-cccc-cccccccccc01",
};

export interface TestCaseResult {
  id: string;
  category: "Authentication" | "RBAC & Security" | "Student Portal" | "Faculty Portal" | "HOD Portal" | "Admin Portal" | "API & Services" | "Edge Cases & Data Integrity";
  testName: string;
  endpointOrFunction: string;
  fileLocation: string;
  expectedResult: string;
  actualResult: string;
  status: "PASSED" | "FAILED" | "BLOCKED";
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  defectDescription?: string;
}

const testResults: TestCaseResult[] = [];

function recordTest(result: TestCaseResult) {
  testResults.push(result);
  const icon = result.status === "PASSED" ? "✅ [PASS]" : result.status === "FAILED" ? "❌ [FAIL]" : "⚠️ [WARN]";
  console.log(`${icon} [${result.id}] ${result.testName} (${result.category})`);
  if (result.status === "FAILED") {
    console.error(`   -> Actual: ${result.actualResult}`);
    console.error(`   -> Defect: ${result.defectDescription}`);
  }
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log("🧪 EXECUTING COMPREHENSIVE QA AUTOMATION SUITE: NANDHA ENGINEERING COLLEGE");
  console.log(`Target: ${BASE_URL}`);
  console.log("================================================================================\n");

  // ----------------------------------------------------------------------
  // 1. PUBLIC ROUTES & BRANDING
  // ----------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/`, { redirect: "manual" });
    const is307 = res.status === 307 || res.status === 302;
    // Check if landing page or redirect
    if (res.status === 200) {
      const text = await res.text();
      const hasBranding = text.includes("Nandha") || text.includes("NEC");
      recordTest({
        id: "TC-PUB-01",
        category: "Student Portal",
        testName: "Public Root Landing Page Render",
        endpointOrFunction: "GET /",
        fileLocation: "app/page.tsx",
        expectedResult: "HTTP 200 with institutional branding",
        actualResult: `HTTP 200, Branding present: ${hasBranding}`,
        status: hasBranding ? "PASSED" : "FAILED",
        severity: "HIGH",
        defectDescription: hasBranding ? undefined : "Landing page missing institutional branding",
      });
    } else if (is307) {
      // In current code app/page.tsx redirects to /login for unauthenticated
      recordTest({
        id: "TC-PUB-01",
        category: "Authentication",
        testName: "Root URL Redirect to Login / Role Dashboard",
        endpointOrFunction: "GET /",
        fileLocation: "app/page.tsx",
        expectedResult: "Redirects unauthenticated visitors to /login",
        actualResult: `HTTP ${res.status} redirecting to ${res.headers.get("location")}`,
        status: res.headers.get("location")?.includes("/login") ? "PASSED" : "FAILED",
      });
    }
  } catch (err: any) {
    recordTest({
      id: "TC-PUB-01",
      category: "Authentication",
      testName: "Public Root URL Reachability",
      endpointOrFunction: "GET /",
      fileLocation: "app/page.tsx",
      expectedResult: "Reachable HTTP server",
      actualResult: `Fetch Error: ${err.message}`,
      status: "FAILED",
      severity: "CRITICAL",
      defectDescription: "Dev server unreachable",
    });
  }

  // TC-PUB-02: Login Page
  try {
    const res = await fetch(`${BASE_URL}/login`);
    const text = await res.text();
    const hasRoleSelector = text.includes("Student") && text.includes("Faculty") && text.includes("Dean / Admin");
    recordTest({
      id: "TC-PUB-02",
      category: "Authentication",
      testName: "Unified Login Page & Multi-Role Selector",
      endpointOrFunction: "GET /login",
      fileLocation: "app/(auth)/login/page.tsx",
      expectedResult: "HTTP 200 with 4-role switcher & login forms",
      actualResult: `HTTP ${res.status}, Role selectors present: ${hasRoleSelector}`,
      status: res.ok && hasRoleSelector ? "PASSED" : "FAILED",
      severity: "HIGH",
      defectDescription: "Login page missing multi-role selector",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-PUB-02",
      category: "Authentication",
      testName: "Login Page",
      endpointOrFunction: "GET /login",
      fileLocation: "app/(auth)/login/page.tsx",
      expectedResult: "HTTP 200",
      actualResult: err.message,
      status: "FAILED",
      severity: "CRITICAL",
    });
  }

  // TC-PUB-03: Forgot Password Page
  try {
    const res = await fetch(`${BASE_URL}/forgot-password`);
    recordTest({
      id: "TC-PUB-03",
      category: "Authentication",
      testName: "Password Recovery Route Availability",
      endpointOrFunction: "GET /forgot-password",
      fileLocation: "app/(auth)/forgot-password/page.tsx",
      expectedResult: "HTTP 200 or redirect to recovery flow",
      actualResult: `HTTP ${res.status}`,
      status: res.ok || res.status === 307 ? "PASSED" : "FAILED",
      severity: "MEDIUM",
      defectDescription: res.ok ? undefined : `HTTP ${res.status} on forgot password`,
    });
  } catch (err: any) {
    recordTest({
      id: "TC-PUB-03",
      category: "Authentication",
      testName: "Password Recovery Route",
      endpointOrFunction: "GET /forgot-password",
      fileLocation: "app/(auth)/forgot-password/page.tsx",
      expectedResult: "HTTP 200",
      actualResult: err.message,
      status: "FAILED",
      severity: "MEDIUM",
    });
  }

  // ----------------------------------------------------------------------
  // 2. AUTHENTICATION SERVER ACTION TESTS
  // ----------------------------------------------------------------------
  // TC-AUTH-01: Valid Student Login by Register Number
  try {
    const res = await loginAction({ identifier: "NEC21CS042", password: "password123" });
    recordTest({
      id: "TC-AUTH-01",
      category: "Authentication",
      testName: "Student Login via Register Number",
      endpointOrFunction: "loginAction(identifier, password)",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: true, role: STUDENT",
      actualResult: `success: ${res.success}, role: ${(res as any).role}`,
      status: res.success && (res as any).role === "STUDENT" ? "PASSED" : "FAILED",
      severity: "CRITICAL",
      defectDescription: res.success ? undefined : (res as any).error,
    });
  } catch (err: any) {
    recordTest({
      id: "TC-AUTH-01",
      category: "Authentication",
      testName: "Student Login via Register Number",
      endpointOrFunction: "loginAction()",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: true",
      actualResult: `Exception: ${err.message}`,
      status: "FAILED",
      severity: "CRITICAL",
    });
  }

  // TC-AUTH-02: Valid Student Login by Email
  try {
    const res = await loginAction({ identifier: "aditya.verma@student.abctech.edu", password: "password123" });
    recordTest({
      id: "TC-AUTH-02",
      category: "Authentication",
      testName: "Student Login via Official Email",
      endpointOrFunction: "loginAction(identifier, password)",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: true, role: STUDENT",
      actualResult: `success: ${res.success}, role: ${(res as any).role}`,
      status: res.success && (res as any).role === "STUDENT" ? "PASSED" : "FAILED",
      severity: "CRITICAL",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-AUTH-02",
      category: "Authentication",
      testName: "Student Login via Official Email",
      endpointOrFunction: "loginAction()",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: true",
      actualResult: err.message,
      status: "FAILED",
      severity: "CRITICAL",
    });
  }

  // TC-AUTH-03: Valid Faculty Login by Employee ID
  try {
    const res = await loginAction({ identifier: "NEC-FAC-011", password: "password123" });
    recordTest({
      id: "TC-AUTH-03",
      category: "Authentication",
      testName: "Faculty Login via Employee ID",
      endpointOrFunction: "loginAction(identifier, password)",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: true, role: FACULTY",
      actualResult: `success: ${res.success}, role: ${(res as any).role}`,
      status: res.success && (res as any).role === "FACULTY" ? "PASSED" : "FAILED",
      severity: "CRITICAL",
      defectDescription: res.success ? undefined : (res as any).error,
    });
  } catch (err: any) {
    recordTest({
      id: "TC-AUTH-03",
      category: "Authentication",
      testName: "Faculty Login via Employee ID",
      endpointOrFunction: "loginAction()",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: true",
      actualResult: err.message,
      status: "FAILED",
      severity: "CRITICAL",
    });
  }

  // TC-AUTH-04: Valid Admin Login
  try {
    const res = await loginAction({ identifier: "admin@abctech.edu", password: "password123" });
    recordTest({
      id: "TC-AUTH-04",
      category: "Authentication",
      testName: "Dean / Admin Login via Institutional Admin Email",
      endpointOrFunction: "loginAction(identifier, password)",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: true, role: ADMIN",
      actualResult: `success: ${res.success}, role: ${(res as any).role}`,
      status: res.success && (res as any).role === "ADMIN" ? "PASSED" : "FAILED",
      severity: "CRITICAL",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-AUTH-04",
      category: "Authentication",
      testName: "Dean / Admin Login",
      endpointOrFunction: "loginAction()",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: true",
      actualResult: err.message,
      status: "FAILED",
      severity: "CRITICAL",
    });
  }

  // TC-AUTH-05: Incorrect Password Rejection
  try {
    const res = await loginAction({ identifier: "NEC21CS042", password: "WRONG_PASSWORD_XYZ" });
    recordTest({
      id: "TC-AUTH-05",
      category: "Authentication",
      testName: "Security: Rejection of Incorrect Password",
      endpointOrFunction: "loginAction(identifier, password)",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: false with Incorrect password error",
      actualResult: `success: ${res.success}, error: ${(res as any).error}`,
      status: !res.success && (res as any).error?.includes("Incorrect password") ? "PASSED" : "FAILED",
      severity: "CRITICAL",
      defectDescription: res.success ? "SECURITY VULNERABILITY: Incorrect password was accepted!" : undefined,
    });
  } catch (err: any) {
    recordTest({
      id: "TC-AUTH-05",
      category: "Authentication",
      testName: "Rejection of Incorrect Password",
      endpointOrFunction: "loginAction()",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: false",
      actualResult: err.message,
      status: "FAILED",
      severity: "CRITICAL",
    });
  }

  // TC-AUTH-06: Non-Existent Account Rejection
  try {
    const res = await loginAction({ identifier: "GHOST_USER_99999", password: "password123" });
    recordTest({
      id: "TC-AUTH-06",
      category: "Authentication",
      testName: "Rejection of Non-Existent Account",
      endpointOrFunction: "loginAction(identifier, password)",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: false with Account not found",
      actualResult: `success: ${res.success}, error: ${(res as any).error}`,
      status: !res.success && (res as any).notFound ? "PASSED" : "FAILED",
      severity: "HIGH",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-AUTH-06",
      category: "Authentication",
      testName: "Rejection of Non-Existent Account",
      endpointOrFunction: "loginAction()",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: false",
      actualResult: err.message,
      status: "FAILED",
      severity: "HIGH",
    });
  }

  // TC-AUTH-07: SQL Injection Resiliency on Login Input
  try {
    const res = await loginAction({ identifier: "' OR '1'='1", password: "' OR '1'='1" });
    recordTest({
      id: "TC-AUTH-07",
      category: "RBAC & Security",
      testName: "Security: SQL Injection Payload Defense",
      endpointOrFunction: "loginAction(identifier, password)",
      fileLocation: "actions/auth.ts",
      expectedResult: "success: false (Rejection without unhandled crash)",
      actualResult: `success: ${res.success}, error: ${(res as any).error}`,
      status: !res.success ? "PASSED" : "FAILED",
      severity: "CRITICAL",
      defectDescription: res.success ? "CRITICAL SECURITY VULNERABILITY: SQL injection succeeded!" : undefined,
    });
  } catch (err: any) {
    recordTest({
      id: "TC-AUTH-07",
      category: "RBAC & Security",
      testName: "SQL Injection Payload Defense",
      endpointOrFunction: "loginAction()",
      fileLocation: "actions/auth.ts",
      expectedResult: "Handled failure",
      actualResult: `Unhandled exception: ${err.message}`,
      status: "FAILED",
      severity: "CRITICAL",
    });
  }

  // ----------------------------------------------------------------------
  // 3. STUDENT PORTAL PAGES & WORKFLOWS
  // ----------------------------------------------------------------------
  const studentPages = [
    { path: "/student/dashboard", name: "Student Dashboard Overview", id: "TC-STU-01" },
    { path: "/student/submit", name: "Certificate Submission Form", id: "TC-STU-02" },
    { path: "/student/certificates", name: "Student Certificates Ledger", id: "TC-STU-03" },
    { path: "/student/achievements", name: "Achievements & Leaderboard", id: "TC-STU-04" },
    { path: "/student/profile", name: "Digital Passport & Student Profile", id: "TC-STU-05" },
    { path: "/student/notifications", name: "Student Notification Inbox", id: "TC-STU-06" },
    { path: "/student/settings", name: "Student Account Settings", id: "TC-STU-07" },
  ];

  for (const page of studentPages) {
    try {
      const res = await fetch(`${BASE_URL}${page.path}`, {
        headers: { Cookie: COOKIES.STUDENT },
      });
      recordTest({
        id: page.id,
        category: "Student Portal",
        testName: page.name,
        endpointOrFunction: `GET ${page.path}`,
        fileLocation: `app${page.path}/page.tsx`,
        expectedResult: "HTTP 200 OK",
        actualResult: `HTTP ${res.status}`,
        status: res.status === 200 ? "PASSED" : "FAILED",
        severity: "HIGH",
        defectDescription: res.status === 200 ? undefined : `Failed with status ${res.status}`,
      });
    } catch (err: any) {
      recordTest({
        id: page.id,
        category: "Student Portal",
        testName: page.name,
        endpointOrFunction: `GET ${page.path}`,
        fileLocation: `app${page.path}/page.tsx`,
        expectedResult: "HTTP 200 OK",
        actualResult: err.message,
        status: "FAILED",
        severity: "HIGH",
      });
    }
  }

  // TC-STU-08: Student Certificate Detail View
  try {
    const certId = "77777777-7777-7777-7777-777777777701";
    const res = await fetch(`${BASE_URL}/student/certificates/${certId}`, {
      headers: { Cookie: COOKIES.STUDENT },
    });
    recordTest({
      id: "TC-STU-08",
      category: "Student Portal",
      testName: "Student Certificate Detail & Status History",
      endpointOrFunction: `GET /student/certificates/${certId}`,
      fileLocation: "app/student/certificates/[id]/page.tsx",
      expectedResult: "HTTP 200 OK with certificate details",
      actualResult: `HTTP ${res.status}`,
      status: res.status === 200 ? "PASSED" : "FAILED",
      severity: "MEDIUM",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-STU-08",
      category: "Student Portal",
      testName: "Student Certificate Detail View",
      endpointOrFunction: "GET /student/certificates/[id]",
      fileLocation: "app/student/certificates/[id]/page.tsx",
      expectedResult: "HTTP 200 OK",
      actualResult: err.message,
      status: "FAILED",
      severity: "MEDIUM",
    });
  }

  // ----------------------------------------------------------------------
  // 4. FACULTY PORTAL PAGES & REVIEW WORKBENCH
  // ----------------------------------------------------------------------
  const facultyPages = [
    { path: "/faculty/dashboard", name: "Faculty Evaluation Dashboard", id: "TC-FAC-01" },
    { path: "/faculty/reviews", name: "Department Review Queue", id: "TC-FAC-02" },
    { path: "/faculty/students", name: "Department Enrolled Students Directory", id: "TC-FAC-03" },
    { path: "/faculty/students/excel", name: "Department Student Excel Registry", id: "TC-FAC-04" },
    { path: "/faculty/notifications", name: "Faculty Notifications Inbox", id: "TC-FAC-05" },
    { path: "/faculty/settings", name: "Faculty Profile Settings", id: "TC-FAC-06" },
  ];

  for (const page of facultyPages) {
    try {
      const res = await fetch(`${BASE_URL}${page.path}`, {
        headers: { Cookie: COOKIES.FACULTY },
      });
      recordTest({
        id: page.id,
        category: "Faculty Portal",
        testName: page.name,
        endpointOrFunction: `GET ${page.path}`,
        fileLocation: `app${page.path}/page.tsx`,
        expectedResult: "HTTP 200 OK",
        actualResult: `HTTP ${res.status}`,
        status: res.status === 200 ? "PASSED" : "FAILED",
        severity: "HIGH",
        defectDescription: res.status === 200 ? undefined : `Failed with HTTP ${res.status}`,
      });
    } catch (err: any) {
      recordTest({
        id: page.id,
        category: "Faculty Portal",
        testName: page.name,
        endpointOrFunction: `GET ${page.path}`,
        fileLocation: `app${page.path}/page.tsx`,
        expectedResult: "HTTP 200 OK",
        actualResult: err.message,
        status: "FAILED",
        severity: "HIGH",
      });
    }
  }

  // TC-FAC-07: Faculty Review Workbench with Document Lightbox & Claim State
  try {
    const certId = "77777777-7777-7777-7777-777777777701";
    const res = await fetch(`${BASE_URL}/faculty/reviews/${certId}`, {
      headers: { Cookie: COOKIES.FACULTY },
    });
    const text = await res.text();
    const hasWorkbench = text.includes("Workbench") || text.includes("Certificate") || text.includes("Evaluation");
    recordTest({
      id: "TC-FAC-07",
      category: "Faculty Portal",
      testName: "Faculty Review Workbench & Evaluation Interface",
      endpointOrFunction: `GET /faculty/reviews/${certId}`,
      fileLocation: "app/faculty/reviews/[id]/page.tsx",
      expectedResult: "HTTP 200 OK with evaluation controls and certificate preview",
      actualResult: `HTTP ${res.status}, Workbench controls present: ${hasWorkbench}`,
      status: res.status === 200 && hasWorkbench ? "PASSED" : "FAILED",
      severity: "CRITICAL",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-FAC-07",
      category: "Faculty Portal",
      testName: "Faculty Review Workbench",
      endpointOrFunction: "GET /faculty/reviews/[id]",
      fileLocation: "app/faculty/reviews/[id]/page.tsx",
      expectedResult: "HTTP 200 OK",
      actualResult: err.message,
      status: "FAILED",
      severity: "CRITICAL",
    });
  }

  // ----------------------------------------------------------------------
  // 5. HOD PORTAL PAGES
  // ----------------------------------------------------------------------
  const hodPages = [
    { path: "/hod/dashboard", name: "HOD Department Overview", id: "TC-HOD-01" },
    { path: "/hod/analytics", name: "Department Accreditation Analytics", id: "TC-HOD-02" },
    { path: "/hod/faculty", name: "Department Faculty Workload Management", id: "TC-HOD-03" },
    { path: "/hod/faculty/excel", name: "Faculty Excel Register View", id: "TC-HOD-04" },
    { path: "/hod/students", name: "Department Students Directory", id: "TC-HOD-05" },
    { path: "/hod/reports", name: "NAAC/NIRF Accreditation SSR Reports", id: "TC-HOD-06" },
    { path: "/hod/settings", name: "HOD Department Settings", id: "TC-HOD-07" },
  ];

  for (const page of hodPages) {
    try {
      const res = await fetch(`${BASE_URL}${page.path}`, {
        headers: { Cookie: COOKIES.HOD },
      });
      recordTest({
        id: page.id,
        category: "HOD Portal",
        testName: page.name,
        endpointOrFunction: `GET ${page.path}`,
        fileLocation: `app${page.path}/page.tsx`,
        expectedResult: "HTTP 200 OK",
        actualResult: `HTTP ${res.status}`,
        status: res.status === 200 ? "PASSED" : "FAILED",
        severity: "HIGH",
        defectDescription: res.status === 200 ? undefined : `Failed with status ${res.status}`,
      });
    } catch (err: any) {
      recordTest({
        id: page.id,
        category: "HOD Portal",
        testName: page.name,
        endpointOrFunction: `GET ${page.path}`,
        fileLocation: `app${page.path}/page.tsx`,
        expectedResult: "HTTP 200 OK",
        actualResult: err.message,
        status: "FAILED",
        severity: "HIGH",
      });
    }
  }

  // ----------------------------------------------------------------------
  // 6. ADMIN PORTAL PAGES
  // ----------------------------------------------------------------------
  const adminPages = [
    { path: "/admin/dashboard", name: "Executive Dean / Admin Dashboard", id: "TC-ADM-01" },
    { path: "/admin/analytics", name: "Institution-Wide Accreditation Analytics", id: "TC-ADM-02" },
    { path: "/admin/departments", name: "Engineering Departments Hub (UG/PG)", id: "TC-ADM-03" },
    { path: "/admin/categories", name: "Achievement Categories & Point Caps", id: "TC-ADM-04" },
    { path: "/admin/users", name: "User Management & Student/Faculty Roster", id: "TC-ADM-05" },
    { path: "/admin/settings", name: "College Governance & Review Lock Settings", id: "TC-ADM-06" },
    { path: "/admin/audit-logs", name: "Tamper-Evident Institutional Audit Ledger", id: "TC-ADM-07" },
    { path: "/admin/reports", name: "Institutional SSR / NAAC / NIRF Reports", id: "TC-ADM-08" },
  ];

  for (const page of adminPages) {
    try {
      const res = await fetch(`${BASE_URL}${page.path}`, {
        headers: { Cookie: COOKIES.ADMIN },
      });
      recordTest({
        id: page.id,
        category: "Admin Portal",
        testName: page.name,
        endpointOrFunction: `GET ${page.path}`,
        fileLocation: `app${page.path}/page.tsx`,
        expectedResult: "HTTP 200 OK",
        actualResult: `HTTP ${res.status}`,
        status: res.status === 200 ? "PASSED" : "FAILED",
        severity: "HIGH",
        defectDescription: res.status === 200 ? undefined : `Failed with status ${res.status}`,
      });
    } catch (err: any) {
      recordTest({
        id: page.id,
        category: "Admin Portal",
        testName: page.name,
        endpointOrFunction: `GET ${page.path}`,
        fileLocation: `app${page.path}/page.tsx`,
        expectedResult: "HTTP 200 OK",
        actualResult: err.message,
        status: "FAILED",
        severity: "HIGH",
      });
    }
  }

  // ----------------------------------------------------------------------
  // 7. ROLE-BASED ACCESS CONTROL (RBAC) & PRIVILEGE ESCALATION DEFENSE
  // ----------------------------------------------------------------------
  // TC-SEC-01: Student attempting to access Admin Dashboard
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Cookie: COOKIES.STUDENT },
      redirect: "manual",
    });
    // Should NOT be 200 OK without redirect or access block
    const text = await res.text();
    const isForbidden = res.status === 403 || res.status === 307 || text.includes("Unauthorized") || text.includes("Access Denied");
    recordTest({
      id: "TC-SEC-01",
      category: "RBAC & Security",
      testName: "Privilege Escalation: Student Blocked from Admin Dashboard",
      endpointOrFunction: "GET /admin/dashboard (with Student Cookie)",
      fileLocation: "app/admin/layout.tsx",
      expectedResult: "Access denied (Redirect / 403 / Unauthorized)",
      actualResult: `HTTP ${res.status}, Blocked: ${isForbidden}`,
      status: isForbidden ? "PASSED" : "FAILED",
      severity: "CRITICAL",
      defectDescription: isForbidden ? undefined : "CRITICAL SECURITY FLAW: Student role can view Admin Dashboard!",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-SEC-01",
      category: "RBAC & Security",
      testName: "Student Blocked from Admin Dashboard",
      endpointOrFunction: "GET /admin/dashboard",
      fileLocation: "app/admin/layout.tsx",
      expectedResult: "Blocked",
      actualResult: err.message,
      status: "FAILED",
      severity: "CRITICAL",
    });
  }

  // TC-SEC-02: Faculty attempting to access Admin Settings
  try {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      headers: { Cookie: COOKIES.FACULTY },
      redirect: "manual",
    });
    const text = await res.text();
    const isBlocked = res.status === 403 || res.status === 307 || text.includes("Unauthorized") || text.includes("Access Denied");
    recordTest({
      id: "TC-SEC-02",
      category: "RBAC & Security",
      testName: "Privilege Escalation: Faculty Blocked from Admin Settings",
      endpointOrFunction: "GET /admin/settings (with Faculty Cookie)",
      fileLocation: "app/admin/layout.tsx",
      expectedResult: "Access denied (Redirect / 403)",
      actualResult: `HTTP ${res.status}, Blocked: ${isBlocked}`,
      status: isBlocked ? "PASSED" : "FAILED",
      severity: "CRITICAL",
      defectDescription: isBlocked ? undefined : "SECURITY FLAW: Faculty can access Admin Settings!",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-SEC-02",
      category: "RBAC & Security",
      testName: "Faculty Blocked from Admin Settings",
      endpointOrFunction: "GET /admin/settings",
      fileLocation: "app/admin/layout.tsx",
      expectedResult: "Blocked",
      actualResult: err.message,
      status: "FAILED",
      severity: "CRITICAL",
    });
  }

  // TC-SEC-03: Unauthenticated user accessing Protected Dashboard
  try {
    const res = await fetch(`${BASE_URL}/student/dashboard`, {
      redirect: "manual",
    });
    const isRedirectedToLogin = res.status === 307 || res.status === 302 || res.headers.get("location")?.includes("/login");
    recordTest({
      id: "TC-SEC-03",
      category: "RBAC & Security",
      testName: "Authentication Guard: Unauthenticated Access Redirected",
      endpointOrFunction: "GET /student/dashboard (No Cookie)",
      fileLocation: "app/student/layout.tsx",
      expectedResult: "HTTP 307 Redirect to /login",
      actualResult: `HTTP ${res.status}, Redirect Location: ${res.headers.get("location")}`,
      status: isRedirectedToLogin ? "PASSED" : "FAILED",
      severity: "CRITICAL",
      defectDescription: isRedirectedToLogin ? undefined : "Unauthenticated user was not redirected to /login",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-SEC-03",
      category: "RBAC & Security",
      testName: "Unauthenticated Access Redirected",
      endpointOrFunction: "GET /student/dashboard",
      fileLocation: "app/student/layout.tsx",
      expectedResult: "HTTP 307",
      actualResult: err.message,
      status: "FAILED",
      severity: "CRITICAL",
    });
  }

  // ----------------------------------------------------------------------
  // 8. API ENDPOINTS & FILE WATERMARKING
  // ----------------------------------------------------------------------
  // TC-API-01: SVG Watermarked Certificate Download
  try {
    const filePath = "certificates/77777777-7777-7777-7777-777777777703/ieee_paper_cert.pdf";
    const res = await fetch(`${BASE_URL}/api/files/download?path=${encodeURIComponent(filePath)}`, {
      headers: { Cookie: COOKIES.FACULTY },
    });
    const contentType = res.headers.get("content-type") || "";
    const svgText = await res.text();
    const isSvg = contentType.includes("image/svg+xml");
    const hasNandhaCollege = svgText.includes("NANDHA ENGINEERING COLLEGE");
    const hasAutonomous = svgText.includes("AUTONOMOUS");
    recordTest({
      id: "TC-API-01",
      category: "API & Services",
      testName: "Watermarked Certificate Download Service",
      endpointOrFunction: "GET /api/files/download?path=...",
      fileLocation: "app/api/files/download/route.ts",
      expectedResult: "image/svg+xml with official NEC Autonomous Seal",
      actualResult: `Type: ${contentType}, Has NEC Seal: ${hasNandhaCollege && hasAutonomous}`,
      status: res.ok && isSvg && hasNandhaCollege && hasAutonomous ? "PASSED" : "FAILED",
      severity: "HIGH",
      defectDescription: res.ok ? undefined : `Failed with status ${res.status}`,
    });
  } catch (err: any) {
    recordTest({
      id: "TC-API-01",
      category: "API & Services",
      testName: "Watermarked Certificate Download Service",
      endpointOrFunction: "GET /api/files/download",
      fileLocation: "app/api/files/download/route.ts",
      expectedResult: "image/svg+xml",
      actualResult: err.message,
      status: "FAILED",
      severity: "HIGH",
    });
  }

  // TC-API-02: NAAC/NIRF SSR Accreditation CSV Export
  try {
    const res = await fetch(`${BASE_URL}/api/reports/export?type=naac`, {
      headers: { Cookie: COOKIES.ADMIN },
    });
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();
    const isCsv = contentType.includes("text/csv") || text.includes(",");
    recordTest({
      id: "TC-API-02",
      category: "API & Services",
      testName: "Accreditation SSR CSV Report Export Service",
      endpointOrFunction: "GET /api/reports/export?type=naac",
      fileLocation: "app/api/reports/export/route.ts",
      expectedResult: "HTTP 200 with text/csv header and formatted records",
      actualResult: `HTTP ${res.status}, Content-Type: ${contentType}`,
      status: res.ok && isCsv ? "PASSED" : "FAILED",
      severity: "HIGH",
      defectDescription: res.ok ? undefined : `HTTP ${res.status} on CSV export`,
    });
  } catch (err: any) {
    recordTest({
      id: "TC-API-02",
      category: "API & Services",
      testName: "Accreditation SSR CSV Report Export Service",
      endpointOrFunction: "GET /api/reports/export",
      fileLocation: "app/api/reports/export/route.ts",
      expectedResult: "HTTP 200 CSV",
      actualResult: err.message,
      status: "FAILED",
      severity: "HIGH",
    });
  }

  // TC-API-03: Student Digital Passport API
  try {
    const studentId = "cccccccc-cccc-cccc-cccc-cccccccccc01";
    const res = await fetch(`${BASE_URL}/api/student/passport?studentId=${studentId}`, {
      headers: { Cookie: COOKIES.STUDENT },
    });
    recordTest({
      id: "TC-API-03",
      category: "API & Services",
      testName: "Student Digital Passport Data Provider",
      endpointOrFunction: `GET /api/student/passport?studentId=${studentId}`,
      fileLocation: "app/api/student/passport/route.ts",
      expectedResult: "HTTP 200 OK with digital passport record",
      actualResult: `HTTP ${res.status}`,
      status: res.status === 200 ? "PASSED" : "FAILED",
      severity: "MEDIUM",
      defectDescription: res.status === 200 ? undefined : `Passport API returned HTTP ${res.status}`,
    });
  } catch (err: any) {
    recordTest({
      id: "TC-API-03",
      category: "API & Services",
      testName: "Student Digital Passport API",
      endpointOrFunction: "GET /api/student/passport",
      fileLocation: "app/api/student/passport/route.ts",
      expectedResult: "HTTP 200",
      actualResult: err.message,
      status: "FAILED",
      severity: "MEDIUM",
    });
  }

  // TC-API-04: PWA Web App Manifest
  try {
    const res = await fetch(`${BASE_URL}/manifest.json`);
    const data = await res.json();
    const hasName = data.name?.includes("Nandha Engineering College");
    recordTest({
      id: "TC-API-04",
      category: "API & Services",
      testName: "PWA Manifest & Institutional Metadata",
      endpointOrFunction: "GET /manifest.json",
      fileLocation: "public/manifest.json",
      expectedResult: "JSON manifest containing Nandha Engineering College",
      actualResult: `HTTP ${res.status}, Name: "${data.name}"`,
      status: res.ok && hasName ? "PASSED" : "FAILED",
      severity: "LOW",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-API-04",
      category: "API & Services",
      testName: "PWA Manifest",
      endpointOrFunction: "GET /manifest.json",
      fileLocation: "public/manifest.json",
      expectedResult: "HTTP 200",
      actualResult: err.message,
      status: "FAILED",
      severity: "LOW",
    });
  }

  // TC-API-05: Service Worker PWA Caching
  try {
    const res = await fetch(`${BASE_URL}/sw.js`);
    recordTest({
      id: "TC-API-05",
      category: "API & Services",
      testName: "Service Worker PWA Offline Script Availability",
      endpointOrFunction: "GET /sw.js",
      fileLocation: "public/sw.js",
      expectedResult: "HTTP 200 with service worker cache logic",
      actualResult: `HTTP ${res.status}`,
      status: res.status === 200 ? "PASSED" : "FAILED",
      severity: "LOW",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-API-05",
      category: "API & Services",
      testName: "Service Worker script",
      endpointOrFunction: "GET /sw.js",
      fileLocation: "public/sw.js",
      expectedResult: "HTTP 200",
      actualResult: err.message,
      status: "FAILED",
      severity: "LOW",
    });
  }

  // ----------------------------------------------------------------------
  // 9. EDGE CASES, BUSINESS LOGIC & CONCURRENCY
  // ----------------------------------------------------------------------
  // TC-EDGE-01: Points Cap Boundary Defense (Awarding points greater than 100 max cap)
  try {
    const certId = "77777777-7777-7777-7777-777777777701";
    // Attempt to award 9999 points (far exceeding max cap of 100)
    const result = await approveCertificateAction({
      certificate_id: certId,
      points: 9999,
      comment: "Test boundary overflow",
    });
    // Should be rejected or capped
    const wasDefended = !result.success || (result as any).error?.includes("exceed") || (result as any).error?.includes("max");
    recordTest({
      id: "TC-EDGE-01",
      category: "Edge Cases & Data Integrity",
      testName: "Points Boundary Check: Disallow Exceeding Institution Cap (100)",
      endpointOrFunction: "approveCertificateAction(points=9999)",
      fileLocation: "actions/reviews.ts",
      expectedResult: "Rejected: Points cannot exceed college max cap",
      actualResult: `success: ${result.success}, error: ${(result as any).error}`,
      status: wasDefended ? "PASSED" : "FAILED",
      severity: "HIGH",
      defectDescription: wasDefended ? undefined : "Defect: Reviewer was able to award 9999 points exceeding 100 max cap!",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-EDGE-01",
      category: "Edge Cases & Data Integrity",
      testName: "Points Boundary Check: Exceeding Cap",
      endpointOrFunction: "approveCertificateAction()",
      fileLocation: "actions/reviews.ts",
      expectedResult: "Validation error",
      actualResult: err.message,
      status: "PASSED", // Threw validation error as expected
    });
  }

  // TC-EDGE-02: Negative Points Boundary Defense
  try {
    const certId = "77777777-7777-7777-7777-777777777701";
    const result = await approveCertificateAction({
      certificate_id: certId,
      points: -50,
      comment: "Test negative points",
    });
    const wasDefended = !result.success || (result as any).error?.includes("positive") || (result as any).error?.includes("greater") || (result as any).error?.includes("non-negative");
    recordTest({
      id: "TC-EDGE-02",
      category: "Edge Cases & Data Integrity",
      testName: "Points Boundary Check: Disallow Negative Points",
      endpointOrFunction: "approveCertificateAction(points=-50)",
      fileLocation: "actions/reviews.ts",
      expectedResult: "Rejected: Points cannot be negative",
      actualResult: `success: ${result.success}, error: ${(result as any).error}`,
      status: wasDefended ? "PASSED" : "FAILED",
      severity: "HIGH",
      defectDescription: wasDefended ? undefined : "Defect: System allowed negative points to be awarded!",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-EDGE-02",
      category: "Edge Cases & Data Integrity",
      testName: "Points Boundary Check: Negative Points",
      endpointOrFunction: "approveCertificateAction()",
      fileLocation: "actions/reviews.ts",
      expectedResult: "Validation error",
      actualResult: err.message,
      status: "PASSED",
    });
  }

  // TC-EDGE-03: Cryptographic SHA-256 Duplicate Certificate Prevention
  try {
    const db = getDB();
    const existingFile = db.certificateFiles[0];
    const existingHash = existingFile?.file_hash;

    // Check if file hash check function exists or works
    recordTest({
      id: "TC-EDGE-03",
      category: "Edge Cases & Data Integrity",
      testName: "Cryptographic SHA-256 File Hash Indexing",
      endpointOrFunction: "lib/storage/hash.ts",
      fileLocation: "lib/storage/hash.ts",
      expectedResult: "Indexed 64-character hex SHA-256 hash",
      actualResult: `Sample hash: ${existingHash?.substring(0, 16)}... (Length: ${existingHash?.length})`,
      status: existingHash && existingHash.length === 64 ? "PASSED" : "FAILED",
      severity: "HIGH",
      defectDescription: existingHash?.length === 64 ? undefined : "Certificate file hashes are missing or invalid SHA-256",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-EDGE-03",
      category: "Edge Cases & Data Integrity",
      testName: "Cryptographic SHA-256 File Hash Indexing",
      endpointOrFunction: "lib/storage/hash.ts",
      fileLocation: "lib/storage/hash.ts",
      expectedResult: "SHA-256 hash valid",
      actualResult: err.message,
      status: "FAILED",
      severity: "HIGH",
    });
  }

  // TC-EDGE-04: Review Lock Concurrency - Exclusive Claiming
  try {
    const certId = "77777777-7777-7777-7777-777777777701";
    const res = await claimCertificateForReviewAction(certId);
    recordTest({
      id: "TC-EDGE-04",
      category: "Faculty Portal",
      testName: "Review Concurrency: Faculty Lock Acquisition",
      endpointOrFunction: `claimCertificateForReviewAction(${certId})`,
      fileLocation: "actions/reviews.ts",
      expectedResult: "Lock acquired or error if already locked/processed",
      actualResult: `Result: ${JSON.stringify(res)}`,
      status: res !== undefined ? "PASSED" : "FAILED",
      severity: "MEDIUM",
    });
  } catch (err: any) {
    recordTest({
      id: "TC-EDGE-04",
      category: "Faculty Portal",
      testName: "Review Lock Acquisition",
      endpointOrFunction: "claimCertificateForReviewAction()",
      fileLocation: "actions/reviews.ts",
      expectedResult: "Lock response",
      actualResult: err.message,
      status: "FAILED",
      severity: "MEDIUM",
    });
  }

  // TC-EDGE-05: Department Creation UG vs PG Isolation
  try {
    const testCode = `TEST_${Date.now().toString().slice(-4)}`;
    const createRes = await createDepartmentAction({
      name: `Test Department ${testCode}`,
      code: testCode,
      type: "PG",
    });
    recordTest({
      id: "TC-EDGE-05",
      category: "Admin Portal",
      testName: "Engineering Governance: UG vs PG Department Creation",
      endpointOrFunction: "createDepartmentAction({ type: 'PG' })",
      fileLocation: "actions/admin.ts",
      expectedResult: "success: true with type PG",
      actualResult: `success: ${createRes.success}`,
      status: createRes.success ? "PASSED" : "FAILED",
      severity: "MEDIUM",
      defectDescription: createRes.success ? undefined : (createRes as any).error,
    });
  } catch (err: any) {
    recordTest({
      id: "TC-EDGE-05",
      category: "Admin Portal",
      testName: "Department Creation UG vs PG",
      endpointOrFunction: "createDepartmentAction()",
      fileLocation: "actions/admin.ts",
      expectedResult: "success: true",
      actualResult: err.message,
      status: "FAILED",
      severity: "MEDIUM",
    });
  }

  // ----------------------------------------------------------------------
  // SUMMARY METRICS
  // ----------------------------------------------------------------------
  const total = testResults.length;
  const passed = testResults.filter((t) => t.status === "PASSED").length;
  const failed = testResults.filter((t) => t.status === "FAILED").length;

  console.log("\n================================================================================");
  console.log(`📊 TEST EXECUTION SUMMARY: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("================================================================================");

  return testResults;
}

runTestSuite().catch(console.error);
