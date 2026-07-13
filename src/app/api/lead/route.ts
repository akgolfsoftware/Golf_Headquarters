import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sendVelkomstEpost } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { requireSameOrigin, getClientIp } from "@/lib/security/same-origin";

export const runtime = "nodejs";

type RequestBody = {
  email?: string;
  name?: string;
  source?: string;
  metadata?: unknown;
};

// Uautentisert endepunkt: metadata må være et flatt objekt med enkle
// verdityper og begrenset størrelse — aldri vilkårlig JSON rett i databasen.
const METADATA_MAX_BYTES = 4096;
const metadataSchema = z
  .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
  .refine((obj) => JSON.stringify(obj).length <= METADATA_MAX_BYTES, {
    message: "metadata-too-large",
  });

export async function POST(req: Request) {
  // CSRF-guard: kun requests fra akgolf.no
  const guard = requireSameOrigin(req);
  if (guard) return guard;

  // Rate-limit per IP — 5 leads per minutt for å hindre spam
  // Bruker x-vercel-forwarded-for (ikke-spoofbar) i stedet for x-forwarded-for[0]
  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `lead:${ip}`, max: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "invalid-email" }, { status: 400 });
  }

  let metadata: Prisma.InputJsonValue | undefined;
  if (body.metadata !== undefined) {
    const parsed = metadataSchema.safeParse(body.metadata);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid-metadata" }, { status: 400 });
    }
    metadata = parsed.data;
  }

  // Opprett lead (idempotent på email + source)
  const eksisterende = await prisma.lead.findFirst({
    where: { email, source: body.source ?? null },
  });

  if (!eksisterende) {
    await prisma.lead.create({
      data: {
        email,
        name: body.name?.trim() || null,
        source: body.source ?? null,
        metadata,
      },
    });

    // Send velkomst-e-post (fire-and-forget, ikke blokker respons)
    sendVelkomstEpost({
      email,
      name: body.name,
      source: body.source ?? "newsletter",
    }).catch((err) => {
      console.error("[lead] velkomst-epost feilet", err);
    });
  }

  return NextResponse.json({ ok: true });
}
