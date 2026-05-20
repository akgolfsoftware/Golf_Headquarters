// Live-økt summary — fullscreen.
// Speiler public/design/batch4/live-okt-summary.html.
// Tekst-data hardkodes som eksempel inntil reell data hentes fra Prisma.

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { SummaryClient } from "./summary-client";

export type SummaryGoal = {
  id: string;
  title: string;
  status: "success" | "partial";
  // Verdi 0–100 for fremdriftsbar. Bruk "bekreftet" for kvalitative mål.
  progressPct: number;
  meta: string; // f.eks. "8 / 10" eller "Bekreftet"
  verdictTitle: string;
  verdictSub: string;
};

export type SummaryHighlight = {
  kind: "best" | "tend" | "pr";
  label: string;
  mainEm: string; // tall/verdi
  mainText: string; // tekst etter tall
  note: string;
  noteItalic?: boolean;
};

export type SummaryData = {
  sessionId: string;
  eyebrow: string;
  heroTitle: string;
  heroEm: string;
  subline: string;
  metaLeft: string;
  metaRight: string;
  // KPI-strip
  kpiMain: { value: string; valueSub?: string; unit: string };
  kpiVarighet: { value: string; valueSub?: string; unit: string };
  kpiReps: { value: string; valueSub?: string; unit: string };
  // Mål
  goals: SummaryGoal[];
  // Highlights
  highlights: SummaryHighlight[];
  // AI-oppsummering
  aiSummary: string;
  // Coach
  coachName: string;
};

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;

  // Eksempel-data speiler HTML-prototypen. Erstattes med Prisma-uttrekk
  // (via freezeSessionSummary) når økten er fullført i produksjon.
  const data: SummaryData = {
    sessionId,
    eyebrow: "ØKT FULLFØRT · 22. MAI 2026 · 14:00–15:00",
    heroTitle: "Slik gikk det",
    heroEm: "Slik gikk det",
    subline: "Wedge-presisjon 50–80m. Tre mål, 60 minutter, 78 shots.",
    metaLeft: "MED HANS BRENNUM",
    metaRight: "GFGK PERFORMANCE STUDIO",
    coachName: "Hans Brennum",
    kpiMain: {
      value: "2,5",
      valueSub: "/ 3",
      unit: "2 BEKREFTET · 1 DELVIS",
    },
    kpiVarighet: {
      value: "60",
      valueSub: "min",
      unit: "SOM PLANLAGT",
    },
    kpiReps: {
      value: "78",
      unit: "SNITT 92 PR ØKT",
    },
    goals: [
      {
        id: "g1",
        title: "Treff GIR 7/10 fra 60m",
        status: "success",
        progressPct: 80,
        meta: "8 / 10",
        verdictTitle: "Overoppfylt",
        verdictSub: "+1 fra mål",
      },
      {
        id: "g2",
        title: "Konsistens i tempo",
        status: "partial",
        progressPct: 60,
        meta: "6 / 10",
        verdictTitle: "Delvis",
        verdictSub: "nær mål",
      },
      {
        id: "g3",
        title: "Identifisere mønster i misser",
        status: "success",
        progressPct: 100,
        meta: "Bekreftet",
        verdictTitle: "Mønster funnet",
        verdictSub: "venstre · 12%",
      },
    ],
    highlights: [
      {
        kind: "best",
        label: "BESTE SHOT",
        mainEm: "4m",
        mainText: "fra pin",
        note: "62 m med PW · landing 4,2m kort, rull til pin · ball #43",
      },
      {
        kind: "tend",
        label: "VERSTE TENDENS",
        mainEm: "12%",
        mainText: "mot venstre",
        note: "9 av 78 misser samme vei · sjekk grep og setup neste økt",
      },
      {
        kind: "pr",
        label: "PR-MULIGHET",
        mainEm: "9 GIR",
        mainText: "= PR",
        note: "Hadde du 9 GIR i dag, ville det vært ny PR for 60m-distansen.",
        noteItalic: true,
      },
    ],
    aiSummary:
      "Du jobbet med approach 100–150m. SG-potensial +0,4 hvis du holder venstre-misset under 8%.",
  };

  return <SummaryClient data={data} />;
}
