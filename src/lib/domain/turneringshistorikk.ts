/**
 * Spillerens egen turneringshistorikk.
 *
 * Anders 2026-08-30: spillerens «hvor står jeg» = egen utvikling + egne
 * turneringsresultater. Dette er den andre halvdelen.
 *
 * Dataene finnes allerede — 9 koblede spillere har mellom 24 og 59 turneringer
 * hver i basen — men ingenting av det har vært synlig i appen. Denne modulen
 * former radene til noe som kan leses, uten å finne på noe.
 *
 * TRUTHLAYER: hver rad bærer kilden sin, og et felt som ikke er registrert
 * blir null i stedet for en gjetning. Plassering mangler ofte for eldre eller
 * avbrutte turneringer — da sier raden det, den later ikke som posisjonen var
 * dårlig.
 *
 * Ren funksjon: ingen IO, ingen Date.now().
 */

/** Deltakelse slik den ligger i public_player_entries + tournaments. */
export type TurneringsRad = {
  turneringId: string;
  navn: string;
  /** Kildesystem, f.eks. "GOLFBOX" | "NGF" | "DATAGOLF" | "SRIXON".
   *  Null forekommer på gamle manuelle rader — da oppgis ingen kilde
   *  fremfor at det dikkes opp en. */
  kilde: string | null;
  /** Tour-merkelapp fra kilden, f.eks. "amateur-no". Null når ukjent. */
  tour: string | null;
  startDato: Date;
  /** Sluttplassering. Null = ikke registrert, ikke «dårlig». */
  plassering: number | null;
  /** Score mot par. Null = ikke registrert. */
  motPar: number | null;
  /** REGISTERED | TEED_OFF | CUT | WITHDREW | FINISHED. */
  status: string | null;
};

export type TurneringsAar = {
  aar: number;
  turneringer: TurneringsRad[];
  /** Beste plassering i året. Null når ingen rader har plassering. */
  bestePlassering: number | null;
};

export type Turneringshistorikk = {
  aar: TurneringsAar[];
  antall: number;
  /** Første og siste turneringsår. Null når historikken er tom. */
  spennFra: number | null;
  spennTil: number | null;
  /** Beste plassering gjennom hele karrieren. */
  bestePlassering: number | null;
  /** Hvor mange rader som faktisk har en plassering — grunnlaget bak tallet. */
  medPlassering: number;
  /** Kildene historikken er satt sammen av, alfabetisk. */
  kilder: string[];
  harHistorikk: boolean;
  /** Klarspråk når det ikke er noe å vise. Tom streng når det er det. */
  tomGrunn: string;
};

const TOM: Turneringshistorikk = {
  aar: [],
  antall: 0,
  spennFra: null,
  spennTil: null,
  bestePlassering: null,
  medPlassering: 0,
  kilder: [],
  harHistorikk: false,
  tomGrunn: "",
};

/**
 * Statuser som betyr at spilleren ikke fullførte. De vises, men de skal aldri
 * telle som en plassering — en spiller som trakk seg har ikke «kommet på
 * 61. plass», han har ikke et resultat.
 */
const UTEN_RESULTAT = new Set(["WITHDREW", "CUT", "REGISTERED"]);

function minstePlassering(rader: TurneringsRad[]): number | null {
  const tall = rader
    .filter((r) => !UTEN_RESULTAT.has(r.status ?? ""))
    .map((r) => r.plassering)
    .filter((p): p is number => p != null && p > 0);
  return tall.length === 0 ? null : Math.min(...tall);
}

/**
 * Grupperer spillerens deltakelser per år, nyeste år først og nyeste turnering
 * først innenfor hvert år.
 *
 * `erKoblet` skiller de to tomme tilstandene fra hverandre: en spiller som
 * ikke er koblet til en turneringsidentitet skal få en annen beskjed enn en
 * som er koblet, men aldri har spilt.
 */
export function byggTurneringshistorikk(
  rader: TurneringsRad[],
  erKoblet: boolean,
): Turneringshistorikk {
  if (!erKoblet) {
    return {
      ...TOM,
      tomGrunn:
        "Profilen din er ikke koblet til turneringsresultatene ennå. Coachen din kobler den.",
    };
  }
  if (rader.length === 0) {
    return {
      ...TOM,
      tomGrunn: "Ingen registrerte turneringer ennå. De dukker opp her når du har spilt.",
    };
  }

  const perAar = new Map<number, TurneringsRad[]>();
  for (const r of rader) {
    const aar = r.startDato.getFullYear();
    const liste = perAar.get(aar);
    if (liste) liste.push(r);
    else perAar.set(aar, [r]);
  }

  const aar: TurneringsAar[] = [...perAar.entries()]
    .map(([a, liste]) => ({
      aar: a,
      turneringer: [...liste].sort((x, y) => y.startDato.getTime() - x.startDato.getTime()),
      bestePlassering: minstePlassering(liste),
    }))
    .sort((a, b) => b.aar - a.aar);

  const aarstall = aar.map((a) => a.aar);
  const medPlassering = rader.filter(
    (r) => r.plassering != null && r.plassering > 0 && !UTEN_RESULTAT.has(r.status ?? ""),
  ).length;

  return {
    aar,
    antall: rader.length,
    spennFra: Math.min(...aarstall),
    spennTil: Math.max(...aarstall),
    bestePlassering: minstePlassering(rader),
    medPlassering,
    kilder: [
      ...new Set(rader.map((r) => r.kilde).filter((k): k is string => !!k)),
    ].sort(),
    harHistorikk: true,
    tomGrunn: "",
  };
}
