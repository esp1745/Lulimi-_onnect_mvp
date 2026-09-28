// Lightweight iCalendar (.ics) helpers and Google Calendar quick-add link builder.
// No backend or API keys required — these use the standard iCalendar file format
// and Google Calendar's public "quick add event" URL scheme.

export interface IcsEvent {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Formats a Date as a floating (no timezone) iCalendar date-time, e.g. 20260818T160000 */
export function toFloatingICSDate(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

/** Formats a Date as a UTC iCalendar date-time, e.g. 20260818T150000Z */
export function toUTCICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeICSText(text: string): string {
  return text.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

/** Builds a valid iCalendar (.ics) file string from a list of events. */
export function buildICS(events: IcsEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lulimi//Teacher Schedule//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${toFloatingICSDate(new Date())}`,
      `DTSTART:${toFloatingICSDate(e.start)}`,
      `DTEND:${toFloatingICSDate(e.end)}`,
      `SUMMARY:${escapeICSText(e.title)}`,
    );
    if (e.description) {
      lines.push(`DESCRIPTION:${escapeICSText(e.description)}`);
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Triggers a browser download of the given text content as a file. */
export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Builds a Google Calendar "quick add event" URL (no auth/API key required). */
export function buildGoogleCalendarUrl(title: string, start: Date, end: Date, details?: string): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toUTCICSDate(start)}/${toUTCICSDate(end)}`,
  });
  if (details) params.set("details", details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};
const MONTH_ABBR = Object.keys(MONTH_MAP);
const WEEKDAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Parses strings like "Mon 18 Aug" and "4:00 PM" into a Date for the given year. */
export function parseSessionDateTime(day: string, time: string, year: number): Date {
  const dayParts = day.trim().split(/\s+/);
  const dayNum = parseInt(dayParts[1], 10) || 1;
  const month = MONTH_MAP[dayParts[2]] ?? 0;

  const match = time.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
  let hour = match ? parseInt(match[1], 10) : 9;
  const minute = match ? parseInt(match[2], 10) : 0;
  const meridiem = match?.[3]?.toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  return new Date(year, month, dayNum, hour, minute);
}

/** Formats a Date back into a display string like "Tue 19 Aug". */
export function formatSessionDay(date: Date): string {
  return `${WEEKDAY_ABBR[date.getDay()]} ${date.getDate()} ${MONTH_ABBR[date.getMonth()]}`;
}

/** Formats a Date back into a display string like "11:00 AM". */
export function formatSessionTime(date: Date): string {
  let hour = date.getHours();
  const minute = date.getMinutes();
  const meridiem = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${pad(minute)} ${meridiem}`;
}

/** Formats a Date as a value suitable for an <input type="datetime-local">. */
export function toDateTimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Counts VEVENT blocks found in a raw .ics file's text content. */
export function countICSEvents(text: string): number {
  const matches = text.match(/BEGIN:VEVENT/g);
  return matches ? matches.length : 0;
}
