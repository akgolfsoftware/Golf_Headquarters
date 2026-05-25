// Tool: get_runder — henter spillerens siste registrerte runder.
//
// Brukes når agenten skal analysere prestasjon eller fremgang. Returnerer
// kun de viktigste feltene (dato, score, SG-aggregater) for å holde
// context-vinduet kompakt.

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const getRunderTool: Tool = {
  name: "get_runder",
  description:
    "Henter spillerens siste N runder med score og Strokes Gained-aggregater. Default N=10.",
  input_schema: {
    type: "object",
    properties: {
      spillerId: { type: "string", description: "Spillerens database-ID" },
      limit: {
        type: "number",
        description: "Antall runder å hente (default 10, maks 50)",
      },
    },
    required: ["spillerId"],
  },
};

export type GetRunderInput = {
  spillerId: string;
  limit?: number;
};

export type RundeOut = {
  id: string;
  playedAt: string;
  course: string;
  score: number;
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

export type GetRunderOutput =
  | { ok: true; runder: RundeOut[] }
  | { ok: false; error: string };

export async function execGetRunder(
  args: GetRunderInput,
): Promise<GetRunderOutput> {
  const limit = Math.min(Math.max(args.limit ?? 10, 1), 50);
  const runder = await prisma.round.findMany({
    where: { userId: args.spillerId },
    orderBy: { playedAt: "desc" },
    take: limit,
    select: {
      id: true,
      playedAt: true,
      score: true,
      sgTotal: true,
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
      course: { select: { name: true } },
    },
  });
  return {
    ok: true,
    runder: runder.map((r) => ({
      id: r.id,
      playedAt: r.playedAt.toISOString(),
      course: r.course.name,
      score: r.score,
      sgTotal: r.sgTotal,
      sgOtt: r.sgOtt,
      sgApp: r.sgApp,
      sgArg: r.sgArg,
      sgPutt: r.sgPutt,
    })),
  };
}
