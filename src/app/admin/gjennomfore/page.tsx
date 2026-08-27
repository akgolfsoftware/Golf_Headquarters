/**
 * Gammel "Gjennomføre"-indeks (dagens/ukas økter på tvers av spillere).
 * Pensjonert (T6, 27.08.2026, docs/natt/D-LYS-OG-5T-BESLUTNING.md §2.1 rad 8)
 * til fordel for /admin/agencyos/live (AG-11, aktivt pågående) og
 * /admin/kalender (KA, bred oversikt over kommende/pågående økter).
 *
 * NB: dette gjelder kun selve indekslisten. /admin/gjennomfore/okter/[id]
 * (økt-detalj) lever videre uendret — se den mappen.
 */

import { permanentRedirect } from "next/navigation";

export default function GjennomforeRedirect() {
  permanentRedirect("/admin/kalender");
}
