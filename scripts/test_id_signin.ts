import { loginAction } from "@/actions/auth";

async function test() {
  console.log("=== Testing 1-Click ID Sign-In ===");

  const r1 = await loginAction({ identifier: "732226CS001", password: "" });
  console.log("CS001 with EMPTY password:", r1.success ? `PASSED (Role: ${r1.role})` : `FAILED: ${r1.error}`);

  const r2 = await loginAction({ identifier: "732226CS001", password: "Nec9487280965" });
  console.log("CS001 with given password Nec9487280965:", r2.success ? `PASSED (Role: ${r2.role})` : `FAILED: ${r2.error}`);

  const r3 = await loginAction({ identifier: "732226CS001", password: "Nec@732226CS001" });
  console.log("CS001 with generated password Nec@732226CS001:", r3.success ? `PASSED (Role: ${r3.role})` : `FAILED: ${r3.error}`);

  const r4 = await loginAction({ identifier: "732226AG001", password: "" });
  console.log("AG001 with EMPTY password:", r4.success ? `PASSED (Role: ${r4.role})` : `FAILED: ${r4.error}`);

  const r5 = await loginAction({ identifier: "732226ag001@nandhaengg.org", password: "" });
  console.log("AG001 by email with EMPTY password:", r5.success ? `PASSED (Role: ${r5.role})` : `FAILED: ${r5.error}`);

  const r6 = await loginAction({ identifier: "732226EC001", password: "" });
  console.log("EC001 with EMPTY password:", r6.success ? `PASSED (Role: ${r6.role})` : `FAILED: ${r6.error}`);

  const r7 = await loginAction({ identifier: "732226IT001", password: "" });
  console.log("IT001 with EMPTY password:", r7.success ? `PASSED (Role: ${r7.role})` : `FAILED: ${r7.error}`);

  const r8 = await loginAction({ identifier: "NONEXISTENT", password: "" });
  console.log("Non-existent user:", !r8.success ? `CORRECTLY REJECTED: ${r8.error}` : "FAILED");
}

test();

