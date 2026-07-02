"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

async function krevBruker() {
  const user = await requireConsentingUser();
  return user;
}

export type UtfordringInput = {
  name: string;
  description?: string | null;
  drillId?: string | null;
  startAt?: string | null;
  endAt?: string | null;
};

function parseDato(verdi?: string | null): Date | null {
  if (!verdi) return null;
  const d = new Date(verdi);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function opprettUtfordring(input: UtfordringInput) {
  const user = await krevBruker();
  const navn = input.name.trim();
  if (!navn) throw new Error("Navn er påkrevd.");

  const ny = await prisma.drillChallenge.create({
    data: {
      ownerId: user.id,
      name: navn,
      description: input.description?.trim() || null,
      drillId: input.drillId || null,
      startAt: parseDato(input.startAt),
      endAt: parseDato(input.endAt),
      status: "ACTIVE",
      // Eier blir automatisk deltaker
      participants: {
        create: { userId: user.id },
      },
    },
  });

  await audit({
    actorId: user.id,
    action: "challenge.created",
    target: `DrillChallenge:${ny.id}`,
    metadata: { name: ny.name, drillId: ny.drillId },
  });

  revalidatePath("/portal/utfordringer");
  redirect(`/portal/utfordringer/${ny.id}`);
}

export async function bliMed(challengeId: string) {
  const user = await krevBruker();
  const utfordring = await prisma.drillChallenge.findUnique({
    where: { id: challengeId },
    select: { id: true, name: true, status: true, ownerId: true },
  });
  if (!utfordring) throw new Error("Utfordring finnes ikke.");
  if (utfordring.status !== "ACTIVE") throw new Error("Utfordringen er avsluttet.");

  await prisma.challengeParticipant.upsert({
    where: { challengeId_userId: { challengeId, userId: user.id } },
    create: { challengeId, userId: user.id },
    update: {},
  });

  await audit({
    actorId: user.id,
    action: "challenge.joined",
    target: `DrillChallenge:${challengeId}`,
  });

  // Varsle eier hvis det ikke er hen selv
  if (utfordring.ownerId !== user.id) {
    await notify({
      userId: utfordring.ownerId,
      type: "achievement",
      title: "Ny deltaker i utfordring",
      body: `${user.name ?? "En spiller"} ble med i «${utfordring.name}».`,
      link: `/portal/utfordringer/${challengeId}`,
    });
  }

  revalidatePath(`/portal/utfordringer/${challengeId}`);
  revalidatePath("/portal/utfordringer");
}

export async function registrerScore(challengeId: string, score: number, notes?: string | null) {
  const user = await krevBruker();
  if (!Number.isFinite(score)) throw new Error("Ugyldig score.");

  const deltaker = await prisma.challengeParticipant.findUnique({
    where: { challengeId_userId: { challengeId, userId: user.id } },
  });
  if (!deltaker) throw new Error("Du er ikke deltaker i denne utfordringen.");

  await prisma.challengeParticipant.update({
    where: { challengeId_userId: { challengeId, userId: user.id } },
    data: {
      score,
      notes: notes?.trim() || null,
    },
  });

  // Beregn rangering på nytt (høyere score = bedre)
  await reberegnRanger(challengeId);

  await audit({
    actorId: user.id,
    action: "challenge.score_registered",
    target: `DrillChallenge:${challengeId}`,
    metadata: { score },
  });

  revalidatePath(`/portal/utfordringer/${challengeId}`);
}

async function reberegnRanger(challengeId: string) {
  const deltakere = await prisma.challengeParticipant.findMany({
    where: { challengeId, score: { not: null } },
    orderBy: { score: "desc" },
    select: { id: true, score: true },
  });

  let forrigeScore: number | null = null;
  let forrigeRank = 0;
  for (let i = 0; i < deltakere.length; i++) {
    const d = deltakere[i];
    const rank = d.score === forrigeScore ? forrigeRank : i + 1;
    await prisma.challengeParticipant.update({
      where: { id: d.id },
      data: { rank },
    });
    forrigeScore = d.score;
    forrigeRank = rank;
  }
}

export async function avsluttUtfordring(challengeId: string) {
  const user = await krevBruker();
  const utfordring = await prisma.drillChallenge.findUnique({
    where: { id: challengeId },
    select: { id: true, ownerId: true, name: true, participants: { select: { userId: true } } },
  });
  if (!utfordring) throw new Error("Utfordring finnes ikke.");
  if (utfordring.ownerId !== user.id && user.role !== "ADMIN") {
    throw new Error("Kun eier kan avslutte utfordringen.");
  }

  await prisma.drillChallenge.update({
    where: { id: challengeId },
    data: { status: "ENDED", endAt: new Date() },
  });

  await audit({
    actorId: user.id,
    action: "challenge.ended",
    target: `DrillChallenge:${challengeId}`,
  });

  // Varsle alle deltakere
  for (const p of utfordring.participants) {
    if (p.userId !== user.id) {
      await notify({
        userId: p.userId,
        type: "achievement",
        title: "Utfordringen er avsluttet",
        body: `«${utfordring.name}» er nå avsluttet. Sjekk resultatlisten.`,
        link: `/portal/utfordringer/${challengeId}`,
      });
    }
  }

  revalidatePath(`/portal/utfordringer/${challengeId}`);
  revalidatePath("/portal/utfordringer");
}
