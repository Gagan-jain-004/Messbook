import { getUsersList } from "@/actions/admin";
import Link from "next/link";
import { format } from "date-fns";
import SearchBar from "./SearchBar";

export const revalidate = 0; // Disable caching to fetch fresh data on query update

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const users = await getUsersList(query);

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track student enrollment and attendance metrics.
          </p>
        </div>
      </section>

      {/* Search and Table Container */}
      <section className="premium-border bg-card rounded-xl overflow-hidden shadow-xl flex flex-col">
        {/* Search Bar container */}
        <div className="p-6 border-b border-border bg-surface-low/30">
          <SearchBar initialValue={query} />
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-low/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Attendance %
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No users found matching &quot;{query}&quot;
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-low/20 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-white">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 w-24 bg-surface-low rounded-full overflow-hidden border border-border">
                          <div
                            className={`h-full rounded-full ${
                              user.attendanceRate >= 80
                                ? "bg-secondary"
                                : user.attendanceRate >= 50
                                ? "bg-amber-500"
                                : "bg-destructive"
                            }`}
                            style={{ width: `${user.attendanceRate}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-mono font-bold ${
                            user.attendanceRate >= 80
                              ? "text-secondary"
                              : user.attendanceRate >= 50
                              ? "text-amber-500"
                              : "text-destructive"
                          }`}
                        >
                          {user.attendanceRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center justify-center border border-border hover:border-white text-muted-foreground hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                      >
                        View Profile
                      </Link>
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
