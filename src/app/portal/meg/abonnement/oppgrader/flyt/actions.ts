"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { audit } from "@/lib/audit";

const RequestProUpgradeSchema = z.object({
  plan: z.enum(["monthly", "yearly"], {
    error: "Ugyldig betalingsplan — velg 'monthly' eller 'yearly'",
  }),
});

type Input = {
  plan: "monthly" | "yearly";
};

export async function requestProUpgrade(input: Input): Promise<void> {
  RequestProUpgradeSchema.parse(input);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  // I produksjon: opprett Stripe checkout-session og redirect dit.
  // Foreløpig: logg forespørsel og redirect tilbake til abonnement med ok-state.
  await audit({
    actorId: user.id,
    action: "pro.upgrade_requested",
    target: user.id,
    metadata: { plan: input.plan },
  });

  redirect("/portal/meg/abonnement?ok=1");
}
