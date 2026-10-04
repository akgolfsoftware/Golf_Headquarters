import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSignedUrl, STORAGE_BUCKETS } from "@/lib/storage/supabase-storage";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { TnSessionSchema } from "@/lib/portal-tester/tn-session";
import { tnRowError } from "@/lib/portal-tester/tn-scoring";
import { normaliserTnTestbilde, TN_TEST_PHOTO_INPUT_MAX } from "@/lib/portal-tester/tn-photo";
import { isSameOrigin } from "@/lib/security/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NøkkelSchema = z.object({ sessionId: z.string().uuid(), attempt: z.coerce.number().int().min(1).max(200) });
const JSONSchema = NøkkelSchema;
const PHOTO_BUCKET = STORAGE_BUCKETS.TN_TEST_PHOTOS;
const PHOTO_REQUEST_MAX = TN_TEST_PHOTO_INPUT_MAX + 64 * 1024;

async function viewer() {
  const user = await getCurrentUserRaw();
  if (!user) return { response: NextResponse.json({ error: "Logg inn for å fortsette." }, { status: 401 }) };
  if (isAwaitingGuardianConsent(user)) return { response: NextResponse.json({ error: "Foresattes samtykke må være på plass." }, { status: 403 }) };
  if (user.role !== "PLAYER") return { response: NextResponse.json({ error: "Bare spilleren kan legge til eller hente dette bildet." }, { status: 403 }) };
  return { user };
}

async function ownAttempt(userId: string, sessionId: string, attempt: number) {
  const session = await prisma.testSession.findFirst({
    where: { id: sessionId, userId, testId: { startsWith: "tn-v3-" }, status: { in: ["IN_PROGRESS", "COMPLETED"] } },
    select: { id: true, testId: true, scoringData: true },
  });
  if (!session) return null;
  const parsed = TnSessionSchema.safeParse(session.scoringData);
  if (!parsed.success || attempt > parsed.data.count) return null;
  const base = tnProtocol(parsed.data.protocolId, undefined, parsed.data.version);
  const p = base?.variableCount ? tnProtocol(parsed.data.protocolId, parsed.data.count, parsed.data.version) : base;
  if (!p || p.rows.length !== parsed.data.count || tnRowError(p.rows[attempt - 1], parsed.data.values[String(attempt)] ?? {}, true)) return null;
  return session;
}

