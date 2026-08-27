/**
 * AgencyOS — /admin/anlegg (27.08.2026, T13-detaljbølge).
 *
 * KONSOLIDERT inn i /admin/klubb/innstillinger — Anders' beslutning
 * (oppgavebrief 27.08.2026: "(legacy)/anlegg konsolider mot klubb, ikke
 * to"). Fasilitet-CRUD (opprett/rediger/deaktiver, bookinger denne uka) er
 * flyttet 1:1 inn i AdminKlubbInnstillingerTrainLock — se
 * src/app/admin/klubb/innstillinger/page.tsx. Denne ruten er en ren
 * redirect så gamle lenker (settings-huben sin fasiliteterHref, globalt
 * søk i src/app/api/admin/search/route.ts) fortsatt virker.
 */

import { redirect } from "next/navigation";

export default function AnleggPage() {
  redirect("/admin/klubb/innstillinger");
}
