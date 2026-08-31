"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { isoDate, optStr } from "@/lib/validation/schemas";

const TurnPrioritySchema = z.enum(["MAJOR", "NORMAL", "LOCAL"], {
  error: "Ugyldig prioritet",
});

const PlanTierSchema = z.enum(["A", "B", "C"]);

const LeggTilTurneringSchema = z.object({
  seasonPlanId: z.string().min(1).optional(),
  tournamentId: z.string().min(1).optional(),
  manualName: optStr(300),
  manualDate: isoDate.optional(),
  manualEndDate: isoDate.optional(),
  category: optStr(200),
  priority: TurnPrioritySchema,
  planTier: PlanTierSchema.optional(),
  notes: optStr(1000),
});

const EntryIdSchema = z.string().min(1, "Påmeldings-ID er påkrevd");
const TournamentIdSchema = z.string().min(1, "Turnerings-ID er påkrevd");

export type TurnPriority = "MAJOR" | "NORMAL" | "LOCAL";
export type PlanTier = "A" | "B" | "C";

function revalTurneringer(tournamentId?: string) {
  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/portal/tren/aarsplan");
  revalidatePath("/portal");
  revalidatePath("/portal/kalender");
  if (tournamentId) revalidatePath(`/portal/tren/turneringer/${tournamentId}`);
}

export async function leggTilTurnering(input: {
  seasonPlanId?: string;
  tournamentId?: string;
  manualName?: string;
  manualDate?: string;
  manualEndDate?: string;
  category?: string;
  priority: TurnPriority;
  planTier?: PlanTier;
  notes?: string;
}): Promise<{ ok: true; id: string } | { ok: false; feil: string }> {
  const zodResult = LeggTilTurneringSchema.safeParse(input);
  if (!zodResult.success) {
    return { ok: false, feil: zodResult.error.issues[0]?.message ?? "Ugyldig input" };
  }
  const user = await requirePortalUser();

  if (!input.tournamentId && !input.manualName) {
    return { ok: false, feil: "Velg turnering eller oppgi navn" };
  }

  // Verify seasonPlan ownership if provided
  if (input.seasonPlanId) {
    const plan = await prisma.seasonPlan.findFirst({
      where: { id: input.seasonPlanId, userId: user.id },
      select: { id: true },
    });
    if (!plan) return { ok: false, feil: "Sesongplan ikke funnet" };
  }

  if (input.tournamentId) {
    const eksisterende = await prisma.tournamentEntry.findFirst({
      where: { userId: user.id, tournamentId: input.tournamentId },
      select: { id: true },
    });
    if (eksisterende) return { ok: true, id: eksisterende.id };
  }

  const entry = await prisma.tournamentEntry.create({
    data: {
      userId: user.id,
      seasonPlanId: input.seasonPlanId ?? null,
      tournamentId: input.tournamentId ?? null,
      manualName: input.manualName ?? null,
      manualDate: input.manualDate ? new Date(input.manualDate) : null,
      manualEndDate: input.manualEndDate ? new Date(input.manualEndDate) : null,
      category: input.category ?? null,
      priority: input.priority,
      planTier: input.planTier ?? "B",
      notes: input.notes ?? null,
    },
    select: { id: true },
  });

  revalTurneringer(input.tournamentId);
  return { ok: true, id: entry.id };
}

export async function oppdaterTournamentEntry(
  id: string,
  data: {
    category?: string;
    priority?: TurnPriority;
    notes?: string;
    seasonPlanId?: string | null;
  }
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  const entry = await prisma.tournamentEntry.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!entry) return { ok: false, feil: "Ikke funnet" };

  await prisma.tournamentEntry.update({
    where: { id },
    data: {
      category: data.category,
      priority: data.priority,
      notes: data.notes,
      seasonPlanId: data.seasonPlanId,
    },
  });

  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true };
}

/**
 * Meld meg på en turnering fra katalogen. Oppretter TournamentEntry for
 * innlogget bruker. Kobler automatisk til årets SeasonPlan hvis den finnes.
 */
