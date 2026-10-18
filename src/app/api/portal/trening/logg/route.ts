// POST /api/portal/trening/logg
// Logg økt i etterkant (PlayerHQ pakke 13). Validerer med Zod og oppretter en TrainingLog
// for innlogget bruker. Økta teller i total treningstid, aldri mot planen (vedtak 16.10).

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { datoIkkeFramITid, LoggOktSchema, sgOmradeFor } from "@/lib/portal-analyse/logg-okt";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
  }
  const rl = await rateLimit({ key: `trening-logg:${user.id}`, max: 30, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = LoggOktSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const v = parsed.data;
  if (!datoIkkeFramITid(v.date, new Date())) {
    return NextResponse.json({ error: "Datoen kan ikke være fram i tid" }, { status: 400 });
  }

  try {
    const logg = await prisma.trainingLog.create({
      data: {
        userId: user.id,
        date: new Date(`${v.date}T00:00:00.000Z`),
        sgArea: sgOmradeFor(v.pyramid, v.area),
        pyramid: v.pyramid,
        area: v.area,
        location: v.location,
        minutes: v.minutes,
        drillName: v.drillName,
        effort: v.effort,
        focus: v.focus,
        notes: v.notes,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: logg.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Intern feil ved lagring" }, { status: 500 });
  }
}
