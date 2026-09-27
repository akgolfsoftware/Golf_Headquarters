/**
 * Whisper Voice Range Recording & Transkribering
 *
 * Gjør det mulig for coach eller spiller å ta opp talebeskjeder på rangen/
 * treningsfeltet, transkribere dem via OpenAI Whisper, og automatisk parse
 * dem til strukturerte golf-observasjoner (kølle, P-posisjon, drill og reps).
 */

export interface ParsedVoiceObservation {
  rawTranscript: string;
  club: string | null;
  position: string | null; // f.eks. "P6", "P4", "P1"
  positionName: string | null; // f.eks. "Delivery", "Topp av baksving"
  swingObservation: string | null;
  suggestedDrill: string | null;
  suggestedReps: {
    dry: number;
    lav: number;
    full: number;
  } | null;
}

const P_POSITION_MAP: Record<string, { num: string; name: string }> = {
  p1: { num: "P1", name: "Oppstilling / Setup" },
  oppstilling: { num: "P1", name: "Oppstilling / Setup" },
  setup: { num: "P1", name: "Oppstilling / Setup" },
  p2: { num: "P2", name: "Takeaway / Skaft parallelt" },
  takeaway: { num: "P2", name: "Takeaway / Skaft parallelt" },
  p3: { num: "P3", name: "Baksving / Venstre arm parallell" },
  p4: { num: "P4", name: "Topp av baksving" },
  toppen: { num: "P4", name: "Topp av baksving" },
  topp: { num: "P4", name: "Topp av baksving" },
  p5: { num: "P5", name: "Overgang / Nedsving start" },
  overgang: { num: "P5", name: "Overgang / Nedsving start" },
  transition: { num: "P5", name: "Overgang / Nedsving start" },
  p6: { num: "P6", name: "Levering / Delivery" },
  delivery: { num: "P6", name: "Levering / Delivery" },
  p7: { num: "P7", name: "Trefføyeblikk / Impact" },
  impact: { num: "P7", name: "Trefføyeblikk / Impact" },
  treff: { num: "P7", name: "Trefføyeblikk / Impact" },
  treffet: { num: "P7", name: "Trefføyeblikk / Impact" },
  p8: { num: "P8", name: "Frigjøring / Release" },
  release: { num: "P8", name: "Frigjøring / Release" },
  frigjoring: { num: "P8", name: "Frigjøring / Release" },
  frigjøring: { num: "P8", name: "Frigjøring / Release" },
  p9: { num: "P9", name: "Gjennomføring / Follow-through" },
  p10: { num: "P10", name: "Avslutning / Finish" },
  finish: { num: "P10", name: "Avslutning / Finish" },
  avslutning: { num: "P10", name: "Avslutning / Finish" },
};

const CLUB_PATTERNS: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /\b(?:driver|driveren)\b/i, canonical: "Driver" },
  { pattern: /\b(?:3-tre|3 wood|spoon|treer-tre)\b/i, canonical: "3-tre" },
  { pattern: /\b(?:5-tre|5 wood)\b/i, canonical: "5-tre" },
  { pattern: /\b(?:hybrid|rescue)\b/i, canonical: "Hybrid" },
  { pattern: /\b(?:4-jern|4 iron|firer-jern)\b/i, canonical: "4-jern" },
  { pattern: /\b(?:5-jern|5 iron|femmer-jern)\b/i, canonical: "5-jern" },
  { pattern: /\b(?:6-jern|6 iron|sekser-jern)\b/i, canonical: "6-jern" },
  { pattern: /\b(?:7-jern|7 iron|sju-jern|syv-jern|sjur)\b/i, canonical: "7-jern" },
  { pattern: /\b(?:8-jern|8 iron|åtter-jern)\b/i, canonical: "8-jern" },
  { pattern: /\b(?:9-jern|9 iron|nier-jern)\b/i, canonical: "9-jern" },
  { pattern: /\b(?:pw|pitching wedge|pitcher|pitch)\b/i, canonical: "Pitching Wedge" },
  { pattern: /\b(?:sand wedge|sandwedge|sw|54-graders?|56-graders?|54°|56°|54 grader|56 grader)\b/i, canonical: "Sand Wedge" },
  { pattern: /\b(?:lob wedge|lobwedge|lw|58-graders?|60-graders?|58°|60°|58 grader|60 grader)\b/i, canonical: "Lob Wedge" },
  { pattern: /\b(?:gap wedge|gw|50-graders?|52-graders?|50°|52°|50 grader|52 grader)\b/i, canonical: "Gap Wedge" },
  { pattern: /\b(?:putter|putteren)\b/i, canonical: "Putter" },
];

