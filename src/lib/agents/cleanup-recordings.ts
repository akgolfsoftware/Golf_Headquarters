// cleanup-recordings: cron daglig 03:00 UTC. Sletter lydfiler fra Supabase
// Storage for SessionRecording der retentionUntil < now(). Behold transcript
// + aiAnalysis i Prisma evig — kun lyden slettes.
//
// Nuller lydhenvisninger først etter bekreftet sletting. Utdaterte opptak
// undersøkes også uten ledger/audioUrl, fordi avbrutte fragmenter kan finnes.

import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { audit } from "@/lib/audit";
import type { AgentResult } from "./agent-runner";
import { runAgent } from "./agent-runner";
import { logError } from "@/lib/error-tracking";
import { checkedRecordingAudioPath, isRecordingAudioName, isRecordingFragmentName, recordingFragmentFolder, recordingStoragePrefix } from "@/lib/recording/fragment-cleanup-contract";

export const AGENT_NAME = "cleanup-recordings";

const BUCKET = "coaching-recordings";
const BATCH_SIZE = 100;
const LIST_PAGE_SIZE = 1000;
type RecordingStorage = ReturnType<ReturnType<typeof supabaseAdmin>["storage"]["from"]>;

async function listAll(storage: RecordingStorage, prefix: string) {
  const entries: { name: string }[] = [];
  for (let offset = 0; ; offset += LIST_PAGE_SIZE) {
    const listed = await storage.list(prefix, { limit: LIST_PAGE_SIZE, offset, sortBy: { column: "name", order: "asc" } });
    if (listed.error || !listed.data) throw new Error("Kunne ikke liste opptakets lydfiler");
    entries.push(...listed.data);
    if (listed.data.length < LIST_PAGE_SIZE) return entries;
  }
}

async function recordingAudioPaths(storage: RecordingStorage, rec: { id: string; uploadedById: string; audioUrl: string | null; chunks: unknown }) {
  const prefix = recordingStoragePrefix(rec.uploadedById, rec.id);
  const paths = new Set<string>();
  if (rec.audioUrl) paths.add(checkedRecordingAudioPath(prefix, rec.audioUrl));
  if (!Array.isArray(rec.chunks)) throw new Error("Ugyldig lydledger i opptaket");
  for (const chunk of rec.chunks) {
    if (!chunk || typeof chunk !== "object" || !("path" in chunk) || typeof chunk.path !== "string") throw new Error("Ugyldig lydledger i opptaket");
    paths.add(checkedRecordingAudioPath(prefix, chunk.path));
  }
  // List alt før fjerning: en feil på en senere side skal ikke starte sletting.
  const root = await listAll(storage, prefix);
  for (const entry of root) if (isRecordingAudioName(entry.name)) paths.add(`${prefix}/${entry.name}`);
  if (root.some(entry => entry.name === "fragments")) {
    for (const entry of await listAll(storage, `${prefix}/fragments`)) {
      const folder = recordingFragmentFolder(entry.name);
      if (!folder) continue;
      for (const part of await listAll(storage, `${prefix}/fragments/${entry.name}`)) {
        if (isRecordingFragmentName(part.name, folder)) paths.add(`${prefix}/fragments/${entry.name}/${part.name}`);
      }
    }
  }
  return [...paths];
}

export async function runCleanupRecordings(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const now = new Date();
    const storage = supabaseAdmin().storage.from(BUCKET);
    let cursor: string | undefined;
    let totalt = 0;
    let slettet = 0;
    let feilet = 0;
    let oversett = 0;
    let filerSlettet = 0;
    const feilDetaljer: { id: string; feil: string }[] = [];

    // Ingen audioUrl-filter: også ABORTED og fragmenter uten ledger må finnes.
    // Søk videre etter siste ID, så allerede ryddede rader ikke sulter senere rader.
    for (;;) {
      const utdaterte = await prisma.sessionRecording.findMany({
        where: { retentionUntil: { lt: now }, ...(cursor ? { id: { gt: cursor } } : {}) },
        select: { id: true, uploadedById: true, retentionUntil: true, audioUrl: true, chunks: true },
        orderBy: { id: "asc" }, take: BATCH_SIZE,
      });
      if (!utdaterte.length) break;
      for (const rec of utdaterte) {
        totalt++;
        try {
          if (!rec.retentionUntil || rec.retentionUntil >= now) { oversett++; continue; }
          const pathsToDelete = await recordingAudioPaths(storage, rec);
          if (!pathsToDelete.length) { oversett++; continue; }

          for (let offset = 0; offset < pathsToDelete.length; offset += BATCH_SIZE) {
            const batch = pathsToDelete.slice(offset, offset + BATCH_SIZE);
            const { error: rmErr } = await storage.remove(batch);
            if (rmErr) {
              throw new Error("Kunne ikke fjerne opptakets lydfiler");
            }
            filerSlettet += batch.length;
          }

          // Behold transcript + aiAnalysis. Null ut kun storage-referansene.
          await prisma.sessionRecording.update({
            where: { id: rec.id },
            data: {
              audioUrl: null,
              chunks: [],
            },
          });

          await audit({
            actorId: null,
            action: "recording.audio_deleted",
            target: `SessionRecording:${rec.id}`,
            metadata: {
              paths: pathsToDelete,
              antall: pathsToDelete.length,
            },
          });

          slettet++;
        } catch (error) {
          const melding = error instanceof Error ? error.message : String(error);
          await logError({
            context: "agents.cleanupRecordings",
            error,
            meta: { recordingId: rec.id },
            severity: "warn",
          });
          feilDetaljer.push({ id: rec.id, feil: melding });
          feilet++;
        }
      }
      cursor = utdaterte[utdaterte.length - 1].id;
      if (utdaterte.length < BATCH_SIZE) break;
    }

    console.info(
      `[cleanup-recordings] totalt=${totalt} slettet=${slettet} feilet=${feilet}`,
    );

    return {
      output: {
        totalt,
        slettet,
        feilet,
        oversett,
        filerSlettet,
        feilDetaljer: feilDetaljer.slice(0, 10),
      },
    };
  });
}
