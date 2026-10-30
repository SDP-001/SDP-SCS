"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * BackNavigationGuard prevents mobile hardware back button and browser back navigation
 * from automatically signing the user out or returning to the login page.
 * Users must explicitly and manually click "Sign Out" to end their session.
 */
export function BackNavigationGuard() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if the current page is a root role dashboard
    const isDashboardRoot =
      pathname === "/student/dashboard" ||
      pathname === "/faculty/dashboard" ||
      pathname === "/hod/dashboard" ||
      pathname === "/admin/dashboard";

    if (!isDashboardRoot) return;

    // Push a guard state into history
    window.history.pushState({ guard: "portal_dashboard", path: pathname }, "", window.location.href);

    const handlePopState = () => {
      // Prevent browser/mobile back navigation from exiting to login; keep user on their dashboard
      window.history.pushState({ guard: "portal_dashboard", path: pathname }, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname]);

  return null;
}
