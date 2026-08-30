// One-stop config for the event this app is hosting. To stand up a sibling
// app (e.g. a ward Girls Camp), copy the repo via "Use as template" on
// GitHub, edit this file, swap public/logo.png + public/qr-code.jpg + the
// church PDF if needed, and deploy. Nothing else should need touching.

export interface FeeConfig {
  amount: number;
  donationLine: string;
  showExampleImage: boolean;
}

export interface EventConfig {
  // Branding
  shortName: string; // shows in admin titles, e.g. "NYS Admin"
  title: string; // big heading, e.g. "Nyssa Youth Spectacular"
  metaDescription: string; // browser tab + share preview blurb

  // Date banner shown under the landing page heading
  dateBannerLabel: string; // e.g. "Save the date"
  dateLine: string; // e.g. "Saturday, June 6, 2026"
  timeLine: string; // e.g. "8:00 AM – 11:00 PM"

  // Optional flyer-style copy on the landing page. null hides each block.
  eyebrowLine: string | null; // small line above the title, e.g. who it's for
  tagline: string | null; // short line under the title
  reminders: { heading: string; body: string }[] | null; // "what to bring" callouts
  themeGraphic: { lines: string[]; reference: string } | null; // sunburst motto + scripture

  // Values stamped into the church PDF's form fields
  pdf: {
    event: string;
    datesOfEvent: string;
    description: string;
    stake: string;
    leader: string;
    leaderPhone: string;
    leaderEmail: string;
  };

  // null = no age cutoff. Otherwise YYYY-MM-DD; participants must be born on
  // or before this date.
  maxBirthdate: string | null;

  // Wards / branches the registration form offers. With a single entry the
  // ward dropdown is hidden everywhere and the value is used automatically.
  wards: readonly string[];

  // Registration fee callout. null hides the section entirely.
  fee: FeeConfig | null;

  // "stake": admin login takes a ward dropdown. ADMIN_PASSWORD authenticates
  // a stake-wide view; per-ward passwords (WARD_PASSWORD_<slug>) authenticate
  // a ward-scoped view.
  // "single": login is password-only. ADMIN_PASSWORD signs in to a single
  // unscoped admin view.
  authMode: "stake" | "single";
}

// =============================================================================
// >>> EDIT BELOW FOR EACH EVENT <<<
// =============================================================================
export const EVENT: EventConfig = {
  shortName: "Girls Camp",
  title: "Parma 1st Ward Girls Camp",
  metaDescription:
    "Register your young woman for the Parma 1st Ward Girls Camp — June 25–27, 2026.",

  dateBannerLabel: "Camp dates",
  dateLine: "Thursday – Saturday, June 25 – 27, 2026",
  timeLine: "",

  eyebrowLine: null,
  tagline: null,
  reminders: null,
  themeGraphic: null,

  pdf: {
    event: "Parma 1st Ward Girls Camp",
    datesOfEvent: "06/25/2026 – 06/27/2026",
    // TODO: confirm the leader contact details below — they are stamped into
    // each registrant's signed permission PDF and were not recoverable from
    // the live site.
    description: "Girls Camp for young women of the Parma 1st Ward.",
    stake: "Nyssa Stake",
    leader: "",
    leaderPhone: "",
    leaderEmail: "",
  },

  maxBirthdate: null,

  wards: ["Parma 1st Ward"],

  fee: {
    amount: 25,
    donationLine: "Local — Youth Camp Registration",
    showExampleImage: true,
  },

  authMode: "single",
};

export const SINGLE_WARD = EVENT.wards.length === 1 ? EVENT.wards[0] : null;
