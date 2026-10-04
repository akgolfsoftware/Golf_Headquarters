/**
 * Opptaksstudio — AG-18 i Precision Athletics (/admin/recording).
 *
 * Viser to-kamera opptaksstudio i AG18TrackManVideo med startFane="opptak".
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG18TrackManVideo } from "@/components/admin/precision/AG18TrackManVideo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Opptaksstudio · AgencyOS" };

export default async function RecordingAdmin() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG18TrackManVideo startFane="opptak" />
    </AgencyOSSkall>
  );
}
