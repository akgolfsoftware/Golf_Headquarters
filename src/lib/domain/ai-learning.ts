import type { ConfidenceLevel } from "@/generated/prisma/client";

/**
 * Beregner hvor effektiv en intervensjon har vært basert på en vektet Bayesian-tilnærming.
 * Returnerer en normalisert verdi mellom -1.0 og +1.0 for lagring i contextual-bandit-læringssystemet.
 */
export function calculateEffectivenessScore(params: {
  sgDelta: number;
  complianceRate: number;
  confidence: ConfidenceLevel;
}): { score: number; weight: number } {
  const { sgDelta, complianceRate, confidence } = params;

  // 1. Vekting basert på datakvalitet (antall runder i grunnlaget)
  const confidenceWeights: Record<ConfidenceLevel, number> = {
    LOW: 0.2, // Lav tillit til resultatet — påvirker modellen minimalt
    MEDIUM: 0.6, // Moderat tillit
    HIGH: 1.0, // Høy statistisk signifikans
  };
  const weight = confidenceWeights[confidence];

  // 2. Terskeljustering: clamper (begrenser) SG-delta til [-1.0, 1.0] for å fjerne ekstreme uteliggere
  const clampedDelta = Math.max(-1.0, Math.min(1.0, sgDelta));

  // 3. Juster score basert på compliance (hvor godt spilleren fulgte programmet)
  let rawScore: number;
  if (clampedDelta >= 0) {
    // Forbedring: Høy compliance forsterker tilliten til at øvelsen virket
    rawScore = clampedDelta * (0.5 + 0.5 * complianceRate);
  } else {
    // Forverring: Hvis compliance var høy, er det mer sannsynlig at øvelsen ikke passet.
    // Hvis compliance var lav, nøytraliseres straffen mot øvelsen (vi kan ikke klandre drillen).
    rawScore = clampedDelta * complianceRate;
  }

  // Sikre en fornuftig presisjon for database og avrunding
  return {
    score: parseFloat(rawScore.toFixed(3)),
    weight,
  };
}

export function determineConfidence(trainingArea: string, roundsSampled: number): ConfidenceLevel {
  // Nærspill og putt trenger mer data for å jevne ut statistisk støy
  const isShortGame =
    ["CHIP", "PITCH", "LOB", "BUNKER"].includes(trainingArea) ||
    trainingArea.startsWith("PUTT");

  const highThreshold = isShortGame ? 24 : 16;
  const mediumThreshold = 8;

  if (roundsSampled >= highThreshold) return "HIGH";
  if (roundsSampled >= mediumThreshold) return "MEDIUM";
  return "LOW";
}
