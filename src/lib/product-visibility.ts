/**
 * Produktsynlighet — hvilke flater som er synlige i nav/CTA.
 *
 * Kilde for beslutninger: docs/.../PUNKT-KATALOG-KOMPLETT.md
 * Oppdater denne filen ETTER at Anders har satt synlighet (runde 2).
 *
 * "on"  = vis i meny / primære innganger
 * "off" = skjul (rute kan fortsatt finnes for direkte URL / admin)
 * "core" = alltid på (kan ikke skrus av uten kodeendring)
 *
 * Beslutning 2026-07-22 (Anders): ALT synlig som default.
 * Unntak: forbud (K.*) og rene panel-oppgaver (B.*) — ikke meny-toggles.
 */

export type Visibility = "core" | "on" | "off";

export type VisibilityArea = {
  id: string;
  label: string;
  /** Meny / produktflate */
  visibility: Visibility;
  /** Punkt-ID-er i PUNKT-KATALOG */
  punktIds: string[];
};

/**
 * Spiller-app — hovedflater.
 * core = alltid synlig.
 */
export const PLAYERHQ_VISIBILITY: VisibilityArea[] = [
  { id: "phq-hjem", label: "Hjem", visibility: "core", punktIds: ["A.01"] },
  { id: "phq-plan", label: "Plan / workbench", visibility: "core", punktIds: ["A.01", "A.05", "C.01", "C.02"] },
  { id: "phq-gjor", label: "Gjør / live økt", visibility: "core", punktIds: ["A.01", "A.06"] },
  { id: "phq-analyse", label: "Analyse", visibility: "core", punktIds: ["A.01"] },
  { id: "phq-meg", label: "Meg", visibility: "core", punktIds: ["A.01", "J.14"] },
  { id: "phq-runder", label: "Runder + live runde", visibility: "on", punktIds: ["A.11", "A.12", "A.13", "J.01", "F.01"] },
  { id: "phq-trackman", label: "TrackMan", visibility: "on", punktIds: ["A.08", "A.09", "E.07"] },
  { id: "phq-teknisk-plan", label: "Teknisk plan / full sving", visibility: "on", punktIds: ["A.07", "A.09"] },
  { id: "phq-tester", label: "Tester", visibility: "on", punktIds: ["J.04", "A.10"] },
  { id: "phq-sg-hub", label: "SG-hub", visibility: "on", punktIds: ["J.03", "A.18"] },
  { id: "phq-drills", label: "Drills", visibility: "on", punktIds: ["J.05"] },
  { id: "phq-booking", label: "Booking", visibility: "on", punktIds: ["J.06", "A.17"] },
  { id: "phq-fysisk", label: "Fysisk", visibility: "on", punktIds: ["J.07"] },
  { id: "phq-gameplan", label: "Gameplan / baneguide", visibility: "on", punktIds: ["J.08"] },
  { id: "phq-datagolf", label: "DataGolf", visibility: "on", punktIds: ["J.09"] },
  { id: "phq-coach-melding", label: "Coach-meldinger", visibility: "on", punktIds: ["J.10"] },
  { id: "phq-venner", label: "Venner", visibility: "on", punktIds: ["J.11"] },
  { id: "phq-utfordringer", label: "Utfordringer", visibility: "on", punktIds: ["J.12"] },
  { id: "phq-talent", label: "Talent (spiller)", visibility: "on", punktIds: ["J.13", "H.08"] },
  { id: "phq-tm-baseline-ui", label: "Godkjenn TM-baseline (UI)", visibility: "on", punktIds: ["D.02", "A.10"] },
  { id: "phq-runde-hurtig", label: "Runde hurtigmodus", visibility: "on", punktIds: ["F.02"] },
];

/**
 * AgencyOS — hovednav + «Mer».
 */
