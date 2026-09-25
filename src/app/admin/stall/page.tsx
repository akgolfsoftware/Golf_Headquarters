import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { StallPrecisionView } from "@/components/admin/stall/StallPrecisionView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stall · AgencyOS" };

export default async function AdminStallDirektePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <V2Shell bredde="full" aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <StallPrecisionView />
    </V2Shell>
  );
}
