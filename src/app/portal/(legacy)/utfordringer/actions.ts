"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { harTilgangTilUtfordring, hentGyldigeDeltakerIder, ovelseTilgangWhere } from "@/lib/portal/utfordring-tilgang";

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
  /** Bruker-id-er valgt fra egne grupper (coach: også stallen). Eier legges alltid til automatisk. */
  deltakerIds?: string[];
};

const OpprettUtfordringSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(4000).nullish(),
  drillId: z.string().min(1).max(128).nullish(),
  startAt: z.string().max(40).nullish(),
  endAt: z.string().max(40).nullish(),
  higherIsBetter: z.boolean().optional(),
  deltakerIds: z.array(z.string().min(1).max(128)).max(100).optional(),
});

function parseDato(verdi?: string | null): Date | null {
  if (!verdi) return null;
  const d = new Date(verdi);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function opprettUtfordring(input: UtfordringInput) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"], kreverTilgang: "FULL" });
  const parsed = OpprettUtfordringSchema.safeParse(input);
  if (!parsed.success) throw new Error("Kontroller navn, tekst og deltakere.");
  const data = parsed.data;
  const navn = data.name;

  let higherIsBetter = data.higherIsBetter ?? true;
  if (data.drillId) {
    const ovelse = await prisma.exerciseDefinition.findFirst({
      where: { AND: [{ id: data.drillId }, await ovelseTilgangWhere(user)] },
      select: { higherIsBetter: true },
    });
    if (!ovelse) throw new Error("Øvelsen finnes ikke i Øvelsesbanken din.");
    if (ovelse.higherIsBetter != null) higherIsBetter = ovelse.higherIsBetter;
  }

  const onskedeDeltakere = [...new Set((data.deltakerIds ?? []).filter((id) => id !== user.id))];
  if (onskedeDeltakere.length > 0) {
    const gyldige = await hentGyldigeDeltakerIder(user);
    const ugyldig = onskedeDeltakere.find((id) => !gyldige.has(id));
    if (ugyldig) throw new Error("Du kan bare velge deltakere fra gruppene dine.");
  }

  const ny = await prisma.drillChallenge.create({
    data: {
      ownerId: user.id,
      name: navn,
      description: data.description?.trim() || null,
      drillId: data.drillId || null,
      startAt: parseDato(data.startAt),
      endAt: parseDato(data.endAt),
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
  // Ingen delbar lenke: bare eier og valgte deltakere kan bli med (16.10.2026).
  if (!(await harTilgangTilUtfordring(challengeId, user))) throw new Error("Utfordring finnes ikke.");
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
