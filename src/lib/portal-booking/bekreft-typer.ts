/** Data til bekreft-steget i booking (spiller og forelder). Alt serialiserbart; siden eier spørringene. */
export type BekreftRad = { label: string; verdi: string };

export type BookingBekreftData = {
  /** Barnet bookingen gjelder for (forelder booker for barnet). Undefined = spilleren selv. */
  barnId?: string;
  /** Kvitteringssiden etter fullført booking. Standard «/portal/booking/bekreftet». */
  bekreftetBase?: string;
  /** Etikett øverst («PlayerHQ» eller «Foreldreportal»). */
  merkelapp?: string;
  /** «credits» = trekk ett klipp. «betaling» = kort via Stripe Checkout. */
  modus: "credits" | "betaling";
  prisOre: number;
  serviceTypeId: string;
  coachId: string;
  /** Sendes uendret til createCreditBooking / opprettBookingMedKort. */
  startIso: string;
  backHref: string;
  /** Tiden er fortsatt ledig (isSlotStillAvailable). */
  ledig: boolean;
  rader: BekreftRad[];
  creditsRemaining: number;
  saldoEtter: number;
};
