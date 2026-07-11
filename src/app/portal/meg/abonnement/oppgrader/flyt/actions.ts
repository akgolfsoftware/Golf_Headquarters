"use server";

import { z } from "zod";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { audit } from "@/lib/audit";

const RequestProUpgradeSchema = z.object({
  plan: z.enum(["monthly", "yearly"], {
    error: "Ugyldig betalingsplan — velg 'monthly' eller 'yearly'",
  }),
});

type Input = {
  plan: "monthly" | "yearly";
};

export type RequestProUpgradeResult = {
  ok: false;
  message: string;
};

/**
 * Betaling for PRO er ikke åpnet ennå. Vi logger interessen i audit-loggen
 * (til oppfølging) og returnerer en ærlig melding — ALDRI en falsk
 * suksess-tilstand. Ingen abonnement opprettes her.
 */
export async function requestProUpgrade(
  input: Input,
): Promise<RequestProUpgradeResult> {
  RequestProUpgradeSchema.parse(input);
  const user = await requireConsentingUser();

  await audit({
    actorId: user.id,
    action: "pro.upgrade_interest_logged",
    target: user.id,
    metadata: { plan: input.plan },
  });

  return {
    ok: false,
    message: "Betaling åpner 1. august — du står på listen.",
  };
}
