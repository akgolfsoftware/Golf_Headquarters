/**
 * Preview-rute (offentlig, ingen auth) for PlayerHQ Live-økt · aktiv.
 * Rendrer <LiveActive> med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/pl-live-active.png) — HOVEDSKJERMEN.
 *
 * Fullscreen forest-modus (ingen sidebar). Live timer + rep-teller (klient).
 * "Avslutt økt" → /playerhq-preview/live-summary. INGEN Prisma/DB/auth.
 */

import { LiveActive } from "@/components/portal/live-okt/live-active";
import type { LiveSessionDemo } from "@/components/portal/live-okt/types";

// ── Delt demo-økt — matcher pl-live-active.png ──
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

export default function LiveActivePreviewPage() {
  return (
    <LiveActive
      data={demoLive}
      closeHref="/playerhq-preview"
      endHref="/playerhq-preview/live-summary"
    />
  );
}
