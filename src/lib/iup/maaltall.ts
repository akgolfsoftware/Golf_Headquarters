/**
 * IUP-måltall (PH-11-MAL-IUP, plan.html, pakke 3 godkjent 14.10.2026): måltallene i IUP-arket, per
 * kvartal i skoleåret, med spillerens egne mål. Ren logikk, ingen I/O.
 *
 * K1 er august–oktober, K2 november–januar, K3 februar–april og K4 mai–juli. Året regnes ut først
 * når alle fire kvartaler er målt. Tall appen ikke har grunnlag for, er null («—»), aldri et anslag:
 * ranking, PEI, slaglengde og innspill 100–150 og 151–200 m (appen deler innspill i 75–125 og
 * 125–175 m) er ikke koblet ennå. Bare brutto score.
 */

export type MaaltallGruppe = "Ranking" | "Score" | "Strokes Gained" | "Putting" | "PEI" | "Slaglengde og retning" | "Spillstatistikk" | "Aktivitet" | "Treningstid";

export type MaaltallDef = {
  id: string;
  gruppe: MaaltallGruppe;
  navn: string;
  /** Hvor tallet kommer fra, slik spilleren ser det. */
  kilde: string;
  enhet: "slag" | "sg" | "prosent" | "antall" | "timer" | "plass" | "meter";
};

const IKKE = "Ikke koblet ennå";
export const MAALTALL: readonly MaaltallDef[] = [
  { id: "ranking-wagr", gruppe: "Ranking", navn: "Ranking WAGR", kilde: IKKE, enhet: "plass" },
  { id: "ranking-ngf", gruppe: "Ranking", navn: "NGF juniorranking", kilde: IKKE, enhet: "plass" },
  { id: "snitt-turnering", gruppe: "Score", navn: "Snitt brutto i turnering", kilde: "Auto · runder merket turnering", enhet: "slag" },
  { id: "snitt-utenfor", gruppe: "Score", navn: "Snitt brutto utenfor turnering", kilde: "Auto · egne runder", enhet: "slag" },
  { id: "beste-turnering", gruppe: "Score", navn: "Beste turneringsscore", kilde: "Auto · runder merket turnering", enhet: "slag" },
  { id: "verste-turnering", gruppe: "Score", navn: "Verste turneringsscore", kilde: "Auto · runder merket turnering", enhet: "slag" },
  { id: "sg-totalt", gruppe: "Strokes Gained", navn: "SG totalt", kilde: "Auto · egne runder", enhet: "sg" },
  { id: "sg-utslag", gruppe: "Strokes Gained", navn: "SG utslag", kilde: "Auto · egne runder", enhet: "sg" },
  { id: "sg-innspill", gruppe: "Strokes Gained", navn: "SG innspill totalt", kilde: "Auto · egne runder", enhet: "sg" },
  { id: "sg-innspill-100-150", gruppe: "Strokes Gained", navn: "SG innspill 100–150 m", kilde: IKKE, enhet: "sg" },
  { id: "sg-innspill-151-200", gruppe: "Strokes Gained", navn: "SG innspill 151–200 m", kilde: IKKE, enhet: "sg" },
  { id: "sg-naerspill", gruppe: "Strokes Gained", navn: "SG nærspill", kilde: "Auto · egne runder", enhet: "sg" },
  { id: "sg-putting", gruppe: "Strokes Gained", navn: "SG putting", kilde: "Auto · egne runder", enhet: "sg" },
  { id: "putt-0-3", gruppe: "Putting", navn: "Putting 0–3 fot", kilde: "Auto · første putt i egne runder", enhet: "prosent" },
  { id: "putt-3-5", gruppe: "Putting", navn: "Putting 3–5 fot", kilde: "Auto · første putt i egne runder", enhet: "prosent" },
  { id: "putt-5-10", gruppe: "Putting", navn: "Putting 5–10 fot", kilde: "Auto · første putt i egne runder", enhet: "prosent" },
  { id: "putt-10-15", gruppe: "Putting", navn: "Putting 10–15 fot", kilde: "Auto · første putt i egne runder", enhet: "prosent" },
  { id: "putt-15-25", gruppe: "Putting", navn: "Putting 15–25 fot", kilde: "Auto · første putt i egne runder", enhet: "prosent" },
  { id: "putt-25-40", gruppe: "Putting", navn: "Putting 25–40 fot", kilde: "Auto · første putt i egne runder", enhet: "prosent" },
  { id: "putt-40", gruppe: "Putting", navn: "Putting 40+ fot", kilde: "Auto · første putt i egne runder", enhet: "prosent" },
  { id: "pei-totalt", gruppe: "PEI", navn: "PEI totalt", kilde: IKKE, enhet: "prosent" },
  { id: "pei-40-80", gruppe: "PEI", navn: "PEI 40–80 m", kilde: IKKE, enhet: "prosent" },
  { id: "pei-80-120", gruppe: "PEI", navn: "PEI 80–120 m", kilde: IKKE, enhet: "prosent" },
  { id: "pei-120-160", gruppe: "PEI", navn: "PEI 120–160 m", kilde: IKKE, enhet: "prosent" },
  { id: "pei-160-200", gruppe: "PEI", navn: "PEI 160–200 m", kilde: IKKE, enhet: "prosent" },
  { id: "pei-200", gruppe: "PEI", navn: "PEI 200+ m", kilde: IKKE, enhet: "prosent" },
  { id: "slaglengde-driver", gruppe: "Slaglengde og retning", navn: "Slaglengde (driver carry)", kilde: IKKE, enhet: "meter" },
  { id: "avvik-mallinje", gruppe: "Slaglengde og retning", navn: "Avvik fra mållinje", kilde: IKKE, enhet: "meter" },
  { id: "fairwaytreff", gruppe: "Spillstatistikk", navn: "Fairwaytreff (FT)", kilde: "Auto · egne runder", enhet: "prosent" },
  { id: "gir", gruppe: "Spillstatistikk", navn: "GIR", kilde: "Auto · egne runder", enhet: "prosent" },
  { id: "scrambling", gruppe: "Spillstatistikk", navn: "Scrambling", kilde: "Auto · egne runder", enhet: "prosent" },
  { id: "konkurranser", gruppe: "Aktivitet", navn: "Konkurranser", kilde: "Auto · runder merket turnering", enhet: "antall" },
  { id: "konkurranserunder", gruppe: "Aktivitet", navn: "Konkurranserunder", kilde: "Auto · runder merket turnering", enhet: "antall" },
  { id: "treningsrunder-9", gruppe: "Aktivitet", navn: "Treningsrunder 9 hull", kilde: "Auto · egne runder", enhet: "antall" },
  { id: "treningsrunder-18", gruppe: "Aktivitet", navn: "Treningsrunder 18 hull", kilde: "Auto · egne runder", enhet: "antall" },
  { id: "treningstid-golf", gruppe: "Treningstid", navn: "Golftreningstid", kilde: "Auto · gjennomførte økter", enhet: "timer" },
  { id: "treningstid-fys", gruppe: "Treningstid", navn: "Fysisk treningstid", kilde: "Auto · gjennomførte økter", enhet: "timer" },
];

