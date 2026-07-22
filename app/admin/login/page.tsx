"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/actions/admin";
import { Lock, Mail, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAdmin, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/admin/dashboard");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm premium-border bg-card rounded-xl p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white tracking-tight">Admin Login</h1>
          <p className="text-xs text-muted-foreground">
            Log in to the DietTrack admin management portal
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                name="email"
                required
                placeholder="admin@diettrack.com"
                className="w-full bg-surface-low border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-muted-foreground focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-surface-low border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-muted-foreground focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all"
              />
            </div>
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white text-background font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40 mt-2"
          >
            {isPending ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
