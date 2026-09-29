/**
 * AG-08 Spiller 360 i Precision Athletics (`/admin/spillere/[id]`).
 * Tegning: Claude Design 7d7c2994, ui_kits/agencyos/screens/AG-360.jsx (runde 27)
 * og AG-08-IUP.jsx (runde 31).
 *
 * Tilgang som før: requirePortalUser (ADMIN/COACH) og spilleren må være i
 * coachens stall (coachScopedPlayerWhere) — ellers notFound(). Fraværsdata
 * maskeres etter spillerens samtykke (innsynsNivaaFra), som før.
 *
 * `?fane=` velger fane (plan · stats · tp · test · iup · samtaler · talent),
 * `?del=` Stats-delen (snitt · sg · tren · test);
 * bare fanens data hentes. `?vis=360` legger stallen ved siden av
 * (arbeidsvisningen fra før). De gamle undersidene /analyse, /tester og /plan
 * sender hit med riktig fane; /fremgang og /profil sendte hit fra før.
 *
 * Server component.
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG08Spiller360 } from "@/components/admin/precision/AG08Spiller360";
import { lastSpiller360Fane, lastSpiller360Hode, lastSpiller360Rail } from "@/lib/admin-spiller/spiller360-data";
import { tilFane } from "@/lib/admin-spiller/spiller360-visning";

export const dynamic = "force-dynamic";
export const metadata = { title: "Spiller 360 · AgencyOS" };

export default async function Spiller360Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fane?: string; vis?: string; del?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;
  const { fane: faneParam, vis, del } = await searchParams;
  const viewer = { id: user.id, role: user.role };
  const fane = tilFane(faneParam);

  const hode = await lastSpiller360Hode(viewer, id);
  if (!hode) notFound();

  const [faneData, rail] = await Promise.all([
    lastSpiller360Fane(viewer, id, fane),
    vis === "360" ? lastSpiller360Rail(viewer, id) : Promise.resolve(null),
  ]);
  if (!faneData) notFound();

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG08Spiller360 tilstand="data" hode={hode} fane={fane} faneData={faneData} rail={rail} statsDel={del ?? null} />
    </AgencyOSSkall>
  );
}
