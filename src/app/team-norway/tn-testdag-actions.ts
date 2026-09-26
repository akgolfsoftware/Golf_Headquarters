"use server";

/**
 * Team Norway — testdag: opprett, kø-status og avslutning. Selve
 * målingene skrives via `saveTnTestSomCoach` (tn-testforing-actions.ts).
 * Additiv modell (`TestDay`/`TestDayParticipant`) — se docs/design-audit/
 * team-norway-testdag-modellforslag-2026-09-14.md.
 *
 * Alle statusoverganger skjer INNI en transaksjon med et atomisk `updateMany`
 * som betingelse (fra-status i where-klausulen) — en samtidig konkurrerende
 * endring kan derfor aldri stille overskrive en annen. Feilmeldinger er
 * ALLTID egne, navngitte domenetekster — rå Prisma-/infrastrukturfeil
 * lekker aldri til klienten.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TEAM_NORWAY_SLUG, aktivtMedlemskapWhere, aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { medSerialisertTestdagTransaksjon } from "@/lib/domain/tn-testdag-lock";
import { tnDefinitionData, tnDefinitionId } from "@/lib/portal-tester/tn-integration";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";

const OpprettTestdagSchema = z.object({
  title: z.string().trim().min(1).max(200),
  location: z.string().trim().max(200).optional(),
  scheduledAt: z.string().min(1),
  protocolId: z.string().min(1).max(80),
  spillerIder: z.array(z.string().min(1)).min(1).max(200),
});

export async function opprettTestdag(input: unknown): Promise<{ ok: true; testDayId: string } | { ok: false; error: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = OpprettTestdagSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldige felt for testdag." };
  const data = parsed.data;

  const protokoll = tnProtocol(data.protocolId);
  if (!protokoll || protokoll.blocked) return { ok: false, error: "Ukjent eller ikke klar protokoll." };
  if (protokoll.variableCount) return { ok: false, error: "Protokoller med valgfritt antall forsøk støttes ikke i testdag ennå." };
  const scheduledAt = new Date(data.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) return { ok: false, error: "Ugyldig tidspunkt." };

  // Bevar brukerens rekkefølge, men fjern duplikater (samme id valgt to ganger).
  const rekkefolge = [...new Set(data.spillerIder)];
  const definitionId = tnDefinitionId(protokoll);

  try {
    const testDayId = await medSerialisertTestdagTransaksjon(async (tx) => {
      const gruppe = await tx.group.findUnique({ where: { slug: TEAM_NORWAY_SLUG }, select: { id: true } });
      if (!gruppe) throw new Error("Team Norway-gruppen finnes ikke.");
      if (coach.role !== "ADMIN") {
        const medlem = await tx.groupMember.findFirst({ where: { groupId: gruppe.id, userId: coach.id, role: "COACH", ...aktivtMedlemskapWhere() }, select: { id: true } });
        if (!medlem) throw new Error("Du er ikke aktiv trener i Team Norway-gruppen.");
      }
      // ALLE valgte må være aktive TN-spillere — én fremmed id avviser HELE
      // forespørselen (ikke stille filtrert bort), slik at klienten aldri
      // kan liste opp en utenforstående inn i en testdag.
      const aktiveSpillere = await tx.groupMember.findMany({
        where: { groupId: gruppe.id, userId: { in: rekkefolge }, ...aktivtSpillerMedlemskapWhere() },
        select: { userId: true },
      });
      const aktiveIder = new Set(aktiveSpillere.map((s) => s.userId));
      const fremmede = rekkefolge.filter((id) => !aktiveIder.has(id));
      if (fremmede.length > 0) throw new Error("En eller flere valgte er ikke aktive spillere i Team Norway-gruppen.");

      await tx.testDefinition.upsert({ where: { id: definitionId }, update: {}, create: tnDefinitionData(protokoll) });
      const dag = await tx.testDay.create({
        data: { groupId: gruppe.id, coachId: coach.id, title: data.title, location: data.location || null, scheduledAt, testDefinitionId: definitionId, status: "ACTIVE" },
        select: { id: true },
      });
      // Rekkefølge fra BRUKERENS valgte liste (rekkefolge), ikke fra DB-svaret.
      await tx.testDayParticipant.createMany({
        data: rekkefolge.map((playerId, i) => ({ testDayId: dag.id, playerId, order: i })),
      });
      return dag.id;
    });
    revalidatePath("/team-norway/fellestesting");
    return { ok: true, testDayId };
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const trygg = /^(Team Norway-gruppen|Du er ikke|En eller flere)/.test(message);
    return { ok: false, error: trygg ? message : "Kunne ikke opprette testdagen. Prøv igjen." };
  }
}

const SettStatusSchema = z.object({
  testDayParticipantId: z.string().min(1),
  status: z.enum(["PENDING", "SKIPPED", "ABSENT"]),
});

/** Hopp over / ikke møtt / tilbake til køen — endrer ALDRI en allerede DONE-rad, og aldri på en avsluttet/kansellert dag. */
export async function settTestdagDeltakerStatus(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = SettStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig status." };

  try {
    await medSerialisertTestdagTransaksjon(async (tx) => {
      const deltaker = await tx.testDayParticipant.findUnique({
        where: { id: parsed.data.testDayParticipantId },
        include: { testDay: { include: { group: true } } },
      });
      if (!deltaker || deltaker.testDay.group.slug !== TEAM_NORWAY_SLUG) throw new Error("Fant ikke deltakeren.");
      if (deltaker.testDay.status !== "ACTIVE") throw new Error("Testdagen er ikke aktiv og kan ikke endres.");
      if (coach.role !== "ADMIN") {
        const medlem = await tx.groupMember.findFirst({ where: { groupId: deltaker.testDay.groupId, userId: coach.id, role: "COACH", ...aktivtMedlemskapWhere() }, select: { id: true } });
        if (!medlem) throw new Error("Du er ikke aktiv trener i Team Norway-gruppen.");
      }
      const oppdatert = await tx.testDayParticipant.updateMany({
        where: { id: deltaker.id, status: { not: "DONE" } },
        data: { status: parsed.data.status },
      });
      if (oppdatert.count !== 1) throw new Error("Denne er allerede ført og kan ikke endres.");
    });
    revalidatePath("/team-norway/fellestesting");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const trygg = /^(Fant ikke|Testdagen er ikke|Du er ikke|Denne er allerede)/.test(message);
    return { ok: false, error: trygg ? message : "Kunne ikke endre status. Prøv igjen." };
  }
}

