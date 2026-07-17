/**
 * PlayerHQ · Book direkte med coach (/portal/booking/coach/[coachId]) — v2.
 * v2-port 17. juli 2026 (Team G-B): `BookingCoachV2` erstatter legacy-siden,
 * ruten flyttet ut av (legacy). All logikk uendret:
 * - `resolveCoach()` cuid/fornavn-slug-fallback beholdt EKSAKT (skjør —
 *   inngående lenker fra anlegg-siden bruker fornavn-slug, se NB nederst).
 * - Ekte øktteller (coachingSession.count) + aktive tjenester per coach.
 * - Siden er et inngangspunkt: alle CTA-er lenker til den ekte credit-flyten
 *   (/portal/booking/ny) med tjeneste forhåndsvalgt. Selve ledige-tider +
 *   credit-trekk skjer i wizarden.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { BookingCoachV2 } from "@/components/portal/v2/BookingCoachV2";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ coachId: string }>;
};

const WIZARD = "/portal/booking/ny";

/**
 * Slår opp coach på [coachId]. Prøver cuid-oppslag først (kanonisk, brukt av
 * /portal/coach/[coachId]); faller tilbake til fornavn-match blant COACH-brukere
 * fordi inngående lenker fra anlegg-siden sender fornavn-slug (f.eks. «anders»).
 */
async function resolveCoach(coachId: string) {
  const byId = await prisma.user.findUnique({
    where: { id: coachId },
    select: { id: true, name: true, email: true, role: true, ambition: true },
  });
  if (byId && byId.role === "COACH") return byId;

  const coaches = await prisma.user.findMany({
    where: { role: "COACH", deletedAt: null },
    select: { id: true, name: true, email: true, role: true, ambition: true },
  });
  const slug = coachId.toLowerCase();
  return (
    coaches.find((c) => c.name.split(" ")[0]?.toLowerCase() === slug) ?? null
  );
}

export default async function BookingCoachPage({ params }: Props) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { coachId } = await params;

  const coach = await resolveCoach(coachId);
  if (!coach) notFound();

  // Ekte øktteller (delte coaching-sesjoner) — samme kilde som /portal/coach/[coachId].
  const sesjoner = await prisma.coachingSession.count({
    where: { userId: user.id, coachId: coach.id },
  });

  // Ekte tjenester for denne coachen.
  const services = await prisma.serviceType.findMany({
    where: { coachUserId: coach.id, active: true },
    orderBy: { durationMin: "asc" },
  });

  return (
    // Ingen eksplisitt aktiv-nøkkel: booking-hubben (/portal/booking) lar
    // V2Shell auto-utlede fra pathname — samme her.
    <V2Shell nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/booking">Booking</TilbakeLenke>
      <BookingCoachV2
        data={{
          navn: coach.name,
          ambition: coach.ambition,
          epost: coach.email,
          fellesOkter: sesjoner,
          tjenester: services.map((s) => ({
            id: s.id,
            navn: s.name,
            varighetMin: s.durationMin,
            beskrivelse: s.description,
            prisTekst:
              s.priceOre > 0
                ? `${(s.priceOre / 100).toLocaleString("nb-NO")} kr`
                : "1 credit",
            href: `${WIZARD}?coachId=${coach.id}&service=${s.slug}`,
          })),
          wizardHref: `${WIZARD}?coachId=${coach.id}`,
          meldingHref: "/portal/coach/melding",
          visProKrav: user.tier === "GRATIS",
        }}
      />
    </V2Shell>
  );
}

/*
 * NB — slug vs cuid:
 * /portal/coach/[coachId] bruker cuid (prisma.user.id). Men inngående lenker fra
 * /portal/booking/anlegg/[anleggId] sender fornavn-slug ("anders", "markus") fordi
 * den siden fortsatt har hardkodede coach-navn. resolveCoach() håndterer begge,
 * men den ekte fiksen er å gi anlegg-siden ekte coach-data + cuid-lenker. Flagget
 * til Anders i leveranse-sammendraget.
 */
