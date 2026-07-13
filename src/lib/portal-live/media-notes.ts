/**
 * Lesing av media-notater (video + bilde) fra øktenes JSON-felt
 * (TrainingSessionV2.completedSummary / TrainingPlanSession.liveSnapshot).
 * Egen fil (IKKE "use server") så summary-siden kan importere synkront.
 * Zod-validert per prosjektregelen for JSON-blobs.
 */

import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

const VideoNoteSchema = z.object({
  drillId: z.string().nullable(),
  videoUrl: z.string(),
  ts: z.string(),
});
const ImageNoteSchema = z.object({
  drillId: z.string().nullable(),
  imageUrl: z.string(),
  comment: z.string().nullable(),
  ts: z.string(),
});

export type MediaNote = {
  type: "video" | "image";
  url: string;
  drillId: string | null;
  comment: string | null;
  ts: string;
};

/** Samlet, tidssortert medialiste fra et økt-JSON-felt. Tåler alt søppel. */
export function lesMediaNotater(raw: Prisma.JsonValue | null | undefined): MediaNote[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const obj = raw as Record<string, unknown>;
  const videoer = z.array(VideoNoteSchema).safeParse(obj.videoNotes);
  const bilder = z.array(ImageNoteSchema).safeParse(obj.imageNotes);
  const media: MediaNote[] = [
    ...(videoer.success
      ? videoer.data.map((v) => ({ type: "video" as const, url: v.videoUrl, drillId: v.drillId, comment: null, ts: v.ts }))
      : []),
    ...(bilder.success
      ? bilder.data.map((b) => ({ type: "image" as const, url: b.imageUrl, drillId: b.drillId, comment: b.comment, ts: b.ts }))
      : []),
  ];
  return media.sort((a, b) => a.ts.localeCompare(b.ts));
}
