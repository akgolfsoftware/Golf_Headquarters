// Rene funksjoner som bygger sesongmodellen (perioder, tidslinje, årshjul-
// farger, måneddetalj) fra EKTE AgencyOS-data (WangLiveData) — erstatter de
// hardkodede PERIODS/COMPS/TIMELINE_*/monthInfo fra wang-plan.ts når live-data
// finnes. Ingen DB-import her (kalles fra klientkomponenter også).

import { COMPS, TESTS, SCHOOL, TRAINING_CAMPS, FULL_DAY_CAMPS, PARENT_MEETINGS, type WangFarge, type Okt } from "./wang-plan";
import type { WangHendelseDb, WangPeriodeDb, WangSkoleDagDb, WangFastOkt, WangLiveData } from "./hent-wang-gruppe";

export interface LivePeriode {
  key: string;
  name: string;
  color: string;
  start: string; // iso
  end: string; // iso
  focus: string;
}

// Faste navn/farger per indeks — GroupPeriodBlock kommer alltid kronologisk
// TURNERING(høst) → GRUNN → SPESIAL → TURNERING(vår), samme rekkefølge som
// COACH_PERIODS i coach-arsplan.ts (turnr/grunn/spes/turn).
const PERIODE_STIL: { key: string; navn: string; color: string }[] = [
  { key: "turnr", navn: "TURN-rest", color: "var(--cat-orange)" },
  { key: "grunn", navn: "GRUNN", color: "var(--wang-navy)" },
  { key: "spes", navn: "SPES", color: "var(--wang-teal)" },
  { key: "turn", navn: "TURN", color: "var(--cat-orange)" },
];

export function byggLivePerioder(db: WangPeriodeDb[]): LivePeriode[] {
  return db.map((p, i) => {
    const stil = PERIODE_STIL[i] ?? PERIODE_STIL[PERIODE_STIL.length - 1];
    return { key: stil.key, name: stil.navn, color: stil.color, start: p.startIso, end: p.endIso, focus: p.fokus ?? "" };
  });
}

export function spennFraPerioder(perioder: LivePeriode[]): { startIso: string; endIso: string } {
  const startIso = perioder.reduce((min, p) => (p.start < min ? p.start : min), perioder[0].start);
  const endIso = perioder.reduce((max, p) => (p.end > max ? p.end : max), perioder[0].end);
  return { startIso, endIso };
}

function ms(iso: string): number {
  return new Date(iso + "T00:00:00Z").getTime();
}

export function totalUker(startIso: string, endIso: string): number {
  return Math.floor((ms(endIso) - ms(startIso)) / (7 * 864e5)) + 1;
}

/** Posisjon 0–100 % for en ISO-dato langs det ekte sesongspennet. */
export function pctFraSpenn(iso: string, startIso: string, endIso: string): number {
  return ((ms(iso) - ms(startIso)) / (ms(endIso) - ms(startIso))) * 100;
}

export function klampTilLiveSesong(isoStr: string, startIso: string, endIso: string): string {
  if (isoStr < startIso) return startIso;
  if (isoStr > endIso) return endIso;
  return isoStr;
}

export function periodeForDato(perioder: LivePeriode[], iso: string): LivePeriode | null {
  return perioder.find((p) => iso >= p.start && iso <= p.end) ?? null;
}

/**
 * Periodenøkkel for en gitt måned — telles per dag og returnerer perioden med
 * flest dager i måneden ("pause" hvis flest dager ligger utenom sesongspennet).
 * En enkelt representativ dag (f.eks. 15.) bommer når en periode starter
 * midt i måneden (TURN-rest starter 17. aug) — flertallstelling er robust.
 */
export function monthPkLive(m: number, y: number, perioder: LivePeriode[]): string | "pause" {
  const dagerIMaaned = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const opptelling: Record<string, number> = {};
  for (let d = 1; d <= dagerIMaaned; d++) {
    const dagIso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const key = periodeForDato(perioder, dagIso)?.key ?? "pause";
    opptelling[key] = (opptelling[key] ?? 0) + 1;
  }
  let best: string = "pause";
  let bestCount = -1;
  for (const [k, c] of Object.entries(opptelling)) {
    if (c > bestCount) {
      best = k;
      bestCount = c;
    }
  }
  return best;
}

export function periodeFarge(perioder: LivePeriode[]): Record<string, string> {
  const out: Record<string, string> = { pause: "var(--neutral-300)" };
  perioder.forEach((p) => (out[p.key] = p.color));
  return out;
}

export interface LiveTidslinjeSeg {
  w: number;
  color: string;
  short: string;
}
export function tidslinjeSegs(perioder: LivePeriode[], startIso: string, endIso: string): LiveTidslinjeSeg[] {
  return perioder.map((p) => ({
    w: pctFraSpenn(p.end, startIso, endIso) - pctFraSpenn(p.start, startIso, endIso),
    color: p.color,
    short: p.name,
  }));
}

