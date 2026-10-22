// scripts/feed_complete_database.ts
// Comprehensive Database Seeder & State Generator for NEC-SCS (CampusCred)
// Generates realistic, fully relational sample data for:
// - Colleges & College Settings
// - Departments (All 7 UG + 4 PG branches)
// - Categories (All 13 Institutional categories)
// - Faculty (HODs, Associate & Assistant Professors across all departments)
// - Students (UG 1st-4th year, PG 1st-2nd year across all departments)
// - Certificates (Across all statuses: APPROVED, UNDER_REVIEW, SUBMITTED, CORRECTION_REQUIRED, REJECTED, DRAFT)
// - Certificate Files (With cryptographic SHA-256 hashes, sizes, and mime types)
// - Certificate Reviews (Faculty remarks, claim states, evaluations)
// - Point Records (Credit points awarded, student balances)
// - Notifications (Real-time student & faculty inboxes)
// - Audit Logs (Immutable audit ledger with IP and actor metadata)
// - Passwords (Default 'password123' for all accounts)

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import {
  College,
  CollegeSettings,
  Department,
  Profile,
  Student,
  Faculty,
  Category,
  Certificate,
  CertificateFile,
  CertificateReview,
  PointRecord,
  Notification,
  AuditLog,
  EventLevel,
  CertificateStatus,
  ReviewAction,
  AuditAction,
} from "../types/database.types";

const DEFAULT_COLLEGE_ID = "11111111-1111-1111-1111-111111111111";

