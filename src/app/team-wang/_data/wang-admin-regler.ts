/**
 * Rene regler for WANG Administrasjon (WANG-19, WANG-34, WANG-26). Ingen
 * database, ingen server-imports — testes i wang-admin-regler.test.ts.
 * Datalasterne som bruker dem står i wang-admin-data.ts.
 */

import { harGyldigSamtykke, type DelingSamtykkeRad, type DelingScope } from "@/lib/deling/samtykke-regler";

const osloDato = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });

/** «29.09.2026» i norsk tid. */
export function formaterDato(d: Date): string {
  return osloDato.format(d);
}

// ---------------------------------------------------------------- WANG-19

export type TrenerMedlemskap = {
  userId: string;
  navn: string;
  epost: string;
  /** COACH | ASSISTANT (GroupMember.role). */
  gruppeRolle: string;
  joinedAt: Date;
  endedAt: Date | null;
};

export type TrenerRad = {
  userId: string;
  navn: string;
  initialer: string;
  epost: string;
  /** Rollen på skjerm. Bare Sportssjef og Trener finnes i WANG (Anders 27.09.2026). */
  rolle: "Sportssjef" | "Trener";
  /** ASSISTANT i basen: trener med bare innsyn. */
  bareInnsyn: boolean;
  aktiv: boolean;
  fra: string;
  til: string | null;
};

export type TrenerFilter = "alle" | "aktive" | "avsluttet";

export function lesTrenerFilter(v: string | string[] | undefined): TrenerFilter {
  return v === "aktive" || v === "avsluttet" ? v : "alle";
}

export function initialer(navn: string): string {
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return "·";
  const forste = deler[0][0] ?? "";
  const siste = deler.length > 1 ? (deler[deler.length - 1][0] ?? "") : "";
  return (forste + siste).toUpperCase();
}

/**
 * Én rad per trener i gruppen. Sportssjef = gruppens hovedcoach (samme regel
 * som porten, wangRolleFor). Aktive først, deretter alfabetisk.
 */
export function byggTrenerRader(medlemskap: readonly TrenerMedlemskap[], hovedcoachId: string | null): TrenerRad[] {
  return medlemskap
    .map((m) => ({
      userId: m.userId,
      navn: m.navn,
      initialer: initialer(m.navn),
      epost: m.epost,
      rolle: hovedcoachId !== null && m.userId === hovedcoachId ? ("Sportssjef" as const) : ("Trener" as const),
      bareInnsyn: m.gruppeRolle === "ASSISTANT",
      aktiv: m.endedAt === null,
      fra: formaterDato(m.joinedAt),
      til: m.endedAt ? formaterDato(m.endedAt) : null,
    }))
    .sort((a, b) => Number(b.aktiv) - Number(a.aktiv) || a.navn.localeCompare(b.navn, "nb"));
}

export function filtrerTrenere(rader: readonly TrenerRad[], filter: TrenerFilter): TrenerRad[] {
  if (filter === "aktive") return rader.filter((r) => r.aktiv);
  if (filter === "avsluttet") return rader.filter((r) => !r.aktiv);
  return [...rader];
}

// ---------------------------------------------------------------- WANG-34

export type SamtykkeStatus = "delt" | "venter" | "trukket" | "ikke";

export const SAMTYKKE_STATUS_NAVN: Record<SamtykkeStatus, string> = {
  delt: "Delt",
  venter: "Venter på forelder",
  trukket: "Ikke delt",
  ikke: "Ikke delt",
};

export type SamtykkeFilter = "alle" | "delt" | "venter" | "ikke";

export function lesSamtykkeFilter(v: string | string[] | undefined): SamtykkeFilter {
  return v === "delt" || v === "venter" || v === "ikke" ? v : "alle";
}

const SCOPE_NAVN: Record<DelingScope, string> = {
  TEST_RESULTATER: "testresultater",
  STATS: "statistikk",
  KOMPLETT_PROFIL: "komplett profil",
};
const SCOPE_REKKEFOLGE: readonly DelingScope[] = ["TEST_RESULTATER", "STATS", "KOMPLETT_PROFIL"];

export type SamtykkeVurdering = { status: SamtykkeStatus; detalj: string };

/**
 * Status for én elev mot én mottakergruppe (WANG). Bygger på den samme
 * regelen som ekstern-leser-scopet (harGyldigSamtykke): nyeste rad per scope
 * vinner, og under 16 teller bare foresattes rader.
 *
 *  - delt:    minst ett scope er gyldig delt nå.
 *  - venter:  under 16, eleven har selv sagt ja, men ingen foresatt har godkjent.
 *  - trukket: har delt før, men nyeste rad er et trekk.
 *  - ikke:    ingen rader mot gruppen.
 */
