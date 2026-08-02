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

/**
 * Whisper prompt/glossar (norsk). OpenAI begrenser prompt-lengde (~224 tokens) —
 * hold tett og prioriter AK/MORAD over generiske engelske svingtermer.
 *
 * Eksport for enhetstest: bekreft at kanon-termer er med før range-spike.
 */
export const GOLF_PROMPT =
  "Norsk golfcoaching-økt. AK/MORAD: P1.0 P2.0 P3.0 P4.0 P5.0 P6.0 P7.0 P8.0 P9.0 P10.0. " +
  "CS20 CS40 CS50 CS60 CS80 CS100. L-KROPP L-ARM L-KØLLE L-BALL L-AUTO. " +
  "M0 M1 M2 M3 M4 M5. PR1 PR2 PR3 PR4 PR5. " +
  "Kategori A B C D E F G H I J K. Mini Knøtt Basis Utvikling Elite. " +
  "Pyramide FYS TEK SLAG SPILL TURN. Periode GRUNN SPESIALISERING TURNERING. " +
  "HCP slope fade draw divot bunker chip pitch putting fairway green range kompresjon.";

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
