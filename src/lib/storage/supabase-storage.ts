/**
 * Supabase Storage — generisk wrapper.
 *
 * Bruker service-role klienten for upload/delete (omgår RLS) — kalleren
 * MÅ derfor verifisere bruker-tilganger før denne funksjonen kalles.
 *
 * Eksisterende moduler (avatar.ts, video.ts) bruker buckets direkte for
 * å holde forretningslogikken samlet. Denne wrapperen er for nye flyter
 * der bucket-rute bestemmes ut fra parameter (f.eks. drill-thumbnails,
 * club-logos).
 */
import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
  STORAGE_BUCKETS,
  type StorageBucket,
  isPublicBucket,
} from "./buckets";

export type UploadInput = {
  bucket: StorageBucket;
  /** Relativ sti inne i bucket-en, f.eks. "users/abc123.jpg". */
  path: string;
  /** Innholdet — enten en File (web) eller en Buffer (server-side). */
  file: File | Buffer;
  /** MIME-type. Påkrevd hvis `file` er Buffer. Utledes fra File ellers. */
  contentType?: string;
  /** Overskriv eksisterende fil. Default false. */
  upsert?: boolean;
  /** Cache-Control-header. Default "3600". */
  cacheControl?: string;
};

export type UploadResult = {
  /** Sti inne i bucket-en (path som lagret). */
  path: string;
  /** Offentlig URL (kun for public buckets) eller signed URL (privat). */
  url: string;
};

/**
 * Last opp fil til en bucket. Validerer størrelse og MIME-type.
 * For private buckets returneres signed URL (1 time gyldig).
 */
export async function uploadFile(opts: UploadInput): Promise<UploadResult> {
  const { bucket, path, file, upsert = false, cacheControl = "3600" } = opts;

  // Utled MIME-type og bytes.
  let contentType: string | undefined;
  let bytes: Buffer;
  let size: number;

  if (file instanceof File) {
    contentType = opts.contentType ?? file.type;
    size = file.size;
    bytes = Buffer.from(await file.arrayBuffer());
  } else {
    if (!opts.contentType) {
      throw new Error("contentType er påkrevd når file er Buffer.");
    }
    contentType = opts.contentType;
    size = file.byteLength;
    bytes = file;
  }

  // Validering — størrelse.
  const maxSize = MAX_FILE_SIZES[bucket];
  if (size === 0) {
    throw new Error("Tom fil — ingenting å laste opp.");
  }
  if (size > maxSize) {
    const mb = Math.round(maxSize / 1024 / 1024);
    throw new Error(`Filen er for stor. Maksgrense: ${mb} MB.`);
  }

  // Validering — MIME-type.
  const allowed = ALLOWED_MIME_TYPES[bucket];
  if (!contentType || !allowed.includes(contentType)) {
    throw new Error(
      `MIME-type "${contentType}" er ikke tillatt for "${bucket}". Tillatte: ${allowed.join(", ")}`,
    );
  }

  const sb = supabaseAdmin();
  const { error } = await sb.storage.from(bucket).upload(path, bytes, {
    contentType,
    upsert,
    cacheControl,
  });

  if (error) {
    throw new Error(`Opplasting til "${bucket}" feilet: ${error.message}`);
  }

  const url = await resolveUrl(bucket, path);
  return { path, url };
}

/**
 * Slett en fil fra en bucket. Kaster ikke hvis fila ikke finnes.
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string,
): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.storage.from(bucket).remove([path]);
  if (error) {
    // Best-effort — logg, men ikke kast.
    console.warn(`[storage] Sletting feilet for ${bucket}/${path}:`, error);
  }
}

/**
 * Generer signed URL for en privat fil (default 1 time gyldig).
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds: number = 3600,
): Promise<string> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(
      `Kunne ikke generere signed URL for ${bucket}/${path}: ${error?.message ?? "ukjent feil"}`,
    );
  }
  return data.signedUrl;
}

/**
 * Hent offentlig URL for en fil i en public bucket (caching-vennlig).
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  if (!isPublicBucket(bucket)) {
    throw new Error(
      `"${bucket}" er ikke en public bucket — bruk getSignedUrl() i stedet.`,
    );
  }
  const sb = supabaseAdmin();
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Internt: bestem hvilken URL-strategi vi skal bruke for en bucket.
 */
async function resolveUrl(
  bucket: StorageBucket,
  path: string,
): Promise<string> {
  if (isPublicBucket(bucket)) {
    return getPublicUrl(bucket, path);
  }
  return getSignedUrl(bucket, path, 3600);
}

export { STORAGE_BUCKETS };
export type { StorageBucket };
