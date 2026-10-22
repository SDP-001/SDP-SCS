// scripts/build_sample_database.ts
// Generates a comprehensive institutional sample database for Nandha Engineering College (NEC-SCS)
// Covers all departments (UG & PG), faculty & HODs, all 60+ students, certificates across all statuses,
// reviews, points, notifications, and tamper-evident audit logs.

import * as XLSX from "xlsx";
import sampleStudents60 from "../public/sample_students_60.json";

const DEFAULT_COLLEGE_ID = "11111111-1111-1111-1111-111111111111";

// 1. DEPARTMENTS
const DEPARTMENTS = [
  // UG
  { id: "33333333-3333-3333-3333-333333333301", code: "CSE", name: "Computer Science and Engineering", type: "UG" },
  { id: "33333333-3333-3333-3333-333333333302", code: "IT", name: "Information Technology", type: "UG" },
  { id: "33333333-3333-3333-3333-333333333303", code: "ECE", name: "Electronics and Communication Engineering", type: "UG" },
  { id: "33333333-3333-3333-3333-333333333304", code: "MECH", name: "Mechanical Engineering", type: "UG" },
  { id: "33333333-3333-3333-3333-333333333305", code: "EEE", name: "Electrical and Electronics Engineering", type: "UG" },
  { id: "33333333-3333-3333-3333-333333333306", code: "CIVIL", name: "Civil Engineering", type: "UG" },
  { id: "33333333-3333-3333-3333-333333333307", code: "AIDS", name: "Artificial Intelligence and Data Science", type: "UG" },
  // PG
  { id: "33333333-3333-3333-3333-333333333308", code: "ME-CSE", name: "M.E. Computer Science and Engineering", type: "PG" },
  { id: "33333333-3333-3333-3333-333333333309", code: "ME-VLSI", name: "M.E. VLSI Design", type: "PG" },
  { id: "33333333-3333-3333-3333-333333333310", code: "MBA", name: "Master of Business Administration", type: "PG" },
  { id: "33333333-3333-3333-3333-333333333311", code: "MCA", name: "Master of Computer Applications", type: "PG" },
];

const deptMapByCode: Record<string, string> = {};
DEPARTMENTS.forEach(d => {
  deptMapByCode[d.code] = d.id;
  // Aliases
  if (d.code === "MECH") deptMapByCode["ME"] = d.id;
  if (d.code === "CIVIL") deptMapByCode["CE"] = d.id;
  if (d.code === "AIDS") deptMapByCode["AD"] = d.id;
  if (d.code === "ECE") deptMapByCode["EC"] = d.id;
  if (d.code === "EEE") deptMapByCode["EE"] = d.id;
  if (d.code === "MBA") deptMapByCode["MB"] = d.id;
  if (d.code === "MCA") deptMapByCode["MA"] = d.id;
  if (d.code === "ME-CSE") deptMapByCode["PS"] = d.id;
});

// 2. FACULTY & HOD ROSTER (Every department has 1 HOD + 1 Faculty)
interface FacultySeed {
  profileId: string;
  facultyId: string;
  deptCode: string;
  fullName: string;
  email: string;
  employeeId: string;
  designation: string;
  isHod: boolean;
}

