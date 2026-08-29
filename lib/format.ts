// All user-facing timestamps should render in Mountain Time (Nyssa, OR
// sits in the Mountain Time Zone). America/Denver auto-handles MST/MDT.
const TIMEZONE = "America/Denver";

export function formatMountainDate(d: Date | string = new Date()): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    timeZone: TIMEZONE,
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMountainDateTime(d: Date | string = new Date()): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    timeZone: TIMEZONE,
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}
