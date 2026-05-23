/**
 * /portal/meg/abonnement/kort/ny — Legg til betalingskort
 *
 * Design: Variant A "By-the-book to-kolonne" fra Claude Design-bundle
 * Sg2FEKvykU45c4naIgQx6w (s1-kort.jsx).
 *
 * UI er pixel-perfekt mockup av Stripe Elements-flyt — selve Stripe-
 * integrasjonen kobles opp i egen runde. Form-state håndteres lokalt
 * i KortForm (client component).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero } from "@/components/portal/player-hero";
import { KortForm } from "./kort-form";

export const dynamic = "force-dynamic";

export default async function NyttKortPage() {
  const user = await requirePortalUser();

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { currentPeriodEnd: true, status: true },
  });

  if (!subscription || subscription.status !== "ACTIVE") {
    redirect("/portal/meg/abonnement");
  }

  const navnPaaKortet = user.name ?? "";
  const nesteBelastning = subscription.currentPeriodEnd ?? null;

  return (
    <div className="space-y-8">
      <PlayerHero
        eyebrow="PlayerHQ · Meg · Abonnement · Betalingskort"
        titleLead="Legg til"
        titleItalic="kort"
        sub="Sikret av Stripe. Kortdata forlater aldri din enhet."
      />

      <KortForm
        defaultNavn={navnPaaKortet}
        nesteBelastning={nesteBelastning?.toISOString() ?? null}
      />
    </div>
  );
}
