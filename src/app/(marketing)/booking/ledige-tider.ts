"use server";

/**
 * Ledige tider for den offentlige bookingsiden (PP-1.7, Paper-fasit
 * `fase1/booking.html`). Fasiten viser sju dager i en vannrett strimmel med
 * antall ledige luker per dag — én tidsliste, ikke én per rom, fordi ressursen
 * er coachens tid. Derfor hentes alle dagene i ett kall når tjenesten velges,
 * i stedet for en sidelasting per dag slik `/booking/[slug]` gjorde.
 *
 * All formatering er Oslo-tid (gotcha: Vercel kjører UTC).
 */

import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/booking/availability";
import { kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";
import { publicAction } from "@/lib/auth/action-guards";

const OSLO = "Europe/Oslo";
const DAGER_FRAM = 7;

const ukedag = new Intl.DateTimeFormat("nb-NO", { weekday: "short", timeZone: OSLO });
const datokort = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "numeric", timeZone: OSLO });
const datolangt = new Intl.DateTimeFormat("nb-NO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: OSLO,
});
const klokke = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: OSLO });

export type LedigTid = {
  /** «13:00» — visningsklokke i Oslo-tid. */
  kl: string;
  /** ISO-tidspunkt som sendes til createBookingCheckout. */
  startIso: string;
  coachId: string;
};

export type LedigDag = {
  /** «man» */
  dw: string;
  /** «4.8» — kort datomerke, brukes også som nøkkel i UI-et. */
  dd: string;
  /** «mandag 4. august» */
  navn: string;
  tider: LedigTid[];
};

export async function hentLedigeDager(slug: string): Promise<LedigDag[]> {
  // Bevisst åpen for uinnloggede: bookingsiden er inngangen for folk uten
  // konto, og ledige luker er offentlig informasjon. Ingen persondata leses.
  publicAction();
  // Samme forsvarslinje som resten av den offentlige flyten: server-actionen
  // kan kalles direkte, uavhengig av hva UI-et viser.
  if (!(await kanBrukeInnebygdBooking())) return [];

  const service = await prisma.serviceType.findUnique({ where: { slug } });
  if (!service || !service.active) return [];

  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  const dager: LedigDag[] = [];
  for (let i = 0; i < DAGER_FRAM; i++) {
    const d = new Date(idag);
    d.setDate(d.getDate() + i);

    const alle = await getAvailableSlots(service.id, d);
    // Markus-tjenester skal ikke vise Anders' tider (samme filter som /booking/[slug]).
    const slots = service.coachUserId
      ? alle.filter((s) => s.coachId === service.coachUserId)
      : alle;

    dager.push({
      dw: ukedag.format(d).replace(".", ""),
      dd: datokort.format(d),
      navn: datolangt.format(d),
      tider: slots.map((s) => ({
        kl: klokke.format(s.start),
        startIso: s.start.toISOString(),
        coachId: s.coachId,
      })),
    });
  }

  return dager;
}
