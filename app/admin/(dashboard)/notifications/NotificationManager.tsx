"use client";

import { useState } from "react";
import {
  Bell,
  Send,
  Trash2,
  Edit3,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
  X,
  Loader2,
  PlusCircle,
} from "lucide-react";
import {
  createNotification,
  updateNotification,
  deleteNotification,
} from "@/actions/notification";
import { formatToIST } from "@/lib/date";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  expiresAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  isExpired: boolean;
}

interface NotificationManagerProps {
  initialNotifications: AdminNotification[];
}

export default function NotificationManager({ initialNotifications }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "expired">("all");

  // Create Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [hasExpiry, setHasExpiry] = useState(true);
  const [expiryDateTime, setExpiryDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<AdminNotification | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editType, setEditType] = useState("info");
  const [editHasExpiry, setEditHasExpiry] = useState(false);
  const [editExpiryDateTime, setEditExpiryDateTime] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper to format Date to local ISO string for datetime-local input
  const getTodayAtHour = (hour: number, minute: number = 0) => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    // If the time already passed today, set for tomorrow
    if (d.getTime() < Date.now()) {
      d.setDate(d.getDate() + 1);
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  const setPresetExpiry = (preset: "8pm" | "tonight" | "tomorrow" | "2hours", isEdit: boolean = false) => {
    let value = "";
    if (preset === "8pm") {
      value = getTodayAtHour(20, 0);
    } else if (preset === "tonight") {
      value = getTodayAtHour(23, 59);
    } else if (preset === "tomorrow") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      const pad = (n: number) => String(n).padStart(2, "0");
      value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T10:00`;
    } else if (preset === "2hours") {
      const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    if (isEdit) {
      setEditHasExpiry(true);
      setEditExpiryDateTime(value);
    } else {
      setHasExpiry(true);
      setExpiryDateTime(value);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFormError("Please enter both title and message.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormSuccess(false);

    try {
      const expiry = hasExpiry && expiryDateTime ? new Date(expiryDateTime).toISOString() : null;
      const res = await createNotification({
        title,
        message,
        type,
        expiresAt: expiry,
      });

      if (res.success && res.notification) {
        const newItem: AdminNotification = {
          ...res.notification,
          isExpired: res.notification.expiresAt ? new Date(res.notification.expiresAt) <= new Date() : false,
        };
        setNotifications((prev) => [newItem, ...prev]);
        setTitle("");
        setMessage("");
        setType("info");
        setExpiryDateTime("");
        setFormSuccess(true);
        setTimeout(() => setFormSuccess(false), 4000);
      } else {
        setFormError(res.error || "Failed to create notification");
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (n: AdminNotification) => {
    setEditingItem(n);
    setEditTitle(n.title);
    setEditMessage(n.message);
    setEditType(n.type);
    if (n.expiresAt) {
      setEditHasExpiry(true);
      const d = new Date(n.expiresAt);
      const pad = (num: number) => String(num).padStart(2, "0");
      const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setEditExpiryDateTime(localStr);
    } else {
      setEditHasExpiry(false);
      setEditExpiryDateTime("");
    }
    setEditError("");
  };

  const handleUpdateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editTitle.trim() || !editMessage.trim()) {
      setEditError("Title and message cannot be empty.");
      return;
    }

    setIsUpdating(true);
    setEditError("");

    try {
      const expiry = editHasExpiry && editExpiryDateTime ? new Date(editExpiryDateTime).toISOString() : null;
      const res = await updateNotification(editingItem.id, {
        title: editTitle,
        message: editMessage,
        type: editType,
        expiresAt: expiry,
      });

      if (res.success && res.notification) {
        const updatedItem: AdminNotification = {
          ...res.notification,
          isExpired: res.notification.expiresAt ? new Date(res.notification.expiresAt) <= new Date() : false,
        };
        setNotifications((prev) => prev.map((item) => (item.id === editingItem.id ? updatedItem : item)));
        setEditingItem(null);
      } else {
        setEditError(res.error || "Failed to update notification");
      }
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Failed to update notification");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification? It will be removed immediately.")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteNotification(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } else {
        alert("Failed to delete notification");
      }
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error deleting notification");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "active") return !n.isExpired;
    if (activeTab === "expired") return n.isExpired;
    return true;
  });

  const activeCount = notifications.filter((n) => !n.isExpired).length;
  const expiredCount = notifications.filter((n) => n.isExpired).length;

  return (
    <div className="flex flex-col gap-10">
      {/* Create New Notification Form */}
      <section className="premium-border card-bg rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Broadcast New Notification</h2>
              <p className="text-xs text-muted-foreground">
                Publish live notices and reminders for students on their dashboard.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-xs font-mono font-medium text-muted-foreground bg-surface-low px-3 py-1.5 rounded-lg border border-border">
            Live on student dashboard
          </span>
        </div>

        <form onSubmit={handleCreateNotification} className="flex flex-col gap-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Notification published successfully! Students can now see it.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Title & Message */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Notification Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mess Closing Early Today / Special Sunday Dinner"
                  className="w-full bg-surface-low border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Notification Message *
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Aaj mess 8:00 PM baje close ho jayega. Kripya samay se apna dinner collect kar lein."
                  className="w-full bg-surface-low border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all resize-none"
                  required
                />
              </div>
            </div>

            {/* Type & Expiry Controls */}
            <div className="flex flex-col gap-4 bg-surface-low/50 p-5 rounded-xl border border-border/60">
              {/* Type / Priority */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Notification Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("info")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      type === "info"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                        : "border-border text-muted-foreground hover:bg-surface-low"
                    }`}
                  >
                    <Info className="h-3.5 w-3.5" />
                    Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("warning")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      type === "warning"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : "border-border text-muted-foreground hover:bg-surface-low"
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Notice
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("alert")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      type === "alert"
                        ? "bg-destructive/20 text-destructive border-destructive/40"
                        : "border-border text-muted-foreground hover:bg-surface-low"
                    }`}
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    Alert
                  </button>
                </div>
              </div>

              {/* Expiry Option */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-secondary" />
                    Expires At (Auto Disappear)
                  </label>
                  <input
                    type="checkbox"
                    id="hasExpiryCheckbox"
                    checked={hasExpiry}
                    onChange={(e) => setHasExpiry(e.target.checked)}
                    className="accent-secondary h-4 w-4 rounded cursor-pointer"
                  />
                </div>

                {hasExpiry ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="datetime-local"
                      value={expiryDateTime}
                      onChange={(e) => setExpiryDateTime(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-secondary outline-none cursor-pointer"
                      required={hasExpiry}
                    />

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => setPresetExpiry("8pm")}
                        className="text-[10px] bg-card hover:bg-surface-low border border-border px-2 py-1 rounded text-zinc-300 transition-colors"
                      >
                        Today 8:00 PM
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetExpiry("tonight")}
                        className="text-[10px] bg-card hover:bg-surface-low border border-border px-2 py-1 rounded text-zinc-300 transition-colors"
                      >
                        Tonight 11:59 PM
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetExpiry("tomorrow")}
                        className="text-[10px] bg-card hover:bg-surface-low border border-border px-2 py-1 rounded text-zinc-300 transition-colors"
                      >
                        Tomorrow 10 AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetExpiry("2hours")}
                        className="text-[10px] bg-card hover:bg-surface-low border border-border px-2 py-1 rounded text-zinc-300 transition-colors"
                      >
                        In 2 Hours
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">
                    Notification will stay live indefinitely until manually deleted.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !message.trim()}
              className="bg-white text-black hover:opacity-90 transition-all px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-40 flex items-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Notification Now
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Notifications List Section */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-secondary" />
              Notification History & Management
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Edit or delete previous notifications. Expired notifications automatically disappear from users.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-white text-black shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "active"
                  ? "bg-secondary text-black shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab("expired")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "expired"
                  ? "bg-white text-black shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Expired ({expiredCount})
            </button>
          </div>
        </div>

        {/* Notifications Grid / List */}
        {filteredNotifications.length === 0 ? (
          <div className="premium-border card-bg rounded-2xl p-12 text-center flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-surface-low text-muted-foreground">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">No notifications found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {activeTab === "active"
                ? "There are no currently active notifications. Publish one above to notify students."
                : activeTab === "expired"
                ? "No expired notifications in history."
                : "You have not sent any website notifications yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredNotifications.map((item) => {
              const isLive = !item.isExpired;

              return (
                <div
                  key={item.id}
                  className={`premium-border card-bg rounded-xl p-5 shadow-lg flex flex-col gap-3 transition-all ${
                    isLive ? "border-secondary/30 bg-secondary/[0.02]" : "opacity-80"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {isLive ? (
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                        </span>
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600"></span>
                      )}

                      <h3 className="text-base font-bold text-white line-clamp-1">{item.title}</h3>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          item.type === "alert"
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : item.type === "warning"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {item.type}
                      </span>

                      {isLive ? (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Active & Visible
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                          Expired (Hidden from user)
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-lg bg-surface-low hover:bg-surface-low/80 text-muted-foreground hover:text-white transition-colors border border-border flex items-center gap-1.5 text-xs font-semibold"
                        title="Edit notification"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-secondary" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors border border-destructive/20 flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{deletingId === item.id ? "Deleting..." : "Delete"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Message body */}
                  <p className="text-sm text-zinc-300 leading-relaxed bg-surface-low/30 p-3.5 rounded-lg border border-border/40 whitespace-pre-wrap">
                    {item.message}
                  </p>

                  {/* Metadata footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <span>Posted: {formatToIST(item.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-secondary" />
                      {item.expiresAt ? (
                        <span>
                          {isLive ? "Expires at:" : "Expired on:"}{" "}
                          <strong className="text-white font-mono">{formatToIST(item.expiresAt)}</strong>
                        </span>
                      ) : (
                        <span className="text-zinc-400">No expiration (Permanent until removed)</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit Notification Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="premium-border card-bg rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-secondary" />
                Edit Notification
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-muted-foreground hover:text-white p-1 rounded-lg hover:bg-surface-low transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateNotification} className="flex flex-col gap-4">
              {editError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                  {editError}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-surface-low border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-secondary outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  rows={3}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="w-full bg-surface-low border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-secondary outline-none resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditType("info")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      editType === "info"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                        : "border-border text-muted-foreground hover:bg-surface-low"
                    }`}
                  >
                    <Info className="h-3.5 w-3.5" />
                    Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType("warning")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      editType === "warning"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : "border-border text-muted-foreground hover:bg-surface-low"
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Notice
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType("alert")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      editType === "alert"
                        ? "bg-destructive/20 text-destructive border-destructive/40"
                        : "border-border text-muted-foreground hover:bg-surface-low"
                    }`}
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    Alert
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-secondary" />
                    Expires At
                  </label>
                  <input
                    type="checkbox"
                    checked={editHasExpiry}
                    onChange={(e) => setEditHasExpiry(e.target.checked)}
                    className="accent-secondary h-4 w-4 rounded cursor-pointer"
                  />
                </div>

                {editHasExpiry && (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="datetime-local"
                      value={editExpiryDateTime}
                      onChange={(e) => setEditExpiryDateTime(e.target.value)}
                      className="w-full bg-surface-low border border-border rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-secondary outline-none cursor-pointer"
                    />

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPresetExpiry("8pm", true)}
                        className="text-[10px] bg-surface-low hover:bg-surface-low/80 border border-border px-2 py-1 rounded text-zinc-300"
                      >
                        Today 8 PM
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetExpiry("tonight", true)}
                        className="text-[10px] bg-surface-low hover:bg-surface-low/80 border border-border px-2 py-1 rounded text-zinc-300"
                      >
                        Tonight 11:59 PM
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetExpiry("tomorrow", true)}
                        className="text-[10px] bg-surface-low hover:bg-surface-low/80 border border-border px-2 py-1 rounded text-zinc-300"
                      >
                        Tomorrow 10 AM
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 border border-border hover:bg-surface-low text-white py-2.5 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-white text-black hover:opacity-90 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
