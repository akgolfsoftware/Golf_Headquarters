/** PH25Avbestill — avbestill abonnement i PlayerHQSkall.
 * Auth, Prisma-oppslaget og dato-/dager-avledningen er uendret.
 * cancelPro (Stripe før database) ligger i actions.ts.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import {
  MegAvbestillV2,
  type MegAvbestillData,
  type MegAvbestillKonsekvens,
} from "@/components/portal/v2/MegAvbestillV2";

function ukedag(d: Date) {
  return d.toLocaleDateString("nb-NO", { weekday: "long", timeZone: "Europe/Oslo" });
}

function datoDag(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" });
}

export default async function AvbestillPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  // A1: vis raden med Stripe-kobling (den som faktisk kan avbestilles).
  const [subscription, ulest] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId: user.id, stripeSubscriptionId: { not: null } },
    }),
    getUnreadNotifications(user.id, 1),
  ]);
  const naa = new Date();
  const proAktivTil =
    subscription?.currentPeriodEnd ?? new Date(naa.getTime() + 31 * 24 * 60 * 60 * 1000);
  const dagerIgjen = Math.max(
    0,
    Math.ceil((proAktivTil.getTime() - naa.getTime()) / (24 * 60 * 60 * 1000)),
  );

  // A4: konsekvensene bygges fra det FAKTISKE abonnementet — en 299-kunde
  // skal ikke se «fra 4 credits til 0», og en coaching-kunde skal se pakken sin.
  const pakke = pakkeNavn(subscription?.monthlyCredits ?? 0);
  const konsekvenser: MegAvbestillKonsekvens[] = [
    ...(pakke
      ? [
          {
            tittel: `Coaching-pakken ${pakke}`,
            detalj: `fra ${subscription?.monthlyCredits ?? 0} økter/mnd til 0`,
            etterpaa: "→ 0",
          },
        ]
      : []),
    { tittel: "AI-coach", detalj: "låses når perioden utløper", etterpaa: "→ låst" },
    { tittel: "Videoanalyse fra coach", detalj: "opplastinger låses", etterpaa: "→ låst" },
    { tittel: "Treningsplan og workbench", detalj: "låses når perioden utløper", etterpaa: "→ låst" },
  ];

  const data: MegAvbestillData = {
    ukedag: ukedag(proAktivTil),
    dato: datoDag(proAktivTil),
    dagerIgjen,
    konsekvenser,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <MegAvbestillV2 data={data} />
      </div>
    </PlayerHQSkall>
  );
}
