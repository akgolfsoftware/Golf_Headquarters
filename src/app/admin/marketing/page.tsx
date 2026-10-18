/**
 * Markedsføringssiden (innholdskalender for sosiale medier) er fjernet (beslutninger.md
 * §MARKEDSFØRINGSSIDEN I AGENCYOS FJERNES, Anders 16.10.2026). Adressen sender til Oppsett.
 * Tabellen `MarketingPost` blir stående; ingen data slettes.
 */

import { redirect } from "next/navigation";

export default function MarketingRedirectPage() {
  redirect("/admin/oppsett");
}
