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
import { MegAvbestillV2, type MegAvbestillData } from "@/components/portal/v2/MegAvbestillV2";

function ukedag(d: Date) {
  return d.toLocaleDateString("nb-NO", { weekday: "long" });
}

function datoDag(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

export default async function AvbestillPage() {
  const user = await requirePortalUser();
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  const naa = new Date();
  const proAktivTil =
    subscription?.currentPeriodEnd ?? new Date(naa.getTime() + 31 * 24 * 60 * 60 * 1000);
  const dagerIgjen = Math.max(
    0,
    Math.ceil((proAktivTil.getTime() - naa.getTime()) / (24 * 60 * 60 * 1000)),
  );

  const data: MegAvbestillData = {
    ukedag: ukedag(proAktivTil),
    dato: datoDag(proAktivTil),
    dagerIgjen,
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/abonnement">Abonnement</TilbakeLenke>
      <MegAvbestillV2 data={data} />
    </V2Shell>
  );
}
