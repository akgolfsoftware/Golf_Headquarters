"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { audit } from "@/lib/audit";

type Input = {
  plan: "monthly" | "yearly";
};

export async function requestProUpgrade(input: Input): Promise<void> {
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
