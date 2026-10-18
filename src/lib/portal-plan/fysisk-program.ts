/**
 * PlayerHQ pakke 17b · Fysisk program: rene regler fra FysiskPlan → FysUke → FysOkt → FysOvelseRad
 * til skjermen (docs/design-system/utkast-playerhq/plan-hjelpere.html, «Fysisk program»).
 * Ingen database. Mangler et tall, blir det null, og skjermen skriver «—».
 */

const DAG_MS = 86_400_000;
const OSLO_YMD = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" });
const KORT_DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short" });

export type Ukedag = "MAN" | "TIR" | "ONS" | "TOR" | "FRE" | "LOR" | "SON";
const DAG_IDX: Record<Ukedag, number> = { MAN: 0, TIR: 1, ONS: 2, TOR: 3, FRE: 4, LOR: 5, SON: 6 };
const DAG_LANG: Record<Ukedag, string> = { MAN: "Mandag", TIR: "Tirsdag", ONS: "Onsdag", TOR: "Torsdag", FRE: "Fredag", LOR: "Lørdag", SON: "Søndag" };
const DAG_KORT: Record<Ukedag, string> = { MAN: "Man", TIR: "Tir", ONS: "Ons", TOR: "Tor", FRE: "Fre", LOR: "Lør", SON: "Søn" };
const TYPE_NAVN: Record<string, string> = { styrke: "styrke", rotasjon: "rotasjon", mobilitet: "mobilitet", kondisjon: "kondisjon" };

export type FysRadInn = {
  navn: string; sett: number; repsMin: number | null; repsMax: number | null; belastningPst: number | null;
  loggBelastningKg: number | null; rir: number | null; hvile: number | null; notat: string | null;
  intervallSerier: number | null; intervallMinutter: number | null; pulssone: string | null; pause: string | null;
};
export type FysOktInn = {
  id: string; navn: string; dag: Ukedag | null; type: string | null; estimertMinutter: number | null;
  gjennomfortAt: Date | null; rader: FysRadInn[];
};
export type FysUkeInn = { ukeNr: number; okter: FysOktInn[] };
export type FysPlanInn = { id: string; navn: string; startDato: Date; fraNavn: string | null; uker: FysUkeInn[] };

export type FysOvelse = { navn: string; mengde: string; kilde: string | null };
export type FysOktVisning = { id: string; navn: string; under: string; ovelser: FysOvelse[]; sone: string | null };
export type FysUkeStatus = { iso: number; status: "gjort" | "del" | "ingen"; naa: boolean };
export type FysProgram = {
  navn: string; fra: string | null; tidsrom: string; dager: string | null; varighet: string | null;
  uker: FysUkeStatus[]; gjort: number; totalt: number; ukeNaa: number | null;
  okter: FysOktVisning[];
  neste: { id: string; navn: string; dato: string | null; ukeIso: number; varighet: string | null; antallOvelser: number } | null;
};

/** Mandagen (UTC-midnatt, ms) i uka en dato ligger i, regnet på Oslo-kalenderdag. */
function mandag(d: Date): number {
  const [y, m, dag] = OSLO_YMD.format(d).split("-").map(Number);
  const t = Date.UTC(y, m - 1, dag);
  return t - ((new Date(t).getUTCDay() + 6) % 7) * DAG_MS;
}

/** ISO-ukenummer for en UTC-midnatt. */
function isoUke(ms: number): number {
  const d = new Date(ms);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const aarStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - aarStart) / DAG_MS + 1) / 7);
}

