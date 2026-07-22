"use client";

import { CheckCircle2, XCircle, Percent } from "lucide-react";

interface MonthlySummaryProps {
  taken: number;
  skipped: number;
  rate: number;
}

export default function MonthlySummary({ taken, skipped, rate }: MonthlySummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {/* Taken */}
      <div className="premium-border card-bg rounded-xl p-6 flex flex-col gap-2 shadow-lg">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Meals Taken
          </span>
          <CheckCircle2 className="text-secondary h-4 w-4" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold text-secondary font-mono">
            {taken}
          </span>
          <span className="text-xs text-muted-foreground">days</span>
        </div>
      </div>

      {/* Skipped */}
      <div className="premium-border card-bg rounded-xl p-6 flex flex-col gap-2 shadow-lg">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Meals Skipped
          </span>
          <XCircle className="text-destructive h-4 w-4" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold text-destructive font-mono">
            {skipped}
          </span>
          <span className="text-xs text-muted-foreground">days</span>
        </div>
      </div>

      {/* Rate */}
      <div className="premium-border card-bg rounded-xl p-6 flex flex-col gap-2 shadow-lg">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Attendance Rate
          </span>
          <Percent className="text-white h-4 w-4" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold text-white font-mono">
            {rate}%
          </span>
          <span className="text-xs text-muted-foreground">overall</span>
        </div>
        <div className="w-full bg-surface-low h-1.5 rounded-full mt-3 overflow-hidden border border-border">
          <div
            className="bg-secondary h-full rounded-full transition-all duration-500"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
