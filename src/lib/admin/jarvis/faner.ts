/**
 * Jarvis — ÉN adresse (MASTERPLAN 15.5, beslutning 6.9 «én inngang per funksjon»).
 *
 * Fire adresser blir én: `/admin/agenticos`, `/admin/agenticos/projects`,
 * `/admin/agenticos/runtimes`, `/admin/agenticos/skills` → `/admin/jarvis`.
 * Alle fire består som redirects.
 *
 * IKKE med her: `/admin/agenticos/ko` og `/admin/agenticos/godkjenn` — de er
 * ALLEREDE flyttet (MASTERPLAN 15.1) til `/admin/ko` som fanene «agentko» og
 * «agentgodkjenn». Å ta dem inn her igjen ville gitt to steder for samme
 * innhold, nøyaktig det 6.9 skal fjerne. `/admin/agents/[agentId]` (agent-
 * detaljarket) er heller ikke en av de fire — den beholder sin egen adresse.
 *
 * Rekkefølgen følger canvasen Anders godkjente 30.08:
 * `designsystem/canvas/agencyos-ia/Jarvis.dc.html`.
 *
 * TILGANG: alle fire kildesidene gatet likt — `requireCapability(Capability.USE_AGENTS)`.
 * Én felles gate på siden er derfor riktig; ingen fane trenger noe strengere.
 * En sammenslåing skal ALDRI utvide tilgang.
 *
 * Ren modul: ingen Prisma, ingen React.
 */

export type JarvisFaneId = "ko" | "prosjekter" | "skills" | "runtimes";

export type JarvisFane = {
  id: JarvisFaneId;
  label: string;
  /** Adressen fanen erstattet — kilden til redirecten. */
  gammelHref: string;
};

/** Rekkefølgen er visningsrekkefølgen, og følger canvasens pillerad. */
export const JARVIS_FANER: JarvisFane[] = [
  { id: "ko", label: "Kø", gammelHref: "/admin/agenticos" },
  { id: "prosjekter", label: "Prosjekter", gammelHref: "/admin/agenticos/projects" },
  { id: "skills", label: "Skills", gammelHref: "/admin/agenticos/skills" },
  { id: "runtimes", label: "Runtimes", gammelHref: "/admin/agenticos/runtimes" },
];

export const JARVIS_STANDARDFANE: JarvisFaneId = "ko";

export function erJarvisFaneId(s: string | undefined): s is JarvisFaneId {
  return s !== undefined && JARVIS_FANER.some((f) => f.id === s);
}

/**
 * Hvilken fane skal vises? Ukjent, manglende eller ugyldig `?fane=` faller
 * til standardfanen — alle fire er alltid synlige (samme gate på hele siden).
 */
export function velgJarvisFane(onsket: string | undefined): JarvisFaneId {
  if (erJarvisFaneId(onsket)) return onsket;
  return JARVIS_STANDARDFANE;
}

/** `/admin/jarvis?fane=<id>` — standardfanen får ren adresse. */
export function jarvisHref(fane: JarvisFaneId): string {
  return fane === JARVIS_STANDARDFANE ? "/admin/jarvis" : `/admin/jarvis?fane=${fane}`;
}
