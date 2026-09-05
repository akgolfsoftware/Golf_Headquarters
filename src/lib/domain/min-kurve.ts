/**
 * Min kurve — spillerens egen til-par-kurve, turnering for turnering.
 *
 * Fasit: designsystem/train-lock/PH-21 Min kurve.dc.html (+ PH-21L lys).
 * Beslutning (Anders 2026-08-30, PRODUKTRETNING pkt. 2 og 4): slagtapet måles
 * mot spilleren selv over tid — ingen persentil, ingen kullrangering på
 * spillerflaten. Plassering vises kun som «innen klasse».
 *
 * TRUTHLAYER: hvert tall her kan spores til `public_player_entries.scoreToPar`
 * (til-par for turneringen, allerede banenormalisert av kilden) og rundescorene
 * i `public_player_rounds`. Båndet (beste/verste runde som til-par) avledes KUN
 * fra turneringens egne tall: par per runde = (sum score − til-par total) /
 * antall runder. Går ikke det opp i et helt tall (blandet par, ufullstendige
 * runder), får turneringen ingen bånd — aldri et anslag. Par hentes ALDRI fra
 * baneregisteret (datakartleggingen 30.08: systematisk −1,02 slag for juniorer).
 *
 * Filtrene speiler `dashboard.mv_topar_grunnlag`
 * (scripts/lag-topar-grunnlag-2026-08-30.ts) så spillerens egne tall her er de
 * samme som coachens Innsikt regner på: rundescore 55–130, til-par −40…120.
 *
 * Ren funksjon: ingen IO, ingen Date.now() — «i dag» og valgt sesong kommer inn.
 */

/** Gyldig rundescore — samme grense som mv_topar_grunnlag. */
export const RUNDESCORE_MIN = 55;
export const RUNDESCORE_MAKS = 130;
/** Gyldig til-par for en turnering — samme grense som mv_topar_grunnlag. */
export const TOPAR_MIN = -40;
export const TOPAR_MAKS = 120;

/** Én turneringsdeltakelse slik den ligger i entries + rounds. */
export type KurveRad = {
  turneringId: string;
  navn: string;
  startDato: Date;
  /** Til-par for hele turneringen (entries.scoreToPar). */
  toparTotal: number;
  /** Gyldige rundescorer (55–130), i spilt rekkefølge. Tom liste → raden utelates. */
  rundescorer: number[];
  /** Plassering innen klasse. Null = ikke registrert. */
  plassering: number | null;
  /** REGISTERED | TEED_OFF | CUT | WITHDREW | FINISHED */
  status: string | null;
  kilde: string | null;
};

export type KurvePunkt = {
  turneringId: string;
  navn: string;
  dato: Date;
  runder: number;
  /** Snitt til-par per runde i turneringen. */
  snitt: number;
  /** Beste runde som til-par — null når båndet ikke kan avledes ærlig. */
  beste: number | null;
  /** Verste runde som til-par — null når båndet ikke kan avledes ærlig. */
  verste: number | null;
  plassering: number | null;
  status: string | null;
};

export type Sesongvalg = number | "alle";

export type MinKurve = {
  koblet: boolean;
  /** Alle sesonger med minst én gyldig turnering, nyeste først. */
  sesonger: number[];
  valgtSesong: Sesongvalg;
  /** Punktene i valgt utvalg, kronologisk stigende. */
  punkter: KurvePunkt[];
  /** Snitt av `snitt` over de inntil fem siste turneringene i utvalget. */
  snittSiste: { verdi: number; antall: number; sistDato: Date } | null;
  /** Bredden på båndet (verste − beste) i første og siste turnering som har bånd. */
  baand: { forst: number; sist: number } | null;
  /** Hel setning om båndet, eller tom streng når det ikke kan sies noe målt. */
  baandTekst: string;
  /** Sesong-oppsummeringen i høyrekolonnen (desktop). Null når < 1 punkt. */
  sesongTekst: { tittel: string; under: string } | null;
  grunnlag: {
    turneringer: number;
    runder: number;
    besteRunde: { toPar: number; dato: Date } | null;
  };
  /** Y-akse for kurven: hele slag, tre etiketter (topp, midt, bunn). */
  yAkse: { min: number; maks: number; etiketter: number[] };
  kilder: string[];
  /** Klarspråk når det ikke er noe å tegne. Tom streng når det er det. */
  tomGrunn: string;
};

