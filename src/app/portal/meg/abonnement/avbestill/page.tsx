/**
 * Avslutt abonnement (/portal/meg/abonnement/avbestill) — Precision Athletics PH-25.
 * Auth, Prisma-oppslaget og dato-/dager-avledningen er uendret. cancelPro (Stripe FØR
 * databasen, gotchas.md) er ikke rørt; bare presentasjonen er ny. Rust bare på bekreftknappen.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Avbestill, type PH25AvbestillData, type PH25Konsekvens } from "@/components/portal/precision/PH25Abonnement";

export const dynamic = "force-dynamic";
export const metadata = { title: "Avslutt abonnement · PlayerHQ" };

const ukedag = (d: Date) => d.toLocaleDateString("nb-NO", { weekday: "long", timeZone: "Europe/Oslo" });
const datoDag = (d: Date) => d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" });

export default async function AvbestillPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  // A1: raden med Stripe-kobling er den som faktisk kan avbestilles.
  const [subscription, uleste] = await Promise.all([
    prisma.subscription.findFirst({ where: { userId: user.id, stripeSubscriptionId: { not: null } } }),
    hentUleste(user.id),
  ]);
  const naa = new Date();
  const aktivTil = subscription?.currentPeriodEnd ?? new Date(naa.getTime() + 31 * 24 * 60 * 60 * 1000);
  const dagerIgjen = Math.max(0, Math.ceil((aktivTil.getTime() - naa.getTime()) / (24 * 60 * 60 * 1000)));

  // A4: konsekvensene bygges fra det FAKTISKE abonnementet.
  const pakke = pakkeNavn(subscription?.monthlyCredits ?? 0);
  const konsekvenser: PH25Konsekvens[] = [
    ...(pakke ? [{ tittel: `Coaching-pakken ${pakke}`, detalj: `fra ${subscription?.monthlyCredits ?? 0} økter per måned til 0` }] : []),
    { tittel: "AI-coach", detalj: "låses når perioden utløper" },
    { tittel: "Videoanalyse fra coach", detalj: "opplastinger låses" },
    { tittel: "Treningsplan og Workbench", detalj: "låses når perioden utløper" },
  ];

  const data: PH25AvbestillData = { ukedag: ukedag(aktivTil), dato: datoDag(aktivTil), dagerIgjen, konsekvenser };
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH25Avbestill data={data} />
    </PlayerHQSkall>
  );
}
