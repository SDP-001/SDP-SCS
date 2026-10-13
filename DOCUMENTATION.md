# NEC-SCS Technical Documentation & Reference Manual
> **System Name**: Nandha Engineering College — Student Credential System (NEC-SCS / CampusCred)  
> **Version**: 1.0.0  
> **Target Institution**: Nandha Engineering College (Autonomous), Erode, Tamil Nadu  
> **Framework**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Supabase  

---

## Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Data Storage & Dual Persistence Architecture](#2-data-storage--dual-persistence-architecture)
3. [Database Schema & Data Dictionary](#3-database-schema--data-dictionary)
4. [Authentication & Session Lifecycle](#4-authentication--session-lifecycle)
5. [Certificate Lifecycle & Concurrency Locking](#5-certificate-lifecycle--concurrency-locking)
6. [Cryptographic Duplicate Detection](#6-cryptographic-duplicate-detection)
7. [Server Actions API Reference](#7-server-actions-api-reference)
8. [REST API Endpoints](#8-rest-api-endpoints)
9. [UI Component Design System](#9-ui-component-design-system)
10. [Audit Logging & Security Specification](#10-audit-logging--security-specification)
11. [Accreditation Data Export Engine](#11-accreditation-data-export-engine)
12. [Testing & Verification Suite](#12-testing--verification-suite)

---

## 1. System Overview & Architecture

NEC-SCS is designed as an institutional portal for Nandha Engineering College (NEC) to digitize, verify, and store student co-curricular and extracurricular achievements. It serves four distinct institutional stakeholders:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 16 APP ROUTER                           │
├───────────────────┬───────────────────┬───────────────┬────────────────┤
│      STUDENT      │      FACULTY      │      HOD      │     ADMIN      │
│  /student/*       │  /faculty/*       │  /hod/*       │  /admin/*      │
├───────────────────┴───────────────────┴───────────────┴────────────────┤
│                   Next.js Server Actions Layer                         │
│  (Session verification, Zod validation, RLS & role authorization)       │
├────────────────────────────────────────────────────────────────────────┤
│                       Dual Data Provider Layer                         │
│   • Local In-Memory Reactive Store (Global Node.js Singleton)           │
│   • Supabase PostgreSQL (Production RLS + Triggers + Realtime)         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Storage & Dual Persistence Architecture

NEC-SCS includes a resilient dual persistence mechanism:

1. **Local Persistent In-Memory State (`lib/db/store.ts`)**:
   - Implemented as a singleton under `globalThis.__CAMPUSCRED_DB`.
   - Seeded with comprehensive demo data for Nandha Engineering College (Autonomous), Erode.
   - Enables zero-configuration testing and offline demonstration without an active internet or database connection.
   - All state modifications (create, update, claim, approve, log) persist across requests during the active Node.js server lifecycle.

2. **Supabase PostgreSQL (`supabase/migrations/`)**:
   - Ready for cloud production deployment.
   - Employs strict PostgreSQL Row-Level Security (RLS) policies.
   - Uses PostgreSQL stored functions and triggers for timestamp maintenance and points aggregation.

---

## 3. Database Schema & Data Dictionary

### Core Tables

#### `colleges`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique institutional identifier |
| `name` | `VARCHAR(255)` | `NOT NULL` | e.g., "Nandha Engineering College (NEC)" |
| `code` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Institutional code e.g., "NEC" |
| `logo_url` | `TEXT` | `NULLABLE` | Path or URL to official college seal |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Record timestamp |

#### `college_settings`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Settings unique ID |
| `college_id` | `UUID` | `REFERENCES colleges(id)` | Associated college |
| `max_points_per_certificate` | `INTEGER` | `DEFAULT 100` | Upper limit for points on a single certificate |
| `reviewer_reclaim_timeout_minutes`| `INTEGER` | `DEFAULT 30` | Auto-release duration for faculty locks |
| `max_file_size_mb` | `INTEGER` | `DEFAULT 10` | Maximum upload size per file |

#### `departments`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Department unique identifier |
| `college_id` | `UUID` | `REFERENCES colleges(id)` | Associated college |
| `name` | `VARCHAR(255)` | `NOT NULL` | e.g. "Computer Science and Engineering" |
| `code` | `VARCHAR(50)` | `NOT NULL` | e.g. "CSE", "ME-CSE", "MBA", "MCA" |
| `type` | `ENUM('UG', 'PG')` | `DEFAULT 'UG'` | Distinguishes Undergraduate vs Postgraduate |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Branch status |

#### `profiles`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Supabase auth user reference |
| `college_id` | `UUID` | `REFERENCES colleges(id)` | Associated institution |
| `role` | `ENUM` | `STUDENT, FACULTY, HOD, ADMIN` | Security role |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Institutional email |
| `full_name` | `VARCHAR(255)` | `NOT NULL` | Full legal name |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Account active flag |

#### `students`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Student entity ID |
| `profile_id` | `UUID` | `REFERENCES profiles(id)` | Linked profile |
| `department_id` | `UUID` | `REFERENCES departments(id)`| Student branch |
| `register_number` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Institutional registration number |
| `academic_year` | `INTEGER` | `NOT NULL` | 1st, 2nd, 3rd, or 4th year |

#### `faculty`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Faculty entity ID |
| `profile_id` | `UUID` | `REFERENCES profiles(id)` | Linked profile |
| `department_id` | `UUID` | `REFERENCES departments(id)`| Academic department |
| `designation` | `VARCHAR(100)` | `NOT NULL` | Assistant Prof, Assoc Prof, Prof |
| `employee_id` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Institutional Staff ID |
| `is_hod` | `BOOLEAN` | `DEFAULT FALSE` | True if Head of Department |

#### `certificates`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Certificate unique ID |
| `student_id` | `UUID` | `REFERENCES students(id)` | Submitting student |
| `achievement_id`| `VARCHAR(50)` | `NULLABLE` | Generated human-readable badge ID |
| `title` | `VARCHAR(255)` | `NOT NULL` | Certificate title |
| `event_name` | `VARCHAR(255)` | `NOT NULL` | Event / Contest / Conference name |
| `category_id` | `UUID` | `REFERENCES categories(id)`| Category classification |
| `event_level` | `ENUM` | `COLLEGE...INTERNATIONAL` | Level of competition |
| `organizer` | `VARCHAR(255)` | `NOT NULL` | Organizing college or company |
| `event_date` | `DATE` | `NOT NULL` | Date event took place |
| `status` | `ENUM` | `DRAFT...APPROVED, REJECTED` | Workflow state |
| `reviewer_id` | `UUID` | `REFERENCES faculty(id)` | Currently claimed reviewer |
| `review_started_at`| `TIMESTAMPTZ`| `NULLABLE` | Timestamp when claimed |

#### `certificate_files`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | File record ID |
| `certificate_id` | `UUID` | `REFERENCES certificates(id)`| Associated certificate |
| `file_type` | `ENUM` | `PRIMARY, SUPPORTING` | Primary proof or addendum |
| `storage_path` | `TEXT` | `NOT NULL` | Bucket storage key |
| `file_hash` | `CHAR(64)` | `NOT NULL` | SHA-256 byte-level hash |
| `file_size` | `BIGINT` | `NOT NULL` | File size in bytes |
| `mime_type` | `VARCHAR(100)` | `NOT NULL` | e.g. `image/png`, `application/pdf` |

---

## 4. Authentication & Session Lifecycle

Authentication in NEC-SCS is designed for institutional ease of use:

- **Identifiers Accepted**:
  1. Institutional email address (e.g. `aditya.verma@student.abctech.edu`, `user@nandhaengg.org`, `user@nec.edu.in`)
  2. Student Register Number (e.g. `NEC21CS042`)
  3. Faculty Employee ID (e.g. `NEC-FAC-011`)
- **Session Mechanism**:
  - Secure HTTP cookie `campuscred_session_user_id` storing the validated profile ID.
  - Server actions resolve the session with `getCurrentUser()`, which hydrates the profile, student or faculty data, and college configuration.
- **Server Guard Rails**:
  ```typescript
  // Enforces specific role access
  await requireRole(["FACULTY", "HOD"]);
  ```

---

## 5. Certificate Lifecycle & Concurrency Locking

```
[Student Submission]
        │
        ▼
[Status: SUBMITTED]
        │
        ├───▶ [Faculty Claims Record] ──▶ Sets reviewer_id & review_started_at
        │                                 (Status: UNDER_REVIEW)
        │                                 (Lock duration: 30 minutes)
        │
        ├───▶ [Case 1: Approval] ───────▶ Sets status = APPROVED, awards points
        │
        ├───▶ [Case 2: Correction] ─────▶ Sets status = CORRECTION_REQUIRED
        │                                 Student modifies & resubmits ──▶ SUBMITTED
        │
        └───▶ [Case 3: Rejection] ──────▶ Sets status = REJECTED with audit note
```

### Concurrency Lock Rules
1. When faculty claims a certificate, `reviewer_id` is set to their Faculty ID, and `review_started_at` is set to `new Date()`.
2. Another reviewer attempting to claim or evaluate the same certificate will receive an advisory that the document is actively being evaluated by another faculty member.
3. If the review is not completed within `reviewer_reclaim_timeout_minutes` (default: 30 minutes), the lock expires and becomes eligible for claiming by other faculty or forced reclaim by the HOD.

---

## 6. Cryptographic Duplicate Detection

To prevent academic malpractice (e.g. students re-uploading a peer's certificate or submitting the same event twice):

1. **SHA-256 Computation**:
   On client or server upload, binary data is passed through Node.js crypto:
   ```typescript
   export function calculateSHA256(buffer: Buffer): string {
     return crypto.createHash("sha256").update(buffer).digest("hex");
   }
   ```
2. **Duplicate Cross-Check**:
   The computed hash is compared against the `certificate_files` repository:
   - If an exact hash match exists, a warning is returned:  
     `"Possible duplicate certificate detected: A byte-identical file was already submitted in the repository."`
   - The warning is presented to the student and flagged in the Review Workbench for faculty scrutiny.

---

## 7. Server Actions API Reference

### Auth Actions (`actions/auth.ts`)
- `loginAction(data: LoginFormData)`: Authenticates via email, register number, or employee ID.
- `logoutAction()`: Clears the session cookie and revalidates cache.
- `getCurrentUserAction()`: Retrieves the hydrated session user object.

### Certificate Actions (`actions/certificates.ts`)
- `getCategoriesAction()`: Returns all active achievement categories for the college.
- `createCertificateAction(formData, fileData)`: Validates and records a new certificate, calculates SHA-256 hash, and checks for duplicates.
- `submitCertificateAction(certificateId)`: Transitions a draft certificate to `SUBMITTED`.
- `getStudentCertificatesAction()`: Returns certificates submitted by the logged-in student.

### Review Actions (`actions/reviews.ts`)
- `getDepartmentReviewQueueAction()`: Retrieves all certificates within the faculty member's department.
- `claimCertificateForReviewAction(certificateId)`: Acquires an exclusive review lock.
- `approveCertificateAction(data: ApproveCertificateData)`: Approves certificate, sets credit points, and generates notifications.
- `requestCorrectionAction(data: RequestCorrectionData)`: Reverts certificate to student with remarks.
- `rejectCertificateAction(data: RejectCertificateData)`: Rejects submission with logged audit reason.
- `reclaimStaleCertificateAction(certificateId)`: Allows HOD or faculty to unlock expired reviews.

### Admin Actions (`actions/admin.ts`)
- `getAdminUsersAction()`: Returns student and faculty rosters with statistics.
- `addStudentAction(input)`: Enrolls an individual student with real-time validation and audit logging.
- `bulkEnrollStudentsAction(students)`: Batch registers verified students parsed from an Excel/CSV sheet.
- `getExistingStudentsAction()`: Retrieves current student roster for client-side duplicate checking.
- `verifyStudentLookupAction(query)`: Searches live DB by register number or email, returning verified records or auto-correction suggestions.
- `createDepartmentAction(name, code, type)`: Creates a UG or PG department.
- `toggleDepartmentStatusAction(departmentId)`: Activates or disables a branch.
- `updateCollegeSettingsAction(settings)`: Configures max points, lock timeout, and file sizes.
- `createCategoryAction(name, description)`: Registers a new achievement category.
- `getAuditLogsAction()`: Returns chronologically ordered audit logs.

---

## 8. REST API Endpoints

### 1. Watermarked Certificate Viewer
- **URL**: `GET /api/files/download?path=<storage_path>&expires=<timestamp>`
- **Authorization**: Session Cookie required.
- **Functionality**:
  - Validates signed URL expiration.
  - Returns the official Nandha Engineering College (Autonomous), Erode vector certificate seal and document representation for fast in-browser preview without external PDF readers.

### 2. Institutional SSR / NAAC Report Export
- **URL**: `GET /api/reports/export?type=students|certificates&level=UG|PG`
- **Authorization**: ADMIN or HOD role required.
- **Functionality**:
  - Generates downloadable CSV formatted specifically for NAAC Self-Study Reports (SSR) and NIRF student activity audits.
  - Supports filtering by Undergraduate (UG) or Postgraduate (PG) branches.

---

## 9. UI Component Design System

NEC-SCS utilizes a clean, modern institutional design built on Tailwind CSS:

- **Color Tokens**:
  - Primary: Deep Indigo / Institutional Blue (`#2563EB`, `#1D4ED8`)
  - Accent / Verification: Emerald Green (`#059669`, `#10B981`)
  - Caution / Review Lock: Amber Gold (`#D97706`, `#F59E0B`)
  - Dark Surface: Slate 900 / 950 (`#0F172A`, `#020617`)
- **Key Visual Elements**:
  - Official Nandha Engineering College Emblem (`components/layout/CampusCredLogo.tsx`)
  - Full-screen Reviewer Lightbox (`components/certificates/SecureViewer.tsx`)
  - Recharts Visual Analytics (`components/charts/`)
  - Mobile PWA responsive drawer & quick-touch navigation (`components/mobile/`)

---

## 10. Audit Logging & Security Specification

Every critical transaction triggers a structured audit log entry in `audit_logs`:
- **Actors Tracked**: User ID, IP address, user role.
- **Actions Logged**:
  `LOGIN`, `CERTIFICATE_CREATED`, `CERTIFICATE_SUBMITTED`, `CERTIFICATE_CLAIMED`, `CERTIFICATE_APPROVED`, `CORRECTION_REQUESTED`, `CERTIFICATE_REJECTED`, `POINTS_AWARDED`, `CONFIGURATION_CHANGED`.
- **Tamper Evidence**: Metadata snapshot stored as JSON to provide an immutable record during accreditation inspections.

---

## 11. Accreditation Data Export Engine

NEC-SCS directly outputs reporting data aligned with National Accreditation requirements:

| Accrediting Agency | Criterion / Metric | Data Columns Exported |
| :--- | :--- | :--- |
| **NAAC** | **3.4.1**: Innovation Ecosystem & Publications | Achievement ID, Student Name, Reg No, Title, Category (Research / Hackathon), Level, Proof Path |
| **NAAC** | **5.3.1**: Sports & Cultural Awards | Student Name, Register Number, Department, Level (State/National/International), Position, Points |
| **NIRF** | Student Co-Curricular Excellence | Consolidated department-wise approved achievements and credit point distribution |

---

## 12. Testing & Verification Suite

Run the automated verification suite against a running local instance:

```bash
# Terminal 1: Launch dev server
npm run dev

# Terminal 2: Run verification suite
node scripts/test-automation.mjs
```

### Verified Test Suite Breakdown:
1. `PWA Manifest` — Validates college name and app icons.
2. `Service Worker` — Checks `sw.js` cache registration.
3. `Landing Page` — Asserts official NEC branding and Erode autonomous college seals.
4. `Authentication Portal` — Verifies multi-identifier input fields.
5. `Faculty Queue` — Checks department student review isolation.
6. `Approval Workbench` — Tests certificate detail view, SHA-256 metadata, and action triggers.
7. `Watermarked Certificate SVG` — Tests dynamic generation of Nandha Engineering College seal.
8. `Admin Engineering Hub` — Verifies UG and PG department governance.
9. `Admin Executive Dashboard` — Tests institutional metric roll-ups.
10. `Student Dashboard` — Asserts student portfolio, points display, and register number binding.
