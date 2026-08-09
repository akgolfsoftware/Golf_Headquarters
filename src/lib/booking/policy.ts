/**
 * Booking policy — én kilde for avbestilling, refusjon og ombooking.
 *
 * Brukes av server-actions (cancel/reschedule) og kan eksporteres til UI
 * (PolicyBanner) uten å duplisere 24t-reglen.
 *
 * Tidssone: sammenlign alltid med Date (UTC-ms). Visning formateres i UI
 * med Europe/Oslo.
 */

export const AVBESTILLING_FRIST_TIMER = 24;

export type BookingPolicyActor =
  | { kind: "player"; userId: string }
  | { kind: "parent"; userId: string }
  | { kind: "coach"; userId: string }
  | { kind: "admin"; userId: string };

export type BookingPolicySnapshot = {
  id: string;
  userId: string | null;
  coachId: string | null;
  serviceCoachUserId: string | null;
  startAt: Date;
  status: string;
  /** Credit-booking hvis subscriptionId satt. */
  subscriptionId: string | null;
  /** Betalt booking hvis Stripe PI finnes. */
  stripePaymentIntentId: string | null;
  priceOre: number;
};

export type CancelOutcome = {
  allowed: boolean;
  reasonIfDenied: string | null;
  /** Staff eller >24t til start. */
  restoreCredit: boolean;
  /** Staff eller >24t, og det finnes PaymentIntent. */
  refundStripe: boolean;
  /** Under 24t for spiller — avbestilling tillatt men uten kompensasjon. */
  lateCancelNoRefund: boolean;
  /** Menneskelig kort tekst (nb). */
  playerMessage: string;
  hoursUntilStart: number;
};

export type RescheduleOutcome = {
  allowed: boolean;
  reasonIfDenied: string | null;
  requiresStaffOverride: boolean;
  playerMessage: string;
  hoursUntilStart: number;
};

export function hoursUntil(startAt: Date, now: Date = new Date()): number {
  return (startAt.getTime() - now.getTime()) / (60 * 60 * 1000);
}

export function isStaffForBooking(
  actor: BookingPolicyActor,
  booking: Pick<BookingPolicySnapshot, "coachId" | "serviceCoachUserId">,
): boolean {
  if (actor.kind === "admin") return true;
  if (actor.kind === "coach") {
    return (
      booking.coachId === actor.userId ||
      booking.serviceCoachUserId === actor.userId
    );
  }
  return false;
}

export function canActOnBooking(
  actor: BookingPolicyActor,
  booking: Pick<BookingPolicySnapshot, "userId" | "coachId" | "serviceCoachUserId">,
): boolean {
  if (booking.userId && booking.userId === actor.userId) return true;
  return isStaffForBooking(actor, booking);
}

/**
 * Avbestillingsutfall.
 * - Spillere/foresatte kan alltid avbestille egne bookinger (status ikke CANCELLED).
 * - Refusjon/credit kun hvis staff ELLER mer enn 24t til start.
 */
export function cancelOutcome(
  booking: BookingPolicySnapshot,
  actor: BookingPolicyActor,
  now: Date = new Date(),
): CancelOutcome {
  const h = hoursUntil(booking.startAt, now);

  if (booking.status === "CANCELLED") {
    return {
      allowed: false,
      reasonIfDenied: "Bookingen er allerede avbestilt.",
      restoreCredit: false,
      refundStripe: false,
      lateCancelNoRefund: false,
      playerMessage: "Allerede avbestilt.",
      hoursUntilStart: h,
    };
  }

  if (!canActOnBooking(actor, booking)) {
    return {
      allowed: false,
      reasonIfDenied: "Du har ikke tilgang til denne bookingen.",
      restoreCredit: false,
      refundStripe: false,
      lateCancelNoRefund: false,
      playerMessage: "Ingen tilgang.",
      hoursUntilStart: h,
    };
  }

  const staff = isStaffForBooking(actor, booking);
  const withinWindow = h > AVBESTILLING_FRIST_TIMER;
  const kanKompenseres = staff || withinWindow;

  const restoreCredit = Boolean(booking.subscriptionId && kanKompenseres);
  const refundStripe = Boolean(booking.stripePaymentIntentId && kanKompenseres);
  const lateCancelNoRefund = !kanKompenseres;

  let playerMessage: string;
  if (staff) {
    playerMessage = "Staff: full kompensasjon (credit/refusjon) uavhengig av frist.";
  } else if (restoreCredit) {
    playerMessage = "Credit returneres til abonnementet.";
  } else if (refundStripe) {
    playerMessage = "Refusjon via betaling — vanligvis 5–10 bankdager.";
  } else if (lateCancelNoRefund) {
    playerMessage = `Mindre enn ${AVBESTILLING_FRIST_TIMER} timer til start — ingen credit/refusjon.`;
  } else {
    playerMessage = "Avbestilling registreres.";
  }

  return {
    allowed: true,
    reasonIfDenied: null,
    restoreCredit,
    refundStripe,
    lateCancelNoRefund,
    playerMessage,
    hoursUntilStart: h,
  };
}

