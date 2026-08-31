/**
 * Kø — fanedefinisjonen (MASTERPLAN 15.1, beslutning 6.9 «én inngang per funksjon»).
 *
 * Seks adresser ble til én: /admin/ko. Fem av dem er faner her; den sjette
 * (/admin/queue, oppfølging av spillere) er IKKE Kø — den hører i Stall
 * (beslutning 6.6) og står bevisst utenfor denne lista.
 *
 * Ren modul: ingen Prisma, ingen React. Tilgangsregelen kan dermed testes
 * uten database — og det er poenget. En sammenslåing skal ALDRI utvide
 * tilgang: hver fane beholder gaten sin fra siden den kom fra.
 */

import { Capability } from "@/lib/auth/cbac";

export type KoFaneId =
  | "godkjenninger"
  | "agentko"
  | "agentgodkjenn"
  | "tester"
  | "dubletter";

export type KoFane = {
  id: KoFaneId;
  label: string;
  /** Adressen fanen erstattet — kilden til redirecten. */
  gammelHref: string;
  /**
   * Capability fanen krever UTOVER ADMIN/COACH-basisgaten på siden.
   * null = ingen ekstra krav (siden holder), altså samme gate som før.
   */
  krever: Capability | null;
};

/** Rekkefølgen er visningsrekkefølgen. Godkjenninger først — den er den travleste. */
export const KO_FANER: KoFane[] = [
  {
    id: "godkjenninger",
    label: "Godkjenninger",
    gammelHref: "/admin/godkjenninger",
    krever: null,
  },
  {
    id: "agentko",
    label: "Agent-kø",
    gammelHref: "/admin/agenticos/ko",
    krever: Capability.USE_AGENTS,
  },
  {
    id: "agentgodkjenn",
    label: "Agent-godkjenning",
    gammelHref: "/admin/agenticos/godkjenn",
    krever: Capability.USE_AGENTS,
  },
  {
    id: "tester",
    label: "Foreslåtte tester",
    gammelHref: "/admin/tester/foreslatte",
    krever: Capability.MANAGE_TESTS,
  },
  {
    id: "dubletter",
    label: "Dubletter",
    // MASTERPLAN 15.6: selve dubletter-VERKTØYET flyttet til /admin/turnering
    // — /admin/tournaments/dubletter redirecter dit nå, ikke hit. Denne fanen
    // viser fortsatt dubletter som sak-type (deler loaderen med Turnering),
    // så feltet peker på verktøyets nye adresse, ikke en gammel Kø-kilde.
    gammelHref: "/admin/turnering?fane=dubletter",
    krever: null,
  },
];

export const KO_STANDARDFANE: KoFaneId = "godkjenninger";

/** Er `s` en kjent fane-id? Brukes på `?fane=`-parameteren. */
export function erKoFaneId(s: string | undefined): s is KoFaneId {
  return s !== undefined && KO_FANER.some((f) => f.id === s);
}

/**
 * Fanene brukeren faktisk får se, gitt hvilke capabilities hen har.
 * Mangler capability, finnes fanen ikke — verken som pille eller som innhold.
 */
export function synligeFaner(harCapability: (c: Capability) => boolean): KoFane[] {
  return KO_FANER.filter((f) => f.krever === null || harCapability(f.krever));
}

/**
 * Hvilken fane skal vises? Ukjent, manglende eller utilgjengelig `?fane=`
 * faller tilbake til første SYNLIGE fane — aldri til en fane brukeren ikke
 * har lov til å se.
 */
export function velgFane(
  onsket: string | undefined,
  synlige: KoFane[],
): KoFaneId | null {
  if (synlige.length === 0) return null;
  if (erKoFaneId(onsket) && synlige.some((f) => f.id === onsket)) return onsket;
  const standard = synlige.find((f) => f.id === KO_STANDARDFANE);
  return (standard ?? synlige[0]).id;
}

/** `/admin/ko?fane=<id>` — standardfanen får ren adresse uten parameter. */
export function koHref(fane: KoFaneId): string {
  return fane === KO_STANDARDFANE ? "/admin/ko" : `/admin/ko?fane=${fane}`;
}
