import type { Availability } from "@/types";

export interface SlotDay {
  key: string;
  label: string;
  slots: { startISO: string; endISO: string; label: string }[];
}

/** Milliseconds `tz` is offset from UTC at the given instant. */
function tzOffsetMs(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUTC - date.getTime();
}

/** Absolute instant for a wall-clock time (y, mo0-indexed, d, h, mi) in `tz`. */
function zonedWallToUtc(y: number, mo0: number, d: number, h: number, mi: number, tz: string): Date {
  const guess = Date.UTC(y, mo0, d, h, mi, 0);
  return new Date(guess - tzOffsetMs(new Date(guess), tz));
}

/** The calendar Y/M/D of `date` as seen in `tz`. */
function ymdInTz(date: Date, tz: string): { y: number; mo: number; d: number } {
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
  return { y: +p.year, mo: +p.month, d: +p.day };
}

/**
 * Turn a teacher's recurring weekly availability into concrete, bookable
 * one-hour slots for the next two weeks. Absolute instants are computed from
 * the teacher's OWN timezone (so bookings are always correct), then every slot
 * is *displayed* in `viewerTz` — that's what makes "show all times in my
 * timezone" work no matter which timezone the viewer picks.
 */
export function generateSlots(availability: Availability[], viewerTz: string): SlotDay[] {
  const active = availability.filter((a) => a.is_active);
  if (active.length === 0) return [];

  const now = Date.now();
  const timeFmt = new Intl.DateTimeFormat([], { timeZone: viewerTz, hour: "numeric", minute: "2-digit" });
  const dateFmt = new Intl.DateTimeFormat([], { timeZone: viewerTz, weekday: "short", month: "short", day: "numeric" });
  const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: viewerTz, year: "numeric", month: "2-digit", day: "2-digit" });

  const byKey = new Map<string, { label: string; earliest: number; seen: Set<string>; slots: { startISO: string; endISO: string; label: string; ts: number }[] }>();

  for (const a of active) {
    const tz = a.timezone || "UTC";
    const base = ymdInTz(new Date(now), tz);
    const [sh, sm] = a.start_time.split(":").map(Number);
    const [eh, em] = a.end_time.split(":").map(Number);

    for (let off = 0; off < 14; off++) {
      const cand = new Date(Date.UTC(base.y, base.mo - 1, base.d + off));
      const weekdayMon0 = (cand.getUTCDay() + 6) % 7; // Sun=0 → Mon=0
      if (weekdayMon0 !== a.day_of_week) continue;

      const windowEnd = zonedWallToUtc(cand.getUTCFullYear(), cand.getUTCMonth(), cand.getUTCDate(), eh, em, tz).getTime();
      let cursor = zonedWallToUtc(cand.getUTCFullYear(), cand.getUTCMonth(), cand.getUTCDate(), sh, sm, tz).getTime();

      while (cursor < windowEnd) {
        const end = Math.min(cursor + 60 * 60 * 1000, windowEnd);
        if (cursor > now && end - cursor >= 30 * 60 * 1000) {
          const startDate = new Date(cursor);
          const key = keyFmt.format(startDate);
          const startISO = startDate.toISOString();
          let bucket = byKey.get(key);
          if (!bucket) {
            bucket = { label: dateFmt.format(startDate), earliest: cursor, seen: new Set(), slots: [] };
            byKey.set(key, bucket);
          }
          if (!bucket.seen.has(startISO)) {
            bucket.seen.add(startISO);
            bucket.earliest = Math.min(bucket.earliest, cursor);
            bucket.slots.push({ startISO, endISO: new Date(end).toISOString(), label: timeFmt.format(startDate), ts: cursor });
          }
        }
        cursor += 60 * 60 * 1000;
      }
    }
  }

  return [...byKey.values()]
    .sort((a, b) => a.earliest - b.earliest)
    .map((bucket) => ({
      key: bucket.slots[0]?.startISO ?? String(bucket.earliest),
      label: bucket.label,
      slots: bucket.slots.sort((x, y) => x.ts - y.ts).map(({ ts, ...s }) => { void ts; return s; }),
    }));
}
