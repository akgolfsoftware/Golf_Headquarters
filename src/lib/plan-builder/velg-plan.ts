/**
 * PH-12 Velg treningsplan: rene hjelpere (ingen database). Tegning: Claude Design
 * 7d7c2994, ui_kits/playerhq/screens/PH-12.jsx.
 */
import { startOfWeek, ukenummer } from "@/lib/uke-helpers";

export const VELG_AKSER = ["fys", "tek", "slag", "spill", "turn"] as const;
export type VelgAkse = (typeof VELG_AKSER)[number];
export type Fordeling = Record<VelgAkse, number>;

export type SmartMaal = { s: string; m: string; a: string; r: string; t: string };

/** Standard når malen ikke oppgir en fordeling som summerer til 100 %. */
export const JEVN_FORDELING: Fordeling = { fys: 20, tek: 20, slag: 20, spill: 20, turn: 20 };

export function fordelingSum(f: Fordeling): number {
  return VELG_AKSER.reduce((a, k) => a + f[k], 0);
}

/** Fordelingen fra en mal (nøkler FYS/TEK/SLAG/SPILL/TURN, prosent). Ugyldig eller ufullstendig gir jevn fordeling. */
export function fordelingFraMal(raw: Record<string, number>): Fordeling {
  const f = {} as Fordeling;
  for (const k of VELG_AKSER) {
    const v = raw[k.toUpperCase()] ?? raw[k];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return { ...JEVN_FORDELING };
    f[k] = Math.round(v);
  }
  return fordelingSum(f) === 100 ? f : { ...JEVN_FORDELING };
}

export type MaalFeil = { s?: string; m?: string; t?: string };

export function validerMaal(g: SmartMaal): MaalFeil {
  const feil: MaalFeil = {};
  if (!g.s.trim()) feil.s = "Skriv hva du vil bli bedre på. Én ting.";
  if (!/\d/.test(g.m)) feil.m = "Målet må ha et tall du kan teste, for eksempel «7 av 10».";
  if (!g.t) feil.t = "Velg en dato målet skal nås innen.";
  return feil;
}

const liten = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** «Innen 31.10.2026 skal jeg 7 av 10 innenfor 4 m — bedre lengdekontroll.» Tom når verken mål eller tall er skrevet. */
export function maalSetning(g: SmartMaal): string | null {
  const s = g.s.trim(), m = g.m.trim();
  if (!s && !m) return null;
  const dt = g.t ? g.t.split("-").reverse().join(".") : null;
  return `${dt ? `Innen ${dt} skal jeg ` : "Jeg skal "}${m ? liten(m) : "—"}${s ? ` — ${liten(s)}` : ""}.`;
}

export type StartUke = { verdi: string; label: string; mandag: string };

const isoDato = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(d);

/** De tre neste ukene fra og med neste mandag (uke-logikk via uke-helpers, Oslo-tid). */
export function startUker(naa: Date): StartUke[] {
  const forste = startOfWeek(new Date(startOfWeek(naa).getTime() + 8 * 86400000));
  return [0, 1, 2].map((i) => {
    const d = new Date(forste.getTime() + i * 7 * 86400000 + 12 * 3600000);
    const mandag = isoDato(startOfWeek(d));
    return { verdi: mandag, label: `Uke ${ukenummer(d)}`, mandag };
  });
}

export function tusenskille(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
