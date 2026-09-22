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
  /** true = høyest score vinner. Overstyres av øvelsens egen retning når satt. */
  higherIsBetter?: boolean;
  /** Bruker-id-er valgt fra venner/egne grupper/stallen. Eier legges alltid til automatisk. */
  deltakerIds?: string[];
};

function parseDato(verdi?: string | null): Date | null {
  if (!verdi) return null;
  const d = new Date(verdi);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Gyldige deltaker-kandidater for en bruker: venner (Friendship ACCEPTED) og
 * medlemmer (uansett rolle, endedAt: null) av grupper brukeren selv er aktivt
 * medlem av. En coach sin gruppe gir dermed automatisk tilgang til stallen
 * (PLAYER-medlemmene der) — ingen delbar lenke, kun disse to kildene
 * (beslutninger.md §Utfordringer skal leve).
 */
async function hentGyldigeDeltakerIder(userId: string): Promise<Set<string>> {
  const [vennskap, egneMedlemskap] = await Promise.all([
    prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ userAId: userId }, { userBId: userId }] },
      select: { userAId: true, userBId: true },
    }),
    prisma.groupMember.findMany({
      where: { userId, endedAt: null },
      select: { groupId: true },
    }),
  ]);

  const ider = new Set<string>();
  for (const v of vennskap) ider.add(v.userAId === userId ? v.userBId : v.userAId);

  const gruppeIder = egneMedlemskap.map((m) => m.groupId);
  if (gruppeIder.length > 0) {
    const medlemmer = await prisma.groupMember.findMany({
      where: { groupId: { in: gruppeIder }, endedAt: null, userId: { not: userId } },
      select: { userId: true },
    });
    for (const m of medlemmer) ider.add(m.userId);
  }

  return ider;
}

export async function opprettUtfordring(input: UtfordringInput) {
  const user = await krevBruker();
  const navn = input.name.trim();
  if (!navn) throw new Error("Navn er påkrevd.");

  let higherIsBetter = input.higherIsBetter ?? true;
  if (input.drillId) {
    const ovelse = await prisma.exerciseDefinition.findUnique({
      where: { id: input.drillId },
      select: { higherIsBetter: true },
    });
    if (ovelse?.higherIsBetter != null) higherIsBetter = ovelse.higherIsBetter;
  }

  const onskedeDeltakere = [...new Set((input.deltakerIds ?? []).filter((id) => id !== user.id))];
  if (onskedeDeltakere.length > 0) {
    const gyldige = await hentGyldigeDeltakerIder(user.id);
    const ugyldig = onskedeDeltakere.find((id) => !gyldige.has(id));
    if (ugyldig) throw new Error("Kan bare legge til venner eller medlemmer av egne grupper som deltakere.");
  }

  const ny = await prisma.drillChallenge.create({
    data: {
      ownerId: user.id,
      name: navn,
      description: input.description?.trim() || null,
      drillId: input.drillId || null,
      startAt: parseDato(input.startAt),
      endAt: parseDato(input.endAt),
      status: "ACTIVE",
      higherIsBetter,
      // Eier blir automatisk deltaker, i tillegg til de valgte
      participants: {
        create: [{ userId: user.id }, ...onskedeDeltakere.map((userId) => ({ userId }))],
      },
    },
  });

  await audit({
    actorId: user.id,
    action: "challenge.created",
    target: `DrillChallenge:${ny.id}`,
    metadata: { name: ny.name, drillId: ny.drillId, higherIsBetter, deltakere: onskedeDeltakere.length + 1 },
  });

  for (const deltakerId of onskedeDeltakere) {
    await notify({
      userId: deltakerId,
      type: "achievement",
      title: "Du er lagt til i en utfordring",
      body: `${user.name ?? "En spiller"} la deg til i «${ny.name}».`,
      link: `/portal/utfordringer/${ny.id}`,
    });
  }

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

  // Beregn rangering på nytt (retning avgjøres av utfordringens higherIsBetter)
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
  const utfordring = await prisma.drillChallenge.findUnique({
    where: { id: challengeId },
    select: { higherIsBetter: true },
  });
  const deltakere = await prisma.challengeParticipant.findMany({
    where: { challengeId, score: { not: null } },
    orderBy: { score: utfordring?.higherIsBetter === false ? "asc" : "desc" },
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
