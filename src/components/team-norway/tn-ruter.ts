/**
 * Team Norway: det ene rutekartet. Menyen (tn-shell.tsx) og skjermene leser
 * herfra. Kilde: konstantene SCREENS (route-feltet) og GROUPS i
 * «Team Norway App.dc.html» (Claude Design bc3e41fc, lest 28.09.2026).
 *
 * Avvik fra tegningens `route` (bevisst, eksisterende sider beholdes):
 *   - TN-13 Gruppeposter og TN-14 Dokumenter: tegningen sier /team-norway/gruppe
 *     og /team-norway/gruppe/dokumenter. Appen har dem på
 *     /team-norway/[groupId] og /team-norway/[groupId]/dokumenter (gruppen i
 *     adressen). Bruk tnGruppeHref()/tnDokumenterHref().
 *   - TN-02 Spillerprofil: /team-norway/spiller er inngangen (velger en spiller),
 *     /team-norway/spiller/[spillerId] er profilen.
 *   - DataGolf er ikke tegnet: menyen peker på den eksisterende siden
 *     /portal/analysere/datagolf. Analyse er ikke tegnet: /team-norway/analyse
 *     (eksisterende side) beholdes.
 *   - Utgått 28.09: Samtykke, Inviter spiller og Spillervisning.
 *     /team-norway/inviter videresender til Tilgang og samtykke.
 */

export const TN_RUTER = {
  oversikt: "/team-norway",
  spillere: "/team-norway/spillere",
  spiller: "/team-norway/spiller",
  test: "/team-norway/fellestesting",
  kartlegging: "/team-norway/kartlegging",
  college: "/team-norway/college",
  skoler: "/team-norway/skoler",
  samlinger: "/team-norway/samlinger",
  turneringer: "/team-norway/turneringer",
  live: "/team-norway/live-watch",
  uttak: "/team-norway/uttak",
  rangliste: "/team-norway/rangliste",
  datagolf: "/portal/analysere/datagolf",
  manedsplan: "/team-norway/manedsplan",
  protokoller: "/team-norway/protokoller",
  referanse: "/team-norway/referansenivaer",
  fagapparat: "/team-norway/fagapparat",
  analyse: "/team-norway/analyse",
  tilgang: "/team-norway/tilgang",
  lisens: "/team-norway/lisens-okonomi",
  loggInn: "/team-norway/logg-inn",
} as const;

export function tnGruppeHref(groupId: string): string {
  return `/team-norway/${encodeURIComponent(groupId)}`;
}

export function tnDokumenterHref(groupId: string): string {
  return `/team-norway/${encodeURIComponent(groupId)}/dokumenter`;
}

/** Fanene i spillerprofilen (tegningens ppTabs). */
export const TN_SPILLERPROFIL_FANER = [
  { id: "plan", navn: "Plan" },
  { id: "stats", navn: "Stats" },
  { id: "test", navn: "Tester" },
  { id: "iup", navn: "IUP" },
  { id: "sam", navn: "Samtaler" },
  { id: "tur", navn: "Turneringer" },
] as const;

export function tnSpillerHref(spillerId: string): string {
  return `${TN_RUTER.spiller}/${encodeURIComponent(spillerId)}`;
}

export type TnSkjermRad = {
  /** Tegningens id i SCREENS. */
  id: string;
  /** Skjermkode (TN-01 …). Tomt for ikke-tegnede skjermer. */
  kode: string;
  navn: string;
  rute: string;
  /** Filen skjermen bygges i (relativt til repoet). */
  fil: string;
};

