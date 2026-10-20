"use server";

/**
 * «Planlegg testdag» i AgencyOS (AG-15, designløftet 20.10.2026). Lager ett
 * arrangement (TestDayEvent) for gruppa og én stasjon (TestDay, ACTIVE) per valgt
 * test, med alle aktive spillere i gruppa som deltakere. Registreringen skjer
 * med saveTnTestSomCoach, som krever akkurat samme tilgang.
 *
 * Tilgang: COACH/ADMIN med MANAGE_TESTS, og coachen eier gruppa eller er aktivt
 * COACH-medlem (editableGroupWhere). Bare tester en trener kan føre (trenerKanFore).
 * Ingen e-post eller varsel sendes.
 */
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertCapability } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { editableGroupWhere } from "@/lib/workbench/group-scope";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnDefinitionData, tnDefinitionId } from "@/lib/portal-tester/tn-integration";
import { trenerKanFore } from "@/lib/portal-tester/testbatteri";

const Schema = z.object({
  gruppeId: z.string().min(1).max(64),
  /** «YYYY-MM-DDTHH:mm» i Oslo-tid. */
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  sted: z.string().trim().max(120).optional(),
  protokoller: z.array(z.string().min(1).max(64)).min(1).max(20),
});

/** «2026-10-29T16:00» i Oslo-tid til riktig øyeblikk, uansett serverens tidssone. */
function osloTilDato(lokal: string): Date | null {
  const [d, t] = lokal.split("T");
  const [y, m, dag] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  const utc = Date.UTC(y, m - 1, dag, h, min);
  if (!Number.isFinite(utc)) return null;
  // Finn Oslo-forskyvningen for dette øyeblikket (sommer- og vintertid).
  const deler = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(utc));
  const v = (k: string) => Number(deler.find((p) => p.type === k)?.value);
  const somOslo = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"));
  return new Date(utc - (somOslo - utc));
}

export async function planleggTestdag(input: z.infer<typeof Schema>): Promise<{ ok: true; eventId: string } | { ok: false; error: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertCapability(coach, Capability.MANAGE_TESTS);
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Sjekk gruppe, dato, tid og tester." };
  const { gruppeId, start, sted, protokoller } = parsed.data;

  const scheduledAt = osloTilDato(start);
  if (!scheduledAt) return { ok: false, error: "Ugyldig dato eller tid." };
  const valgte = [...new Set(protokoller)].map((id) => tnProtocol(id));
  if (valgte.some((p) => !p || p.blocked || p.variableCount || !trenerKanFore({ protokollId: p.id }))) {
    return { ok: false, error: "En av testene kan ikke føres av trener på en testdag." };
  }

  const gruppe = await prisma.group.findFirst({ where: { AND: [{ id: gruppeId }, editableGroupWhere(coach)] }, select: { id: true, name: true } });
  if (!gruppe) return { ok: false, error: "Du er ikke trener for denne gruppen." };
  const spillere = await prisma.groupMember.findMany({
    where: { groupId: gruppe.id, ...aktivtSpillerMedlemskapWhere(), user: { deletedAt: null } },
    orderBy: { joinedAt: "asc" },
    select: { userId: true },
  });
  const ider = [...new Set(spillere.map((s) => s.userId))];
  if (!ider.length) return { ok: false, error: "Gruppen har ingen aktive spillere." };

  const eventId = await prisma.$transaction(async (tx) => {
    const ev = await tx.testDayEvent.create({
      data: { organizerGroupId: gruppe.id, organizerId: coach.id, title: `Testdag · ${gruppe.name}`, location: sted || null, scheduledAt, status: "ACTIVE" },
      select: { id: true },
    });
    for (const p of valgte) {
      const protokoll = p!;
      const definitionId = tnDefinitionId(protokoll);
      await tx.testDefinition.upsert({ where: { id: definitionId }, update: {}, create: tnDefinitionData(protokoll) });
      const dag = await tx.testDay.create({
        data: { groupId: gruppe.id, coachId: coach.id, eventId: ev.id, stationName: protokoll.name, title: protokoll.name, location: sted || null, scheduledAt, testDefinitionId: definitionId, status: "ACTIVE" },
        select: { id: true },
      });
      await tx.testDayParticipant.createMany({ data: ider.map((playerId, order) => ({ testDayId: dag.id, playerId, order })) });
    }
    return ev.id;
  });
  revalidatePath("/admin/tester");
  return { ok: true, eventId };
}
