import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { LiveSessionIdSchema, loadAuthorizedLiveSource } from "@/lib/portal-live/session-source";
import { canAttachLiveVideo } from "@/lib/portal-live/video-access";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZES, STORAGE_BUCKETS } from "@/lib/storage/buckets";
const bucket = STORAGE_BUCKETS.PLAYER_SWING_VIDEOS;
const Input = z.object({ sessionId: LiveSessionIdSchema, drillId: z.string().min(1).max(100),
  mimeType: z.string().max(100).refine(value => ALLOWED_MIME_TYPES[bucket].includes(value)),
  size: z.number().int().min(1).max(MAX_FILE_SIZES[bucket]) }).strict();
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  if (user.role !== "PLAYER" || isAwaitingGuardianConsent(user)) return NextResponse.json({ error: "Videoopplasting er ikke tillatt." }, { status: 403 });
  const input = Input.safeParse(await req.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Velg en MP4-, MOV- eller WEBM-video på høyst 50 MB." }, { status: 400 });
  const limit = await rateLimit({ key: `live-video-ticket:${user.id}`, max: 20, windowMs: 60000 });
  if (!limit.ok) return NextResponse.json({ error: "Vent litt før du laster opp flere videoer." }, { status: 429 });
  try {
    const source = await loadAuthorizedLiveSource(input.data.sessionId);
    if (!canAttachLiveVideo(source, user.id, input.data.drillId)) return NextResponse.json({ error: "Økta eller øvelsen er ikke tilgjengelig for opplasting." }, { status: 403 });
    const extension = input.data.mimeType === "video/mp4" ? "mp4" : input.data.mimeType === "video/quicktime" ? "mov" : "webm";
    const path = `${user.id}/${randomUUID()}.${extension}`;
    const signed = await supabaseAdmin().storage.from(bucket).createSignedUploadUrl(path, { upsert: false });
    if (signed.error || !signed.data?.token) return NextResponse.json({ error: "Opplastingen kunne ikke klargjøres. Prøv igjen." }, { status: 503 });
    return NextResponse.json({ ok: true, path, token: signed.data.token, bucket }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const denied = error instanceof Error && ["forbidden", "not-found"].includes(error.message);
    return NextResponse.json({ error: denied ? "Økta er ikke tilgjengelig." : "Opplastingen kunne ikke klargjøres. Prøv igjen." }, { status: denied ? 403 : 503 });
  }
}
