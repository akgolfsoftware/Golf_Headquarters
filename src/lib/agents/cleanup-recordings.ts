// cleanup-recordings: cron daglig 03:00 UTC. Sletter lydfiler fra Supabase
// Storage for SessionRecording der retentionUntil < now(). Behold transcript
// + aiAnalysis i Prisma evig — kun lyden slettes.
//
// Idempotent: setter audioUrl=null + chunks=[] etter sletting, slik at neste
// kjøring ikke prøver igjen.

import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { audit } from "@/lib/audit";
import type { AgentResult } from "./agent-runner";
import { runAgent } from "./agent-runner";

export const AGENT_NAME = "cleanup-recordings";

const BUCKET = "coaching-recordings";
const BATCH_SIZE = 100;

type ChunkEntry = { idx: number; path: string; size: number };

function extractChunkPaths(chunks: unknown): string[] {
  if (!Array.isArray(chunks)) return [];
  const paths: string[] = [];
  for (const c of chunks) {
    if (
      c !== null &&
      typeof c === "object" &&
      "path" in c &&
      typeof (c as ChunkEntry).path === "string"
    ) {
      paths.push((c as ChunkEntry).path);
    }
  }
  return paths;
}

export async function runCleanupRecordings(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    // Finn utdaterte opptak — har passert retention og har fortsatt lyd lagret.
    const utdaterte = await prisma.sessionRecording.findMany({
      where: {
        retentionUntil: { lt: new Date() },
        audioUrl: { not: null },
      },
      select: {
        id: true,
        audioUrl: true,
        chunks: true,
      },
      take: BATCH_SIZE,
    });

    if (utdaterte.length === 0) {
      return {
        output: { totalt: 0, slettet: 0, feilet: 0 },
      };
    }

    const supabase = supabaseAdmin();
    let slettet = 0;
    let feilet = 0;
    const feilDetaljer: { id: string; feil: string }[] = [];

    for (const rec of utdaterte) {
      try {
        const pathsToDelete: string[] = [];
        if (rec.audioUrl) pathsToDelete.push(rec.audioUrl);
        pathsToDelete.push(...extractChunkPaths(rec.chunks));

        if (pathsToDelete.length > 0) {
          const { error: rmErr } = await supabase.storage
            .from(BUCKET)
            .remove(pathsToDelete);

          if (rmErr) {
            throw new Error(`Storage-feil: ${rmErr.message}`);
          }
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
      } catch (err) {
        const melding = err instanceof Error ? err.message : String(err);
        console.error("[cleanup-recordings] feil for", rec.id, melding);
        feilDetaljer.push({ id: rec.id, feil: melding });
        feilet++;
      }
    }

    console.info(
      `[cleanup-recordings] totalt=${utdaterte.length} slettet=${slettet} feilet=${feilet}`,
    );

    return {
      output: {
        totalt: utdaterte.length,
        slettet,
        feilet,
        feilDetaljer: feilDetaljer.slice(0, 10),
      },
    };
  });
}
