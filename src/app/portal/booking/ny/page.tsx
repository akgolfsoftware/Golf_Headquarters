/**
 * Booking-wizard (/portal/booking/ny) — v2 (retning C), Team G-A 17. juli 2026.
 *
 * RESTYLING ONLY av legacy-wizarden: samme query-drevne steg-modell
 * (service → dato → tid → /portal/booking/ny/bekreft via slot-lenkene) og
 * NØYAKTIG samme server-logikk — guards, redirects, queries, getAvailableSlots
 * og lokasjonsoppløsning er kopiert uendret. Kun presentasjonen er ny
 * (V2Shell + BookingNyV2). URL-kontrakten ?service=&dato= er uendret.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { kanBrukeCredits } from "@/lib/booking/credits-tilgang";
import { getAvailableSlots } from "@/lib/booking/availability";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke, Kort, TomTilstand } from "@/components/v2";
import {
  BookingNyV2,
  BruktOppV2,
  type BookingNyV2Data,
} from "@/components/portal/v2/BookingNyV2";

type Props = {
  searchParams: Promise<{ dato?: string; service?: string }>;
};

export default async function NyBookingPage({ searchParams }: Props) {
  const { dato: datoParam, service: serviceParam } = await searchParams;
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  // Ingen betalt abonnement (aktivt, eller avbestilt med tid igjen av perioden)
  // eller PlayerHQ-only (uten credits) → send til /coaching
  if (
    !subscription ||
    !kanBrukeCredits(subscription) ||
    subscription.monthlyCredits === 0
  ) {
    redirect("/coaching");
  }

  // Brukt opp månedens credits — vis info + drop-in-CTA
  if (subscription.creditsRemaining <= 0) {
    const resetAt = subscription.currentPeriodEnd;
    return (
      <V2Shell nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/booking">Booking</TilbakeLenke>
        <BruktOppV2
          resetTekst={
            resetAt
              ? `Neste reset: ${resetAt.toLocaleDateString("nb-NO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}`
              : null
          }
        />
      </V2Shell>
    );
  }

  // Alle aktive coaching-tjenester
  const services = await prisma.serviceType.findMany({
    where: { active: true },
    orderBy: { durationMin: "asc" },
  });

  // Aktive lokasjoner — brukes til å vise lokasjonsnavn i steg 1-kortene
  // og oppsummeringssteget.
  const locations = await prisma.location.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (services.length === 0) {
    return (
      <V2Shell nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/booking">Booking</TilbakeLenke>
        <Kort>
          <TomTilstand
            icon="target"
            title="Ingen tjenester tilgjengelig"
            sub="Ingen coaching-tjenester er aktive i øyeblikket. Kontakt support@akgolf.no."
          />
        </Kort>
      </V2Shell>
    );
  }

  // Default-valg: første tjeneste hvis ingen valgt
  const valgtService =
    services.find((s) => s.slug === serviceParam) ?? services[0];

  // Default dato: i dag (eller fra query)
  const valgtDato = parseDatoQuery(datoParam) ?? startOfDay(new Date());

  const slots = await getAvailableSlots(valgtService.id, valgtDato);

  // Aktivt steg utledet av query-params: service valgt → steg 2, dato valgt → steg 3.
  const aktivtSteg = !serviceParam ? 1 : !datoParam ? 2 : 3;
  const isFree = user.tier === "GRATIS";

  // Lokasjonsnavn som credit-booking.ts vil bruke for valgt tjeneste
  // (speiler logikken i src/lib/booking/credit-booking.ts).
  const resolvedLocationName = valgtService.slug.includes("trackman")
    ? "Mulligan Indoor Golf"
    : "Gamle Fredrikstad GK";
  const resolvedLocation =
    locations.find((l) =>
      l.name.toLowerCase().includes(resolvedLocationName.toLowerCase()),
    ) ?? locations[0] ?? null;
  const saldoEtter = subscription.creditsRemaining - 1;
  const sisteCredit = subscription.creditsRemaining === 1;

  // Sted per tjeneste-kort — samme oppslag som legacy-kortene (UTEN
  // locations[0]-fallback; ingen treff → ingen sted-meta på kortet).
  const stedForTjeneste = (slug: string): string | null => {
    const locName = slug.includes("trackman")
      ? "Mulligan Indoor Golf"
      : "Gamle Fredrikstad GK";
    return (
      locations.find((l) => l.name.toLowerCase().includes(locName.toLowerCase()))
        ?.name ?? null
    );
  };

  const data: BookingNyV2Data = {
    tjenester: services.map((s) => ({
      id: s.id,
      slug: s.slug,
      navn: s.name,
      varighetMin: s.durationMin,
      prisOre: s.priceOre,
      beskrivelse: s.description,
      stedNavn: stedForTjeneste(s.slug),
    })),
    valgtServiceId: valgtService.id,
    valgtServiceNavn: valgtService.name,
    valgtServiceVarighetMin: valgtService.durationMin,
    datoParam: datoParam ?? null,
    serviceParamSatt: !!serviceParam,
    valgtDatoIso: valgtDato.toISOString(),
    valgtDatoLang: valgtDato.toLocaleDateString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
    aktivtSteg,
    isFree,
    slots: slots.map((s) => ({
      startIso: s.start.toISOString(),
      coachId: s.coachId,
      coachNavn: s.coachName,
    })),
    creditsRemaining: subscription.creditsRemaining,
    monthlyCredits: subscription.monthlyCredits,
    fornyerLabel: subscription.currentPeriodEnd
      ? subscription.currentPeriodEnd.toLocaleDateString("nb-NO", {
          day: "2-digit",
          month: "short",
        })
      : null,
    stedNavn: resolvedLocation?.name ?? null,
    saldoEtter,
    sisteCredit,
  };

  return (
    <V2Shell nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/booking">Booking</TilbakeLenke>
      <BookingNyV2 data={data} />
    </V2Shell>
  );
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function parseDatoQuery(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return startOfDay(d);
}
