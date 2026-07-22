import { currentUser } from "@clerk/nextjs/server";
import { getTodayAttendance, getAttendanceForMonth, getAttendanceSummary } from "@/actions/attendance";
import DashboardContainer from "@/components/DashboardContainer";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Student";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed

  // Fetch initial server-side data
  const todayRecord = await getTodayAttendance();
  const monthRecords = await getAttendanceForMonth(year, month);
  const summary = await getAttendanceSummary(year, month);

  return (
    <DashboardContainer
      userName={name}
      initialTodayRecord={todayRecord ? { ...todayRecord, date: new Date(todayRecord.date) } : null}
      initialMonthRecords={monthRecords.map((r) => ({ ...r, date: new Date(r.date) }))}
      initialSummary={summary}
      year={year}
      month={month}
    />
  );
}
