"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Info, AlertTriangle, AlertCircle, Clock, X, CheckCheck } from "lucide-react";
import { getActiveNotifications } from "@/actions/notification";
import { formatToIST } from "@/lib/date";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  expiresAt: Date | string | null;
  createdAt: Date | string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getActiveNotifications();
      setNotifications(
        data.map((item) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          type: item.type,
          expiresAt: item.expiresAt,
          createdAt: item.createdAt,
        }))
      );

      // Check against localStorage for last read timestamp
      if (typeof window !== "undefined") {
        const lastRead = localStorage.getItem("messbook_last_read_notification");
        if (data.length > 0) {
          if (!lastRead) {
            setHasUnread(true);
          } else {
            const latestCreated = new Date(data[0].createdAt).getTime();
            setHasUnread(latestCreated > Number(lastRead));
          }
        } else {
          setHasUnread(false);
        }
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds to automatically clear expired notifications or fetch new ones
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      // Mark as read
      setHasUnread(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("messbook_last_read_notification", Date.now().toString());
      }
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "alert":
        return {
          icon: AlertCircle,
          border: "border-destructive/30",
          bg: "bg-destructive/10",
          text: "text-destructive",
          badge: "bg-destructive/20 text-destructive",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          border: "border-amber-500/30",
          bg: "bg-amber-500/10",
          text: "text-amber-400",
          badge: "bg-amber-500/20 text-amber-400",
        };
      default:
        return {
          icon: Info,
          border: "border-blue-500/30",
          bg: "bg-blue-500/10",
          text: "text-blue-400",
          badge: "bg-blue-500/20 text-blue-400",
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
          isOpen
            ? "bg-white text-black border-white shadow-md"
            : "border-border/60 bg-card/60 hover:bg-surface-low text-muted-foreground hover:text-white"
        }`}
      >
        <Bell className="h-4.5 w-4.5" />

        {/* Unread dot / badge */}
        {hasUnread && notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive text-[9px] font-bold text-white items-center justify-center">
              {notifications.length}
            </span>
          </span>
        )}

        {!hasUnread && notifications.length > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-secondary" />
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface-low/50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-secondary" />
              <h3 className="text-sm font-bold text-white">Announcements</h3>
              {notifications.length > 0 && (
                <span className="text-[10px] font-mono font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full border border-secondary/20">
                  {notifications.length} active
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-white p-1 rounded-lg hover:bg-surface-low transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* List Content */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border/40 p-2 space-y-2">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-surface-low text-muted-foreground">
                  <CheckCheck className="h-5 w-5 text-secondary" />
                </div>
                <p className="text-sm font-semibold text-white">No active announcements</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  All mess updates, schedule notices, and alerts will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const style = getTypeStyle(n.type);
                const IconComponent = style.icon;

                return (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border ${style.border} ${style.bg} flex flex-col gap-2 transition-all`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`h-4 w-4 shrink-0 ${style.text}`} />
                        <h4 className="text-xs font-bold text-white line-clamp-1">{n.title}</h4>
                      </div>
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${style.badge}`}
                      >
                        {n.type}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground border-t border-border/20">
                      <Clock className="h-3 w-3 text-muted-foreground/80" />
                      <span>Posted: {formatToIST(n.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
