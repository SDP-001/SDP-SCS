import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    const role = currentUser.profile.role;
    if (role === "STUDENT") redirect("/student/dashboard");
    if (role === "FACULTY") redirect("/faculty/dashboard");
    if (role === "HOD") redirect("/hod/dashboard");
    if (role === "ADMIN") redirect("/admin/dashboard");
  }

  redirect("/login");
}
