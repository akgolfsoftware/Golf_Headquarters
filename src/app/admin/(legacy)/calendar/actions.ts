"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { pushBooking } from "@/lib/google-calendar-kilder";
import { varsleNyBooking } from "@/lib/booking/varsle-ny-booking";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import { erCoachetSpiller, harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { audit } from "@/lib/audit";
import { logError } from "@/lib/error-tracking";
import { kanBrukeCredits } from "@/lib/booking/credits-tilgang";
import { bookingBetaling } from "@/lib/booking/betalingsvalg";
import { GavekortFeil, knyttGavekortTilBooking, losInnGavekort, slaaOppGavekort } from "@/lib/booking/gavekort";
import { tilbakeforGavekortForBooking } from "@/lib/booking/gavekort-retur";


export type OpprettOktInput = {
  spillerId: string;
  serviceTypeId: string;
  locationId: string;
  facilityId?: string;
  startAt: Date | string;
  varighetMin: number;
  notater?: string;
  /**
   * Betalingsvalg fra coachens bookingveiviser (Anders 29.09.2026). Utelatt =
   * som før (pris fra tjenesten, ingen betalingsmåte satt).
   * - KLIPP: trekker ett klipp fra spillerens coaching-pakke (samme atomiske
   *   trekk som createCreditBooking), pris 0, subscriptionId settes.
   * - FAKTURA: tjenestens pris, merket «skal faktureres» (fakturaen lages i Tripletex).
   * - GRATIS: pris 0.
   * - GAVEKORT: trekker gavekortet (`gavekode`) atomisk i samme transaksjon. Dekker det ikke alt,
   *   står resten som en Stripe-betaling (betalingslenke).
   */
  betaling?: "STRIPE" | "KLIPP" | "FAKTURA" | "GRATIS" | "GAVEKORT";
  gavekode?: string;
};

export type OpprettOktResult = {
  ok: true;
  bookingId: string;
  /** Det som gjenstår å betale med kort (øre). */
  restOre: number;
};

export async function opprettOktPaaTid(
  data: OpprettOktInput,
): Promise<OpprettOktResult> {
  const aktor = await requireCoachActionUser();

  if (!data.spillerId) throw new Error("spillerId mangler");
  if (!data.serviceTypeId) throw new Error("serviceTypeId mangler");
  if (!data.locationId) throw new Error("locationId mangler");
  if (!data.varighetMin || data.varighetMin <= 0) {
    throw new Error("varighetMin må være > 0");
  }

  const parsed = z.object({
    spillerId: z.string().min(1).max(200), serviceTypeId: z.string().min(1).max(200), locationId: z.string().min(1).max(200),
    facilityId: z.string().min(1).max(200).optional(), startAt: z.union([z.date(), z.string().min(1).max(40)]),
    varighetMin: z.number().int().min(1).max(1440), notater: z.string().max(2000).optional(),
    betaling: z.enum(["STRIPE", "KLIPP", "FAKTURA", "GRATIS", "GAVEKORT"]).optional(),
    gavekode: z.string().trim().max(40).optional(),
  }).safeParse(data);
  if (!parsed.success) throw new Error("Kontroller bookingfeltene, varighet og betalingsmåte.");
  // Datetime-local sender Oslo-veggklokke. Bevar sifrene i databasens naive
  // tidsformat også når utviklingsmaskinen kjører i en annen tidssone enn UTC.
  const rawStart = typeof data.startAt === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(data.startAt)
    ? `${data.startAt}Z` : data.startAt;
  const startAt = rawStart instanceof Date ? rawStart : new Date(rawStart);
  if (Number.isNaN(startAt.getTime())) throw new Error("Ugyldig startAt");
  if (typeof data.startAt === "string" && rawStart !== data.startAt && startAt.toISOString().slice(0, 10) !== data.startAt.slice(0, 10)) {
    throw new Error("Ugyldig startAt");
  }
  const endAt = new Date(startAt.getTime() + data.varighetMin * 60_000);

  // Verifiser at relaterte poster finnes — gir klarere feilmeldinger enn FK-feil.
  const [spiller, serviceType, location] = await Promise.all([
    prisma.user.findUnique({
      where: { id: data.spillerId },
      select: { id: true, role: true },
    }),
    prisma.serviceType.findUnique({
      where: { id: data.serviceTypeId },
      select: { id: true, priceOre: true, coachUserId: true },
    }),
    prisma.location.findUnique({
      where: { id: data.locationId },
      select: { id: true },
    }),
  ]);

  if (!spiller) throw new Error("Spiller finnes ikke");
  if (spiller.role !== "PLAYER") throw new Error("Valgt bruker er ikke en spiller");
  // Coach-scope: en coachet spiller kan bare bookes av egen coach (head coach ser alt).
  // Bevisst unntak (coached.ts): leads/ikke-coachede spillere kan bookes av alle coacher.
  if ((await erCoachetSpiller(spiller.id)) && !(await harCoachTilgangTilSpiller(aktor, spiller.id))) {
    throw new Error("Du har ikke tilgang til denne spilleren");
  }
  if (!serviceType) throw new Error("Tjeneste finnes ikke");
  if (!location) throw new Error("Lokasjon finnes ikke");

  // Verifiser facility hvis sendt (må tilhøre samme lokasjon)
  let facilityId: string | null = null;
  if (data.facilityId) {
    const facility = await prisma.facility.findUnique({
      where: { id: data.facilityId },
      select: { id: true, locationId: true, active: true },
    });
    if (!facility) throw new Error("Fasilitet finnes ikke");
    if (facility.locationId !== location.id) {
      throw new Error("Fasilitet hører ikke til valgt lokasjon");
    }
    if (!facility.active) throw new Error("Fasilitet er inaktiv");
    facilityId = facility.id;
  }

  // Klipp: spillerens coaching-pakke må ha klipp igjen. Selve trekket skjer
  // atomisk i transaksjonen under (updateMany med creditsRemaining > 0).
  let klippAbonnementId: string | null = null;
  if (data.betaling === "KLIPP") {
    const pakke = await prisma.subscription.findUnique({
      where: { userId_kind: { userId: spiller.id, kind: "COACHING" } },
      select: { id: true, status: true, currentPeriodEnd: true, monthlyCredits: true, creditsRemaining: true },
    });
    if (!pakke || !kanBrukeCredits(pakke) || pakke.monthlyCredits === 0) {
      throw new Error("Spilleren har ingen aktiv coaching-pakke med klipp.");
    }
    if (pakke.creditsRemaining <= 0) throw new Error("Spilleren har ingen klipp igjen denne måneden.");
    klippAbonnementId = pakke.id;
  }
  // Gavekort: koden sjekkes før noe lagres. Selve trekket skjer atomisk i transaksjonen under.
  if (data.betaling === "GAVEKORT") {
    if (!data.gavekode) throw new Error("Skriv inn gavekortets kode.");
    try {
      await slaaOppGavekort(prisma, data.gavekode);
    } catch (e) {
      if (e instanceof GavekortFeil) throw new Error(e.message);
      throw e;
    }
  }
  const betalingUtenGave = data.betaling === "GAVEKORT" ? null : bookingBetaling(data.betaling, serviceType.priceOre, klippAbonnementId);
  let betaling = betalingUtenGave ?? { priceOre: serviceType.priceOre, paymentMethod: null, subscriptionId: null, giftCardOre: 0 };

  let booking: { id: string };
  try {
    // Kollisjonsvern (A-pakken): coach- og fasilitets-sjekk i samme
    // transaksjon som opprettelsen — dobbeltbooking er umulig.
    booking = await prisma.$transaction(async (tx) => {
      const vern = await sjekkKollisjon(tx, {
        coachId: serviceType.coachUserId ?? null,
        serviceTypeId: serviceType.id,
        facilityId,
        startAt,
        endAt,
      });
      if (klippAbonnementId) {
        const trukket = await tx.subscription.updateMany({
          where: {
            id: klippAbonnementId, userId: spiller.id, kind: "COACHING",
            creditsRemaining: { gt: 0 }, monthlyCredits: { gt: 0 },
            OR: [{ status: "ACTIVE" }, { status: "CANCELLED", currentPeriodEnd: { gt: new Date() } }],
          },
          data: { creditsRemaining: { decrement: 1 } },
        });
        if (trukket.count === 0) throw new Error("Spilleren har ingen klipp igjen denne måneden.");
      }
      let gave: Awaited<ReturnType<typeof losInnGavekort>> | null = null;
      if (data.betaling === "GAVEKORT" && data.gavekode) {
        gave = await losInnGavekort(tx, data.gavekode, serviceType.priceOre);
        betaling = bookingBetaling("GAVEKORT", serviceType.priceOre, null, gave.dekketOre);
      }
      const lagret = await tx.booking.create({
        data: {
          plassNr: vern.plassNr,
          userId: spiller.id,
          serviceTypeId: serviceType.id,
          locationId: location.id,
          facilityId,
          startAt,
          endAt,
          status: "CONFIRMED",
          priceOre: betaling.priceOre,
          giftCardOre: betaling.giftCardOre,
          ...(betaling.paymentMethod ? { paymentMethod: betaling.paymentMethod } : {}),
          ...(betaling.subscriptionId ? { subscriptionId: betaling.subscriptionId } : {}),
          coachId: serviceType.coachUserId ?? null,
          notes: data.notater?.trim() || null,
        },
        select: { id: true },
      });
      if (gave) await knyttGavekortTilBooking(tx, gave.transaksjonId, lagret.id);
      return lagret;
    });
  } catch (e) {
    if (erKollisjonsfeil(e)) {
      throw new Error(kollisjonsmelding(e));
    }
    if (e instanceof GavekortFeil) throw new Error(e.message);
    throw e;
  }

  // C8 (booking-trygging): skriv til coachens Google-kalender med én gang —
  // før hang dette på 15-min-cronen. Best-effort: feil stopper aldri bookingen.
  try {
    await pushBooking(booking.id);
  } catch (error) {
    await logError({ context: "admin.calendar.pushBooking", error, meta: { bookingId: booking.id }, severity: "warn" });
  }

  // Varsle coach/admin — også manuelt lagte økter skal dukke opp i varsel-lista.
  await varsleNyBooking(booking.id, "manuell");

  await audit({
    actorId: aktor.id,
    action: "booking.created",
    target: `Booking:${booking.id}`,
    metadata: {
      via: "calendar.quick-add",
      spillerId: spiller.id,
      serviceTypeId: serviceType.id,
      locationId: location.id,
      startAt: startAt.toISOString(),
      varighetMin: data.varighetMin,
      betaling: data.betaling ?? null,
      giftCardOre: betaling.giftCardOre,
    },
  });

  revalidatePath("/admin/kalender");
  revalidatePath("/admin/bookinger");

  return { ok: true, bookingId: booking.id, restOre: betaling.priceOre };
}

/**
 * Flytt en eksisterende booking til et nytt tidspunkt. Brukes av drag-drop
 * i kalender-grid. Beholder varighet (endAt = nytt startAt + opprinnelig
 * varighet).
 */
export async function moveSession(
  bookingId: string,
  newStartAt: Date | string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const aktor = await requireCoachActionUser();

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, ...coachBookingScope(aktor) },
    select: { id: true, startAt: true, endAt: true, status: true, coachId: true, facilityId: true, serviceTypeId: true },
  });
  if (!booking) return { ok: false, feil: "Booking ikke funnet" };
  if (booking.status === "CANCELLED" || booking.status === "NO_SHOW") {
    return { ok: false, feil: "Booking er allerede kansellert eller merket no-show" };
  }

  const start =
    newStartAt instanceof Date ? newStartAt : new Date(newStartAt);
  if (Number.isNaN(start.getTime())) {
    return { ok: false, feil: "Ugyldig start-tidspunkt" };
  }
  const varighetMs = booking.endAt.getTime() - booking.startAt.getTime();
  const end = new Date(start.getTime() + varighetMs);

  try {
    await prisma.$transaction(async (tx) => {
      const vern = await sjekkKollisjon(tx, {
        coachId: booking.coachId,
        serviceTypeId: booking.serviceTypeId,
        facilityId: booking.facilityId,
        startAt: start,
        endAt: end,
        ekskluderBookingId: bookingId,
      });
      await tx.booking.update({
        where: { id: bookingId },
        data: { startAt: start, endAt: end, plassNr: vern.plassNr },
      });
    });
  } catch (e) {
    if (erKollisjonsfeil(e)) return { ok: false, feil: kollisjonsmelding(e) };
    throw e;
  }

  try {
    await pushBooking(bookingId);
  } catch (error) {
    await logError({ context: "admin.calendar.pushBooking.move", error, meta: { bookingId }, severity: "warn" });
  }

  await audit({
    actorId: aktor.id,
    action: "booking.moved",
    target: `Booking:${bookingId}`,
    metadata: {
      from: booking.startAt.toISOString(),
      to: start.toISOString(),
    },
  });

  revalidatePath("/admin/kalender");
  revalidatePath("/admin/bookinger");
  return { ok: true };
}

