import { z } from "zod";
import { TnSaveSchema, type TnSaveInput, type TnSaveResult } from "./tn-session";
import { tnVersion, type TnProtocol } from "./tn-catalog";
import { tnValidate, type TnValues } from "./tn-scoring";

export class TnInputError extends Error {}
export type TnRaw = Record<string, Record<string, string>>;
export const TnDraftSchema = z.object({
  key: z.string(), ownerId: z.string(), sessionId: z.string().uuid(),
  protocolId: z.string(), version: z.string(), count: z.number().int(),
  token: z.string().uuid(), revision: z.number().int().nonnegative(),
  localRevision: z.number().int().nonnegative(), syncedRevision: z.number().int(),
  raw: z.record(z.string(), z.record(z.string(), z.string().max(200))), notes: z.string().max(2000),
  pending: z.object({ input: TnSaveSchema, localRevision: z.number().int() }).nullable(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "ABORTED"]), updatedAt: z.number(),
});
export type TnDraft = z.infer<typeof TnDraftSchema>;
export const tnDraftKey = (owner: string, session: string) => `${encodeURIComponent(owner)}:${session}`;
export function tnRaw(values: TnValues): TnRaw {
  return Object.fromEntries(Object.entries(values).map(([k, row]) => [k, Object.fromEntries(Object.entries(row).map(([f, v]) => [f, v == null ? "" : String(v).replace(".", ",")]))]));
}
export function tnReadRaw(p: TnProtocol, raw: TnRaw): { values: TnValues; error: string | null } {
  const values: TnValues = {}; let error: string | null = null;
  p.rows.forEach((row, i) => {
    values[String(i + 1)] = Object.fromEntries(row.fields.map(f => {
      const value = raw[String(i + 1)]?.[f.key]?.trim() ?? "";
      if (!value) return [f.key, null];
      if (f.choices) return [f.key, value];
      const n = Number(value.replace("−", "-").replace(",", "."));
      if (!Number.isFinite(n)) error = "Skriv gyldige tall. Komma og punktum kan brukes.";
      return [f.key, Number.isFinite(n) ? n : null];
    }));
  });
  return { values, error };
}
export function tnNewDraft(ownerId: string, sessionId: string, p: TnProtocol, revision = 0, values: TnValues = {}, notes = ""): TnDraft {
  return { key: tnDraftKey(ownerId, sessionId), ownerId, sessionId, protocolId: p.id, version: tnVersion(p), count: p.rows.length,
    token: crypto.randomUUID(), revision, localRevision: 0, syncedRevision: 0, raw: tnRaw(values), notes, pending: null, status: "IN_PROGRESS", updatedAt: Date.now() };
}
/** Freeze one operation before sending. A retry must send exactly this snapshot. */
export function tnPrepare(draft: TnDraft, p: TnProtocol, intent: TnSaveInput["intent"]): TnDraft {
  if (draft.pending) return draft;
  if (draft.status !== "IN_PROGRESS") throw new Error("Testen er avsluttet.");
  if (intent === "draft" && draft.localRevision === draft.syncedRevision) return draft;
  const { values, error } = tnReadRaw(p, draft.raw);
  const validation = error ?? tnValidate(p, values, intent === "complete");
  if (validation) throw new TnInputError(validation);
  return { ...draft, pending: { localRevision: draft.localRevision, input: {
    ownerId: draft.ownerId, sessionId: draft.sessionId, version: tnVersion(p), protocolId: p.id, count: p.rows.length,
    revision: draft.revision, mutationId: crypto.randomUUID(), values, notes: draft.notes, intent,
  } } };
}
/** A response acknowledges the sent snapshot only. Later edits remain queued. */
export function tnAcknowledge(draft: TnDraft, mutationId: string, response: Extract<TnSaveResult, { ok: true }>): TnDraft {
  if (!draft.pending || draft.pending.input.mutationId !== mutationId) throw new Error("Lagringskvitteringen tilhører en annen sending.");
  if (draft.pending.input.intent !== "draft" && draft.pending.localRevision !== draft.localRevision) throw new Error("Lokale endringer etter avslutning må kontrolleres mot lagret resultat.");
  return { ...draft, revision: response.revision, syncedRevision: draft.pending.localRevision,
    status: draft.pending.input.intent === "complete" ? "COMPLETED" : draft.pending.input.intent === "abort" ? "ABORTED" : "IN_PROGRESS", pending: null };
}
