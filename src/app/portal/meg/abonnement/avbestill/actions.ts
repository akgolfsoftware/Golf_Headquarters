"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { stripeKlient } from "@/lib/stripe";

// Returnerer { ok: false, error } ved feil — throw ville gitt generisk
// error-boundary (og prod maskerer Error-meldinger fra server actions),
// så meldingen må tilbake som verdi for at kalleren skal kunne vise den.
export async function cancelPro(): Promise<{ ok: boolean; error?: string }> {
  const user = await requireConsentingUser();

  // Marker subscription som cancelAtPeriodEnd. Sluttbruker beholder Pro til periodEnd.
  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (sub) {
    // Uten Stripe-abonnements-id kan vi ikke stoppe faktureringen — feil ærlig
    // i stedet for å vise «avbestilt» mens Stripe fortsetter å belaste.
    if (!sub.stripeSubscriptionId) {
      return {
        ok: false,
        error:
          "Fant ikke Stripe-abonnementet ditt. Ta kontakt, så avbestiller vi manuelt.",
      };
    }

    // Kanseller hos Stripe FØR egen DB oppdateres: cancel_at_period_end lar
    // brukeren beholde Pro ut betalt periode og stopper videre belastning.
    // Feiler Stripe-kallet, røres ikke DB — brukeren får ærlig feil.
    try {
      const stripe = stripeKlient();
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (err) {
      console.error("[cancelPro] Stripe-kansellering feilet", err);
      return {
        ok: false,
        error:
          "Avbestillingen nådde ikke Stripe, så ingenting er endret. Prøv igjen om litt.",
      };
    }

    // Marker som CANCELLED — beholder currentPeriodEnd så bruker ser dato.
    // Webhooken (customer.subscription.updated) skriver samme CANCELLED
    // (den mapper active + cancel_at_period_end → CANCELLED), så det oppstår
    // ingen motstridende status. Tier nedgraderes først av
    // customer.subscription.deleted når perioden faktisk utløper.
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "CANCELLED",
      },
    });
  }

  await audit({
    actorId: user.id,
    action: "pro.cancelled",
    target: user.id,
    metadata: { subscriptionId: sub?.id ?? null },
  });

  revalidatePath("/portal/meg/abonnement");
  // ?avbestilt=1 — egen banner for avbestilt abonnement.
  // (?cancelled=1 er reservert for avbrutt Stripe Checkout.)
  redirect("/portal/meg/abonnement?avbestilt=1");
}
