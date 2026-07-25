"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { updateProfile, deleteUserAccount } from "@/actions/user";
import { User, Shield, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Deletion confirmations states
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== "delete my account") return;
    setIsDeleting(true);
    try {
      // 1. Fire database and Auth deletion server action
      await deleteUserAccount();

      // 2. Clear client-side auth cookies and session
      await signOut();

      // 3. Redirect back to landing page
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Failed to delete account. Please try again or contact support.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your student profile and account settings.
        </p>
      </section>

      <div className="max-w-2xl flex flex-col gap-8">
        {/* Profile Card */}
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
          <div className="flex flex-wrap gap-4 mt-2">
            <button
              onClick={() => openUserProfile()}
              className="border border-border hover:bg-surface-low text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              Manage Account Security
            </button>
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </section>
      </div>

      {/* Confirmation Modal overlay */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="premium-border card-bg rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 relative">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Account
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                This action is permanent and cannot be undone. All your attendance history, profile settings, and feedback logs will be permanently deleted from Messbook.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type <span className="text-white font-mono lowercase font-bold">delete my account</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isDeleting}
                className="w-full bg-surface-low border border-border rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-destructive focus:border-destructive outline-none transition-all"
                placeholder="delete my account"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsConfirmingDelete(false);
                  setConfirmText("");
                }}
                disabled={isDeleting}
                className="flex-1 border border-border hover:bg-surface-low text-white py-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText.toLowerCase() !== "delete my account"}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-white py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Permanently Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Placeholder */}
      <AdPlaceholder />
    </div>
  );
}
