import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { AccountSettingsForm } from "@/components/settings/AccountSettingsForm";

export default async function StudentSettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Profile & Security Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your student register number, login password, and upload your profile picture.
          </p>
        </div>
      </div>

      <AccountSettingsForm role="STUDENT" />
    </div>
  );
}
