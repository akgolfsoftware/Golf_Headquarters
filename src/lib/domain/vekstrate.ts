/**
 * Vekstrate — «utvikler han seg raskt nok?» (Innsikt, A-19a).
 *
 * Fasit: designsystem/train-lock/A-19 Innsikt.dc.html (+ A-19L lys), fane
 * «Vekstrate», spørsmål 1 av 4 (Anders 2026-08-30, «INNSIKT PER SPILLER —
 * de fire spørsmålene»).
 *
 * Metoden: spillerens snitt til-par per sesong (samme tall som PlayerHQ «Min
 * kurve» viser, jf. `min-kurve.ts`), første og siste sesong med data gir en
 * rate i slag per sesong. Negativ rate er forbedring (lavere til-par er
 * bedre). Kullets rate — samme regnestykke på alle spillere i samme
 * fødselsår, hentet fra `dashboard.mv_topar_grunnlag` — er coachens
 * (skjulte) referanse og vises ALDRI til spilleren selv (PRODUKTRETNING
 * pkt. 3: «Kohort-sammenligning er coachens verktøy alene»).
 *
 * TRUTHLAYER: en rate regnet på ett datapunkt er ikke en rate. Færre enn to
 * sesonger med data gir `harSvar: false` og en setning som sier hvorfor,
 * aldri en fabrikkert kurve. Kohorten er valgfri — mangler fødselsår, eller
 * er kohorten for tynn til å stå for et snitt, vises spillerens egen rate
 * likevel, bare uten sammenligningslinjen.
 *
 * IKKE HÅNDTERT (bevisst, se PR-beskrivelse): tee-effekten datakartleggingen
 * 30.08 påviste for aldersstiger under 16 år er ikke aldersgatet her — et
 * kullsnitt på tvers av et helt fødselsår kan blande spillere på ulike teer.
 * Nevnes til Anders, ikke besluttet stille.
 *
 * Ren funksjon: ingen IO, ingen Date.now().
 */

/** Færre sesonger enn dette gir ingen rate å vise. */
export const MIN_SESONGER = 2;

/** Færre spillere enn dette i en kohort-sesong er for tynt til å stå for et snitt. */
export const MIN_SPILLERE_KOHORT = 5;

export type SesongSnitt = {
  aar: number;
  /** Snitt av turneringenes snitt-til-par-per-runde i sesongen. */
  snitt: number;
  antallTurneringer: number;
};

/** Kullets snitt for én sesong, med grunnlagstall for TruthLayer-sperren. */
export type KohortSesongSnitt = {
  aar: number;
  snitt: number;
  antallSpillere: number;
};

export type VekstratePunkt = {
  aar: number;
  spiller: number | null;
  kohort: number | null;
};

export type Vekstrate = {
  punkter: VekstratePunkt[];
  /** Slag per sesong over hele spennet. Negativ = forbedring. Null uten svar. */
  egenRate: number | null;
  /** Kullets rate over samme spenn — kun til coach. Null uten kohortdata. */
  kohortRate: number | null;
  fraAar: number | null;
  tilAar: number | null;
  harSvar: boolean;
  harKohort: boolean;
  grunnlag: string;
};

const rund1 = (v: number) => Math.round(v * 10) / 10;

/** Grupper spillerens punkter (dato + snitt til-par) på kalenderår. */
export function grupperPerSesong(punkter: { dato: Date; snitt: number }[]): SesongSnitt[] {
  const per = new Map<number, { sum: number; antall: number }>();
  for (const p of punkter) {
    const aar = p.dato.getFullYear();
    const eks = per.get(aar) ?? { sum: 0, antall: 0 };
    eks.sum += p.snitt;
    eks.antall += 1;
    per.set(aar, eks);
  }
  return [...per.entries()]
    .map(([aar, { sum, antall }]) => ({ aar, snitt: rund1(sum / antall), antallTurneringer: antall }))
    .sort((a, b) => a.aar - b.aar);
}

function rateFor(forste: { aar: number; snitt: number }, siste: { aar: number; snitt: number }): number | null {
  const spenn = siste.aar - forste.aar;
  if (spenn <= 0) return null;
  return rund1((siste.snitt - forste.snitt) / spenn);
}

/**
 * Regn ut vekstraten for én spiller, ev. mot et kullsnitt.
 *
 * `spillerPunkter` er ALLE spillerens punkter (alle sesonger, ikke bare
 * valgt sesong) — samme kilde som «Min kurve» sitt `punkter` med
 * `onsketSesong: "alle"`. `kohortPerSesong` kommer ferdig aggregert fra
 * `dashboard.mv_topar_grunnlag`, én rad per sesong.
 */
export function beregnVekstrate(
  spillerPunkter: { dato: Date; snitt: number }[],
  kohortPerSesong: KohortSesongSnitt[] = [],
): Vekstrate {
  const sesonger = grupperPerSesong(spillerPunkter);

  if (sesonger.length < MIN_SESONGER) {
    return {
      punkter: sesonger.map((s) => ({ aar: s.aar, spiller: s.snitt, kohort: null })),
      egenRate: null,
      kohortRate: null,
      fraAar: sesonger[0]?.aar ?? null,
      tilAar: sesonger[0]?.aar ?? null,
      harSvar: false,
      harKohort: false,
      grunnlag:
        sesonger.length === 0
          ? "Ingen turneringer er registrert på deg ennå."
          : `Kun ${sesonger[0].aar} har registrerte turneringer. Trenger minst to sesonger for å vise en vekstrate.`,
    };
  }

  const forste = sesonger[0];
  const siste = sesonger[sesonger.length - 1];
  const egenRate = rateFor(forste, siste);

  const kohortGyldig = kohortPerSesong.filter((k) => k.antallSpillere >= MIN_SPILLERE_KOHORT);
  const kohortForKullFor = kohortGyldig.find((k) => k.aar === forste.aar);
  const kohortForKullTil = kohortGyldig.find((k) => k.aar === siste.aar);
  const kohortRate =
    kohortForKullFor && kohortForKullTil ? rateFor(kohortForKullFor, kohortForKullTil) : null;
  const harKohort = kohortRate != null;

  const kohortPerAar = new Map(kohortGyldig.map((k) => [k.aar, k.snitt]));
  const punkter: VekstratePunkt[] = sesonger.map((s) => ({
    aar: s.aar,
    spiller: s.snitt,
    kohort: kohortPerAar.get(s.aar) ?? null,
  }));

  return {
    punkter,
    egenRate,
    kohortRate,
    fraAar: forste.aar,
    tilAar: siste.aar,
    harSvar: true,
    harKohort,
    grunnlag: `Egen vekstrate ${forste.aar}→${siste.aar}, basert på ${sesonger.reduce((s, r) => s + r.antallTurneringer, 0)} turneringer.`,
  };
}
