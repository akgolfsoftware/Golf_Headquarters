// date-parser.ts — naturlig-språk-til-dato for treningsplanlegger.
//
// Støttede formater (norsk bokmål):
//   - "i dag", "i morgen", "i overmorgen", "i går"
//   - "neste mandag", "denne fredag", "forrige onsdag"
//   - "om 3 dager", "om 2 uker", "om en måned"
//   - "15. mai", "1. juni" (året tolkes som inneværende eller neste)
//   - "2 uker før Bossum Open" — turnering-anker (krever spilllerId)
//   - "1 uke etter Storehagen" — turnering-anker
//
// Returnerer dato + konfidens-score + menneskelig forklaring.

import { addDays, addMonths, addWeeks, parse, isValid, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type ParseInput = {
  text: string;
  basisdato?: Date;
  spilllerId?: string;
};

export type ParseResultat = {
  dato: Date | null;
  konfidens: number;
  forklaring: string;
};

// ---------------------------------------------------------------------------
// Konstanter
// ---------------------------------------------------------------------------

const UKEDAGER: Record<string, number> = {
  mandag: 1,
  tirsdag: 2,
  onsdag: 3,
  torsdag: 4,
  fredag: 5,
  lordag: 6,
  loerdag: 6,
  "lørdag": 6,
  sondag: 7,
  soendag: 7,
  "søndag": 7,
};

const MAANEDER: Record<string, number> = {
  januar: 0, jan: 0,
  februar: 1, feb: 1,
  mars: 2, mar: 2,
  april: 3, apr: 3,
  mai: 4,
  juni: 5, jun: 5,
  juli: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8,
  oktober: 9, okt: 9,
  november: 10, nov: 10,
  desember: 11, des: 11,
};

const TALLORD: Record<string, number> = {
  en: 1, ett: 1, et: 1,
  to: 2, tre: 3, fire: 4, fem: 5, seks: 6, sju: 7, syv: 7,
  atte: 8, ni: 9, ti: 10,
  "åtte": 8,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function parseDato(input: ParseInput): Promise<ParseResultat> {
  const tekst = input.text.trim().toLowerCase();
  const basis = startOfDay(input.basisdato ?? new Date());

  if (tekst.length === 0) {
    return { dato: null, konfidens: 0, forklaring: "Tom tekst" };
  }

  // 1) Trivielle nøkkelord
  const trivielle = parseTrivielle(tekst, basis);
  if (trivielle) return trivielle;

  // 2) "neste/denne/forrige <ukedag>"
  const ukedag = parseUkedagRelativ(tekst, basis);
  if (ukedag) return ukedag;

  // 3) "om N enheter"
  const om = parseOm(tekst, basis);
  if (om) return om;

  // 4) "DD. <måned>" eller "DD <måned>"
  const maaned = parseDatoMaaned(tekst, basis);
  if (maaned) return maaned;

  // 5) Turnering-anker
  if (input.spilllerId) {
    const turnering = await parseTurneringAnker(tekst, basis, input.spilllerId);
    if (turnering) return turnering;
  }

  // 6) ISO-dato (YYYY-MM-DD)
  const iso = parseIsoDato(tekst);
  if (iso) return iso;

  return {
    dato: null,
    konfidens: 0,
    forklaring: `Forsto ikke '${input.text}'`,
  };
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

function parseTrivielle(tekst: string, basis: Date): ParseResultat | null {
  if (tekst === "i dag" || tekst === "idag") {
    return { dato: basis, konfidens: 1, forklaring: "I dag" };
  }
  if (tekst === "i morgen" || tekst === "imorgen") {
    return { dato: addDays(basis, 1), konfidens: 1, forklaring: "I morgen" };
  }
  if (tekst === "i overmorgen" || tekst === "iovermorgen") {
    return { dato: addDays(basis, 2), konfidens: 1, forklaring: "I overmorgen" };
  }
  if (tekst === "i går" || tekst === "igår" || tekst === "i gar") {
    return { dato: addDays(basis, -1), konfidens: 1, forklaring: "I går" };
  }
  return null;
}

function parseUkedagRelativ(tekst: string, basis: Date): ParseResultat | null {
  // mønstre: "neste mandag", "denne fredag", "forrige onsdag", bare "mandag"
  const match = tekst.match(/^(neste|denne|forrige|forrige uke|kommende)?\s*([a-zæøå]+)$/);
  if (!match) return null;
  const modifier = match[1] ?? "denne";
  const dag = match[2];
  if (!dag) return null;
  const dagTall = UKEDAGER[dag];
  if (dagTall === undefined) return null;

  const basisDag = basis.getDay() === 0 ? 7 : basis.getDay();
  let diff = dagTall - basisDag;

  if (modifier === "neste" || modifier === "kommende") {
    if (diff <= 0) diff += 7;
  } else if (modifier === "forrige") {
    if (diff >= 0) diff -= 7;
  } else {
    // "denne" / bare ukedag — bruk samme uke (kan være i fortid)
    if (diff < 0) diff += 7;
  }

  return {
    dato: addDays(basis, diff),
    konfidens: 0.9,
    forklaring: `${modifier} ${dag}`,
  };
}

function parseOm(tekst: string, basis: Date): ParseResultat | null {
  // "om 3 dager", "om en uke", "om 2 måneder"
  const match = tekst.match(/^om\s+(\d+|[a-zæøå]+)\s+(dag|dager|uke|uker|maaned|maaneder|måned|måneder)/);
  if (!match) return null;
  const tallTekst = match[1];
  const enhet = match[2];
  if (!tallTekst || !enhet) return null;
  const antall = Number.isNaN(Number(tallTekst))
    ? (TALLORD[tallTekst] ?? null)
    : Number(tallTekst);
  if (antall == null) return null;

  let dato: Date;
  if (enhet.startsWith("dag")) {
    dato = addDays(basis, antall);
  } else if (enhet.startsWith("uke")) {
    dato = addWeeks(basis, antall);
  } else {
    dato = addMonths(basis, antall);
  }

  return {
    dato,
    konfidens: 0.95,
    forklaring: `om ${antall} ${enhet}`,
  };
}

function parseDatoMaaned(tekst: string, basis: Date): ParseResultat | null {
  // "15. mai", "15 mai", "1. juni 2026"
  const match = tekst.match(/^(\d{1,2})\.?\s+([a-zæøå]+)(?:\s+(\d{4}))?$/);
  if (!match) return null;
  const dag = Number(match[1]);
  const maaned = match[2];
  if (!maaned) return null;
  const maanedTall = MAANEDER[maaned];
  if (maanedTall === undefined) return null;

  let aar = match[3] ? Number(match[3]) : basis.getFullYear();
  const kandidat = new Date(aar, maanedTall, dag);
  if (!isValid(kandidat)) return null;

  // Hvis ingen år gitt, og datoen ligger i fortid, anta neste år.
  if (!match[3] && kandidat < basis) {
    aar += 1;
  }
  const final = new Date(aar, maanedTall, dag);

  return {
    dato: final,
    konfidens: 0.95,
    forklaring: `${dag}. ${maaned} ${aar}`,
  };
}

function parseIsoDato(tekst: string): ParseResultat | null {
  const match = tekst.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const aar = Number(match[1]);
  const maaned = Number(match[2]) - 1;
  const dag = Number(match[3]);
  const d = new Date(aar, maaned, dag);
  if (!isValid(d)) return null;
  return { dato: d, konfidens: 1, forklaring: "ISO-dato" };
}

async function parseTurneringAnker(
  tekst: string,
  _basis: Date,
  spilllerId: string,
): Promise<ParseResultat | null> {
  // "2 uker før Bossum Open", "1 uke etter Storehagen", "3 dager før <navn>"
  const match = tekst.match(
    /^(\d+|[a-zæøå]+)\s+(dag|dager|uke|uker|maaned|maaneder|måned|måneder)\s+(før|etter|for|foer)\s+(.+)$/,
  );
  if (!match) return null;
  const tallTekst = match[1];
  const enhet = match[2];
  const retning = match[3];
  const navn = match[4];
  if (!tallTekst || !enhet || !retning || !navn) return null;

  const antall = Number.isNaN(Number(tallTekst))
    ? (TALLORD[tallTekst] ?? null)
    : Number(tallTekst);
  if (antall == null) return null;

  // Slå opp turnering på navn for spiller.
  const entries = await prisma.tournamentEntry.findMany({
    where: { userId: spilllerId },
    include: { tournament: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const treff = entries.find((e) => {
    const t = (e.tournament?.name ?? e.manualName ?? "").toLowerCase();
    return t.includes(navn.toLowerCase().trim());
  });

  if (!treff) {
    return {
      dato: null,
      konfidens: 0,
      forklaring: `Fant ingen turnering kalt '${navn}'`,
    };
  }

  const turneringsDato = treff.tournament?.startDate ?? treff.manualDate;
  if (!turneringsDato) {
    return {
      dato: null,
      konfidens: 0,
      forklaring: `Turnering '${navn}' mangler dato`,
    };
  }

  const fortegn = retning === "før" || retning === "for" || retning === "foer" ? -1 : 1;
  const offsett = antall * fortegn;

  let dato: Date;
  if (enhet.startsWith("dag")) {
    dato = addDays(turneringsDato, offsett);
  } else if (enhet.startsWith("uke")) {
    dato = addWeeks(turneringsDato, offsett);
  } else {
    dato = addMonths(turneringsDato, offsett);
  }

  return {
    dato,
    konfidens: 0.9,
    forklaring: `${antall} ${enhet} ${retning} ${treff.tournament?.name ?? treff.manualName}`,
  };
}

// Eksporter `parse` for tester (ikke brukt internt).
export { parse };
