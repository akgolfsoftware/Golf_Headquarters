/**
 * Bro `CourseDefinition` → `Bane` — server-siden (AP0.4).
 *
 * Setter `CourseDefinition.baneId` når en runde lagres eller en bane velges,
 * slik at broen bygges av seg selv i drift i stedet for å måtte kjøres som
 * engangsjobb i evighet (`scripts/koble-runder-til-baner-2026-08-16.ts`
 * rydder historikken; denne holder den ved like).
 *
 * Matchingen bor i `src/lib/domain/bane-bro.ts` og gjetter aldri.
 *
 * KONTRAKT: funksjonen kaster ALDRI og blokkerer aldri noe. Den kalles etter
 * at runden er lagret — en feilet bro skal ikke kunne velte en lagring
 * (invariant 1: ingenting sperrer).
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { velgEntydigBane } from "@/lib/domain/bane-bro";

/**
 * Returnerer `baneId` for en CourseDefinition — og setter broen først hvis
 * den mangler og navnet gir et entydig treff. `null` når banen ikke kan
 * kobles (ukjent navn, flertydig navn, eller feil).
 */
export async function sikreBaneBro(courseId: string): Promise<string | null> {
  try {
    const course = await prisma.courseDefinition.findUnique({
      where: { id: courseId },
      select: { baneId: true, name: true },
    });
    if (!course) return null;

    // Kort vei: broen finnes allerede (satt av kode, script eller manuelt).
    if (course.baneId) return course.baneId;

    const baner = await prisma.bane.findMany({
      select: { id: true, navn: true, kortNavn: true, klubb: true },
    });

    const treff = velgEntydigBane(course.name, baner);
    if (treff.status !== "treff") return null;

    // updateMany med baneId: null i where — idempotent og race-fri, og kan
    // aldri overskrive en bro noen har satt manuelt mellom lesing og skriving.
    await prisma.courseDefinition.updateMany({
      where: { id: courseId, baneId: null },
      data: { baneId: treff.baneId },
    });

    return treff.baneId;
  } catch {
    // Bivirkning, ikke forutsetning — svelg alt.
    return null;
  }
}
