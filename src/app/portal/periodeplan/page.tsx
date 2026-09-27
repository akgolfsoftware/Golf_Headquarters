import { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PeriodeplanPyramideView } from "@/components/portal/toppidrett/PeriodeplanPyramideView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Periodeplan & Utviklingspyramiden | AK Golf HQ",
  description:
    "Periodeplanlegging og utviklingspyramiden for toppidrett med 5 nivåer (FYS, TEK, SLAG, SPILL, TURN), P1-P10 svingposisjoner og TrackMan-parametre.",
};

export default async function PeriodeplanPage() {
  await requirePortalUser({ kreverTilgang: "FULL" });

  return <PeriodeplanPyramideView />;
}
