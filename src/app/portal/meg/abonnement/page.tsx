/**
 * PlayerHQ · Meg · Abonnement (/portal/meg/abonnement) — PH-25 i nytt design
 * (docs/design-system/utkast-playerhq/meg.html, skjermen «PH-25 Abonnement»).
 *
 * Bare ekte data: nivå og pakke fra getAbonnementData, betalinger fra Payment, og om det finnes
 * et Stripe-abonnement som kan avsluttes. Avslutt går via cancelPro (Stripe før database).
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Abonnement, type PH25Data } from "@/components/portal/precision/PH25Abonnement";

export const dynamic = "force-dynamic";
export const metadata = { title: "Abonnement · PlayerHQ" };

const OSLO = { timeZone: "Europe/Oslo" } as const;
const LANG = new Intl.DateTimeFormat("nb-NO", { ...OSLO, day: "numeric", month: "long" });
const DMA = new Intl.DateTimeFormat("nb-NO", { ...OSLO, day: "2-digit", month: "2-digit", year: "numeric" });

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; cancelled?: string; avbestilt?: string; fra?: string; state?: string }>;
}) {
  const sp = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [abo, stripeAbo] = await Promise.all([
    getAbonnementData(user.id),
    prisma.subscription.findFirst({ where: { userId: user.id, stripeSubscriptionId: { not: null } }, select: { id: true } }),
  ]);
  const pakke = pakkeNavn(abo.monthlyCredits);

  const data: PH25Data = {
    niva: abo.erPro ? "Full" : "Gratis",
    pakke: pakke ? { navn: pakke, igjen: abo.creditsRemaining, totalt: abo.monthlyCredits } : null,
    avsluttes: abo.status === "CANCELLED" || sp.avbestilt === "1",
    periodeSlutt: abo.nesteTrekk ? LANG.format(abo.nesteTrekk) : null,
    kanAvsluttes: stripeAbo !== null,
    fakturaer: abo.fakturaer.map((f) => ({
      id: f.id,
      dato: f.paidAt ? DMA.format(f.paidAt).replaceAll("/", ".") : "—",
      gjelder: f.description ?? (f.type === "SUBSCRIPTION" ? "Abonnement" : f.type === "BOOKING" ? "Booking" : "Betaling"),
      belop: Math.round(f.amountOre / 100),
    })),
    fraLaast: sp.fra === "laast" || sp.fra === "gameplan",
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH25Abonnement data={data} />
    </PlayerHQSkall>
  );
}
