/**
 * Date and time formatting utilities for Indian Standard Time (IST / Asia/Kolkata).
 */

const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Formats a Date or date string to Indian Standard Time (IST) with both date and time.
 * Example: "Sep 15, 2026, 10:39:41 PM"
 */
export function formatToIST(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";

    const defaultOptions: Intl.DateTimeFormatOptions =
      options?.dateStyle || options?.timeStyle
        ? {}
        : {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          };

    return new Intl.DateTimeFormat("en-US", {
      timeZone: IST_TIMEZONE,
      ...defaultOptions,
      ...options,
    }).format(d);
  } catch (error) {
    console.error("Error formatting IST date:", error);
    return "-";
  }
}

/**
 * Formats a Date or date string to Indian Standard Time (IST) for date-only displays.
 * Example: "Sep 15, 2026" or "Tuesday, September 15, 2026"
 */
export function formatToISTDate(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";

    const defaultOptions: Intl.DateTimeFormatOptions =
      options?.dateStyle || options?.timeStyle
        ? {}
        : {
            year: "numeric",
            month: "short",
            day: "numeric",
          };

    return new Intl.DateTimeFormat("en-US", {
      timeZone: IST_TIMEZONE,
      ...defaultOptions,
      ...options,
    }).format(d);
  } catch (error) {
    console.error("Error formatting IST date:", error);
    return "-";
  }
}

/**
 * Formats a Date or date string to Indian Standard Time (IST) for time-only displays.
 * Example: "10:39:41 PM"
 */
export function formatToISTTime(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";

    const defaultOptions: Intl.DateTimeFormatOptions =
      options?.dateStyle || options?.timeStyle
        ? {}
        : {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          };

    return new Intl.DateTimeFormat("en-US", {
      timeZone: IST_TIMEZONE,
      ...defaultOptions,
      ...options,
    }).format(d);
  } catch (error) {
    console.error("Error formatting IST time:", error);
    return "-";
  }
}
