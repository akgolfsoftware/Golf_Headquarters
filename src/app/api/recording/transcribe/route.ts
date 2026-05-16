// POST /api/recording/transcribe
// Body: { recordingId }
// Laster ned final.webm fra Supabase Storage, sender til Whisper,
// lagrer transcript på SessionRecording og trigger V3-analyse (fire-and-forget).

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { transkriber } from "@/lib/transcribe";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const maxDuration = 300; // Whisper kan ta tid for 50-min økter

const BUCKET = "coaching-recordings";

const Body = z.object({
  recordingId: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  }

  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig body" }, { status: 400 });
  }
  const { recordingId } = parsed.data;

  const rec = await prisma.sessionRecording.findUnique({
    where: { id: recordingId },
  });

  if (!rec) {
    return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  }

  if (rec.uploadedById !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  }

  if (!rec.audioUrl) {
    return NextResponse.json(
      { error: "Ingen lydfil — opptak er ikke fullført" },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY mangler — kan ikke transkribere" },
      { status: 500 },
    );
  }

  // Hent lydfil fra Supabase Storage
  const admin = supabaseAdmin();
  const { data: blob, error: dlErr } = await admin.storage
    .from(BUCKET)
    .download(rec.audioUrl);

  if (dlErr || !blob) {
    await prisma.sessionRecording.update({
      where: { id: recordingId },
      data: { status: "FAILED" },
    });
    return NextResponse.json(
      { error: `Storage-feil: ${dlErr?.message ?? "ukjent"}` },
      { status: 500 },
    );
  }

  // Transkriber
  try {
    const { text, durationSec, language } = await transkriber({
      audioBlob: blob,
      filename: "final.webm",
    });

    await prisma.sessionRecording.update({
      where: { id: recordingId },
      data: {
        transcript: text,
        durationSec: rec.durationSec ?? Math.round(durationSec ?? 0),
        // Forblir PROCESSING — V3 setter DONE etter AI-analyse.
        status: "PROCESSING",
      },
    });

    await audit({
      actorId: user.id,
      action: "recording.transcribed",
      target: `SessionRecording:${recordingId}`,
      metadata: {
        recordingId,
        language,
        charCount: text.length,
      },
    });

    // Trigge V3 analyse i bakgrunnen (fire-and-forget).
    try {
      const analyzeUrl = new URL(
        "/api/recording/analyze",
        request.url,
      ).toString();
      fetch(analyzeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({ recordingId }),
      }).catch((e) => {
        console.error("[transcribe] kunne ikke trigge analyze:", e);
      });
    } catch (e) {
      console.error("[transcribe] feil ved trigging av analyze:", e);
    }

    return NextResponse.json({
      ok: true,
      recordingId,
      transcript: text,
      durationSec,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.sessionRecording.update({
      where: { id: recordingId },
      data: { status: "FAILED" },
    });
    return NextResponse.json(
      { error: `Whisper-feil: ${msg}` },
      { status: 500 },
    );
  }
}
