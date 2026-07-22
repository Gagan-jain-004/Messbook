"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { updateProfile } from "@/actions/user";
import { User, Shield, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import AdPlaceholder from "@/components/AdPlaceholder";

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile(name);
      if (user) {
        const parts = name.trim().split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";
        await user.update({ firstName, lastName });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile name:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your student profile and application preferences.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <section className="premium-border card-bg rounded-xl p-8 shadow-xl flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-secondary" />
              Profile Details
            </h2>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-surface-low border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="w-full bg-surface-low/50 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground outline-none cursor-not-allowed"
                />
              </div>

              <div className="flex justify-between items-center mt-2">
                {saveSuccess ? (
                  <span className="text-xs text-secondary font-medium">
                    Profile updated successfully!
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="bg-white text-background hover:opacity-90 transition-all px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>

          {/* Account Security Card */}
          <section className="premium-border card-bg rounded-xl p-8 shadow-xl flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-secondary" />
              Account Security
            </h2>
            <p className="text-sm text-muted-foreground">
              To update your email addresses, change passwords, or set up two-factor
              authentication, please use our secure account portal.
            </p>
            <div>
              <button
                onClick={() => openUserProfile()}
                className="border border-border hover:bg-surface-low text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                Manage Account Security
              </button>
            </div>
          </section>
        </div>

        {/* Preferences / Theme Card */}
        <div className="flex flex-col gap-6">
          <section className="premium-border card-bg rounded-xl p-8 shadow-xl flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white">Preferences</h2>

            {/* Theme Toggle */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Theme Mode
              </span>
              <div className="flex bg-surface-low p-1 rounded-xl border border-border">
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex justify-center items-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    theme === "dark"
                      ? "bg-card text-white border border-border"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex justify-center items-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    theme === "light"
                      ? "bg-card text-white border border-border"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light
                </button>
              </div>
            </div>

            <hr className="border-border" />

            {/* Sign Out */}
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all py-3 rounded-xl text-sm font-semibold"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </section>
        </div>
      </div>

      {/* Ad Placeholder */}
      <AdPlaceholder />
    </div>
  );
}
