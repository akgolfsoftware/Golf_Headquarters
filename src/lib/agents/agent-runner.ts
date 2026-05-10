// Felles wrapper for å kjøre en agent og logge resultatet til AgentRun.

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type AgentResult = {
  signalsWritten?: number;
  planActionsWritten?: number;
  output?: Prisma.InputJsonValue;
};

export type AgentFn = (userId: string) => Promise<AgentResult>;

export async function runAgent(
  agentName: string,
  userId: string | null,
  fn: () => Promise<AgentResult>
): Promise<AgentResult> {
  const start = Date.now();
  try {
    const result = await fn();
    const output: Prisma.InputJsonValue =
      result.output ?? {
        signalsWritten: result.signalsWritten ?? 0,
        planActionsWritten: result.planActionsWritten ?? 0,
      };
    await prisma.agentRun.create({
      data: {
        agentName,
        userId,
        status: "OK",
        duration: Date.now() - start,
        output,
      },
    });
    return result;
  } catch (err) {
    const melding = err instanceof Error ? err.message : String(err);
    await prisma.agentRun.create({
      data: {
        agentName,
        userId,
        status: "ERROR",
        duration: Date.now() - start,
        error: melding.slice(0, 500),
      },
    });
    throw err;
  }
}
