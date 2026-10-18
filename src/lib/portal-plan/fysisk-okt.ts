/**
 * PlayerHQ · føring av én fysisk økt (Live fysisk, PH-06): rene regler fra FysOkt → FysOvelseRad
 * til skjermen og tilbake til `loggFysOkt`. Fasit: docs/design-system/utkast-playerhq/treningsokt.html, `fysisk()`.
 * Ingen database. Mangler et tall, blir det null, og skjermen skriver «—».
 */
import { mengdeTekst, type FysRadInn, type Ukedag } from "./fysisk-program";

export const fysOktHref = (oktId: string) => `/portal/planlegge/fysisk/okt/${oktId}`;

export type FysOktRadInn = FysRadInn & {
  id: string; loggSett: number | null; loggRepsPerSett: string | null; loggRir: number | null; loggSettData: unknown;
};
export type FysOktFullInn = {
  id: string; navn: string; dag: Ukedag | null; type: string | null; estimertMinutter: number | null;
  gjennomfortAt: Date | null; faktiskMinutter: number | null; rader: FysOktRadInn[];
};

export type FysSett = { reps: number | null; kg: number | null; rir: number | null; ok: boolean };
export type FysStyrkeFor = { id: string; navn: string; mengde: string; hvile: string | null; medRir: boolean; sett: FysSett[] };
export type FysKondisjonFor = { id: string; navn: string; mengde: string; pause: string | null };
export type FysOktFor = {
  id: string; navn: string; planNavn: string; under: string; varighet: string | null;
  gjennomfort: string | null; styrke: FysStyrkeFor[]; kondisjon: FysKondisjonFor[];
};

const DAG_LANG: Record<Ukedag, string> = { MAN: "Mandag", TIR: "Tirsdag", ONS: "Onsdag", TOR: "Torsdag", FRE: "Fredag", LOR: "Lørdag", SON: "Søndag" };
const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });

function hvileTekst(sek: number): string {
  if (sek < 60) return `${sek} s`;
  const min = Math.floor(sek / 60), rest = sek % 60;
  return rest ? `${min} min ${rest} s` : `${min} min`;
}

/** Lagrede sett fra `loggSettData` ([{ vekt, reps, rir? }]). Ugyldige rader hoppes over. */
export function lesLoggSett(raw: unknown): FysSett[] {
  if (!Array.isArray(raw)) return [];
  const ut: FysSett[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    if (typeof o.reps !== "number" || !Number.isFinite(o.reps)) continue;
    const kg = typeof o.vekt === "number" && Number.isFinite(o.vekt) && o.vekt > 0 ? o.vekt : null;
    const rir = typeof o.rir === "number" && Number.isFinite(o.rir) ? o.rir : null;
    ut.push({ reps: o.reps, kg, rir, ok: true });
  }
  return ut;
}

/** Settene som vises: det som er ført, ellers planen (antall sett, reps, kilo og RIR fra programmet). */
function startSett(r: FysOktRadInn): FysSett[] {
  const logget = lesLoggSett(r.loggSettData);
  if (logget.length) return logget;
  const reps = r.repsMax ?? r.repsMin;
  const kg = r.loggBelastningKg != null && r.loggBelastningKg > 0 ? r.loggBelastningKg : null;
  return Array.from({ length: Math.max(1, r.sett) }, () => ({ reps, kg, rir: r.rir, ok: false }));
}

export function byggFysOkt(okt: FysOktFullInn, planNavn: string): FysOktFor {
  const styrke: FysStyrkeFor[] = [];
  const kondisjon: FysKondisjonFor[] = [];
  for (const r of okt.rader) {
    if (r.intervallSerier != null || r.intervallMinutter != null) {
      kondisjon.push({ id: r.id, navn: r.navn, mengde: mengdeTekst(r), pause: r.pause?.trim() || null });
      continue;
    }
    styrke.push({
      id: r.id, navn: r.navn, mengde: mengdeTekst(r),
      hvile: r.hvile != null && r.hvile > 0 ? `Hvile ${hvileTekst(r.hvile)}` : null,
      medRir: r.rir != null || r.loggRir != null || lesLoggSett(r.loggSettData).some((s) => s.rir != null),
      sett: startSett(r),
    });
  }
  const under = [okt.dag ? DAG_LANG[okt.dag] : null, okt.type].filter(Boolean).join(" · ");
  const min = okt.faktiskMinutter ?? okt.estimertMinutter;
  return {
    id: okt.id, navn: okt.navn, planNavn, under: under || "Dag ikke satt",
    varighet: min != null && min > 0 ? `${min} min` : null,
    gjennomfort: okt.gjennomfortAt ? OSLO_DATO.format(okt.gjennomfortAt) : null,
    styrke, kondisjon,
  };
}

/** Tallfelt: godtar «92,5» og «92.5». Tomt eller ugyldig blir null. */
export function lesTall(v: string): number | null {
  const t = v.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function kgTekst(kg: number | null): string {
  return kg == null ? "—" : kg.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

export type FysLoggRad = {
  radId: string; loggSett: number; loggRepsPerSett?: string; loggBelastningKg?: number; loggRir?: number;
  settData: { vekt: number; reps: number; rir?: number }[];
};

/** Det som sendes til `loggFysOkt`: bare serier som er registrert (hake) og har reps. */
export function tilLoggRader(styrke: readonly FysStyrkeFor[]): FysLoggRad[] {
  return styrke.map((o) => {
    const ok = o.sett.filter((s): s is FysSett & { reps: number } => s.ok && s.reps != null);
    const kg = ok.map((s) => s.kg).filter((k): k is number => k != null && k > 0);
    const sisteRir = [...ok].reverse().find((s) => s.rir != null)?.rir ?? undefined;
    return {
      radId: o.id,
      loggSett: ok.length,
      loggRepsPerSett: ok.length ? ok.map((s) => s.reps).join(", ") : undefined,
      loggBelastningKg: kg.length ? Math.max(...kg) : undefined,
      loggRir: sisteRir,
      settData: ok.map((s) => ({ vekt: s.kg ?? 0, reps: Math.round(s.reps), ...(s.rir != null ? { rir: Math.round(s.rir) } : {}) })),
    };
  });
}

/** «4 × 6 @ 90 kg · RIR 2» for det som faktisk ble gjort, «Hoppet over» når ingen serie er registrert. */
export function gjortTekst(o: FysStyrkeFor): string {
  const ok = o.sett.filter((s) => s.ok && s.reps != null);
  if (!ok.length) return "Hoppet over";
  const reps = [...new Set(ok.map((s) => s.reps))];
  const kg = Math.max(0, ...ok.map((s) => s.kg ?? 0));
  const rir = [...ok].reverse().find((s) => s.rir != null)?.rir;
  let t = `${ok.length} × ${reps.length === 1 ? reps[0] : reps.join("/")}`;
  if (kg > 0) t += ` @ ${kgTekst(kg)} kg`;
  if (rir != null) t += ` · RIR ${rir}`;
  return t;
}
