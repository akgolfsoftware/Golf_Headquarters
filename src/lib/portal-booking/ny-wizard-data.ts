/**
 * Data-loader for booking-wizarden (ny tjeneste → dato → tid). Trukket ut av
 * `/portal/booking/ny/page.tsx` (STEG 9.8) slik at den samme logikken kan
 * gjenbrukes av foreldreportalens «book for barnet»-flyt
 * (`/forelder/bookinger/ny/[barnId]`) uten å duplisere subscription-/
 * credits-/slot-utregningen to steder. `eierId`/`eierTier` er PERSONEN
 * bookingen gjelder for (spilleren selv, eller barnet forelderen booker for)
 * — ALDRI den innloggede aktøren når de to er forskjellige.
 */
import { kanBrukeCredits } from "@/lib/booking/credits-tilgang";
import { getAvailableSlots } from "@/lib/booking/availability";
import { prisma } from "@/lib/prisma";
import type { Tier } from "@/generated/prisma/client";
import type { BookingNyV2Data } from "@/components/portal/v2/BookingNyV2";

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

export type NyWizardParams = {
  eierId: string;
  eierTier: Tier;
  /** Base-rute for wizardens egne lenker — «/portal/booking/ny» eller «/forelder/bookinger/ny/<barnId>». */
  wizardBase: string;
  dato?: string;
  service?: string;
  betaling?: string;
};

export type NyWizardResult =
  | { ingenTjenester: true }
  | { ingenTjenester: false; data: BookingNyV2Data };

export async function byggBookingNyData(params: NyWizardParams): Promise<NyWizardResult> {
  const { eierId, eierTier, wizardBase, dato: datoParam, service: serviceParam, betaling: betalingParam } = params;

  const subscription = await prisma.subscription.findUnique({
    where: { userId_kind: { userId: eierId, kind: "COACHING" } },
  });

  const harPakke =
    !!subscription && kanBrukeCredits(subscription) && subscription.monthlyCredits > 0;
  const harCreditsIgjen = harPakke && subscription!.creditsRemaining > 0;

  // Modus: credits når eieren har timer igjen og ikke eksplisitt har bedt om
  // drop-in (?betaling=1). Ellers betal per time — internt, aldri ut av appen.
  const modus: "credits" | "betaling" =
    harCreditsIgjen && betalingParam !== "1" ? "credits" : "betaling";

  const betalingGrunn: BookingNyV2Data["betalingGrunn"] =
    modus === "credits"
      ? null
      : betalingParam === "1" && harCreditsIgjen
        ? "VALGT"
        : harPakke
          ? "BRUKT_OPP"
          : "INGEN_PAKKE";

  const services = await prisma.serviceType.findMany({
    where: { active: true },
    orderBy: { durationMin: "asc" },
  });

  const locations = await prisma.location.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (services.length === 0) {
    return { ingenTjenester: true };
  }

  const valgtService =
    services.find((s) => s.slug === serviceParam) ?? services[0];

  const valgtDato = parseDatoQuery(datoParam) ?? startOfDay(new Date());

  const slots = await getAvailableSlots(valgtService.id, valgtDato);

  const aktivtSteg = !serviceParam ? 1 : !datoParam ? 2 : 3;
  const isFree = eierTier === "GRATIS";

  const resolvedLocationName = valgtService.slug.includes("trackman")
    ? "Mulligan Indoor Golf"
    : "Gamle Fredrikstad GK";
  const resolvedLocation =
    locations.find((l) =>
      l.name.toLowerCase().includes(resolvedLocationName.toLowerCase()),
    ) ?? locations[0] ?? null;
  const creditsRemaining = subscription?.creditsRemaining ?? 0;
  const monthlyCredits = subscription?.monthlyCredits ?? 0;
  const saldoEtter = creditsRemaining - 1;
  const sisteCredit = creditsRemaining === 1;

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
    wizardBase,
    modus,
    betalingGrunn,
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
    valgtServicePrisOre: valgtService.priceOre,
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
    creditsRemaining,
    monthlyCredits,
    fornyerLabel: subscription?.currentPeriodEnd
      ? subscription.currentPeriodEnd.toLocaleDateString("nb-NO", {
          day: "2-digit",
          month: "short",
        })
      : null,
    stedNavn: resolvedLocation?.name ?? null,
    saldoEtter,
    sisteCredit,
  };

  return { ingenTjenester: false, data };
}
