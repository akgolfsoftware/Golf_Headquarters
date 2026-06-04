// POST /api/portal/trening/logg
// Spiller logger en treningsøkt fra portal quick-log. Validerer input med Zod
// og oppretter en TrainingLog koblet til innlogget bruker.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { SgCategory } from "@/generated/prisma/client";

const LoggSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sgArea: z.nativeEnum(SgCategory),
  minutes: z.number().int().min(1).max(240),
  drillName: z.string().max(100).optional(),
  quality: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = LoggSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { date, sgArea, minutes, drillName, quality, notes } = parsed.data;

  try {
    const logg = await prisma.trainingLog.create({
      data: {
        userId: user.id,
        date: new Date(date),
        sgArea,
        minutes,
        drillName,
        quality,
        notes,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: logg.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Intern feil ved lagring' },
      { status: 500 },
    );
  }
}
