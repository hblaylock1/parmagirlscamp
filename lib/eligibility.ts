import { EVENT } from "./event";

export const MAX_BIRTHDATE = EVENT.maxBirthdate;
export const HAS_BIRTHDATE_CUTOFF = MAX_BIRTHDATE !== null;

export function isBirthdateAllowed(birthdate: string): boolean {
  if (!birthdate) return false;
  if (MAX_BIRTHDATE === null) return true;
  return birthdate <= MAX_BIRTHDATE;
}

function formatCutoff(): string {
  if (!MAX_BIRTHDATE) return "";
  const [y, m, d] = MAX_BIRTHDATE.split("-").map(Number);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

export const BIRTHDATE_ERROR = HAS_BIRTHDATE_CUTOFF
  ? `Participant must have been born on or before ${formatCutoff()}.`
  : "Invalid birthdate.";

export const BIRTHDATE_HELP = HAS_BIRTHDATE_CUTOFF
  ? `Must be born on or before ${formatCutoff()}.`
  : undefined;
