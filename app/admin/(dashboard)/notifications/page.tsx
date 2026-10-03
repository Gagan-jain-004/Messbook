import { getAdminNotifications } from "@/actions/notification";
import NotificationManager from "./NotificationManager";

export const revalidate = 0; // Fresh notifications on every load

export default async function AdminNotificationsPage() {
  const notifications = await getAdminNotifications();

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-white">Website Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Send announcements, emergency notices, or schedule updates to all users. Set expiry timelines so messages auto-vanish after due time.
        </p>
      </section>

      {/* Manager Container */}
      <NotificationManager
        initialNotifications={notifications.map((n) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt),
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : null,
        }))}
      />
    </div>
  );
}
