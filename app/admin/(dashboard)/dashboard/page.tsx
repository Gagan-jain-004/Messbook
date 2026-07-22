import { getAdminStats } from "@/actions/admin";
import { Users, Bolt, AlertCircle, CheckCircle2 } from "lucide-react";
import AdminDashboardChart from "./AdminDashboardChart";

export const revalidate = 0; // Disable static caching so stats are always up to date

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered students",
      icon: Users,
      color: "text-white",
    },
    {
      title: "Active Today",
      value: stats.todayActiveUsers,
      description: `${
        stats.totalUsers > 0 ? Math.round((stats.todayActiveUsers / stats.totalUsers) * 100) : 0
      }% daily check-in rate`,
      icon: Bolt,
      color: "text-secondary",
    },
    {
      title: "Pending Feedback",
      value: stats.pendingFeedback,
      description: "Requires administrator attention",
      icon: AlertCircle,
      color: stats.pendingFeedback > 0 ? "text-destructive" : "text-muted-foreground",
    },
    {
      title: "Resolved Feedback",
      value: stats.resolvedFeedback,
      description: "Addressed feedback reports",
      icon: CheckCircle2,
      color: "text-secondary",
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          System metrics and student engagement statistics.
        </p>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="premium-border card-bg rounded-xl p-6 flex flex-col justify-between shadow-lg"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </span>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className="mt-4">
                <h2 className="text-3xl font-bold text-white font-mono">{card.value}</h2>
                <p className="text-[10px] text-muted-foreground mt-1">{card.description}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Weekly Trend Chart */}
      <section className="premium-border card-bg rounded-xl p-6 shadow-xl">
        <div className="mb-6">
          <h3 className="text-base font-bold text-white font-sans">Attendance Trends</h3>
          <p className="text-xs text-muted-foreground">Daily engagement levels for the current week</p>
        </div>
        <AdminDashboardChart />
      </section>
    </div>
  );
}
