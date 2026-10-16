"use server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { canReadOwnGroupCopy } from "./group-scope";
import { mapSession, type WbRow } from "./wb-map";
import type { WbResultat } from "./wb-actions";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import { osloInstant } from "@/lib/jarvis/dagen";
import { type SessionExecution, ExecutionCommandSchema, jsonObject, readSessionExecution, transitionSessionExecution } from "./wb-session-life";

// Samme eierskap, faktisk trenerrelasjon, samtykke- og gruppegrenser som wb-actions.
// Vakt er intern; aldri en eksponert serverhandling som returnerer rå databaserader.
async function hentMedTilgang(sessionId:string):Promise<{row:WbRow;viewer:{id:string;role:string}}|{feil:string}> {
  const viewer=await requirePortalUser();
  const row=await prisma.workbenchSession.findUnique({where:{id:sessionId},include:{drills:true}});
  if(!row)return {feil:"Fant ikke økten."};
  if(viewer.id!==row.playerId && (!(viewer.role==="COACH"||viewer.role==="ADMIN")||!(await harCoachTilgangTilSpiller(viewer,row.playerId)))) return {feil:"Ingen tilgang til denne spilleren."};
  if(viewer.id===row.playerId&&!canReadOwnGroupCopy(row))return {feil:"Ingen tilgang til denne spilleren."};
  if(row.groupId&&!row.sourceGroupSessionId&&/^wb-group-[a-f0-9]{64}$/.test(row.id))return {feil:"Bruk gruppeplanen for gruppeoriginalen."};
  return {row,viewer};
}
async function lagreOgHent(sessionId:string):Promise<WbResultat<WorkbenchSession>> {
  const access=await hentMedTilgang(sessionId);
  if("feil"in access)return {ok:false,error:access.feil};
  revalidatePath(`/admin/workbench/${access.row.playerId}`);revalidatePath("/portal/planlegge/workbench");revalidatePath("/portal");
  return {ok:true,data:mapSession(access.row)};
}
/** Leser bare autorisert gjennomføringshistorikk for den konkrete økten. */
export async function loadSessionExecution(sessionId: string) {
  const access = await hentMedTilgang(sessionId);
  if ("feil" in access) return { ok: false as const, error: access.feil };
  const raw = jsonObject(access.row.liveSnapshot);
  return { ok: true as const, data: {
    execution: readSessionExecution(access.row.liveSnapshot),
    unknownVersion: raw?.execution !== undefined && !readSessionExecution(raw),
    updatedAt: access.row.updatedAt.toISOString(),
    session: mapSession(access.row),
  } };
}

/** Absolutte resultater og versjonsvakt: retry skriver aldri over nyere historikk. */
export async function mutateSessionExecution(input: unknown): Promise<WbResultat<WorkbenchSession> & { execution?: SessionExecution | null }> {
  const parsed = ExecutionCommandSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig gjennomføring. Oppgi gyldige tall og årsak ved etterregistrering eller avbrudd." };
  const access = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in access) return { ok: false, error: access.feil };
  const row = access.row;
  if (row.isTemplate || row.hiddenByPlayer || row.needsPlayerApproval || row.approvalStatus === "REJECTED") return { ok: false, error: "Økten må være synlig og godkjent før gjennomføring." };
  const now = new Date();
  if (parsed.data.action === "RECORD" && osloInstant(row.date.getUTCFullYear(), row.date.getUTCMonth() + 1, row.date.getUTCDate(), Math.floor(row.startMinute / 60), row.startMinute % 60).getTime() > now.getTime()) {
    return { ok: false, error: "En fremtidig økt kan ikke etterregistreres." };
  }
  try {
    const next = transitionSessionExecution(parsed.data, row, access.viewer.id, now.toISOString());
    if (next.retry) return { ok: true, data: mapSession(row), execution: readSessionExecution(row.liveSnapshot) };
    if (row.updatedAt.toISOString() !== parsed.data.expectedUpdatedAt) return { ok: false, error: "Økten ble endret samtidig. Last inn på nytt før du registrerer." };
    const result = await prisma.workbenchSession.updateMany({
      where: { id: row.id, playerId: row.playerId, status: row.status, updatedAt: row.updatedAt,
        isTemplate: false, hiddenByPlayer: false, needsPlayerApproval: false },
      data: { status: next.status, actualMinutes: next.actualMinutes, perceivedEffort: next.perceivedEffort,
        liveSnapshot: next.snapshot as Prisma.InputJsonValue },
    });
    if (result.count !== 1) return { ok: false, error: "Økten ble endret samtidig. Last inn på nytt før du registrerer." };
    const saved = await lagreOgHent(row.id);
    return { ...saved, execution: readSessionExecution(next.snapshot) };
  } catch (error) {
    return { ok: false, error: error instanceof Error && /gjennomføring|registrering|pause|pågående|Utkast|historikk|Forespørselen/.test(error.message)
      ? error.message : "Gjennomføringen kunne ikke lagres. Ingen bekreftelse er gitt." };
  }
}
