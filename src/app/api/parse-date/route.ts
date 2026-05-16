// POST /api/parse-date
//
// Body: { text: string; basisdato?: string (ISO); spilllerId?: string }
// Response: { dato: string | null; konfidens: number; forklaring: string }
//
// Brukes av SmartDateInput og andre UI-komponenter som vil oversette naturlig
// språk til datoer (f.eks. "neste mandag", "2 uker før Bossum Open").

import { NextResponse } from "next/server";
import { z } from "zod";
import { parseDato } from "@/lib/portal/training/date-parser";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  text: z.string().min(1).max(200),
  basisdato: z.string().datetime().optional(),
  spilllerId: z.string().cuid().optional(),
});

export async function POST(req: Request) {
  // Krever innlogget bruker — alle roller, inkludert PLAYER og PARENT.
  await requirePortalUser();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validering feilet", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const resultat = await parseDato({
    text: parsed.data.text,
    basisdato: parsed.data.basisdato ? new Date(parsed.data.basisdato) : undefined,
    spilllerId: parsed.data.spilllerId,
  });

  return NextResponse.json({
    dato: resultat.dato ? resultat.dato.toISOString() : null,
    konfidens: resultat.konfidens,
    forklaring: resultat.forklaring,
  });
}
