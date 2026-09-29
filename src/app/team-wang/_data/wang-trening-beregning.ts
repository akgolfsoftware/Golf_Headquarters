/**
 * Rene beregninger for WANG-skjermene under «I dag» og «Trening»
 * (WANG-43, WANG-30, WG-01, WANG-12, WANG-42, WANG-29, WANG-16, WANG-17,
 * WANG-18, WANG-04, WANG-38). Ingen databasekall her, så alt kan testes.
 *
 * Kilden er elevenes økter i `WorkbenchSession` (den ene økt-tabellen, OW-3).
 *
 * Regler (beslutninger.md §KARTLEGGINGSØKT FJERNES, 26.09.2026):
 * - Etterlevelse = minutter på gjennomførte økter delt på minutter på planlagte
 *   økter med passert sluttid. Fremtidige økter teller ikke. Ingen forfalte
 *   økter gir «—» (null). Samme regel som `adherencePct` i
 *   src/lib/workbench/compliance.ts: minuttene er øktens planlagte varighet.
 * - Gjennomført = status COMPLETED. Planlagt = publisert for eleven: kladd
 *   (DRAFT), ikke publisert (SCHEDULED), maler og økter eleven har skjult,
 *   teller ikke (samme nevner som src/lib/domain/etterlevelse.ts).
 * - Morgenøkt = økt som starter før kl. 10:00. WANG har morgentrening
 *   08:00–10:00 (tegningen WG-01). Oppmøte på morgenøkt = økta er gjennomført.
 *
 * Datoer: `WorkbenchSession.date` er en ren kalenderdag, og `startMinute` er
 * norsk veggklokke. Her regnes alt som «YYYY-MM-DD»-strenger med Date.UTC
 * (gotchas §Tid og datoer). Absolutt tidspunkt (for «er sluttiden passert?»)
 * regnes mot Europe/Oslo.
 */

export const OMRADER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export type Omrade = (typeof OMRADER)[number];
export const OMRADE_NAVN: Record<Omrade, string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

export function somOmrade(v: string | null | undefined): Omrade | null {
  const s = (v ?? "").toUpperCase();
  return (OMRADER as readonly string[]).includes(s) ? (s as Omrade) : null;
}

export type WangOkt = {
  id: string;
  elevId: string;
  /** Kalenderdag «YYYY-MM-DD». */
  dato: string;
  /** Minutter fra midnatt, norsk tid. */
  startMin: number;
  varighetMin: number;
  tittel: string;
  /** Pyramideområdet slik det er lagret (FYS, TEK, SLAG, SPILL, TURN). */
  omrade: string;
  /** DRAFT | SCHEDULED | PUBLISHED | IN_PROGRESS | COMPLETED | CANCELLED | SKIPPED */
  status: string;
  sted: string | null;
  notat: string | null;
  maal: string | null;
  /** Faktisk tid eleven førte, hvis den er ført. */
  faktiskMin: number | null;
};

// ---------------------------------------------------------------- datoer

const DAG_MS = 86_400_000;

function delerAv(iso: string): [number, number, number] {
  const [a, m, d] = iso.split("-").map(Number);
  return [a, m, d];
}

export function leggTilDager(iso: string, antall: number): string {
  const [a, m, d] = delerAv(iso);
  return new Date(Date.UTC(a, m - 1, d + antall)).toISOString().slice(0, 10);
}

/** 0 = mandag … 6 = søndag. */
export function ukedag(iso: string): number {
  const [a, m, d] = delerAv(iso);
  const dag = new Date(Date.UTC(a, m - 1, d)).getUTCDay();
  return dag === 0 ? 6 : dag - 1;
}

export function mandagI(iso: string): string {
  return leggTilDager(iso, -ukedag(iso));
}