// ---- Turneringer avledet fra gruppekalenderen -----------------------------
export interface LiveTurnering {
  navn: string;
  startIso: string;
  sluttIso: string;
  sted: string | null;
}

/** Eneste sted som avgjør om en GroupSchedule-rad er en turnering — brukes både til å
 * BYGGE turneringslisten og til å EKSKLUDERE turneringer fra andre hendelseslister
 * (f.eks. «Kommende samlinger og tester»), slik at samme hendelse aldri vises to steder. */
export function erTurneringstittel(tittel: string): boolean {
  return tittel.startsWith("Turnering:") || tittel.startsWith("Klubbmesterskap");
}

export function turneringerFraHendelser(hendelser: WangHendelseDb[]): LiveTurnering[] {
  return hendelser
    .filter((h) => erTurneringstittel(h.tittel))
    .map((h) => ({
      navn: h.tittel.replace(/^Turnering:\s*/, ""),
      startIso: h.startIso,
      sluttIso: h.sluttIso,
      sted: h.sted,
    }))
    .sort((a, b) => a.startIso.localeCompare(b.startIso));
}

export interface LiveTidslinjeMerke {
  left: string;
  /** Antall turneringer klynget på denne posisjonen (tette datoer slås sammen med tallbadge, aldri flere separate prikker som kan leses som duplikater). */
  count: number;
}

/** Slår sammen turneringer som ligger tettere enn TERSKEL prosentpoeng til én klynge — unngår at
 * tette datoer (f.eks. flere turneringer samme uke) vises som mange overlappende/duplikat-aktige prikker. */
export function tidslinjeMerker(turneringer: LiveTurnering[], startIso: string, endIso: string): LiveTidslinjeMerke[] {
  const TERSKEL = 2.5;
  const posisjoner = turneringer
    .map((t) => pctFraSpenn(t.startIso, startIso, endIso))
    .sort((a, b) => a - b);
  const klynger: number[][] = [];
  for (const p of posisjoner) {
    const siste = klynger[klynger.length - 1];
    if (siste && p - siste[siste.length - 1] <= TERSKEL) siste.push(p);
    else klynger.push([p]);
  }
  return klynger.map((k) => ({
    left: (k.reduce((a, b) => a + b, 0) / k.length).toFixed(1) + "%",
    count: k.length,
  }));
}

// ---- Måneddetalj (erstatter monthInfo() fra wang-plan.ts) ----------------
export interface LiveMonthInfo {
  key: string;
  name: string;
  year: number;
  isNow: boolean;
  periodName: string;
  periodColor: string;
  sessionCount: number;
  compCount: number;
  testCount: number;
  focus: string;
  hasEvents: boolean;
  events: { iso: string; icon: string; color: WangFarge; title: string; sub: string; dateShort: string }[];
}

const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const MND_LANG = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

function inMaaned(dato: string, m: number, y: number): boolean {
  const [dy, dm] = dato.split("-").map(Number);
  return dy === y && dm - 1 === m;
}
function dagIMaaned(iso: string): number {
  return Number(iso.slice(8, 10));
}
function kortDato(iso: string): string {
  return `${dagIMaaned(iso)}. ${MND_KORT[Number(iso.slice(5, 7)) - 1]}`;
}
/** Antall forekomster av en gitt Oslo-ukedag (0=man..6=søn) i en måned. */
function ukedagAntallIMaaned(ukedag: number, m: number, y: number): number {
  const dagerIMaaned = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  let antall = 0;
  for (let d = 1; d <= dagerIMaaned; d++) {
    // getUTCDay(): 0=søn..6=lør → konverter til 0=man..6=søn
    const wd = (new Date(Date.UTC(y, m, d)).getUTCDay() + 6) % 7;
    if (wd === ukedag) antall++;
  }
  return antall;
}

