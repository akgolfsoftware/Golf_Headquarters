/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ Live-økt · oppsummering.
 * Rendrer <LiveSummary> med hardkodet demo-data + resultat som matcher v10-
 * fasiten (public/design-handover/_screens/pl-live-summary.png) — low-
 * compliance-tilstanden (0 reps logget: outline-sjekk + røde under-plan-delta).
 *
 * Fullscreen forest-modus (ingen sidebar). "Ferdig" → /playerhq-preview (indeks).
 * INGEN Prisma/DB/auth — kun presentasjon.
 */

import { LiveSummary } from "@/components/portal/live-okt/live-summary";
import type { LiveSessionDemo } from "@/components/portal/live-okt/types";

// ── Delt demo-økt — matcher pl-live-summary.png ──
const demoLive: LiveSessionDemo = {
  eyebrow: "ONS 05 MAI · 02:00 · FYSISK",
  dateEyebrow: "ONS 05 MAI · FYSISK",
  title: "Vedlikehold — Kondisjon",
  axis: "FYS",
  durationMin: 30,
  drills: [
    {
      index: 1,
      axis: "FYS",
      name: "Vedlikeholdsløp sesong",
      plannedReps: 22,
      metaLabel: "22 min Z2 reps",
    },
  ],
  goals: ["Z2-vedlikehold. Aldri dagen før/etter turnering."],
  feeling: { value: 0, max: 5, label: "Hvordan føltes økta?" },
};

// ── Resultat fra økta — matcher fasiten (0 reps, 0 fullført) ──
const demoResult = {
  actualRepsPerDrill: [0],
  totalSec: 0,
  completedDrills: 0,
};

export default function LiveSummaryPreviewPage() {
  return (
    <LiveSummary
      data={demoLive}
      result={demoResult}
      closeHref="/playerhq-preview"
      doneHref="/playerhq-preview"
    />
  );
}