export const MAALTALL_IDER = new Set(MAALTALL.map((m) => m.id));

export type Sesong = { navn: string; start: string; slutt: string; kvartaler: [string, string][] };

/** Skoleåret som inneholder `dato` (YYYY-MM-DD): 1. august til 31. juli. Kvartalene er [fra, til) . */
export function sesongFor(dato: string): Sesong {
  const y = Number(dato.slice(0, 4)), m = Number(dato.slice(5, 7));
  const a = m >= 8 ? y : y - 1;
  return {
    navn: `${a}/${String(a + 1).slice(2)}`,
    start: `${a}-08-01`,
    slutt: `${a + 1}-08-01`,
    kvartaler: [[`${a}-08-01`, `${a}-11-01`], [`${a}-11-01`, `${a + 1}-02-01`], [`${a + 1}-02-01`, `${a + 1}-05-01`], [`${a + 1}-05-01`, `${a + 1}-08-01`]],
  };
}

export type MaaltallHull = { par: number; strokes: number; firstPuttFt: number | null; putts: number | null; fairway: boolean | null; gir: boolean | null };
export type MaaltallRunde = {
  dato: string;
  score: number;
  turnering: boolean;
  konkurranseId: string | null;
  sgTotal: number | null; sgOtt: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null;
  hull: MaaltallHull[];
};
export type MaaltallOkt = { dato: string; fys: boolean; minutter: number };

const snitt = (v: (number | null)[]) => { const t = v.filter((x): x is number => x != null); return t.length ? t.reduce((a, b) => a + b, 0) / t.length : null; };
const andel = (treff: number, av: number) => (av > 0 ? (treff / av) * 100 : null);
const PUTT: Record<string, [number, number]> = {
  "putt-0-3": [0, 3], "putt-3-5": [3, 5], "putt-5-10": [5, 10], "putt-10-15": [10, 15], "putt-15-25": [15, 25], "putt-25-40": [25, 40], "putt-40": [40, Infinity],
};

