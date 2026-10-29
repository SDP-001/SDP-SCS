import * as XLSX from "xlsx";
import { resolveDepartment, DepartmentRef } from "./studentDatabase";
import { generateUUID } from "./uuid";

export interface RawFacultyRow {
  faculty_id?: string;
  profile_id?: string;
  employee_id?: string;
  employeeId?: string;
  emp_id?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  email?: string;
  faculty_email?: string;
  role?: string;
  designation?: string;
  department?: string;
  department_code?: string;
  department_name?: string;
  is_active?: boolean | string;
  [key: string]: any;
}

export interface VerifiedFacultyData {
  fullName: string;
  email: string;
  employeeId: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  role: "FACULTY" | "HOD" | "DEAN";
  designation: string;
  isActive: boolean;
}

export type FacultyVerificationStatus = "VERIFIED" | "AUTO_CORRECTED" | "DUPLICATE" | "INVALID";

export interface FacultyRowVerification {
  id: string;
  original: RawFacultyRow;
  status: FacultyVerificationStatus;
  data: VerifiedFacultyData;
  corrections: string[];
  errors: string[];
  warnings: string[];
}

export interface ExistingFacultyRef {
  id?: string;
  employeeId: string;
  email: string;
  fullName: string;
  departmentCode?: string;
  role?: "FACULTY" | "HOD" | "DEAN";
}

export const SAMPLE_FACULTY_DATASET: RawFacultyRow[] = [
  {
    employeeId: "FAC-ADM-001",
    fullName: "Dr. Arthur Vance",
    email: "admin@nandhaengg.org",
    department: "Institutional Leadership",
    role: "DEAN",
    designation: "Dean & Academic Administrator",
  },
  {
    employeeId: "FAC-CSE-201",
    fullName: "Dr. S. K. Nandhakumar",
    email: "dr.nandhakumar@nec.edu.in",
    department: "CSE",
    role: "FACULTY",
    designation: "Associate Professor",
  },
  {
    employeeId: "FAC-IT-202",
    fullName: "Prof. Priya Dharshini M",
    email: "priyadharshini.it@nec.edu.in",
    department: "IT",
    role: "FACULTY",
    designation: "Assistant Professor",
  },
  {
    employeeId: "FAC-ECE-203",
    fullName: "Dr. K. Balasubramanian",
    email: "hod.ece@nec.edu.in",
    department: "ECE",
    role: "HOD",
    designation: "Professor & Head",
  },
  {
    employeeId: "FAC-AIDS-204",
    fullName: "Prof. S. R. Vigneshwaran",
    email: "vignesh.aids@nec.edu.in",
    department: "AIDS",
    role: "FACULTY",
    designation: "Assistant Professor",
  },
  {
    employeeId: "FAC-MECH-205",
    fullName: "Dr. M. Senthilkumar",
    email: "hod.mech@nec.edu.in",
    department: "MECH",
    role: "HOD",
    designation: "Professor & Head",
  },
];

/**
 * Normalizes and validates a faculty/HOD record
 */
