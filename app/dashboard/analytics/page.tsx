"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth } from "date-fns";
import { getAttendanceForRange } from "@/actions/attendance";
import { AttendanceStatus } from "@prisma/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Calendar } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";

interface AttendanceRecord {
  id: string;
  userId: string;
  date: Date;
  status: AttendanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export default function AnalyticsPage() {
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAnalytics = async (from: string, to: string) => {
    setIsLoading(true);
    try {
      const data = await getAttendanceForRange(from, to);
      setRecords(data.map((r) => ({ ...r, date: new Date(r.date) })));
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(fromDate, toDate);
  }, [fromDate, toDate]);

  // Calculations
  const takenCount = records.filter((r) => r.status === AttendanceStatus.Taken).length;
  const skippedCount = records.filter((r) => r.status === AttendanceStatus.Skipped).length;
  const totalMarked = takenCount + skippedCount;
  const rate = totalMarked > 0 ? Math.round((takenCount / totalMarked) * 100) : 0;

  // Chart Data 1: Weekly Breakdown (Grouped by Day of Week)
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = daysOfWeek.map((day, index) => {
    const dayRecords = records.filter((r) => r.date.getDay() === index);
    const taken = dayRecords.filter((r) => r.status === AttendanceStatus.Taken).length;
    const skipped = dayRecords.filter((r) => r.status === AttendanceStatus.Skipped).length;
    return { name: day, Taken: taken, Skipped: skipped };
  });

  // Chart Data 2: Monthly Breakdown (Grouped by Month Name)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = months
    .map((month, index) => {
      const monthRecords = records.filter((r) => r.date.getMonth() === index);
      const taken = monthRecords.filter((r) => r.status === AttendanceStatus.Taken).length;
      const skipped = monthRecords.filter((r) => r.status === AttendanceStatus.Skipped).length;
      return { name: month, Taken: taken, Skipped: skipped };
    })
    .filter((m) => m.Taken > 0 || m.Skipped > 0); // show only months with data

  const displayMonthlyData =
    monthlyData.length > 0
      ? monthlyData
      : [{ name: months[new Date().getMonth()], Taken: takenCount, Skipped: skippedCount }];

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Visualize your mess attendance trends and savings.
          </p>
        </div>

        {/* Date Picker inputs */}
        <div className="flex flex-wrap items-center gap-3 bg-card p-2 rounded-xl border border-border">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-surface-low/30 px-3 py-1.5 rounded-lg transition-all"
            onClick={(e) => {
              const input = e.currentTarget.querySelector("input");
              if (input) {
                try {
                  input.showPicker();
                } catch (err) {
                  input.focus();
                }
              }
            }}
          >
            <Calendar className="h-4.5 w-4.5 text-secondary shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider leading-none mb-0.5">
                From
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-none p-0 text-xs text-white focus:ring-0 outline-none w-28 cursor-pointer font-mono [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>

          <span className="text-xs text-muted-foreground font-medium">to</span>

          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-surface-low/30 px-3 py-1.5 rounded-lg transition-all"
            onClick={(e) => {
              const input = e.currentTarget.querySelector("input");
              if (input) {
                try {
                  input.showPicker();
                } catch (err) {
                  input.focus();
                }
              }
            }}
          >
            <Calendar className="h-4.5 w-4.5 text-secondary shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider leading-none mb-0.5">
                To
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-none p-0 text-xs text-white focus:ring-0 outline-none w-28 cursor-pointer font-mono [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-border card-bg rounded-xl p-6 flex flex-col gap-2 shadow-lg">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Meals Taken
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-secondary font-mono">{takenCount}</span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>
        <div className="premium-border card-bg rounded-xl p-6 flex flex-col gap-2 shadow-lg">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Meals Skipped
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-destructive font-mono">{skippedCount}</span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>
        <div className="premium-border card-bg rounded-xl p-6 flex flex-col gap-2 shadow-lg">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Attendance Percentage
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{rate}%</span>
            <span className="text-xs text-muted-foreground">overall</span>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-opacity duration-200 ${isLoading ? "opacity-60 pointer-events-none" : ""}`}>
        {/* Weekly Chart */}
        <div className="premium-border card-bg rounded-xl p-6 flex flex-col gap-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white">Weekly Attendance Pattern</h3>
            <p className="text-xs text-muted-foreground">Historical averages by day of the week</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#262626" }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                <Bar dataKey="Taken" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Skipped" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="premium-border card-bg rounded-xl p-6 flex flex-col gap-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white">Monthly Comparison</h3>
            <p className="text-xs text-muted-foreground">Total taken vs skipped per month</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#262626" }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                <Bar dataKey="Taken" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Skipped" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Ad Placeholder */}
      <AdPlaceholder />
    </div>
  );
}
