/**
 * PH-10 Plan — datakontrakt mellom laster (server) og visning (klient).
 * Bare vanlige verdier: datoer er «YYYY-MM-DD» (Oslo), klokkeslett «HH:MM».
 */
export type PlanAkse = "fys" | "tek" | "slag" | "spill" | "turn";
export type PlanZoom = "aar" | "maaned" | "uke" | "dag";
export const PLAN_ZOOM: readonly PlanZoom[] = ["aar", "maaned", "uke", "dag"];
export const ZOOM_NAVN: Record<PlanZoom, string> = { aar: "År", maaned: "Måned", uke: "Uke", dag: "Dag" };

export type PlanOktStatus = "Planlagt" | "Pågår" | "Gjennomført" | "Hoppet over" | "Avlyst";

export type PlanOkt = {
  id: string;
  dato: string;
  tid: string;
  min: number;
  akse: PlanAkse;
  tittel: string;
  sted: string | null;
  status: PlanOktStatus;
  /** Åpner økta (Se økta). */
  href: string;
  /** Starter eller fortsetter økta. Null når den er gjennomført eller avlyst. */
  startHref: string | null;
  ovelser: { navn: string; min: number }[];
};

export type PlanOpptattArt = "skole" | "jobb" | "reise" | "booking" | "annet";
export const OPPTATT_NAVN: Record<PlanOpptattArt, string> = { skole: "Skole", jobb: "Jobb", reise: "Reise", booking: "Booking", annet: "Avtale" };

/** Opptatt tid med klokkeslett: skole, jobb, reise, booking og egne avtaler. */
export type PlanOpptatt = { id: string; dato: string; tid: string; min: number; art: PlanOpptattArt; tittel: string };

export type PlanHeldagArt = "turnering" | "samling" | "skole" | "test";
/** Hendelse som varer hele dagen eller flere dager. */
export type PlanHeldag = {
  id: string;
  art: PlanHeldagArt;
  fra: string;
  til: string;
  tittel: string;
  meta: string | null;
  /** Turneringens katalog-id, når den finnes (lenke til påmelding og runde). */
  turneringId: string | null;
  detaljer: [string, string][];
};

export type PlanPeriodeType = "grunn" | "spesial" | "turnering" | "evaluering" | "ferie" | "restitusjon";
export const PERIODE_NAVN: Record<PlanPeriodeType, string> = {
  grunn: "Grunnperiode", spesial: "Spesialperiode", turnering: "Turneringsperiode",
  evaluering: "Evaluering", ferie: "Ferie", restitusjon: "Restitusjon",
};

export type PlanPeriode = {
  id: string;
  type: PlanPeriodeType;
  /** Navn når perioden har et annet enn typens (f.eks. «Testuke»). */
  navn: string;
  fraUke: number;
  tilUke: number;
  fraDato: string;
  /** Timer planlagt og gjennomført i Workbench. Null når det ikke finnes noe å telle. */
  planTimer: number | null;
  gjortTimer: number | null;
};

export type PlanFysiskPlan = { id: string; navn: string; status: "ACTIVE" | "DRAFT" | "ARCHIVED"; uker: number; okter: number; ukeNaa: number };

export type PlanData = {
  zoom: PlanZoom;
  /** Datoen visningen er sentrert på. */
  dato: string;
  iDag: string;
  naaMin: number;
  aar: number;
  okter: PlanOkt[];
  opptatt: PlanOpptatt[];
  heldag: PlanHeldag[];
  perioder: PlanPeriode[];
  /** Økta som skal stå åpen ved innlasting (lag=fys). */
  aapneOktId: string | null;
  aapneHeldagId: string | null;
  fysiskePlaner: PlanFysiskPlan[] | null;
  uleste: number;
};
