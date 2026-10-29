import { loginAction } from "@/actions/auth";

async function run() {
  console.log("Testing Student Login Variations:");

  // Test 1: Given Excel password
  const res1 = await loginAction({ identifier: "732226CS001", password: "Nec9487280965" });
  console.log("CS001 with given password Nec9487280965:", res1.success ? "PASSED" : "FAILED", res1.error || "");

  // Test 2: Generated password Nec@<RegNo>
  const res2 = await loginAction({ identifier: "732226CS001", password: "Nec@732226CS001" });
  console.log("CS001 with generated password Nec@732226CS001:", res2.success ? "PASSED" : "FAILED", res2.error || "");

  // Test 3: Student where mobile was NotGiven (AG011)
  const res3 = await loginAction({ identifier: "732226AG011", password: "Nec@732226AG011" });
  console.log("AG011 with clean generated password Nec@732226AG011:", res3.success ? "PASSED" : "FAILED", res3.error || "");

  // Test 4: Student with email identifier
  const res4 = await loginAction({ identifier: "732226ag001@nandhaengg.org", password: "Nec8825678060" });
  console.log("AG001 by email with given password Nec8825678060:", res4.success ? "PASSED" : "FAILED", res4.error || "");

  // Test 5: Bad password check
  const res5 = await loginAction({ identifier: "732226CS001", password: "wrongpassword" });
  console.log("CS001 with wrong password:", !res5.success ? "REJECTED (CORRECT)" : "FAILED (should not login)");
}

run();

