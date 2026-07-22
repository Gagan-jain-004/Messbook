"use client";

import { useState } from "react";
import { updateFeedbackStatus } from "@/actions/admin";
import { FeedbackStatus } from "@prisma/client";
import { format } from "date-fns";
import { CheckCircle2, Clock, Check, RefreshCw } from "lucide-react";

interface FeedbackItem {
  id: string;
  userId: string;
  message: string;
  status: FeedbackStatus;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
}

export default function FeedbackTable({ initialFeedback }: { initialFeedback: FeedbackItem[] }) {
  const [list, setList] = useState<FeedbackItem[]>(initialFeedback);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: FeedbackStatus) => {
    setUpdatingId(id);
    const nextStatus =
      currentStatus === FeedbackStatus.Pending ? FeedbackStatus.Resolved : FeedbackStatus.Pending;

    try {
      await updateFeedbackStatus(id, nextStatus);
      setList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      );
    } catch (error) {
      console.error("Failed to toggle feedback status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-low/50 border-b border-border">
            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {list.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                No feedback reports submitted yet.
              </td>
            </tr>
          ) : (
            list.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-surface-low/20 transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{item.user.name}</span>
                    <span className="text-xs text-muted-foreground">{item.user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-foreground/90 max-w-sm whitespace-pre-wrap leading-relaxed">
                  {item.message}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(item.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4">
                  {item.status === FeedbackStatus.Resolved ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-secondary font-semibold bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold bg-surface-low border border-border px-2.5 py-1 rounded-full">
                      <Clock className="h-3.5 w-3.5" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    disabled={updatingId === item.id}
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                      item.status === FeedbackStatus.Pending
                        ? "bg-secondary text-secondary-foreground border-secondary/30 hover:opacity-90"
                        : "border-border hover:border-white text-muted-foreground hover:text-white"
                    } disabled:opacity-40`}
                  >
                    {updatingId === item.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : item.status === FeedbackStatus.Pending ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Resolve
                      </>
                    ) : (
                      "Mark Pending"
                    )}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
