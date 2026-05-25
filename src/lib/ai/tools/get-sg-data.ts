// Tool: get_sg_data — aggregerte Strokes Gained-tall for en spiller.
//
// Beregner gjennomsnitt for de 4 hoved-kategoriene (OTT/APP/ARG/PUTT) basert
// på siste N runder. Brukes når agenten skal vurdere svakhets-mønster eller
// sammenligne mot benchmarks (se skills/sg-interpretation).

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const getSgDataTool: Tool = {
  name: "get_sg_data",
  description:
    "Henter aggregerte Strokes Gained-tall (gjennomsnitt) for siste N runder for en spiller.",
  input_schema: {
    type: "object",
    properties: {
      spillerId: { type: "string", description: "Spillerens database-ID" },
      runderCount: {
        type: "number",
        description: "Hvor mange siste runder skal med (default 5, maks 50)",
      },
    },
    required: ["spillerId"],
  },
};

export type GetSgDataInput = {
  spillerId: string;
  runderCount?: number;
};

export type GetSgDataOutput =
  | {
      ok: true;
      runderTatt: number;
      gjennomsnitt: {
        sgTotal: number | null;
        sgOtt: number | null;
        sgApp: number | null;
        sgArg: number | null;
        sgPutt: number | null;
      };
    }
  | { ok: false; error: string };

function mean(values: Array<number | null>): number | null {
  const filtered = values.filter((v): v is number => v !== null);
  if (filtered.length === 0) return null;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

export async function execGetSgData(
  args: GetSgDataInput,
): Promise<GetSgDataOutput> {
  const limit = Math.min(Math.max(args.runderCount ?? 5, 1), 50);
  const runder = await prisma.round.findMany({
    where: { userId: args.spillerId },
    orderBy: { playedAt: "desc" },
    take: limit,
    select: {
      sgTotal: true,
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
    },
  });

  if (runder.length === 0) {
    return { ok: false, error: "Ingen runder registrert for denne spilleren" };
  }

  return {
    ok: true,
    runderTatt: runder.length,
    gjennomsnitt: {
      sgTotal: mean(runder.map((r) => r.sgTotal)),
      sgOtt: mean(runder.map((r) => r.sgOtt)),
      sgApp: mean(runder.map((r) => r.sgApp)),
      sgArg: mean(runder.map((r) => r.sgArg)),
      sgPutt: mean(runder.map((r) => r.sgPutt)),
    },
  };
}
