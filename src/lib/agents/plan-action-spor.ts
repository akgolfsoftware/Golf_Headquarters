import { sanitizeMessage } from "@/lib/error-sanitize";

export const PLAN_ACTION_AGENT = "plan-action-executor";

export type PlanActionSpor = {
  agentName: string;
  userId: string;
  status: "OK" | "ERROR";
  duration: number;
  error?: string;
  output: {
    actionId: string;
    actionType: string;
    utfall: "ACCEPTED" | "REJECTED" | "ERROR";
    applied?: boolean;
    summary?: string;
  };
};

export function planActionOkSpor(input: {
  actionId: string;
  actionType: string;
  userId: string;
  applied: boolean;
  summary?: string;
}): PlanActionSpor {
  return {
    agentName: PLAN_ACTION_AGENT,
    userId: input.userId,
    status: "OK",
    duration: 0,
    output: {
      actionId: input.actionId,
      actionType: input.actionType,
      utfall: "ACCEPTED",
      applied: input.applied,
      ...(input.summary ? { summary: input.summary } : {}),
    },
  };
}

export function planActionAvvisSpor(input: {
  actionId: string;
  actionType: string;
  userId: string;
}): PlanActionSpor {
  return {
    agentName: PLAN_ACTION_AGENT,
    userId: input.userId,
    status: "OK",
    duration: 0,
    output: {
      actionId: input.actionId,
      actionType: input.actionType,
      utfall: "REJECTED",
      applied: false,
    },
  };
}

export function planActionFeilSpor(input: {
  actionId: string;
  actionType: string;
  userId: string;
  error: unknown;
}): PlanActionSpor {
  const raw = input.error instanceof Error ? input.error.message : String(input.error);
  return {
    agentName: PLAN_ACTION_AGENT,
    userId: input.userId,
    status: "ERROR",
    duration: 0,
    error: sanitizeMessage(raw).slice(0, 500),
    output: {
      actionId: input.actionId,
      actionType: input.actionType,
      utfall: "ERROR",
      applied: false,
    },
  };
}
