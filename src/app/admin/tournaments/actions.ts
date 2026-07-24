"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";


export type TournamentInput = {
  name: string;
  startDate: string;
  endDate?: string | null;
  courseId?: string | null;
  format: string;
  notes?: string | null;
};

export async function createTournament(input: TournamentInput) {
  const user = await requireCoachActionUser();
  const ny = await prisma.tournament.create({
    data: {
      name: input.name.trim(),
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      courseId: input.courseId || null,
      format: input.format,
      notes: input.notes?.trim() || null,
    },
  });
  await audit({
    actorId: user.id,
    action: "tournament.created",
    target: `Tournament:${ny.id}`,
    metadata: { name: ny.name },
  });
  revalidatePath("/admin/tournaments");
  return ny.id;
}

export async function updateTournament(id: string, input: TournamentInput) {
  const user = await requireCoachActionUser();
  await prisma.tournament.update({
    where: { id },
    data: {
      name: input.name.trim(),
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      courseId: input.courseId || null,
      format: input.format,
      notes: input.notes?.trim() || null,
    },
  });
  await audit({
    actorId: user.id,
    action: "tournament.updated",
    target: `Tournament:${id}`,
  });
  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${id}`);
}

export async function deleteTournament(id: string) {
  const user = await requireCoachActionUser();
  await prisma.tournament.delete({ where: { id } });
  await audit({
    actorId: user.id,
    action: "tournament.deleted",
    target: `Tournament:${id}`,
  });
  revalidatePath("/admin/tournaments");
  redirect("/admin/tournaments");
}

export type ResultInput = {
  userId: string;
  position?: number | null;
  score?: number | null;
  notes?: string | null;
};

export async function addResult(tournamentId: string, input: ResultInput) {
  const user = await requireCoachActionUser();
  await prisma.tournamentResult.upsert({
    where: {
      tournamentId_userId: { tournamentId, userId: input.userId },
    },
    create: {
      tournamentId,
      userId: input.userId,
      position: input.position ?? null,
      score: input.score ?? null,
      notes: input.notes?.trim() || null,
    },
    update: {
      position: input.position ?? null,
      score: input.score ?? null,
      notes: input.notes?.trim() || null,
    },
  });
  await audit({
    actorId: user.id,
    action: "tournament_result.saved",
    target: `Tournament:${tournamentId}`,
    metadata: { userId: input.userId },
  });
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

export async function deleteResult(tournamentId: string, resultId: string) {
  const user = await requireCoachActionUser();
  await prisma.tournamentResult.delete({ where: { id: resultId } });
  await audit({
    actorId: user.id,
    action: "tournament_result.deleted",
    target: `TournamentResult:${resultId}`,
  });
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

// ============================================================
// Påmeldinger (TournamentEntry) — turneringsplanlegger
// ============================================================

const TILLATT_PRIORITET = ["MAJOR", "NORMAL", "LOCAL"] as const;
type Prioritet = (typeof TILLATT_PRIORITET)[number];

function valgPrioritet(p: string | undefined | null): Prioritet {
  return TILLATT_PRIORITET.includes(p as Prioritet) ? (p as Prioritet) : "NORMAL";
}

export type PaameldingInput = {
  userId: string;
  priority?: string;
};

export async function meldPaSpillere(
  tournamentId: string,
  players: PaameldingInput[],
) {
  const coach = await requireCoachActionUser();
  const turnering = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, startDate: true, name: true },
  });
  if (!turnering) throw new Error("not_found");

  const aaret = turnering.startDate.getFullYear();
  let opprettet = 0;
  let oppdatert = 0;

  for (const p of players) {
    if (!p.userId) continue;
    const priority = valgPrioritet(p.priority);

    // Finn evt. SeasonPlan for året
    const plan = await prisma.seasonPlan.findUnique({
      where: { userId_year: { userId: p.userId, year: aaret } },
      select: { id: true },
    });

    const eksisterende = await prisma.tournamentEntry.findFirst({
      where: { tournamentId, userId: p.userId },
      select: { id: true },
    });

    if (eksisterende) {
      await prisma.tournamentEntry.update({
        where: { id: eksisterende.id },
        data: {
          priority,
          seasonPlanId: plan?.id ?? null,
        },
      });
      oppdatert++;
    } else {
      await prisma.tournamentEntry.create({
        data: {
          tournamentId,
          userId: p.userId,
          priority,
          seasonPlanId: plan?.id ?? null,
        },
      });
      opprettet++;
    }
  }

  await audit({
    actorId: coach.id,
    action: "tournament_entries.bulk_upsert",
    target: `Tournament:${tournamentId}`,
    metadata: { opprettet, oppdatert, count: players.length },
  });

  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath("/admin/agencyos");
  return { opprettet, oppdatert };
}

export async function fjernPamelding(entryId: string) {
  const coach = await requireCoachActionUser();
  const entry = await prisma.tournamentEntry.findUnique({
    where: { id: entryId },
    select: { tournamentId: true },
  });
  await prisma.tournamentEntry.delete({ where: { id: entryId } });
  await audit({
    actorId: coach.id,
    action: "tournament_entry.deleted",
    target: `TournamentEntry:${entryId}`,
  });
  if (entry?.tournamentId) {
    revalidatePath(`/admin/tournaments/${entry.tournamentId}`);
  }
  revalidatePath("/admin/tournaments");
  revalidatePath("/admin/agencyos");
}

export async function oppdaterPrioritet(entryId: string, priority: string) {
  const coach = await requireCoachActionUser();
  const valgt = valgPrioritet(priority);
  const entry = await prisma.tournamentEntry.update({
    where: { id: entryId },
    data: { priority: valgt },
    select: { tournamentId: true },
  });
  await audit({
    actorId: coach.id,
    action: "tournament_entry.priority_updated",
    target: `TournamentEntry:${entryId}`,
    metadata: { priority: valgt },
  });
  if (entry.tournamentId) {
    revalidatePath(`/admin/tournaments/${entry.tournamentId}`);
  }
  revalidatePath("/admin/tournaments");
}

// ------------------------------------------------------------------
// Eksport-action for AgencyOS turneringer
// ------------------------------------------------------------------

const tExportFormatSchema = z.enum(["pdf", "csv"]);
const tExportTypeSchema = z.enum([
  "startliste",
  "resultater",
  "pamelding",
  "historikk",
]);
const tExportPeriodSchema = z.enum([
  "kommende",
  "pagaende",
  "avsluttet",
  "custom",
]);
const tExportSortSchema = z.enum(["dato", "type", "resultat"]);

const exportTournamentsInputSchema = z.object({
  format: tExportFormatSchema,
  type: tExportTypeSchema,
  period: tExportPeriodSchema,
  from: z.string().optional(),
  to: z.string().optional(),
  sortBy: tExportSortSchema,
  tournamentIds: z.array(z.string()).default([]),
});

export type ExportTournamentsInput = z.infer<
  typeof exportTournamentsInputSchema
>;

export type ExportTournamentsResult =
  | { success: true; downloadUrl: string; filename: string }
  | { success: false; error: string };

function slugifyDateTs(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Merge dubletter (Stats Fase 1)
// ---------------------------------------------------------------------------

const MergeSchema = z.object({
  sourceId: z.string().min(1, "Kilde-turnering kreves"),
  targetId: z.string().min(1, "Mål-turnering kreves"),
});

/**
 * Merge to turneringer — typisk en MANUAL-innlegg som matcher en DATAGOLF/NGF-turnering.
 *
 * Kanonisk turnering blir `targetId`. Dubletten `sourceId` markeres med
 * `mergedIntoId = targetId` slik at den ikke forsvinner fra historikken,
 * men ikke vises som egen rad. Alle PublicPlayerEntry, TournamentResult og
 * TournamentEntry som peker mot sourceId flyttes til targetId.
 */
export async function mergeTurneringer(input: {
  sourceId: string;
  targetId: string;
}): Promise<{ ok: true; flyttet: { entries: number; results: number; participants: number } } | { ok: false; feil: string }> {
  const parsed = MergeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }
  const user = await requireCoachActionUser();

  if (input.sourceId === input.targetId) {
    return { ok: false, feil: "Kilde og mål kan ikke være samme turnering" };
  }

  // Verifiser at begge eksisterer
  const [source, target] = await Promise.all([
    prisma.tournament.findUnique({
      where: { id: input.sourceId },
      select: { id: true, name: true, mergedIntoId: true },
    }),
    prisma.tournament.findUnique({
      where: { id: input.targetId },
      select: { id: true, name: true, mergedIntoId: true },
    }),
  ]);

  if (!source) return { ok: false, feil: "Kilde-turnering ikke funnet" };
  if (!target) return { ok: false, feil: "Mål-turnering ikke funnet" };
  if (source.mergedIntoId) {
    return { ok: false, feil: "Kilde er allerede merget inn i en annen turnering" };
  }
  if (target.mergedIntoId) {
    return { ok: false, feil: "Mål er en dublett — velg den kanoniske turneringen" };
  }

  // Flytt alle relaterte rader fra source → target i én transaksjon
  const result = await prisma.$transaction(async (tx) => {
    const entries = await tx.tournamentEntry.updateMany({
      where: { tournamentId: input.sourceId },
      data: { tournamentId: input.targetId },
    });
    const results = await tx.tournamentResult.updateMany({
      where: { tournamentId: input.sourceId },
      data: { tournamentId: input.targetId },
    });
    const participants = await tx.publicPlayerEntry.updateMany({
      where: { tournamentId: input.sourceId },
      data: { tournamentId: input.targetId },
    });

    // Marker source som merget
    await tx.tournament.update({
      where: { id: input.sourceId },
      data: { mergedIntoId: input.targetId },
    });

    return {
      entries: entries.count,
      results: results.count,
      participants: participants.count,
    };
  });

  await audit({
    actorId: user.id,
    action: "tournament.merged",
    target: `Tournament:${input.sourceId}`,
    metadata: {
      sourceId: input.sourceId,
      sourceName: source.name,
      targetId: input.targetId,
      targetName: target.name,
      flyttet: result,
    },
  });

  revalidatePath("/admin/tournaments");
  revalidatePath("/admin/tournaments/dubletter");
  revalidatePath("/turneringer");
  revalidatePath("/portal/tren/turneringer");

  return { ok: true, flyttet: result };
}

/**
 * Reverser en merge — sette mergedIntoId tilbake til null. Brukes hvis coach
 * angrer. Flytter IKKE entries/results tilbake (det er irreversibelt uten extra logikk).
 */
export async function unmergeTurnering(sourceId: string): Promise<
  { ok: true } | { ok: false; feil: string }
> {
  const user = await requireCoachActionUser();
  const t = await prisma.tournament.findUnique({
    where: { id: sourceId },
    select: { id: true, mergedIntoId: true, name: true },
  });
  if (!t) return { ok: false, feil: "Turnering ikke funnet" };
  if (!t.mergedIntoId) return { ok: false, feil: "Turneringen er ikke merget" };

  await prisma.tournament.update({
    where: { id: sourceId },
    data: { mergedIntoId: null },
  });

  await audit({
    actorId: user.id,
    action: "tournament.unmerged",
    target: `Tournament:${sourceId}`,
    metadata: { name: t.name, hadMergedInto: t.mergedIntoId },
  });

  revalidatePath("/admin/tournaments");
  revalidatePath("/admin/tournaments/dubletter");
  return { ok: true };
}

export async function exportTournamentsReport(
  raw: ExportTournamentsInput,
): Promise<ExportTournamentsResult> {
  const parsed = exportTournamentsInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Ugyldig input til eksport" };
  }
  const input = parsed.data;

  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Ikke innlogget" };
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return { success: false, error: "Krever coach- eller admin-tilgang" };
  }

  const filename = `turneringer-${input.type}-${slugifyDateTs(new Date())}.${input.format}`;
  // Placeholder URL; faktisk PDF/CSV-generering kobles til lib/pdf/* senere.
  const downloadUrl = `/api/exports/tournaments/${encodeURIComponent(filename)}`;

  await audit({
    actorId: user.id,
    action: "tournaments.export",
    target: `User:${user.id}`,
    metadata: {
      format: input.format,
      type: input.type,
      period: input.period,
      sortBy: input.sortBy,
      tournamentIds: input.tournamentIds,
    },
  });

  return { success: true, downloadUrl, filename };
}

/** Fellesmelding til alle spillere i coachens grupper (GroupMember-fan-out). */
export async function sendTournamentFellesmelding(input: {
  subject: string;
  body: string;
  link?: string;
}): Promise<{ ok: boolean; count?: number; error?: string }> {
  const { notifyTournamentToCoachGroups } = await import(
    "@/lib/workbench/notify-tournament-group"
  );
  const result = await notifyTournamentToCoachGroups(input);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, count: result.count };
}

// ============================================================
// Fellesmelding (D1) — ÉN melding til valgte turneringsdeltakere.
// Gjenbruker meldings-infrastrukturen: CoachingSession(kind DIRECT) +
// Notification — samme modell som /portal/coach/melding-trådene og
// coach→spiller-utsendingen i plan-action-executor. Ingen ny datamodell.
// Til forskjell fra sendTournamentFellesmelding (gruppe-fan-out via
// Notification alene) lander DENNE som en ekte melding i hver valgte
// spillers PlayerHQ-innboks, kun til faktiske deltakere i turneringen.
// ============================================================

const FellesmeldingSchema = z.object({
  turneringId: z.string().min(1, "Turnering mangler"),
  spillerIds: z.array(z.string().min(1)).min(1, "Velg minst én mottaker"),
  tekst: z.string().trim().min(1, "Skriv en melding").max(4000),
});

export type FellesmeldingInput = z.infer<typeof FellesmeldingSchema>;

export type FellesmeldingResultat = {
  ok: boolean;
  sendt: number;
  feilet: { userId: string; navn: string }[];
  error?: string;
};

/**
 * Lever ÉN melding fra coach til én spiller ved å opprette/oppdatere den
 * delte DIRECT-tråden (samme mønster som legacy sendMessage og
 * plan-action-executor) og varsle. Kaster ved DB-feil slik at fan-out-løkka
 * kan telle per-mottaker-feil.
 */
async function leverCoachMelding(
  coachId: string,
  playerId: string,
  tekst: string,
  turneringNavn: string,
): Promise<void> {
  const nyMelding: Prisma.InputJsonValue = {
    role: "coach",
    content: tekst,
    ts: new Date().toISOString(),
  };
  const eksisterende = await prisma.coachingSession.findFirst({
    where: { userId: playerId, coachId, kind: "DIRECT" },
    orderBy: { updatedAt: "desc" },
    select: { id: true, messages: true },
  });
  let traadId: string;
  if (eksisterende) {
    const forrige = Array.isArray(eksisterende.messages)
      ? (eksisterende.messages as Prisma.InputJsonValue[])
      : [];
    await prisma.coachingSession.update({
      where: { id: eksisterende.id },
      data: { messages: [...forrige, nyMelding] },
    });
    traadId = eksisterende.id;
  } else {
    const opprettet = await prisma.coachingSession.create({
      data: {
        userId: playerId,
        coachId,
        kind: "DIRECT",
        messages: [nyMelding] as Prisma.InputJsonValue[],
      },
      select: { id: true },
    });
    traadId = opprettet.id;
  }
  await notify({
    userId: playerId,
    type: "melding",
    title: `Melding om ${turneringNavn}`,
    body: tekst.slice(0, 280),
    link: `/portal/coach/melding/${traadId}`,
  });
}

/**
 * Send én fellesmelding til valgte deltakere i en turnering. Fan-out per
 * mottaker med per-spiller feiltelling (delvis feil er ærlig — «2 av 12
 * feilet»). Sender kun til userId-er som faktisk er påmeldt turneringen.
 */
export async function sendFellesmelding(
  input: FellesmeldingInput,
): Promise<FellesmeldingResultat> {
  const parsed = FellesmeldingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      sendt: 0,
      feilet: [],
      error: parsed.error.issues[0]?.message ?? "Ugyldig input",
    };
  }
  const coach = await requireCoachActionUser();
  const { turneringId, spillerIds, tekst } = parsed.data;

  const turnering = await prisma.tournament.findUnique({
    where: { id: turneringId },
    select: { id: true, name: true },
  });
  if (!turnering) {
    return { ok: false, sendt: 0, feilet: [], error: "Turnering ikke funnet" };
  }

  // Sikkerhet: send kun til faktiske deltakere i denne turneringen (ignorer
  // id-er som ikke er påmeldt). Dedupliser på userId.
  const entries = await prisma.tournamentEntry.findMany({
    where: { tournamentId: turneringId, userId: { in: spillerIds } },
    select: { userId: true, user: { select: { name: true } } },
  });
  const mottakere = Array.from(
    new Map(entries.map((e) => [e.userId, e.user.name ?? "(uten navn)"])).entries(),
  );
  if (mottakere.length === 0) {
    return {
      ok: false,
      sendt: 0,
      feilet: [],
      error: "Ingen gyldige mottakere blant deltakerne",
    };
  }

  const melding = tekst.trim();
  let sendt = 0;
  const feilet: { userId: string; navn: string }[] = [];
  for (const [playerId, navn] of mottakere) {
    try {
      await leverCoachMelding(coach.id, playerId, melding, turnering.name);
      sendt++;
    } catch (err) {
      console.error("[fellesmelding] kunne ikke levere til", playerId, err);
      feilet.push({ userId: playerId, navn });
    }
  }

  await audit({
    actorId: coach.id,
    action: "tournament_fellesmelding.sent",
    target: `Tournament:${turneringId}`,
    metadata: { sendt, feilet: feilet.length, forespurt: spillerIds.length },
  });

  revalidatePath(`/admin/tournaments/${turneringId}`);
  return { ok: feilet.length === 0, sendt, feilet };
}
