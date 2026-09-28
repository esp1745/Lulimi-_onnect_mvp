// Human-readable timezone options. We store IANA zone ids (e.g. "Africa/Lagos")
// as the value — Python's zoneinfo (used server-side) understands these
// directly. Each option names the cities people actually use to identify that
// zone, plus the live GMT offset, so teachers can recognise their own at a glance.

export interface TimezoneOption {
  value: string;
  /** Cities commonly used to identify this zone. */
  city: string;
  /** Region / country context. */
  country: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "UTC", city: "UTC", country: "Coordinated Universal Time" },

  // --- Africa ---
  { value: "Africa/Abidjan", city: "Abidjan · Accra · Bamako", country: "West Africa (GMT)" },
  { value: "Africa/Dakar", city: "Dakar · Banjul · Nouakchott", country: "Senegal & Gambia" },
  { value: "Africa/Monrovia", city: "Monrovia · Freetown · Conakry", country: "Liberia & Sierra Leone" },
  { value: "Africa/Casablanca", city: "Casablanca · Rabat · Marrakesh", country: "Morocco" },
  { value: "Africa/Lagos", city: "Lagos · Abuja · Kano", country: "Nigeria" },
  { value: "Africa/Douala", city: "Douala · Yaoundé · Libreville", country: "Cameroon & Gabon" },
  { value: "Africa/Kinshasa", city: "Kinshasa · Brazzaville · Luanda", country: "DR Congo & Angola" },
  { value: "Africa/Algiers", city: "Algiers · Tunis · Niamey", country: "North & West Africa" },
  { value: "Africa/Cairo", city: "Cairo · Alexandria · Giza", country: "Egypt" },
  { value: "Africa/Khartoum", city: "Khartoum · Juba", country: "Sudan & South Sudan" },
  { value: "Africa/Johannesburg", city: "Johannesburg · Cape Town · Pretoria", country: "South Africa" },
  { value: "Africa/Harare", city: "Harare · Bulawayo", country: "Zimbabwe" },
  { value: "Africa/Lusaka", city: "Lusaka · Kitwe · Livingstone", country: "Zambia" },
  { value: "Africa/Blantyre", city: "Blantyre · Lilongwe", country: "Malawi" },
  { value: "Africa/Maputo", city: "Maputo · Beira", country: "Mozambique" },
  { value: "Africa/Gaborone", city: "Gaborone · Francistown", country: "Botswana" },
  { value: "Africa/Windhoek", city: "Windhoek · Walvis Bay", country: "Namibia" },
  { value: "Africa/Maseru", city: "Maseru · Mbabane", country: "Lesotho & Eswatini" },
  { value: "Africa/Kigali", city: "Kigali · Bujumbura", country: "Rwanda & Burundi" },
  { value: "Africa/Nairobi", city: "Nairobi · Mombasa · Kisumu", country: "Kenya" },
  { value: "Africa/Kampala", city: "Kampala · Gulu · Entebbe", country: "Uganda" },
  { value: "Africa/Dar_es_Salaam", city: "Dar es Salaam · Dodoma · Zanzibar", country: "Tanzania" },
  { value: "Africa/Addis_Ababa", city: "Addis Ababa · Dire Dawa", country: "Ethiopia" },
  { value: "Africa/Mogadishu", city: "Mogadishu · Hargeisa · Djibouti", country: "Somalia & Djibouti" },
  { value: "Africa/Asmara", city: "Asmara · Massawa", country: "Eritrea" },
  { value: "Indian/Antananarivo", city: "Antananarivo · Toamasina", country: "Madagascar" },
  { value: "Indian/Mauritius", city: "Port Louis · Victoria", country: "Mauritius & Seychelles" },

  // --- Europe ---
  { value: "Europe/London", city: "London · Dublin · Lisbon", country: "UK & Ireland" },
  { value: "Europe/Paris", city: "Paris · Berlin · Madrid · Rome", country: "Central Europe" },
  { value: "Europe/Athens", city: "Athens · Helsinki · Bucharest", country: "Eastern Europe" },
  { value: "Europe/Moscow", city: "Moscow · Istanbul", country: "Russia & Türkiye" },

  // --- Americas ---
  { value: "America/St_Johns", city: "St. John's", country: "Canada — Newfoundland" },
  { value: "America/Halifax", city: "Halifax", country: "Canada — Atlantic" },
  { value: "America/New_York", city: "New York · Toronto · Atlanta · Miami", country: "USA/Canada — Eastern" },
  { value: "America/Chicago", city: "Chicago · Houston · Winnipeg", country: "USA/Canada — Central" },
  { value: "America/Denver", city: "Denver · Calgary · Phoenix", country: "USA/Canada — Mountain" },
  { value: "America/Los_Angeles", city: "Los Angeles · Vancouver · Seattle", country: "USA/Canada — Pacific" },
  { value: "America/Mexico_City", city: "Mexico City · Guadalajara", country: "Mexico" },
  { value: "America/Sao_Paulo", city: "São Paulo · Rio de Janeiro", country: "Brazil" },
  { value: "America/Bogota", city: "Bogotá · Lima · Quito", country: "Colombia, Peru & Ecuador" },
  { value: "America/Argentina/Buenos_Aires", city: "Buenos Aires · Montevideo", country: "Argentina & Uruguay" },

  // --- Middle East, Asia & Oceania ---
  { value: "Asia/Riyadh", city: "Riyadh · Kuwait City · Doha", country: "Saudi Arabia & Gulf" },
  { value: "Asia/Dubai", city: "Dubai · Abu Dhabi · Muscat", country: "UAE & Oman" },
  { value: "Asia/Jerusalem", city: "Jerusalem · Tel Aviv", country: "Israel" },
  { value: "Asia/Karachi", city: "Karachi · Lahore · Islamabad", country: "Pakistan" },
  { value: "Asia/Kolkata", city: "Mumbai · Delhi · Bengaluru", country: "India" },
  { value: "Asia/Dhaka", city: "Dhaka · Chittagong", country: "Bangladesh" },
  { value: "Asia/Bangkok", city: "Bangkok · Jakarta · Hanoi", country: "Southeast Asia" },
  { value: "Asia/Singapore", city: "Singapore · Kuala Lumpur · Manila", country: "Singapore & Malaysia" },
  { value: "Asia/Shanghai", city: "Beijing · Shanghai · Hong Kong", country: "China" },
  { value: "Asia/Tokyo", city: "Tokyo · Seoul · Osaka", country: "Japan & Korea" },
  { value: "Australia/Perth", city: "Perth", country: "Australia — Western" },
  { value: "Australia/Sydney", city: "Sydney · Melbourne · Brisbane", country: "Australia — Eastern" },
  { value: "Pacific/Auckland", city: "Auckland · Wellington", country: "New Zealand" },
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
  return `${opt.city} — ${opt.country}${offset ? ` · ${offset}` : ""}`;
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
