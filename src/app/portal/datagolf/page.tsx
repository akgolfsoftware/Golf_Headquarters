/**
 * Flyttet (T6, 2026-08-16): DataGolf bor nå under Analyse —
 * /portal/analysere/datagolf. Gammel adresse beholdes som redirect så
 * bokmerker og eldre lenker fortsatt virker.
 */

import { redirect } from "next/navigation";

export default function DataGolfFlyttetPage() {
  redirect("/portal/analysere/datagolf");
}
