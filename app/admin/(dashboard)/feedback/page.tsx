import { getAllFeedback } from "@/actions/admin";
import FeedbackTable from "./FeedbackTable";

export const revalidate = 0; // Disable caching to fetch fresh feedback

export default async function AdminFeedbackPage() {
  const feedbacks = await getAllFeedback();

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-white">Feedback Log</h1>
        <p className="text-sm text-muted-foreground">
          Manage and resolve user feedback and bug reports.
        </p>
      </section>

      {/* Table Container */}
      <section className="premium-border bg-card rounded-xl overflow-hidden shadow-xl flex flex-col">
        <FeedbackTable
          initialFeedback={feedbacks.map((f) => ({ ...f, createdAt: new Date(f.createdAt) }))}
        />
      </section>
    </div>
  );
}