export function verifyAndNormalizeFaculty(
  row: RawFacultyRow,
  departments: DepartmentRef[],
  existingFaculty: ExistingFacultyRef[] = [],
  enforcedRole?: "FACULTY" | "HOD" | "DEAN"
): FacultyRowVerification {
  const id = generateUUID();
  const corrections: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Employee ID
  let rawEmpId = (
    row.employee_id ||
    row.employeeId ||
    row.emp_id ||
    row["Employee ID"] ||
    row["Staff ID"] ||
    ""
  ).toString().trim().toUpperCase();

  if (!rawEmpId) {
    // Graceful fallback for empty/template rows ("it's ok need to submit")
    rawEmpId = `FAC-${Math.floor(100 + Math.random() * 900)}`;
    corrections.push(`Missing Employee ID: auto-generated ${rawEmpId}`);
  }

  // 2. Full Name
  let rawName = (
    row.full_name ||
    row.fullName ||
    row.name ||
    row["Faculty Name"] ||
    row["Name"] ||
    ""
  ).toString().trim();

  if (!rawName) {
    rawName = "Faculty Member";
    corrections.push("Missing Faculty Name: defaulted to 'Faculty Member'");
  }

  // 3. Department
  const rawDept = (
    row.department ||
    row.department_code ||
    row.department_name ||
    row["Department"] ||
    row["Dept"] ||
    ""
  ).toString().trim();

  const deptResult = resolveDepartment(rawDept, departments);
  const matchedDept = deptResult.department || departments[0];

  if (!deptResult.department && departments.length > 0) {
    corrections.push(`Unrecognized department '${rawDept}'. Assigned to ${matchedDept.name}`);
  } else if (deptResult.wasCorrected && deptResult.originalMatchedAlias) {
    corrections.push(`Department alias '${deptResult.originalMatchedAlias}' mapped to ${matchedDept.name}`);
  }

  // 4. Role
  let role: "FACULTY" | "HOD" | "DEAN" = (enforcedRole as any) || "FACULTY";
  if (!enforcedRole) {
    const rawRole = (row.role || row["Role"] || "").toString().trim().toUpperCase();
    if (rawRole.includes("DEAN") || rawRole.includes("ADMIN")) {
      role = "DEAN";
    } else if (rawRole.includes("HOD") || rawRole.includes("HEAD")) {
      role = "HOD";
    } else {
      role = "FACULTY";
    }
  }

  // 5. Designation
  let rawDesignation = (
    row.designation ||
    row["Designation"] ||
    row["Title"] ||
    ""
  ).toString().trim();

  if (!rawDesignation) {
    rawDesignation =
      role === "DEAN"
        ? "Dean & Academic Administrator"
        : role === "HOD"
        ? "Professor & Head"
        : "Assistant Professor";
    corrections.push(`Designation defaulted to '${rawDesignation}'`);
  }

  // 6. Email
  let rawEmail = (
    row.email ||
    row.faculty_email ||
    row["Email"] ||
    row["Official Email"] ||
    ""
  ).toString().trim().toLowerCase();

  if (!rawEmail || !rawEmail.includes("@")) {
    const slug = rawName.toLowerCase().replace(/[^a-z0-9]/g, ".").replace(/\.+/g, ".");
    rawEmail = `${slug || "faculty"}.${rawEmpId.toLowerCase().replace(/[^a-z0-9]/g, "")}@nec.edu.in`;
    corrections.push(`Generated official email '${rawEmail}'`);
  }

  // 7. Duplicate Checks
  const dupEmp = existingFaculty.find(
    (f) => f.employeeId && f.employeeId.toUpperCase() === rawEmpId
  );
  if (dupEmp) {
    warnings.push(`Employee ID '${rawEmpId}' already registered for ${dupEmp.fullName}`);
  }

  const dupEmail = existingFaculty.find(
    (f) => f.email && f.email.toLowerCase() === rawEmail
  );
  if (dupEmail) {
    warnings.push(`Email '${rawEmail}' already registered for ${dupEmail.fullName}`);
  }

  let status: FacultyVerificationStatus = "VERIFIED";
  if (errors.length > 0) {
    status = "INVALID";
  } else if (dupEmp || dupEmail) {
    status = "DUPLICATE";
  } else if (corrections.length > 0) {
    status = "AUTO_CORRECTED";
  }

  return {
    id,
    original: row,
    status,
    data: {
      fullName: rawName,
      email: rawEmail,
      employeeId: rawEmpId,
      departmentId: matchedDept ? matchedDept.id : "",
      departmentName: matchedDept ? matchedDept.name : "Engineering",
      departmentCode: matchedDept ? matchedDept.code : "ENGG",
      role,
      designation: rawDesignation,
      isActive: true,
    },
    corrections,
    errors,
    warnings,
  };
}

/**
 * Universal file parser for Faculty & HOD spreadsheets
 */
export async function parseFacultyFile(file: File): Promise<RawFacultyRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return resolve([]);

        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName =
          workbook.SheetNames.find((s) =>
            /faculty|staff|hod|teachers|members/i.test(s)
          ) || workbook.SheetNames[0];

        if (!sheetName) return resolve([]);

        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<RawFacultyRow>(worksheet, { defval: "" });
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
 * Downloads official Faculty / HOD Excel or CSV sample database template
 */
export function downloadSampleFacultyDatabase(
  format: "csv" | "xlsx" = "xlsx",
  roleType: "FACULTY" | "HOD" | "BOTH" = "BOTH"
) {
  const dataset = SAMPLE_FACULTY_DATASET.filter((f) => {
    if (roleType === "BOTH") return true;
    return f.role === roleType;
  });

  const ws = XLSX.utils.json_to_sheet(dataset);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Faculty_Members");

  const fileName = `NEC-SCS_Sample_Faculty_Template.${format}`;
  XLSX.writeFile(wb, fileName, { bookType: format });
}
