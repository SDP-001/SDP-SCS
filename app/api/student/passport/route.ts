import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDB } from "@/lib/db/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const db = getDB();
  const student = user.student || db.students[0];
  const profile = db.profiles.find((p) => p.id === student?.profile_id) || user.profile;
  const department = db.departments.find((d) => d.id === student?.department_id);
  const college = db.colleges.find((c) => c.id === profile?.college_id) || db.colleges[0];

  const approvedCerts = db.certificates
    .filter((c) => c.student_id === student?.id && c.status === "APPROVED")
    .map((c) => ({
      id: c.id,
      achievement_id: c.achievement_id,
      title: c.title,
      achievement: c.achievement,
      categoryName: db.categories.find((cat) => cat.id === c.category_id)?.name || "General",
      organizer: c.organizer,
      event_date: c.event_date,
      points: db.pointRecords.find((p) => p.certificate_id === c.id && p.is_latest)?.points || 0,
    }))
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const totalPoints = approvedCerts.reduce((acc, c) => acc + c.points, 0);

  return NextResponse.json({
    studentName: profile?.full_name || "Student",
    registerNumber: student?.register_number || "710022CS0101",
    departmentName: department?.name || "Computer Science & Engineering",
    academicYear: student?.academic_year || 3,
    totalPoints,
    records: approvedCerts,
    collegeName: college?.name || "Nandha Engineering College (Autonomous)",
  });
}
