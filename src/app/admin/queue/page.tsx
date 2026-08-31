import { redirect } from "next/navigation";

/**
 * `/admin/queue` → `/admin/spillere?fane=oppfolging` (MASTERPLAN 15.11,
 * beslutning 6.6: oppfølging av spillere er IKKE Kø — den hører i Stall).
 *
 * Data og visning lever nå i `src/lib/admin/spillere/last-oppfolging.ts` +
 * `src/components/admin/v2/spillere/OppfolgingsKoV2.tsx`. `_board.tsx` og
 * `actions.ts` i denne mappa er UENDRET — kanban-boardet og
 * server-actionen (`settOppfolgingsstatus`) importeres derfra, ikke duplisert.
 */
export default function OppfolgingskoRedirect(): never {
  redirect("/admin/spillere?fane=oppfolging");
}
