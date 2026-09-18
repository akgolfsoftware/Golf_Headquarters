import type { AdminRole, AdminScreenId, PortalRole, PortalScreenId } from "./types";

export const ADMIN_PRIMARY: {
  id: AdminScreenId;
  label: string;
  meta?: string;
}[] = [
  { id: "hjem", label: "Hjem" },
  { id: "stall", label: "Stall", meta: "34" },
  { id: "kalender-uke", label: "Kalender" },
  { id: "workbench", label: "Workbench" },
  { id: "innboks", label: "Innboks", meta: "3" },
  { id: "ko", label: "Godkjenninger" },
  { id: "spor", label: "AgenticOS" },
  { id: "stall-analyse", label: "Analyse" },
  { id: "oppsett", label: "Oppsett" },
];

export const ADMIN_MOBILE: AdminScreenId[] = ["hjem", "stall", "kalender-uke", "innboks", "oppsett"];

export const PORTAL_TABS: { id: PortalScreenId; label: string }[] = [
  { id: "i-dag", label: "I dag" },
  { id: "plan", label: "Plan" },
  { id: "analyse", label: "Analyse" },
  { id: "meg", label: "Meg" },
];

const PARENT: Partial<Record<AdminScreenId, AdminScreenId>> = {
  "kalender-dag": "kalender-uke",
  "kalender-maned": "kalender-uke",
  "okt-individuell": "kalender-uke",
  "okt-gruppe": "kalender-uke",
  "live-coach": "kalender-uke",
  "live-gruppe": "kalender-uke",
  "oppsummering-coach": "kalender-uke",
  "live-oversikt": "hjem",
  "stall-dag": "stall",
  "planlegge": "workbench",
  publiser: "workbench",
  gruppe: "workbench",
  arsplan: "workbench",
  periode: "workbench",
  maned: "workbench",
  oktbygger: "workbench",
  trad: "innboks",
  forslag: "ko",
  bekreft: "ko",
  "resultat-caddie": "ko",
  forkast: "ko",
  "spor-detalj": "spor",
  ovelsesbibliotek: "oppsett",
  ovelse: "oppsett",
  program: "oppsett",
  "publiser-ovelse": "oppsett",
  moderering: "oppsett",
  versjon: "oppsett",
  avpubliser: "oppsett",
  abonnement: "oppsett",
  "min-uke": "oppsett",
  "ops-feillogg": "oppsett",
  "ops-triage": "oppsett",
  "ops-kontroll": "oppsett",
  "ops-restore": "oppsett",
  "ops-resultat": "oppsett",
  "ops-kvittering": "oppsett",
};

export function primaryFor(screen: AdminScreenId): AdminScreenId {
  if (ADMIN_PRIMARY.some((p) => p.id === screen)) return screen;
  return PARENT[screen] ?? "oppsett";
}

const ADMIN_ONLY: AdminScreenId[] = [
  "ops-feillogg",
  "ops-triage",
  "ops-kontroll",
  "ops-restore",
  "ops-resultat",
  "ops-kvittering",
  "moderering",
  "avpubliser",
  "abonnement",
];

export function canAdmin(role: AdminRole, screen: AdminScreenId): boolean {
  if (ADMIN_ONLY.includes(screen) && role !== "ADMIN") return false;
  return true;
}

export function canPortal(role: PortalRole, screen: PortalScreenId): boolean {
  if (role === "GRATIS" && (screen === "coachkontakt" || screen === "utfordring")) return false;
  if (role === "FO" && (screen === "live-slag" || screen === "live-ovelse" || screen === "live-desktop")) {
    return false;
  }
  return true;
}

export const OPPSETT_GROUPS: { heading: string; items: AdminScreenId[] }[] = [
  { heading: "Økt og live", items: ["okt-individuell", "okt-gruppe", "live-coach", "live-gruppe", "oppsummering-coach", "live-oversikt", "min-uke"] },
  { heading: "Workbench", items: ["planlegge", "arsplan", "periode", "maned", "oktbygger", "publiser", "gruppe", "stall-dag"] },
  { heading: "Bank", items: ["ovelsesbibliotek", "ovelse", "program", "publiser-ovelse", "moderering", "versjon", "avpubliser"] },
  { heading: "Drift", items: ["ops-feillogg", "ops-triage", "ops-kontroll", "ops-restore", "ops-resultat", "ops-kvittering", "abonnement"] },
];

export const MEG_GROUPS: { heading: string; items: PortalScreenId[] }[] = [
  { heading: "Utvikling", items: ["mal", "fremgang", "tek-plan", "aerlig"] },
  { heading: "Spill", items: ["runder", "scorekort", "gameplan", "hull", "posisjon", "offline"] },
  { heading: "Data", items: ["datakilder", "datagolf", "trackman", "trackman-okt", "bag", "kurve", "talent", "forhold", "banegrunnlag"] },
  { heading: "Gruppe og melding", items: ["utfordringer", "utfordring", "coachkontakt", "varsler"] },
  { heading: "Økt", items: ["oktoppskrift", "live-slag", "live-ovelse", "oppsummering", "live-desktop"] },
];

export function visibleAdminPrimary(role: AdminRole) {
  return ADMIN_PRIMARY.filter((p) => canAdmin(role, p.id));
}

export function visibleOppsett(role: AdminRole) {
  return OPPSETT_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((id) => canAdmin(role, id)),
  })).filter((g) => g.items.length > 0);
}

export function visibleMeg(role: PortalRole) {
  return MEG_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((id) => canPortal(role, id)),
  })).filter((g) => g.items.length > 0);
}