/** Hele rutekartet som tabell — for skjermagentene og for oversikten i PR-en. */
export const TN_SKJERMER: readonly TnSkjermRad[] = [
  { id: "oversikt", kode: "TN-01", navn: "Landslagsoversikt", rute: TN_RUTER.oversikt, fil: "src/components/team-norway/skjermer/tn-oversikt-skjerm.tsx (side: src/app/team-norway/(trener)/page.tsx)" },
  { id: "spiller", kode: "TN-02", navn: "Spillerprofil", rute: "/team-norway/spiller/[spillerId]", fil: "src/app/team-norway/(trener)/spiller/page.tsx + spiller/[spillerId]/**" },
  { id: "test", kode: "TN-03", navn: "Fellestesting", rute: TN_RUTER.test, fil: "src/app/team-norway/(trener)/fellestesting/**" },
  { id: "samlinger", kode: "TN-04", navn: "Samlinger og terminliste", rute: TN_RUTER.samlinger, fil: "src/app/team-norway/(trener)/samlinger/**" },
  { id: "uttak", kode: "TN-05", navn: "Uttak og kriterier", rute: TN_RUTER.uttak, fil: "src/app/team-norway/(trener)/uttak/page.tsx" },
  { id: "college", kode: "TN-06", navn: "College og USA", rute: TN_RUTER.college, fil: "src/app/team-norway/(trener)/college/page.tsx" },
  { id: "turneringer", kode: "TN-07", navn: "Turneringer og reise", rute: TN_RUTER.turneringer, fil: "src/app/team-norway/(trener)/turneringer/**" },
  { id: "live", kode: "TN-08", navn: "Live Watch", rute: TN_RUTER.live, fil: "src/app/team-norway/(trener)/live-watch/page.tsx" },
  { id: "fagapparat", kode: "TN-09", navn: "Fagapparat", rute: TN_RUTER.fagapparat, fil: "src/app/team-norway/(trener)/fagapparat/page.tsx" },
  { id: "lisens", kode: "TN-10", navn: "Lisens og økonomi", rute: TN_RUTER.lisens, fil: "src/app/team-norway/(trener)/lisens-okonomi/page.tsx" },
  { id: "manedsplan", kode: "TN-11", navn: "Månedsplan", rute: TN_RUTER.manedsplan, fil: "src/app/team-norway/(trener)/manedsplan/page.tsx" },
  { id: "spillere", kode: "TN-12", navn: "Spillerutvikling", rute: TN_RUTER.spillere, fil: "src/app/team-norway/(trener)/spillere/page.tsx" },
  { id: "gruppe", kode: "TN-13", navn: "Gruppeposter", rute: "/team-norway/[groupId]", fil: "src/app/team-norway/(trener)/[groupId]/page.tsx" },
  { id: "dokumenter", kode: "TN-14", navn: "Dokumenter", rute: "/team-norway/[groupId]/dokumenter", fil: "src/app/team-norway/(trener)/[groupId]/dokumenter/page.tsx" },
  { id: "protokoller", kode: "TN-15", navn: "Testprotokoller", rute: TN_RUTER.protokoller, fil: "src/app/team-norway/(trener)/protokoller/**" },
  { id: "rangliste", kode: "TN-16", navn: "Rangliste", rute: TN_RUTER.rangliste, fil: "src/app/team-norway/(trener)/rangliste/page.tsx" },
  { id: "skoler", kode: "TN-17", navn: "Skoleoversikt", rute: TN_RUTER.skoler, fil: "src/app/team-norway/(trener)/skoler/page.tsx" },
  { id: "referanse", kode: "TN-18", navn: "Referansenivåer", rute: TN_RUTER.referanse, fil: "src/app/team-norway/(trener)/referansenivaer/page.tsx" },
  { id: "tilgang", kode: "TN-19", navn: "Tilgang og samtykke", rute: TN_RUTER.tilgang, fil: "src/app/team-norway/(trener)/tilgang/**" },
  { id: "kartlegging", kode: "", navn: "Kartlegging", rute: TN_RUTER.kartlegging, fil: "src/app/team-norway/(trener)/kartlegging/page.tsx (ny)" },
  { id: "analyse", kode: "", navn: "Analyse (ikke tegnet, beholdes)", rute: TN_RUTER.analyse, fil: "src/app/team-norway/(trener)/analyse/page.tsx" },
  { id: "datagolf", kode: "", navn: "DataGolf (ikke tegnet, eksisterende side)", rute: TN_RUTER.datagolf, fil: "—" },
];
