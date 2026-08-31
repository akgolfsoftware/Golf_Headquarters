import { redirect } from "next/navigation";

/**
 * /admin/organisasjon (hub) → /admin/oppsett (B7 2026-07-12, oppdatert
 * MASTERPLAN 15.3 — Oppsett er nå den ene adressen med åtte faner).
 */
export default function OrganisasjonRedirect(): never {
  redirect("/admin/oppsett");
}
