"use client";

import { useState } from "react";
import { triggerManualAlerts } from "@/actions/admin";
import { Send, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function SystemActions() {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; sentCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendReminders = async () => {
    setIsSending(true);
    setResult(null);
    setError(null);
    try {
      const data = await triggerManualAlerts();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to dispatch reminders. Please check Server environment configurations.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="premium-border card-bg rounded-xl p-6 shadow-xl flex flex-col gap-4">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Send className="h-4 w-4 text-secondary" />
          System Reminders
        </h3>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Manually dispatch daily check-in email alerts to all registered students who have not
          yet logged their mess attendance for today.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        {result && (
          <div className="flex items-center gap-2 text-xs text-secondary bg-secondary/10 border border-secondary/20 rounded-xl p-3">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              {result.sentCount === 0
                ? "All active students have already marked their attendance for today!"
                : `Successfully sent reminder emails to ${result.sentCount} student(s).`}
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <button
            onClick={handleSendReminders}
            disabled={isSending}
            className="bg-white text-background hover:opacity-90 font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Sending Emails...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send Manual Alert Emails
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