/** Avslutter testdagen atomisk — krever at ingen deltaker fortsatt er PENDING, kontrollert i samme transaksjon som statusendringen. */
export async function avsluttTestdag(testDayId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  try {
    await medSerialisertTestdagTransaksjon(async (tx) => {
      const dag = await tx.testDay.findUnique({ where: { id: testDayId }, include: { group: true, participants: { select: { status: true } } } });
      if (!dag || dag.group.slug !== TEAM_NORWAY_SLUG) throw new Error("Fant ikke testdagen.");
      if (coach.role !== "ADMIN") {
        const medlem = await tx.groupMember.findFirst({ where: { groupId: dag.groupId, userId: coach.id, role: "COACH", ...aktivtMedlemskapWhere() }, select: { id: true } });
        if (!medlem) throw new Error("Du er ikke aktiv trener i Team Norway-gruppen.");
      }
      if (dag.participants.some((d) => d.status === "PENDING")) throw new Error("Alle deltakere må være ført, hoppet over eller merket ikke møtt før avslutning.");
      const oppdatert = await tx.testDay.updateMany({ where: { id: testDayId, status: "ACTIVE" }, data: { status: "COMPLETED" } });
      if (oppdatert.count !== 1) throw new Error("Testdagen ble endret samtidig. Last siden på nytt.");
    });
    revalidatePath("/team-norway/fellestesting");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const trygg = /^(Fant ikke|Du er ikke|Alle deltakere|Testdagen ble)/.test(message);
    return { ok: false, error: trygg ? message : "Kunne ikke avslutte testdagen. Prøv igjen." };
  }
}
