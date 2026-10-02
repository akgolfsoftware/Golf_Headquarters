import { Prisma } from "@/generated/prisma/client";

/**
 * Kalles først etter verifyAccess. Oppdaterer bare sitt eget felt atomisk,
 * slik at samtidig lagring av vurdering/notater beholder resten av sammendraget.
 * merge=true endrer bare de oppgitte nøklene i det valgte objektfeltet.
 * https://www.postgresql.org/docs/current/functions-json.html (jsonb || jsonb).
 */
export function summaryFieldUpdate(sessionId: string, field: "dineOrd" | "spillerVurdering" | "etterOkt", value: Prisma.InputJsonObject, merge = false) {
  if (merge) return Prisma.sql`
    UPDATE "training_sessions_v2"
    SET "completedSummary" =
      (CASE WHEN jsonb_typeof("completedSummary") = 'object'
        THEN "completedSummary" ELSE '{}'::jsonb END) ||
      jsonb_build_object(${field}::text,
        (CASE WHEN jsonb_typeof("completedSummary" -> ${field}) = 'object'
          THEN "completedSummary" -> ${field} ELSE '{}'::jsonb END) || ${JSON.stringify(value)}::jsonb),
      "updatedAt" = NOW()
    WHERE "id" = ${sessionId} AND "status" = 'COMPLETED'
  `;
  return Prisma.sql`
    UPDATE "training_sessions_v2"
    SET "completedSummary" =
      (CASE WHEN jsonb_typeof("completedSummary") = 'object'
        THEN "completedSummary" ELSE '{}'::jsonb END) || ${JSON.stringify({ [field]: value })}::jsonb,
      "updatedAt" = NOW()
    WHERE "id" = ${sessionId} AND "status" = 'COMPLETED'
  `;
}
