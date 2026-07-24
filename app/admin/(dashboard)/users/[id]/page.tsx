import { getUserProfile } from "@/actions/admin";
import { ArrowLeft, Mail, Calendar as CalendarIcon, CheckCircle2, XCircle, Percent } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const revalidate = 0; // Disable caching so profile data is always fresh

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserProfilePage({ params }: PageProps) {
  const { id } = await params;
  const { user, attendance } = await getUserProfile(id);

  const takenCount = user.taken;
  const skippedCount = user.skipped;
  const attendanceRate = user.attendanceRate;

  return (
    <div className="flex flex-col gap-10">
      {/* Back Link & Header */}
      <section className="flex flex-col gap-4">
        <Link
          href="/admin/users"
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
            Student profile and attendance history details.
          </p>
        </div>
      </section>

      {/* Profile Card & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="premium-border card-bg rounded-xl p-8 flex flex-col gap-6 shadow-xl">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Profile Details</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-mono">
                  Email Address
                </span>
                <span className="text-sm text-white truncate max-w-[200px]">{user.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-mono">
                  Date Joined
                </span>
                <span className="text-sm text-white">{format(new Date(user.createdAt), "PPP")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Meals Taken */}
          <div className="premium-border card-bg rounded-xl p-6 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Taken
              </span>
              <CheckCircle2 className="text-secondary h-4 w-4" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-secondary font-mono">{takenCount}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>

          {/* Meals Skipped */}
          <div className="premium-border card-bg rounded-xl p-6 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Skipped
              </span>
              <XCircle className="text-destructive h-4 w-4" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-destructive font-mono">{skippedCount}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="premium-border card-bg rounded-xl p-6 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Rate
              </span>
              <Percent className="text-white h-4 w-4" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">{attendanceRate}%</span>
              <span className="text-xs text-muted-foreground">overall</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Attendance List */}
      <section className="premium-border card-bg rounded-xl p-8 shadow-xl flex flex-col gap-6">
        <h3 className="text-base font-bold text-white uppercase tracking-wider">
          Attendance History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Meal Status
                </th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Logged Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                    No attendance logs marked by this student yet.
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id}>
                    <td className="py-4 text-sm text-white">
                      {format(new Date(record.date), "EEEE, MMMM d, yyyy")}
                    </td>
                    <td className="py-4">
                      {record.status === "Taken" ? (
                        <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full border border-secondary/20">
                          Taken
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full border border-secondary/20">
                          Skipped
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-xs text-muted-foreground font-mono">
                      {format(new Date(record.updatedAt), "PPpp")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
