// Human-readable timezone options. We store IANA zone ids (e.g. "Africa/Lagos")
// as the value — Python's zoneinfo (used server-side) understands these directly,
// so no GMT±N remapping is needed on submit. Labels show the city, country, and
// the live GMT offset so teachers can recognise their own zone at a glance.

export interface TimezoneOption {
  value: string;
  city: string;
  country: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "UTC", city: "UTC", country: "Coordinated Universal Time" },
  // Africa
  { value: "Africa/Casablanca", city: "Casablanca", country: "Morocco" },
  { value: "Africa/Dakar", city: "Dakar", country: "Senegal" },
  { value: "Africa/Accra", city: "Accra", country: "Ghana" },
  { value: "Africa/Lagos", city: "Lagos", country: "Nigeria" },
  { value: "Africa/Kinshasa", city: "Kinshasa", country: "DR Congo" },
  { value: "Africa/Cairo", city: "Cairo", country: "Egypt" },
  { value: "Africa/Johannesburg", city: "Johannesburg", country: "South Africa" },
  { value: "Africa/Harare", city: "Harare", country: "Zimbabwe" },
  { value: "Africa/Lusaka", city: "Lusaka", country: "Zambia" },
  { value: "Africa/Nairobi", city: "Nairobi", country: "Kenya" },
  { value: "Africa/Kampala", city: "Kampala", country: "Uganda" },
  { value: "Africa/Kigali", city: "Kigali", country: "Rwanda" },
  { value: "Africa/Dar_es_Salaam", city: "Dar es Salaam", country: "Tanzania" },
  { value: "Africa/Addis_Ababa", city: "Addis Ababa", country: "Ethiopia" },
  // Europe
  { value: "Europe/London", city: "London", country: "United Kingdom" },
  { value: "Europe/Paris", city: "Paris", country: "France / Central Europe" },
  { value: "Europe/Athens", city: "Athens", country: "Greece / Eastern Europe" },
  // Americas
  { value: "America/New_York", city: "New York", country: "USA — Eastern" },
  { value: "America/Chicago", city: "Chicago", country: "USA — Central" },
  { value: "America/Denver", city: "Denver", country: "USA — Mountain" },
  { value: "America/Los_Angeles", city: "Los Angeles", country: "USA — Pacific" },
  { value: "America/Toronto", city: "Toronto", country: "Canada" },
  { value: "America/Sao_Paulo", city: "São Paulo", country: "Brazil" },
  // Middle East / Asia / Oceania
  { value: "Asia/Dubai", city: "Dubai", country: "UAE" },
  { value: "Asia/Kolkata", city: "Mumbai", country: "India" },
  { value: "Asia/Shanghai", city: "Beijing", country: "China" },
  { value: "Asia/Tokyo", city: "Tokyo", country: "Japan" },
  { value: "Australia/Sydney", city: "Sydney", country: "Australia" },
];

/** Live "GMT+1"-style offset for a zone, or "" if the runtime can't resolve it. */
export function timezoneOffsetLabel(zone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

export function formatTimezoneLabel(opt: TimezoneOption): string {
  const offset = timezoneOffsetLabel(opt.value);
  return `${opt.city}, ${opt.country}${offset ? ` · ${offset}` : ""}`;
}

/** The browser's zone if we list it, otherwise UTC. */
export function detectTimezone(): string {
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_OPTIONS.some((o) => o.value === detected) ? detected : "UTC";
  } catch {
    return "UTC";
  }
}
