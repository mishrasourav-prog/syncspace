const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" },
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

/** Formats a date as a relative time string, e.g. "3 hours ago" or "in 2 days". */
export function formatRelativeTime(date: string | Date): string {
  let duration = (new Date(date).getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeTimeFormatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return relativeTimeFormatter.format(Math.round(duration), "years");
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** Formats a date as "Jul 17, 2026". */
export function formatDate(date: string | Date): string {
  return dateFormatter.format(new Date(date));
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** Formats a date as "Jul 17, 2026, 3:45 PM". */
export function formatDateTime(date: string | Date): string {
  return dateTimeFormatter.format(new Date(date));
}
