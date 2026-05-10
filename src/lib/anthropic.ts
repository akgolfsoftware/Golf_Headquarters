// Anthropic-klient for AI-coach. Bygger system-prompt fra brukerens
// HCP, ambisjon, siste runder og aktiv plan.

import Anthropic from "@anthropic-ai/sdk";
import type { User, Round, TrainingPlan, CourseDefinition } from "@/generated/prisma/client";

let _klient: Anthropic | null = null;

export function anthropicKlient(): Anthropic {
  if (_klient) return _klient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY mangler i miljø.");
  }
  _klient = new Anthropic({ apiKey });
  return _klient;
}

export const COACH_MODEL = "claude-sonnet-4-6";

type RoundMedBane = Round & { course: CourseDefinition };

export type AiCoachKontext = {
  user: User;
  aktivePlaner: TrainingPlan[];
  sisteRunder: RoundMedBane[];
};

export function bygSystemPrompt(ctx: AiCoachKontext): string {
  const { user, aktivePlaner, sisteRunder } = ctx;

  const profil = [
    `Spiller: ${user.name}`,
    user.hcp != null ? `HCP: ${user.hcp.toFixed(1).replace(".", ",")}` : null,
    user.playingYears != null ? `Spilt: ${user.playingYears} år` : null,
    user.homeClub ? `Hjemmeklubb: ${user.homeClub}` : null,
    user.ambition ? `Ambisjon: ${user.ambition}` : null,
    `Tier: ${user.tier}`,
  ]
    .filter(Boolean)
    .join("\n");

  const planLinjer =
    aktivePlaner.length > 0
      ? aktivePlaner.map((p) => `- ${p.name} (siden ${p.startDate.toISOString().split("T")[0]})`).join("\n")
      : "Ingen aktive treningsplaner.";

  const rundeLinjer =
    sisteRunder.length > 0
      ? sisteRunder
          .slice(0, 5)
          .map((r) => {
            const dato = r.playedAt.toISOString().split("T")[0];
            const sg = r.sgTotal != null ? `SG ${r.sgTotal >= 0 ? "+" : ""}${r.sgTotal.toFixed(1)}` : "";
            return `- ${dato} · ${r.course.name} · ${r.score}${sg ? " · " + sg : ""}`;
          })
          .join("\n")
      : "Ingen registrerte runder enda.";

  return `Du er AK Golf AI-coach — en personlig coaching-assistent for golfspillere på AK Golf-plattformen.

Du følger AK Golf-pyramidens fem områder: FYS (fysisk), TEK (teknisk), SLAG (slag — korthold/pitch/putt), SPILL (spill — banetilpasning), TURN (turnering).

Tone: motiverende, kortfattet, handlingsorientert. Snakk norsk bokmål. Bruk æ/ø/å riktig. Aldri emoji.

Profil til denne spilleren:
${profil}

Aktive treningsplaner:
${planLinjer}

Siste 5 runder:
${rundeLinjer}

Retningslinjer:
- Gi konkrete råd basert på spillerens data, ikke generiske golf-tips
- Ved spørsmål om "hva bør jeg trene": foreslå spesifikke drills knyttet til pyramide-områder
- Ved spørsmål om resultater: refer til siste runder hvis relevant
- Hold svar under 150 ord med mindre brukeren ber om mer
- Du har ikke tilgang til å booke timer eller endre planen direkte — be brukeren om å bruke /portal/tren eller /portal/coach for det
- Vær ærlig om hva du ikke vet`;
}

export type ChatMelding = {
  role: "user" | "assistant";
  content: string;
};
