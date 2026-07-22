"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, LogOut } from "lucide-react";
import { logoutAdmin } from "@/actions/admin";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card p-6">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-white tracking-tight">DietTrack Admin</h1>
        <p className="text-xs text-muted-foreground">Management Portal</p>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-surface-low hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border pt-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
