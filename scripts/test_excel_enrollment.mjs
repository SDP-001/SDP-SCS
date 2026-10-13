// scripts/test_excel_enrollment.mjs
// Test script for student Excel/CSV database import and real-time verification

import {
  SAMPLE_STUDENT_DATASET,
  verifyAndNormalizeStudent,
} from "../lib/utils/studentDatabase.js";

async function testVerification() {
  console.log("=================================================");
  console.log("🧪 TESTING EXCEL / CSV VERIFICATION & AUTO-CORRECTION");
  console.log("=================================================\n");

  const mockDepartments = [
    { id: "dept-1", name: "Computer Science and Engineering", code: "CSE", type: "UG" },
    { id: "dept-2", name: "Information Technology", code: "IT", type: "UG" },
    { id: "dept-3", name: "Electronics and Communication Engineering", code: "ECE", type: "UG" },
    { id: "dept-4", name: "Mechanical Engineering", code: "MECH", type: "UG" },
    { id: "dept-5", name: "Master of Business Administration", code: "MBA", type: "PG" },
    { id: "dept-6", name: "Master of Computer Applications", code: "MCA", type: "PG" },
    { id: "dept-7", name: "M.E. Computer Science and Engineering", code: "ME-CSE", type: "PG" },
  ];

  const mockExistingStudents = [
    { registerNumber: "NEC21CS042", email: "aditya.verma@student.abctech.edu", fullName: "Aditya Verma", departmentName: "CSE" },
  ];

  console.log(`Verifying ${SAMPLE_STUDENT_DATASET.length} sample rows...\n`);

  let verifiedCount = 0;
  let autoCorrectedCount = 0;

  SAMPLE_STUDENT_DATASET.forEach((row, idx) => {
    const res = verifyAndNormalizeStudent(row, mockDepartments, mockExistingStudents);
    console.log(`[Row ${idx + 1}] ${res.data.fullName} (${res.data.registerNumber}) -> Status: ${res.status}`);
    if (res.corrections.length) {
      console.log(`   💡 Auto-Corrections: ${res.corrections.join(" | ")}`);
    }
    if (res.warnings.length) {
      console.log(`   ⚠️ Warnings: ${res.warnings.join(" | ")}`);
    }
    if (res.errors.length) {
      console.log(`   ❌ Errors: ${res.errors.join(" | ")}`);
    }

    if (res.status === "VERIFIED") verifiedCount++;
    if (res.status === "AUTO_CORRECTED") autoCorrectedCount++;
  });

  console.log("\n-------------------------------------------------");
  console.log(`Total: ${SAMPLE_STUDENT_DATASET.length} | Verified: ${verifiedCount} | Auto-Corrected: ${autoCorrectedCount}`);
  console.log("-------------------------------------------------");

  // Duplicate Check Test
  const dupRow = {
    registerNumber: "nec21cs042", // existing
    fullName: "Duplicate Aditya",
    department: "CSE",
  };
  const dupRes = verifyAndNormalizeStudent(dupRow, mockDepartments, mockExistingStudents);
  console.log("\nDuplicate Test for 'nec21cs042':", dupRes.status === "DUPLICATE" ? "✅ PASSED (Flagged Duplicate)" : "❌ FAILED");
  if (dupRes.errors.length) {
    console.log("   Error Detail:", dupRes.errors[0]);
  }
}

testVerification().catch(console.error);
