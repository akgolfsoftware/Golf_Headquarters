/**
 * /admin/oppfolging — alias-rute til /admin/queue (Oppfølgingskø).
 *
 * Bølge D: designet i `05-oppfolgingsko.html` bruker URL-en
 * `/admin/oppfolging`. Vi re-eksporterer eksisterende
 * `queue/page.tsx` for å unngå duplisert logikk.
 */

import QueuePage from "@/app/admin/(legacy)/queue/page";

export const dynamic = "force-dynamic";

export default QueuePage;
