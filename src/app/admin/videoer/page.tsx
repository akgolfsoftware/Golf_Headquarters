/**
 * Coaching-videoer — AG-18 i Precision Athletics (/admin/videoer).
 *
 * Viser videogalleriet i AG18TrackManVideo med startFane="video".
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG18TrackManVideo } from "@/components/admin/precision/AG18TrackManVideo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Videoer · AgencyOS" };

export default async function VideoerPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG18TrackManVideo startFane="video" />
    </AgencyOSSkall>
  );
}
