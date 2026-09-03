/**
 * TrackMan-import — bilde-avlesning (AI-vision).
 *
 * Fasit: designsystem/train-lock/TM-03 Ingest-tilstander.dc.html (C1-C4).
 * Tredje kilde ved siden av CSV/HTML: et skjermbilde (eller foto av en
 * fysisk skjerm) tolkes av Claude sitt vision-API til samme `TrackManShot[]`-
 * form som CSV-parseren produserer, slik at resten av import-pipelinen
 * (canonical.ts → matching → TM-mål) er uendret og kildeuavhengig.
 *
 * TruthLayer: vi ber modellen om `null` for alt den ikke kan lese sikkert —
 * aldri gjette et tall. Finner den ingen lesbare TrackMan-tallverdier,
 * returneres en feil med samme tekst som TM-03 C3 («Fant ingen tall...»).
 */
import "server-only";
import { z } from "zod";
import { anthropic, tekstFra } from "@/lib/ai/client";
import { FALLBACK_ANTHROPIC_MODEL } from "@/lib/domain/ai-ruting";
import type { TrackManShot } from "@/lib/trackman/parse-csv";

export type TrackManPhotoMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif";

export type TrackManPhotoResult =
  | { ok: true; shots: TrackManShot[] }
  | { ok: false; error: string };

/** Ordrett fra fasit TM-03 (C2 HEIC og C3 «ingen tall» bruker samme setning). */
const FANT_INGEN_TALL = "Fant ingen tall. Rett på kortet. HEIC → JPG.";

const ShotSchema = z.object({
  club: z.string().nullable().optional(),
  clubSpeed: z.number().nullable().optional(),
  ballSpeed: z.number().nullable().optional(),
  smashFactor: z.number().nullable().optional(),
  carry: z.number().nullable().optional(),
  total: z.number().nullable().optional(),
  launchAngle: z.number().nullable().optional(),
  spinRate: z.number().nullable().optional(),
  side: z.number().nullable().optional(),
});

const ResponseSchema = z.object({
  shots: z.array(ShotSchema),
});

const SYSTEM_PROMPT = `Du leser skjermbilder/foto av TrackMan-skjermer (Sim eller Range) og trekker ut slagdata.

Les hver rad/hvert slag som vises med tallverdier for kølle- og ballmetrikker.
Svar KUN med gyldig JSON på nøyaktig denne formen, ingen annen tekst, ingen markdown:
{"shots":[{"club":"...","clubSpeed":n|null,"ballSpeed":n|null,"smashFactor":n|null,"carry":n|null,"total":n|null,"launchAngle":n|null,"spinRate":n|null,"side":n|null}]}

Regler:
- clubSpeed/ballSpeed i mph (slik TrackMan normalt viser dem), carry/total i meter.
- "side" er sideveis avvik i meter, negativ = venstre for target, positiv = høyre.
- Er du usikker på en enkelt verdi: sett den til null. ALDRI gjett eller anslå et tall.
- Er bildet ikke en TrackMan-skjerm, eller inneholder ingen lesbare tallverdier: svar {"shots":[]}.`;

/**
 * Parser ett skjermbilde/foto av en TrackMan-skjerm til slagdata via Claude
 * vision. `base64` er ren base64 (uten data:-prefiks), `mediaType` styrer
 * hvilket bildeformat Anthropic-API-et dekoder det som.
 */
export async function parseTrackManPhoto(
  base64: string,
  mediaType: TrackManPhotoMediaType,
): Promise<TrackManPhotoResult> {
  if (!anthropic) {
    return { ok: false, error: "AI-avlesning er ikke tilgjengelig akkurat nå." };
  }

  let raw: string;
  try {
    const response = await anthropic.messages.create({
      model: FALLBACK_ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: "Les av alle TrackMan-slagene i bildet og svar med JSON som beskrevet.",
            },
          ],
        },
      ],
    });
    raw = tekstFra(response);
  } catch {
    return { ok: false, error: "Kunne ikke lese bildet akkurat nå. Prøv igjen." };
  }

  let parsedJson: unknown;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsedJson = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return { ok: false, error: FANT_INGEN_TALL };
  }

  const validated = ResponseSchema.safeParse(parsedJson);
  if (!validated.success || validated.data.shots.length === 0) {
    return { ok: false, error: FANT_INGEN_TALL };
  }

  const shots: TrackManShot[] = validated.data.shots.map((s) => ({
    club: s.club?.trim() || null,
    clubSpeedMps: s.clubSpeed ?? null,
    ballSpeedMps: s.ballSpeed ?? null,
    smashFactor: s.smashFactor ?? null,
    carryMeters: s.carry ?? null,
    totalMeters: s.total ?? null,
    launchAngleDeg: s.launchAngle ?? null,
    spinRateRpm: s.spinRate ?? null,
    sideMeters: s.side ?? null,
    notes: null,
  }));

  return { ok: true, shots };
}
