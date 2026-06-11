/**
 * Destillerer Meg-logger med Claude API i tre kategorier:
 * DAGSNOTAT, VARIGE_MONSTRE, STOY.
 */

import Anthropic from "@anthropic-ai/sdk";

export type LogRad = {
  id: string;
  kind: string;
  text: string;
  value_num: number | null;
  value_unit: string | null;
  tags: string[];
  source?: string;
  created_at: string;
};

export type Destillert = {
  dagsnotat: string;
  varige_monstre: Array<{ tema: string; innhold: string }>;
  stoy_antall: number;
};

const MEG_MODEL = process.env.MEG_MODEL_SMART ?? "claude-sonnet-4-6";

const SYSTEM = `Du destillerer Anders Kristiansens daglige Meg-logger i tre kategorier.
Anders er CEO i AK Golf Group, golfcoach og personlig trener. Han logger søvn, humør, treninger, ideer og tanker via Telegram.

DAGSNOTAT: Kortfattet sammendrag av dagen på norsk bokmål. Maks 200 ord. Nevn søvn, humør, viktige hendelser, treninger og tanker. Skriv som en hjelpsom assistent som noterer essensen — ikke en mekanisk liste.

VARIGE_MONSTRE: Kun innsikter med verdi om 12 måneder eller mer. Mønstre i hvordan Anders tenker, beslutter, jobber og reagerer. Metodikk. Gjentakende temaer. Ikke ta med dagsaktuelle hendelser. Hvert mønster er et selvstendig markdown-avsnitt som gir mening uten kontekst.

STOY_ANTALL: Antall logger uten varig læringsverdi (f.eks. «spiste lunsj», trivielle notater).`;

const destillerToolSchema = {
  type: "object" as const,
  properties: {
    dagsnotat: {
      type: "string",
      description: "Daglig sammendrag, maks 200 ord, norsk bokmål",
    },
    varige_monstre: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tema: { type: "string", description: "Tittel, 3-6 ord" },
          innhold: { type: "string", description: "Selvstendig markdown-avsnitt om mønsteret" },
        },
        required: ["tema", "innhold"],
      },
    },
    stoy_antall: {
      type: "integer",
      description: "Antall støy-logger",
    },
  },
  required: ["dagsnotat", "varige_monstre", "stoy_antall"],
};

function formaterRader(rader: LogRad[]): string {
  return rader
    .map((r, i) => {
      const kl = new Date(r.created_at).toLocaleTimeString("no-NO", {
        timeZone: "Europe/Oslo",
        hour: "2-digit",
        minute: "2-digit",
      });
      const verdi =
        r.value_num != null
          ? ` (${r.value_num}${r.value_unit ? " " + r.value_unit : ""})`
          : "";
      const tagger = r.tags?.length ? ` [${r.tags.join(", ")}]` : "";
      return `${i + 1}. [${r.kind}] ${r.text}${verdi}${tagger} — kl. ${kl}`;
    })
    .join("\n");
}

export async function destiller(rader: LogRad[]): Promise<Destillert> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY mangler");

  const client = new Anthropic({ apiKey });

  const res = await client.messages.create({
    model: MEG_MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    tools: [
      {
        name: "destiller_logg",
        description: "Lagre destillert versjon av dagens Meg-logger",
        input_schema: destillerToolSchema,
      },
    ],
    tool_choice: { type: "tool", name: "destiller_logg" },
    messages: [{ role: "user", content: `Dagens logger:\n\n${formaterRader(rader)}` }],
  });

  const toolBlock = res.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Claude returnerte ikke forventet tool-use-svar");
  }

  const input = toolBlock.input as {
    dagsnotat: string;
    varige_monstre: Array<{ tema: string; innhold: string }>;
    stoy_antall: number;
  };

  if (!input.dagsnotat || !Array.isArray(input.varige_monstre)) {
    throw new Error(`Ugyldig Claude-output: ${JSON.stringify(input)}`);
  }

  return {
    dagsnotat: input.dagsnotat,
    varige_monstre: input.varige_monstre,
    stoy_antall: input.stoy_antall ?? 0,
  };
}
