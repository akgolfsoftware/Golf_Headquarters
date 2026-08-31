import { redirect } from "next/navigation";

/**
 * /admin/stats/moderering → /admin/ko?fane=moderering
 *
 * MASTERPLAN 15.13: siden hadde ingen vei inn (arkitektur-kartlegging
 * 30.08.2026, «Skjermer ingen kan finne»). Kø samler «noe som venter på
 * Anders» (MASTERPLAN 15.1) — moderering hører hjemme der. Loaderen flyttet
 * ordrett til src/lib/admin/ko/last-moderering.ts; actions.ts (godkjennSak/
 * avvisSak/utforGdprSletting) er UENDRET og ligger fortsatt i denne mappen.
 */
export default function ModereringRedirect(): never {
  redirect("/admin/ko?fane=moderering");
}
