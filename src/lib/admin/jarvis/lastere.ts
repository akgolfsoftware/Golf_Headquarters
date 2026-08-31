/**
 * Jarvis — telling til fanepillene (MASTERPLAN 15.5).
 *
 * Selve dataene per fane er UENDRET — de fire fanene bruker de eksisterende
 * lasterne i `@/lib/agencyos/last-agenticos` og listene i
 * `@/lib/agencyos/agenticos-ia`, ordrett fra de fire sidene de erstatter.
 * Denne fila legger kun til de tallene som vises i pillene på hoderaden.
 */

import { AGENTICOS_RUNTIMES, AGENTICOS_SKILLS } from "@/lib/agencyos/agenticos-ia";
import type { AgenticosCockpitData, AgenticosProjectsData } from "@/lib/agencyos/last-agenticos";
import type { JarvisFaneId } from "./faner";

export function jarvisFaneTellinger(
  cockpit: AgenticosCockpitData,
  projects: AgenticosProjectsData,
): Record<JarvisFaneId, number> {
  const prosjekter = projects.grupper.reduce((s, g) => s + g.rader.length, 0);
  return {
    ko: cockpit.venterPaDeg,
    prosjekter,
    skills: AGENTICOS_SKILLS.length,
    runtimes: AGENTICOS_RUNTIMES.filter((r) => r.koblet).length,
  };
}
