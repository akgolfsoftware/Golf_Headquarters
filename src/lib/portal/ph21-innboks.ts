/**
 * PH-21 Innboks (bak bjella): visningsmodell som samler forslag, meldinger og varsler.
 * Ren modul uten database: siden henter kildene, her blir de til saker.
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, mal «innboks».
 */
import type { PlanForslag } from "@/lib/portal/plan-visning";
import type { PH21Message, PH21Plan } from "@/lib/portal-coach/ph21-data";

export type InnboksAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

/** Lite øktkort i et forslag. Manglende verdi er null og vises som «—». */
export type InnboksOkt = { tid: string; navn: string; akse: InnboksAkse | null; info: string | null };

export type InnboksForslag =
  | { kilde: "trener"; id: string; tittel: string; fra: string; org: "WANG" | "TEAM_NORWAY"; tid: string;
      for: InnboksOkt | null; etter: InnboksOkt | null; tekst: string; linjer: string[] }
  | { kilde: "coach"; id: string; tittel: string; fra: string; tid: string; etter: InnboksOkt }
  | { kilde: "plan"; id: string; tittel: string; fra: string; tid: string; tekst: string };

export type InnboksVarsel = {
  id: string; type: string; tittel: string; tekst: string | null; tid: string; ulest: boolean; link: string | null;
};

export type InnboksMelding = { fra: string; tekst: string; tid: string; nye: number } | null;

export type PH21InnboksData = {
  forslag: InnboksForslag[];
  melding: InnboksMelding;
  varsler: InnboksVarsel[];
  harCoach: boolean;
};

/** Trenerforslag slik `hentMineTrenerforslag` leverer dem (samme form som SpillerTrenerforslag). */
type Innslag = { date?: string; startMinute?: number; durationMinutes?: number; title?: string; pyramid?: string; location?: string | null };
export type TrenerforslagInn = {
  id: string; trener: string; opprettet: string;
  forslag:
    | { kind: "IUP_FOCUS"; organisasjon: "WANG"; periodName: string; etter: { akse: string; tittel: string; egentidMinUke: number }[]; begrunnelse: string }
    | { kind: "SESSION_SERIES"; organisasjon: "WANG" | "TEAM_NORWAY"; fra: string; til: string; okter: Innslag[]; begrunnelse: string }
    | { organisasjon: "WANG" | "TEAM_NORWAY"; handling: "ADD" | "UPDATE" | "CANCEL"; for: Partial<Innslag> | null; etter: Innslag | null; begrunnelse: string };
};

