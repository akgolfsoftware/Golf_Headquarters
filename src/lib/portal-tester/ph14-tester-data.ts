/**
 * PH-14 Tester i nytt design (pakke 6, godkjent av Anders 14.10.2026): former testlista til skjermen.
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malen «tester».
 * Ren funksjon. Bare målte tall: mangler noe, blir det null, og skjermen viser «—».
 */
import type { Axis, TestRow } from "./tester-data";

export type PH14Rad = {
  id: string;
  navn: string;
  akse: Axis;
  href: string;
  /** Siste resultat formatert, null når testen ikke er tatt. */
  vis: string | null;
  /** «28. sep.» for siste resultat. */
  dato: string | null;
  /** true = coachen førte (Kontrollert), false = spilleren selv (Egenført), null = ikke tatt. */
  kontrollert: boolean | null;
  historikk: number[];
  /** Siste måling er den beste av minst to. */
  rekord: boolean;
  /** Første måling: ingen sammenligning ennå. */
  forste: boolean;
};

export type PH14Data = {
  rader: PH14Rad[];
  totalt: number;
  tatt: number;
  /** Tester der siste måling er bedre enn forrige. */
  bedre: number;
  /** Tester med minst to målinger, altså noe å sammenligne med. */
  sammenlignbare: number;
  /** Nærmeste tildelte test med frist i dag eller senere. */
  nesteTestdag: { navn: string; dag: number; mnd: string; dato: string; href: string } | null;
  /** Nyeste personlige rekord. */
  sisteRekord: { navn: string; akse: Axis; vis: string; dato: string | null; kontrollert: boolean | null; historikk: number[]; href: string } | null;
};

const KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
const DAG = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric" });
const MND = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", month: "short" });

function erRekord(r: TestRow): boolean {
  if (r.history.length < 2) return false;
  const siste = r.history[r.history.length - 1]!;
  const tidligere = r.history.slice(0, -1);
  return r.lowerIsBetter ? tidligere.every((v) => siste < v) : tidligere.every((v) => siste > v);
}

export function byggPH14(rader: readonly TestRow[], naa: Date): PH14Data {
  const ut: PH14Rad[] = rader.map((r) => ({
    id: r.id,
    navn: r.name,
    akse: r.axis,
    href: r.href,
    vis: r.attempts > 0 ? r.latest : null,
    dato: r.latestAt ? KORT.format(new Date(r.latestAt)) : r.latestDate,
    kontrollert: r.latestKontrollert ?? null,
    historikk: r.history,
    rekord: erRekord(r),
    forste: r.attempts === 1,
  }));

  const sammenlignbare = rader.filter((r) => r.delta != null);
  const bedre = sammenlignbare.filter((r) => r.verdict === "gain").length;

  // Neste testdag: tidligste frist fra og med i dag (Oslo-dato).
  const iDag = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(naa);
  const frister = rader
    .filter((r) => r.forfallAt)
    .map((r) => ({ r, t: new Date(r.forfallAt!) }))
    .filter(({ t }) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(t) >= iDag)
    .sort((a, b) => a.t.getTime() - b.t.getTime());
  const neste = frister[0];

  const rekorder = rader
    .filter((r) => erRekord(r) && r.latestAt)
    .sort((a, b) => new Date(b.latestAt!).getTime() - new Date(a.latestAt!).getTime());
  const rek = rekorder[0];

  return {
    rader: ut,
    totalt: rader.length,
    tatt: rader.filter((r) => r.attempts > 0).length,
    bedre,
    sammenlignbare: sammenlignbare.length,
    nesteTestdag: neste ? {
      navn: neste.r.name,
      dag: Number(DAG.format(neste.t)),
      mnd: MND.format(neste.t).replace(".", ""),
      dato: KORT.format(neste.t),
      href: neste.r.href,
    } : null,
    sisteRekord: rek && rek.latest ? {
      navn: rek.name,
      akse: rek.axis,
      vis: rek.latest,
      dato: KORT.format(new Date(rek.latestAt!)),
      kontrollert: rek.latestKontrollert ?? null,
      historikk: rek.history,
      href: rek.href,
    } : null,
  };
}
