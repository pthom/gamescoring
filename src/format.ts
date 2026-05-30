/** "2h ago", "yesterday", "3 days ago" — relative to now. */
export function relativeTime(ts: number, now: number = Date.now()): string {
  const sec = Math.round((ts - now) / 1000); // negative = past
  const abs = Math.abs(sec);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (abs < 45) return "just now";
  if (abs < 3600) return rtf.format(Math.round(sec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(sec / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(sec / 86400), "day");
  if (abs < 86400 * 30) return rtf.format(Math.round(sec / (86400 * 7)), "week");
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
