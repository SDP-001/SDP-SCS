import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { AccountSettingsForm } from "@/components/settings/AccountSettingsForm";

export default async function FacultySettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Faculty Profile & Security Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your faculty employee ID, official email, login password, and profile photo.
          </p>
        </div>
      </div>

      <AccountSettingsForm role="FACULTY" />
    </div>
  );
}