/** ISO-ukenummer for en kalenderdag. */
export function isoUke(iso: string): number {
  const [a, m, d] = delerAv(iso);
  const t = new Date(Date.UTC(a, m - 1, d));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const aarStart = Date.UTC(t.getUTCFullYear(), 0, 1);
  return Math.ceil(((t.getTime() - aarStart) / DAG_MS + 1) / 7);
}

export function dagerMellom(fra: string, til: string): number {
  const [a1, m1, d1] = delerAv(fra);
  const [a2, m2, d2] = delerAv(til);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / DAG_MS);
}

const osloDag = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" });

/** Norsk kalenderdag for et tidspunkt. */
export function osloIso(t: Date): string {
  return osloDag.format(t);
}

const osloDeler = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Oslo",
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** Minutter fra midnatt, norsk tid. */
export function osloMinutter(t: Date): number {
  const d = Object.fromEntries(osloDeler.formatToParts(t).map((p) => [p.type, p.value]));
  return Number(d.hour) * 60 + Number(d.minute);
}

/** Absolutt tidspunkt for en norsk veggklokke (dag + minutter fra midnatt). */
export function osloTidspunkt(iso: string, minutter: number): Date {
  const [a, m, d] = delerAv(iso);
  const somUtc = Date.UTC(a, m - 1, d, 0, minutter);
  // Finn Oslos avvik fra UTC ved dette tidspunktet og trekk det fra.
  const deler = Object.fromEntries(osloDeler.formatToParts(new Date(somUtc)).map((p) => [p.type, p.value]));
  const vistSomUtc = Date.UTC(Number(deler.year), Number(deler.month) - 1, Number(deler.day), Number(deler.hour), Number(deler.minute));
  return new Date(somUtc - (vistSomUtc - somUtc));
}

export function sluttTidspunkt(okt: Pick<WangOkt, "dato" | "startMin" | "varighetMin">): Date {
  return osloTidspunkt(okt.dato, okt.startMin + okt.varighetMin);
}

// ---------------------------------------------------------------- visning

const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
export const MND_LANG = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
export const DAG_LANG = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
export const DAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const to = (n: number) => String(n).padStart(2, "0");

/** «30.09» */
export function ddmm(iso: string): string {
  const [, m, d] = delerAv(iso);
  return `${to(d)}.${to(m)}`;
}

/** «30.09.2026» */
export function ddmmaaaa(iso: string): string {
  const [a, m, d] = delerAv(iso);
  return `${to(d)}.${to(m)}.${a}`;
}

/** «Onsdag 30.09» */
export function dagOgDato(iso: string): string {
  return `${DAG_LANG[ukedag(iso)]} ${ddmm(iso)}`;
}

export function mndKort(iso: string): string {
  return MND_KORT[delerAv(iso)[1] - 1];
}

/** «08:00» */
export function klokke(minutter: number): string {
  return `${to(Math.floor(minutter / 60))}:${to(minutter % 60)}`;
}

/** «08:00–10:00» */
export function tidsrom(startMin: number, varighetMin: number): string {
  return `${klokke(startMin)}–${klokke(startMin + varighetMin)}`;
}

