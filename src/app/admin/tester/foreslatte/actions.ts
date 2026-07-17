"use server";

/**
 * Server actions for coach-godkjenning av custom-tester.
 *  - godkjennForslag — setter isCoachApproved=true, visibility=ACADEMY,
 *    approvedAt=now() og varsler skaperen.
 *  - avvisForslag — sletter testen og varsler skaperen om at den ble avvist.
 */
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

const idSchema = z.object({ id: z.string().min(1) });

export async function godkjennForslag(input: unknown) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = idSchema.parse(input);

  const test = await prisma.testDefinition.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isCustom: true,
      isCoachApproved: true,
      createdById: true,
    },
  });

  if (!test) throw new Error("Testen finnes ikke.");
  if (!test.isCustom) throw new Error("Kan kun godkjenne custom-tester.");
  if (test.isCoachApproved) throw new Error("Testen er allerede godkjent.");

  await prisma.testDefinition.update({
    where: { id },
    data: {
      isCoachApproved: true,
      approvedAt: new Date(),
      visibility: "ACADEMY",
    },
  });

  await audit({
    actorId: coach.id,
    action: "test.coach_approved",
    target: `TestDefinition:${id}`,
    metadata: { name: test.name },
  });

  if (test.createdById && test.createdById !== coach.id) {
    await notify({
      userId: test.createdById,
      type: "achievement",
      title: "Test godkjent",
      body: `Coach godkjente «${test.name}» — den er nå tilgjengelig for hele akademi.`,
      link: `/portal/tren/tester/${id}`,
    });
  }

  revalidatePath("/admin/tester/foreslatte");
  revalidatePath("/portal/tren/tester");
  revalidatePath("/portal/tren/tester/katalog");

  return { ok: true as const };
}

export async function avvisForslag(input: unknown) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = idSchema.parse(input);

  const test = await prisma.testDefinition.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isCustom: true,
      createdById: true,
    },
  });

  if (!test) throw new Error("Testen finnes ikke.");
  if (!test.isCustom) throw new Error("Kan kun avvise custom-tester.");

  // Sjekk om noen har logget resultater på denne testen — i så fall set
  // visibility til PRIVATE og isCoachApproved til false i stedet for sletting.
  const antallResultater = await prisma.testResult.count({
    where: { testId: id },
  });

  if (antallResultater > 0) {
    await prisma.testDefinition.update({
      where: { id },
      data: {
        visibility: "PRIVATE",
        isCoachApproved: false,
      },
    });
  } else {
    await prisma.testDefinition.delete({ where: { id } });
  }

  await audit({
    actorId: coach.id,
    action: "test.coach_rejected",
    target: `TestDefinition:${id}`,
    metadata: { name: test.name, hadResults: antallResultater > 0 },
  });

  if (test.createdById && test.createdById !== coach.id) {
    await notify({
      userId: test.createdById,
      type: "achievement",
      title: "Test avvist",
      body:
        antallResultater > 0
          ? `Coach satte «${test.name}» tilbake til privat. Den er fortsatt din.`
          : `Coach avviste forslaget «${test.name}».`,
    });
  }

  revalidatePath("/admin/tester/foreslatte");
  revalidatePath("/portal/tren/tester");
  revalidatePath("/portal/tren/tester/katalog");

  return { ok: true as const };
}