export const AGENCYOS_VISIBILITY: VisibilityArea[] = [
  { id: "aos-cockpit", label: "Cockpit", visibility: "core", punktIds: ["A.02"] },
  { id: "aos-innboks", label: "Innboks", visibility: "core", punktIds: ["A.02"] },
  { id: "aos-stall", label: "Stall", visibility: "core", punktIds: ["A.02"] },
  { id: "aos-planlegge", label: "Planlegge / workbench", visibility: "core", punktIds: ["A.02", "C.01"] },
  { id: "aos-kalender", label: "Kalender", visibility: "on", punktIds: ["A.02"] },
  { id: "aos-booking", label: "Booking", visibility: "on", punktIds: ["A.17"] },
  { id: "aos-uka", label: "Uka", visibility: "on", punktIds: ["A.02"] },
  { id: "aos-innsikt", label: "Innsikt", visibility: "on", punktIds: ["A.02"] },
  { id: "aos-okonomi", label: "Økonomi", visibility: "on", punktIds: ["I.21"] },
  { id: "aos-godkjenninger", label: "Godkjenninger", visibility: "on", punktIds: ["I.01", "D.01"] },
  { id: "aos-handlingssenter", label: "Handlingssenter", visibility: "on", punktIds: ["I.02"] },
  { id: "aos-brief", label: "Daglig brief", visibility: "on", punktIds: ["I.03", "D.04"] },
  { id: "aos-queue", label: "Oppfølgingskø", visibility: "on", punktIds: ["I.04"] },
  { id: "aos-grupper", label: "Grupper", visibility: "on", punktIds: ["I.05"] },
  { id: "aos-talent-radar", label: "Talent-radar", visibility: "on", punktIds: ["I.06"] },
  { id: "aos-talent-sammenligning", label: "Talent-sammenligning", visibility: "on", punktIds: ["I.07"] },
  { id: "aos-teknisk-plan", label: "Teknisk plan", visibility: "on", punktIds: ["I.08"] },
  { id: "aos-turneringer", label: "Turneringer", visibility: "on", punktIds: ["I.09"] },
  { id: "aos-drills", label: "Drills", visibility: "on", punktIds: ["I.10"] },
  { id: "aos-tester", label: "Tester", visibility: "on", punktIds: ["I.11"] },
  { id: "aos-rapporter", label: "Rapporter", visibility: "on", punktIds: ["I.12"] },
  { id: "aos-runder", label: "Runder", visibility: "on", punktIds: ["I.13"] },
  { id: "aos-compliance", label: "Plan-etterlevelse", visibility: "on", punktIds: ["I.14"] },
  { id: "aos-audit", label: "Audit-log", visibility: "on", punktIds: ["I.15"] },
  { id: "aos-moderering", label: "Moderering", visibility: "on", punktIds: ["I.16"] },
  { id: "aos-trackman", label: "TrackMan", visibility: "on", punktIds: ["I.17", "A.08"] },
  { id: "aos-live", label: "Live / mission", visibility: "on", punktIds: ["I.18"] },
  { id: "aos-caddie", label: "Caddie AI", visibility: "on", punktIds: ["I.19", "D.05"] },
  { id: "aos-agents", label: "AI-agenter", visibility: "on", punktIds: ["I.20", "D.06"] },
  { id: "aos-marketing", label: "Marketing admin", visibility: "on", punktIds: ["I.22"] },
];

/** Offentlig / marketing / stats */
export const PUBLIC_VISIBILITY: VisibilityArea[] = [
  { id: "pub-marketing", label: "Marketing akgolf.no", visibility: "on", punktIds: ["G.01", "A.14"] },
  { id: "pub-stats", label: "Offentlig stats-hub", visibility: "on", punktIds: ["G.02", "G.04", "A.14"] },
  { id: "pub-forelder", label: "Forelder-portal", visibility: "core", punktIds: ["A.03"] },
];

const ALL = [
  ...PLAYERHQ_VISIBILITY,
  ...AGENCYOS_VISIBILITY,
  ...PUBLIC_VISIBILITY,
];

export function isAreaVisible(areaId: string): boolean {
  const area = ALL.find((a) => a.id === areaId);
  if (!area) return true;
  return area.visibility === "core" || area.visibility === "on";
}

/** For nav-filter: skjul item hvis areaId er kjent og off. */
export function filterNavByVisibility<T extends { id: string }>(
  items: T[],
  idToArea: Record<string, string>,
): T[] {
  return items.filter((item) => {
    const areaId = idToArea[item.id];
    if (!areaId) return true;
    return isAreaVisible(areaId);
  });
}
