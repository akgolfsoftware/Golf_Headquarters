/**
 * PlayerHQ pakke 17b · Opptatt tid: rene regler for uka og lista over faste avtaler
 * (docs/design-system/utkast-playerhq/plan-hjelpere.html, «Opptatt tid»). Ingen database.
 *
 * Kilder: spillerens egne avtaler (PlayerBusyBlock, «WEEKLY» gjentas hver uke fra startAt, som i
 * lib/portal/tilgjengelighet.ts), øktene i planen og avtaler fra Google-kalenderen. Google-avtaler
 * vises bare som «Opptatt».
 */

const DAG_MS = 86_400_000;
const UKE_MS = 7 * DAG_MS;
const OSLO_YMD = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" });
const OSLO_KL = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hour12: false });
const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
const OSLO_UKEDAG = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long" });
const KORT = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"] as const;

export type Akse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export type OpptattBlokkInn = { id: string; title: string; startAt: Date; endAt: Date; recurring: string | null; isPrivate: boolean };
export type UkeOktInn = { title: string; startTime: Date; pyramidArea: string | null };
export type GoogleInn = { startAt: Date; endAt: Date; allDay: boolean };

export type UkeBlokk = { type: "opptatt" | "google" | "okt"; akse: Akse | null; tekst: string };
export type UkeDag = { kort: string; dato: string; idag: boolean; blokker: UkeBlokk[] };
export type FastAvtale = { id: string; tittel: string; under: string; ukentlig: boolean; privat: boolean };

export const osloYmd = (d: Date) => OSLO_YMD.format(d);

/** «08» for hele timer, ellers «08:30». */
export function kl(d: Date): string {
  const t = OSLO_KL.format(d);
  return t.endsWith(":00") ? t.slice(0, 2) : t;
}

const AKSER = new Set<string>(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
const tilAkse = (v: string | null): Akse | null => (v && AKSER.has(v) ? (v as Akse) : null);

/** Forekomstene av en avtale i [fra, til). Ukentlige hoppes fram uten å iterere fra startAt. */
export function forekomster(b: Pick<OpptattBlokkInn, "startAt" | "endAt" | "recurring">, fra: Date, til: Date): { start: Date; slutt: Date }[] {
  const varighet = b.endAt.getTime() - b.startAt.getTime();
  if (b.recurring !== "WEEKLY") {
    return b.endAt > fra && b.startAt < til ? [{ start: b.startAt, slutt: b.endAt }] : [];
  }
  const ut: { start: Date; slutt: Date }[] = [];
  let t = b.startAt.getTime();
  if (t + varighet <= fra.getTime()) t += Math.ceil((fra.getTime() - varighet - t) / UKE_MS) * UKE_MS;
  for (; t < til.getTime(); t += UKE_MS) {
    if (t + varighet > fra.getTime()) ut.push({ start: new Date(t), slutt: new Date(t + varighet) });
  }
  return ut;
}

/**
 * Sju dager fra mandag (Oslo, «YYYY-MM-DD»). `fra` og `til` er uka som tidspunkter (halvåpent).
 * Innen hver dag: egne avtaler først, så Google, så øktene, hver sortert på klokkeslett.
 */
export function byggUke(input: {
  mandag: string; idag: string; fra: Date; til: Date;
  blokker: readonly OpptattBlokkInn[]; okter: readonly UkeOktInn[]; google: readonly GoogleInn[];
}): UkeDag[] {
  const [y, m, d] = input.mandag.split("-").map(Number);
  const dager = KORT.map((kort, i) => {
    const dato = new Date(Date.UTC(y, m - 1, d + i));
    const ymd = dato.toISOString().slice(0, 10);
    return { ymd, dag: { kort, dato: `${dato.getUTCDate()}.`, idag: ymd === input.idag, blokker: [] as UkeBlokk[] } };
  });
  const sortert: { ymd: string; t: number; rang: number; blokk: UkeBlokk }[] = [];
  for (const b of input.blokker) {
    for (const f of forekomster(b, input.fra, input.til)) {
      sortert.push({ ymd: osloYmd(f.start), t: f.start.getTime(), rang: 0, blokk: { type: "opptatt", akse: null, tekst: `${b.title} ${kl(f.start)}–${kl(f.slutt)}` } });
    }
  }
  for (const g of input.google) {
    if (g.endAt <= input.fra || g.startAt >= input.til) continue;
    sortert.push({ ymd: osloYmd(g.startAt), t: g.startAt.getTime(), rang: 1, blokk: { type: "google", akse: null, tekst: g.allDay ? "Opptatt hele dagen" : `${kl(g.startAt)} Opptatt` } });
  }
  for (const o of input.okter) {
    sortert.push({ ymd: osloYmd(o.startTime), t: o.startTime.getTime(), rang: 2, blokk: { type: "okt", akse: tilAkse(o.pyramidArea), tekst: `${OSLO_KL.format(o.startTime)} ${o.title}` } });
  }
  sortert.sort((a, b) => a.rang - b.rang || a.t - b.t);
  for (const s of sortert) dager.find((x) => x.ymd === s.ymd)?.dag.blokker.push(s.blokk);
  return dager.map((x) => x.dag);
}

/** Faste avtaler: ukentlige først, så enkeltavtaler som ikke er over, hver i tidsrekkefølge. */
export function fasteAvtaler(blokker: readonly OpptattBlokkInn[], naa: Date): FastAvtale[] {
  const ukentlige = blokker.filter((b) => b.recurring === "WEEKLY");
  const enkle = blokker.filter((b) => b.recurring !== "WEEKLY" && b.endAt >= naa);
  const tekst = (b: OpptattBlokkInn) => {
    const tid = `${kl(b.startAt)}–${kl(b.endAt)}`;
    const nar = b.recurring === "WEEKLY"
      ? `${OSLO_UKEDAG.format(b.startAt).replace(/^./, (c) => c.toUpperCase())} ${tid} · ukentlig`
      : `${OSLO_DATO.format(b.startAt)} ${tid} · én gang`;
    return b.isPrivate ? `${nar} · coachen ser «Opptatt»` : nar;
  };
  const sorter = (a: OpptattBlokkInn, b: OpptattBlokkInn) => a.startAt.getTime() - b.startAt.getTime();
  return [...ukentlige.sort(sorter), ...enkle.sort(sorter)].map((b) => ({
    id: b.id, tittel: b.title, under: tekst(b), ukentlig: b.recurring === "WEEKLY", privat: b.isPrivate,
  }));
}
