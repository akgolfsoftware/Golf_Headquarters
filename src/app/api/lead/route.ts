import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sendVelkomstEpost } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type RequestBody = {
  email?: string;
  name?: string;
  source?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(req: Request) {
  // Rate-limit per IP — 5 leads per minutt for å hindre spam
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rl = rateLimit({ key: `lead:${ip}`, max: 5, windowMs: 60_000 });
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
        metadata: body.metadata
          ? (body.metadata as Prisma.InputJsonValue)
          : undefined,
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