export async function GET(request: Request) {
  const access = await viewer();
  if ("response" in access) return access.response;
  const url = new URL(request.url);
  const parsed = NøkkelSchema.safeParse({ sessionId: url.searchParams.get("sessionId"), attempt: url.searchParams.get("attempt") });
  if (!parsed.success) return NextResponse.json({ error: "Fant ikke bildet." }, { status: 404 });
  const session = await ownAttempt(access.user.id, parsed.data.sessionId, parsed.data.attempt);
  if (!session) return NextResponse.json({ error: "Fant ikke bildet." }, { status: 404 });
  const photo = await prisma.testSessionPhoto.findFirst({ where: { userId: access.user.id, testSessionId: session.id, attemptNumber: parsed.data.attempt }, select: { id: true, storagePath: true } });
  if (!photo) return NextResponse.json({ error: "Fant ikke bildet." }, { status: 404 });
  try {
    return NextResponse.json({ id: photo.id, url: await getSignedUrl(PHOTO_BUCKET, photo.storagePath, 300) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Bildet kunne ikke hentes akkurat nå." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const access = await viewer();
  if ("response" in access) return access.response;
  const user = access.user;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  const limit = await rateLimit({ key: `tn-test-photo:${user.id}`, max: 10, windowMs: 5 * 60_000 });
  if (!limit.ok) return NextResponse.json({ error: "Du har lastet opp mange bilder. Vent litt før du prøver igjen." }, { status: 429 });
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const bodyLength = Number(contentLength);
    if (!Number.isSafeInteger(bodyLength) || bodyLength < 0) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
    if (bodyLength > PHOTO_REQUEST_MAX) return NextResponse.json({ error: "Bildet er for stort." }, { status: 413 });
  }

  let form: FormData;
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: "Velg ett bilde." }, { status: 400 });
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > PHOTO_REQUEST_MAX) {
        await reader.cancel().catch(() => undefined);
        return NextResponse.json({ error: "Bildet er for stort." }, { status: 413 });
      }
      chunks.push(value);
    }
    const multipart = new Response(Buffer.concat(chunks, size), { headers: { "Content-Type": request.headers.get("content-type") ?? "" } });
    form = await multipart.formData();
  }
  catch { return NextResponse.json({ error: "Kunne ikke lese bildet." }, { status: 400 }); }
  finally { reader.releaseLock(); }
  const key = NøkkelSchema.safeParse({ sessionId: form.get("sessionId"), attempt: form.get("attempt") });
  const files = form.getAll("file");
  if (!key.success || files.length !== 1 || !(files[0] instanceof File)) return NextResponse.json({ error: "Velg ett bilde til et registrert forsøk." }, { status: 400 });
  const file = files[0];
  if (file.size < 1 || file.size > TN_TEST_PHOTO_INPUT_MAX) return NextResponse.json({ error: "Bildet må være maks 3 MB." }, { status: 413 });

  const session = await ownAttempt(user.id, key.data.sessionId, key.data.attempt);
  if (!session) return NextResponse.json({ error: "Lagre målingen for dette forsøket før du legger til bilde." }, { status: 409 });
  const existing = await prisma.testSessionPhoto.findUnique({
    where: { testSessionId_attemptNumber: { testSessionId: session.id, attemptNumber: key.data.attempt } },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ error: "Dette forsøket har allerede et bilde. Slett det før du velger et nytt." }, { status: 409 });
  let clean: Awaited<ReturnType<typeof normaliserTnTestbilde>>;
  try { clean = await normaliserTnTestbilde(Buffer.from(await file.arrayBuffer())); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Bildet kunne ikke leses." }, { status: 400 }); }

  const storagePath = `${user.id}/${session.id}/${key.data.attempt}/${randomUUID()}.webp`;
  let storage: ReturnType<ReturnType<typeof supabaseAdmin>["storage"]["from"]> | null = null;
  let uploadSucceeded = false;
  try {
    storage = supabaseAdmin().storage.from(PHOTO_BUCKET);
    const uploaded = await storage.upload(storagePath, clean.bytes, { contentType: "image/webp", upsert: false, cacheControl: "3600" });
    if (uploaded.error) {
      await storage.remove([storagePath]).catch(() => undefined);
      return NextResponse.json({ error: "Bildet kunne ikke lagres akkurat nå." }, { status: 503 });
    }
    uploadSucceeded = true;
    // Obtain the link before writing the index. If signing fails, cleanup does
    // not leave a database row that makes the attempt look like it has a photo.
    const url = await getSignedUrl(PHOTO_BUCKET, storagePath, 300);
    const saved = await prisma.testSessionPhoto.create({
      data: { userId: user.id, testSessionId: session.id, attemptNumber: key.data.attempt, storagePath },
      select: { id: true },
    });
    return NextResponse.json({ id: saved.id, url }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    if (uploadSucceeded && storage) await storage.remove([storagePath]).catch(() => undefined);
    return NextResponse.json({ error: "Bildet kunne ikke lagres akkurat nå." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const access = await viewer();
  if ("response" in access) return access.response;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 403 });
  let payload: unknown;
  try { payload = await request.json(); }
  catch { return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 }); }
  const parsed = JSONSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Fant ikke bildet." }, { status: 404 });
  const session = await ownAttempt(access.user.id, parsed.data.sessionId, parsed.data.attempt);
  if (!session) return NextResponse.json({ error: "Fant ikke bildet." }, { status: 404 });
  const photo = await prisma.testSessionPhoto.findFirst({ where: { userId: access.user.id, testSessionId: session.id, attemptNumber: parsed.data.attempt }, select: { id: true, storagePath: true } });
  if (!photo) return NextResponse.json({ ok: true });
  try {
    const removed = await supabaseAdmin().storage.from(PHOTO_BUCKET).remove([photo.storagePath]);
    if (removed.error) return NextResponse.json({ error: "Bildet kunne ikke slettes akkurat nå." }, { status: 503 });
    await prisma.testSessionPhoto.deleteMany({ where: { id: photo.id, userId: access.user.id } });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Bildet kunne ikke slettes akkurat nå." }, { status: 503 });
  }
}
