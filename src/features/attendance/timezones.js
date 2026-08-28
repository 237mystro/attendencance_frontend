/**
 * Timezones offered for attendance rules. Deliberately a short curated list
 * rather than the full IANA database — these cover the regions the platform
 * serves, and a 400-entry dropdown helps nobody.
 */
export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (no offset)' },
  { value: 'Africa/Douala', label: 'Africa/Douala (UTC+1 — Cameroon)' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos (UTC+1 — Nigeria)' },
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (UTC+3 — Kenya / East Africa)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (UTC+2 — South Africa)' },
  { value: 'Africa/Accra', label: 'Africa/Accra (UTC+0 — Ghana)' },
  { value: 'Africa/Abidjan', label: "Africa/Abidjan (UTC+0 — Côte d'Ivoire)" },
  { value: 'Africa/Dakar', label: 'Africa/Dakar (UTC+0 — Senegal)' },
  { value: 'Africa/Casablanca', label: 'Africa/Casablanca (UTC+1 — Morocco)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1/+2)' },
  { value: 'America/New_York', label: 'America/New_York (UTC−5/−4)' },
  { value: 'America/Chicago', label: 'America/Chicago (UTC−6/−5)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC−8/−7)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+4)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (UTC+5:30 — India)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
];
