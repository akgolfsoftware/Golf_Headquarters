// Offentlig booking er PAUSET (2026-07-27, Anders): kundene skal fortsatt
// booke via Acuity (akgolfgroup.as.me) på ALLE domener. Kun ADMIN (Anders)
// ser og kan bruke den innebygde flyten — for testing før lansering.
//
// BOOKING_ACTIVE sto allerede =true i Vercel prod da pausen ble bestilt, og
// kan derfor ikke lenger bety «åpen for alle» — den leses ikke lenger. Ny
// variabel BOOKING_PUBLIC styrer offentlig lansering: sett BOOKING_PUBLIC=true
// i Vercel (+ redeploy) når flyten skal åpnes for kundene.

import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export const BOOKING_ACUITY_URL =
  process.env.NEXT_PUBLIC_ACUITY_URL ?? "https://akgolfgroup.as.me";

/** Innebygd (marketing-)booking: åpen for alle først når BOOKING_PUBLIC=true,
 *  ellers kun for innlogget ADMIN. Portal-credit-booking berøres ikke. */
export async function kanBrukeInnebygdBooking(): Promise<boolean> {
  if (process.env.BOOKING_PUBLIC === "true") return true;
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}
