import { permanentRedirect } from "next/navigation";

/**
 * Pensjonert 2026-08-29 (rad 2 i §5T-tabellen, godkjent av Anders 27.08).
 *
 * Siden viste SessionRequest — økt-ønsker fra spillere via /portal/onskeligokt —
 * med godta/avvis. Verifisert før pensjonering at funksjonen finnes to andre
 * steder: `/admin/innboks` (kilde "sessionRequest" i innboks-saker.ts) og
 * `/admin/godkjenninger`, som er «Kø» i AX-01-railen. Ingen funksjon går tapt,
 * kun adressen forsvinner.
 */
export default function ForesporslerRedirect() {
  permanentRedirect("/admin/innboks");
}
