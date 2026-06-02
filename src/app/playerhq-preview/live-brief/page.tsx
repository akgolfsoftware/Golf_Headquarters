/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ Live-økt · brief.
 * Rendrer <LiveBrief> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/pl-live-brief.png).
 *
 * Fullscreen forest-modus (ingen sidebar). "Start økt" → /playerhq-preview/live-active.
 * INGEN Prisma/DB/auth — kun presentasjon.
 */

import { LiveBrief } from "@/components/portal/live-okt/live-brief";
import type { LiveSessionDemo } from "@/components/portal/live-okt/types";

// ── Delt demo-økt — matcher pl-live-brief.png ──
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

export default function LiveBriefPreviewPage() {
  return (
    <LiveBrief
      data={demoLive}
      backHref="/playerhq-preview"
      closeHref="/playerhq-preview"
      startHref="/playerhq-preview/live-active"
    />
  );
}
