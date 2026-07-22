"use client";

import { useState, useEffect } from "react";
import { submitFeedback, getUserFeedback } from "@/actions/feedback";
import { FeedbackStatus } from "@prisma/client";
import { format } from "date-fns";
import { MessageSquare, Send, CheckCircle2, Clock } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";

interface FeedbackRecord {
  id: string;
  userId: string;
  message: string;
  status: FeedbackStatus;
  createdAt: Date;
}

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await getUserFeedback();
      setFeedbacks(data.map((f) => ({ ...f, createdAt: new Date(f.createdAt) })));
    } catch (error) {
      console.error("Failed to load feedback logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || message.trim().length === 0) return;

    setIsSubmitting(true);
    try {
      await submitFeedback(message);
      setMessage("");
      await fetchFeedback();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-white">Send Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Submit feedback or report issues regarding the mess service.
        </p>
      </section>

      {/* Form Card */}
      <section className="premium-border card-bg rounded-xl p-8 shadow-xl flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind or report any issues..."
              rows={5}
              disabled={isSubmitting}
              className="w-full bg-surface-low border border-border rounded-xl p-4 text-sm text-white placeholder-muted-foreground focus:ring-1 focus:ring-secondary focus:border-secondary outline-none resize-none transition-all"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="bg-white text-background hover:opacity-90 transition-all px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </section>

      {/* Previous Feedbacks List */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Feedback History</h2>
          <p className="text-xs text-muted-foreground mt-1">Track status of your previous submissions.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-24 w-full bg-card animate-pulse rounded-xl border border-border" />
            <div className="h-24 w-full bg-card animate-pulse rounded-xl border border-border" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="premium-border card-bg rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-white mt-2">No feedback submitted yet</p>
            <p className="text-xs text-muted-foreground">Your feedback logs will appear here once submitted.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {feedbacks.map((item) => (
              <div
                key={item.id}
                className="premium-border card-bg rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="flex-1">
                  <p className="text-sm text-white leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-muted-foreground font-mono block mt-2">
                    Submitted on {format(item.createdAt, "PPP 'at' p")}
                  </span>
                </div>
                <div className="shrink-0 flex items-center">
                  {item.status === FeedbackStatus.Resolved ? (
                    <span className="flex items-center gap-1.5 text-xs text-secondary font-semibold bg-secondary/10 border border-secondary/20 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold bg-surface-low border border-border px-3 py-1.5 rounded-full">
                      <Clock className="h-3.5 w-3.5" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ad Placeholder */}
      <AdPlaceholder />
    </div>
  );
}
