/**
 * Rapportbyggeren (AG-A07) er fjernet (beslutninger.md §SLETTEDIALOG … RAPPORTBYGGEREN
 * FJERNES, Anders 28.09.2026). Adressen sender til Økonomi.
 */

import { redirect } from "next/navigation";

export default function ReportsRedirectPage() {
  redirect("/admin/agencyos/okonomi");
}