export async function meldDegPa(
  tournamentId: string,
): Promise<{ ok: true; id: string } | { ok: false; feil: string }> {
  const zodResult = TournamentIdSchema.safeParse(tournamentId);
  if (!zodResult.success) {
    return { ok: false, feil: zodResult.error.issues[0]?.message ?? "Ugyldig turnerings-ID" };
  }
  const user = await requirePortalUser();

  const turnering = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, startDate: true },
  });
  if (!turnering) return { ok: false, feil: "Turnering ikke funnet" };

  const eksisterende = await prisma.tournamentEntry.findFirst({
    where: { userId: user.id, tournamentId },
    select: { id: true },
  });
  if (eksisterende) return { ok: false, feil: "Allerede påmeldt" };

  // Finn årets sesongplan basert på turneringens startdato
  const year = turnering.startDate.getFullYear();
  const sesongplan = await prisma.seasonPlan.findFirst({
    where: { userId: user.id, year },
    select: { id: true },
  });

  const entry = await prisma.tournamentEntry.create({
    data: {
      userId: user.id,
      tournamentId,
      seasonPlanId: sesongplan?.id ?? null,
      priority: "NORMAL",
      planTier: "B",
      entryStatus: "PLANNED",
    },
    select: { id: true },
  });

  revalTurneringer(tournamentId);
  return { ok: true, id: entry.id };
}

/**
 * Sett plan A/B/C på en entry spilleren eier.
 */
export async function settPlanTier(
  entryId: string,
  planTier: PlanTier,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const parsed = PlanTierSchema.safeParse(planTier);
  if (!parsed.success) return { ok: false, feil: "Ugyldig plan-nivå" };
  const user = await requirePortalUser();
  const entry = await prisma.tournamentEntry.findFirst({
    where: { id: entryId, userId: user.id },
    select: { id: true, tournamentId: true },
  });
  if (!entry) return { ok: false, feil: "Ikke funnet" };
  await prisma.tournamentEntry.update({
    where: { id: entryId },
    data: { planTier: parsed.data },
  });
  revalTurneringer(entry.tournamentId ?? undefined);
  return { ok: true };
}

/**
 * Steg 1 i dobbel bekreftelse: spilleren hevder å ha meldt seg på hos arrangør.
 * Setter CLAIMED_REGISTERED — IKKE endelig bekreftet.
 */
export async function claimPaamelding(
  tournamentId: string,
): Promise<{ ok: true; id: string } | { ok: false; feil: string }> {
  const zodResult = TournamentIdSchema.safeParse(tournamentId);
  if (!zodResult.success) {
    return { ok: false, feil: "Ugyldig turnerings-ID" };
  }
  const user = await requirePortalUser();

  let entry = await prisma.tournamentEntry.findFirst({
    where: { userId: user.id, tournamentId },
    select: { id: true, entryStatus: true },
  });

  if (!entry) {
    const created = await meldDegPa(tournamentId);
    if (!created.ok) return created;
    entry = { id: created.id, entryStatus: "PLANNED" };
  }

  if (entry.entryStatus === "CONFIRMED") {
    return { ok: true, id: entry.id };
  }

  await prisma.tournamentEntry.update({
    where: { id: entry.id },
    data: {
      entryStatus: "CLAIMED_REGISTERED",
      playerClaimedRegisteredAt: new Date(),
    },
  });

  await audit({
    actorId: user.id,
    action: "TOURNAMENT_REGISTRATION_CLAIMED",
    target: `tournament:${tournamentId}`,
    metadata: { entryId: entry.id },
  });

  revalTurneringer(tournamentId);
  return { ok: true, id: entry.id };
}

/**
 * Steg 2 i dobbel bekreftelse: spilleren bekrefter eksplisitt at de er påmeldt.
 * Appen verifiserer IKKE hos arrangør — ansvaret er spillerens.
 */
