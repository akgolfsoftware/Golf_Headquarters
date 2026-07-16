import { redirect } from "next/navigation";

/**
 * /kommando/kalender → /admin/kalender (B8, 2026-07-16).
 * Booking- og oppgavefrist-sammenslåingen finnes nå i den ekte AgencyOS-
 * kalenderen (KommandoTask.dueAt vises som "Oppgave-frist"-blokker der) —
 * ingen funksjonstap.
 */
export default function KommandoKalenderRedirect(): never {
  redirect("/admin/kalender");
}
