import { useState, useEffect } from "react";
import type { User } from "@/types";

/** "Mwansa Greenwell Phiri" → "MG". Empty names fall back to a person glyph. */
function initialsFor(fullName?: string): string {
  return (fullName || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * The user's photo wherever one is needed — header, dashboards, onboarding.
 *
 * Falls back to initials when there's no photo, and again if the photo URL
 * fails to load, so a broken or expired image never leaves an empty hole.
 */
export function UserAvatar({
  user,
  size = 36,
  className = "",
  photoUrl,
  name,
}: {
  user?: User | null;
  size?: number;
  className?: string;
  /** Overrides the user's stored photo — used for live previews. */
  photoUrl?: string;
  /** Overrides the user's name for the initials fallback. */
  name?: string;
}) {
  const src = photoUrl ?? user?.avatar_url ?? "";
  const initials = initialsFor(name ?? user?.full_name);
  const [failed, setFailed] = useState(false);

  // A new src deserves a fresh attempt, even if the previous one failed.
  useEffect(() => setFailed(false), [src]);

  const box = { width: size, height: size };

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name ?? user?.full_name ?? "Profile photo"}
        style={box}
        onError={() => setFailed(true)}
        className={`rounded-full object-cover bg-[#A0B76F] ${className}`}
      />
    );
  }

  return (
    <div
      style={{ ...box, fontSize: Math.max(11, Math.round(size * 0.36)) }}
      aria-label={name ?? user?.full_name ?? "Profile"}
      className={`rounded-full bg-[#A0B76F] text-[#1A3A35] font-bold flex items-center justify-center select-none ${className}`}
    >
      {initials || "?"}
    </div>
  );
}
