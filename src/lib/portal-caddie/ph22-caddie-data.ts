/**
 * Datamodell og hjelpefunksjoner for PH-22 Caddie AI & Assistent.
 * Kilde: Claude Design ui_kits/playerhq/screens/PH-22.jsx
 */

import type { Tier } from "@/generated/prisma/client";

export const PH22_HURTIGSPORSMAL = [
  "Hva bør jeg trene på i dag?",
  "Hvordan var siste runde?",
  "Foreslå en turnering i oktober",
  "Hvor mye har jeg trent denne uka?",
] as const;

export type HurtigSporsmal = (typeof PH22_HURTIGSPORSMAL)[number];

export interface PH22CaddieDraft {
  id: string;
  kind: "økt" | "plan" | "drill" | "turnering" | "annet";
  title: string;
  meta: string;
  status: "utkast" | "godtatt" | "forkastet";
}

export interface PH22CaddieMelding {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  source?: string;
  draft?: PH22CaddieDraft;
}

export interface PH22CaddieProps {
  tier: Tier;
  fornavn: string;
  initialer: string;
  sessionId: string | null;
  initialMessages: PH22CaddieMelding[];
  coachNavn?: string;
}

/**
 * Genererer Markdown-eksport av en Caddie-samtale.
 */
export function genererCaddieEksportMarkdown(
  meldinger: PH22CaddieMelding[],
  fornavn: string,
  dato: Date = new Date(),
): string {
  const datoTekst = dato.toISOString().slice(0, 10);
  const linjer = [
    `# Caddie-samtale — ${fornavn}`,
    `Dato: ${datoTekst}`,
    "",
    "---",
    "",
  ];

  for (const m of meldinger) {
    const tittel = m.role === "user" ? `Du (${m.timestamp})` : `Caddie (${m.timestamp})`;
    linjer.push(`### ${tittel}`);
    linjer.push("");
    linjer.push(m.content);
    if (m.source) {
      linjer.push("");
      linjer.push(`> Kilde: ${m.source}`);
    }
    if (m.draft) {
      linjer.push("");
      linjer.push(
        `> **Utkast (${m.draft.kind.toUpperCase()})**: ${m.draft.title} — Status: ${m.draft.status}`,
      );
    }
    linjer.push("");
  }

  return linjer.join("\n");
}

/**
 * Formaterer nåværende klokkeslett som HH:MM.
 */
export function formaterKlokkeslett(dato: Date = new Date()): string {
  return dato.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Avgjør om en bruker har tilgang til Caddie (krever Pro-abonnement eller coach/admin-rolle).
 */
export function harCaddieTilgang(tier: Tier, rolle?: string): boolean {
  if (rolle === "COACH" || rolle === "ADMIN") return true;
  return tier !== "GRATIS";
}
