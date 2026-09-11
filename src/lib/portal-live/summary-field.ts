import { Prisma } from "@/generated/prisma/client";

/**
 * Kalles først etter verifyAccess. Oppdaterer bare sitt eget felt atomisk,
 * slik at samtidig lagring av vurdering/notater beholder resten av sammendraget.
 * https://www.postgresql.org/docs/current/functions-json.html (jsonb || jsonb).
 */
export function summaryFieldUpdate(sessionId: string, field: "dineOrd" | "spillerVurdering", value: Prisma.InputJsonObject) {
  return Prisma.sql`
    UPDATE "training_sessions_v2"
    SET "completedSummary" =
      (CASE WHEN jsonb_typeof("completedSummary") = 'object'
        THEN "completedSummary" ELSE '{}'::jsonb END) || ${JSON.stringify({ [field]: value })}::jsonb,
      "updatedAt" = NOW()
    WHERE "id" = ${sessionId} AND "status" = 'COMPLETED'
  `;
}
