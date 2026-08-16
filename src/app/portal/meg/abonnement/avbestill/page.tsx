/**
 * PlayerHQ · Meg · Abonnement · Avbestill (/portal/meg/abonnement/avbestill) — v2.
 * v2-port 17. juli 2026 (Team D4a): MegAvbestillV2 erstatter den gamle
 * Tailwind-siden + avbestill-buttons.tsx. Auth, Prisma-oppslaget og
 * dato-/dager-avledningen er uendret; cancelPro-actionen (Stripe FØR DB,
 * gotchas.md) er IKKE rørt — kun presentasjonslaget er nytt.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { pakkeNavn } from "@/lib/domain/abonnement";
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
  const user = await requirePortalUser();
  // A1: vis raden med Stripe-kobling (den som faktisk kan avbestilles).
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id, stripeSubscriptionId: { not: null } },
  });
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
    <V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/abonnement">Abonnement</TilbakeLenke>
      <MegAvbestillV2 data={data} />
    </V2Shell>
  );
}
