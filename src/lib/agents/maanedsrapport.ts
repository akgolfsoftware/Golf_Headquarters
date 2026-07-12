/**
 * B5 (Bølge 4) — månedsrapport per selskap. Kjøres 1. i måneden (cron) og
 * bygger forrige kalendermåneds nøkkeltall, delt per lokasjon (selskaps-
 * dimensjonen: Gamle Fredrikstad GK / WANG / Mulligan / Miklagard) + totalt:
 *   - bookinger (antall + verdi i øre, avlyste ekskludert)
 *   - innbetalt (Payment SUCCEEDED, gruppert via bookingens lokasjon;
 *     betalinger uten booking-kobling samles under «Uten lokasjon»)
 *   - nye spillere + økter gjennomført (globalt — har ingen lokasjon)
 * Arkiveres i monthly_reports (én rad per måned, upsert = idempotent).
 * Kronetall vises kun bak VIEW_FINANCE-gaten i UI (reports-siden).
 */

import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const MaanedsrapportSchema = z.object({
  year: z.number(),
  month: z.number(),
  totalt: z.object({
    bookinger: z.number(),
    bookingVerdiOre: z.number(),
    innbetaltOre: z.number(),
    nyeSpillere: z.number(),
    okterGjennomfort: z.number(),
  }),
  perSelskap: z.array(
    z.object({
      navn: z.string(),
      bookinger: z.number(),
      bookingVerdiOre: z.number(),
      innbetaltOre: z.number(),
    }),
  ),
});
export type Maanedsrapport = z.infer<typeof MaanedsrapportSchema>;

export function parseMaanedsrapport(payload: unknown): Maanedsrapport | null {
  const r = MaanedsrapportSchema.safeParse(payload);
  return r.success ? r.data : null;
}

/** Bygg og arkiver rapport for gitt måned (default: forrige måned). */
export async function runMaanedsrapport(opts?: {
  year?: number;
  month?: number;
}): Promise<{ year: number; month: number; selskaper: number }> {
  const now = new Date();
  const forrige = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = opts?.year ?? forrige.getFullYear();
  const month = opts?.month ?? forrige.getMonth() + 1;
  const fra = new Date(year, month - 1, 1);
  const til = new Date(year, month, 1);

  const [bookinger, betalinger, nyeSpillere, okterGjennomfort] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: fra, lt: til }, status: { not: "CANCELLED" } },
      select: { priceOre: true, location: { select: { name: true } } },
    }),
    prisma.payment.findMany({
      where: { status: "SUCCEEDED", paidAt: { gte: fra, lt: til } },
      select: {
        amountOre: true,
        amountRefundedOre: true,
        booking: { select: { location: { select: { name: true } } } },
      },
    }),
    prisma.user.count({
      where: { role: "PLAYER", deletedAt: null, createdAt: { gte: fra, lt: til } },
    }),
    prisma.trainingPlanSession.count({
      where: { status: "COMPLETED", scheduledAt: { gte: fra, lt: til } },
    }),
  ]);

  const perSelskap = new Map<
    string,
    { bookinger: number; bookingVerdiOre: number; innbetaltOre: number }
  >();
  const hent = (navn: string) => {
    const eks = perSelskap.get(navn);
    if (eks) return eks;
    const ny = { bookinger: 0, bookingVerdiOre: 0, innbetaltOre: 0 };
    perSelskap.set(navn, ny);
    return ny;
  };

  for (const b of bookinger) {
    const rad = hent(b.location?.name ?? "Uten lokasjon");
    rad.bookinger++;
    rad.bookingVerdiOre += b.priceOre;
  }
  for (const p of betalinger) {
    const rad = hent(p.booking?.location?.name ?? "Uten lokasjon");
    rad.innbetaltOre += p.amountOre - p.amountRefundedOre;
  }

  const rapport: Maanedsrapport = {
    year,
    month,
    totalt: {
      bookinger: bookinger.length,
      bookingVerdiOre: bookinger.reduce((s, b) => s + b.priceOre, 0),
      innbetaltOre: betalinger.reduce((s, p) => s + p.amountOre - p.amountRefundedOre, 0),
      nyeSpillere,
      okterGjennomfort,
    },
    perSelskap: [...perSelskap.entries()]
      .map(([navn, tall]) => ({ navn, ...tall }))
      .sort((a, b) => b.innbetaltOre - a.innbetaltOre),
  };

  await prisma.monthlyReport.upsert({
    where: { year_month: { year, month } },
    create: { year, month, payload: rapport as unknown as Prisma.InputJsonValue },
    update: { payload: rapport as unknown as Prisma.InputJsonValue },
  });

  return { year, month, selskaper: rapport.perSelskap.length };
}