export function vurderSamtykke(rader: readonly DelingSamtykkeRad[], mottakerGruppeId: string, kreverForesatt: boolean): SamtykkeVurdering {
  const mine = rader.filter((r) => r.mottakerGruppeId === mottakerGruppeId);
  if (mine.length === 0) return { status: "ikke", detalj: "Har ikke delt med WANG" };

  const delte = SCOPE_REKKEFOLGE.filter((scope) => harGyldigSamtykke(mine, { scope, mottakerGruppeId, kreverForesatt }));
  const nyeste = [...mine].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  if (delte.length > 0) {
    const gyldige = mine.filter((r) => r.gitt && delte.includes(r.scope as DelingScope) && (!kreverForesatt || r.gittAvRolle === "FORESATT"));
    const sist = gyldige.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const hva = delte.map((s) => SCOPE_NAVN[s]).join(", ");
    const foresatt = sist?.gittAvRolle === "FORESATT" ? " · forelder godkjente" : "";
    const dato = sist ? ` ${formaterDato(sist.createdAt)}` : "";
    return { status: "delt", detalj: `Delt${dato}: ${hva}${foresatt}` };
  }

  if (kreverForesatt) {
    const selvJa = mine.some((r) => r.gitt && r.gittAvRolle === "SELV");
    const foresattRader = mine.filter((r) => r.gittAvRolle === "FORESATT");
    if (selvJa && foresattRader.length === 0) {
      return { status: "venter", detalj: "Under 16 · forelder har ikke godkjent ennå" };
    }
  }

  if (mine.some((r) => r.gitt)) {
    return { status: "trukket", detalj: `Trakk delingen ${formaterDato(nyeste.createdAt)}` };
  }
  return { status: "ikke", detalj: "Har ikke delt med WANG" };
}

export function passerSamtykkeFilter(status: SamtykkeStatus, filter: SamtykkeFilter): boolean {
  if (filter === "alle") return true;
  if (filter === "ikke") return status === "ikke" || status === "trukket";
  return status === filter;
}

// ---------------------------------------------------------------- WANG-26

export const TRINN = ["VG1", "VG2", "VG3"] as const;
export type Trinn = (typeof TRINN)[number];
export type TrinnFilter = Trinn | "alle";

export function lesTrinn(v: string | string[] | undefined): TrinnFilter {
  return v === "VG1" || v === "VG2" || v === "VG3" ? v : "alle";
}

/** Skoleår for en dato: fra 1. august. «2026/2027», samme format som SchoolScheduleEntry.schoolYear. */
export function skolearFor(aar: number, maned1til12: number): string {
  return maned1til12 >= 8 ? `${aar}/${aar + 1}` : `${aar - 1}/${aar}`;
}

const osloAarManed = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit" });

/** Skoleåret akkurat nå i norsk tid, kort: «2026/27». */
export function skolearKort(naa: Date): string {
  const [aar, maned] = osloAarManed.format(naa).split("-").map(Number);
  const [fra, til] = skolearFor(aar, maned).split("/");
  return `${fra}/${til.slice(2)}`;
}

/** «YYYY-MM-DD» fra adressen, ellers null. Parses med Date.UTC-komponenter (gotchas §Tid). */
export function lesUkeParam(v: string | string[] | undefined): { aar: number; maned: number; dag: number } | null {
  if (typeof v !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  const aar = Number(m[1]);
  const maned = Number(m[2]);
  const dag = Number(m[3]);
  const d = new Date(Date.UTC(aar, maned - 1, dag));
  if (d.getUTCFullYear() !== aar || d.getUTCMonth() !== maned - 1 || d.getUTCDate() !== dag) return null;
  return { aar, maned, dag };
}

export const SKOLE_KATEGORI_NAVN: Record<string, string> = {
  TIME: "Time",
  PROVE: "Prøve",
  HELDAGSPROVE: "Heldagsprøve",
  EKSAMEN: "Eksamen",
  FERIE: "Fri",
  SKOLETUR: "Skoletur",
  ANNET: "Annet",
};

export function skoleKategoriNavn(kategori: string): string {
  return SKOLE_KATEGORI_NAVN[kategori] ?? kategori;
}

// ---------------------------------------------------------------- WANG-32

export type BesattePlasser = { perTrinn: Record<Trinn, number>; utenTrinn: number; totalt: number };

/** Teller elever per trinn. Ukjent eller manglende trinn telles som «uten trinn». */
export function telBesatte(trinn: ReadonlyArray<string | null>): BesattePlasser {
  const perTrinn: Record<Trinn, number> = { VG1: 0, VG2: 0, VG3: 0 };
  let utenTrinn = 0;
  for (const t of trinn) {
    if (t === "VG1" || t === "VG2" || t === "VG3") perTrinn[t] += 1;
    else utenTrinn += 1;
  }
  return { perTrinn, utenTrinn, totalt: trinn.length };
}
