/**
 * PlayerHQ · Live-økt active (sesjon 2 · pixel-perfect)
 *
 * Spec: BATCH PR7 · Skjerm 7.2
 * - Lys tema (matcher PlayerHQ)
 * - Aktiv drill: tittel + 3 rep-tellere (Dry / Lav / Full)
 * - Touchtargets: +5 / +10 / +25 (96px høyde, store lime knapper)
 * - Drill-progresjon side-by-side (status ✓/●/○)
 * - Notat-pill + Video-pill + Spørsmål-pill bunn
 * - "Ferdig med drill"-CTA
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { LiveActiveV2Client, type LiveDrillV2 } from "./live-active-v2-client";

export default async function LiveActivePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });
  const { sessionId } = await params;

  // Stub-data inntil reell SessionDrillInstance-uttrekk er på plass.
  // Speiler PositionTask-modellen: hver drill har repsMaal for Dry / Lav / Full.
  const drills: LiveDrillV2[] = [
    {
      id: "d1",
      index: 1,
      name: "Pitch 50–80m · lav trajectory",
      pyramidArea: "TEK",
      lPhase: "L3",
      status: "active",
      target: { dry: 20, lav: 30, full: 30 },
      counts: { dry: 12, lav: 8, full: 0 },
    },
    {
      id: "d2",
      index: 2,
      name: "Iron progresjon CS70 → CS80",
      pyramidArea: "TEK",
      lPhase: "L4",
      status: "queued",
      target: { dry: 10, lav: 25, full: 25 },
      counts: { dry: 0, lav: 0, full: 0 },
    },
    {
      id: "d3",
      index: 3,
      name: "Putting 0–3m blokk",
      pyramidArea: "SLAG",
      lPhase: "L2",
      status: "queued",
      target: { dry: 0, lav: 50, full: 0 },
      counts: { dry: 0, lav: 0, full: 0 },
    },
    {
      id: "d4",
      index: 4,
      name: "Wedge fullslag 80m",
      pyramidArea: "SLAG",
      lPhase: "L3",
      status: "queued",
      target: { dry: 5, lav: 15, full: 15 },
      counts: { dry: 0, lav: 0, full: 0 },
    },
    {
      id: "d5",
      index: 5,
      name: "Spillsim · Tee til green",
      pyramidArea: "SPILL",
      lPhase: "L5",
      status: "queued",
      target: { dry: 0, lav: 0, full: 18 },
      counts: { dry: 0, lav: 0, full: 0 },
    },
  ];

  return <LiveActiveV2Client sessionId={sessionId} drills={drills} />;
}