const UTEN_RESULTAT = new Set(["WITHDREW", "CUT", "REGISTERED"]);

const TOM_KURVE: Omit<MinKurve, "koblet" | "tomGrunn"> = {
  sesonger: [],
  valgtSesong: "alle",
  punkter: [],
  snittSiste: null,
  baand: null,
  baandTekst: "",
  sesongTekst: null,
  grunnlag: { turneringer: 0, runder: 0, besteRunde: null },
  yAkse: { min: 0, maks: 0, etiketter: [] },
  kilder: [],
};

const TALL = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const TALL_MED_TEGN = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

/** «+8,4» · «−2,0» · «0,0». Norsk desimaltegn, ekte minustegn. */
export function fmtToPar(v: number): string {
  return TALL_MED_TEGN.format(v);
}

/** «5,6» — uten fortegn, for bredder og differanser. */
export function fmtSlag(v: number): string {
  return TALL.format(Math.abs(v));
}

function rund1(v: number): number {
  return Math.round(v * 10) / 10;
}

/**
 * Snitt til-par og (der det går ærlig opp) beste/verste runde som til-par.
 * Returnerer null når raden ikke kvalifiserer (ingen gyldige runder, til-par
 * utenfor grensene, eller ikke fullført).
 */
export function tilPunkt(rad: KurveRad): KurvePunkt | null {
  if (UTEN_RESULTAT.has(rad.status ?? "")) return null;
  if (rad.toparTotal < TOPAR_MIN || rad.toparTotal > TOPAR_MAKS) return null;
  const runder = rad.rundescorer.filter((s) => s >= RUNDESCORE_MIN && s <= RUNDESCORE_MAKS);
  if (runder.length === 0) return null;

  const snitt = rund1(rad.toparTotal / runder.length);
  const sum = runder.reduce((a, b) => a + b, 0);
  const parSum = sum - rad.toparTotal;
  const parPerRunde = parSum / runder.length;
  const harBaand = Number.isInteger(parPerRunde) && parPerRunde >= 27 && parPerRunde <= 80;

  return {
    turneringId: rad.turneringId,
    navn: rad.navn,
    dato: rad.startDato,
    runder: runder.length,
    snitt,
    beste: harBaand ? Math.min(...runder) - parPerRunde : null,
    verste: harBaand ? Math.max(...runder) - parPerRunde : null,
    plassering: rad.plassering != null && rad.plassering > 0 ? rad.plassering : null,
    status: rad.status,
  };
}

function velgSesong(sesonger: number[], onsket: string | undefined): Sesongvalg {
  if (onsket === "alle") return "alle";
  const n = Number(onsket);
  if (onsket && Number.isInteger(n) && sesonger.includes(n)) return n;
  return sesonger[0] ?? "alle";
}

function yAkseFor(punkter: KurvePunkt[]): MinKurve["yAkse"] {
  const verdier = punkter.flatMap((p) => [p.snitt, p.beste ?? p.snitt, p.verste ?? p.snitt]);
  let min = Math.floor(Math.min(...verdier)) - 1;
  let maks = Math.ceil(Math.max(...verdier)) + 1;
  if (maks - min < 4) {
    const midt = Math.round((min + maks) / 2);
    min = midt - 2;
    maks = midt + 2;
  }
  const midt = Math.round((min + maks) / 2);
  return { min, maks, etiketter: [maks, midt, min] };
}

function baandTekstFor(baand: MinKurve["baand"], antallMedBaand: number): string {
  if (!baand || antallMedBaand < 2) return "";
  const diff = baand.sist - baand.forst;
  const fraTil = `Båndet har gått fra ${fmtSlag(baand.forst)} til ${fmtSlag(baand.sist)} slag gjennom sesongen.`;
  if (diff <= -0.5) return `${fraTil} Rundene dine ligner mer på hverandre nå.`;
  if (diff >= 0.5) return `${fraTil} Rundene dine varierer mer nå enn i starten.`;
  return `${fraTil} Det er omtrent like bredt som ved sesongstart.`;
}

