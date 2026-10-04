/**
 * Datamodell og hjelpere for PH-25 (Abonnement og innstillinger)
 * i Precision Athletics (Claude Design ui_kits/playerhq/screens/PH-25.jsx).
 */

export type PlanId = "TALENT" | "FULL";
export type BetalingsPeriode = "Månedlig" | "Årlig";

export interface PlanDefinisjon {
  id: PlanId;
  navn: string;
  prisMnd: number;
  prisAr: number;
  per: string | null;
  features: readonly string[];
}

export interface KortData {
  brand: string;
  last4: string;
  exp: string;
}

export interface FakturaData {
  id: string;
  dato: string;
  gjelder: string;
  belop: number;
  status: string;
}

export interface SamtykkeData {
  coach: boolean;
  data: boolean;
  bilder?: boolean;
  forsk?: boolean;
}

export interface VarselData {
  plan: boolean;
  meld: boolean;
  turn: boolean;
  digest: boolean;
  caddie: boolean;
}

export interface SikkerhetData {
  tofaktor: boolean;
  telefonMaskert: string;
  sidenDato: string;
}

export interface HjelpLenke {
  id: string;
  tittel: string;
  ikon: "file-text" | "mail" | "help-circle";
  href?: string;
}

export interface PH25AbonnementData {
  current: {
    plan: PlanId;
    period: "mnd" | "ar";
    renews: string;
    ends: string;
    cancelled?: boolean;
  };
  plans: readonly PlanDefinisjon[];
  card: KortData | null;
  invoices: readonly FakturaData[];
  samtykker: SamtykkeData;
  varsler: VarselData;
  sikkerhet: SikkerhetData;
  hjelp: readonly HjelpLenke[];
}

export const PH25_PLANER: readonly PlanDefinisjon[] = [
  {
    id: "TALENT",
    navn: "Gratis",
    prisMnd: 0,
    prisAr: 0,
    per: null,
    features: [
      "Åpent testbatteri",
      "Analyse og runderegistrering med SG",
      "Booking av enkelttimer",
      "DataGolf-sammenligning",
    ],
  },
  {
    id: "FULL",
    navn: "Full",
    prisMnd: 299,
    prisAr: 2690,
    per: "mnd",
    features: [
      "Alt i Gratis",
      "Plan og Workbench",
      "Live-økt og Gameplan",
      "Caddie",
      "TrackMan-import",
    ],
  },
];

/** Formaterer beløp i kroner med mellomrom som tusenskille uten .toFixed */
export function formaterKroner(belop: number | null | undefined): string {
  if (belop == null) return "—";
  const avrundet = Math.round(belop);
  const tekst = String(avrundet);
  return tekst.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
}

/** Beregner hvor mye som spares ved årlig betaling sammenlignet med månedlig */
export function beregnArligBesparelse(prisMnd: number, prisAr: number): number {
  return prisMnd * 12 - prisAr;
}

export const PH25_STANDARD_HJELP: readonly HjelpLenke[] = [
  { id: "h1", tittel: "Slik registrerer du en runde", ikon: "file-text", href: "/portal/analysere/hjelp/runder" },
  { id: "h2", tittel: "Slik kobler du TrackMan", ikon: "file-text", href: "/portal/analysere/hjelp/trackman" },
  { id: "h3", tittel: "Kontakt Fredrikstad GK", ikon: "mail", href: "mailto:post@fredrikstadgk.no" },
];

/** Standard syntetiske data basert på Claude Design PH-25 fasit */
export const PH25_STANDARD_DATA: PH25AbonnementData = {
  current: {
    plan: "FULL",
    period: "mnd",
    renews: "26.10.2026",
    ends: "25.10.2026",
    cancelled: false,
  },
  plans: PH25_PLANER,
  card: {
    brand: "Visa",
    last4: "4821",
    exp: "08/28",
  },
  invoices: [
    { id: "inv-1", dato: "26.09.2026", gjelder: "Full · september", belop: 299, status: "Betalt" },
    { id: "inv-2", dato: "26.08.2026", gjelder: "Full · august", belop: 299, status: "Betalt" },
    { id: "inv-3", dato: "26.07.2026", gjelder: "Full · juli", belop: 299, status: "Betalt" },
  ],
  samtykker: {
    coach: true,
    data: true,
    bilder: false,
    forsk: false,
  },
  varsler: {
    plan: true,
    meld: true,
    turn: true,
    digest: true,
    caddie: false,
  },
  sikkerhet: {
    tofaktor: true,
    telefonMaskert: "+47 ••• •• 412",
    sidenDato: "12.01.2026",
  },
  hjelp: PH25_STANDARD_HJELP,
};

/** Tom tilstand for gratis/uinnlogget/ingen betaling */
export const PH25_TOM_DATA: PH25AbonnementData = {
  current: {
    plan: "TALENT",
    period: "mnd",
    renews: "—",
    ends: "—",
    cancelled: false,
  },
  plans: PH25_PLANER,
  card: null,
  invoices: [],
  samtykker: {
    coach: false,
    data: false,
    bilder: false,
    forsk: false,
  },
  varsler: {
    plan: true,
    meld: true,
    turn: false,
    digest: false,
    caddie: false,
  },
  sikkerhet: {
    tofaktor: false,
    telefonMaskert: "",
    sidenDato: "",
  },
  hjelp: PH25_STANDARD_HJELP,
};
