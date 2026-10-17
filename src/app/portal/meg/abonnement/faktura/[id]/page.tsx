// Pakke 14 (beslutninger.md §PRØVEUKE …, 16.10.2026): kvitteringer vises hos Stripe, ikke i egen fakturaside.
/**
 * /portal/meg/abonnement/faktura/[id] sender til Stripes kvittering for betalingen. Bare brukerens
 * egne betalinger slås opp. Uten kvittering hos Stripe: tilbake til Abonnement.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { stripeKvitteringUrl } from "@/lib/stripe/kvittering";

export const dynamic = "force-dynamic";

export default async function KvitteringPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const { id } = await params;
  const betaling = await prisma.payment.findFirst({
    where: { id, userId: user.id },
    select: { stripeChargeId: true, stripePaymentIntentId: true, stripeInvoiceId: true },
  });
  let url: string | null = null;
  if (betaling) {
    try {
      url = await stripeKvitteringUrl(stripeKlient(), betaling);
    } catch (err) {
      console.error("[kvittering] Stripe-oppslag feilet", err instanceof Error ? err.message : err);
    }
  }
  redirect(url ?? "/portal/meg/abonnement?kvittering=mangler");
}