/**
 * Parser rå tale-transkripsjon fra range-opptak til strukturerte golf-data.
 */
export function parseVoiceRangeNote(transcript: string): ParsedVoiceObservation {
  const text = transcript.trim();
  if (!text) {
    return {
      rawTranscript: "",
      club: null,
      position: null,
      positionName: null,
      swingObservation: null,
      suggestedDrill: null,
      suggestedReps: null,
    };
  }

  // 1. Kølle-gjenkjenning
  let detectedClub: string | null = null;
  for (const { pattern, canonical } of CLUB_PATTERNS) {
    if (pattern.test(text)) {
      detectedClub = canonical;
      break;
    }
  }

  // 2. P-posisjon gjenkjenning
  let detectedPos: string | null = null;
  let detectedPosName: string | null = null;

  // Let etter eksplisitt "P1".."P10"
  const pMatch = text.match(/\b(P[1-9]|P10)\b/i);
  if (pMatch && pMatch[1]) {
    const key = pMatch[1].toLowerCase();
    const hit = P_POSITION_MAP[key];
    if (hit) {
      detectedPos = hit.num;
      detectedPosName = hit.name;
    }
  }

  // Hvis ingen eksplisitt P, sjekk vanlige golf-ord
  if (!detectedPos) {
    for (const [word, hit] of Object.entries(P_POSITION_MAP)) {
      if (word.startsWith("p") && word.length <= 3) continue; // hoppet over p-koder allerede sjekket
      const regex = new RegExp(`\\b${word}\\b`, "i");
      if (regex.test(text)) {
        detectedPos = hit.num;
        detectedPosName = hit.name;
        break;
      }
    }
  }

  // 3. Drill-gjenkjenning
  let suggestedDrill: string | null = null;
  if (/drill|øvelse|trening/i.test(text)) {
    const drillMatch = text.match(/(?:drill|øvelse|kjør|gjør)\s+([^.,:;]+)/i);
    if (drillMatch && drillMatch[1]) {
      suggestedDrill = drillMatch[1].trim();
    }
  }

  // 4. Reps-gjenkjenning
  let suggestedReps: { dry: number; lav: number; full: number } | null = null;
  const repsMatch = text.match(/(\d+)\s*(?:reps|repetisjoner|slag|ganger)/i);
  if (repsMatch && repsMatch[1]) {
    const count = parseInt(repsMatch[1], 10);
    if (!Number.isNaN(count) && count > 0) {
      if (/uten ball|tørrtrening|dry/i.test(text)) {
        suggestedReps = { dry: count, lav: 0, full: 0 };
      } else if (/lav fart|rolig|halv sving|cs50|cs70/i.test(text)) {
        suggestedReps = { dry: 0, lav: count, full: 0 };
      } else {
        suggestedReps = { dry: 0, lav: Math.round(count * 0.4), full: Math.round(count * 0.6) };
      }
    }
  }

  return {
    rawTranscript: text,
    club: detectedClub,
    position: detectedPos,
    positionName: detectedPosName,
    swingObservation: text,
    suggestedDrill,
    suggestedReps,
  };
}

/**
 * Transkriberer en audio-fil ved hjelp av OpenAI Whisper API.
 * Hvis OPENAI_API_KEY ikke er tilgjengelig, returneres en informativ melding.
 */
export async function transcribeAudioWithWhisper(
  audioBuffer: Buffer,
  filename = "range-memo.webm",
  mimeType = "audio/webm",
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Når nøkkel mangler (f.eks. i isolert testmiljø)
    return "Taleopptak registrert (simulert transkripsjon: 7-jern, P6 levering litt for åpent blad, kjør 15 reps rolig).";
  }

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
  formData.append("file", blob, filename);
  formData.append("model", "whisper-1");
  formData.append("language", "no");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Whisper API-feil (${res.status}): ${errText}`);
  }

  const json = (await res.json()) as { text?: string };
  return json.text?.trim() ?? "";
}
