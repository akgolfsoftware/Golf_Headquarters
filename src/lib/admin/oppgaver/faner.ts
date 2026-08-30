/**
 * Oppgaver — fanedefinisjonen (MASTERPLAN 15.2, beslutning 6.6 + 6.9).
 *
 * Fire adresser ble til én: /admin/oppgaver.
 *
 * Skillet mot Kø er TID, ikke type (beslutning 6.6): Kø er det som krever
 * Anders i dag. Oppgaver er prosjektstyring og faste rutiner — det som går
 * på skinner. En sak som haster hører i Kø, ikke her.
 *
 * Ren modul: ingen Prisma, ingen React — tilgangsregelen kan testes uten base.
 */

export type OppgaveFaneId = "prosjekter" | "rutiner" | "tildelt";

export type OppgaveFane = {
  id: OppgaveFaneId;
  label: string;
  /** Adressen fanen erstattet — kilden til redirecten. */
  gammelHref: string | null;
  /**
   * Fanen krever ADMIN, ikke bare ADMIN/COACH.
   * `/admin/workspace/prosjekter` gatet på ADMIN alene — en sammenslåing skal
   * aldri utvide tilgang, så fanen arver den strengere gaten.
   */
  kreverAdmin: boolean;
};

/** Rekkefølgen er visningsrekkefølgen, og følger canvasen Anders godkjente 30.08. */
export const OPPGAVE_FANER: OppgaveFane[] = [
  { id: "prosjekter", label: "Prosjekter", gammelHref: "/admin/workspace/prosjekter", kreverAdmin: true },
  { id: "rutiner", label: "Rutiner", gammelHref: null, kreverAdmin: false },
  { id: "tildelt", label: "Tildelt meg", gammelHref: "/admin/handlingssenter", kreverAdmin: false },
];

export const OPPGAVE_STANDARDFANE: OppgaveFaneId = "prosjekter";

export function erOppgaveFaneId(s: string | undefined): s is OppgaveFaneId {
  return s !== undefined && OPPGAVE_FANER.some((f) => f.id === s);
}

/** Fanene brukeren faktisk får se. En COACH ser ikke Prosjekter. */
export function synligeOppgaveFaner(erAdmin: boolean): OppgaveFane[] {
  return OPPGAVE_FANER.filter((f) => !f.kreverAdmin || erAdmin);
}

/**
 * Hvilken fane skal vises? Ukjent, manglende eller utilgjengelig `?fane=`
 * faller til første SYNLIGE fane — aldri til en fane brukeren ikke får se.
 */
export function velgOppgaveFane(
  onsket: string | undefined,
  synlige: OppgaveFane[],
): OppgaveFaneId {
  if (erOppgaveFaneId(onsket) && synlige.some((f) => f.id === onsket)) return onsket;
  const standard = synlige.find((f) => f.id === OPPGAVE_STANDARDFANE);
  return (standard ?? synlige[0]).id;
}

/** `/admin/oppgaver?fane=<id>` — standardfanen får ren adresse. */
export function oppgaveHref(fane: OppgaveFaneId): string {
  return fane === OPPGAVE_STANDARDFANE ? "/admin/oppgaver" : `/admin/oppgaver?fane=${fane}`;
}

/** Frekvensene en driftsrutine kan ha. Rekkefølgen er visningsrekkefølgen. */
export const RUTINE_FREKVENSER = ["daglig", "ukentlig", "manedlig"] as const;
export type RutineFrekvens = (typeof RUTINE_FREKVENSER)[number];

export function erRutineFrekvens(s: string): s is RutineFrekvens {
  return (RUTINE_FREKVENSER as readonly string[]).includes(s);
}

export function frekvensLabel(f: string): string {
  return { daglig: "Daglig", ukentlig: "Ukentlig", manedlig: "Månedlig" }[f] ?? f;
}

/**
 * Merkelappen som er hele poenget med rutine-fanen (beslutning 6.6):
 * Anders skal se hvilke rutiner en agent kan overta, og hvilke som krever
 * et menneske fysisk til stede.
 */
export function automatiseringLabel(automatiserbar: boolean): string {
  return automatiserbar ? "Kan automatiseres" : "Må gjøres fysisk";
}
