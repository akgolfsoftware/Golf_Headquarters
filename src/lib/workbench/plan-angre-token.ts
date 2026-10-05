import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
const row = z.object({ id: z.string(), updatedAt: z.string().datetime() }).strict();
const schema = z.object({ version: z.literal(1), actorId: z.string(), playerId: z.string(), expires: z.number(),
  rows: z.array(row).min(1).max(52), before: z.object({ date: z.string(), startMinute: z.number(), durationMinutes: z.number(), status: z.string(), localOverride: z.boolean() }).strict().optional() }).strict();
export type PlanAngreData = z.infer<typeof schema>;
function signature(data: string) {
  const key = process.env.WORKBENCH_UNDO_SECRET;
  if (!key || Buffer.byteLength(key, "utf8") < 32) throw new Error("Angre er ikke tilgjengelig i dette miljøet.");
  return createHmac("sha256", key).update(`workbench-plan-undo-v1:${data}`).digest();
}
export function planAngreTilgjengelig(): boolean {
  try { signature(""); return true; } catch { return false; }
}
export function signerPlanAngre(data: PlanAngreData) {
  const payload = Buffer.from(JSON.stringify(schema.parse(data))).toString("base64url");
  return `${payload}.${signature(payload).toString("base64url")}`;
}
export function lesPlanAngre(token: string, actorId: string): PlanAngreData | null {
  try {
    if (token.length > 20000) return null;
    const parts = token.split("."); if (parts.length !== 2) return null;
    const expected = signature(parts[0]), actual = Buffer.from(parts[1], "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const parsed = schema.safeParse(JSON.parse(Buffer.from(parts[0], "base64url").toString()));
    return parsed.success && parsed.data.actorId === actorId && parsed.data.expires > Date.now() ? parsed.data : null;
  } catch { return null; }
}
