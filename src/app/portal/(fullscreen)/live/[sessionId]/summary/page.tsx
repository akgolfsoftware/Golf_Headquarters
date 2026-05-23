/**
 * PlayerHQ · Live-økt summary (sesjon 2 · pixel-perfect)
 *
 * Spec: BATCH PR7 · Skjerm 7.3
 * - Totaler: tid + reps per kategori + hit-rate
 * - Per drill accordion: faktisk vs mål + TM-data + notater + video-thumbnails
 * - Selvevaluering 1-5 stjerner
 * - "Send til Anders"-CTA + "Lagre uten å sende"
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { SummaryV2Client, type SummaryV2Data } from "./summary-v2-client";

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;

  // Stub-data inntil reell freezeSessionSummary er på plass
  const data: SummaryV2Data = {
    sessionId,
    title: "Wedge-presisjon 50–80m",
    coachName: "Anders Kristiansen",
    durationMin: 62,
    plannedMin: 60,
    totalReps: { dry: 32, lav: 56, full: 48 },
    plannedReps: { dry: 30, lav: 60, full: 50 },
    hitRate: 0.71,
    pyrTotals: [
      { area: "TEK", reps: 88, pct: 65 },
      { area: "SLAG", reps: 30, pct: 22 },
      { area: "SPILL", reps: 18, pct: 13 },
    ],
    drills: [
      {
        id: "d1",
        index: 1,
        name: "Pitch 50–80m · lav trajectory",
        pyramidArea: "TEK",
        actual: { dry: 12, lav: 18, full: 12 },
        target: { dry: 10, lav: 20, full: 10 },
        tm: { smashFactor: "1.41", ballSpeed: "118 mph", launchAngle: "26.4°" },
        notes: "God kontakt på 70-yard. Litt for mye spin på 60m.",
        videoCount: 2,
      },
      {
        id: "d2",
        index: 2,
        name: "Iron CS70 → CS80",
        pyramidArea: "TEK",
        actual: { dry: 10, lav: 18, full: 14 },
        target: { dry: 10, lav: 20, full: 15 },
        tm: { smashFactor: "1.43", ballSpeed: "142 mph", launchAngle: "18.8°" },
        notes: "",
        videoCount: 1,
      },
      {
        id: "d3",
        index: 3,
        name: "Putting 0–3m",
        pyramidArea: "SLAG",
        actual: { dry: 0, lav: 30, full: 0 },
        target: { dry: 0, lav: 30, full: 0 },
        tm: null,
        notes: "26 / 30 trykk. Bedre tempo etter pause.",
        videoCount: 0,
      },
      {
        id: "d4",
        index: 4,
        name: "Spillsim · Tee til green",
        pyramidArea: "SPILL",
        actual: { dry: 0, lav: 0, full: 18 },
        target: { dry: 0, lav: 0, full: 18 },
        tm: null,
        notes: "",
        videoCount: 1,
      },
    ],
  };

  return <SummaryV2Client data={data} />;
}
