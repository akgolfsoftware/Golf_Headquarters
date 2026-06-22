/**
 * AgencyOS — /admin/kapasitet er slått sammen med /admin/bookinger til ett
 * kombinert «Bookinger & kapasitet»-dashbord (Anders' beslutning 2026-06-22).
 * Kapasitet-heatmapen og CSV-eksporten bor nå der. Denne ruten redirecter dit
 * så gamle lenker/bokmerker fortsatt lander riktig.
 */

import { redirect } from "next/navigation";

export default function KapasitetPage() {
  redirect("/admin/bookinger");
}
