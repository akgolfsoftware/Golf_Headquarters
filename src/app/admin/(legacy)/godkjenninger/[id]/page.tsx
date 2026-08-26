/**
 * AgencyOS — Godkjenning detaljvisning (LEGACY, redirect).
 *
 * T3 (26.08.2026): porten til Train-lock (AG-10/AG-10b) bygde master–detalj
 * rett inn i /admin/godkjenninger (AdminGodkjenningerTrainLock) — klikk på en
 * kø-rad velger saken i inspektørpanelet på desktop, og mobilkortet viser
 * hele detaljen inline. Det finnes derfor ikke lenger noen egen id-rute å
 * vise: denne siden sender videre til køen. `id` brukes ikke til å velge
 * saken automatisk (ingen delelenke-kontrakt fantes fra før), men ruten
 * bevares slik at gamle lenker/bokmerker ikke 404.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GodkjenningDetailRedirect() {
  redirect("/admin/godkjenninger");
}