function tall(n: number): string {
  return n.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

function hvileTekst(sek: number): string {
  if (sek < 60) return `${sek} s`;
  const min = Math.floor(sek / 60), rest = sek % 60;
  return rest ? `${min} min ${rest} s` : `${min} min`;
}

/** «4 × 6 @ 90 kg · RIR 2» (vedtak 30.09), «6 × 3 min · S3» for kondisjon. */
export function mengdeTekst(r: FysRadInn): string {
  if (r.intervallSerier != null || r.intervallMinutter != null) {
    const del = [`${r.intervallSerier ?? "—"} × ${r.intervallMinutter != null ? `${tall(r.intervallMinutter)} min` : "—"}`];
    if (r.pulssone) del.push(r.pulssone);
    return del.join(" · ");
  }
  const reps = r.repsMin != null && r.repsMax != null && r.repsMin !== r.repsMax
    ? `${r.repsMin}–${r.repsMax}` : r.repsMax ?? r.repsMin;
  let t = reps != null ? `${r.sett} × ${reps}` : `${r.sett} sett`;
  if (r.loggBelastningKg != null && r.loggBelastningKg > 0) t += ` @ ${tall(r.loggBelastningKg)} kg`;
  else if (r.belastningPst != null) t += ` @ ${r.belastningPst} % av 1RM`;
  if (r.rir != null) t += ` · RIR ${r.rir}`;
  return t;
}

function kildeTekst(r: FysRadInn): string | null {
  const del = [r.hvile != null && r.hvile > 0 ? `Hvile ${hvileTekst(r.hvile)}` : null, r.pause, r.notat]
    .filter((s): s is string => Boolean(s && s.trim()));
  return del.length ? del.join(" · ") : null;
}

function varighetTekst(min: readonly (number | null)[]): string | null {
  const v = min.filter((m): m is number => m != null && m > 0);
  if (!v.length) return null;
  const lav = Math.min(...v), hoy = Math.max(...v);
  return lav === hoy ? `${lav} min` : `${lav}–${hoy} min`;
}

function dagerTekst(okter: readonly FysOktInn[]): string | null {
  const dager = [...new Set(okter.map((o) => o.dag).filter((d): d is Ukedag => d != null))].sort((a, b) => DAG_IDX[a] - DAG_IDX[b]);
  if (!dager.length) return null;
  const navn = dager.map((d, i) => (i === 0 ? DAG_LANG[d] : DAG_LANG[d].toLowerCase()));
  return navn.length === 1 ? navn[0] : `${navn.slice(0, -1).join(", ")} og ${navn[navn.length - 1]}`;
}

function oktUnder(o: FysOktInn): string {
  const del = [o.dag ? DAG_LANG[o.dag] : null, o.type && TYPE_NAVN[o.type] ? TYPE_NAVN[o.type] : null].filter(Boolean);
  return del.length ? del.join(" · ") : "Dag ikke satt";
}

export function byggFysiskProgram(plan: FysPlanInn, naa: Date): FysProgram {
  const uker = plan.uker;
  const start = mandag(plan.startDato);
  const idx = Math.round((mandag(naa) - start) / (7 * DAG_MS));
  const ukeMs = (i: number) => start + i * 7 * DAG_MS;

  const ukeStatus: FysUkeStatus[] = uker.map((u, i) => {
    const gjort = u.okter.filter((o) => o.gjennomfortAt).length;
    const status = u.okter.length > 0 && gjort === u.okter.length ? "gjort" : gjort > 0 ? "del" : "ingen";
    return { iso: isoUke(ukeMs(i)), status, naa: i === idx };
  });
  const alle = uker.flatMap((u) => u.okter);
  const gjort = alle.filter((o) => o.gjennomfortAt).length;

  const visIdx = Math.min(Math.max(idx, 0), Math.max(uker.length - 1, 0));
  const visUke = uker[visIdx]?.okter.length ? uker[visIdx] : uker.find((u) => u.okter.length > 0);
  const okter: FysOktVisning[] = (visUke?.okter ?? []).map((o) => ({
    id: o.id, navn: o.navn, under: oktUnder(o),
    ovelser: o.rader.map((r) => ({ navn: r.navn, mengde: mengdeTekst(r), kilde: kildeTekst(r) })),
    sone: o.rader.find((r) => r.pulssone)?.pulssone ?? null,
  }));

  let neste: FysProgram["neste"] = null;
  for (let i = Math.max(idx, 0); i < uker.length && !neste; i++) {
    const o = uker[i].okter.find((x) => !x.gjennomfortAt);
    if (!o) continue;
    const dato = o.dag ? `${DAG_KORT[o.dag]} ${KORT_DATO.format(new Date(ukeMs(i) + DAG_IDX[o.dag] * DAG_MS))}` : null;
    neste = { id: o.id, navn: o.navn, dato, ukeIso: isoUke(ukeMs(i)), varighet: varighetTekst([o.estimertMinutter]), antallOvelser: o.rader.length };
  }

  const tidsrom = uker.length
    ? uker.length === 1 ? `Uke ${isoUke(ukeMs(0))}` : `Uke ${isoUke(ukeMs(0))}–${isoUke(ukeMs(uker.length - 1))}`
    : "—";

  return {
    navn: plan.navn, fra: plan.fraNavn, tidsrom,
    dager: dagerTekst(visUke?.okter ?? []), varighet: varighetTekst((visUke?.okter ?? []).map((o) => o.estimertMinutter)),
    uker: ukeStatus, gjort, totalt: alle.length,
    ukeNaa: idx >= 0 && idx < uker.length ? idx + 1 : null,
    okter, neste,
  };
}

/* ---------- Siste fysiske test ---------- */

export type FysTestInn = { testId: string; navn: string; score: number; takenAt: Date; enhet: string | null };
export type FysTestRad = { navn: string; verdi: string; endring: string | null; retning: "opp" | "ned" | "lik" | null };

function medEnhet(n: number, enhet: string | null): string {
  return enhet ? `${tall(n)} ${enhet}` : tall(n);
}

/** Siste resultat per fysisk test, med endring mot forrige gang samme test ble tatt. */
export function fysTestRader(resultater: readonly FysTestInn[], maks = 6): { rader: FysTestRad[]; sist: Date | null } {
  const perTest = new Map<string, FysTestInn[]>();
  for (const r of [...resultater].sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime())) {
    const l = perTest.get(r.testId) ?? [];
    l.push(r);
    perTest.set(r.testId, l);
  }
  const grupper = [...perTest.values()].slice(0, maks);
  const rader = grupper.map(([siste, forrige]) => {
    if (!forrige) return { navn: siste.navn, verdi: medEnhet(siste.score, siste.enhet), endring: null, retning: null };
    const d = Math.round((siste.score - forrige.score) * 100) / 100;
    const retning = d > 0 ? "opp" : d < 0 ? "ned" : "lik";
    const endring = d === 0 ? "±0" : `${d > 0 ? "+" : "−"}${tall(Math.abs(d))}`;
    return { navn: siste.navn, verdi: medEnhet(siste.score, siste.enhet), endring, retning } as FysTestRad;
  });
  return { rader, sist: grupper[0]?.[0]?.takenAt ?? null };
}
