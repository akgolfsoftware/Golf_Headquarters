/** Provision only the private TN test-photo bucket.
 * Set TN_TEST_PHOTOS_EXPECT_PROJECT_REF to the verified project ref before run.
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { STORAGE_BUCKETS, MAX_FILE_SIZES, ALLOWED_MIME_TYPES } from "../src/lib/storage/buckets";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const expectedRef = process.env.TN_TEST_PHOTOS_EXPECT_PROJECT_REF;
if (!url || !key || !expectedRef) throw new Error("SUPABASE_URL, service-role key og TN_TEST_PHOTOS_EXPECT_PROJECT_REF må være satt.");
const hostRef = new URL(url).hostname.split(".")[0];
if (hostRef !== expectedRef) throw new Error("Supabase-prosjektet samsvarer ikke med forventet project ref.");

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const bucket = STORAGE_BUCKETS.TN_TEST_PHOTOS;
const settings = {
  public: false,
  fileSizeLimit: MAX_FILE_SIZES[bucket],
  allowedMimeTypes: [...ALLOWED_MIME_TYPES[bucket]],
};
const existing = await admin.storage.getBucket(bucket);
const result = existing.data
  ? await admin.storage.updateBucket(bucket, settings)
  : await admin.storage.createBucket(bucket, settings);
if (result.error) throw new Error("Kunne ikke opprette eller kontrollere den private testbilde-bucketen.");
console.log(`Bucket ${bucket} er privat og begrenset til normaliserte WebP-bilder.`);
