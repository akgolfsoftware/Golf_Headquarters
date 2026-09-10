/**
 * PH-01 «I dag» — visningsmodell.
 * Ren: ingen Prisma, ingen React.
 * Fasit: designsystem/train-lock/PH-01 I dag.dc.html
 * Fasit: designsystem/train-lock/PH-01e I dag tilstander laast.dc.html (feil-copy PH-01e4)
 */

import {
  planSessionStartHref,
  v2SessionStartHref,
  wbStatusTilPlanStatus,
  type V2OktUiStatus,
} from "./session-hrefs";

export type IDagTilstand = "feil" | "pagar" | "okt" | "hvile" | "tom-dag" | "tom-uke";

export type IDagPrikk = {
  /** Tom rute før den 1. i måneden. */
  tom: boolean;
  idag: boolean;
  fylt: boolean;
};

export const IDAG_UI = {
  tittel: "I dag",
  naa: "Nå",
  neste: "Neste",
  live: "Live",
  sgInnspill: "SG innspill",
  okterUken: "Økter denne uken",
  startOkt: "Start økt",
  fortsett: "Fortsett",
  avslutt: "Avslutt",
  seRecap: "Se recap",
  fullfort: "Fullført",
  startEgen: "Start egen økt",
  apnePlan: "Åpne plan",
  sporCaddie: "Spør Caddie",
  loggCaddie: "Logg med Caddie",
  seSpredning: "Se spredning",
  feilCaps: "Ingen forbindelse",
  feilTittel: "Fikk ikke lastet dagen din",
  feilBrød: "Sjekk nettet og prøv igjen. Økta ligger lagret.",
  provIgjen: "Prøv igjen",
  ingenOktCaps: "Ingen økt",
  ingenOktTittel: "Ingen økt i dag. Anders har ikke lagt inn.",
  tomUkeCaddie: "Ingen økt i dag. Anders har ikke lagt inn.",
  caddieCaps: "Caddie",
  hvile: "Hvile",
  programmert: "programmert",
  programmertAvAnders: "Programmert av Anders · ingen økt",
} as const;

const UKE_M_FORST = ["M", "T", "O", "T", "F", "L", "S"] as const;

export const IDAG_UKE_BOKSTAVER = UKE_M_FORST;

/** Fasit-klokke: 09.00 — punktum, ikke kolon. */
export function formatKlokkePunkt(minutt: number): string {
  const h = Math.floor(minutt / 60);
  const m = minutt % 60;
  const hh = h.toString().padStart(2, "0");
  const mm = m.toString().padStart(2, "0");
  return `${hh}.${mm}`;
}

export function formatIntervallPunkt(startMinutt: number, varighetMin: number): string {
  return `${formatKlokkePunkt(startMinutt)}–${formatKlokkePunkt(startMinutt + varighetMin)}`;
}

export function osloMinuttAvDogen(naa: Date): number {
  const deler = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(naa);
  const h = Number(deler.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(deler.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

export function minutterIgjen(
  startMinutt: number,
  varighetMin: number,
  naaMinutt: number,
): number | null {
  const slutt = startMinutt + varighetMin;
  if (naaMinutt < startMinutt) return null;
  if (naaMinutt >= slutt) return 0;
  return slutt - naaMinutt;
}

export function fremdriftPst(
  startMinutt: number,
  varighetMin: number,
  naaMinutt: number,
): number {
  if (varighetMin <= 0) return 0;
  const kjor = naaMinutt - startMinutt;
  if (kjor <= 0) return 0;
  if (kjor >= varighetMin) return 100;
  return Math.round((kjor / varighetMin) * 100);
}

export function erHvileTittel(tittel: string): boolean {
  return tittel.trim().toLowerCase() === "hvile";
}

export type IDagNaaCta = {
  ctaTekst: string;
  ctaHref: string;
  live: boolean;
  fullfort: boolean;
  sekundarTekst?: string;
  sekundarHref?: string;
};

/** Start / Fortsett / Se recap for Nå-kortet — begge øktmodeller. */
export function idagNaaCta(input: {
  id: string;
  modell: "wb" | "v2" | "plan";
  status: string;
}): IDagNaaCta {
  if (input.modell === "v2") {
    const ui: V2OktUiStatus =
      input.status === "done" || input.status === "COMPLETED"
        ? "done"
        : input.status === "now" || input.status === "IN_PROGRESS"
          ? "now"
          : "upcoming";
    const href = v2SessionStartHref(input.id, ui);
    const fullfort = ui === "done";
    const live = ui === "now";
    return {
      ctaTekst: fullfort ? IDAG_UI.seRecap : live ? IDAG_UI.fortsett : IDAG_UI.startOkt,
      ctaHref: href,
      live,
      fullfort,
      sekundarTekst: live ? IDAG_UI.avslutt : undefined,
      sekundarHref: live ? href : undefined,
    };
  }

  const planStatus = wbStatusTilPlanStatus(input.status);
  const href = planSessionStartHref(input.id, planStatus);
  const fullfort = planStatus === "COMPLETED";
  const live = planStatus === "ACTIVE" || planStatus === "PAUSED";
  return {
    ctaTekst: fullfort ? IDAG_UI.seRecap : live ? IDAG_UI.fortsett : IDAG_UI.startOkt,
    ctaHref: href,
    live,
    fullfort,
    sekundarTekst: live ? IDAG_UI.avslutt : undefined,
    sekundarHref: live ? href : undefined,
  };
}

export function velgIDagTilstand(input: {
  feil: boolean;
  pagaende: boolean;
  harStartbarOkt: boolean;
  harHvile: boolean;
  ukeHarOkter: boolean;
  /** Ferdig økt i dag — vis Nå-kortet med recap, ikke tom-dag. */
  harFullfortOkt?: boolean;
}): IDagTilstand {
  if (input.feil) return "feil";
  if (input.pagaende) return "pagar";
  if (input.harStartbarOkt) return "okt";
  if (input.harFullfortOkt) return "okt";
  if (input.harHvile) return "hvile";
  if (input.ukeHarOkter) return "tom-dag";
  return "tom-uke";
}

/**
 * Prikk-måned PH-01: mandag først. I dag = ring, ikke fyll.
 * Fylt = gjennomført. Tom rute før den 1. er transparent.
 */
export function byggMaanedPrikker(opts: {
  aar: number;
  /** 1–12 */
  maned: number;
  idag: number;
  ferdige: ReadonlySet<number>;
}): IDagPrikk[] {
  const forste = new Date(Date.UTC(opts.aar, opts.maned - 1, 1));
  const js = forste.getUTCDay();
  const leading = js === 0 ? 6 : js - 1;
  const dager = new Date(Date.UTC(opts.aar, opts.maned, 0)).getUTCDate();
  const ut: IDagPrikk[] = [];
  for (let i = 0; i < leading; i += 1) {
    ut.push({ tom: true, idag: false, fylt: false });
  }
  for (let dag = 1; dag <= dager; dag += 1) {
    const idag = dag === opts.idag;
    ut.push({
      tom: false,
      idag,
      fylt: !idag && opts.ferdige.has(dag),
    });
  }
  return ut;
}
