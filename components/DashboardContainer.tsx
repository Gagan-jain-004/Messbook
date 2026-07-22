"use client";

import { useState } from "react";
import AttendanceCard from "@/components/AttendanceCard";
import MonthlySummary from "@/components/MonthlySummary";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import AdPlaceholder from "@/components/AdPlaceholder";
import { AttendanceStatus } from "@prisma/client";

interface AttendanceRecord {
  id: string;
  date: Date;
  status: AttendanceStatus;
}

interface DashboardContainerProps {
  userName: string;
  initialTodayRecord: AttendanceRecord | null;
  initialMonthRecords: AttendanceRecord[];
  initialSummary: { taken: number; skipped: number; rate: number };
  year: number;
  month: number;
}

export default function DashboardContainer({
  userName,
  initialTodayRecord,
  initialMonthRecords,
  initialSummary,
  year: initialYear,
  month: initialMonth,
}: DashboardContainerProps) {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(initialTodayRecord);
  const [monthRecords, setMonthRecords] = useState<AttendanceRecord[]>(initialMonthRecords);
  const [summary, setSummary] = useState(initialSummary);
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMonthData = async (newYear: number, newMonth: number) => {
    setIsLoading(true);
    try {
      const { getAttendanceForMonth, getAttendanceSummary } = await import(
        "@/actions/attendance"
      );
      const records = await getAttendanceForMonth(newYear, newMonth);
      const sum = await getAttendanceSummary(newYear, newMonth);

      setMonthRecords(records.map((r) => ({ ...r, date: new Date(r.date) })));
      setSummary(sum);
      setYear(newYear);
      setMonth(newMonth);
    } catch (e) {
      console.error("Failed to load month data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    await fetchMonthData(year, month);

    try {
      const { getTodayAttendance } = await import("@/actions/attendance");
      const today = await getTodayAttendance();
      setTodayRecord(today ? { ...today, date: new Date(today.date) } : null);
    } catch (e) {
      console.error("Failed to sync today's record:", e);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Welcome Header */}
      <section className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome back, {userName}.
        </h1>
        <p className="text-sm text-muted-foreground">
          Let&apos;s track your mess meals.
        </p>
      </section>

      {/* Today's Attendance */}
      <AttendanceCard
        initialStatus={todayRecord?.status || null}
        onUpdate={handleUpdate}
      />

      {/* Monthly Summary */}
      <MonthlySummary
        taken={summary.taken}
        skipped={summary.skipped}
        rate={summary.rate}
      />

      {/* Monthly Calendar */}
      <div
        className={
          isLoading
            ? "opacity-60 pointer-events-none transition-opacity duration-200"
            : "transition-opacity duration-200"
        }
      >
        <AttendanceCalendar
          initialRecords={monthRecords}
          currentYear={year}
          currentMonth={month}
          onUpdate={handleUpdate}
          onMonthChange={fetchMonthData}
        />
      </div>

      {/* Ad Placeholder */}
      <AdPlaceholder />
    </div>
  );
}
