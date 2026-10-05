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

const OpprettFellesTestdagSchema = z.object({
  title: z.string().trim().min(1).max(200),
  location: z.string().trim().max(200).optional(),
  scheduledAt: z.string().min(1),
  stations: z.array(z.object({
    groupId: z.string().min(1),
    stationName: z.string().trim().min(1).max(100),
    protocolId: z.string().min(1).max(80),
    spillerIder: z.array(z.string().min(1)).min(1).max(200),
  })).min(2).max(30),
});

/**
 * Oppretter ett felles arrangement med flere skole-/TN-stasjoner. Hver stasjon
 * blir en ordinær TestDay-rad, slik at TestSession og TestResult fortsatt er
 * eneste kilde for økt og resultat. Hele opprettelsen rulles tilbake hvis én
 * gruppe, spiller eller protokoll ikke består kontrollen.
 */
export async function opprettFellesTestdag(input: unknown): Promise<
  | { ok: true; eventId: string; stationIds: string[] }
  | { ok: false; error: string }
> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = OpprettFellesTestdagSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldige felt for felles testdag." };
  const data = parsed.data;
  const scheduledAt = new Date(data.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) return { ok: false, error: "Ugyldig tidspunkt." };

  const stationNames = data.stations.map((station) => station.stationName.toLocaleLowerCase("nb-NO"));
  if (new Set(stationNames).size !== stationNames.length) {
    return { ok: false, error: "Hver stasjon må ha et eget navn." };
  }
  if (new Set(data.stations.map((station) => station.groupId)).size !== data.stations.length) {
    return { ok: false, error: "Hver skole eller gruppe kan bare ha én stasjon i arrangementet." };
  }
  const alleDeltakere = data.stations.flatMap((station) => station.spillerIder);
  if (new Set(alleDeltakere).size !== alleDeltakere.length) {
    return { ok: false, error: "En spiller kan bare være tildelt én stasjon per arrangement." };
  }
  const stationProtocols = data.stations.map((station) => tnProtocol(station.protocolId));
  if (stationProtocols.some((protocol) => !protocol || protocol.blocked || protocol.variableCount)) {
    return { ok: false, error: "En stasjon bruker en ukjent eller ikke støttet protokoll." };
  }

  try {
    const event = await medSerialisertTestdagTransaksjon(async (tx) => {
      const tnGroup = await tx.group.findUnique({ where: { slug: TEAM_NORWAY_SLUG }, select: { id: true } });
      if (!tnGroup) throw new Error("Team Norway-gruppen finnes ikke.");
      if (coach.role !== "ADMIN") {
        const organizer = await tx.groupMember.findFirst({
          where: { groupId: tnGroup.id, userId: coach.id, role: "COACH", ...aktivtMedlemskapWhere() },
          select: { id: true },
        });
        if (!organizer) throw new Error("Du er ikke aktiv trener i Team Norway-gruppen.");
      }

      const groupIds = [...new Set(data.stations.map((station) => station.groupId))];
      const groups = await tx.group.findMany({
        where: { id: { in: groupIds }, arkivertAt: null },
        select: { id: true, slug: true, program: true },
      });
      const groupById = new Map(groups.map((group) => [group.id, group]));
      if (groups.length !== groupIds.length) throw new Error("En eller flere valgte grupper er ikke aktive.");
      if (groups.some((group) => group.id !== tnGroup.id && group.program !== "WANG_UNG" && group.program !== "WANG_TOPPIDRETT")) {
        throw new Error("Et fellesarrangement kan bare bruke Team Norway- og WANG-grupper.");
      }
      if (!groupById.has(tnGroup.id) || !groups.some((group) => group.program === "WANG_UNG" || group.program === "WANG_TOPPIDRETT")) {
        throw new Error("Et fellesarrangement må ha minst én Team Norway-stasjon og én WANG-skole.");
      }

      const attendeesByGroup = new Map<string, string[]>();
      for (const station of data.stations) {
        const attendees = [...new Set(station.spillerIder)];
        attendeesByGroup.set(station.groupId, [
          ...(attendeesByGroup.get(station.groupId) ?? []),
          ...attendees,
        ]);
      }
      for (const [groupId, ids] of attendeesByGroup) {
        const expected = new Set(ids);
        const members = await tx.groupMember.findMany({
          where: { groupId, userId: { in: [...expected] }, ...aktivtSpillerMedlemskapWhere() },
          select: { userId: true },
        });
        const activeIds = new Set(members.map((member) => member.userId));
        if ([...expected].some((id) => !activeIds.has(id))) {
          throw new Error("En eller flere valgte spillere er ikke aktive i stasjonsgruppen.");
        }
      }

      const created = await tx.testDayEvent.create({
        data: {
          organizerGroupId: tnGroup.id,
          organizerId: coach.id,
          title: data.title,
          location: data.location || null,
          scheduledAt,
          status: "ACTIVE",
        },
        select: { id: true },
      });
      const stationIds: string[] = [];
      for (const [index, station] of data.stations.entries()) {
        const protocol = stationProtocols[index]!;
        const definitionId = tnDefinitionId(protocol);
        await tx.testDefinition.upsert({
          where: { id: definitionId },
          update: {},
          create: tnDefinitionData(protocol),
        });
        const row = await tx.testDay.create({
          data: {
            eventId: created.id,
            groupId: station.groupId,
            coachId: coach.id,
            testDefinitionId: definitionId,
            stationName: station.stationName,
            title: data.title,
            location: data.location || null,
            scheduledAt,
            status: "ACTIVE",
            participants: { create: [...new Set(station.spillerIder)].map((playerId, order) => ({ playerId, order })) },
          },
          select: { id: true },
        });
        stationIds.push(row.id);
      }
      return { id: created.id, stationIds };
    });
    revalidatePath("/team-norway/fellestesting");
    revalidatePath("/team-wang/coach/tester");
    return { ok: true, eventId: event.id, stationIds: event.stationIds };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const safe = /^(Team Norway-gruppen finnes ikke|Du er ikke aktiv trener|En eller flere valgte grupper|Et fellesarrangement kan bare|Et fellesarrangement må ha|En eller flere valgte spillere)/.test(message);
    return { ok: false, error: safe ? message : "Kunne ikke opprette felles testdag. Prøv igjen." };
  }
}

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
        include: { testDay: { include: { group: true, event: { include: { organizer: true } } } } },
      });
      const eventOrganizer = deltaker?.testDay.event?.organizer;
      const erTNTestdag = deltaker?.testDay.group.slug === TEAM_NORWAY_SLUG;
      const erTNFellesstasjon = eventOrganizer?.slug === TEAM_NORWAY_SLUG;
      if (!deltaker || (!erTNTestdag && !erTNFellesstasjon)) throw new Error("Fant ikke deltakeren.");
      if (deltaker.testDay.status !== "ACTIVE") throw new Error("Testdagen er ikke aktiv og kan ikke endres.");
      if (coach.role !== "ADMIN") {
        const medlem = await tx.groupMember.findFirst({ where: { groupId: erTNFellesstasjon ? deltaker.testDay.event!.organizerGroupId : deltaker.testDay.groupId, userId: coach.id, role: "COACH", ...aktivtMedlemskapWhere() }, select: { id: true } });
        if (!medlem) throw new Error("Du er ikke aktiv trener i Team Norway-gruppen.");
      }
      const spillerAktiv = await tx.groupMember.findFirst({ where: { groupId: deltaker.testDay.groupId, userId: deltaker.playerId, ...aktivtSpillerMedlemskapWhere() }, select: { id: true } });
      if (!spillerAktiv) throw new Error("Spilleren er ikke lenger aktiv i stasjonsgruppen.");
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
      const dag = await tx.testDay.findUnique({ where: { id: testDayId }, include: { group: true, event: { include: { organizer: true, stations: { select: { id: true, status: true, participants: { select: { status: true } } } } } }, participants: { select: { status: true, playerId: true } } } });
      const erTNTestdag = dag?.group.slug === TEAM_NORWAY_SLUG;
      const erTNFellesstasjon = dag?.event?.organizer.slug === TEAM_NORWAY_SLUG;
      if (!dag || (!erTNTestdag && !erTNFellesstasjon)) throw new Error("Fant ikke testdagen.");
      if (coach.role !== "ADMIN") {
        const medlem = await tx.groupMember.findFirst({ where: { groupId: erTNFellesstasjon ? dag.event!.organizerGroupId : dag.groupId, userId: coach.id, role: "COACH", ...aktivtMedlemskapWhere() }, select: { id: true } });
        if (!medlem) throw new Error("Du er ikke aktiv trener i Team Norway-gruppen.");
      }
      if (dag.participants.some((d) => d.status === "PENDING")) throw new Error("Alle deltakere må være ført, hoppet over eller merket ikke møtt før avslutning.");
      const aktiveSpillere = await tx.groupMember.findMany({ where: { groupId: dag.groupId, userId: { in: dag.participants.map((p) => p.playerId) }, ...aktivtSpillerMedlemskapWhere() }, select: { userId: true } });
      if (aktiveSpillere.length !== dag.participants.length) throw new Error("Alle spillerne må fortsatt være aktive i stasjonsgruppen.");
      const oppdatert = await tx.testDay.updateMany({ where: { id: testDayId, status: "ACTIVE" }, data: { status: "COMPLETED" } });
      if (oppdatert.count !== 1) throw new Error("Testdagen ble endret samtidig. Last siden på nytt.");
      if (dag.event) {
        const gjenstaende = dag.event.stations.some((stasjon) => stasjon.id !== dag.id && stasjon.status === "ACTIVE");
        if (!gjenstaende) {
          await tx.testDayEvent.updateMany({ where: { id: dag.event.id, status: "ACTIVE" }, data: { status: "COMPLETED" } });
        }
      }
    });
    revalidatePath("/team-norway/fellestesting");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const trygg = /^(Fant ikke|Du er ikke|Alle deltakere|Alle spillerne|Spilleren er ikke|Testdagen ble)/.test(message);
    return { ok: false, error: trygg ? message : "Kunne ikke avslutte testdagen. Prøv igjen." };
  }
}
