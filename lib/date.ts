/**
 * Date and time formatting utilities for Indian Standard Time (IST / Asia/Kolkata).
 */

const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Formats a Date or date string to Indian Standard Time (IST) with both date and time.
 * Example: "Sep 15, 2026, 10:39:41 PM"
 */
export function formatToIST(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    ...options,
  }).format(d);
}

/**
 * Formats a Date or date string to Indian Standard Time (IST) for date-only displays.
 * Example: "Sep 15, 2026" or "Tuesday, September 15, 2026"
 */
export function formatToISTDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(d);
}

/**
 * Formats a Date or date string to Indian Standard Time (IST) for time-only displays.
 * Example: "10:39:41 PM"
 */
export function formatToISTTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    ...options,
  }).format(d);
}
