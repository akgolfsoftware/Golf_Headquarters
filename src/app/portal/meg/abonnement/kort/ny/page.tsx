// Pakke 14 (utkast meg-resten.html, 16.10.2026): kortet byttes i Stripe-portalen, ikke i eget skjema.
/**
 * /portal/meg/abonnement/kort/ny sender til Stripes kundeportal, der kortet byttes og kvitteringene
 * ligger. Kortet lagres bare hos Stripe. Uten Stripe-kunde: tilbake til Abonnement.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function ByttKortPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const kunde = await prisma.subscription.findFirst({
    where: { userId: user.id, stripeCustomerId: { not: null } },
    select: { stripeCustomerId: true },
  });
  let url: string | null = null;
  if (kunde?.stripeCustomerId) {
    const origin = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no").replace(/\/$/, "");
    try {
      const portal = await stripeKlient().billingPortal.sessions.create({
        customer: kunde.stripeCustomerId,
        return_url: `${origin}/portal/meg/abonnement`,
        locale: "nb",
      });
      url = portal.url;
    } catch (err) {
      console.error("[bytt-kort] Stripe-portalen kunne ikke åpnes", err instanceof Error ? err.message : err);
    }
  }
  redirect(url ?? "/portal/meg/abonnement?kort=mangler");
}
