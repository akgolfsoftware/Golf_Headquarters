/**
 * Data-loader for booking-bekreft-steget. Trukket ut av
 * `/portal/booking/ny/bekreft/page.tsx` (STEG 9.8) — se ny-wizard-data.ts for
 * hvorfor. `eierId`/`eierTier` er PERSONEN bookingen gjelder for.
 */
import { kanBrukeCredits } from "@/lib/booking/credits-tilgang";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import { prisma } from "@/lib/prisma";
import type { BookingNyBekreftV2Data } from "@/components/portal/v2/BookingNyBekreftV2";

export type BekreftParams = {
  eierId: string;
  /** «/portal/booking/ny» eller «/forelder/bookinger/ny/<barnId>». */
  wizardBase: string;
  /** Base-rute til kvitteringssiden — «/portal/booking/bekreftet» eller «/forelder/bookinger/bekreftet». */
  bekreftetBase: string;
  /** Sendes til opprettBooking/opprettBookingMedKort slik at de kan verifisere forelder→barn-koblingen på nytt. */
  barnId?: string;
  serviceSlug: string;
  start: string;
  coachId: string;
  betaling?: string;
};

export type BekreftResult =
  | { status: "ikke_funnet" }
  | { status: "krever_credits_redirect" }
  | { status: "ok"; data: BookingNyBekreftV2Data };

export async function byggBookingBekreftData(params: BekreftParams): Promise<BekreftResult> {
  const { eierId, wizardBase, bekreftetBase, barnId, serviceSlug, start, coachId, betaling } = params;
  const erBetaling = betaling === "1";

  const subscription = await prisma.subscription.findUnique({
    where: { userId_kind: { userId: eierId, kind: "COACHING" } },
  });
  if (!erBetaling) {
    if (
      !subscription ||
      !kanBrukeCredits(subscription) ||
      subscription.monthlyCredits === 0 ||
      subscription.creditsRemaining <= 0
    ) {
      return { status: "krever_credits_redirect" };
    }
  }

  const service = await prisma.serviceType.findUnique({ where: { slug: serviceSlug } });
  if (!service || !service.active) return { status: "ikke_funnet" };

  const startAt = new Date(start);
  if (isNaN(startAt.getTime())) return { status: "ikke_funnet" };

  const coachUser = await prisma.user.findUnique({
    where: { id: coachId },
    select: { id: true, name: true },
  });
  if (!coachUser) return { status: "ikke_funnet" };

  const ledig = await isSlotStillAvailable(service.id, startAt, coachId);

  const dato = startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const klokkeslett = startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const datoTid = `${dato.charAt(0).toUpperCase()}${dato.slice(1)} · ${klokkeslett}`;

  const creditsRemaining = subscription?.creditsRemaining ?? 0;
  const saldoEtter = creditsRemaining - 1;

  const backHref = `${wizardBase}?service=${serviceSlug}&dato=${
    startAt.toISOString().split("T")[0]
  }${erBetaling ? "&betaling=1" : ""}`;

  const data: BookingNyBekreftV2Data = {
    barnId,
    bekreftetBase,
    modus: erBetaling ? "betaling" : "credits",
    prisOre: service.priceOre,
    serviceTypeId: service.id,
    coachId,
    startIso: startAt.toISOString(),
    backHref,
    ledig,
    rader: [
      { label: "Økt-type", verdi: service.name },
      { label: "Coach", verdi: coachUser.name ?? "Coach" },
      { label: "Dato/tid", verdi: datoTid },
      { label: "Varighet", verdi: `${service.durationMin} min` },
      {
        label: erBetaling ? "Pris" : "Kostnad",
        verdi: erBetaling ? `${service.priceOre / 100} kr` : "1 av månedens timer",
      },
    ],
    creditsRemaining,
    saldoEtter,
  };

  return { status: "ok", data };
}
