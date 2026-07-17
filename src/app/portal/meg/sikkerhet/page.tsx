/**
 * D7-konsolidering (Anders 17. juli 2026): /portal/meg/sikkerhet er slått
 * sammen med /portal/meg/innstillinger/sikkerhet — den kanoniske skjermen.
 * Denne adressen beholdes kun som redirect (gamle lenker/bokmerker).
 * Undersiden /portal/meg/sikkerhet/2fa lever videre uendret.
 */

import { redirect } from "next/navigation";

export default function SikkerhetRedirect() {
  redirect("/portal/meg/innstillinger/sikkerhet");
}
