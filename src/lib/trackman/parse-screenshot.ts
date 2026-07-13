"use server";

/**
 * TrackMan skjermbilde-import (Bølge 5, 2026-07-13): leser slag-tabellen ut
 * av et skjermbilde (TrackMan-appen/Range-skjerm) med Anthropic vision og
 * mapper til samme TrackManShot-form som CSV-parseren — nedstrøms lagring og
 * statistikk er identisk. Vision-svar er alltid et FORSLAG: brukeren ser og
 * velger slagene i forhåndsvisningen før noe lagres, og parse-feil blokkerer
 * aldri flyten (fallback: legg ved som bilde i økten).
 */

import { z } from "zod";
import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import type { TrackManShot } from "@/lib/trackman/parse-csv";

// Samme normaliserte enheter som CSV-parseren (m/s · meter · grader · rpm).
const ShotSchema = z.object({
  club: z.string().nullable().describe("Køllenavn slik det står i bildet, f.eks. Driver, 7 Iron"),
  clubSpeedMps: z.number().nullable().describe("Klubbhastighet i m/s (konverter fra mph: ÷2.23694, km/t: ÷3.6)"),
  ballSpeedMps: z.number().nullable().describe("Ballhastighet i m/s (samme konvertering)"),
  smashFactor: z.number().nullable(),
  carryMeters: z.number().nullable().describe("Carry i meter (konverter fra yards: ×0.9144)"),
  totalMeters: z.number().nullable().describe("Total i meter"),
  launchAngleDeg: z.number().nullable(),
  spinRateRpm: z.number().nullable(),
  sideMeters: z.number().nullable().describe("Sideavvik i meter, negativt = venstre"),
});

const ResultSchema = z.object({
  shots: z.array(ShotSchema).describe("Ett element per slag-rad i bildet. Tom hvis bildet ikke inneholder slagdata."),
  usikkerhet: z.string().nullable().describe("Kort norsk merknad hvis noe var utydelig/antatt, ellers null"),
});

// Gyldig modell-id mot api.anthropic.com (gotcha 2026-06-23). Vision-oppgaven
// er tabell-avlesning — Sonnet er riktig balanse presisjon/kost.
const SCREENSHOT_MODEL = "claude-sonnet-4-6" as const;

/** Anthropic-provider med /v1-normalisert baseURL (env-en mangler /v1 — gotcha). */
function anthropicProvider() {
  const base = process.env.ANTHROPIC_BASE_URL;
  return createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    ...(base ? { baseURL: base.endsWith("/v1") ? base : `${base.replace(/\/$/, "")}/v1` } : {}),
  });
}

export type ParseScreenshotResult =
  | { ok: true; shots: TrackManShot[]; usikkerhet: string | null }
  | { ok: false; error: string };

export async function parseTrackmanScreenshot(input: {
  /** Base64-kodet bildedata (uten data:-prefiks). */
  imageBase64: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
}): Promise<ParseScreenshotResult> {
  await requireConsentingUser();

  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "Skjermbilde-tolkning er ikke tilgjengelig (mangler AI-nøkkel)." };
  }
  // ~15 MB base64 ≈ 11 MB bilde — over dette er det uansett ikke et skjermbilde.
  if (input.imageBase64.length > 15_000_000) {
    return { ok: false, error: "Bildet er for stort. Ta et vanlig skjermbilde (ikke råfoto)." };
  }

  try {
    const { object } = await generateObject({
      model: anthropicProvider()(SCREENSHOT_MODEL),
      schema: ResultSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Dette er et skjermbilde fra TrackMan (app, range-skjerm eller rapport). " +
                "Les ut slag-dataene rad for rad. Normaliser enheter: hastigheter til m/s, " +
                "avstander til meter. Ta bare med rader som faktisk er slag (ikke snitt-rader, " +
                "med mindre bildet KUN viser snitt per kølle — da tas snittradene som ett slag per kølle). " +
                "Felt du ikke ser settes til null. Ikke gjett tall som er uleselige.",
            },
            { type: "image", image: input.imageBase64, mediaType: input.mediaType },
          ],
        },
      ],
    });

    const shots: TrackManShot[] = object.shots
      .filter((s) => s.club || s.ballSpeedMps != null || s.carryMeters != null || s.totalMeters != null)
      .map((s) => ({ ...s, notes: null }));
    if (shots.length === 0) {
      return { ok: false, error: "Fant ingen slagdata i bildet. Prøv et tydeligere skjermbilde — eller legg det ved som bilde." };
    }
    return { ok: true, shots, usikkerhet: object.usikkerhet ?? null };
  } catch (err) {
    console.error("[parseTrackmanScreenshot] vision-parse feilet", err);
    return { ok: false, error: "Klarte ikke å tolke skjermbildet. Du kan legge det ved som bilde i stedet." };
  }
}