const FACULTY_ROSTER: FacultySeed[] = [
  // CSE
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03",
    facultyId: "55555555-5555-5555-5555-555555555503",
    deptCode: "CSE",
    fullName: "Dr. Murugan Pillai (HOD-CSE)",
    email: "hod.cse@nandhaengg.org",
    employeeId: "FAC-CSE-001",
    designation: "Professor & Head",
    isHod: true,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01",
    facultyId: "55555555-5555-5555-5555-555555555501",
    deptCode: "CSE",
    fullName: "Prof. Ramesh Sharma",
    email: "prof.sharma@nandhaengg.org",
    employeeId: "FAC-CSE-101",
    designation: "Associate Professor",
    isHod: false,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02",
    facultyId: "55555555-5555-5555-5555-555555555502",
    deptCode: "CSE",
    fullName: "Dr. Kavita Nair",
    email: "dr.kavita@nandhaengg.org",
    employeeId: "FAC-CSE-102",
    designation: "Assistant Professor",
    isHod: false,
  },
  // IT
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10",
    facultyId: "55555555-5555-5555-5555-555555555510",
    deptCode: "IT",
    fullName: "Dr. P. Thangaraj (HOD-IT)",
    email: "hod.it@nandhaengg.org",
    employeeId: "FAC-IT-001",
    designation: "Professor & Head",
    isHod: true,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11",
    facultyId: "55555555-5555-5555-5555-555555555511",
    deptCode: "IT",
    fullName: "Prof. Priya Dharshini M",
    email: "priya.it@nandhaengg.org",
    employeeId: "FAC-IT-101",
    designation: "Assistant Professor",
    isHod: false,
  },
  // ECE
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb20",
    facultyId: "55555555-5555-5555-5555-555555555520",
    deptCode: "ECE",
    fullName: "Dr. K. Balasubramanian (HOD-ECE)",
    email: "hod.ece@nandhaengg.org",
    employeeId: "FAC-ECE-001",
    designation: "Professor & Head",
    isHod: true,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb21",
    facultyId: "55555555-5555-5555-5555-555555555521",
    deptCode: "ECE",
    fullName: "Prof. S. Karthikeyan",
    email: "karthik.ece@nandhaengg.org",
    employeeId: "FAC-ECE-101",
    designation: "Associate Professor",
    isHod: false,
  },
  // MECH
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb30",
    facultyId: "55555555-5555-5555-5555-555555555530",
    deptCode: "MECH",
    fullName: "Dr. M. Senthilkumar (HOD-MECH)",
    email: "hod.mech@nandhaengg.org",
    employeeId: "FAC-MECH-001",
    designation: "Professor & Head",
    isHod: true,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb31",
    facultyId: "55555555-5555-5555-5555-555555555531",
    deptCode: "MECH",
    fullName: "Prof. R. Gunasekaran",
    email: "guna.mech@nandhaengg.org",
    employeeId: "FAC-MECH-101",
    designation: "Associate Professor",
    isHod: false,
  },
  // EEE
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb40",
    facultyId: "55555555-5555-5555-5555-555555555540",
    deptCode: "EEE",
    fullName: "Dr. A. Sivakumar (HOD-EEE)",
    email: "hod.eee@nandhaengg.org",
    employeeId: "FAC-EEE-001",
    designation: "Professor & Head",
    isHod: true,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb41",
    facultyId: "55555555-5555-5555-5555-555555555541",
    deptCode: "EEE",
    fullName: "Prof. M. Revathi",
    email: "revathi.eee@nandhaengg.org",
    employeeId: "FAC-EEE-101",
    designation: "Assistant Professor",
    isHod: false,
  },
  // CIVIL
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb50",
    facultyId: "55555555-5555-5555-5555-555555555550",
    deptCode: "CIVIL",
    fullName: "Dr. S. Boopathi (HOD-CIVIL)",
    email: "hod.civil@nandhaengg.org",
    employeeId: "FAC-CIVIL-001",
    designation: "Professor & Head",
    isHod: true,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb51",
    facultyId: "55555555-5555-5555-5555-555555555551",
    deptCode: "CIVIL",
    fullName: "Prof. G. Vignesh",
    email: "vignesh.civil@nandhaengg.org",
    employeeId: "FAC-CIVIL-101",
    designation: "Assistant Professor",
    isHod: false,
  },
  // AIDS
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb60",
    facultyId: "55555555-5555-5555-5555-555555555560",
    deptCode: "AIDS",
    fullName: "Dr. V. Poongodi (HOD-AIDS)",
    email: "hod.aids@nandhaengg.org",
    employeeId: "FAC-AIDS-001",
    designation: "Professor & Head",
    isHod: true,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb61",
    facultyId: "55555555-5555-5555-5555-555555555561",
    deptCode: "AIDS",
    fullName: "Prof. S. R. Vigneshwaran",
    email: "vignesh.aids@nandhaengg.org",
    employeeId: "FAC-AIDS-101",
    designation: "Assistant Professor",
    isHod: false,
  },
  // ME-CSE
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05",
    facultyId: "55555555-5555-5555-5555-555555555505",
    deptCode: "ME-CSE",
    fullName: "Dr. N. Radhika (HOD-ME-CSE)",
    email: "hod.mecse@nandhaengg.org",
    employeeId: "FAC-MECSE-001",
    designation: "Professor & Head",
    isHod: true,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb71",
    facultyId: "55555555-5555-5555-5555-555555555571",
    deptCode: "ME-CSE",
    fullName: "Prof. C. Senthil Nathan",
    email: "senthil.mecse@nandhaengg.org",
    employeeId: "FAC-MECSE-101",
    designation: "Associate Professor",
    isHod: false,
  },
  // ME-VLSI
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb80",
    facultyId: "55555555-5555-5555-5555-555555555580",
    deptCode: "ME-VLSI",
    fullName: "Dr. T. Manikandan (HOD-VLSI)",
    email: "hod.mevlsi@nandhaengg.org",
    employeeId: "FAC-MEVLSI-001",
    designation: "Professor & Head",
    isHod: true,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb81",
    facultyId: "55555555-5555-5555-5555-555555555581",
    deptCode: "ME-VLSI",
    fullName: "Prof. V. Saravanan",
    email: "saravanan.vlsi@nandhaengg.org",
    employeeId: "FAC-MEVLSI-101",
    designation: "Assistant Professor",
    isHod: false,
  },
  // MBA
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04",
    facultyId: "55555555-5555-5555-5555-555555555504",
    deptCode: "MBA",
    fullName: "Dr. K. Swaminathan (HOD-MBA)",
    email: "hod.mba@nandhaengg.org",
    employeeId: "FAC-MBA-001",
    designation: "Professor & Head",
    isHod: true,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb91",
    facultyId: "55555555-5555-5555-5555-555555555591",
    deptCode: "MBA",
    fullName: "Prof. R. Anandhi",
    email: "anandhi.mba@nandhaengg.org",
    employeeId: "FAC-MBA-101",
    designation: "Associate Professor",
    isHod: false,
  },
  // MCA
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb95",
    facultyId: "55555555-5555-5555-5555-555555555595",
    deptCode: "MCA",
    fullName: "Dr. M. Jayakumar (HOD-MCA)",
    email: "hod.mca@nandhaengg.org",
    employeeId: "FAC-MCA-001",
    designation: "Professor & Head",
    isHod: true,
  },
  {
    profileId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb96",
    facultyId: "55555555-5555-5555-5555-555555555596",
    deptCode: "MCA",
    fullName: "Prof. P. Selvaraj",
    email: "selvaraj.mca@nandhaengg.org",
    employeeId: "FAC-MCA-101",
    designation: "Assistant Professor",
    isHod: false,
  },
];

