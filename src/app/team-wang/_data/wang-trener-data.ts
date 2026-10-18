// Visningsmodellen for WANG-trenerflaten (/team-wang/coach), bygget av ekte
// gruppedata fra hentWangGruppe. Erstatter de faste eksempeldataene i
// src/components/wang/wang-data.ts (skjermkontroll 15.10.2026, funn 4).
// Det som ikke finnes i basen, er ikke med her: skjermene viser da tom tilstand.

import type { WangLiveData } from "./hent-wang-gruppe";

const FASE_NAVN: Record<string, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialperiode",
  TURNERING: "Turneringsperiode",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
  RESTITUSJON: "Restitusjon",
};

const UKEDAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export interface WangTrenerPerson {
  id: string;
  navn: string;
}

export interface WangTrenerUkeOkt {
  id: string;
  datoIso: string;
  dag: string;
  tittel: string;
  tid: string;
  /** «HH:mm» (Oslo). */
  startTid: string;
  /** «HH:mm» (Oslo). Null når økta slutter en annen dag. */
  sluttTid: string | null;
  sted: string | null;
  /** Trenerens egen beskrivelse fra kalenderen. Kan inneholde elevnavn: bare for trenerflaten. */
  beskrivelse: string | null;
  passert: boolean;
}

export interface WangTrenerPeriode {
  id: string;
  /** Kodenavnet fra basen (GRUNN, SPESIAL …). Styrer den nøytrale periodetonen. */
  fase: string;
  navn: string;
  fokus: string | null;
  startIso: string;
  endIso: string;
  /** ISO-ukenummer for første og siste dag. */
  fraUke: number;
  tilUke: number;
  /** Minutter per uke fra perioden, når den er satt. */
  ukevolMin: number | null;
  ukevolMax: number | null;
  status: "avsluttet" | "naa" | "kommende";
}

export interface WangTrenerHendelse {
  id: string;
  tittel: string;
  startIso: string;
  sluttIso: string;
  sted: string | null;
  passert: boolean;
}

export interface WangTrenerFastOkt {
  dag: string;
  tid: string;
  tittel: string;
  sted: string | null;
}

export interface WangTrenerData {
  gruppeNavn: string;
  idagIso: string;
  /** Klokka i Oslo da siden ble laget («HH:mm»), eller null når den ikke er kjent. */
  naaTid: string | null;
  ukeTekst: string;
  elever: WangTrenerPerson[];
  trenere: (WangTrenerPerson & { rolle: "Trener" | "Assistent" })[];
  ukeOkter: WangTrenerUkeOkt[];
  fasteOkter: WangTrenerFastOkt[];
  perioder: WangTrenerPeriode[];
  turneringer: WangTrenerHendelse[];
  samlinger: WangTrenerHendelse[];
  testdager: WangTrenerHendelse[];
}

/** Klokka i Oslo som «HH:mm». */
export function osloNaaTid(naa: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Oslo",
  }).format(naa);
}

/** Dagens dato i Oslo som «YYYY-MM-DD». */
export function osloIdagIso(naa: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(naa);
}

function leggTilDager(iso: string, antall: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + antall)).toISOString().slice(0, 10);
}

/** 0 = mandag … 6 = søndag. */
function ukedag(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const dag = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dag === 0 ? 6 : dag - 1;
}

/** ISO 8601-ukenummer. */
export function ukenummer(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  // Torsdagen i samme uke avgjør hvilket år uka hører til.
  const torsdag = new Date(Date.UTC(y, m - 1, d + 3 - ukedag(iso)));
  const nyttaar = new Date(Date.UTC(torsdag.getUTCFullYear(), 0, 1));
  return Math.floor((torsdag.getTime() - nyttaar.getTime()) / 86_400_000 / 7) + 1;
}

const kortDato = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

export function erTurnering(tittel: string): boolean {
  return tittel.startsWith("Turnering:") || tittel.startsWith("Klubbmesterskap");
}