/** Tallene for ett tidsrom. Brutto: score er ekte slag. 18-hullsnitt bare av runder med 18 hull. */
export function beregnPeriode(runder: readonly MaaltallRunde[], okter: readonly MaaltallOkt[]): Record<string, number | null> {
  const turn = runder.filter((r) => r.turnering);
  const turn18 = turn.filter((r) => r.hull.length === 18);
  const ovrige = runder.filter((r) => !r.turnering);
  const hull = runder.flatMap((r) => r.hull);
  const ut: Record<string, number | null> = {};
  for (const m of MAALTALL) ut[m.id] = null;

  ut["snitt-turnering"] = snitt(turn18.map((r) => r.score));
  ut["snitt-utenfor"] = snitt(ovrige.filter((r) => r.hull.length === 18).map((r) => r.score));
  ut["beste-turnering"] = turn18.length ? Math.min(...turn18.map((r) => r.score)) : null;
  ut["verste-turnering"] = turn18.length ? Math.max(...turn18.map((r) => r.score)) : null;
  ut["sg-totalt"] = snitt(runder.map((r) => r.sgTotal));
  ut["sg-utslag"] = snitt(runder.map((r) => r.sgOtt));
  ut["sg-innspill"] = snitt(runder.map((r) => r.sgApp));
  ut["sg-naerspill"] = snitt(runder.map((r) => r.sgArg));
  ut["sg-putting"] = snitt(runder.map((r) => r.sgPutt));
  for (const [id, [fra, til]] of Object.entries(PUTT)) {
    const forsok = hull.filter((h) => h.firstPuttFt != null && h.putts != null && h.putts > 0 && h.firstPuttFt >= fra && h.firstPuttFt < til);
    ut[id] = andel(forsok.filter((h) => h.putts === 1).length, forsok.length);
  }
  const fw = hull.filter((h) => h.fairway != null && h.par >= 4);
  ut.fairwaytreff = andel(fw.filter((h) => h.fairway).length, fw.length);
  const gir = hull.filter((h) => h.gir != null);
  ut.gir = andel(gir.filter((h) => h.gir).length, gir.length);
  const bom = gir.filter((h) => !h.gir);
  ut.scrambling = andel(bom.filter((h) => h.strokes <= h.par).length, bom.length);
  ut.konkurranser = new Set(turn.map((r) => r.konkurranseId ?? r.dato)).size;
  ut.konkurranserunder = turn.length;
  ut["treningsrunder-9"] = ovrige.filter((r) => r.hull.length === 9).length;
  ut["treningsrunder-18"] = ovrige.filter((r) => r.hull.length === 18).length;
  ut["treningstid-golf"] = okter.filter((o) => !o.fys).reduce((n, o) => n + o.minutter, 0) / 60;
  ut["treningstid-fys"] = okter.filter((o) => o.fys).reduce((n, o) => n + o.minutter, 0) / 60;
  return ut;
}

export type MaaltallRad = MaaltallDef & {
  /** K1–K4. Null = ikke målt. */
  kvartaler: (number | null)[];
  /** Regnes bare når alle fire kvartaler er målt. */
  aar: number | null;
  mal: string | null;
};

/**
 * Hele tabellen. Et kvartal som ikke har begynt, er null. Telletall (aktivitet, treningstid) er null i et
 * kvartal uten noe registrert grunnlag i det hele tatt, så et tomt kvartal ikke ser ut som «0».
 */
export function byggMaaltall(input: {
  sesong: Sesong; idag: string; runder: readonly MaaltallRunde[]; okter: readonly MaaltallOkt[]; mal: ReadonlyMap<string, string>;
}): MaaltallRad[] {
  const { sesong, idag } = input;
  const i = (fra: string, til: string) => ({
    runder: input.runder.filter((r) => r.dato >= fra && r.dato < til),
    okter: input.okter.filter((o) => o.dato >= fra && o.dato < til),
  });
  const kv = sesong.kvartaler.map(([fra, til]) => {
    if (fra > idag) return null;
    const d = i(fra, til);
    if (d.runder.length === 0 && d.okter.length === 0) return null;
    return beregnPeriode(d.runder, d.okter);
  });
  const helt = kv.every(Boolean) ? beregnPeriode(i(sesong.start, sesong.slutt).runder, i(sesong.start, sesong.slutt).okter) : null;
  return MAALTALL.map((m) => {
    const kvartaler = kv.map((k) => k?.[m.id] ?? null);
    return { ...m, kvartaler, aar: kvartaler.every((v) => v != null) ? helt?.[m.id] ?? null : null, mal: input.mal.get(m.id) ?? null };
  });
}

/** Visning med norsk komma: «73,7», «+0,2», «52 %», «14,7 t», «238 m». Null = «—». */
export function formaterMaaltall(v: number | null, enhet: MaaltallDef["enhet"]): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const nb = (x: number, d: number) => x.toLocaleString("nb-NO", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−");
  switch (enhet) {
    case "slag": return Number.isInteger(v) ? String(v) : nb(v, 1);
    case "sg": return `${v > 0 ? "+" : ""}${nb(v, 1)}`;
    case "prosent": return `${Math.round(v)} %`;
    case "timer": return `${nb(v, Number.isInteger(v) ? 0 : 1)} t`;
    case "meter": return `${Math.round(v)} m`;
    default: return String(Math.round(v));
  }
}
