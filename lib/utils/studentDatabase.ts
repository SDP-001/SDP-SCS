import * as XLSX from "xlsx";
import sampleStudents60 from "@/public/sample_students_60.json";
import { generateUUID } from "./uuid";

export interface RawStudentRow {
  student_id?: string;
  profile_id?: string;
  register_number?: string;
  registerNumber?: string;
  full_name?: string;
  fullName?: string;
  department_code?: string;
  department_name?: string;
  department?: string;
  degree_type?: string;
  degreeLevel?: string;
  program?: string;
  academic_year?: string | number;
  academicYear?: string | number;
  admission_year?: string | number;
  admissionYear?: string | number;
  credit_points?: string | number;
  creditPoints?: string | number;
  is_active?: boolean | string;
  email?: string;
  [key: string]: any;
}

export interface VerifiedStudentData {
  fullName: string;
  registerNumber: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  degreeLevel: "UG" | "PG";
  program?: string;
  academicYear: number;
  admissionYear?: number;
  creditPoints?: number;
  isActive: boolean;
  email: string;
}

export type VerificationStatus = "VERIFIED" | "AUTO_CORRECTED" | "DUPLICATE" | "INVALID";

export interface StudentRowVerification {
  id: string;
  original: RawStudentRow;
  status: VerificationStatus;
  data: VerifiedStudentData;
  corrections: string[];
  errors: string[];
  warnings: string[];
}

export interface DepartmentRef {
  id: string;
  name: string;
  code: string;
  type?: "UG" | "PG";
}

export interface ExistingStudentRef {
  id?: string;
  registerNumber: string;
  email: string;
  fullName: string;
  departmentName?: string;
  departmentCode?: string;
  degreeLevel?: "UG" | "PG";
  academicYear?: number | string;
  isActive?: boolean;
}

/**
 * 60 Pre-configured Nandha Engineering College sample students matching NEC-SCS_Sample_Students_60.xlsx
 */
export const SAMPLE_STUDENT_DATASET: RawStudentRow[] = sampleStudents60 as RawStudentRow[];

/**
 * Intelligent Department Resolver with fuzzy alias matching for Nandha Engineering College
 */
export function resolveDepartment(
  input: string | undefined,
  departments: DepartmentRef[]
): { department: DepartmentRef | null; wasCorrected: boolean; originalMatchedAlias?: string } {
  if (!input || !departments.length) {
    return { department: departments[0] || null, wasCorrected: false };
  }

  const clean = input.trim().toLowerCase();

  // 1. Exact ID match
  const byId = departments.find((d) => d.id === input);
  if (byId) return { department: byId, wasCorrected: false };

  // 2. Exact Code match (case-insensitive)
  const byCode = departments.find((d) => d.code.toLowerCase() === clean);
  if (byCode) return { department: byCode, wasCorrected: false };

  // 3. Exact Name match (case-insensitive)
  const byName = departments.find((d) => d.name.toLowerCase() === clean);
  if (byName) return { department: byName, wasCorrected: false };

  // 4. Fuzzy & Common Alias mappings for all NEC branches
  const aliasRules: Array<{ pattern: RegExp; code: string }> = [
    { pattern: /\b(me[\s-]?cse|m\.e\.[\s-]?cse|me[\s-]?comp)\b/i, code: "ME-CSE" },
    { pattern: /\b(me[\s-]?vlsi|m\.e\.[\s-]?vlsi|vlsi)\b/i, code: "ME-VLSI" },
    { pattern: /\b(mca|master\s+of\s+comp)\b/i, code: "MCA" },
    { pattern: /\b(mba|master\s+of\s+business|management)\b/i, code: "MBA" },
    { pattern: /\b(aids|ai[\s-]?ds|ai|artificial\s+intel)\b/i, code: "AIDS" },
    { pattern: /\b(agri|agriculture|agricultural)\b/i, code: "AGRI" },
    { pattern: /\b(bme|biomedical|bio[\s-]?med)\b/i, code: "BME" },
    { pattern: /\b(chem|chemical)\b/i, code: "CHEMICAL" },
    { pattern: /\b(cse[\s-]?(cs|cyber)|cyber[\s-]?sec(urity)?)\b/i, code: "CSE(CS)" },
    { pattern: /\b(cse[\s-]?(iot|internet)|iot|internet\s+of\s+things)\b/i, code: "CSE(IoT)" },
    { pattern: /\b(eee|electrical|triple\s+e)\b/i, code: "EEE" },
    { pattern: /\b(civil|civ)\b/i, code: "CIVIL" },
    { pattern: /\b(cse|computer\s+sci|software|cs)\b/i, code: "CSE" },
    { pattern: /\b(it|information\s+tech)\b/i, code: "IT" },
    { pattern: /\b(ece|electronics|telecom)\b/i, code: "ECE" },
    { pattern: /\b(mech|mechanical|automobile)\b/i, code: "MECH" },
  ];

  for (const rule of aliasRules) {
    if (rule.pattern.test(clean)) {
      const match = departments.find((d) => d.code.toUpperCase() === rule.code);
      if (match) {
        return { department: match, wasCorrected: true, originalMatchedAlias: input };
      }
    }
  }

  // 5. Partial string match
  const partial = departments.find(
    (d) => d.name.toLowerCase().includes(clean) || clean.includes(d.name.toLowerCase())
  );
  if (partial) {
    return { department: partial, wasCorrected: true, originalMatchedAlias: input };
  }

  return { department: null, wasCorrected: false };
}

