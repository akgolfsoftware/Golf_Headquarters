/**
 * DG-05 Spiller mot proff, DG-06 Innspill-tak og DG-07 Fra funn til forslag (trenerflatene i
 * WANG og Team Norway). Bare beregning; ingen databasekall og ingen persondata her.
 * Datakart: docs/design-system/datagolf-coach-datakart-og-skjermliste.md §3.
 *
 * Spillerens tall er estimat (SG etter Broadie fra egne runder), proffens er Data Golfs modell.
 * Mangler et tall, er det null og vises som «—». Ingen tall gjettes.
 */
import { TAK_BAND, YARD_TIL_METER, type TakBandKode, type TakLie } from "./tak";

export const DG_OMRAADER = [
  { key: "sgOtt", label: "Utslag" },
  { key: "sgApp", label: "Innspill" },
  { key: "sgArg", label: "Nærspill" },
  { key: "sgPutt", label: "Putting" },
] as const;
export type DgOmraadeKey = (typeof DG_OMRAADER)[number]["key"] | "sgTotal";

export type SgTall = { sgTotal: number | null; sgOtt: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null };
export type SpillerSgRunde = SgTall & { playedAt: Date };
export type Snitt = { verdi: number | null; antall: number };

export function snitt(verdier: (number | null | undefined)[]): Snitt {
  const gyldige = verdier.filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  return { verdi: gyldige.length ? gyldige.reduce((s, n) => s + n, 0) / gyldige.length : null, antall: gyldige.length };
}

export type SgGapRad = { key: DgOmraadeKey; label: string; spiller: Snitt; proff: number | null; gap: number | null };

/** Gap = spiller minus proff, i slag per runde. Negativt betyr at spilleren taper slag. */
export function sgGap(runder: SpillerSgRunde[], proff: SgTall | null) {
  const rad = (key: DgOmraadeKey, label: string): SgGapRad => {
    const spiller = snitt(runder.map((r) => r[key]));
    const p = proff?.[key] ?? null;
    return { key, label, spiller, proff: p, gap: spiller.verdi != null && p != null ? spiller.verdi - p : null };
  };
  const rader = DG_OMRAADER.map((o) => rad(o.key, o.label));
  const medSg = runder.filter((r) => DG_OMRAADER.some((o) => r[o.key] != null) || r.sgTotal != null);
  const storst = rader.reduce<SgGapRad | null>((m, r) => (r.gap != null && r.gap < 0 && (!m || r.gap < (m.gap ?? 0)) ? r : m), null);
  const datoer = medSg.map((r) => r.playedAt.getTime());
  return {
    rader,
    samlet: rad("sgTotal", "Samlet"),
    storst,
    antallRunder: medSg.length,
    fra: datoer.length ? new Date(Math.min(...datoer)) : null,
    til: datoer.length ? new Date(Math.max(...datoer)) : null,
  };
}
export type SgGap = ReturnType<typeof sgGap>;

export type SpillerInnspillSlag = { lie: string; distanceToPin: number | null; endDistanceToPinM: number | null; holed: boolean | null };
export type ProffBand = { band: string; lie: string; meter: number | null; gir: number | null; slag: number | null };

/** Under så mange slag fra en avstand viser vi «—» for spilleren (utkast DG-06). */
export const MIN_SLAG_PER_BAND = 10;

function leie(lie: string): TakLie | null {
  if (lie === "FAIRWAY") return "fairway";
  if (lie === "ROUGH" || lie === "SEMI_ROUGH" || lie === "DEEP_ROUGH") return "rough";
  return null;
}

export type InnspillRad = {
  id: string;
  kode: TakBandKode;
  lie: TakLie;
  etikett: string;
  minM: number;
  maxM: number;
  proffMeter: number | null;
  proffGir: number | null;
  spillerMeter: number | null;
  spillerSlag: number;
  gap: number | null;
};

function bandEtikett(minYards: number, maxYards: number): string {
  const m = (y: number) => Math.round(y * YARD_TIL_METER);
  if (!Number.isFinite(maxYards)) return `${minYards}+ yd · ${m(minYards)}+ m`;
  if (minYards === 0) return `under ${maxYards} yd · under ${m(maxYards)} m`;
  return `${minYards}–${maxYards} yd · ${m(minYards)}–${m(maxYards)} m`;
}

/**
 * Proffens justerte nærhet (Data Golf) mot spillerens snitt av registrerte innspill fra samme avstand
 * og leie. Spillerens tall er ikke justert for vanskelighet. Gap = spiller minus proff, i meter.
 */
