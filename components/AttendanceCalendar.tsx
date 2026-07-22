"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Check, X, Minus } from "lucide-react";
import { markAttendance } from "@/actions/attendance";
import { AttendanceStatus } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";

interface AttendanceRecord {
  id: string;
  date: Date;
  status: AttendanceStatus;
}

interface AttendanceCalendarProps {
  initialRecords: AttendanceRecord[];
  currentYear: number;
  currentMonth: number; // 1-indexed
  onUpdate: () => void;
  onMonthChange?: (year: number, month: number) => void;
}

export default function AttendanceCalendar({
  initialRecords,
  currentYear,
  currentMonth,
  onUpdate,
  onMonthChange,
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(currentYear, currentMonth - 1, 1));
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // Sync records state when initialRecords changes
  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 (Sun) to 6 (Sat)

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth() + 1);
    }
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth() + 1);
    }
  };

  // Find attendance record for a specific date
  const getRecordForDate = (date: Date) => {
    return records.find((r) => {
      const d = new Date(r.date);
      return (
        d.getUTCFullYear() === date.getFullYear() &&
        d.getUTCMonth() === date.getMonth() &&
        d.getUTCDate() === date.getDate()
      );
    });
  };

  const handleSelectStatus = async (status: AttendanceStatus) => {
    if (!selectedDate) return;
    setIsMutating(true);

    try {
      // Format as YYYY-MM-DD to avoid client-local-timezone offsets
      const dateString = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

      await markAttendance(dateString, status);

      // Update local state optimistically
      setRecords((prev) => {
        const filtered = prev.filter((r) => {
          const d = new Date(r.date);
          return !(
            d.getUTCFullYear() === selectedDate.getFullYear() &&
            d.getUTCMonth() === selectedDate.getMonth() &&
            d.getUTCDate() === selectedDate.getDate()
          );
        });

        if (status === AttendanceStatus.NotMarked) return filtered;

        return [
          ...filtered,
          {
            id: Math.random().toString(),
            date: new Date(selectedDate),
            status,
          },
        ];
      });

      setSelectedDate(null);
      onUpdate(); // refresh statistics summary cards
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="premium-border card-bg rounded-xl overflow-hidden shadow-xl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-low/50 p-6">
        <h3 className="text-lg font-semibold text-white">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-2 text-muted-foreground hover:bg-surface-high hover:text-white transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="rounded-lg p-2 text-muted-foreground hover:bg-surface-high hover:text-white transition-colors duration-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Days of Week */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold tracking-wider text-muted-foreground mb-4">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: startDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square p-2 opacity-0" />
          ))}

          {/* Month Days */}
          {daysInMonth.map((day) => {
            const record = getRecordForDate(day);
            const status = record?.status || AttendanceStatus.NotMarked;
            const isCurrent = isToday(day);

            let bgClass = "bg-surface-low/40 border-border hover:border-muted-foreground/50";
            let textClass = "text-foreground";
            let statusDot = null;

            if (status === AttendanceStatus.Taken) {
              bgClass = "bg-secondary/10 border-secondary/30 hover:bg-secondary/20 hover:border-secondary/50";
              textClass = "text-secondary font-medium";
              statusDot = <div className="h-2 w-2 rounded-full bg-secondary" />;
            } else if (status === AttendanceStatus.Skipped) {
              bgClass = "bg-destructive/10 border-destructive/30 hover:bg-destructive/20 hover:border-destructive/50";
              textClass = "text-destructive font-medium";
              statusDot = <div className="h-2 w-2 rounded-full bg-destructive" />;
            }

            if (isCurrent) {
              bgClass += " ring-1 ring-white/50";
            }

            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`flex aspect-square flex-col justify-between rounded-xl border p-2 text-left transition-all duration-200 ${bgClass}`}
              >
                <span className={`text-sm ${textClass} ${isCurrent ? "font-bold" : ""}`}>
                  {format(day, "d")}
                </span>
                <div className="flex items-center justify-between">
                  {statusDot}
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/60">
                      Today
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="flex gap-6 border-t border-border bg-surface-low/30 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-secondary" />
          <span className="text-xs text-muted-foreground">Taken</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <span className="text-xs text-muted-foreground">Skipped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full border border-border" />
          <span className="text-xs text-muted-foreground">Not Marked</span>
        </div>
      </div>

      {/* Status Picker Dialog */}
      <AnimatePresence>
        {selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <h4 className="text-lg font-bold text-white mb-1">
                Edit Attendance
              </h4>
              <p className="text-sm text-muted-foreground mb-6">
                For {format(selectedDate, "EEEE, MMMM do, yyyy")}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  disabled={isMutating}
                  onClick={() => handleSelectStatus(AttendanceStatus.Taken)}
                  className="flex items-center justify-between rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-secondary font-medium hover:bg-secondary/20 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Taken
                  </span>
                </button>
                <button
                  disabled={isMutating}
                  onClick={() => handleSelectStatus(AttendanceStatus.Skipped)}
                  className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive font-medium hover:bg-destructive/20 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <X className="h-4 w-4" /> Skipped
                  </span>
                </button>
                <button
                  disabled={isMutating}
                  onClick={() => handleSelectStatus(AttendanceStatus.NotMarked)}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-low px-4 py-3 text-muted-foreground font-medium hover:bg-surface-high transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <Minus className="h-4 w-4" /> Not Marked / Clear
                  </span>
                </button>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  disabled={isMutating}
                  onClick={() => setSelectedDate(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-low hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
