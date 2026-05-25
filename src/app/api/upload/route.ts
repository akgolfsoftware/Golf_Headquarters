/**
 * Generisk upload-endpoint.
 *
 * POST /api/upload
 * - Multipart-body med:
 *   - `bucket`: et av STORAGE_BUCKETS-verdiene
 *   - `file`: filen som lastes opp
 *   - `path` (valgfri): relativ sti inne i bucket (default <userId>/<timestamp>-<filename>)
 *
 * Returnerer { ok, path, url } eller { ok: false, error }.
 *
 * Autorisasjon:
 * - Bruker MÅ være innlogget.
 * - For staff-only buckets (drill-thumbnails, club-logos, reports, invoices)
 *   kreves ADMIN- eller COACH-rolle.
 * - For player-buckets (player-avatars, player-swing-videos) tillates kun
 *   spilleren selv (skriving til <userId>/-prefix) eller staff.
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  STORAGE_BUCKETS,
  type StorageBucket,
} from "@/lib/storage/buckets";
import { uploadFile } from "@/lib/storage/supabase-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STAFF_ONLY_BUCKETS: StorageBucket[] = [
  STORAGE_BUCKETS.DRILL_THUMBNAILS,
  STORAGE_BUCKETS.CLUB_LOGOS,
  STORAGE_BUCKETS.REPORTS,
  STORAGE_BUCKETS.INVOICES,
  STORAGE_BUCKETS.COACH_AVATARS,
];

const ALL_BUCKET_NAMES = Object.values(STORAGE_BUCKETS) as StorageBucket[];

function isValidBucket(value: string): value is StorageBucket {
  return ALL_BUCKET_NAMES.includes(value as StorageBucket);
}

function safeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "file";
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "unauthenticated" },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Forventet multipart/form-data" },
      { status: 400 },
    );
  }

  const bucketRaw = String(form.get("bucket") ?? "").trim();
  if (!isValidBucket(bucketRaw)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Ugyldig bucket. Tillatte: ${ALL_BUCKET_NAMES.join(", ")}`,
      },
      { status: 400 },
    );
  }
  const bucket: StorageBucket = bucketRaw;

  const fil = form.get("file");
  if (!(fil instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Ingen fil sendt." },
      { status: 400 },
    );
  }

  // Tilgangskontroll.
  const erStaff = user.role === "ADMIN" || user.role === "COACH";

  if (STAFF_ONLY_BUCKETS.includes(bucket) && !erStaff) {
    return NextResponse.json(
      { ok: false, error: "forbidden — krever COACH/ADMIN" },
      { status: 403 },
    );
  }

  // Bestem sti inne i bucket.
  const customPath = form.get("path");
  let path: string;
  if (typeof customPath === "string" && customPath.trim().length > 0) {
    path = customPath.trim().replace(/^\/+/, "");
    // For player-buckets: ikke-staff må holde seg innenfor sin egen prefix.
    if (
      !erStaff &&
      (bucket === STORAGE_BUCKETS.PLAYER_AVATARS ||
        bucket === STORAGE_BUCKETS.PLAYER_SWING_VIDEOS) &&
      !path.startsWith(`${user.id}/`) &&
      !path.startsWith(`users/${user.id}.`)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: `path må starte med "${user.id}/" for ikke-staff`,
        },
        { status: 403 },
      );
    }
  } else {
    const ts = Date.now();
    path = `${user.id}/${ts}-${safeFileName(fil.name)}`;
  }

  try {
    const result = await uploadFile({
      bucket,
      path,
      file: fil,
      upsert: false,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Opplasting feilet";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