/**
 * Ombooking: spiller trenger >24t; staff kan alltid.
 * (Selve slot-sjekk skjer i action — policy sjekker bare tidsvindu + tilgang.)
 */
export function rescheduleOutcome(
  booking: BookingPolicySnapshot,
  actor: BookingPolicyActor,
  now: Date = new Date(),
): RescheduleOutcome {
  const h = hoursUntil(booking.startAt, now);

  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    return {
      allowed: false,
      reasonIfDenied: "Kan ikke ombooke avbestilt eller fullført time.",
      requiresStaffOverride: false,
      playerMessage: "Ombooking ikke mulig for denne statusen.",
      hoursUntilStart: h,
    };
  }

  if (!canActOnBooking(actor, booking)) {
    return {
      allowed: false,
      reasonIfDenied: "Du har ikke tilgang til denne bookingen.",
      requiresStaffOverride: false,
      playerMessage: "Ingen tilgang.",
      hoursUntilStart: h,
    };
  }

  const staff = isStaffForBooking(actor, booking);
  if (staff) {
    return {
      allowed: true,
      reasonIfDenied: null,
      requiresStaffOverride: false,
      playerMessage: "Staff kan flytte uten 24t-frist.",
      hoursUntilStart: h,
    };
  }

  if (h <= AVBESTILLING_FRIST_TIMER) {
    return {
      allowed: false,
      reasonIfDenied: `Ombooking krever mer enn ${AVBESTILLING_FRIST_TIMER} timer til start. Kontakt coach.`,
      requiresStaffOverride: true,
      playerMessage: `Under ${AVBESTILLING_FRIST_TIMER}t — be coach flytte timen.`,
      hoursUntilStart: h,
    };
  }

  return {
    allowed: true,
    reasonIfDenied: null,
    requiresStaffOverride: false,
    playerMessage: "Du kan velge ny tid.",
    hoursUntilStart: h,
  };
}

/** Kort policy-tekst for bekreftelsessteg / detalj. */
export function policyBannerTexts(): {
  cancel: string;
  reschedule: string;
  creditsSeparate: string;
} {
  return {
    cancel: `Avbestilling mer enn ${AVBESTILLING_FRIST_TIMER} timer før start: credit eller refusjon. Under ${AVBESTILLING_FRIST_TIMER} timer: ingen kompensasjon (coach/admin kan overstyre).`,
    reschedule: `Ombooking mer enn ${AVBESTILLING_FRIST_TIMER} timer før start. Nærmere: kontakt coach.`,
    creditsSeparate:
      "Coaching-timer (credits) kommer fra Performance-pakke — ikke fra app-abonnementet alene.",
  };
}

/** Mappe portal-brukerrolle til policy-actor. */
export function actorFromRole(
  userId: string,
  role: string,
): BookingPolicyActor {
  if (role === "ADMIN") return { kind: "admin", userId };
  if (role === "COACH") return { kind: "coach", userId };
  if (role === "PARENT") return { kind: "parent", userId };
  return { kind: "player", userId };
}