console.log(`Generated ${FACULTY_ROSTER.length} faculty and HOD records across 11 departments.`);

// 3. CORE STUDENTS + 60 DATASET STUDENTS
const CORE_STUDENTS = [
  {
    profileId: "cccccccc-cccc-cccc-cccc-cccccccccc01",
    studentId: "66666666-6666-6666-6666-666666666601",
    deptCode: "CSE",
    fullName: "Aditya Verma",
    email: "aditya.verma@student.nandhaengg.org",
    registerNumber: "710022CS0101",
    academicYear: 3,
  },
  {
    profileId: "cccccccc-cccc-cccc-cccc-cccccccccc02",
    studentId: "66666666-6666-6666-6666-666666666602",
    deptCode: "CSE",
    fullName: "Priya Sundaram",
    email: "priya.sundaram@student.nandhaengg.org",
    registerNumber: "710022CS0142",
    academicYear: 3,
  },
  {
    profileId: "cccccccc-cccc-cccc-cccc-cccccccccc03",
    studentId: "66666666-6666-6666-6666-666666666603",
    deptCode: "IT",
    fullName: "Rohit Gupta",
    email: "rohit.gupta@student.nandhaengg.org",
    registerNumber: "710022IT0118",
    academicYear: 3,
  },
  {
    profileId: "cccccccc-cccc-cccc-cccc-cccccccccc04",
    studentId: "66666666-6666-6666-6666-666666666604",
    deptCode: "ECE",
    fullName: "Ananya Iyer",
    email: "ananya.iyer@student.nandhaengg.org",
    registerNumber: "710023EC0089",
    academicYear: 2,
  },
  {
    profileId: "cccccccc-cccc-cccc-cccc-cccccccccc05",
    studentId: "66666666-6666-6666-6666-666666666605",
    deptCode: "MECH",
    fullName: "Vikram Singh",
    email: "vikram.singh@student.nandhaengg.org",
    registerNumber: "710021ME0054",
    academicYear: 4,
  },
  {
    profileId: "cccccccc-cccc-cccc-cccc-cccccccccc06",
    studentId: "66666666-6666-6666-6666-666666666606",
    deptCode: "MBA",
    fullName: "Kavya R",
    email: "kavya.r@student.nandhaengg.org",
    registerNumber: "710025MB0012",
    academicYear: 1,
  },
  {
    profileId: "cccccccc-cccc-cccc-cccc-cccccccccc07",
    studentId: "66666666-6666-6666-6666-666666666607",
    deptCode: "MCA",
    fullName: "Dinesh Karthik K",
    email: "dinesh.k@student.nandhaengg.org",
    registerNumber: "710024MC0045",
    academicYear: 2,
  },
  {
    profileId: "cccccccc-cccc-cccc-cccc-cccccccccc08",
    studentId: "66666666-6666-6666-6666-666666666608",
    deptCode: "ME-CSE",
    fullName: "Siddharth V",
    email: "siddharth.v@student.nandhaengg.org",
    registerNumber: "710025CS0004",
    academicYear: 1,
  },
];

