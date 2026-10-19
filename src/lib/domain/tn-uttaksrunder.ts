/**
 * Uttaksrundene på TN-05 Uttak og kriterier: én runde per arrangement, med
 * frist og antall plasser satt av trener (TnUttaksrunde) og uttakene per
 * spiller (TnUttak). Ren funksjon, så telling og «—» kan låses med test.
 *
 * Mangler frist eller plasser, er verdien null og skjermen viser «—».
 * Helteflaten viser runden med nærmeste frist fra i dag; finnes ingen frist
 * fram i tid, den sist avgjorte runden.
 */

export type TnUttakStatus = "UTTATT" | "RESERVE" | "IKKE_UTTATT";

export type TnUttakInn = { arrangement: string; status: string; decidedAt: Date };
export type TnUttaksrundeInn = { arrangement: string; frist: Date | null; plasser: number | null; reserver: number | null };

export type TnUttaksrunde = {
  arrangement: string;
  /** «YYYY-MM-DD», eller null når fristen ikke er satt. */
  frist: string | null;
  /** Dager fra i dag (Oslo) til fristen; negativt når fristen er passert. */
  dagerTilFrist: number | null;
  plasser: number | null;
  reserver: number | null;
  tattUt: number;
  reserve: number;
  ikkeTattUt: number;
  /** Siste avgjørelse i runden, null når ingen uttak er registrert ennå. */
  sistAvgjort: Date | null;
};

/** `@db.Date` kommer som UTC-midnatt; datoen leses i UTC, ikke i Oslo. */
export function datoStreng(dato: Date): string {
  return dato.toISOString().slice(0, 10);
}

function dagNummer(dag: string): number {
  const [a, m, d] = dag.split("-").map(Number);
  return Date.UTC(a!, m! - 1, d!) / 86_400_000;
}

export function byggUttaksrunder(uttak: TnUttakInn[], runder: TnUttaksrundeInn[], idag: string): TnUttaksrunde[] {
  const navn = [...new Set([...uttak.map((u) => u.arrangement), ...runder.map((r) => r.arrangement)])].sort((a, b) => a.localeCompare(b, "nb"));
  return navn.map((arrangement) => {
    const r = runder.find((x) => x.arrangement === arrangement);
    const rader = uttak.filter((u) => u.arrangement === arrangement);
    const frist = r?.frist ? datoStreng(r.frist) : null;
    const sistAvgjort = rader.reduce<Date | null>((s, u) => (!s || u.decidedAt > s ? u.decidedAt : s), null);
    return {
      arrangement,
      frist,
      dagerTilFrist: frist ? dagNummer(frist) - dagNummer(idag) : null,
      plasser: r?.plasser ?? null,
      reserver: r?.reserver ?? null,
      tattUt: rader.filter((u) => u.status === "UTTATT").length,
      reserve: rader.filter((u) => u.status === "RESERVE").length,
      ikkeTattUt: rader.filter((u) => u.status === "IKKE_UTTATT").length,
      sistAvgjort,
    };
  });
}

export function velgHeltRunde(runder: TnUttaksrunde[]): TnUttaksrunde | null {
  const kommende = runder.filter((r) => r.dagerTilFrist !== null && r.dagerTilFrist >= 0).sort((a, b) => a.dagerTilFrist! - b.dagerTilFrist!);
  if (kommende[0]) return kommende[0];
  const avgjort = runder.filter((r) => r.sistAvgjort).sort((a, b) => b.sistAvgjort!.getTime() - a.sistAvgjort!.getTime());
  return avgjort[0] ?? runder[0] ?? null;
}

/** «3/4» når antall plasser er satt, ellers bare antallet. */
export function avPlasser(antall: number, plasser: number | null): string {
  return plasser === null ? String(antall) : `${antall}/${plasser}`;
}