export async function confirmPaamelding(
  tournamentId: string,
): Promise<{ ok: true; id: string } | { ok: false; feil: string }> {
  const zodResult = TournamentIdSchema.safeParse(tournamentId);
  if (!zodResult.success) {
    return { ok: false, feil: "Ugyldig turnerings-ID" };
  }
  const user = await requirePortalUser();

  const entry = await prisma.tournamentEntry.findFirst({
    where: { userId: user.id, tournamentId },
    select: { id: true, entryStatus: true, playerClaimedRegisteredAt: true },
  });
  if (!entry) {
    return { ok: false, feil: "Legg turneringen i plan først" };
  }
  if (entry.entryStatus === "CONFIRMED") {
    return { ok: true, id: entry.id };
  }
  // Krev at steg 1 er tatt (claim) — ellers tving claim først
  if (
    entry.entryStatus !== "CLAIMED_REGISTERED" &&
    !entry.playerClaimedRegisteredAt
  ) {
    return {
      ok: false,
      feil: "Trykk først «Jeg har meldt meg på», deretter bekreft.",
    };
  }

  await prisma.tournamentEntry.update({
    where: { id: entry.id },
    data: {
      entryStatus: "CONFIRMED",
      playerConfirmedRegisteredAt: new Date(),
      playerClaimedRegisteredAt: entry.playerClaimedRegisteredAt ?? new Date(),
    },
  });

  await audit({
    actorId: user.id,
    action: "TOURNAMENT_REGISTRATION_CONFIRMED_BY_PLAYER",
    target: `tournament:${tournamentId}`,
    metadata: {
      entryId: entry.id,
      disclaimer:
        "Spiller bekreftet selv. App verifiserer ikke påmelding hos arrangør.",
    },
  });

  revalTurneringer(tournamentId);
  return { ok: true, id: entry.id };
}

/**
 * Meld deg av — sletter TournamentEntry for innlogget bruker.
 */
export async function meldDegAv(
  entryId: string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  return slettTournamentEntry(entryId);
}

/**
 * Koble en eksisterende TournamentEntry til en SeasonPlan.
 */
export async function koblTilArsplan(
  tournamentEntryId: string,
  seasonPlanId: string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  const entry = await prisma.tournamentEntry.findFirst({
    where: { id: tournamentEntryId, userId: user.id },
    select: { id: true },
  });
  if (!entry) return { ok: false, feil: "Påmelding ikke funnet" };

  const plan = await prisma.seasonPlan.findFirst({
    where: { id: seasonPlanId, userId: user.id },
    select: { id: true },
  });
  if (!plan) return { ok: false, feil: "Sesongplan ikke funnet" };

  await prisma.tournamentEntry.update({
    where: { id: tournamentEntryId },
    data: { seasonPlanId },
  });

  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true };
}

/**
 * Bulk-koble alle TournamentEntry for et gitt år til en SeasonPlan.
 * Plukker entries der dato (tournament.startDate eller manualDate) er i året.
 */
export async function bulkKoblTurneringerTilArsplan(
  seasonPlanId: string,
  year: number,
): Promise<{ ok: true; antall: number } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  const plan = await prisma.seasonPlan.findFirst({
    where: { id: seasonPlanId, userId: user.id },
    select: { id: true },
  });
  if (!plan) return { ok: false, feil: "Sesongplan ikke funnet" };

  const fra = new Date(year, 0, 1);
  const til = new Date(year, 11, 31, 23, 59, 59);

  const entries = await prisma.tournamentEntry.findMany({
    where: {
      userId: user.id,
      seasonPlanId: null,
      OR: [
        { tournament: { startDate: { gte: fra, lte: til } } },
        { manualDate: { gte: fra, lte: til } },
      ],
    },
    select: { id: true },
  });

  if (entries.length === 0) {
    return { ok: true, antall: 0 };
  }

  await prisma.tournamentEntry.updateMany({
    where: { id: { in: entries.map((e) => e.id) } },
    data: { seasonPlanId },
  });

  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true, antall: entries.length };
}

// ---------------------------------------------------------------------------
// Manuell turnering — opprett ny Tournament i felles katalog (Stats Fase 1)
// ---------------------------------------------------------------------------

