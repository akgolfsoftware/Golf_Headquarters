// Tool: search_knowledge — semantisk søk i AK Golf-kunnskapsbasen.
//
// Slår opp i knowledge_chunks (MasterBrain rag-corpus: SG-matematikk,
// Trackman, baselines, MORAD/CANON, live-coaching). Brukes når agenten
// trenger faglig grunnlag utover skills-blokkene — f.eks. eksakte
// baseline-verdier, Trackman-parametere eller MORAD-feil/drill-detaljer.

import "server-only";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import {
  searchKnowledge,
  isRagEnabled,
  type KnowledgeCorpus,
} from "@/lib/ai/rag";

const CORPORA = [
  "sg-trackman",
  "sg-baselines",
  "treningsvolum",
  "morad",
  "live",
] as const;

export const searchKnowledgeTool: Tool = {
  name: "search_knowledge",
  description:
    "Semantisk søk i AK Golf-kunnskapsbasen (SG-matematikk, Trackman, SG-baselines, MORAD/CANON-metodikk, treningsvolum/LTAD, live-coaching-regler). Returnerer de mest relevante tekstutdragene.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Søkespørsmål på norsk eller engelsk",
      },
      corpus: {
        type: "string",
        enum: [...CORPORA],
        description:
          "Valgfritt: begrens til ett corpus (sg-trackman, sg-baselines, treningsvolum, morad, live)",
      },
      antall: {
        type: "number",
        description: "Antall treff (default 4, maks 10)",
      },
    },
    required: ["query"],
  },
};

export type SearchKnowledgeInput = {
  query: string;
  corpus?: KnowledgeCorpus;
  antall?: number;
};

export type SearchKnowledgeOutput =
  | {
      ok: true;
      treff: Array<{
        id: string;
        corpus: string;
        source: string | null;
        section: string | null;
        similarity: number;
        content: string;
      }>;
    }
  | { ok: false; error: string };

export async function execSearchKnowledge(
  args: SearchKnowledgeInput,
): Promise<SearchKnowledgeOutput> {
  if (!isRagEnabled()) {
    return { ok: false, error: "RAG er ikke tilgjengelig (AI_GATEWAY_API_KEY mangler)" };
  }
  try {
    const hits = await searchKnowledge(args.query, {
      k: args.antall,
      corpus: args.corpus,
    });
    return {
      ok: true,
      treff: hits.map((h) => ({
        id: h.id,
        corpus: h.corpus,
        source: h.source,
        section: h.section,
        similarity: Math.round(h.similarity * 1000) / 1000,
        content: h.content,
      })),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
