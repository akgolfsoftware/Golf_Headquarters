"use server";

/**
 * Fysisk trening — skrivehandlinger (2026-07-27).
 *
 * Fram til nå har fys-modulen vært ren lesning: øktene ble planlagt, men det
 * fantes ingen vei til å markere dem som gjennomført. Kolonnene
 * FysOkt.gjennomfortAt/faktiskMinutter lå ubrukt.
 *
 * Stempelet er det som gir fys-økta en dato, og dermed en plass i den samlede
 * treningshistorikken i Analyse ved siden av golftreningen.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

const LoggFysOktSchema = z.object({
  oktId: z.string().min(1),
  /** Faktisk brukt tid. Utelatt: vi bruker det planlagte estimatet. */
  faktiskMinutter: z.number().int().min(1).max(600).optional(),
  /** Per øvelse: sett faktisk gjennomført, med vekt og reps. */
  rader: z
    .array(
      z.object({
        radId: z.string().min(1),
        loggSett: z.number().int().min(0).max(50).optional(),
        loggRepsPerSett: z.string().trim().max(120).optional(),
        loggBelastningKg: z.number().min(0).max(1000).optional(),
        loggRir: z.number().int().min(0).max(10).optional(),
        notat: z.string().trim().max(500).optional(),
      }),
    )
    .max(60)
    .optional(),
});

export type LoggFysOktInput = z.infer<typeof LoggFysOktSchema>;

/**
 * Marker en fys-økt som gjennomført og lagre det som faktisk ble gjort.
 * Idempotent: kjøres den to ganger, oppdateres tallene — økta blir ikke dobbelt.
 */
export async function loggFysOkt(
  input: LoggFysOktInput,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requirePortalUser();
  const parsed = LoggFysOktSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldige treningstall." };
  const { oktId, faktiskMinutter, rader } = parsed.data;

  // Eierskap: økta henger under en plan som tilhører en spiller. Coach med
  // aktiv kobling til spilleren kan også logge (samme regel som drill-editering).
  const okt = await prisma.fysOkt.findUnique({
    where: { id: oktId },
    select: {
      id: true,
      estimertMinutter: true,
      uke: { select: { plan: { select: { userId: true } } } },
      rader: { select: { id: true } },
    },
  });
  if (!okt?.uke?.plan) return { ok: false, error: "Fant ikke økten." };

  const eierId = okt.uke.plan.userId;
  if (eierId !== user.id) {
    const erCoach =
      (await prisma.playerEnrollment.findFirst({
        where: { userId: eierId, coachId: user.id, endedAt: null },
        select: { id: true },
      })) !== null;
    if (!erCoach) return { ok: false, error: "Du kan ikke logge denne økten." };
  }

  // Kun rader som faktisk hører til økta — hindrer at en fremmed radId smugles inn.
  const egneRader = new Set(okt.rader.map((r) => r.id));
  const gyldige = (rader ?? []).filter((r) => egneRader.has(r.radId));

  await prisma.$transaction([
    ...gyldige.map((r) =>
      prisma.fysOvelseRad.update({
        where: { id: r.radId },
        data: {
          loggSett: r.loggSett ?? null,
          loggRepsPerSett: r.loggRepsPerSett || null,
          loggBelastningKg: r.loggBelastningKg ?? null,
          loggRir: r.loggRir ?? null,
          notat: r.notat || null,
        },
      }),
    ),
    prisma.fysOkt.update({
      where: { id: oktId },
      data: {
        gjennomfortAt: new Date(),
        faktiskMinutter: faktiskMinutter ?? okt.estimertMinutter ?? null,
      },
    }),
  ]);

  revalidatePath("/portal/fysisk");
  revalidatePath("/portal/analysere");
  return { ok: true };
}

/** Angre: fjerner gjennomført-stempelet. Loggede tall på øvelsene beholdes. */
export async function angreFysOktLogg(
  oktId: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requirePortalUser();
  const okt = await prisma.fysOkt.findUnique({
    where: { id: oktId },
    select: { uke: { select: { plan: { select: { userId: true } } } } },
  });
  if (!okt?.uke?.plan) return { ok: false, error: "Fant ikke økten." };
  if (okt.uke.plan.userId !== user.id) {
    return { ok: false, error: "Du kan ikke endre denne økten." };
  }

  await prisma.fysOkt.update({
    where: { id: oktId },
    data: { gjennomfortAt: null, faktiskMinutter: null },
  });
  revalidatePath("/portal/fysisk");
  revalidatePath("/portal/analysere");
  return { ok: true };
}
