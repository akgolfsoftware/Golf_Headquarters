import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { LivePrecisionView } from "@/components/portal/live/LivePrecisionView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live økt · PlayerHQ" };

export default async function LiveOktPage() {
  await requirePortalUser({ kreverTilgang: "FULL" });

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#141413]">
      <LivePrecisionView />
    </div>
  );
}
