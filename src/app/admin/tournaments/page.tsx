import { redirect } from "next/navigation";

/**
 * /admin/tournaments → /admin/turnering
 *
 * MASTERPLAN 15.6 (beslutning 6.9, «én inngang per funksjon»): fire
 * turnering-adresser ble til én. Den gamle stall-filtrerte visningen denne
 * siden hadde, lever videre som fanen «Mine spillere» — standardfanen «Alle»
 * er en NY, full liste over hele turneringsbasen.
 */
export default function TournamentsRedirect(): never {
  redirect("/admin/turnering");
}
