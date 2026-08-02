// media-lofte: selvgående agent som finner øvelser uten video/bilde i banken
// og foreslår en YouTube-video per øvelse (best-effort, første relevante
// treff). Forslag lagres som CaddieDraft (PENDING) og vises på
// /admin/drills/forslag der coach godkjenner (→ videoUrl settes på
// ExerciseDefinition) eller avviser med ett klikk — samme godkjenningsvei
// som drill-forslag-agent, bare et annet toolName.
//
// Kjører i batcher (BATCH_STORRELSE per kjøring) for å holde YouTube-kvote
// og godkjenningskø håndterlig — ukentlig cron spiser seg gjennom
// video-etterslepet over tid uten å oversvømme coachen på én gang.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { isYoutubeEnabled, searchYoutube } from "./youtube-search";

export const AGENT_NAME = "media-lofte";
export const MEDIA_DRAFT_TOOL = "suggestDrillVideo";

const BATCH_STORRELSE = 15;

const SKILL_AREA_NB: Record<string, string> = {
  TEE_TOTAL: "driver tee shot",
  TILNAERMING: "iron approach shot",
  AROUND_GREEN: "chipping short game",
  PUTTING: "putting",
  SPILL: "course management",
};

export async function runMediaLofte(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    if (!isYoutubeEnabled()) {
      return { output: { status: "youtube-av", melding: "YOUTUBE_API_KEY er ikke satt." } };
    }

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", deletedAt: null },
      select: { id: true },
    });
    if (admins.length === 0) {
      return { output: { status: "ingen-admin", melding: "Ingen ADMIN-brukere å foreslå til." } };
    }

    // Øvelser som allerede har et ubehandlet forslag — hopp over (ikke lag
    // duplikater når batch-kjøringen fortsetter etterslepet neste uke).
    const alleredeForeslatt = await prisma.caddieDraft.findMany({
      where: { toolName: MEDIA_DRAFT_TOOL, status: "PENDING" },
      select: { toolInput: true },
    });
    const foreslattIder = new Set(
      alleredeForeslatt
        .map((d) => (d.toolInput as { exerciseId?: string } | null)?.exerciseId)
        .filter((id): id is string => !!id),
    );

    const kandidater = await prisma.exerciseDefinition.findMany({
      where: { videoUrl: null, imageUrl: null },
      select: { id: true, name: true, pyramidArea: true, skillArea: true },
      orderBy: { createdAt: "asc" },
      take: BATCH_STORRELSE + foreslattIder.size,
    });
    const batch = kandidater.filter((d) => !foreslattIder.has(d.id)).slice(0, BATCH_STORRELSE);

    if (batch.length === 0) {
      return {
        output: {
          status: "ingen-nye",
          melding: "Alle øvelser uten media har allerede et ventende forslag, eller banken er dekket.",
          ventendeForslag: foreslattIder.size,
        },
      };
    }

    let lagret = 0;
    let funnetVideo = 0;
    for (const d of batch) {
      const hint = d.skillArea ? SKILL_AREA_NB[d.skillArea] : null;
      const sok = `${d.name} golf ${hint ?? "drill"}`.trim();
      const treff = await searchYoutube(sok, 3);
      const beste = treff[0] ?? null;
      if (!beste) continue;
      funnetVideo++;

      for (const admin of admins) {
        await prisma.caddieDraft.create({
          data: {
            userId: admin.id,
            conversationId: "media-lofte-agent",
            toolCallId: `media_${d.id}_${admin.id.slice(-6)}`,
            toolName: MEDIA_DRAFT_TOOL,
            toolInput: {
              exerciseId: d.id,
              exerciseName: d.name,
              videoUrl: beste.url,
              videoTitle: beste.title,
              videoChannel: beste.channel,
            },
            previewText: `${d.name} — foreslått video: «${beste.title}» (${beste.channel})`,
            status: "PENDING",
          },
        });
        lagret++;
      }
    }

    return {
      output: {
        status: "ok",
        kandidaterVurdert: batch.length,
        videoFunnet: funnetVideo,
        forslagLagret: lagret,
        coacher: admins.length,
        ventendeFraFor: foreslattIder.size,
      },
    };
  });
}