export function liveMonthInfo(params: {
  m: number;
  y: number;
  naaIso: string | null;
  perioder: LivePeriode[];
  startIso: string;
  endIso: string;
  hendelser: WangHendelseDb[];
  turneringer: LiveTurnering[];
  skoleDager: WangSkoleDagDb[];
  fasteOkter: WangFastOkt[];
}): LiveMonthInfo {
  const { m, y, naaIso, perioder, hendelser, turneringer, skoleDager, fasteOkter } = params;
  const pk = monthPkLive(m, y, perioder);
  const periode = pk === "pause" ? null : (perioder.find((p) => p.key === pk) ?? null);

  const testerIMaaned = hendelser.filter((h) => inMaaned(h.startIso, m, y) && /test/i.test(h.tittel));
  const samlingerIMaaned = hendelser.filter(
    (h) => inMaaned(h.startIso, m, y) && (h.kind === "SAMLING" || h.kind === "HELDAGSSAMLING"),
  );
  const turneringerIMaaned = turneringer.filter((t) => inMaaned(t.startIso, m, y));
  const skoleIMaaned = skoleDager.filter((s) => inMaaned(s.dato, m, y));

  const sessionCount = fasteOkter.reduce((sum, f) => sum + ukedagAntallIMaaned(f.ukedag, m, y), 0);

  const ev: { iso: string; icon: string; color: WangFarge; title: string; sub: string }[] = [];
  turneringerIMaaned.forEach((t) =>
    ev.push({ iso: t.startIso, icon: "trophy", color: "orange", title: t.navn, sub: "Turnering" + (t.sted ? " · " + t.sted : "") }),
  );
  testerIMaaned.forEach((t) => ev.push({ iso: t.startIso, icon: "clipboard-list", color: "purple", title: t.tittel, sub: "Testdag" }));
  samlingerIMaaned.forEach((s) =>
    ev.push({
      iso: s.startIso,
      icon: s.kind === "HELDAGSSAMLING" ? "sun" : "users",
      color: s.kind === "HELDAGSSAMLING" ? "teal" : "navy",
      title: s.tittel,
      sub: (s.kind === "HELDAGSSAMLING" ? "Heldagssamling" : "Samling") + (s.sted ? " · " + s.sted : ""),
    }),
  );
  skoleIMaaned.forEach((s) => ev.push({ iso: s.dato, icon: "calendar", color: "blue", title: s.tittel, sub: "Skolerute" }));
  ev.sort((a, b) => (a.iso < b.iso ? -1 : 1));

  const naa = naaIso;
  return {
    key: `${y}-${m}`,
    name: MND_LANG[m].charAt(0).toUpperCase() + MND_LANG[m].slice(1),
    year: y,
    isNow: naa !== null && Number(naa.slice(0, 4)) === y && Number(naa.slice(5, 7)) - 1 === m,
    periodName: periode ? periode.name : "Utenom sesong",
    periodColor: periode ? periode.color : "var(--neutral-300)",
    sessionCount,
    compCount: turneringerIMaaned.length,
    testCount: testerIMaaned.length,
    focus: periode ? periode.focus : "Ingen registrert AK-periode denne måneden — utenom sesongspennet i AgencyOS.",
    hasEvents: ev.length > 0,
    events: ev.map((e) => ({ iso: e.iso, icon: e.icon, color: e.color, title: e.title, sub: e.sub, dateShort: kortDato(e.iso) })),
  };
}

// ---- Kalenderhendelser (dagdetalj i Plan → Kalender) ----------------------
// Slår sammen demo-øktmalene (ingen live øktinnhold finnes i basen ennå) med
// ekte turneringer/tester/skoledager fra AgencyOS — én kilde for alle
// kalenderprikker, i stedet for den 100 % hardkodede EVENTS-tabellen.
export interface DagHendelse {
  type: "okt" | "konkurranse" | "prove" | "skole" | "samling";
  label: string;
  time?: string;
  sted?: string | null;
}

export function byggLiveKalenderHendelser(
  sessions: Pick<Okt, "iso" | "short" | "timeLabel">[],
  live: WangLiveData | null,
): Record<string, DagHendelse[]> {
  const out: Record<string, DagHendelse[]> = {};
  const push = (iso: string, h: DagHendelse) => {
    (out[iso] ??= []).push(h);
  };

  sessions.forEach((s) => push(s.iso, { type: "okt", label: s.short, time: s.timeLabel }));

  if (live) {
    const turneringer = turneringerFraHendelser(live.hendelser);
    turneringer.forEach((t) => push(t.startIso, { type: "konkurranse", label: t.navn, sted: t.sted }));

    live.hendelser
      .filter((h) => /test/i.test(h.tittel) && !erTurneringstittel(h.tittel))
      .forEach((h) => push(h.startIso, { type: "prove", label: h.tittel, time: h.startTid, sted: h.sted }));

    live.hendelser
      .filter((h) => h.kind === "SAMLING" || h.kind === "HELDAGSSAMLING")
      .forEach((h) => push(h.startIso, { type: "samling", label: h.tittel, time: h.startTid, sted: h.sted }));

    live.skoleDager.forEach((s) => push(s.dato, { type: "skole", label: s.tittel }));
  } else {
    // Demo-fallback (ingen AgencyOS-data tilgjengelig) — samme kategorier
    // som live-grenen, hentet fra sesongplan-malen i wang-plan.ts, slik at
    // kalenderen og «Nøkkelhendelser» (monthInfo) alltid viser samme hendelser.
    COMPS.forEach((c) => push(c.iso, { type: "konkurranse", label: c.name, sted: c.place }));
    TESTS.forEach((t) => push(t.iso, { type: "prove", label: t.name }));
    SCHOOL.forEach((s) => push(s.iso, { type: "skole", label: s.name }));
    TRAINING_CAMPS.forEach((c) => push(c.iso, { type: "samling", label: c.name, sted: c.hvor }));
    FULL_DAY_CAMPS.forEach((c) => push(c.iso, { type: "samling", label: c.tema, sted: c.hvor }));
    PARENT_MEETINGS.forEach((p) => push(p.iso, { type: "skole", label: "Foreldremøte: " + p.tema, time: p.tid, sted: p.hvor }));
  }

  return out;
}