function sesongTekstFor(punkter: KurvePunkt[], baand: MinKurve["baand"], antallMedBaand: number): MinKurve["sesongTekst"] {
  if (punkter.length === 0) return null;
  if (punkter.length === 1) {
    return {
      tittel: "Én turnering i sesongen så langt.",
      under: "Kurven får en retning etter den neste.",
    };
  }
  const forst = punkter[0].snitt;
  const sist = punkter[punkter.length - 1].snitt;
  const diff = rund1(forst - sist);
  const tittel =
    diff > 0
      ? `Snittet har falt ${fmtSlag(diff)} slag siden sesongåpningen.`
      : diff < 0
        ? `Snittet har steget ${fmtSlag(diff)} slag siden sesongåpningen.`
        : "Snittet er uendret siden sesongåpningen.";
  let under = "Båndet mellom beste og verste runde kan ikke måles uten rundescorer.";
  if (baand && antallMedBaand >= 2) {
    const bd = rund1(baand.sist - baand.forst);
    under =
      bd < 0
        ? `Og båndet mellom beste og verste runde er ${fmtSlag(bd)} slag smalere.`
        : bd > 0
          ? `Og båndet mellom beste og verste runde er ${fmtSlag(bd)} slag bredere.`
          : "Og båndet mellom beste og verste runde er like bredt som før.";
  }
  return { tittel, under };
}

/**
 * Former radene til kurven for valgt sesong.
 *
 * `koblet` skiller de to tomme tilstandene: ikke koblet til en
 * turneringsidentitet, eller koblet uten gyldige turneringer.
 */
export function byggMinKurve(
  rader: KurveRad[],
  koblet: boolean,
  onsketSesong?: string,
): MinKurve {
  if (!koblet) {
    return {
      ...TOM_KURVE,
      koblet: false,
      tomGrunn: "Profilen din er ikke koblet til turneringsresultatene ennå. Coachen din kobler den.",
    };
  }

  const alle = rader
    .map(tilPunkt)
    .filter((p): p is KurvePunkt => p !== null)
    .sort((a, b) => a.dato.getTime() - b.dato.getTime());

  if (alle.length === 0) {
    return { ...TOM_KURVE, koblet: true, tomGrunn: "Ingen turneringer er registrert på deg ennå." };
  }

  const sesonger = [...new Set(alle.map((p) => p.dato.getFullYear()))].sort((a, b) => b - a);
  const valgtSesong = velgSesong(sesonger, onsketSesong);
  const punkter = valgtSesong === "alle" ? alle : alle.filter((p) => p.dato.getFullYear() === valgtSesong);

  const kilder = [...new Set(rader.map((r) => r.kilde).filter((k): k is string => !!k))].sort();

  if (punkter.length === 0) {
    // Kan bare skje ved et sesongvalg uten treff — velgSesong faller ellers
    // tilbake til nyeste sesong.
    return {
      ...TOM_KURVE,
      koblet: true,
      sesonger,
      valgtSesong,
      kilder,
      tomGrunn: "Ingen turneringer i denne sesongen.",
    };
  }

  const siste = punkter.slice(-5);
  const snittSiste = {
    verdi: rund1(siste.reduce((a, p) => a + p.snitt, 0) / siste.length),
    antall: siste.length,
    sistDato: siste[siste.length - 1].dato,
  };

  const medBaand = punkter.filter((p) => p.beste != null && p.verste != null);
  const baand =
    medBaand.length > 0
      ? {
          forst: rund1((medBaand[0].verste as number) - (medBaand[0].beste as number)),
          sist: rund1(
            (medBaand[medBaand.length - 1].verste as number) - (medBaand[medBaand.length - 1].beste as number),
          ),
        }
      : null;

  let besteRunde: MinKurve["grunnlag"]["besteRunde"] = null;
  for (const p of medBaand) {
    if (p.beste != null && (besteRunde === null || p.beste < besteRunde.toPar)) {
      besteRunde = { toPar: p.beste, dato: p.dato };
    }
  }

  return {
    koblet: true,
    sesonger,
    valgtSesong,
    punkter,
    snittSiste,
    baand,
    baandTekst: baandTekstFor(baand, medBaand.length),
    sesongTekst: sesongTekstFor(punkter, baand, medBaand.length),
    grunnlag: {
      turneringer: punkter.length,
      runder: punkter.reduce((a, p) => a + p.runder, 0),
      besteRunde,
    },
    yAkse: yAkseFor(punkter),
    kilder,
    tomGrunn: "",
  };
}
