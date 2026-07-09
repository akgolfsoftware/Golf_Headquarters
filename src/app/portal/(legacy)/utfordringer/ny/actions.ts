"use server";

/**
 * Server action for å opprette en custom DrillChallenge fra wizard-flyten.
 * Bygger på eksisterende opprettUtfordring, men:
 *  - Tar type + targetValue + targetUnit som rik metadata (lagres i description-prefiks).
 *  - Inviterer venner direkte ved å lage ChallengeParticipant-rader.
 *  - Sender notifikasjon til hver invitert venn.
 */
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

const opprettCustomChallengeSchema = z.object({
  name: z.string().min(2, "Tittel må være minst 2 tegn").max(120),
  description: z.string().max(2000).nullable().optional(),
  drillId: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
  type: z.enum([
    "lengde",
    "noyaktighet",
    "putting",
    "scrambling",
    "score",
    "mental",
    "annet",
  ]),
  targetValue: z.string().max(40).nullable().optional(),
  targetUnit: z.string().max(40).nullable().optional(),
  inviteUserIds: z.array(z.string().min(1)).max(20).default([]),
});

export type OpprettCustomChallengeInput = z.infer<
  typeof opprettCustomChallengeSchema
>;

function parseDato(verdi: string | null | undefined): Date | null {
  if (!verdi) return null;
  const d = new Date(verdi);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function opprettCustomChallenge(input: unknown) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = opprettCustomChallengeSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((i) => i.message).join(" · ") || "Ugyldige data",
    );
  }
  const data = parsed.data;

  // Bygg en beskrivelse som inkluderer type + målverdi som synlig metadata.
  const metaLinjer: string[] = [];
  metaLinjer.push(`Type: ${data.type}`);
  if (data.targetValue && data.targetUnit) {
    metaLinjer.push(`Mål: ${data.targetValue} ${data.targetUnit}`);
  } else if (data.targetValue) {
    metaLinjer.push(`Mål: ${data.targetValue}`);
  }
  const meta = metaLinjer.join(" · ");
  const beskrivelse = data.description
    ? `${meta}\n\n${data.description}`
    : meta;

  // Filtrer bort eier-id fra invitasjons-liste (eier blir uansett deltaker).
  const inviterte = data.inviteUserIds.filter((id) => id !== user.id);

  const ny = await prisma.drillChallenge.create({
    data: {
      ownerId: user.id,
      name: data.name.trim(),
      description: beskrivelse,
      drillId: data.drillId || null,
      endAt: parseDato(data.endAt),
      status: "ACTIVE",
      participants: {
        create: [
          { userId: user.id },
          ...inviterte.map((userId) => ({ userId })),
        ],
      },
    },
    select: { id: true, name: true },
  });

  await audit({
    actorId: user.id,
    action: "challenge.custom_created",
    target: `DrillChallenge:${ny.id}`,
    metadata: {
      name: ny.name,
      type: data.type,
      inviteCount: inviterte.length,
    },
  });

  // Send notifikasjon til hver invitert venn.
  for (const userId of inviterte) {
    await notify({
      userId,
      type: "achievement",
      title: "Du er invitert til utfordring",
      body: `${user.name ?? "En spiller"} inviterte deg til «${ny.name}».`,
      link: `/portal/utfordringer/${ny.id}`,
    });
  }

  revalidatePath("/portal/utfordringer");
  return { ok: true as const, id: ny.id, name: ny.name };
}
