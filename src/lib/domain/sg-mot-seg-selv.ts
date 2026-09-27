/**
 * «Hvor taper spilleren slag — målt mot seg selv over tid.»
 *
 * Coachens hovedspørsmål (Anders 2026-08-30, `.claude/rules/beslutninger.md`):
 * referansen er SPILLEREN SELV, ikke proffnivå og ikke jevnaldrende. Denne
 * modulen svarer på det ene spørsmålet og ingenting annet.
 *
 * Metoden: del rundene i to like store vinduer — de nyeste N, og de N før dem
 * — og regn snitt per SG-område i hvert. Differansen er endringen. Høyere SG
 * er bedre, så positiv endring betyr forbedring.
 *
 * TRUTHLAYER (samme beslutning, punkt 7): funksjonen fabrikkerer aldri et tall.
 * Et område uten registrerte verdier i et vindu blir `null`, ikke null-verdi.
 * Hvert svar bærer med seg hvor mange runder det bygger på og hvilken periode
 * de dekker, slik at UI kan vise grunnlaget ved siden av tallet.
 *
 * Ren funksjon: ingen IO, ingen Prisma, ingen Date.now(). Alt som trengs
 * kommer inn som argumenter, slik at den kan testes uten database.
 */

/** De fire SG-områdene, i fast rekkefølge fra tee til hull. */
export const SG_AKSER = ["OTT", "APP", "ARG", "PUTT"] as const;
export type SgAkse = (typeof SG_AKSER)[number];

