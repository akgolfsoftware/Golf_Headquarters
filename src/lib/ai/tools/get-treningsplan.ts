// Tool: get_treningsplan — henter spillerens aktive treningsplan(er).
//
// Returnerer plan-metadata pluss antall økter, slik at agenten kan vurdere
// status og foreslå justeringer. Selve økt-detaljene hentes separat hvis
// agenten trenger dem (egen tool kommer i senere fase).

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const getTreningsplanTool: Tool = {
  name: "get_treningsplan",
  description:
    "Henter aktive treningsplaner for en spiller med metadata og antall økter.",
  input_schema: {
    type: "object",
    properties: {
      spillerId: { type: "string", description: "Spillerens database-ID" },
      inkluderArkiverte: {
        type: "boolean",
        description: "Inkluder arkiverte planer (default false)",
      },
    },
    required: ["spillerId"],
  },
};

export type GetTreningsplanInput = {
  spillerId: string;
  inkluderArkiverte?: boolean;
};

export type PlanOut = {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  aiGenerated: boolean;
  antallOkter: number;
};

export type GetTreningsplanOutput =
  | { ok: true; planer: PlanOut[] }
  | { ok: false; error: string };

export async function execGetTreningsplan(
  args: GetTreningsplanInput,
): Promise<GetTreningsplanOutput> {
  const planer = await prisma.trainingPlan.findMany({
    where: {
      userId: args.spillerId,
      ...(args.inkluderArkiverte ? {} : { isActive: true }),
    },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      startDate: true,
      endDate: true,
      isActive: true,
      aiGenerated: true,
      _count: { select: { sessions: true } },
    },
  });
  return {
    ok: true,
    planer: planer.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate ? p.endDate.toISOString() : null,
      isActive: p.isActive,
      aiGenerated: p.aiGenerated,
      antallOkter: p._count.sessions,
    })),
  };
}
