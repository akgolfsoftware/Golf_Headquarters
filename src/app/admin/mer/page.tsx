import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { MerSide } from "@/components/admin/agencyos-ny/MerSide";

export const metadata = { title: "Mer · AgencyOS" };

export default async function MerPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  return <AgencyOSSkall navn={user.name ?? "Coach"}><MerSide erHeadCoach={user.role === "ADMIN"} /></AgencyOSSkall>;
}
