import type { Availability } from "@/types";

const AVATAR_COLORS = ["#1A3A35", "#C4622D", "#2D5A45", "#7A2E1A", "#E8922A", "#3D6B5C"];

export function avatarInitial(fullName: string): string {
  return fullName.trim().charAt(0).toUpperCase() || "?";
}

export function avatarColor(fullName: string): string {
  let hash = 0;
  for (let i = 0; i < fullName.length; i++) {
    hash = (hash * 31 + fullName.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export type AvailabilityStatus = "today" | "tomorrow" | "week" | "none";

export function availabilityStatus(slots: Availability[] | undefined): {
  status: AvailabilityStatus;
  label: string;
} {
  const active = (slots ?? []).filter((s) => s.is_active);
  if (active.length === 0) return { status: "none", label: "No availability set" };

  const todayDow = (new Date().getDay() + 6) % 7; // JS: 0=Sunday -> convert to 0=Monday
  const daysUntil = (day: number) => (day - todayDow + 7) % 7;
  const soonest = Math.min(...active.map((s) => daysUntil(s.day_of_week)));

  if (soonest === 0) return { status: "today", label: "Available today" };
  if (soonest === 1) return { status: "tomorrow", label: "Available tomorrow" };
  return { status: "week", label: "Available this week" };
}