export function byggWangTrenerData(
  live: WangLiveData,
  idagIso: string,
  naaTid: string | null = null,
): WangTrenerData {
  const mandag = leggTilDager(idagIso, -ukedag(idagIso));
  const sondag = leggTilDager(mandag, 6);
  const ukeDager = Array.from({ length: 7 }, (_, i) => leggTilDager(mandag, i));

  const ukeOkter: WangTrenerUkeOkt[] = [];
  ukeDager.forEach((datoIso, i) => {
    live.fasteOkter
      .filter((o) => o.ukedag === i)
      .forEach((o) =>
        ukeOkter.push({
          id: `fast-${datoIso}-${o.startTid}-${o.tittel}`,
          datoIso,
          dag: UKEDAG_KORT[i],
          tittel: o.tittel,
          tid: `${o.startTid}–${o.sluttTid}`,
          startTid: o.startTid,
          sluttTid: o.sluttTid,
          sted: o.sted,
          beskrivelse: null,
          passert: datoIso < idagIso,
        }),
      );
    live.hendelser
      .filter((h) => h.startIso === datoIso && !erTurnering(h.tittel))
      .forEach((h) =>
        ukeOkter.push({
          id: h.id,
          datoIso,
          dag: UKEDAG_KORT[i],
          tittel: h.tittel,
          tid: h.sluttIso === h.startIso ? `${h.startTid}–${h.sluttTid}` : h.startTid,
          startTid: h.startTid,
          sluttTid: h.sluttIso === h.startIso ? h.sluttTid : null,
          sted: h.sted,
          beskrivelse: h.beskrivelse,
          passert: datoIso < idagIso,
        }),
      );
  });
  ukeOkter.sort((a, b) => (a.datoIso + a.tid).localeCompare(b.datoIso + b.tid));

  const tilHendelse = (h: WangLiveData["hendelser"][number]): WangTrenerHendelse => ({
    id: h.id,
    tittel: h.tittel.replace(/^Turnering:\s*/, ""),
    startIso: h.startIso,
    sluttIso: h.sluttIso,
    sted: h.sted,
    passert: h.sluttIso < idagIso,
  });
  const etterDato = (a: { startIso: string }, b: { startIso: string }) =>
    a.startIso.localeCompare(b.startIso);

  return {
    gruppeNavn: live.gruppeNavn,
    idagIso,
    naaTid,
    ukeTekst: `Uke ${ukenummer(idagIso)} · ${kortDato(mandag)}–${kortDato(sondag)}.${sondag.slice(0, 4)}`,
    elever: live.elever
      .filter((e) => e.rolle === "PLAYER")
      .map((e) => ({ id: e.id, navn: e.navn })),
    trenere: live.elever
      .filter((e) => e.rolle === "COACH" || e.rolle === "ASSISTANT")
      .map((e) => ({ id: e.id, navn: e.navn, rolle: e.rolle === "COACH" ? "Trener" : "Assistent" })),
    ukeOkter,
    fasteOkter: [...live.fasteOkter]
      .sort((a, b) => a.ukedag - b.ukedag || a.startTid.localeCompare(b.startTid))
      .map((o) => ({
        dag: UKEDAG_KORT[o.ukedag] ?? "—",
        tid: `${o.startTid}–${o.sluttTid}`,
        tittel: o.tittel,
        sted: o.sted,
      })),
    perioder: [...live.perioder].sort(etterDato).map((p) => ({
      id: p.id,
      fase: p.fase,
      navn: FASE_NAVN[p.fase] ?? p.fase,
      fokus: p.fokus,
      startIso: p.startIso,
      endIso: p.endIso,
      fraUke: ukenummer(p.startIso),
      tilUke: ukenummer(p.endIso),
      ukevolMin: p.ukevolMin,
      ukevolMax: p.ukevolMax,
      status: p.endIso < idagIso ? "avsluttet" : p.startIso > idagIso ? "kommende" : "naa",
    })),
    turneringer: live.hendelser.filter((h) => erTurnering(h.tittel)).map(tilHendelse).sort(etterDato),
    samlinger: live.hendelser
      .filter((h) => h.kind === "SAMLING" || h.kind === "HELDAGSSAMLING")
      .map(tilHendelse)
      .sort(etterDato),
    testdager: live.hendelser
      .filter((h) => /test/i.test(h.tittel) && !erTurnering(h.tittel))
      .map(tilHendelse)
      .sort(etterDato),
  };
}

/** «2026-10-14» → «14.10.2026». */
export function visDato(iso: string): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
}
