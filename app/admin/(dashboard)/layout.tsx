import Sidebar from "@/components/Sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 p-10 max-w-5xl mx-auto w-full flex flex-col gap-10">
        {children}
      </div>
    </div>
  );
}