/** Timer med én desimal og komma: «7,5». */
export function timer(minutter: number): string {
  return (Math.round((minutter / 60) * 10) / 10).toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

/** Andel (0–1) som «73 %», eller «—». */
export function prosent(andel: number | null): string {
  return andel === null || !Number.isFinite(andel) ? "—" : `${Math.round(andel * 100)} %`;
}

// ---------------------------------------------------------------- regler

/** Publisert for eleven. Kladd (DRAFT) og planlagt-men-ikke-publisert (SCHEDULED) teller ikke. */
export function erPlanlagt(okt: Pick<WangOkt, "status">): boolean {
  return okt.status !== "DRAFT" && okt.status !== "SCHEDULED";
}

/** Treneren har ikke publisert økta ennå. Vises i kalenderen, teller ikke i tallene. */
export function erUpublisert(okt: Pick<WangOkt, "status">): boolean {
  return okt.status === "SCHEDULED";
}

export function erGjennomfort(okt: Pick<WangOkt, "status">): boolean {
  return okt.status === "COMPLETED";
}

export function erAvvist(okt: Pick<WangOkt, "status">): boolean {
  return okt.status === "SKIPPED" || okt.status === "CANCELLED";
}

/** Morgentrening: økta starter før kl. 10:00. */
export function erMorgenokt(okt: Pick<WangOkt, "startMin">): boolean {
  return okt.startMin < 600;
}

export function erForfalt(okt: Pick<WangOkt, "dato" | "startMin" | "varighetMin">, naa: Date): boolean {
  return sluttTidspunkt(okt).getTime() <= naa.getTime();
}

export type Sum = {
  /** Alle planlagte minutter i utvalget, også fremtidige. */
  planlagtMin: number;
  /** Minutter på gjennomførte økter (planlagt varighet). */
  gjennomfortMin: number;
  /** Planlagte minutter på økter med passert sluttid (nevneren). */
  forfaltMin: number;
  /** gjennomfortMin / forfaltMin, eller null når ingenting er forfalt. */
  etterlevelse: number | null;
  morgenForfalt: number;
  morgenOppmott: number;
  morgenAndel: number | null;
  antallForfalt: number;
  antallGjennomfort: number;
  antallAvvist: number;
};

export function summer(okter: readonly WangOkt[], naa: Date): Sum {
  let planlagtMin = 0;
  let gjennomfortMin = 0;
  let forfaltMin = 0;
  let morgenForfalt = 0;
  let morgenOppmott = 0;
  let antallForfalt = 0;
  let antallGjennomfort = 0;
  let antallAvvist = 0;
  for (const o of okter) {
    if (!erPlanlagt(o)) continue;
    planlagtMin += o.varighetMin;
    const gjort = erGjennomfort(o);
    if (gjort) {
      gjennomfortMin += o.varighetMin;
      antallGjennomfort += 1;
    }
    if (erAvvist(o)) antallAvvist += 1;
    // En gjennomført økt teller alltid, også om sluttiden ikke er passert ennå.
    if (gjort || erForfalt(o, naa)) {
      forfaltMin += o.varighetMin;
      antallForfalt += 1;
      if (erMorgenokt(o)) {
        morgenForfalt += 1;
        if (gjort) morgenOppmott += 1;
      }
    }
  }
  return {
    planlagtMin,
    gjennomfortMin,
    forfaltMin,
    etterlevelse: forfaltMin > 0 ? gjennomfortMin / forfaltMin : null,
    morgenForfalt,
    morgenOppmott,
    morgenAndel: morgenForfalt > 0 ? morgenOppmott / morgenForfalt : null,
    antallForfalt,
    antallGjennomfort,
    antallAvvist,
  };
}

/** Mandagene i de fire ukene som slutter med inneværende uke. */
export function fireUker(idag: string): string[] {
  const m = mandagI(idag);
  return [-21, -14, -7, 0].map((n) => leggTilDager(m, n));
}

export type UkeSum = { mandag: string; uke: number; sum: Sum };

export function perUke(okter: readonly WangOkt[], mandager: readonly string[], naa: Date): UkeSum[] {
  return mandager.map((mandag) => {
    const sondag = leggTilDager(mandag, 6);
    const i = okter.filter((o) => o.dato >= mandag && o.dato <= sondag);
    return { mandag, uke: isoUke(mandag), sum: summer(i, naa) };
  });
}

export type OmradeSum = { omrade: Omrade; planlagtMin: number; gjennomfortMin: number };

export function perOmrade(okter: readonly WangOkt[]): OmradeSum[] {
  return OMRADER.map((omrade) => {
    const i = okter.filter((o) => somOmrade(o.omrade) === omrade && erPlanlagt(o));
    return {
      omrade,
      planlagtMin: i.reduce((a, o) => a + o.varighetMin, 0),
      gjennomfortMin: i.filter(erGjennomfort).reduce((a, o) => a + o.varighetMin, 0),
    };
  });
}

/**
 * «Under 70 % av planlagt tid to uker på rad» (WANG-43): de to siste hele
 * ukene før inneværende uke. Uker uten forfalte økter bryter rekken.
 */
export function underSyttiToUker(okter: readonly WangOkt[], idag: string, naa: Date): { uker: [number, number]; andeler: [number, number] } | null {
  const m = mandagI(idag);
  const [a, b] = perUke(okter, [leggTilDager(m, -14), leggTilDager(m, -7)], naa);
  const ea = a.sum.etterlevelse;
  const eb = b.sum.etterlevelse;
  if (ea === null || eb === null) return null;
  if (ea < 0.7 && eb < 0.7) return { uker: [a.uke, b.uke], andeler: [ea, eb] };
  return null;
}

// ---------------------------------------------------------------- gruppeøkter

/**
 * Gruppeøkt i kalenderen: alle elevøkter som starter samme dag og samme
 * klokkeslett. Hver elev har sin egen kopi i basen, så kalenderen samler dem.
 */
export type Gruppeokt = {
  key: string;
  dato: string;
  startMin: number;
  varighetMin: number;
  tittel: string;
  omrader: Omrade[];
  sted: string | null;
  okter: WangOkt[];
};

/** Felles tittel: hele tittelen hvis alle er like, ellers felles del foran « · ». */
export function felleTittel(titler: readonly string[]): string {
  const unike = [...new Set(titler.map((t) => t.trim()).filter(Boolean))];
  if (unike.length === 0) return "Økt";
  if (unike.length === 1) return unike[0];
  const forste = unike.map((t) => t.split(" · ")[0]);
  if (new Set(forste).size === 1) return forste[0];
  return `${unike.length} ulike økter`;
}

export function gruppeokter(okter: readonly WangOkt[]): Gruppeokt[] {
  const m = new Map<string, WangOkt[]>();
  for (const o of okter) {
    if (o.status === "DRAFT") continue;
    const key = `${o.dato}_${o.startMin}`;
    const liste = m.get(key);
    if (liste) liste.push(o);
    else m.set(key, [o]);
  }
  return [...m.entries()]
    .map(([key, liste]) => {
      const omrader = OMRADER.filter((om) => liste.some((o) => somOmrade(o.omrade) === om));
      const steder = [...new Set(liste.map((o) => o.sted).filter((s): s is string => !!s))];
      return {
        key,
        dato: liste[0].dato,
        startMin: liste[0].startMin,
        varighetMin: Math.max(...liste.map((o) => o.varighetMin)),
        tittel: felleTittel(liste.map((o) => o.tittel)),
        omrader,
        sted: steder.length === 1 ? steder[0] : steder.length > 1 ? `${steder.length} steder` : null,
        okter: liste,
      };
    })
    .sort((a, b) => (a.dato === b.dato ? a.startMin - b.startMin : a.dato < b.dato ? -1 : 1));
}

/** Nøkkelen «YYYY-MM-DD_480» tilbake til dag og minutter, eller null. */
export function lesOktNokkel(v: string | undefined): { dato: string; startMin: number } | null {
  const t = /^(\d{4}-\d{2}-\d{2})_(\d{1,4})$/.exec(v ?? "");
  if (!t) return null;
  const startMin = Number(t[2]);
  return startMin < 24 * 60 ? { dato: t[1], startMin } : null;
}

/** Heltall fra søkestrengen innenfor [min, maks], ellers standard. */
export function lesHeltall(v: string | string[] | undefined, standard: number, min: number, maks: number): number {
  const s = Array.isArray(v) ? v[0] : v;
  const n = Number(s);
  return s !== undefined && s !== "" && Number.isInteger(n) && n >= min && n <= maks ? n : standard;
}

export function forsteVerdi(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
