// Tool: get_spiller — henter full spiller-profil basert på ID.
//
// Følger Anthropic tool-use-konvensjonen (name, description, input_schema).
// `exec` er den faktiske handlingen som kjøres når modellen velger toolet.
//
// Returnerer kun de feltene som er trygge å vise til en agent. Sensitiv
// data (auth-id, preferences-JSON osv.) ekskluderes bevisst.

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const getSpillerTool: Tool = {
  name: "get_spiller",
  description:
    "Henter full spiller-profil (navn, e-post, HCP, rolle, tier, hjemmeklubb) basert på spiller-ID.",
  input_schema: {
    type: "object",
    properties: {
      spillerId: { type: "string", description: "Spillerens database-ID" },
    },
    required: ["spillerId"],
  },
};

export type GetSpillerInput = {
  spillerId: string;
};

export type GetSpillerOutput =
  | {
      ok: true;
      spiller: {
        id: string;
        name: string;
        email: string;
        hcp: number | null;
        role: string;
        tier: string;
        homeClub: string | null;
        ambition: string | null;
        playingYears: number | null;
        createdAt: string;
      };
    }
  | { ok: false; error: string };

export async function execGetSpiller(
  args: GetSpillerInput,
): Promise<GetSpillerOutput> {
  const spiller = await prisma.user.findUnique({
    where: { id: args.spillerId },
    select: {
      id: true,
      name: true,
      email: true,
      hcp: true,
      role: true,
      tier: true,
      homeClub: true,
      ambition: true,
      playingYears: true,
      createdAt: true,
    },
  });
  if (!spiller) return { ok: false, error: "Spiller ikke funnet" };
  return {
    ok: true,
    spiller: {
      ...spiller,
      createdAt: spiller.createdAt.toISOString(),
    },
  };
}