export const SG_AKSE_NAVN: Record<SgAkse, string> = {
  OTT: "Utslag",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

/** Én runde, slik den ligger i Round. Null = området ble ikke registrert. */
export type SgRunde = {
  playedAt: Date;
  sgTotal?: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

export type AkseEndring = {
  akse: SgAkse;
  navn: string;
  /** Snitt i det nyeste vinduet. Null = ingen registrerte verdier der. */
  nylig: number | null;
  /** Snitt i vinduet før. Null = ingen registrerte verdier der. */
  tidligere: number | null;
  /** nylig − tidligere. Positiv = forbedring. Null når et av vinduene mangler. */
  endring: number | null;
  /** Runder som faktisk bidro til hvert tall — grunnlaget bak påstanden. */
  nyligAntall: number;
  tidligereAntall: number;
};

export type SgMotSegSelv = {
  akser: AkseEndring[];
  /** Området med størst tilbakegang. Null når ingen har gått ned. */
  storsteTilbakegang: AkseEndring | null;
  /** Området med størst fremgang. Null når ingen har gått opp. */
  storsteFremgang: AkseEndring | null;
  nyligPeriode: { fra: Date; til: Date } | null;
  tidligerePeriode: { fra: Date; til: Date } | null;
  /** Klarspråk-grunnlag for hele sammenligningen, til visning under tallene. */
  grunnlag: string;
  /** False når datagrunnlaget er for tynt til å si noe. `grunnlag` sier hvorfor. */
  harSvar: boolean;
};

/** Færre runder enn dette i et vindu gir ikke et tall verdt å vise. */
export const MIN_RUNDER_PER_VINDU = 3;

/** Standard vindusstørrelse. 10 + 10 dekker typisk en halv sesong. */
export const STANDARD_VINDU = 10;

/**
 * Minste endring vi tør kalle et signal, i slag.
 *
 * Under dette er forskjellen støy på et titalls runder, og å utrope den til
 * «største tilbakegang» ville vært å presentere tilfeldighet som fakta — jf.
 * TruthLayer. Målt mot ekte data 2026-08-30: en spiller hadde −0,03 på putting,
 * som uten denne grensen ville blitt løftet fram som spillerens hovedproblem.
 */
export const MIN_MERKBAR_ENDRING = 0.05;

const rund2 = (v: number) => Math.round(v * 100) / 100;

function snittAv(verdier: Array<number | null>): { snitt: number | null; antall: number } {
  const tall = verdier.filter((v): v is number => v != null);
  if (tall.length === 0) return { snitt: null, antall: 0 };
  return { snitt: rund2(tall.reduce((s, v) => s + v, 0) / tall.length), antall: tall.length };
}

function periodeAv(runder: SgRunde[]): { fra: Date; til: Date } | null {
  if (runder.length === 0) return null;
  const t = runder.map((r) => r.playedAt.getTime());
  return { fra: new Date(Math.min(...t)), til: new Date(Math.max(...t)) };
}

function hentAkse(r: SgRunde, akse: SgAkse): number | null {
  switch (akse) {
    case "OTT":
      return r.sgOtt;
    case "APP":
      return r.sgApp;
    case "ARG":
      return r.sgArg;
    case "PUTT":
      return r.sgPutt;
  }
}

function tomtSvar(grunnlag: string): SgMotSegSelv {
  return {
    akser: SG_AKSER.map((akse) => ({
      akse,
      navn: SG_AKSE_NAVN[akse],
      nylig: null,
      tidligere: null,
      endring: null,
      nyligAntall: 0,
      tidligereAntall: 0,
    })),
    storsteTilbakegang: null,
    storsteFremgang: null,
    nyligPeriode: null,
    tidligerePeriode: null,
    grunnlag,
    harSvar: false,
  };
}

/**
 * Sammenlign spillerens siste runder med de foregående, område for område.
 *
 * `runder` kan komme i vilkårlig rekkefølge — funksjonen sorterer selv.
 * `vindu` er antall runder i hvert av de to vinduene.
 */
export function sammenlignMedSegSelv(
  runder: SgRunde[],
  vindu: number = STANDARD_VINDU,
): SgMotSegSelv {
  if (vindu < MIN_RUNDER_PER_VINDU) {
    return tomtSvar(`Vinduet må være minst ${MIN_RUNDER_PER_VINDU} runder.`);
  }

  const sortert = [...runder].sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());

  if (sortert.length < MIN_RUNDER_PER_VINDU * 2) {
    const mangler = MIN_RUNDER_PER_VINDU * 2 - sortert.length;
    return tomtSvar(
      sortert.length === 0
        ? "Ingen runder med slagfordeling registrert ennå."
        : `${sortert.length} ${sortert.length === 1 ? "runde" : "runder"} registrert. ` +
            `Trenger ${mangler} til for å kunne sammenligne.`,
    );
  }

  const nyligeRunder = sortert.slice(0, vindu);
  const tidligereRunder = sortert.slice(vindu, vindu * 2);

  // Vinduet før kan bli kortere enn `vindu` når spilleren har få runder totalt.
  // Det er greit så lenge det holder minstekravet — men det skal SIES.
  if (tidligereRunder.length < MIN_RUNDER_PER_VINDU) {
    return tomtSvar(
      `${sortert.length} runder registrert. Trenger flere for å ha et ` +
        `sammenligningsgrunnlag bakover i tid.`,
    );
  }

  const akser: AkseEndring[] = SG_AKSER.map((akse) => {
    const n = snittAv(nyligeRunder.map((r) => hentAkse(r, akse)));
    const t = snittAv(tidligereRunder.map((r) => hentAkse(r, akse)));
    return {
      akse,
      navn: SG_AKSE_NAVN[akse],
      nylig: n.snitt,
      tidligere: t.snitt,
      endring: n.snitt != null && t.snitt != null ? rund2(n.snitt - t.snitt) : null,
      nyligAntall: n.antall,
      tidligereAntall: t.antall,
    };
  });

  const medEndring = akser.filter(
    (a): a is AkseEndring & { endring: number } => a.endring != null,
  );

  if (medEndring.length === 0) {
    return {
      ...tomtSvar(
        "Rundene mangler slagfordeling per område. Registrer slag per hull " +
          "for å se hvor du taper slagene.",
      ),
      akser,
    };
  }

  const sortertPaaEndring = [...medEndring].sort((a, b) => a.endring - b.endring);
  const verst = sortertPaaEndring[0];
  const best = sortertPaaEndring[sortertPaaEndring.length - 1];

  return {
    akser,
    storsteTilbakegang: verst.endring <= -MIN_MERKBAR_ENDRING ? verst : null,
    storsteFremgang: best.endring >= MIN_MERKBAR_ENDRING ? best : null,
    nyligPeriode: periodeAv(nyligeRunder),
    tidligerePeriode: periodeAv(tidligereRunder),
    grunnlag: `Siste ${nyligeRunder.length} runder mot de ${tidligereRunder.length} før.`,
    harSvar: true,
  };
}

// ─── Strokes Gained mot spillerens eget nivå (Task 6) ─────────────────────────

export const PGA_TOUR_BASELINE_LABEL = "PGA Tour (Scratch/Tour-nivå)";

export const TERSKEL_MINIMUM_RUNDER = 8;
export const TERSKEL_TEE_INNSPILL = 12;
export const TERSKEL_NAERSPILL_PUTT = 24;
export const MAKS_BASELINE_RUNDER = 20;

export type OmraadeTerskelStatus = "FOR_LITE_GRUNNLAG" | "INNLEDENDE" | "PALITELIG";

export type SgOmraadeSammenligning = {
  omraade: SgAkse | "TOTAL";
  navn: string;
  /** Resultat mot PGA Tour scratch-baseline (f.eks. for siste runde eller nylige runder). */
  pgaTourSg: number | null;
  pgaTourLabel: string;
  /** Spillerens eget baseline-snitt (siste opptil 20 runder) mot PGA Tour. */
  spillerBaselineSg: number | null;
  /** Differanse: pgaTourSg - spillerBaselineSg. Positiv = bedre enn egen normal. */
  motEgetNivaaSg: number | null;
  antallRunderIBaseline: number;
  terskelStatus: OmraadeTerskelStatus;
  statusTekst: string;
};

export type SpillerSgMotEgetNivaaResultat = {
  harSvar: boolean;
  totalRunder: number;
  baselineRunderBrukt: number;
  pgaTourLabel: string;
  konklusjon: string;
  grunnlag: string;
  omraader: SgOmraadeSammenligning[];
};

const OMRAADE_NAVN: Record<SgAkse | "TOTAL", string> = {
  TOTAL: "Total",
  OTT: "Utslag (OTT)",
  APP: "Innspill (APP)",
  ARG: "Nærspill (ARG)",
  PUTT: "Putting (PUTT)",
};

function hentVerdi(r: SgRunde, omraade: SgAkse | "TOTAL"): number | null {
  if (omraade === "TOTAL") {
    if (r.sgTotal != null) return r.sgTotal;
    const deler = [r.sgOtt, r.sgApp, r.sgArg, r.sgPutt].filter((v): v is number => v != null);
    return deler.length > 0 ? deler.reduce((a, b) => a + b, 0) : null;
  }
  return hentAkse(r, omraade);
}

/**
 * Beregner Strokes Gained mot spillerens egen baseline (siste inntil 20 runder)
 * og sammenligner mot PGA Tour baseline side-om-side.
 * Håndhever strenge pålitelighetsterskler:
 *   - <8 runder: for lite grunnlag
 *   - ~12 runder: pålitelig for utslag (OTT) og innspill (APP)
 *   - ~24 runder: pålitelig for nærspill (ARG) og putting (PUTT)
 */
export function beregnSgMotEgetNivaa(
  runder: SgRunde[],
  options?: {
    sisteRunderAntall?: number;
    maksBaselineRunder?: number;
  },
): SpillerSgMotEgetNivaaResultat {
  const sortert = [...runder]
    .filter((r) => r.sgTotal != null || r.sgOtt != null || r.sgApp != null || r.sgArg != null || r.sgPutt != null)
    .sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());

  const alleOmraader: (SgAkse | "TOTAL")[] = ["TOTAL", "OTT", "APP", "ARG", "PUTT"];

  if (sortert.length < TERSKEL_MINIMUM_RUNDER) {
    return {
      harSvar: false,
      totalRunder: sortert.length,
      baselineRunderBrukt: sortert.length,
      pgaTourLabel: PGA_TOUR_BASELINE_LABEL,
      konklusjon: `For lite grunnlag: krever minst ${TERSKEL_MINIMUM_RUNDER} runder med slagdata for å etablere en pålitelig egen-baseline (har ${sortert.length} ${sortert.length === 1 ? "runde" : "runder"}).`,
      grunnlag: `For lite grunnlag (${sortert.length}/${TERSKEL_MINIMUM_RUNDER} runder registrert).`,
      omraader: alleOmraader.map((omraade) => ({
        omraade,
        navn: OMRAADE_NAVN[omraade],
        pgaTourSg: null,
        pgaTourLabel: PGA_TOUR_BASELINE_LABEL,
        spillerBaselineSg: null,
        motEgetNivaaSg: null,
        antallRunderIBaseline: sortert.length,
        terskelStatus: "FOR_LITE_GRUNNLAG",
        statusTekst: `Mangler data: minimum ${TERSKEL_MINIMUM_RUNDER} runder kreves for egen baseline.`,
      })),
    };
  }

  const maksBaseline = options?.maksBaselineRunder ?? MAKS_BASELINE_RUNDER;
  const baselineRunder = sortert.slice(0, maksBaseline);
  const sisteAntall = Math.min(options?.sisteRunderAntall ?? 5, baselineRunder.length);
  const sisteRunder = sortert.slice(0, sisteAntall);

  const omraader: SgOmraadeSammenligning[] = alleOmraader.map((omraade) => {
    const baseRes = snittAv(baselineRunder.map((r) => hentVerdi(r, omraade)));
    const sisteRes = snittAv(sisteRunder.map((r) => hentVerdi(r, omraade)));

    const pgaTourSg = sisteRes.snitt;
    const spillerBaselineSg = baseRes.snitt;
    const motEgetNivaaSg =
      pgaTourSg != null && spillerBaselineSg != null
        ? rund2(pgaTourSg - spillerBaselineSg)
        : null;

    let terskelStatus: OmraadeTerskelStatus = "INNLEDENDE";
    let statusTekst = "";

    if (omraade === "OTT" || omraade === "APP" || omraade === "TOTAL") {
      if (baseRes.antall >= TERSKEL_TEE_INNSPILL) {
        terskelStatus = "PALITELIG";
        statusTekst = `Statistisk pålitelig baseline (${baseRes.antall} runder).`;
      } else {
        terskelStatus = "INNLEDENDE";
        statusTekst = `Innledende tall (har ${baseRes.antall}/${TERSKEL_TEE_INNSPILL} runder for stabil baseline).`;
      }
    } else {
      if (baseRes.antall >= TERSKEL_NAERSPILL_PUTT) {
        terskelStatus = "PALITELIG";
        statusTekst = `Statistisk pålitelig baseline (${baseRes.antall} runder).`;
      } else {
        terskelStatus = "INNLEDENDE";
        statusTekst = `Innledende tall (har ${baseRes.antall}/${TERSKEL_NAERSPILL_PUTT} runder pga. høy varians i nærspill/putting).`;
      }
    }

    return {
      omraade,
      navn: OMRAADE_NAVN[omraade],
      pgaTourSg,
      pgaTourLabel: PGA_TOUR_BASELINE_LABEL,
      spillerBaselineSg,
      motEgetNivaaSg,
      antallRunderIBaseline: baseRes.antall,
      terskelStatus,
      statusTekst,
    };
  });

  const totalOmraade = omraader.find((o) => o.omraade === "TOTAL");
  let konklusjon = "";
  if (totalOmraade?.motEgetNivaaSg != null) {
    if (totalOmraade.motEgetNivaaSg >= MIN_MERKBAR_ENDRING) {
      konklusjon = `Spilleren presterer over egen baseline (+${totalOmraade.motEgetNivaaSg} slag mot eget ${baselineRunder.length}-runders snitt).`;
    } else if (totalOmraade.motEgetNivaaSg <= -MIN_MERKBAR_ENDRING) {
      konklusjon = `Spilleren presterer under egen baseline (${totalOmraade.motEgetNivaaSg} slag mot eget ${baselineRunder.length}-runders snitt).`;
    } else {
      konklusjon = `Spilleren presterer stabilt på nivå med egen baseline (${baselineRunder.length}-runders snitt).`;
    }
  } else {
    konklusjon = `Baseline beregnet over ${baselineRunder.length} runder mot PGA Tour referanse.`;
  }

  const grunnlag = `Spillerens egen baseline bygger på siste ${baselineRunder.length} runder. Sammenlignet mot siste ${sisteRunder.length} ${sisteRunder.length === 1 ? "runde" : "runder"}.`;

  return {
    harSvar: true,
    totalRunder: sortert.length,
    baselineRunderBrukt: baselineRunder.length,
    pgaTourLabel: PGA_TOUR_BASELINE_LABEL,
    konklusjon,
    grunnlag,
    omraader,
  };
}