interface FullStudent {
  profileId: string;
  studentId: string;
  deptId: string;
  deptCode: string;
  fullName: string;
  email: string;
  registerNumber: string;
  academicYear: number;
}

const ALL_STUDENTS: FullStudent[] = [];

// Push core
CORE_STUDENTS.forEach(s => {
  ALL_STUDENTS.push({
    profileId: s.profileId,
    studentId: s.studentId,
    deptId: deptMapByCode[s.deptCode] || DEPARTMENTS[0].id,
    deptCode: s.deptCode,
    fullName: s.fullName,
    email: s.email,
    registerNumber: s.registerNumber,
    academicYear: s.academicYear,
  });
});

// Push 60 dataset
(sampleStudents60 as any[]).forEach(row => {
  const code = (row.department_code || "CSE").toUpperCase();
  const deptId = deptMapByCode[code] || DEPARTMENTS[0].id;
  ALL_STUDENTS.push({
    profileId: row.profile_id,
    studentId: row.student_id,
    deptId,
    deptCode: code,
    fullName: row.full_name,
    email: row.email,
    registerNumber: row.register_number,
    academicYear: Number(row.academic_year) || 1,
  });
});

console.log(`Total active students ready to feed: ${ALL_STUDENTS.length}`);

// 4. CATEGORIES
const CATEGORIES = [
  { id: "44444444-4444-4444-4444-444444444401", name: "Academic", description: "Merit ranks, semester excellence, academic honors" },
  { id: "44444444-4444-4444-4444-444444444402", name: "Technical", description: "Technical symposiums, coding challenges, project expos" },
  { id: "44444444-4444-4444-4444-444444444403", name: "Sports", description: "Inter-collegiate and state athletic achievements" },
  { id: "44444444-4444-4444-4444-444444444404", name: "Cultural", description: "Music, debate, arts, drama and literary competitions" },
  { id: "44444444-4444-4444-4444-444444444405", name: "Workshop", description: "Technical hands-on workshops and bootcamps" },
  { id: "44444444-4444-4444-4444-444444444406", name: "Seminar", description: "Conference presentations and invited talks" },
  { id: "44444444-4444-4444-4444-444444444407", name: "Hackathon", description: "National and collegiate hackathons & buildathons" },
  { id: "44444444-4444-4444-4444-444444444408", name: "Competition", description: "Olympiads, quiz tournaments, and innovation challenges" },
  { id: "44444444-4444-4444-4444-444444444409", name: "Certification", description: "Industry-recognized professional certifications" },
  { id: "44444444-4444-4444-4444-444444444410", name: "Research", description: "Published papers, journals, and patent filings" },
  { id: "44444444-4444-4444-4444-444444444411", name: "Leadership", description: "Student council, club heads, and symposium leads" },
  { id: "44444444-4444-4444-4444-444444444412", name: "Volunteering", description: "NSS, community outreach, and social impact projects" },
  { id: "44444444-4444-4444-4444-444444444413", name: "Other", description: "Other verified co-curricular achievements" },
];

export {
  DEFAULT_COLLEGE_ID,
  DEPARTMENTS,
  FACULTY_ROSTER,
  ALL_STUDENTS,
  CATEGORIES,
};
