/**
 * Gruppering av WANGs skolerute til lesbare spenn.
 *
 * Skoleruta i basen inneholder bare SKOLEDAGER. En ferie som spenner over en
 * helg får derfor et hull på lørdag/søndag, og en naiv «forrige dag + 1»-test
 * splitter den i to rader. Målt i prod 15.08.2026: juleferien ble
 * «21.–25. des» + «28. des–1. jan», og påskeferien tilsvarende.
 *
 * Ligger i domain/ fordi det er datoregning med en kjent felle — ikke
 * presentasjon. Da kan den også testes (testene kjører kun på src/lib/**).
 */

export interface SkoleDagInn {
  dato: string; // yyyy-mm-dd
  tittel: string;
}

export interface SkoleSpenn {
  iso: string;
  startIso: string;
  sluttIso: string;
  name: string;
  type: string;
}

export function skoleType(tittel: string): string {
  const t = tittel.toLowerCase();
  if (t === "siste skoledag") return "Avslutning";
  if (t === "skolestart") return "Oppstart";
  if (t.includes("planleggingsdag")) return "Elevfri";
  if (t.includes("ferie")) return "Ferie";
  return "Fridag";
}

/**
 * Henger to skoledager sammen? Sant hvis neste dag følger direkte, eller hvis
 * alt som ligger mellom dem er lørdag/søndag. Hopper aldri over mer enn én
 * helg — to uker uten skoledag er to separate perioder.
 */
export function hengerSammen(forrigeIso: string, nesteIso: string): boolean {
  const d = new Date(`${forrigeIso}T00:00:00Z`);
  // Maks tre hopp: fre → lør → søn → man dekker den lengste lovlige luka.
  for (let hopp = 0; hopp < 3; hopp++) {
    d.setUTCDate(d.getUTCDate() + 1);
    const iso = d.toISOString().slice(0, 10);
    if (iso === nesteIso) return true;
    const ukedag = d.getUTCDay(); // 0 = søndag, 6 = lørdag
    if (ukedag !== 0 && ukedag !== 6) return false;
  }
  return false;
}

/** Slår sammenhengende dager med samme tittel til ett spenn. */
export function grupperSkoleDager(dager: SkoleDagInn[]): SkoleSpenn[] {
  const sortert = [...dager].sort((a, b) => a.dato.localeCompare(b.dato));
  const grupper: { start: string; slutt: string; tittel: string }[] = [];

  for (const d of sortert) {
    const siste = grupper[grupper.length - 1];
    if (
      siste &&
      siste.tittel === d.tittel &&
      hengerSammen(siste.slutt, d.dato)
    ) {
      siste.slutt = d.dato;
    } else {
      grupper.push({ start: d.dato, slutt: d.dato, tittel: d.tittel });
    }
  }

  return grupper.map((g) => ({
    iso: g.start,
    startIso: g.start,
    sluttIso: g.slutt,
    name: g.tittel,
    type: skoleType(g.tittel),
  }));
}
