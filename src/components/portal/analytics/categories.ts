export type AnalyticsCategory =
  | "trening-total"
  | "fysisk"
  | "teknikk"
  | "golfslag"
  | "spill"
  | "sammenligning"
  | "strokes-gained"
  | "konkurranse"
  | "runder"
  | "testresultater"
  | "malsetninger"
  | "trackman";

export type CategoryMeta = {
  key: AnalyticsCategory;
  label: string;
  icon: string;
  tone?: "fys" | "tek" | "slag" | "spill" | "turn";
};

export const CATEGORIES: CategoryMeta[] = [
  { key: "trening-total", label: "Trening totalt", icon: "activity", tone: "fys" },
  { key: "fysisk", label: "Fysisk trening", icon: "dumbbell", tone: "fys" },
  { key: "teknikk", label: "Teknikk", icon: "target", tone: "tek" },
  { key: "golfslag", label: "Golfslag", icon: "circle-dot", tone: "slag" },
  { key: "spill", label: "Spill", icon: "flag", tone: "spill" },
  { key: "sammenligning", label: "Sammenligning", icon: "git-compare" },
  { key: "strokes-gained", label: "Strokes Gained", icon: "trending-up" },
  { key: "konkurranse", label: "Konkurranse / Turneringer", icon: "trophy", tone: "turn" },
  { key: "runder", label: "Runder", icon: "calendar-days", tone: "spill" },
  { key: "testresultater", label: "Testresultater", icon: "clipboard-check", tone: "tek" },
  { key: "malsetninger", label: "Målsetninger", icon: "bullseye" },
  { key: "trackman", label: "TrackMan", icon: "radar", tone: "slag" },
];
