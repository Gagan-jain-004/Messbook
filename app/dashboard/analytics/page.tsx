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
import {
  Calendar,
  IndianRupee,
  Wallet,
  PiggyBank,
  CheckCircle2,
  Percent,
  RotateCcw,
} from "lucide-react";
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
  const [dailyRate, setDailyRate] = useState<number>(140);
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

  // Financial Calculations (Default ₹140/day)
  const currentRate = Number.isNaN(dailyRate) || dailyRate < 0 ? 0 : dailyRate;
  const totalPayable = takenCount * currentRate;
  const totalSaved = skippedCount * currentRate;

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
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Visualize your mess attendance trends, meal payments, and total savings.
          </p>
        </div>

        {/* Date Picker & Rate inputs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Rate per day input */}
          <div className="flex items-center gap-2 bg-card p-2 px-3 rounded-xl border border-border">
            <IndianRupee className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider leading-none mb-0.5">
                Rate / Day
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground font-mono">₹</span>
                <input
                  type="number"
                  min="0"
                  value={dailyRate === 0 ? "" : dailyRate}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : Number(e.target.value);
                    setDailyRate(val);
                  }}
                  placeholder="140"
                  className="bg-transparent border-none p-0 text-xs text-white font-mono font-bold focus:ring-0 outline-none w-14"
                />
              </div>
            </div>
            {dailyRate !== 140 && (
              <button
                type="button"
                onClick={() => setDailyRate(140)}
                title="Reset to default (₹140)"
                className="p-1 text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-surface-low"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Date Picker inputs */}
          <div className="flex flex-wrap items-center gap-2 bg-card p-2 rounded-xl border border-border">
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-surface-low/30 px-3 py-1.5 rounded-lg transition-all"
              onClick={(e) => {
                const input = e.currentTarget.querySelector("input");
                if (input) {
                  try {
                    input.showPicker();
                  } catch {
                    input.focus();
                  }
                }
              }}
            >
              <Calendar className="h-4 w-4 text-secondary shrink-0" />
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
                  } catch {
                    input.focus();
                  }
                }
              }}
            >
              <Calendar className="h-4 w-4 text-secondary shrink-0" />
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
        </div>
      </section>

      {/* Primary Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Payable Bill */}
        <div className="premium-border card-bg rounded-xl p-6 flex flex-col justify-between gap-3 shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Total Mess Bill
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white font-mono">
                ₹{totalPayable.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              {takenCount} days attended @ ₹{currentRate}/day
            </span>
          </div>
        </div>

        {/* Total Savings */}
        <div className="premium-border card-bg rounded-xl p-6 flex flex-col justify-between gap-3 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Saved
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-amber-400 font-mono">
                ₹{totalSaved.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              {skippedCount} days skipped @ ₹{currentRate}/day
            </span>
          </div>
        </div>

        {/* Meals Taken */}
        <div className="premium-border card-bg rounded-xl p-6 flex flex-col justify-between gap-3 shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Meals Taken
            </span>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-secondary font-mono">{takenCount}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              Out of {totalMarked} logged days
            </span>
          </div>
        </div>

        {/* Attendance Percentage */}
        <div className="premium-border card-bg rounded-xl p-6 flex flex-col justify-between gap-3 shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Attendance Rate
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">{rate}%</span>
              <span className="text-xs text-muted-foreground">overall</span>
            </div>
            <div className="w-full bg-surface-low h-1.5 rounded-full mt-2.5 overflow-hidden border border-border">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-500"
                style={{ width: `${rate}%` }}
              />
            </div>
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
