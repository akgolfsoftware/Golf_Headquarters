// Whisper-klient for transkribering av coaching-økter.
// Bruker OpenAI Whisper API med norsk språk-hint + golf-glossar for å
// redusere feiltranskripsjon på faguttrykk.

import OpenAI from "openai";

let klient: OpenAI | null = null;

function openaiKlient(): OpenAI {
  if (klient) return klient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY mangler i environment");
  }
  klient = new OpenAI({ apiKey });
  return klient;
}

type TranscribeInput = {
  audioBlob: Blob;
  filename?: string;
};

type TranscribeResultat = {
  text: string;
  language: string;
  durationSec?: number;
};

// Glossar gir Whisper kontekst → færre feiltranskripsjoner på golf-fagspråk.
const GOLF_PROMPT =
  "Norsk coaching-økt om golf. Faguttrykk: HCP, slope, swing path, low point, kompresjon, fade, draw, divot, lie-vinkel, smash factor, AOA, club path, face angle, putting, chip, pitch, bunker, range, fairway, green, hazard, bogey, par, birdie, eagle.";

export async function transkriber(
  input: TranscribeInput,
): Promise<TranscribeResultat> {
  const openai = openaiKlient();

  // Whisper-API krever File-objekt, ikke Blob.
  const file = new File(
    [input.audioBlob],
    input.filename ?? "audio.webm",
    { type: input.audioBlob.type || "audio/webm" },
  );

  const respons = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "no",
    prompt: GOLF_PROMPT,
    response_format: "verbose_json",
  });

  // verbose_json returnerer text, language, duration
  const verbose = respons as unknown as {
    text: string;
    language?: string;
    duration?: number;
  };

  return {
    text: verbose.text,
    language: verbose.language ?? "no",
    durationSec: verbose.duration,
  };
}
