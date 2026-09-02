/**
 * Rene regler for Team Norway-poster (Claw batch 3, TN-09/TN-10/TN-11).
 * Ingen DB, ingen server-imports — testes isolert. Data-tilgangen ligger i
 * `tn-post.ts`, som bygger på disse. Mønster: samtykke-regler.ts.
 *
 * Oppslagstavle, ikke chat (design-beslutning, prompt-batch-3.md): en post
 * kan kvitteres (lest), aldri besvares. Nøyaktig én mottaker-type per post —
 * gruppe (TN-09) eller én spiller (TN-10) — håndhevet av DB-CHECK i tillegg
 * til her, jf. schema-kommentaren på TnPost.
 */

// DOKUMENT = frittstående opplasting til dokumentbiblioteket (TN-11 «Last opp
// fil»), aldri vist i selve tidslinjen — en post uten tekst hvis eneste
// formål er å bære ett vedlegg. Skiller «FRA POST»/«LASTET OPP»-kilden i
// TnDokumentdeling.dc.html uten en egen dokument-tabell.
export const TN_POST_KINDER = ["TEKST", "REISE", "MOTE", "OKT", "DOKUMENT"] as const;
export type TnPostKind = (typeof TN_POST_KINDER)[number];

export function erTnPostKind(v: string): v is TnPostKind {
  return (TN_POST_KINDER as readonly string[]).includes(v);
}

/** En post har nøyaktig én mottaker-type — aldri begge, aldri ingen. */
export type TnPostMottaker =
  | { type: "gruppe"; groupId: string }
  | { type: "spiller"; spillerId: string };

/**
 * Kan denne brukeren se en gruppepost? Kun aktive medlemmer av gruppen
 * (spiller, hjelpetrener eller trener) — utmeldte (endedAt satt) er ute,
 * samme grense som resten av gruppedomenet (aktivtMedlemskapWhere).
 */
export function kanSeGruppepost(
  viewerErAktivtMedlem: boolean,
): boolean {
  return viewerErAktivtMedlem;
}

/**
 * Kan denne brukeren se en 1:1-post til en spiller? Spilleren selv, en
 * godkjent foresatt (1:1-poster til mindreårige er ALDRI private mellom
 * trener og barn — idrettens åpenhetsprinsipp, prompt-batch-3.md, håndhevet
 * på datalaget, ikke en UI-innstilling), ELLER treneren som har lov til å
 * poste til akkurat denne spilleren (TN-10 er primært en trener-flate).
 */
export function kanSeSpillerpost(input: {
  viewerId: string;
  spillerId: string;
  viewerErGodkjentForesattForSpilleren: boolean;
  viewerErTrenerForSpilleren?: boolean;
}): boolean {
  return (
    input.viewerId === input.spillerId ||
    input.viewerErGodkjentForesattForSpilleren ||
    input.viewerErTrenerForSpilleren === true
  );
}

/**
 * Kan denne brukeren forfatte en post til gruppen/spilleren? Kun aktive
 * trenere (COACH eller ASSISTANT) i gruppen. For 1:1-poster: trener må være
 * aktiv trener i EN gruppe der mottakeren er aktivt PLAYER-medlem — en
 * trener kan ikke poste til en spiller de ikke har noen tilknytning til.
 */
export function kanForfattePost(viewerErAktivTrenerIRelevantGruppe: boolean): boolean {
  return viewerErAktivTrenerIRelevantGruppe;
}

export type Lesekvittering = {
  totalt: number;
  apnet: number;
  /** Brukerid-ene i mottakerlista som IKKE har en lesekvittering ennå. */
  manglerIder: string[];
};

/**
 * Brøken i TN-09/TN-10/TN-11-designet: «12 av 14 har åpnet» + navnelisten
 * for hvem som mangler. Mottakerlista er de aktive spiller-medlemmene i
 * gruppen (trenere og foresatte telles aldri med — 14 er antall UTØVERE,
 * jf. designnotatet i TnGruppeposter.dc.html).
 */
export function beregnLesekvittering(
  mottakerIder: readonly string[],
  lestAvIder: readonly string[],
): Lesekvittering {
  const lest = new Set(lestAvIder);
  const manglerIder = mottakerIder.filter((id) => !lest.has(id));
  return {
    totalt: mottakerIder.length,
    apnet: mottakerIder.length - manglerIder.length,
    manglerIder,
  };
}
