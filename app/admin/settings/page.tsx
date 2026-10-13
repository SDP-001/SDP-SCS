"use client";

import React, { useState, useEffect } from "react";
import { getCollegeSettingsAction, updateCollegeSettingsAction } from "@/actions/admin";
import { AccountSettingsForm } from "@/components/settings/AccountSettingsForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, ShieldCheck, CheckCircle2, AlertCircle, Building, User } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"account" | "policies">("account");
  const [college, setCollege] = useState<any>(null);
  const [maxPoints, setMaxPoints] = useState(100);
  const [timeoutMinutes, setTimeoutMinutes] = useState(30);
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getCollegeSettingsAction();
        setCollege(res.college);
        if (res.settings) {
          setMaxPoints(res.settings.max_points_per_certificate);
          setTimeoutMinutes(res.settings.reviewer_reclaim_timeout_minutes);
          setMaxFileSize(res.settings.max_file_size_mb);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSavePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await updateCollegeSettingsAction({
        max_points_per_certificate: Number(maxPoints),
        reviewer_reclaim_timeout_minutes: Number(timeoutMinutes),
        max_file_size_mb: Number(maxFileSize),
      });

      if (!res.success) {
        setError(res.error || "Failed to update college settings");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Dean & Admin Settings Center
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your administrator profile picture, User ID, login password, and institution-wide policies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
            activeTab === "account"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Dean Profile & Security</span>
        </button>

        <button
          onClick={() => setActiveTab("policies")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
            activeTab === "policies"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Institutional Policies</span>
        </button>
      </div>

      {activeTab === "account" ? (
        <AccountSettingsForm role="ADMIN" />
      ) : (
        <div className="space-y-6">
          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Institutional policies updated successfully. Changes are effective immediately across all review queues.
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-slate-200/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSavePolicies} className="space-y-6">
              {/* Institutional Identity Card */}
              <Card className="p-6 border-slate-200 bg-white space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Institutional Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Institution Name</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {college?.name || "Nandha Engineering College (Autonomous)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Institutional Code</span>
                    <span className="font-mono font-bold text-slate-900">{college?.code || "NEC"}</span>
                  </div>
                </div>
              </Card>

              {/* Policy Parameters */}
              <Card className="p-6 border-slate-200 bg-white space-y-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Credential & Review Governance Policies
                </h3>

                <div className="space-y-5 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-700">
                        Max Activity Points per Certificate
                      </label>
                      <span className="font-mono font-bold text-primary-600">{maxPoints} PTS</span>
                    </div>
                    <Input
                      type="number"
                      min={10}
                      max={500}
                      value={maxPoints}
                      onChange={(e) => setMaxPoints(Number(e.target.value))}
                      required
                      className="h-10 text-xs"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Upper ceiling on points a faculty reviewer may award for a single certificate claim.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-700">
                        Reviewer Lock Timeout (Minutes)
                      </label>
                      <span className="font-mono font-bold text-primary-600">{timeoutMinutes} MIN</span>
                    </div>
                    <Input
                      type="number"
                      min={5}
                      max={180}
                      value={timeoutMinutes}
                      onChange={(e) => setTimeoutMinutes(Number(e.target.value))}
                      required
                      className="h-10 text-xs"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Time after which an inactive review lock automatically releases back to the department pool.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-700">
                        Max Student Upload File Size (MB)
                      </label>
                      <span className="font-mono font-bold text-primary-600">{maxFileSize} MB</span>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={maxFileSize}
                      onChange={(e) => setMaxFileSize(Number(e.target.value))}
                      required
                      className="h-10 text-xs"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Hard limit on student certificate proof files (PDF, PNG, JPG).
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs h-10 px-6 shadow-sm"
                  >
                    {saving ? "Saving Policy Changes..." : "Save Institutional Policies"}
                  </Button>
                </div>
              </Card>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