export function innspillTak(slag: SpillerInnspillSlag[], proffBand: ProffBand[]): InnspillRad[] {
  return TAK_BAND.map((def) => {
    const minM = def.minYards * YARD_TIL_METER;
    const maxM = def.maxYards * YARD_TIL_METER;
    const ender = slag
      .filter((s) => leie(s.lie) === def.lie && s.distanceToPin != null && s.distanceToPin >= minM && s.distanceToPin < maxM)
      .map((s) => (s.holed ? 0 : s.endDistanceToPinM))
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0);
    const spiller = ender.length >= MIN_SLAG_PER_BAND ? snitt(ender).verdi : null;
    const p = proffBand.find((b) => b.band === def.kode && b.lie === def.lie);
    const proffMeter = p?.meter ?? null;
    return {
      id: `${def.kode}-${def.lie}`,
      kode: def.kode,
      lie: def.lie,
      etikett: bandEtikett(def.minYards, def.maxYards),
      minM,
      maxM,
      proffMeter,
      proffGir: p?.gir ?? null,
      spillerMeter: spiller,
      spillerSlag: ender.length,
      gap: spiller != null && proffMeter != null ? spiller - proffMeter : null,
    };
  });
}

/** Avstanden med størst gap i meter, ellers første avstand der proffen har tall. */
export function storstInnspillGap(rader: InnspillRad[]): InnspillRad | null {
  const medGap = rader.filter((r) => r.gap != null && r.gap > 0).sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0));
  return medGap[0] ?? rader.find((r) => r.proffMeter != null) ?? null;
}

export type ForslagOkt = { date: string; startMinute: number; durationMinutes: number; title: string; pyramid: "SLAG"; location: null };

const UKEDAGER: Record<1 | 2 | 3, number[]> = { 1: [1], 2: [1, 3], 3: [1, 3, 5] };

function leggTilDager(iso: string, dager: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + dager * 86_400_000).toISOString().slice(0, 10);
}

/** Mandagen etter dagens dato (Oslo-dato inn som «YYYY-MM-DD»). */
export function nesteMandag(idagIso: string): string {
  const [y, m, d] = idagIso.split("-").map(Number);
  const ukedag = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return leggTilDager(idagIso, ((8 - ukedag) % 7) || 7);
}

/** Øktene i planforslaget: tirsdag, torsdag og lørdag fra første mandag, kl. 16:00. */
export function dgForslagOkter(input: { fraMandag: string; oekterPerUke: 1 | 2 | 3; uker: number; varighet: number; tittel: string }): ForslagOkt[] {
  const okter: ForslagOkt[] = [];
  for (let u = 0; u < input.uker; u++) {
    for (const dag of UKEDAGER[input.oekterPerUke]) {
      okter.push({ date: leggTilDager(input.fraMandag, u * 7 + dag), startMinute: 16 * 60, durationMinutes: input.varighet, title: input.tittel, pyramid: "SLAG", location: null });
    }
  }
  return okter;
}

/** Tittelen spilleren ser. Inneholder målet i meter, aldri proffnavn eller Data Golf-tall om proffen. */
export function innspillOvelseTittel(rad: Pick<InnspillRad, "etikett" | "lie">, maalMeter: number, antallSlag: number): string {
  const m = rad.etikett.split(" · ")[1] ?? rad.etikett;
  const mal = maalMeter.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
  return `Innspill ${m}, ${rad.lie === "fairway" ? "fairway" : "rough"} · mål ${mal} m · ${antallSlag} slag`;
}

/**
 * Funnet DG-07 bygger på: største SG-gap, og når det er innspill (eller SG mangler), avstanden med
 * størst gap i meter. Teksten spilleren ser har bare målet, aldri proffen eller gapet mot proffen.
 */
export function dgFunn(gap: SgGap | null, innspill: InnspillRad[]) {
  const omraade = gap?.storst ?? null;
  const band = storstInnspillGap(innspill);
  if ((!omraade || omraade.key === "sgApp") && band?.proffMeter != null) {
    const maal = Math.round(band.proffMeter * 10) / 10;
    const m = band.etikett.split(" · ")[1] ?? band.etikett;
    return {
      omraade, band, maalMeter: maal,
      tittel: innspillOvelseTittel(band, maal, 20),
      maalsetning: `Innspill ${m}, ${band.lie}: snitt ${maal.toLocaleString("nb-NO", { maximumFractionDigits: 1 })} m fra hullet.`,
    };
  }
  if (!omraade) return null;
  return { omraade, band: null, maalMeter: null, tittel: `${omraade.label} · fokusøkt`, maalsetning: `${omraade.label}: hovedfokus i treningen de neste ukene.` };
}
