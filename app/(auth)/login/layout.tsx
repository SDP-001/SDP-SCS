import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    const role = currentUser.profile.role;
    if (role === "STUDENT") redirect("/student/dashboard");
    if (role === "FACULTY") redirect("/faculty/dashboard");
    if (role === "HOD") redirect("/hod/dashboard");
    if (role === "ADMIN") redirect("/admin/dashboard");
  }

  return <>{children}</>;
}
