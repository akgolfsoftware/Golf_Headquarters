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
