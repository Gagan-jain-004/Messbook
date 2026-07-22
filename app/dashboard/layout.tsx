import Navbar from "@/components/Navbar";
import { syncUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sync Clerk user with PostgreSQL database
  const user = await syncUser();
  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10 flex flex-col gap-10">
        {children}
      </main>
    </div>
  );
}
