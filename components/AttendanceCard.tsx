"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Utensils, CheckCircle, Edit2, XCircle } from "lucide-react";
import { AttendanceStatus } from "@prisma/client";
import { markAttendance } from "@/actions/attendance";

interface AttendanceCardProps {
  initialStatus: AttendanceStatus | null;
  onUpdate: () => void;
}

export default function AttendanceCard({ initialStatus, onUpdate }: AttendanceCardProps) {
  const [status, setStatus] = useState<AttendanceStatus>(initialStatus || AttendanceStatus.NotMarked);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    setStatus(initialStatus || AttendanceStatus.NotMarked);
  }, [initialStatus]);

  const handleMark = async (newStatus: AttendanceStatus) => {
    setIsMutating(true);
    try {
      // Use YYYY-MM-DD local format to avoid client-local-timezone offsets
      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(today.getDate()).padStart(2, "0")}`;

      await markAttendance(dateString, newStatus);
      setStatus(newStatus);
      onUpdate();
    } catch (error) {
      console.error("Failed to mark today's attendance:", error);
    } finally {
      setIsMutating(false);
    }
  };

  const handleEdit = () => {
    handleMark(AttendanceStatus.NotMarked);
  };

  const todayDateStr = format(new Date(), "EEEE, MMMM do");

  return (
    <div className="premium-border card-bg rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 shadow-xl">
      <div className="bg-surface-low w-16 h-16 rounded-full flex items-center justify-center mb-2 border border-border">
        <Utensils className="text-white h-8 w-8" />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white">Today&apos;s Attendance</h2>
        <p className="text-xs text-muted-foreground mt-1">{todayDateStr}</p>
      </div>

      {status === AttendanceStatus.NotMarked ? (
        <div className="flex flex-col gap-2 w-full max-w-sm mt-2">
          <p className="text-sm text-muted-foreground mb-2">
            You haven&apos;t marked your meal status for today yet.
          </p>
          <div className="flex gap-4 w-full">
            <button
              disabled={isMutating}
              onClick={() => handleMark(AttendanceStatus.Taken)}
              className="flex-1 bg-secondary text-secondary-foreground font-semibold py-3 rounded-xl transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Mark Taken
            </button>
            <button
              disabled={isMutating}
              onClick={() => handleMark(AttendanceStatus.Skipped)}
              className="flex-1 border border-border text-white hover:bg-surface-low font-semibold py-3 rounded-xl transition-all duration-200"
            >
              Skip Meal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            {status === AttendanceStatus.Taken ? (
              <span className="flex items-center gap-1.5 text-secondary font-semibold bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
                <CheckCircle className="h-4 w-4" /> Taken
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-destructive font-semibold bg-destructive/10 px-4 py-2 rounded-full border border-destructive/20">
                <XCircle className="h-4 w-4" /> Skipped
              </span>
            )}
            <button
              onClick={handleEdit}
              disabled={isMutating}
              className="p-2 border border-border hover:bg-surface-low rounded-full text-muted-foreground hover:text-white transition-colors duration-200"
              title="Edit today's attendance"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