/**
 * Verifies and normalizes an individual student record against institutional rules and database records.
 */
export function verifyAndNormalizeStudent(
  row: RawStudentRow,
  departments: DepartmentRef[],
  existingStudents: ExistingStudentRef[] = []
): StudentRowVerification {
  const errors: string[] = [];
  const warnings: string[] = [];
  const corrections: string[] = [];

  const rawReg = (row.registerNumber || row.register_number || row["Register Number"] || row["Reg No"] || row["RegNo"] || row["RegisterNo"] || "").toString().trim();
  const rawName = (row.fullName || row.full_name || row["Full Name"] || row["Name"] || row["Student Name"] || "").toString().trim();
  const rawDept = (row.department || row.department_code || row.department_name || row["Department"] || row["Branch"] || row["Dept"] || "").toString().trim();
  const rawYear = row.academicYear || row.academic_year || row["Academic Year"] || row["Year"] || 1;
  const rawEmail = (row.email || row["Email"] || row["Email Address"] || "").toString().trim();
  const rawDegree = (row.degreeLevel || row.degree_type || row["Degree Level"] || row["Degree"] || row["Type"] || "").toString().trim();
  const rawProgram = (row.program || row["Program"] || "").toString().trim();
  const rawCreditPoints = Number(row.credit_points || row.creditPoints || row["Credit Points"] || 0);
  const rawAdmissionYear = Number(row.admission_year || row.admissionYear || 0);
  const isActive = row.is_active !== false && row.is_active !== "FALSE" && row.is_active !== "false";

  // 1. Verify Register Number
  if (!rawReg) {
    errors.push("Missing Register Number.");
  }

  let formattedReg = rawReg.toUpperCase().replace(/\s+/g, "");
  if (formattedReg !== rawReg && rawReg) {
    corrections.push(`Formatted Register Number '${rawReg}' to uppercase '${formattedReg}'`);
  }

  // Check duplicate in existing database
  const dup = existingStudents.find(
    (s) => s.registerNumber.toUpperCase() === formattedReg || (rawEmail && s.email.toLowerCase() === rawEmail.toLowerCase())
  );
  if (dup) {
    errors.push(`Duplicate: Register Number '${formattedReg}' already enrolled for ${dup.fullName} (${dup.departmentName || "Institution"}).`);
  }

  // 2. Verify Full Name
  if (!rawName) {
    errors.push("Missing Student Full Name.");
  }
  const formattedName = rawName.replace(/\s+/g, " ");

  // 3. Verify Department
  const { department: matchedDept, wasCorrected: deptCorrected } = resolveDepartment(rawDept, departments);
  if (!matchedDept) {
    errors.push(`Unrecognized department '${rawDept}'. Please select a valid NEC branch.`);
  } else if (deptCorrected && rawDept.toLowerCase() !== matchedDept.code.toLowerCase()) {
    corrections.push(`Resolved department '${rawDept}' to '${matchedDept.name} (${matchedDept.code})'`);
  }

  // 4. Degree Level (UG / PG)
  let degreeLevel: "UG" | "PG" = matchedDept?.type || "UG";
  if (rawDegree) {
    const dUpper = rawDegree.toUpperCase();
    if (dUpper === "PG" || dUpper === "UG") {
      degreeLevel = dUpper as "UG" | "PG";
    }
  }

  // 5. Academic Year (1 to 4)
  let academicYear = Number(rawYear);
  if (isNaN(academicYear) || academicYear < 1 || academicYear > 4) {
    academicYear = 1;
    warnings.push(`Academic Year '${rawYear}' defaulted to Year 1.`);
  }

  // 6. Email validation & Institutional auto-generation
  let email = rawEmail.toLowerCase();
  if (!email || !email.includes("@")) {
    if (formattedReg) {
      email = `${formattedReg.toLowerCase()}@nec.edu.in`;
      corrections.push(`Auto-generated official institutional email: ${email}`);
    } else {
      errors.push("Invalid or missing student email address.");
    }
  } else if (!email.endsWith("@nec.edu.in") && !email.endsWith("@nandhaengg.org") && !email.endsWith("@student.nandha.edu")) {
    warnings.push(`Email '${email}' is not on the standard institutional domain (@nec.edu.in).`);
  }

  // Determine Overall Status
  let status: VerificationStatus = "VERIFIED";
  if (errors.length > 0) {
    status = dup ? "DUPLICATE" : "INVALID";
  } else if (corrections.length > 0 || warnings.length > 0) {
    status = "AUTO_CORRECTED";
  }

  return {
    id: generateUUID(),
    original: row,
    status,
    corrections,
    errors,
    warnings,
    data: {
      fullName: formattedName,
      registerNumber: formattedReg,
      departmentId: matchedDept?.id || "",
      departmentName: matchedDept?.name || "General Engineering",
      departmentCode: matchedDept?.code || "ENG",
      degreeLevel,
      program: rawProgram || (degreeLevel === "UG" ? "B.E." : "M.E."),
      academicYear,
      admissionYear: rawAdmissionYear || (2027 - academicYear),
      creditPoints: isNaN(rawCreditPoints) ? 0 : rawCreditPoints,
      isActive,
      email,
    },
  };
}

/**
 * Universal file parser supporting .xlsx, .xls, and .csv
 */
export async function parseStudentFile(file: File): Promise<RawStudentRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          return resolve([]);
        }

        const workbook = XLSX.read(data, { type: "binary" });
        // Prioritize 'Students' sheet if present (e.g. in NEC-SCS_Sample_Students_60.xlsx)
        const sheetName = workbook.SheetNames.includes("Students")
          ? "Students"
          : workbook.SheetNames[0];

        if (!sheetName) {
          return resolve([]);
        }

        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<RawStudentRow>(worksheet, { defval: "" });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

/**
 * Downloads the official Excel or CSV sample database template
 */
export function downloadSampleDatabase(format: "csv" | "xlsx" = "xlsx") {
  if (format === "xlsx") {
    // Direct link to the official 60-student workbook
    const link = document.createElement("a");
    link.href = "/NEC-SCS_Sample_Students_60.xlsx";
    link.download = "NEC-SCS_Sample_Students_60.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_STUDENT_DATASET);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "NEC-SCS_Sample_Students_60.csv", { bookType: "csv" });
  }
}
