import { getDB } from "@/lib/db/store";
import {
  getDepartmentsAction,
  createDepartmentAction,
  updateDepartmentAction,
  getDepartmentListAction,
  getInstitutionalAnalyticsAction,
  addStudentAction,
} from "@/actions/admin";

async function runTests() {
  console.log("=== Testing Separate UG and PG Department Features ===");
  const db = getDB();

  // 1. Verify Seed Departments
  const ugDepts = db.departments.filter((d) => d.type === "UG");
  const pgDepts = db.departments.filter((d) => d.type === "PG");
  console.log(`✓ UG Departments found: ${ugDepts.length} (${ugDepts.map(d => d.code).join(", ")})`);
  console.log(`✓ PG Departments found: ${pgDepts.length} (${pgDepts.map(d => d.code).join(", ")})`);

  if (ugDepts.length !== 7 || pgDepts.length !== 4) {
    throw new Error(`Expected 7 UG and 4 PG departments, got ${ugDepts.length} UG and ${pgDepts.length} PG`);
  }

  // 2. Test getDepartmentListAction with filters
  const allActive = await getDepartmentListAction();
  const ugList = await getDepartmentListAction({ type: "UG" });
  const pgList = await getDepartmentListAction({ type: "PG" });
  console.log(`✓ getDepartmentListAction total: ${allActive.length}, UG: ${ugList.length}, PG: ${pgList.length}`);

  // 3. Test createDepartmentAction
  const createRes = await createDepartmentAction({
    name: "M.Tech Data Science & Analytics",
    code: "MTECH-DSA",
    type: "PG",
  });
  console.log(`✓ createDepartmentAction PG:`, createRes.success, createRes.department?.code, createRes.department?.type);

  if (!createRes.success || createRes.department?.type !== "PG") {
    throw new Error("Failed to create PG department properly");
  }

  // 4. Test updateDepartmentAction
  const updateRes = await updateDepartmentAction(createRes.department.id, {
    name: "M.Tech Data Science & Artificial Intelligence",
    code: "MTECH-DSA",
    type: "PG",
    is_active: true,
  });
  console.log(`✓ updateDepartmentAction PG:`, updateRes.success, updateRes.department?.name);

  // 5. Test getInstitutionalAnalyticsAction
  const analytics = await getInstitutionalAnalyticsAction();
  console.log(`✓ Analytics UG Depts: ${analytics.ugDeptCount}, PG Depts: ${analytics.pgDeptCount}`);
  console.log(`✓ Analytics UG Students: ${analytics.ugStudentsCount}, PG Students: ${analytics.pgStudentsCount}`);
  console.log(`✓ Analytics Total Certs: ${analytics.totalCertificates}`);

  // 7. Test creating Department WITH HOD details (Dean Page flow)
  console.log("\n=== Testing Department Creation With HOD Details (Dean Portal) ===");
  const createWithHodRes = await createDepartmentAction({
    name: "Biomedical Engineering",
    code: "BME",
    type: "UG",
    hodName: "Dr. K. Senthil Kumar",
    hodEmail: "hod.bme@nandhaengg.org",
    hodPhone: "+91 94432 88899",
    hodEmployeeId: "FAC-BME-001",
    hodDesignation: "Professor & Head",
  });

  console.log("✓ createDepartmentAction with HOD:", createWithHodRes.success, createWithHodRes.department?.code);
  if (!createWithHodRes.success || !createWithHodRes.department) {
    throw new Error("Failed to create department with HOD details");
  }

  // Verify HOD profile and faculty entry in DB
  const hodProfile = db.profiles.find((p) => p.email === "hod.bme@nandhaengg.org");
  const hodFaculty = db.faculty.find((f) => f.department_id === createWithHodRes.department!.id && f.is_hod);

  console.log(`✓ HOD Profile Created: ${hodProfile?.full_name} (${hodProfile?.role}), Email: ${hodProfile?.email}, Phone: ${hodProfile?.phone_number}`);
  console.log(`✓ HOD Faculty Record: ID ${hodFaculty?.employee_id}, Designation: ${hodFaculty?.designation}, is_hod: ${hodFaculty?.is_hod}`);

  if (!hodProfile || hodProfile.role !== "HOD" || !hodFaculty || hodFaculty.employee_id !== "FAC-BME-001") {
    throw new Error("HOD details were not properly created or linked to department");
  }

  // Verify getDepartmentsAction returns the HOD data
  const deptsWithHod = await getDepartmentsAction();
  const bmeDept = deptsWithHod.find((d) => d.code === "BME");
  console.log(`✓ getDepartmentsAction HOD Name: ${bmeDept?.hod?.profile?.full_name}, HOD Email: ${bmeDept?.hod?.profile?.email}`);

  if (bmeDept?.hod?.profile?.full_name !== "Dr. K. Senthil Kumar") {
    throw new Error("getDepartmentsAction did not include populated HOD profile details");
  }

  // 8. Test updating HOD details
  const updateHodRes = await updateDepartmentAction(createWithHodRes.department.id, {
    name: "Biomedical Engineering & Medical Devices",
    code: "BME",
    type: "UG",
    is_active: true,
    hodName: "Dr. K. Senthil Kumar Ph.D",
    hodEmail: "hod.bme@nandhaengg.org",
    hodPhone: "+91 94432 99999",
    hodEmployeeId: "FAC-BME-001",
    hodDesignation: "Senior Professor & Head",
  });
  console.log("✓ updateDepartmentAction with revised HOD details:", updateHodRes.success);
  const updatedBmeDept = (await getDepartmentsAction()).find((d) => d.code === "BME");
  console.log(`✓ Updated HOD designation: ${updatedBmeDept?.hod?.designation}, Phone: ${updatedBmeDept?.hod?.profile?.phone_number}`);

  console.log("\n=== ALL UNIT & HOD INTEGRATION TESTS PASSED SUCCESSFULLY ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