const TurFormat = z.enum(["STROKE", "MATCH", "STABLEFORD", "OTHER"], {
  error: "Ugyldig format",
});

const TurTour = z.enum(
  ["junior-no", "amateur-no", "lokal", "klubb"],
  { error: "Velg en kategori for turneringen" },
);

const OpprettManuellTurneringSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn").max(200),
  location: z.string().min(2, "Sted/klubb må fylles inn").max(200),
  country: z.string().length(2, "Bruk ISO 2-bokstav landskode (f.eks. NO)").default("NO"),
  startDate: isoDate,
  endDate: isoDate.optional(),
  format: TurFormat.default("STROKE"),
  tour: TurTour,
  notes: optStr(1000),
});

/**
 * Opprett en helt ny Tournament i den globale katalogen — manuell innlegg
 * fra en innlogget spiller. Brukes når en lokal/junior-turnering ikke finnes
 * i DataGolf/NGF-syncen.
 *
 * Anti-spam: maks 10 manuelle turneringer per bruker per kalendermåned.
 * Coach kan senere merge mot kanonisk turnering via /admin/tournaments/dubletter.
 */
export async function opprettManuellTurnering(input: {
  name: string;
  location: string;
  country?: string;
  startDate: string;
  endDate?: string;
  format?: "STROKE" | "MATCH" | "STABLEFORD" | "OTHER";
  tour: "junior-no" | "amateur-no" | "lokal" | "klubb";
  notes?: string;
}): Promise<
  | { ok: true; id: string; slug: string | null }
  | { ok: false; feil: string }
> {
  const parsed = OpprettManuellTurneringSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, feil: parsed.error.issues[0]?.message ?? "Ugyldig input" };
  }
  const user = await requirePortalUser();
  const data = parsed.data;

  // Anti-spam: tell brukerens manuelle turneringer denne måneden
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const manualThisMonth = await prisma.tournament.count({
    where: {
      createdByUserId: user.id,
      sourceOrigin: "MANUAL",
      createdAt: { gte: monthStart },
    },
  });
  if (manualThisMonth >= 10) {
    return {
      ok: false,
      feil: "Du har nådd grensen på 10 manuelle turneringer denne måneden.",
    };
  }

  const start = new Date(data.startDate);
  const end = data.endDate ? new Date(data.endDate) : null;

  // Beregn weekStart (mandag i turneringsuken) for "denne uken"-cache
  const weekStart = new Date(start);
  const dayOfWeek = weekStart.getDay(); // 0=søndag, 1=mandag, ..., 6=lørdag
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);
  weekStart.setHours(0, 0, 0, 0);

  // Generer slug — kebab-case av navn + år
  const baseSlug = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const slug = `${baseSlug}-${start.getFullYear()}`;

  // Sjekk om slug er ledig — hvis ikke, slå til random suffix
  const existing = await prisma.tournament.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Math.random().toString(36).slice(2, 6)}` : slug;

  const turnering = await prisma.tournament.create({
    data: {
      name: data.name,
      slug: finalSlug,
      startDate: start,
      endDate: end,
      format: data.format ?? "STROKE",
      notes: data.notes ?? null,
      sourceOrigin: "MANUAL",
      tour: data.tour,
      country: data.country ?? "NO",
      location: data.location,
      status: start > new Date() ? "UPCOMING" : "COMPLETED",
      tier: 5,
      weekStart,
      createdByUserId: user.id,
    },
    select: { id: true, slug: true },
  });

  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/admin/turnering");
  revalidatePath("/turneringer");
  return { ok: true, id: turnering.id, slug: turnering.slug };
}

export async function slettTournamentEntry(
  id: string
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const zodResult = EntryIdSchema.safeParse(id);
  if (!zodResult.success) {
    return { ok: false, feil: zodResult.error.issues[0]?.message ?? "Ugyldig ID" };
  }
  const user = await requirePortalUser();

  const entry = await prisma.tournamentEntry.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!entry) return { ok: false, feil: "Ikke funnet" };

  await prisma.tournamentEntry.delete({ where: { id } });
  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true };
}
