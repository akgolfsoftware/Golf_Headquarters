/**
 * Opprett Supabase Storage-buckets idempotent.
 *
 * Kjøres én gang etter at nye buckets legges til i `src/lib/storage/buckets.ts`.
 *
 * Krever:
 * - SUPABASE_URL eller NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Bruk:
 *   npx tsx scripts/create-storage-buckets.ts
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

import {
  MAX_FILE_SIZES,
  PUBLIC_BUCKETS,
  STORAGE_BUCKETS,
  ALLOWED_MIME_TYPES,
  type StorageBucket,
} from "../src/lib/storage/buckets";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const url =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error("Mangler SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL i miljø.");
  process.exit(1);
}
if (!key) {
  console.error("Mangler SUPABASE_SERVICE_ROLE_KEY i miljø.");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureBucket(name: StorageBucket) {
  const isPublic = PUBLIC_BUCKETS.includes(name);
  const fileSizeLimit = MAX_FILE_SIZES[name];
  const allowed = ALLOWED_MIME_TYPES[name] as readonly string[];

  // Sjekk om bucket finnes.
  const { data: existing } = await admin.storage.getBucket(name);

  if (existing) {
    // Oppdater public-flagg, file-size og mime-types ved behov.
    const { error } = await admin.storage.updateBucket(name, {
      public: isPublic,
      fileSizeLimit,
      allowedMimeTypes: [...allowed],
    });
    if (error) {
      console.warn(`[bucket:${name}] update feilet: ${error.message}`);
    } else {
      console.log(
        `[bucket:${name}] OK (oppdatert) — public=${isPublic}, max=${Math.round(fileSizeLimit / 1024 / 1024)}MB`,
      );
    }
    return;
  }

  const { error } = await admin.storage.createBucket(name, {
    public: isPublic,
    fileSizeLimit,
    allowedMimeTypes: [...allowed],
  });
  if (error) {
    console.error(`[bucket:${name}] create feilet: ${error.message}`);
    return;
  }
  console.log(
    `[bucket:${name}] OPPRETTET — public=${isPublic}, max=${Math.round(fileSizeLimit / 1024 / 1024)}MB`,
  );
}

async function main() {
  console.log("Oppretter/oppdaterer Supabase Storage-buckets ...\n");
  const buckets = Object.values(STORAGE_BUCKETS) as StorageBucket[];
  for (const bucket of buckets) {
    await ensureBucket(bucket);
  }
  console.log("\nFerdig.");
}

main().catch((err) => {
  console.error("Skript feilet:", err);
  process.exit(1);
});