/**
 * Opprett en ny økt fra et ledig slot i kalenderen. Tynt wrapper rundt
 * opprettOktPaaTid for å gi mer idiomatisk navn fra UI.
 */
export async function createSessionFromCalendar(data: OpprettOktInput) {
  return opprettOktPaaTid(data);
}

/**
 * Kanseller en booking (myk-sletting via status=CANCELLED). Beholder
 * historikk og audit-log.
 */
export async function cancelSession(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const aktor = await requireCoachActionUser();

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, ...coachBookingScope(aktor) },
    select: { id: true, status: true, userId: true, startAt: true },
  });
  if (!booking) return { ok: false, feil: "Booking ikke funnet" };
  if (booking.status === "CANCELLED") {
    return { ok: false, feil: "Booking er allerede kansellert" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
  // Coach som avlyser gir alltid alt tilbake, også gavekortbeløpet.
  await tilbakeforGavekortForBooking(bookingId);

  await audit({
    actorId: aktor.id,
    action: "booking.cancelled",
    target: `Booking:${bookingId}`,
    metadata: {
      via: "calendar.cancel",
      userId: booking.userId,
      startAt: booking.startAt.toISOString(),
    },
  });

  revalidatePath("/admin/kalender");
  revalidatePath("/admin/bookinger");
  return { ok: true };
}
