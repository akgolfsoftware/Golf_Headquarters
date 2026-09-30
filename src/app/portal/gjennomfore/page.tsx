/**
 * /portal/gjennomfore — PH-02 «Gjør nå» utgikk 28.09.2026 (Precision Athletics runde 20).
 * Siden gjentok bare dagens økter; de ligger nå i agendaen på PH-01 I dag (/portal).
 * Gamle lenker sendes videre. Økt-detaljen /portal/gjennomfore/[id] er uendret.
 * GjorV2 og getGjennomforeData beholdes i koden til Anders har godkjent fjerningen.
 */

import { redirect } from "next/navigation";

export default function GjennomforeRedirect(): never {
  redirect("/portal");
}
