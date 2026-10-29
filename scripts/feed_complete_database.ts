// scripts/feed_complete_database.ts
// Comprehensive Database Seeder & State Generator for NEC-SCS (CampusCred)
// Generates realistic, fully relational institutional data for:
// - Colleges & College Settings
// - Departments (All 12 UG + 4 PG branches)
// - Categories (All 13 Institutional categories)
// - Faculty (HODs, Associate & Assistant Professors across all departments)
// - Enrolled Students (1,028 verified official students across all 12 UG branches)
// - Passwords (Unique SHA-256 derived passwords for each student matching the credentials ledger)

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
} from "../types/database.types";

const DEFAULT_COLLEGE_ID = "11111111-1111-1111-1111-111111111111";

function generateDeterministicUUID(seed: string): string {
  const hash = crypto.createHash("sha256").update(seed).digest("hex");
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

export function buildCompleteDatabase() {
  console.log("🏢 Building complete institutional database for Nandha Engineering College (Autonomous)...");

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
      updated_at: "2026-10-29T10:00:00.000Z",
    },
  ];

  // 3. Departments (12 UG + 4 PG branches)
  const departments: Department[] = [
    // Undergraduate
    { id: "33333333-3333-3333-3333-333333333301", college_id: DEFAULT_COLLEGE_ID, name: "Computer Science and Engineering", code: "CSE", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333302", college_id: DEFAULT_COLLEGE_ID, name: "Information Technology", code: "IT", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333303", college_id: DEFAULT_COLLEGE_ID, name: "Electronics and Communication Engineering", code: "ECE", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333304", college_id: DEFAULT_COLLEGE_ID, name: "Mechanical Engineering", code: "MECH", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333305", college_id: DEFAULT_COLLEGE_ID, name: "Electrical and Electronics Engineering", code: "EEE", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333306", college_id: DEFAULT_COLLEGE_ID, name: "Civil Engineering", code: "CIVIL", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333307", college_id: DEFAULT_COLLEGE_ID, name: "Artificial Intelligence and Data Science", code: "AIDS", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333312", college_id: DEFAULT_COLLEGE_ID, name: "Agricultural Engineering", code: "AGRI", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333313", college_id: DEFAULT_COLLEGE_ID, name: "Biomedical Engineering", code: "BME", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333314", college_id: DEFAULT_COLLEGE_ID, name: "Chemical Engineering", code: "CHEMICAL", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333315", college_id: DEFAULT_COLLEGE_ID, name: "Computer Science and Engineering (Cyber Security)", code: "CSE(CS)", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333316", college_id: DEFAULT_COLLEGE_ID, name: "Computer Science and Engineering (Internet of Things)", code: "CSE(IoT)", type: "UG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    // Postgraduate
    { id: "33333333-3333-3333-3333-333333333308", college_id: DEFAULT_COLLEGE_ID, name: "M.E. Computer Science and Engineering", code: "ME-CSE", type: "PG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333309", college_id: DEFAULT_COLLEGE_ID, name: "M.E. VLSI Design", code: "ME-VLSI", type: "PG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333310", college_id: DEFAULT_COLLEGE_ID, name: "Master of Business Administration", code: "MBA", type: "PG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
    { id: "33333333-3333-3333-3333-333333333311", college_id: DEFAULT_COLLEGE_ID, name: "Master of Computer Applications", code: "MCA", type: "PG", is_active: true, created_at: "2026-01-01T00:00:00.000Z" },
  ];

  const deptMap: Record<string, string> = {
    CSE: "33333333-3333-3333-3333-333333333301",
    IT: "33333333-3333-3333-3333-333333333302",
    ECE: "33333333-3333-3333-3333-333333333303",
    MECH: "33333333-3333-3333-3333-333333333304",
    EEE: "33333333-3333-3333-3333-333333333305",
    CIVIL: "33333333-3333-3333-3333-333333333306",
    AIDS: "33333333-3333-3333-3333-333333333307",
    "AI&DS": "33333333-3333-3333-3333-333333333307",
    AGRI: "33333333-3333-3333-3333-333333333312",
    BME: "33333333-3333-3333-3333-333333333313",
    CHEMICAL: "33333333-3333-3333-3333-333333333314",
    "CSE(CS)": "33333333-3333-3333-3333-333333333315",
    "CSE(IoT)": "33333333-3333-3333-3333-333333333316",
    "ME-CSE": "33333333-3333-3333-3333-333333333308",
    "ME-VLSI": "33333333-3333-3333-3333-333333333309",
    MBA: "33333333-3333-3333-3333-333333333310",
    MCA: "33333333-3333-3333-3333-333333333311",
  };

  // 4. Categories (13 Institutional categories)
  const categoryNames = [
    { name: "Academic", description: "University ranks, semester honors, academic symposium merits" },
    { name: "Technical", description: "National coding contests, project expos, technical paper presentations" },
    { name: "Sports", description: "Inter-collegiate, zonal, state, and national athletic championships" },
    { name: "Cultural", description: "Music, dance, fine arts, literary debate, and drama competitions" },
    { name: "Workshop", description: "Accredited hands-on technical workshops, industrial bootcamps" },
    { name: "Seminar", description: "Specialized seminars, research symposiums, and invited talks" },
    { name: "Hackathon", description: "National and global 24h-48h software & hardware hackathons" },
    { name: "Competition", description: "Quiz leagues, business plan expos, robotic grand challenges" },
    { name: "Certification", description: "Industry certifications (AWS, Cisco, Red Hat, Microsoft, NPTEL)" },
    { name: "Research", description: "Scopus/SCI indexed journal publications, conferences, and patents" },
    { name: "Leadership", description: "Elected student council officers, technical society presidents, club leads" },
    { name: "Volunteering", description: "NSS, YRC, social outreach, environmental awareness campaigns" },
    { name: "Other", description: "Other verified institutional and co-curricular achievements" },
  ];

  const categories: Category[] = categoryNames.map((c, idx) => ({
    id: `44444444-4444-4444-4444-4444444444${String(idx + 1).padStart(2, "0")}`,
    college_id: DEFAULT_COLLEGE_ID,
    name: c.name,
    description: c.description,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  }));

  const profiles: Profile[] = [];
  const passwords: Record<string, string> = {};
  const auditLogs: AuditLog[] = [];

  // 5. Admin Profile
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

  // 6. Faculty & HOD Roster (All 16 departments)
  const faculty: Faculty[] = [];
  const facultyRosterConfig = [
    // CSE
    { deptCode: "CSE", deptId: deptMap["CSE"], members: [
      { profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03", facultyId: "55555555-5555-5555-5555-555555555503", empId: "FAC-CSE-001", name: "Dr. Murugan Pillai (HOD-CSE)", email: "hod.cse@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 00101" },
      { profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01", facultyId: "55555555-5555-5555-5555-555555555501", empId: "FAC-CSE-101", name: "Prof. Ramesh Sharma", email: "prof.sharma@nandhaengg.org", designation: "Associate Professor", isHod: false, phone: "+91 94432 00102" },
      { profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05", facultyId: "55555555-5555-5555-5555-555555555505", empId: "FAC-CSE-102", name: "Prof. N. Radhika", email: "prof.radhika@nandhaengg.org", designation: "Assistant Professor", isHod: false, phone: "+91 94432 00103" },
    ]},
    // IT
    { deptCode: "IT", deptId: deptMap["IT"], members: [
      { profileId: generateDeterministicUUID("fac-it-hod"), facultyId: generateDeterministicUUID("fac-rec-it-hod"), empId: "FAC-IT-001", name: "Dr. S. K. Balamurugan (HOD-IT)", email: "hod.it@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 00201" },
      { profileId: generateDeterministicUUID("fac-it-p1"), facultyId: generateDeterministicUUID("fac-rec-it-p1"), empId: "FAC-IT-102", name: "Prof. K. Soundararajan", email: "prof.soundararajan@nandhaengg.org", designation: "Associate Professor", isHod: false, phone: "+91 94432 00202" },
    ]},
    // ECE
    { deptCode: "ECE", deptId: deptMap["ECE"], members: [
      { profileId: generateDeterministicUUID("fac-ece-hod"), facultyId: generateDeterministicUUID("fac-rec-ece-hod"), empId: "FAC-ECE-001", name: "Dr. C. N. Marimuthu (HOD-ECE)", email: "hod.ece@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 00301" },
      { profileId: generateDeterministicUUID("fac-ece-p1"), facultyId: generateDeterministicUUID("fac-rec-ece-p1"), empId: "FAC-ECE-101", name: "Prof. V. Sivakumar", email: "prof.sivakumar@nandhaengg.org", designation: "Associate Professor", isHod: false, phone: "+91 94432 00302" },
    ]},
    // MECH
    { deptCode: "MECH", deptId: deptMap["MECH"], members: [
      { profileId: generateDeterministicUUID("fac-mech-hod"), facultyId: generateDeterministicUUID("fac-rec-mech-hod"), empId: "FAC-MECH-001", name: "Dr. E. Raja (HOD-MECH)", email: "hod.mech@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 00401" },
      { profileId: generateDeterministicUUID("fac-mech-p1"), facultyId: generateDeterministicUUID("fac-rec-mech-p1"), empId: "FAC-MECH-101", name: "Prof. M. Saravanan", email: "prof.saravanan@nandhaengg.org", designation: "Associate Professor", isHod: false, phone: "+91 94432 00402" },
    ]},
    // EEE
    { deptCode: "EEE", deptId: deptMap["EEE"], members: [
      { profileId: generateDeterministicUUID("fac-eee-hod"), facultyId: generateDeterministicUUID("fac-rec-eee-hod"), empId: "FAC-EEE-001", name: "Dr. P. Jamuna (HOD-EEE)", email: "hod.eee@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 00501" },
      { profileId: generateDeterministicUUID("fac-eee-p1"), facultyId: generateDeterministicUUID("fac-rec-eee-p1"), empId: "FAC-EEE-101", name: "Prof. S. Karthick", email: "prof.karthick@nandhaengg.org", designation: "Assistant Professor", isHod: false, phone: "+91 94432 00502" },
    ]},
    // CIVIL
    { deptCode: "CIVIL", deptId: deptMap["CIVIL"], members: [
      { profileId: generateDeterministicUUID("fac-civil-hod"), facultyId: generateDeterministicUUID("fac-rec-civil-hod"), empId: "FAC-CIVIL-001", name: "Dr. K. Nirmalkumar (HOD-CIVIL)", email: "hod.civil@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 00601" },
      { profileId: generateDeterministicUUID("fac-civil-p1"), facultyId: generateDeterministicUUID("fac-rec-civil-p1"), empId: "FAC-CIVIL-101", name: "Prof. T. Poongodi", email: "prof.poongodi@nandhaengg.org", designation: "Assistant Professor", isHod: false, phone: "+91 94432 00602" },
    ]},
    // AIDS
    { deptCode: "AIDS", deptId: deptMap["AIDS"], members: [
      { profileId: generateDeterministicUUID("fac-aids-hod"), facultyId: generateDeterministicUUID("fac-rec-aids-hod"), empId: "FAC-AIDS-001", name: "Dr. R. Senthamilselvan (HOD-AIDS)", email: "hod.aids@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 00701" },
      { profileId: generateDeterministicUUID("fac-aids-p1"), facultyId: generateDeterministicUUID("fac-rec-aids-p1"), empId: "FAC-AIDS-101", name: "Prof. A. Geetha", email: "prof.geetha@nandhaengg.org", designation: "Associate Professor", isHod: false, phone: "+91 94432 00702" },
    ]},
    // AGRI
    { deptCode: "AGRI", deptId: deptMap["AGRI"], members: [
      { profileId: generateDeterministicUUID("fac-agri-hod"), facultyId: generateDeterministicUUID("fac-rec-agri-hod"), empId: "FAC-AGRI-001", name: "Dr. K. Saravanan (HOD-AGRI)", email: "hod.agri@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 01201" },
      { profileId: generateDeterministicUUID("fac-agri-p1"), facultyId: generateDeterministicUUID("fac-rec-agri-p1"), empId: "FAC-AGRI-101", name: "Prof. P. Ramesh", email: "prof.ramesh.agri@nandhaengg.org", designation: "Assistant Professor", isHod: false, phone: "+91 94432 01202" },
    ]},
    // BME
    { deptCode: "BME", deptId: deptMap["BME"], members: [
      { profileId: generateDeterministicUUID("fac-bme-hod"), facultyId: generateDeterministicUUID("fac-rec-bme-hod"), empId: "FAC-BME-001", name: "Dr. S. Kavitha (HOD-BME)", email: "hod.bme@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 01301" },
      { profileId: generateDeterministicUUID("fac-bme-p1"), facultyId: generateDeterministicUUID("fac-rec-bme-p1"), empId: "FAC-BME-101", name: "Prof. R. Deepa", email: "prof.deepa.bme@nandhaengg.org", designation: "Assistant Professor", isHod: false, phone: "+91 94432 01302" },
    ]},
    // CHEMICAL
    { deptCode: "CHEMICAL", deptId: deptMap["CHEMICAL"], members: [
      { profileId: generateDeterministicUUID("fac-chem-hod"), facultyId: generateDeterministicUUID("fac-rec-chem-hod"), empId: "FAC-CHEM-001", name: "Dr. M. Senthil Kumar (HOD-CHEM)", email: "hod.chem@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 01401" },
      { profileId: generateDeterministicUUID("fac-chem-p1"), facultyId: generateDeterministicUUID("fac-rec-chem-p1"), empId: "FAC-CHEM-101", name: "Prof. V. Anand", email: "prof.anand.chem@nandhaengg.org", designation: "Assistant Professor", isHod: false, phone: "+91 94432 01402" },
    ]},
    // CSE(CS)
    { deptCode: "CSE(CS)", deptId: deptMap["CSE(CS)"], members: [
      { profileId: generateDeterministicUUID("fac-csecs-hod"), facultyId: generateDeterministicUUID("fac-rec-csecs-hod"), empId: "FAC-CSECS-001", name: "Dr. R. Karthikeyan (HOD-CSE-CS)", email: "hod.csecs@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 01501" },
      { profileId: generateDeterministicUUID("fac-csecs-p1"), facultyId: generateDeterministicUUID("fac-rec-csecs-p1"), empId: "FAC-CSECS-101", name: "Prof. S. Dinesh", email: "prof.dinesh.csecs@nandhaengg.org", designation: "Assistant Professor", isHod: false, phone: "+91 94432 01502" },
    ]},
    // CSE(IoT)
    { deptCode: "CSE(IoT)", deptId: deptMap["CSE(IoT)"], members: [
      { profileId: generateDeterministicUUID("fac-cseiot-hod"), facultyId: generateDeterministicUUID("fac-rec-cseiot-hod"), empId: "FAC-CSEIOT-001", name: "Dr. P. Venkatesh (HOD-CSE-IoT)", email: "hod.cseiot@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 01601" },
      { profileId: generateDeterministicUUID("fac-cseiot-p1"), facultyId: generateDeterministicUUID("fac-rec-cseiot-p1"), empId: "FAC-CSEIOT-101", name: "Prof. M. Priya", email: "prof.priya.cseiot@nandhaengg.org", designation: "Assistant Professor", isHod: false, phone: "+91 94432 01602" },
    ]},
    // ME-CSE
    { deptCode: "ME-CSE", deptId: deptMap["ME-CSE"], members: [
      { profileId: generateDeterministicUUID("fac-mecse-hod"), facultyId: generateDeterministicUUID("fac-rec-mecse-hod"), empId: "FAC-MECSE-001", name: "Dr. B. Senguttuvan (HOD-M.E. CSE)", email: "hod.mecse@nandhaengg.org", designation: "Professor & Head (PG)", isHod: true, phone: "+91 94432 00801" },
    ]},
    // ME-VLSI
    { deptCode: "ME-VLSI", deptId: deptMap["ME-VLSI"], members: [
      { profileId: generateDeterministicUUID("fac-vlsi-hod"), facultyId: generateDeterministicUUID("fac-rec-vlsi-hod"), empId: "FAC-MEVLSI-001", name: "Dr. S. Prakash (HOD-VLSI)", email: "hod.vlsi@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 00901" },
    ]},
    // MBA
    { deptCode: "MBA", deptId: deptMap["MBA"], members: [
      { profileId: generateDeterministicUUID("fac-mba-hod"), facultyId: generateDeterministicUUID("fac-rec-mba-hod"), empId: "FAC-MBA-001", name: "Dr. N. Thangavel (Director & HOD-MBA)", email: "hod.mba@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 01001" },
    ]},
    // MCA
    { deptCode: "MCA", deptId: deptMap["MCA"], members: [
      { profileId: generateDeterministicUUID("fac-mca-hod"), facultyId: generateDeterministicUUID("fac-rec-mca-hod"), empId: "FAC-MCA-001", name: "Dr. P. Sathish (HOD-MCA)", email: "hod.mca@nandhaengg.org", designation: "Professor & Head", isHod: true, phone: "+91 94432 01101" },
    ]},
  ];

  for (const group of facultyRosterConfig) {
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
      faculty.push({
        id: mem.facultyId,
        profile_id: mem.profileId,
        college_id: DEFAULT_COLLEGE_ID,
        department_id: group.deptId,
        designation: mem.designation,
        employee_id: mem.empId,
        is_hod: mem.isHod,
        created_at: "2026-01-01T00:00:00Z",
      });
      passwords[mem.profileId] = "password123";
    }
  }

  // 7. Load All 1,028 Verified Students from JSON
  const students: Student[] = [];
  const rawDataPath = path.join(process.cwd(), "public", "nec_students_2026.json");
  const rawData = JSON.parse(fs.readFileSync(rawDataPath, "utf-8")) as Array<{
    s_no: number;
    reg_no: string;
    name: string;
    dept_code: string;
    email: string;
    password: string;
    mobile?: string;
  }>;

  for (const st of rawData) {
    const profId = generateDeterministicUUID(`stu-prof-${st.reg_no}`);
    const stuId = generateDeterministicUUID(`stu-rec-${st.reg_no}`);
    const deptId = deptMap[st.dept_code] || deptMap["CSE"];

    profiles.push({
      id: profId,
      college_id: DEFAULT_COLLEGE_ID,
      role: "STUDENT",
      email: st.email,
      phone_number: st.mobile ? `+91 ${st.mobile}` : null,
      full_name: st.name,
      avatar_url: null,
      is_active: true,
      created_at: "2026-08-01T00:00:00Z",
      updated_at: "2026-08-01T00:00:00Z",
    });

    students.push({
      id: stuId,
      profile_id: profId,
      college_id: DEFAULT_COLLEGE_ID,
      department_id: deptId,
      register_number: st.reg_no,
      academic_year: 1,
      created_at: "2026-08-01T00:00:00Z",
    });

    passwords[profId] = st.password;
  }

  // 8. Certificates, Files, Reviews & Points
  const certificates: Certificate[] = [];
  const certificateFiles: CertificateFile[] = [];
  const certificateReviews: CertificateReview[] = [];
  const pointRecords: PointRecord[] = [];
  const notifications: Notification[] = [];

  const defaultReviewerId = faculty[0].id;
  const hackCatId = categories[6].id;

  if (students.length > 0) {
    const s0 = students[0];
    const c0_id = "77777777-7777-7777-7777-777777777701";
    certificates.push({
      id: c0_id,
      college_id: DEFAULT_COLLEGE_ID,
      student_id: s0.id,
      achievement_id: null,
      title: "Smart India Hackathon 2026 Winner (Hardware Edition)",
      event_name: "Smart India Hackathon (SIH) 2026 Grand Finale",
      category_id: hackCatId,
      event_level: "NATIONAL",
      organizer: "Ministry of Education & AICTE, New Delhi",
      event_date: "2026-02-14",
      achievement: "First Prize Winner",
      description: "Developed IoT Autonomous Water Quality Monitoring Subsystem.",
      status: "APPROVED",
      reviewer_id: defaultReviewerId,
      review_started_at: "2026-09-02T00:00:00Z",
      submitted_at: "2026-09-01T00:00:00Z",
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-05T00:00:00Z",
    });

    certificateFiles.push({
      id: generateDeterministicUUID(`file-${c0_id}`),
      certificate_id: c0_id,
      version: 1,
      file_type: "PRIMARY",
      storage_path: `certificates/${c0_id}/sih2026_first_prize_winner.pdf`,
      original_filename: "sih2026_first_prize_winner.pdf",
      file_size: 1845200,
      mime_type: "application/pdf",
      file_hash: crypto.createHash("sha256").update(c0_id).digest("hex"),
      created_at: "2026-09-01T00:00:00Z",
    });

    certificateReviews.push({
      id: generateDeterministicUUID(`rev-${c0_id}`),
      certificate_id: c0_id,
      reviewer_id: defaultReviewerId,
      action: "APPROVED",
      reason: null,
      comment: "Outstanding national achievement verified with AICTE SIH records.",
      created_at: "2026-09-05T00:00:00Z",
    });

    pointRecords.push({
      id: generateDeterministicUUID(`pt-${c0_id}`),
      student_id: s0.id,
      certificate_id: c0_id,
      points: 100,
      awarded_by: defaultReviewerId,
      comment: "SIH Winner First Prize points.",
      is_latest: true,
      created_at: "2026-09-05T00:00:00Z",
    });

    notifications.push({
      id: generateDeterministicUUID("notif-welcome"),
      user_id: s0.profile_id,
      type: "SYSTEM",
      title: "Welcome to NEC-SCS Portal",
      message: "Official student database loaded successfully.",
      entity_type: null,
      entity_id: null,
      read_at: null,
      created_at: "2026-09-01T00:00:00Z",
    });
  }

  // Audit log
  auditLogs.push({
    id: generateDeterministicUUID("audit-db-refresh-2026"),
    college_id: DEFAULT_COLLEGE_ID,
    actor_id: adminProfileId,
    action: "CONFIGURATION_CHANGED",
    entity_type: "STUDENT",
    entity_id: DEFAULT_COLLEGE_ID,
    metadata: {
      event: "OFFICIAL_DATABASE_LOADED",
      enrolled_students: students.length,
      departments: departments.length,
    },
    ip_address: "127.0.0.1",
    created_at: "2026-10-29T10:00:00Z",
  });

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

export function persistDatabaseToStore(db: ReturnType<typeof buildCompleteDatabase>) {
  const storeFilePath = path.join(process.cwd(), "lib", "db", "store.ts");

  const fileContent = `// lib/db/store.ts
// In-Memory Persistent Data Store for Nandha Engineering College (Autonomous)
// Generated by scripts/feed_complete_database.ts (1028 Verified Students)

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
  console.log(`✅ Successfully updated store file: ${storeFilePath}`);
}

const generatedDB = buildCompleteDatabase();
persistDatabaseToStore(generatedDB);
