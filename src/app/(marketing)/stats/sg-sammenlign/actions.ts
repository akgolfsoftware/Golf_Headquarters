"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import {
  estimerSgFordelingFraSnitt,
  tourEquivalentScore,
  sammenlignMedReferanse,
} from "@/lib/stats/sg-estimator";

const StartSchema = z.object({
  refDgPlayerId: z.coerce.number().int().positive(),
  snittScore: z.coerce.number().min(60).max(140).optional(),
  sgOtt: z.coerce.number().min(-10).max(10).optional(),
  sgApp: z.coerce.number().min(-10).max(10).optional(),
  sgArg: z.coerce.number().min(-10).max(10).optional(),
  sgPutt: z.coerce.number().min(-10).max(10).optional(),
  antallRunder: z.coerce.number().int().min(1).max(500).optional(),
  // "MANUELL_SG" — bruker la inn SG selv
  // "FRA_SNITT" — bruker la inn snittscore, vi estimerer SG
  modus: z.enum(["MANUELL_SG", "FRA_SNITT"]),
});

export async function startSammenligning(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?next=/stats/sg-sammenlign/start");
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = StartSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(
      `/stats/sg-sammenlign/start?feil=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Ugyldig input",
      )}`,
    );
  }
  const data = parsed.data;

  // Hent referansespiller fra PgaPlayerSeason
  const ref = await prisma.pgaPlayerSeason.findFirst({
    where: { dgPlayerId: data.refDgPlayerId, tour: "pga" },
    orderBy: { year: "desc" },
    select: {
      dgPlayerId: true,
      playerName: true,
      year: true,
      sgTotal: true,
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
    },
  });

  if (!ref) {
    redirect(
      `/stats/sg-sammenlign/start?feil=${encodeURIComponent(
        "Referansespiller ikke funnet",
      )}`,
    );
  }

  // Brukerens SG-fordeling: enten direkte input eller estimert fra snittscore
  let sgOtt = data.sgOtt ?? null;
  let sgApp = data.sgApp ?? null;
  let sgArg = data.sgArg ?? null;
  let sgPutt = data.sgPutt ?? null;
  let sgTotal: number | null = null;

  if (data.modus === "FRA_SNITT" && data.snittScore) {
    const estimert = estimerSgFordelingFraSnitt(data.snittScore);
    sgOtt = estimert.sgOtt;
    sgApp = estimert.sgApp;
    sgArg = estimert.sgArg;
    sgPutt = estimert.sgPutt;
    sgTotal = estimert.sgTotal;
  } else if (data.modus === "MANUELL_SG") {
    sgTotal =
      (sgOtt ?? 0) + (sgApp ?? 0) + (sgArg ?? 0) + (sgPutt ?? 0);
  }

  // Lagre SG-input
  const sgInput = await prisma.brukerSgInput.create({
    data: {
      userId: user.id,
      sgOtt,
      sgApp,
      sgArg,
      sgPutt,
      sgTotal,
      snittScore: data.snittScore ?? null,
      antallRunder: data.antallRunder ?? null,
      kilde: data.modus === "FRA_SNITT" ? "MANUELL" : "MANUELL",
    },
    select: { id: true },
  });

  // Beregn estimater
  let estPgaTourScore: number | null = null;
  let estHcp: number | null = null;
  if (data.snittScore) {
    const eq = tourEquivalentScore(data.snittScore);
    estPgaTourScore = eq.tourScore;
    estHcp = eq.hcp;
  }

  const sammenligning = sammenlignMedReferanse(
    { sgOtt, sgApp, sgArg, sgPutt, sgTotal },
    {
      sgOtt: ref.sgOtt,
      sgApp: ref.sgApp,
      sgArg: ref.sgArg,
      sgPutt: ref.sgPutt,
      sgTotal: ref.sgTotal,
    },
  );

  // Lagre sammenligning
  const lagret = await prisma.brukerSammenligning.create({
    data: {
      userId: user.id,
      sgInputId: sgInput.id,
      refDgPlayerId: ref.dgPlayerId,
      refPlayerName: ref.playerName,
      refTour: "pga",
      refYear: ref.year,
      estPgaTourScore,
      estHcp,
      sgDiffTotal: sammenligning.diff.total,
    },
    select: { id: true },
  });

  revalidatePath("/stats/sg-sammenlign");
  redirect(`/stats/sg-sammenlign/resultat/${lagret.id}`);
}