const AKSER: readonly InnboksAkse[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const ukedagKort = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
const ukedagOslo = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short", day: "numeric", month: "short" });
const klokkeOslo = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const ymdOslo = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" });

const stor = (s: string) => s.replace(/\.$/, "").replace(/^./, (c) => c.toUpperCase());
const kl = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const akse = (p: string | undefined | null): InnboksAkse | null => (AKSER as readonly string[]).includes(p ?? "") ? (p as InnboksAkse) : null;

/** «Tor 8. okt» fra «2026-10-08». */
export function datoKort(ymd: string | undefined): string {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "—";
  const [y, m, d] = ymd.split("-").map(Number);
  return stor(ukedagKort.format(new Date(Date.UTC(y, m - 1, d))).replace(/([a-zæøå])\./gi, "$1").replace(/,/g, ""));
}

/** «14:13», «i går 20:41» eller «tor 8. okt» relativt til nå (Oslo). */
export function relativTid(d: Date, naa: Date): string {
  const dag = ymdOslo.format(d);
  const idag = ymdOslo.format(naa);
  if (dag === idag) return klokkeOslo.format(d);
  const [y, m, dd] = idag.split("-").map(Number);
  const igaar = new Date(Date.UTC(y, m - 1, dd - 1)).toISOString().slice(0, 10);
  if (dag === igaar) return `i går ${klokkeOslo.format(d)}`;
  return ukedagOslo.format(d).replace(/([a-zæøå])\./gi, "$1").replace(/,/g, "");
}

function innslagOkt(o: Partial<Innslag> | null): InnboksOkt | null {
  if (!o) return null;
  const tid = [datoKort(o.date), o.startMinute == null ? null : kl(o.startMinute)].filter((x) => x && x !== "—").join(" · ");
  const info = [o.durationMinutes == null ? null : `${o.durationMinutes} min`, o.location ?? null].filter(Boolean).join(" · ");
  return { tid: tid || "—", navn: o.title?.trim() || "—", akse: akse(o.pyramid), info: info || null };
}

const ORG_NAVN = { WANG: "WANG Toppidrett", TEAM_NORWAY: "Team Norway" } as const;

export function trenerforslagTilSak(f: TrenerforslagInn, naa: Date): InnboksForslag {
  const p = f.forslag;
  const tid = relativTid(new Date(f.opprettet), naa);
  if ("kind" in p && p.kind === "SESSION_SERIES") {
    const forste = p.okter[0];
    return {
      kilde: "trener", id: f.id, org: p.organisasjon, tid, fra: `${ORG_NAVN[p.organisasjon]} · ${f.trener}`,
      tittel: `Forslag: ${p.okter.length} økter, ${datoKort(p.fra)}–${datoKort(p.til)}`, for: null, etter: innslagOkt(forste ?? null),
      tekst: p.begrunnelse, linjer: p.okter.map((o) => `${datoKort(o.date)} · ${o.title ?? "—"}`),
    };
  }
  if ("kind" in p) {
    return {
      kilde: "trener", id: f.id, org: p.organisasjon, tid, fra: `${ORG_NAVN.WANG} · ${f.trener}`,
      tittel: `Forslag: fokusområder i ${p.periodName}`, for: null, etter: null, tekst: p.begrunnelse,
      linjer: p.etter.map((g) => `${g.akse} · ${g.tittel} · ${g.egentidMinUke} min i uka`),
    };
  }
  const forOkt = innslagOkt(p.for);
  const etterOkt = p.handling === "CANCEL" ? null : innslagOkt(p.etter);
  const tittel = p.handling === "ADD" ? `Forslag: ny økt ${etterOkt?.navn ?? ""}`.trim()
    : p.handling === "CANCEL" ? `Forslag: ta bort ${forOkt?.navn ?? "økta"}`
      : `Forslag: endre ${forOkt?.navn ?? "økta"}`;
  return {
    kilde: "trener", id: f.id, org: p.organisasjon, tid, fra: `${ORG_NAVN[p.organisasjon]} · ${f.trener}`,
    tittel, for: forOkt, etter: etterOkt, tekst: p.begrunnelse, linjer: [],
  };
}

/** Workbench-økta har ikke tidspunkt for når forslaget ble sendt; tiden vises som «—». */
export function coachforslagTilSak(f: PlanForslag): InnboksForslag {
  const s = f.session;
  return {
    kilde: "coach", id: s.id, tid: "—",
    fra: `${f.coachName ?? "Coach"} · coach`, tittel: `Forslag: ${s.title}`,
    etter: {
      tid: `${stor(ukedagOslo.format(s.startTime).replace(/([a-zæøå])\./gi, "$1").replace(/,/g, ""))} · ${klokkeOslo.format(s.startTime)}`,
      navn: s.title || "—", akse: akse(s.pyramidArea), info: [s.durationMin ? `${s.durationMin} min` : null, s.sted].filter(Boolean).join(" · ") || null,
    },
  };
}

export function planTilSak(p: PH21Plan, coachNavn: string | null): InnboksForslag | null {
  if (p.status !== "Venter på spiller") return null;
  return {
    kilde: "plan", id: p.id, tid: p.sent || "—", fra: `${coachNavn ?? "Coach"} · coach`, tittel: `Plan: ${p.title}`,
    tekst: `${p.sessions} økter · ${p.hours}`,
  };
}

/** Siste melding fra coach og hvor mange coachen har sendt etter din siste. */
export function sisteCoachMelding(meldinger: PH21Message[], coachNavn: string | null): InnboksMelding {
  if (!meldinger.length || !coachNavn) return null;
  let nye = 0;
  for (let i = meldinger.length - 1; i >= 0 && meldinger[i].role === "coach"; i--) nye++;
  const siste = meldinger[meldinger.length - 1];
  return { fra: coachNavn, tekst: siste.role === "me" ? `Du: ${siste.text}` : siste.text, tid: siste.t, nye };
}

export function tellInnboks(d: PH21InnboksData) {
  const forslag = d.forslag.length;
  const meldinger = d.melding?.nye ?? 0;
  const varsler = d.varsler.filter((v) => v.ulest).length;
  return { forslag, meldinger, varsler, venter: forslag + meldinger + varsler };
}
