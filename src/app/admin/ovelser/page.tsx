/**
 * Øvelsesbanken i AgencyOS (beslutning 16.10.2026, punkt 5), nå som egen coach-visning (AG11Ovelsesbank,
 * bølge 2, 20.10.2026): søk i alle øvelser, mest brukt først og «Ny øvelse». Lenken «Hele øvelsesbanken»
 * i coachens Workbench fører hit. Spillerens bank (/portal/drills, PH-13) er uendret.
 * Fasit: canvas «Øvelsesbank».
 * Avvik:
 *   - Rader åpner Øvelser i Plan-hub, der coachen endrer øvelsen.
 *   - Caddie-forslaget og break-tabellen er spillerens og er ikke med.
 * Øvelsene: AK Golf-banken, coachens egne og spillernes egne for spillerne coachen har tilgang til.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentOvelserForCoach } from "@/lib/portal-drills/ovelser-data";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG11Ovelsesbank } from "@/components/admin/precision/AG11Ovelsesbank";
import { hentBrukPerOvelse } from "@/lib/admin/ovelser/bruk";
import { medBrukSortert } from "@/lib/admin/ovelser/sorter";

export const dynamic = "force-dynamic";
export const metadata = { title: "Øvelsesbank · AgencyOS" };

export default async function AdminOvelserPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const viewer = { id: user.id, role: user.role };
  const [ovelser, bruk] = await Promise.all([hentOvelserForCoach(viewer), hentBrukPerOvelse(viewer)]);
  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG11Ovelsesbank ovelser={medBrukSortert(ovelser, bruk)} />
    </AgencyOSSkall>
  );
}
