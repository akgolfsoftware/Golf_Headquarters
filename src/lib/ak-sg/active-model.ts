/** Server-only reader. The credential must only inherit ak_sg_app_reader. */

import "server-only";
import { Pool } from "pg";
import { AkSgCalculator, type AkSgBaselinePoint, type AkSgLie } from "@/lib/domain/ak-sg";

let pool: Pool | undefined;

function readerPool(): Pool | null {
  const connectionString = process.env.AK_SG_READER_DATABASE_URL;
  if (!connectionString) return null;
  pool ??= new Pool({ connectionString, max: 2, connectionTimeoutMillis: 5_000 });
  return pool;
}

/** Missing configuration or unpublished model means no customer-facing SG. */
export async function loadActiveAkSgModel(): Promise<AkSgCalculator | null> {
  const source = readerPool();
  if (!source) return null;

  const client = await source.connect();
  try {
    const identity = await client.query<{
      allowed_role: boolean;
      is_superuser: boolean;
      bypasses_rls: boolean;
      raw_schema_present: boolean;
    }>(`
      SELECT pg_has_role(current_user, 'ak_sg_app_reader', 'member') AS allowed_role,
             r.rolsuper AS is_superuser,
             r.rolbypassrls AS bypasses_rls,
             EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'external_raw') AS raw_schema_present
        FROM pg_roles r WHERE r.rolname = current_user
    `);
    const role = identity.rows[0];
    if (!role?.allowed_role || role.is_superuser || role.bypasses_rls || role.raw_schema_present) {
      throw new Error("AK SG-leserrollen er ikke isolert fra kildedata");
    }

    const result = await client.query<{
      version_id: string;
      lie: AkSgLie;
      distance_m: number;
      expected_strokes: number;
    }>(`
      SELECT b.version_id::text, b.lie,
             b.distance_m::double precision AS distance_m,
             b.expected_strokes::double precision AS expected_strokes
        FROM app_public.sg_baselines b
        JOIN app_public.sg_active_model a ON a.version_id = b.version_id
       WHERE a.singleton
       ORDER BY b.lie, b.distance_m
    `);
    if (result.rows.length === 0) return null;
    const versionId = result.rows[0].version_id;
    if (result.rows.some((row) => row.version_id !== versionId)) {
      throw new Error("AK SG-modellen har blandede versjoner");
    }
    const points: AkSgBaselinePoint[] = result.rows.map((row) => ({
      lie: row.lie,
      distanceM: row.distance_m,
      expectedStrokes: row.expected_strokes,
    }));
    return new AkSgCalculator(versionId, points);
  } finally {
    client.release();
  }
}