function hashStr(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

function generateDeterministicUUID(seed: string): string {
  const hash = crypto.createHash("sha256").update(seed).digest("hex");
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

export function buildCompleteDatabase() {
  console.log("🔨 Building complete institutional database for Nandha Engineering College (Autonomous)...");

  // 1. College
  const colleges: College[] = [
    {
      id: DEFAULT_COLLEGE_ID,
      name: "Nandha Engineering College (NEC)",
      code: "NEC",
      logo_url: "/nec-logo.png",
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ];

  // 2. College Settings
  const collegeSettings: CollegeSettings[] = [
    {
      id: "22222222-2222-2222-2222-222222222222",
      college_id: DEFAULT_COLLEGE_ID,
      max_points_per_certificate: 100,
      reviewer_reclaim_timeout_minutes: 30,
      max_file_size_mb: 10,
      updated_at: new Date().toISOString(),
    },
  ];

  // 3. Departments (7 UG + 4 PG)
  const departments: Department[] = [
    // Undergraduate
    {
      id: "33333333-3333-3333-3333-333333333301",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Computer Science and Engineering",
      code: "CSE",
      type: "UG",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "33333333-3333-3333-3333-333333333302",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Information Technology",
      code: "IT",
      type: "UG",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "33333333-3333-3333-3333-333333333303",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Electronics and Communication Engineering",
      code: "ECE",
      type: "UG",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "33333333-3333-3333-3333-333333333304",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Mechanical Engineering",
      code: "MECH",
      type: "UG",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "33333333-3333-3333-3333-333333333305",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Electrical and Electronics Engineering",
      code: "EEE",
      type: "UG",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "33333333-3333-3333-3333-333333333306",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Civil Engineering",
      code: "CIVIL",
      type: "UG",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "33333333-3333-3333-3333-333333333307",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Artificial Intelligence and Data Science",
      code: "AIDS",
      type: "UG",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    // Postgraduate
    {
      id: "33333333-3333-3333-3333-333333333308",
      college_id: DEFAULT_COLLEGE_ID,
      name: "M.E. Computer Science and Engineering",
      code: "ME-CSE",
      type: "PG",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "33333333-3333-3333-3333-333333333309",
      college_id: DEFAULT_COLLEGE_ID,
      name: "M.E. VLSI Design",
      code: "ME-VLSI",
      type: "PG",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "33333333-3333-3333-3333-333333333310",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Master of Business Administration",
      code: "MBA",
      type: "PG",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "33333333-3333-3333-3333-333333333311",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Master of Computer Applications",
      code: "MCA",
      type: "PG",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ];

  // 4. Achievement Categories
  const categories: Category[] = [
    {
      id: "44444444-4444-4444-4444-444444444401",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Academic",
      description: "Merit ranks, semester university ranks, academic excellence awards",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444402",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Technical",
      description: "Technical symposiums, coding challenges, project expos & design competitions",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444403",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Sports",
      description: "Anna University zonal, inter-collegiate, state and national athletic meets",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444404",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Cultural",
      description: "Music, classical dance, drama, debate, literary and fine arts festivals",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444405",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Workshop",
      description: "Hands-on technical workshops, industrial bootcamps, and masterclasses",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444406",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Seminar",
      description: "National and international conference presentations and keynote sessions",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444407",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Hackathon",
      description: "Smart India Hackathon, state level 24/36-hr hackathons, and ideathons",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444408",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Competition",
      description: "Science olympiads, robotics combat, quiz leagues, and case competitions",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444409",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Certification",
      description: "NPTEL Swayam Elite, AWS, Microsoft Azure, Google Cloud certifications",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444410",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Research",
      description: "IEEE/Scopus/SCI indexed research publications, book chapters, and patents",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444411",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Leadership",
      description: "Elected student council officers, technical society presidents, club leads",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444412",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Volunteering",
      description: "NSS, YRC, Unnat Bharat Abhiyan, rural literacy and disaster relief drives",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444413",
      college_id: DEFAULT_COLLEGE_ID,
      name: "Other",
      description: "Other verified co-curricular and institutional achievements",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ];

  const profiles: Profile[] = [];
  const faculty: Faculty[] = [];
  const students: Student[] = [];
  const certificates: Certificate[] = [];
  const certificateFiles: CertificateFile[] = [];
  const certificateReviews: CertificateReview[] = [];
  const pointRecords: PointRecord[] = [];
  const notifications: Notification[] = [];
  const auditLogs: AuditLog[] = [];
  const passwords: Record<string, string> = {};

  // ---------------------------------------------------------------------------
  // 5. ADMIN PROFILE
  // ---------------------------------------------------------------------------
  const adminProfileId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  profiles.push({
    id: adminProfileId,
    college_id: DEFAULT_COLLEGE_ID,
    role: "ADMIN",
    email: "admin@nandhaengg.org",
    phone_number: "+91 94433 11220",
    full_name: "Dr. Arthur Vance (Dean / Admin)",
    avatar_url: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  });
  passwords[adminProfileId] = "password123";

  auditLogs.push({
    id: generateDeterministicUUID("audit-admin-init"),
    college_id: DEFAULT_COLLEGE_ID,
    actor_id: adminProfileId,
    action: "CONFIGURATION_CHANGED",
    entity_type: "COLLEGE",
    entity_id: DEFAULT_COLLEGE_ID,
    metadata: { note: "College profile and UG/PG governance initialized" },
    ip_address: "127.0.0.1",
    created_at: "2026-01-01T00:00:00.000Z",
  });

  // ---------------------------------------------------------------------------
  // 6. FACULTY & HOD ROSTER (Across All 11 Departments)
  // ---------------------------------------------------------------------------
  const facultyRosterConfig = [
    // CSE (UG)
    {
      deptCode: "CSE",
      deptId: "33333333-3333-3333-3333-333333333301",
      members: [
        {
          profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03",
          facultyId: "55555555-5555-5555-5555-555555555503",
          empId: "FAC-CSE-001",
          name: "Dr. Murugan Pillai (HOD-CSE)",
          email: "hod.cse@nandhaengg.org",
          designation: "Professor & Head",
          isHod: true,
          phone: "+91 94432 00101",
        },
        {
          profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01",
          facultyId: "55555555-5555-5555-5555-555555555501",
          empId: "FAC-CSE-101",
          name: "Prof. Ramesh Sharma",
          email: "prof.sharma@nandhaengg.org",
          designation: "Associate Professor",
          isHod: false,
          phone: "+91 94432 00102",
        },
        {
          profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05",
          facultyId: "55555555-5555-5555-5555-555555555505",
          empId: "FAC-CSE-102",
          name: "Prof. N. Radhika",
          email: "prof.radhika@nandhaengg.org",
          designation: "Assistant Professor",
          isHod: false,
          phone: "+91 94432 00103",
        },
      ],
    },
    // IT (UG)
    {
      deptCode: "IT",
      deptId: "33333333-3333-3333-3333-333333333302",
      members: [
        {
          profileId: generateDeterministicUUID("fac-it-hod"),
          facultyId: generateDeterministicUUID("fac-rec-it-hod"),
          empId: "FAC-IT-001",
          name: "Dr. K. Senthil Kumar (HOD-IT)",
          email: "hod.it@nandhaengg.org",
          designation: "Professor & Head",
          isHod: true,
          phone: "+91 94432 00201",
        },
        {
          profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02",
          facultyId: "55555555-5555-5555-5555-555555555502",
          empId: "FAC-IT-102",
          name: "Dr. Kavita Nair",
          email: "dr.kavita@nandhaengg.org",
          designation: "Associate Professor",
          isHod: false,
          phone: "+91 94432 00202",
        },
      ],
    },
    // ECE (UG)
    {
      deptCode: "ECE",
      deptId: "33333333-3333-3333-3333-333333333303",
      members: [
        {
          profileId: generateDeterministicUUID("fac-ece-hod"),
          facultyId: generateDeterministicUUID("fac-rec-ece-hod"),
          empId: "FAC-ECE-001",
          name: "Dr. S. Prabakaran (HOD-ECE)",
          email: "hod.ece@nandhaengg.org",
          designation: "Professor & Head",
          isHod: true,
          phone: "+91 94432 00301",
        },
        {
          profileId: generateDeterministicUUID("fac-ece-01"),
          facultyId: generateDeterministicUUID("fac-rec-ece-01"),
          empId: "FAC-ECE-101",
          name: "Prof. R. Geetha",
          email: "prof.geetha@nandhaengg.org",
          designation: "Associate Professor",
          isHod: false,
          phone: "+91 94432 00302",
        },
      ],
    },
    // MECH (UG)
    {
      deptCode: "MECH",
      deptId: "33333333-3333-3333-3333-333333333304",
      members: [
        {
          profileId: generateDeterministicUUID("fac-mech-hod"),
          facultyId: generateDeterministicUUID("fac-rec-mech-hod"),
          empId: "FAC-MECH-001",
          name: "Dr. M. Soundararajan (HOD-MECH)",
          email: "hod.mech@nandhaengg.org",
          designation: "Professor & Head",
          isHod: true,
          phone: "+91 94432 00401",
        },
        {
          profileId: generateDeterministicUUID("fac-mech-01"),
          facultyId: generateDeterministicUUID("fac-rec-mech-01"),
          empId: "FAC-MECH-101",
          name: "Prof. T. Selvakumar",
          email: "prof.selvakumar@nandhaengg.org",
          designation: "Associate Professor",
          isHod: false,
          phone: "+91 94432 00402",
        },
      ],
    },
    // EEE (UG)
    {
      deptCode: "EEE",
      deptId: "33333333-3333-3333-3333-333333333305",
      members: [
        {
          profileId: generateDeterministicUUID("fac-eee-hod"),
          facultyId: generateDeterministicUUID("fac-rec-eee-hod"),
          empId: "FAC-EEE-001",
          name: "Dr. C. Manoharan (HOD-EEE)",
          email: "hod.eee@nandhaengg.org",
          designation: "Professor & Head",
          isHod: true,
          phone: "+91 94432 00501",
        },
        {
          profileId: generateDeterministicUUID("fac-eee-01"),
          facultyId: generateDeterministicUUID("fac-rec-eee-01"),
          empId: "FAC-EEE-101",
          name: "Prof. P. Deepa",
          email: "prof.deepa@nandhaengg.org",
          designation: "Assistant Professor",
          isHod: false,
          phone: "+91 94432 00502",
        },
      ],
    },
    // CIVIL (UG)
    {
      deptCode: "CIVIL",
      deptId: "33333333-3333-3333-3333-333333333306",
      members: [
        {
          profileId: generateDeterministicUUID("fac-civil-hod"),
          facultyId: generateDeterministicUUID("fac-rec-civil-hod"),
          empId: "FAC-CIVIL-001",
          name: "Dr. P. Sundaramoorthy (HOD-CIVIL)",
          email: "hod.civil@nandhaengg.org",
          designation: "Professor & Head",
          isHod: true,
          phone: "+91 94432 00601",
        },
        {
          profileId: generateDeterministicUUID("fac-civil-01"),
          facultyId: generateDeterministicUUID("fac-rec-civil-01"),
          empId: "FAC-CIVIL-101",
          name: "Prof. S. Rajesh",
          email: "prof.rajesh@nandhaengg.org",
          designation: "Assistant Professor",
          isHod: false,
          phone: "+91 94432 00602",
        },
      ],
    },
    // AIDS (UG)
    {
      deptCode: "AIDS",
      deptId: "33333333-3333-3333-3333-333333333307",
      members: [
        {
          profileId: generateDeterministicUUID("fac-aids-hod"),
          facultyId: generateDeterministicUUID("fac-rec-aids-hod"),
          empId: "FAC-AIDS-001",
          name: "Dr. R. Rajeswari (HOD-AIDS)",
          email: "hod.aids@nandhaengg.org",
          designation: "Professor & Head",
          isHod: true,
          phone: "+91 94432 00701",
        },
        {
          profileId: generateDeterministicUUID("fac-aids-01"),
          facultyId: generateDeterministicUUID("fac-rec-aids-01"),
          empId: "FAC-AIDS-101",
          name: "Prof. V. Anitha",
          email: "prof.anitha@nandhaengg.org",
          designation: "Associate Professor",
          isHod: false,
          phone: "+91 94432 00702",
        },
      ],
    },
    // ME-CSE (PG)
    {
      deptCode: "ME-CSE",
      deptId: "33333333-3333-3333-3333-333333333308",
      members: [
        {
          profileId: generateDeterministicUUID("fac-mecse-hod"),
          facultyId: generateDeterministicUUID("fac-rec-mecse-hod"),
          empId: "FAC-MECSE-001",
          name: "Dr. G. Venkatachalam (PG-Head)",
          email: "hod.mecse@nandhaengg.org",
          designation: "Professor & Head (PG)",
          isHod: true,
          phone: "+91 94432 00801",
        },
        {
          profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06",
          facultyId: "55555555-5555-5555-5555-555555555506",
          empId: "FAC-MECSE-101",
          name: "Dr. B. Saravanan",
          email: "dr.saravanan@nandhaengg.org",
          designation: "Associate Professor",
          isHod: false,
          phone: "+91 94432 00802",
        },
      ],
    },
    // ME-VLSI (PG)
    {
      deptCode: "ME-VLSI",
      deptId: "33333333-3333-3333-3333-333333333309",
      members: [
        {
          profileId: generateDeterministicUUID("fac-mevlsi-hod"),
          facultyId: generateDeterministicUUID("fac-rec-mevlsi-hod"),
          empId: "FAC-MEVLSI-001",
          name: "Dr. E. Mohanapriya (HOD-VLSI)",
          email: "hod.mevlsi@nandhaengg.org",
          designation: "Professor & Head",
          isHod: true,
          phone: "+91 94432 00901",
        },
      ],
    },
    // MBA (PG)
    {
      deptCode: "MBA",
      deptId: "33333333-3333-3333-3333-333333333310",
      members: [
        {
          profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04",
          facultyId: "55555555-5555-5555-5555-555555555504",
          empId: "FAC-MBA-001",
          name: "Dr. K. Swaminathan (HOD-MBA)",
          email: "hod.mba@nandhaengg.org",
          designation: "Professor & Head",
          isHod: true,
          phone: "+91 94432 01001",
        },
        {
          profileId: generateDeterministicUUID("fac-mba-01"),
          facultyId: generateDeterministicUUID("fac-rec-mba-01"),
          empId: "FAC-MBA-101",
          name: "Prof. J. Shanthi",
          email: "prof.shanthi@nandhaengg.org",
          designation: "Associate Professor",
          isHod: false,
          phone: "+91 94432 01002",
        },
      ],
    },
    // MCA (PG)
    {
      deptCode: "MCA",
      deptId: "33333333-3333-3333-3333-333333333311",
      members: [
        {
          profileId: generateDeterministicUUID("fac-mca-hod"),
          facultyId: generateDeterministicUUID("fac-rec-mca-hod"),
          empId: "FAC-MCA-001",
          name: "Dr. T. Sivakumar (HOD-MCA)",
          email: "hod.mca@nandhaengg.org",
          designation: "Professor & Head",
          isHod: true,
          phone: "+91 94432 01101",
        },
        {
          profileId: generateDeterministicUUID("fac-mca-01"),
          facultyId: generateDeterministicUUID("fac-rec-mca-01"),
          empId: "FAC-MCA-101",
          name: "Prof. D. Premkumar",
          email: "prof.premkumar@nandhaengg.org",
          designation: "Assistant Professor",
          isHod: false,
          phone: "+91 94432 01102",
        },
      ],
    },
  ];

  // Map to easily find faculty reviewer for a department
  const deptFacultyMap: Record<string, Faculty[]> = {};

  for (const group of facultyRosterConfig) {
    deptFacultyMap[group.deptId] = [];
    for (const mem of group.members) {
      profiles.push({
        id: mem.profileId,
        college_id: DEFAULT_COLLEGE_ID,
        role: mem.isHod ? "HOD" : "FACULTY",
        email: mem.email,
        phone_number: mem.phone,
        full_name: mem.name,
        avatar_url: null,
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      });

      const facObj: Faculty = {
        id: mem.facultyId,
        profile_id: mem.profileId,
        college_id: DEFAULT_COLLEGE_ID,
        department_id: group.deptId,
        designation: mem.designation,
        employee_id: mem.empId,
        is_hod: mem.isHod,
        created_at: "2026-01-01T00:00:00Z",
      };

      faculty.push(facObj);
      deptFacultyMap[group.deptId].push(facObj);
      passwords[mem.profileId] = "password123";
    }
  }

  // ---------------------------------------------------------------------------
  // 7. STUDENT ROSTER (Realistic Students Across All Departments & Years)
  // ---------------------------------------------------------------------------
  const studentRosterData = [
    // CSE (UG)
    {
      profileId: "cccccccc-cccc-cccc-cccc-cccccccccc01",
      studentId: "66666666-6666-6666-6666-666666666601",
      deptId: "33333333-3333-3333-3333-333333333301",
      regNo: "710022CS0101",
      name: "Aditya Verma",
      email: "aditya.verma@student.nandhaengg.org",
      year: 3,
      phone: "+91 98765 01001",
    },
    {
      profileId: "cccccccc-cccc-cccc-cccc-cccccccccc02",
      studentId: "66666666-6666-6666-6666-666666666602",
      deptId: "33333333-3333-3333-3333-333333333301",
      regNo: "710022CS0142",
      name: "Priya Sundaram",
      email: "priya.sundaram@student.nandhaengg.org",
      year: 3,
      phone: "+91 98765 01002",
    },
    {
      profileId: "cccccccc-cccc-cccc-cccc-cccccccccc03",
      studentId: "66666666-6666-6666-6666-666666666603",
      deptId: "33333333-3333-3333-3333-333333333301",
      regNo: "NEC23CS001",
      name: "Rahul Venkatesh",
      email: "rahul.v@student.nandhaengg.org",
      year: 4,
      phone: "+91 98765 01003",
    },
    {
      profileId: "cccccccc-cccc-cccc-cccc-cccccccccc04",
      studentId: "66666666-6666-6666-6666-666666666604",
      deptId: "33333333-3333-3333-3333-333333333301",
      regNo: "NEC25CS001",
      name: "Deepak Muthusamy",
      email: "deepak.m@student.nandhaengg.org",
      year: 2,
      phone: "+91 98765 01004",
    },
    {
      profileId: "cccccccc-cccc-cccc-cccc-cccccccccc05",
      studentId: "66666666-6666-6666-6666-666666666605",
      deptId: "33333333-3333-3333-3333-333333333301",
      regNo: "NEC26CS001",
      name: "Janani Subramanian",
      email: "janani.s@student.nandhaengg.org",
      year: 1,
      phone: "+91 98765 01005",
    },

    // IT (UG)
    {
      profileId: generateDeterministicUUID("stu-it-01"),
      studentId: generateDeterministicUUID("stu-rec-it-01"),
      deptId: "33333333-3333-3333-3333-333333333302",
      regNo: "NEC24IT001",
      name: "Mythili Chandran",
      email: "mythili.c@student.nandhaengg.org",
      year: 3,
      phone: "+91 98765 02001",
    },
    {
      profileId: generateDeterministicUUID("stu-it-02"),
      studentId: generateDeterministicUUID("stu-rec-it-02"),
      deptId: "33333333-3333-3333-3333-333333333302",
      regNo: "NEC25IT001",
      name: "Lakshmi Krishnan",
      email: "lakshmi.k@student.nandhaengg.org",
      year: 2,
      phone: "+91 98765 02002",
    },
    {
      profileId: generateDeterministicUUID("stu-it-03"),
      studentId: generateDeterministicUUID("stu-rec-it-03"),
      deptId: "33333333-3333-3333-3333-333333333302",
      regNo: "NEC26IT001",
      name: "Mohan Balaji",
      email: "mohan.b@student.nandhaengg.org",
      year: 1,
      phone: "+91 98765 02003",
    },

    // ECE (UG)
    {
      profileId: generateDeterministicUUID("stu-ece-01"),
      studentId: generateDeterministicUUID("stu-rec-ece-01"),
      deptId: "33333333-3333-3333-3333-333333333303",
      regNo: "NEC24EC001",
      name: "Tharun Thangaraj",
      email: "tharun.t@student.nandhaengg.org",
      year: 3,
      phone: "+91 98765 03001",
    },
    {
      profileId: generateDeterministicUUID("stu-ece-02"),
      studentId: generateDeterministicUUID("stu-rec-ece-02"),
      deptId: "33333333-3333-3333-3333-333333333303",
      regNo: "NEC25EC001",
      name: "Akash Sekar",
      email: "akash.s@student.nandhaengg.org",
      year: 2,
      phone: "+91 98765 03002",
    },
    {
      profileId: generateDeterministicUUID("stu-ece-03"),
      studentId: generateDeterministicUUID("stu-rec-ece-03"),
      deptId: "33333333-3333-3333-3333-333333333303",
      regNo: "NEC26EC001",
      name: "Harini Natarajan",
      email: "harini.n@student.nandhaengg.org",
      year: 1,
      phone: "+91 98765 03003",
    },

    // MECH (UG)
    {
      profileId: generateDeterministicUUID("stu-mech-01"),
      studentId: generateDeterministicUUID("stu-rec-mech-01"),
      deptId: "33333333-3333-3333-3333-333333333304",
      regNo: "NEC24ME001",
      name: "Rohini Natarajan",
      email: "rohini.n@student.nandhaengg.org",
      year: 3,
      phone: "+91 98765 04001",
    },
    {
      profileId: generateDeterministicUUID("stu-mech-02"),
      studentId: generateDeterministicUUID("stu-rec-mech-02"),
      deptId: "33333333-3333-3333-3333-333333333304",
      regNo: "NEC25ME001",
      name: "Yazhini Govindan",
      email: "yazhini.g@student.nandhaengg.org",
      year: 2,
      phone: "+91 98765 04002",
    },
    {
      profileId: generateDeterministicUUID("stu-mech-03"),
      studentId: generateDeterministicUUID("stu-rec-mech-03"),
      deptId: "33333333-3333-3333-3333-333333333304",
      regNo: "NEC26ME001",
      name: "Sabari Balaji",
      email: "sabari.b@student.nandhaengg.org",
      year: 1,
      phone: "+91 98765 04003",
    },

    // EEE (UG)
    {
      profileId: generateDeterministicUUID("stu-eee-01"),
      studentId: generateDeterministicUUID("stu-rec-eee-01"),
      deptId: "33333333-3333-3333-3333-333333333305",
      regNo: "NEC24EE001",
      name: "Hemalatha Raman",
      email: "hemalatha.r@student.nandhaengg.org",
      year: 3,
      phone: "+91 98765 05001",
    },
    {
      profileId: generateDeterministicUUID("stu-eee-02"),
      studentId: generateDeterministicUUID("stu-rec-eee-02"),
      deptId: "33333333-3333-3333-3333-333333333305",
      regNo: "NEC25EE001",
      name: "Divya Muthusamy",
      email: "divya.m@student.nandhaengg.org",
      year: 2,
      phone: "+91 98765 05002",
    },
    {
      profileId: generateDeterministicUUID("stu-eee-03"),
      studentId: generateDeterministicUUID("stu-rec-eee-03"),
      deptId: "33333333-3333-3333-3333-333333333305",
      regNo: "NEC26EE001",
      name: "Harish Karthikeyan",
      email: "harish.k@student.nandhaengg.org",
      year: 1,
      phone: "+91 98765 05003",
    },

    // CIVIL (UG)
    {
      profileId: generateDeterministicUUID("stu-civil-01"),
      studentId: generateDeterministicUUID("stu-rec-civil-01"),
      deptId: "33333333-3333-3333-3333-333333333306",
      regNo: "NEC24CE001",
      name: "Kaviya Velusamy",
      email: "kaviya.v@student.nandhaengg.org",
      year: 3,
      phone: "+91 98765 06001",
    },
    {
      profileId: generateDeterministicUUID("stu-civil-02"),
      studentId: generateDeterministicUUID("stu-rec-civil-02"),
      deptId: "33333333-3333-3333-3333-333333333306",
      regNo: "NEC25CE001",
      name: "Aadhavan Selvaraj",
      email: "aadhavan.s@student.nandhaengg.org",
      year: 2,
      phone: "+91 98765 06002",
    },
    {
      profileId: generateDeterministicUUID("stu-civil-03"),
      studentId: generateDeterministicUUID("stu-rec-civil-03"),
      deptId: "33333333-3333-3333-3333-333333333306",
      regNo: "NEC26CE001",
      name: "Logesh Venkatesh",
      email: "logesh.v@student.nandhaengg.org",
      year: 1,
      phone: "+91 98765 06003",
    },

    // AIDS (UG)
    {
      profileId: generateDeterministicUUID("stu-aids-01"),
      studentId: generateDeterministicUUID("stu-rec-aids-01"),
      deptId: "33333333-3333-3333-3333-333333333307",
      regNo: "NEC24AD001",
      name: "Monisha Palanisamy",
      email: "monisha.p@student.nandhaengg.org",
      year: 3,
      phone: "+91 98765 07001",
    },
    {
      profileId: generateDeterministicUUID("stu-aids-02"),
      studentId: generateDeterministicUUID("stu-rec-aids-02"),
      deptId: "33333333-3333-3333-3333-333333333307",
      regNo: "NEC25AD001",
      name: "Sanjay Raman",
      email: "sanjay.r@student.nandhaengg.org",
      year: 2,
      phone: "+91 98765 07002",
    },
    {
      profileId: generateDeterministicUUID("stu-aids-03"),
      studentId: generateDeterministicUUID("stu-rec-aids-03"),
      deptId: "33333333-3333-3333-3333-333333333307",
      regNo: "NEC26AD001",
      name: "Suriya Venkatesh",
      email: "suriya.v@student.nandhaengg.org",
      year: 1,
      phone: "+91 98765 07003",
    },

    // ME-CSE (PG)
    {
      profileId: "cccccccc-cccc-cccc-cccc-cccccccccc06",
      studentId: "66666666-6666-6666-6666-666666666606",
      deptId: "33333333-3333-3333-3333-333333333308",
      regNo: "NEC25PS001",
      name: "Thamizh Ramasamy",
      email: "thamizh.r@student.nandhaengg.org",
      year: 2,
      phone: "+91 98765 08001",
    },
    {
      profileId: generateDeterministicUUID("stu-mecse-02"),
      studentId: generateDeterministicUUID("stu-rec-mecse-02"),
      deptId: "33333333-3333-3333-3333-333333333308",
      regNo: "NEC26PS001",
      name: "Sowmiya Arumugam",
      email: "sowmiya.a@student.nandhaengg.org",
      year: 1,
      phone: "+91 98765 08002",
    },

    // ME-VLSI (PG)
    {
      profileId: generateDeterministicUUID("stu-mevlsi-01"),
      studentId: generateDeterministicUUID("stu-rec-mevlsi-01"),
      deptId: "33333333-3333-3333-3333-333333333309",
      regNo: "NEC25VL001",
      name: "Karthikeyan Shanmugam",
      email: "karthikeyan.s@student.nandhaengg.org",
      year: 2,
      phone: "+91 98765 09001",
    },
    {
      profileId: generateDeterministicUUID("stu-mevlsi-02"),
      studentId: generateDeterministicUUID("stu-rec-mevlsi-02"),
      deptId: "33333333-3333-3333-3333-333333333309",
      regNo: "NEC26VL001",
      name: "Bhavani Murugesan",
      email: "bhavani.m@student.nandhaengg.org",
      year: 1,
      phone: "+91 98765 09002",
    },

    // MBA (PG)
    {
      profileId: "cccccccc-cccc-cccc-cccc-cccccccccc07",
      studentId: "66666666-6666-6666-6666-666666666607",
      deptId: "33333333-3333-3333-3333-333333333310",
      regNo: "NEC25MB001",
      name: "Bharathi Karthikeyan",
      email: "bharathi.k@student.nandhaengg.org",
      year: 2,
      phone: "+91 98765 10001",
    },
    {
      profileId: generateDeterministicUUID("stu-mba-02"),
      studentId: generateDeterministicUUID("stu-rec-mba-02"),
      deptId: "33333333-3333-3333-3333-333333333310",
      regNo: "NEC26MB001",
      name: "Jeeva Chandran",
      email: "jeeva.c@student.nandhaengg.org",
      year: 1,
      phone: "+91 98765 10002",
    },

    // MCA (PG)
    {
      profileId: "cccccccc-cccc-cccc-cccc-cccccccccc08",
      studentId: "66666666-6666-6666-6666-666666666608",
      deptId: "33333333-3333-3333-3333-333333333311",
      regNo: "NEC25MA001",
      name: "Madhan Ganesan",
      email: "madhan.g@student.nandhaengg.org",
      year: 2,
      phone: "+91 98765 11001",
    },
    {
      profileId: generateDeterministicUUID("stu-mca-02"),
      studentId: generateDeterministicUUID("stu-rec-mca-02"),
      deptId: "33333333-3333-3333-3333-333333333311",
      regNo: "NEC26MA001",
      name: "Saranya Krishnan",
      email: "saranya.k@student.nandhaengg.org",
      year: 1,
      phone: "+91 98765 11002",
    },
  ];

  for (const st of studentRosterData) {
    profiles.push({
      id: st.profileId,
      college_id: DEFAULT_COLLEGE_ID,
      role: "STUDENT",
      email: st.email,
      phone_number: st.phone,
      full_name: st.name,
      avatar_url: null,
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });

    students.push({
      id: st.studentId,
      profile_id: st.profileId,
      college_id: DEFAULT_COLLEGE_ID,
      department_id: st.deptId,
      register_number: st.regNo,
      academic_year: st.year,
      created_at: "2026-01-01T00:00:00Z",
    });

    passwords[st.profileId] = "password123";
  }

  // ---------------------------------------------------------------------------
  // 8. RICH CERTIFICATES, REVIEWS, POINT RECORDS & FILES GENERATOR
  // ---------------------------------------------------------------------------
  // We will generate comprehensive achievement certificates across all categories,
  // event levels, and real-world statuses (APPROVED, UNDER_REVIEW, SUBMITTED,
  // CORRECTION_REQUIRED, REJECTED, DRAFT).

  interface CertTemplate {
    title: string;
    eventName: string;
    categoryName: string;
    level: EventLevel;
    organizer: string;
    date: string;
    achievement: string;
    description: string;
    status: CertificateStatus;
    pointsAwarded?: number;
    filename: string;
    mimeType: string;
    fileSize: number;
    reviewComment?: string;
    rejectionReason?: string;
  }

  const certTemplates: CertTemplate[] = [
    // 1. National Hackathon Winner (APPROVED - 100 Points)
    {
      title: "Smart India Hackathon 2026 Winner (Hardware Edition)",
      eventName: "Smart India Hackathon (SIH) 2026 Grand Finale",
      categoryName: "Hackathon",
      level: "NATIONAL",
      organizer: "Ministry of Education & AICTE, New Delhi",
      date: "2026-02-14",
      achievement: "First Prize Winner (₹1,00,000 Cash Prize)",
      description: "Developed an IoT-enabled Autonomous Water Quality Monitoring Subsystem for rural reservoir networks.",
      status: "APPROVED",
      pointsAwarded: 100,
      filename: "sih2026_first_prize_winner.pdf",
      mimeType: "application/pdf",
      fileSize: 1845200,
      reviewComment: "Outstanding national achievement. Verified with AICTE SIH portal records and official merit certificate.",
    },
    // 2. IEEE International Conference Research Paper (APPROVED - 85 Points)
    {
      title: "Edge-AI Architectures for Low-Power Agricultural Sensor Nodes",
      eventName: "IEEE International Conference on Smart Information Systems (ICSIS 2026)",
      categoryName: "Research",
      level: "INTERNATIONAL",
      organizer: "IEEE Madras Section & Anna University",
      date: "2026-01-20",
      achievement: "Best Oral Paper Presentation & Scopus Indexing",
      description: "Published and presented research paper indexed in IEEE Xplore digital library with DOI: 10.1109/ICSIS.2026.1042.",
      status: "APPROVED",
      pointsAwarded: 85,
      filename: "ieee_paper_presentation_cert.pdf",
      mimeType: "application/pdf",
      fileSize: 1240500,
      reviewComment: "Verified Scopus indexing and IEEE Xplore publication link. Excellent research contribution for NAAC Criteria 3.4.",
    },
    // 3. AWS Global Certification (APPROVED - 60 Points)
    {
      title: "AWS Certified Solutions Architect – Associate (SAA-C03)",
      eventName: "Amazon Web Services Global Certification Exam",
      categoryName: "Certification",
      level: "INTERNATIONAL",
      organizer: "Amazon Web Services (AWS) Inc.",
      date: "2026-03-05",
      achievement: "Certified Solutions Architect (Score: 890/1000)",
      description: "Credential validation code: AWS-SAA-2026-8891042 verified via AWS Credly digital badge.",
      status: "APPROVED",
      pointsAwarded: 60,
      filename: "aws_solutions_architect_cert.pdf",
      mimeType: "application/pdf",
      fileSize: 654200,
      reviewComment: "Credly digital badge verified. Industry-recognized cloud certification awarded points according to policy.",
    },
    // 4. Anna University Zonal Sports Tournament (APPROVED - 50 Points)
    {
      title: "Anna University Zone-12 Inter-Collegiate Basketball Tournament",
      eventName: "Anna University Zonal Sports Board 2025-2026",
      categoryName: "Sports",
      level: "STATE",
      organizer: "Anna University Sports Board, Chennai",
      date: "2026-02-28",
      achievement: "Zonal Championship Gold Medalist (Men Team)",
      description: "Captained the college basketball team to championship victory across 18 participating autonomous colleges.",
      status: "APPROVED",
      pointsAwarded: 50,
      filename: "anna_univ_zonal_gold_medal.pdf",
      mimeType: "application/pdf",
      fileSize: 920400,
      reviewComment: "Physical Education director verification endorsed. Verified official Anna University score sheet.",
    },
    // 5. NPTEL Elite+Gold Certification (APPROVED - 75 Points)
    {
      title: "NPTEL Online Certification: Deep Learning & Neural Networks",
      eventName: "NPTEL Swayam 12-Week Proctored Examination",
      categoryName: "Certification",
      level: "NATIONAL",
      organizer: "IIT Madras & Ministry of Education",
      date: "2026-04-02",
      achievement: "Elite + Gold Medal (Top 1% Topper, Score: 94%)",
      description: "Completed 12-week course covering convolutional architectures, transformer backbones, and PyTorch deployment.",
      status: "APPROVED",
      pointsAwarded: 75,
      filename: "nptel_deep_learning_elite_gold.pdf",
      mimeType: "application/pdf",
      fileSize: 485100,
      reviewComment: "Top 1% topper certificate validated via NPTEL QR code verification portal.",
    },
    // 6. Currently UNDER REVIEW (Locked by Faculty)
    {
      title: "State Level Hackathon: Erode Smart Mobility Hack 2026",
      eventName: "Tamil Nadu Innovation & Startup Mission Hackathon",
      categoryName: "Hackathon",
      level: "STATE",
      organizer: "StartupTN & Erode District Administration",
      date: "2026-04-10",
      achievement: "Second Runner Up & Incubation Grant",
      description: "Built dynamic public transport ETA tracker with edge GPS telemetry.",
      status: "UNDER_REVIEW",
      filename: "startuptn_smart_mobility_hack.pdf",
      mimeType: "application/pdf",
      fileSize: 742100,
    },
    // 7. Fresh SUBMISSION (In Review Queue)
    {
      title: "AICTE Chhatra Vishwakarma Award 2026 Regional Semifinalist",
      eventName: "AICTE National Student Innovation Showcase",
      categoryName: "Technical",
      level: "NATIONAL",
      organizer: "All India Council for Technical Education (AICTE)",
      date: "2026-04-12",
      achievement: "Regional Semifinalist & Prototype Grant",
      description: "Solar-powered automated agro-spray drone prototype demonstrated before AICTE expert panel.",
      status: "SUBMITTED",
      filename: "aicte_vishwakarma_semifinalist.pdf",
      mimeType: "application/pdf",
      fileSize: 1120000,
    },
    // 8. CORRECTION REQUIRED (Remarks sent to student)
    {
      title: "National Cyber Defense Competition (NCDC 2026)",
      eventName: "National Cyber Security Conference CTF",
      categoryName: "Technical",
      level: "NATIONAL",
      organizer: "National Cyber Safety and Security Standards (NCSSS)",
      date: "2026-03-18",
      achievement: "Finalist Rank 7 (Capture The Flag)",
      description: "Reverse engineering, binary exploitation, and web application penetration testing CTF.",
      status: "CORRECTION_REQUIRED",
      filename: "ncdc_ctf_participant_slip.pdf",
      mimeType: "application/pdf",
      fileSize: 320400,
      reviewComment: "Please upload the official merit certificate signed by the NCSSS Director instead of the payment confirmation slip.",
    },
    // 9. REJECTED (Unclear / Out of Policy)
    {
      title: "Online Webinar: Introduction to Web Development",
      eventName: "YouTube Tech Live Stream Series",
      categoryName: "Workshop",
      level: "OTHER",
      organizer: "Independent Tech Creator Hub",
      date: "2026-01-10",
      achievement: "Certificate of Attendance",
      description: "Attended 1-hour live stream on introductory HTML/CSS concepts.",
      status: "REJECTED",
      filename: "webinar_attendance_cert.pdf",
      mimeType: "application/pdf",
      fileSize: 210000,
      rejectionReason: "Not aligned with institutional criteria",
      reviewComment: "1-hour informal webinars without formal hands-on assessment or institutional accreditation are not eligible for institutional credit points under NEC policy.",
    },
    // 10. DRAFT Certificate
    {
      title: "Inter-Collegiate Classical Solo Dance Competition",
      eventName: "FESTEMBER 2026 — NIT Trichy Cultural Fest",
      categoryName: "Cultural",
      level: "INTER_COLLEGE",
      organizer: "National Institute of Technology, Tiruchirappalli",
      date: "2026-03-25",
      achievement: "Second Place (Classical Solo Category)",
      description: "Represented Nandha Engineering College in the classical Bharatanatyam solo competition.",
      status: "DRAFT",
      filename: "festember_dance_cert.pdf",
      mimeType: "application/pdf",
      fileSize: 840000,
    },
    // 11. IP India Patent Published (APPROVED - 100 Points)
    {
      title: "IoT-Driven Non-Invasive Continuous Glucose Monitor",
      eventName: "Indian Patent Office (IP India) Official Journal Publication",
      categoryName: "Research",
      level: "NATIONAL",
      organizer: "Controller General of Patents, Designs and Trade Marks (IP India)",
      date: "2026-02-10",
      achievement: "Published Patent (Application No: 202641009842 A)",
      description: "Official publication in the Patent Office Journal No. 06/2026 dated 10/02/2026.",
      status: "APPROVED",
      pointsAwarded: 100,
      filename: "patent_office_journal_publication.pdf",
      mimeType: "application/pdf",
      fileSize: 1450000,
      reviewComment: "Official Gazette publication certificate verified. Granted maximum 100 credit points for institutional innovation metrics.",
    },
    // 12. Zoho Corporation Summer Internship (APPROVED - 50 Points)
    {
      title: "Zoho Corporation Software Engineering Summer Internship",
      eventName: "Zoho Software Development Internship Program",
      categoryName: "Technical",
      level: "INTER_COLLEGE",
      organizer: "Zoho Corporation Pvt. Ltd., Chennai",
      date: "2026-01-30",
      achievement: "Completed with 'Outstanding' Performance Rating",
      description: "Built full-stack microservices using Java, React, and PostgreSQL for Zoho Creator ecosystem.",
      status: "APPROVED",
      pointsAwarded: 50,
      filename: "zoho_internship_completion_cert.pdf",
      mimeType: "application/pdf",
      fileSize: 980100,
      reviewComment: "Internship letter and mentor evaluation report verified with Placement & Training cell.",
    },
  ];

  // Map categories by name
  const catMap = new Map(categories.map((c) => [c.name, c.id]));

  // Anchor predefined certificates for regression tests
  const PREDEFINED_CERTS = [
    {
      certId: "77777777-7777-7777-7777-777777777701",
      studentId: "66666666-6666-6666-6666-666666666601", // Aditya Verma
      deptId: "33333333-3333-3333-3333-333333333301", // CSE
      templateIndex: 0, // Smart India Hackathon Winner
    },
    {
      certId: "77777777-7777-7777-7777-777777777702",
      studentId: "66666666-6666-6666-6666-666666666601", // Aditya Verma
      deptId: "33333333-3333-3333-3333-333333333301", // CSE
      templateIndex: 2, // AWS Solutions Architect
    },
    {
      certId: "77777777-7777-7777-7777-777777777703",
      studentId: "66666666-6666-6666-6666-666666666602", // Priya Sundaram
      deptId: "33333333-3333-3333-3333-333333333301", // CSE
      templateIndex: 1, // IEEE Paper Presentation
    },
  ];

  // Distribute certificates across students so EVERY student has verified submissions!
  let certCounter = 1;

  for (const st of students) {
    // Determine how many certificates this student will have (2 to 4 certificates each)
    const seedNum = (st.academic_year * 3 + st.register_number.charCodeAt(st.register_number.length - 1)) % 3 + 2;

    for (let i = 0; i < seedNum; i++) {
      let certId: string;
      let template: CertTemplate;

      // Check if predefined
      const predefined = PREDEFINED_CERTS.find(
        (p) => p.studentId === st.id && (i === 0 || (p.certId.endsWith("02") && i === 1))
      );

      if (predefined && certCounter <= 3) {
        certId = predefined.certId;
        template = certTemplates[predefined.templateIndex];
      } else {
        certId = generateDeterministicUUID(`cert-${st.id}-${i}-${certCounter}`);
        const tIndex = (certCounter + i + st.academic_year) % certTemplates.length;
        template = certTemplates[tIndex];
      }

      certCounter++;

      const categoryId = catMap.get(template.categoryName) || categories[1].id;
      const deptFacultyList = deptFacultyMap[st.department_id] || faculty.slice(0, 2);
      const reviewerFaculty = deptFacultyList[certCounter % deptFacultyList.length] || faculty[0];

      const isApproved = template.status === "APPROVED";
      const isUnderReview = template.status === "UNDER_REVIEW";
      const isCorrection = template.status === "CORRECTION_REQUIRED";
      const isRejected = template.status === "REJECTED";

      const reviewerId = (isApproved || isUnderReview || isCorrection || isRejected) ? reviewerFaculty.id : null;
      const reviewStartedAt = (isApproved || isUnderReview || isCorrection || isRejected)
        ? new Date(Date.now() - (i + 1) * 86400000 * 2).toISOString()
        : null;

      const certObj: Certificate = {
        id: certId,
        college_id: DEFAULT_COLLEGE_ID,
        student_id: st.id,
        achievement_id: null,
        title: template.title,
        event_name: template.eventName,
        category_id: categoryId,
        event_level: template.level,
        organizer: template.organizer,
        event_date: template.date,
        achievement: template.achievement,
        description: template.description,
        status: template.status,
        reviewer_id: reviewerId,
        review_started_at: reviewStartedAt,
        submitted_at: new Date(Date.now() - (i + 1) * 86400000 * 5).toISOString(),
        created_at: new Date(Date.now() - (i + 1) * 86400000 * 6).toISOString(),
        updated_at: new Date(Date.now() - (i + 1) * 86400000 * 1).toISOString(),
      };

      certificates.push(certObj);

      // Certificate File (Primary document with cryptographic SHA-256 hash)
      const fileId = generateDeterministicUUID(`file-${certId}`);
      const fileHash = hashStr(`${certId}-${template.filename}-${template.fileSize}`);

      certificateFiles.push({
        id: fileId,
        certificate_id: certId,
        version: 1,
        file_type: "PRIMARY",
        storage_path: `certificates/${certId}/${template.filename}`,
        original_filename: template.filename,
        file_size: template.fileSize,
        mime_type: template.mimeType,
        file_hash: fileHash,
        created_at: certObj.created_at,
      });

      // Reviews & Points for evaluated certificates
      if (isApproved && reviewerId) {
        const reviewId = generateDeterministicUUID(`review-${certId}`);
        certificateReviews.push({
          id: reviewId,
          certificate_id: certId,
          reviewer_id: reviewerId,
          action: "APPROVED" as ReviewAction,
          reason: null,
          comment: template.reviewComment || "Certificate verified against institutional criteria.",
          created_at: certObj.updated_at,
        });

        const points = template.pointsAwarded || 50;
        const pointId = generateDeterministicUUID(`point-${certId}`);
        pointRecords.push({
          id: pointId,
          student_id: st.id,
          certificate_id: certId,
          points: points,
          awarded_by: reviewerId,
          comment: `Awarded ${points} activity points for verified achievement.`,
          is_latest: true,
          created_at: certObj.updated_at,
        });

        // Notifications
        notifications.push({
          id: generateDeterministicUUID(`notif-stu-${certId}`),
          user_id: st.profile_id,
          type: "CERTIFICATE_APPROVED",
          title: "Certificate Approved! 🎉",
          message: `Your certificate "${template.title}" has been approved with ${points} credit points.`,
          entity_type: "CERTIFICATE",
          entity_id: certId,
          read_at: null,
          created_at: certObj.updated_at,
        });

        // Audit Log
        auditLogs.push({
          id: generateDeterministicUUID(`audit-approve-${certId}`),
          college_id: DEFAULT_COLLEGE_ID,
          actor_id: reviewerFaculty.profile_id,
          action: "CERTIFICATE_APPROVED",
          entity_type: "CERTIFICATE",
          entity_id: certId,
          metadata: { points, reviewer: reviewerFaculty.employee_id, studentRegNo: st.register_number },
          ip_address: "127.0.0.1",
          created_at: certObj.updated_at,
        });
      } else if (isCorrection && reviewerId) {
        certificateReviews.push({
          id: generateDeterministicUUID(`review-corr-${certId}`),
          certificate_id: certId,
          reviewer_id: reviewerId,
          action: "CORRECTION_REQUESTED" as ReviewAction,
          reason: "Clarification Needed",
          comment: template.reviewComment || "Please provide supporting document proof.",
          created_at: certObj.updated_at,
        });

        notifications.push({
          id: generateDeterministicUUID(`notif-corr-${certId}`),
          user_id: st.profile_id,
          type: "CORRECTION_REQUIRED",
          title: "Revision Requested ⚠️",
          message: `Reviewer requested updates for "${template.title}": ${template.reviewComment}`,
          entity_type: "CERTIFICATE",
          entity_id: certId,
          read_at: null,
          created_at: certObj.updated_at,
        });
      } else if (isRejected && reviewerId) {
        certificateReviews.push({
          id: generateDeterministicUUID(`review-rej-${certId}`),
          certificate_id: certId,
          reviewer_id: reviewerId,
          action: "REJECTED" as ReviewAction,
          reason: template.rejectionReason || "Not aligned with institutional criteria",
          comment: template.reviewComment || "Does not meet accreditation threshold.",
          created_at: certObj.updated_at,
        });
      } else if (isUnderReview && reviewerId) {
        certificateReviews.push({
          id: generateDeterministicUUID(`review-claim-${certId}`),
          certificate_id: certId,
          reviewer_id: reviewerId,
          action: "CLAIMED" as ReviewAction,
          reason: null,
          comment: "Acquired exclusive 30-minute evaluation lock.",
          created_at: certObj.review_started_at || certObj.updated_at,
        });
      }
    }
  }

  // Add realistic audit logs for user logins & session activity
  for (const p of profiles.slice(0, 15)) {
    auditLogs.push({
      id: generateDeterministicUUID(`audit-login-${p.id}`),
      college_id: DEFAULT_COLLEGE_ID,
      actor_id: p.id,
      action: "LOGIN",
      entity_type: "PROFILE",
      entity_id: p.id,
      metadata: { role: p.role, email: p.email },
      ip_address: "127.0.0.1",
      created_at: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
    });
  }

  console.log(`\n================================================================`);
  console.log(`✅ INSTITUTIONAL DATABASE GENERATION COMPLETE`);
  console.log(`================================================================`);
  console.log(`🏛️ Colleges:            ${colleges.length}`);
  console.log(`⚙️ College Settings:    ${collegeSettings.length}`);
  console.log(`🏢 Departments:         ${departments.length} (7 UG, 4 PG)`);
  console.log(`🏷️ Categories:          ${categories.length}`);
  console.log(`👤 User Profiles:       ${profiles.length}`);
  console.log(`👨‍🏫 Faculty & HODs:      ${faculty.length}`);
  console.log(`🎓 Enrolled Students:   ${students.length}`);
  console.log(`📜 Certificates:        ${certificates.length}`);
  console.log(`📎 Certificate Files:   ${certificateFiles.length}`);
  console.log(`📝 Review Actions:      ${certificateReviews.length}`);
  console.log(`⭐ Point Records:       ${pointRecords.length}`);
  console.log(`🔔 Notifications:       ${notifications.length}`);
  console.log(`🛡️ Audit Ledger Logs:   ${auditLogs.length}`);
  console.log(`🔑 Passwords Seeded:    ${Object.keys(passwords).length}`);
  console.log(`================================================================\n`);

  return {
    colleges,
    collegeSettings,
    departments,
    profiles,
    students,
    faculty,
    categories,
    certificates,
    certificateFiles,
    certificateReviews,
    pointRecords,
    notifications,
    auditLogs,
    passwords,
  };
}

// -----------------------------------------------------------------------------
// Write the comprehensive DB directly into lib/db/store.ts
// -----------------------------------------------------------------------------
export function persistDatabaseToStore(db: ReturnType<typeof buildCompleteDatabase>) {
  const storeFilePath = path.join(process.cwd(), "lib", "db", "store.ts");

  const fileContent = `// lib/db/store.ts
// In-Memory Persistent Data Store for Nandha Engineering College (Autonomous)
// Generated by scripts/feed_complete_database.ts

import {
  College,
  CollegeSettings,
  Department,
  Profile,
  Student,
  Faculty,
  Category,
  Certificate,
  CertificateFile,
  CertificateReview,
  PointRecord,
  Notification,
  AuditLog,
} from "@/types/database.types";

export interface DBState {
  colleges: College[];
  collegeSettings: CollegeSettings[];
  departments: Department[];
  profiles: Profile[];
  students: Student[];
  faculty: Faculty[];
  categories: Category[];
  certificates: Certificate[];
  certificateFiles: CertificateFile[];
  certificateReviews: CertificateReview[];
  pointRecords: PointRecord[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  passwords?: Record<string, string>;
  passwordResets?: Record<string, { code: string; email: string; expiresAt: string }>;
  emailLogs?: Array<{ id: string; to: string; subject: string; body: string; sentAt: string }>;
}

declare global {
  // eslint-disable-next-line no-var
  var __CAMPUSCRED_DB: DBState | undefined;
}

function initializeState(): DBState {
  const colleges: College[] = ${JSON.stringify(db.colleges, null, 2)};
  const collegeSettings: CollegeSettings[] = ${JSON.stringify(db.collegeSettings, null, 2)};
  const departments: Department[] = ${JSON.stringify(db.departments, null, 2)};
  const categories: Category[] = ${JSON.stringify(db.categories, null, 2)};
  const profiles: Profile[] = ${JSON.stringify(db.profiles, null, 2)};
  const faculty: Faculty[] = ${JSON.stringify(db.faculty, null, 2)};
  const students: Student[] = ${JSON.stringify(db.students, null, 2)};
  const certificates: Certificate[] = ${JSON.stringify(db.certificates, null, 2)};
  const certificateFiles: CertificateFile[] = ${JSON.stringify(db.certificateFiles, null, 2)};
  const certificateReviews: CertificateReview[] = ${JSON.stringify(db.certificateReviews, null, 2)};
  const pointRecords: PointRecord[] = ${JSON.stringify(db.pointRecords, null, 2)};
  const notifications: Notification[] = ${JSON.stringify(db.notifications, null, 2)};
  const auditLogs: AuditLog[] = ${JSON.stringify(db.auditLogs, null, 2)};
  const passwords: Record<string, string> = ${JSON.stringify(db.passwords, null, 2)};

  return {
    colleges,
    collegeSettings,
    departments,
    profiles,
    students,
    faculty,
    categories,
    certificates,
    certificateFiles,
    certificateReviews,
    pointRecords,
    notifications,
    auditLogs,
    passwords,
  };
}

export function getDB(): DBState {
  if (!globalThis.__CAMPUSCRED_DB) {
    globalThis.__CAMPUSCRED_DB = initializeState();
  }
  return globalThis.__CAMPUSCRED_DB;
}

export function resetDB(): void {
  globalThis.__CAMPUSCRED_DB = initializeState();
}
`;

  fs.writeFileSync(storeFilePath, fileContent, "utf8");
  console.log(`💾 Successfully updated store file: ${storeFilePath}`);
}

// Execute if run directly
const generatedDB = buildCompleteDatabase();
persistDatabaseToStore(generatedDB);
