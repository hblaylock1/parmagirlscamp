// Re-exports kept so existing imports (`@/lib/wards`) keep working.
// All event-level config lives in lib/event.ts now.
export { EVENT } from "./event";

import { EVENT } from "./event";
export const WARDS = EVENT.wards;

export type Ward = (typeof EVENT.wards)[number];
