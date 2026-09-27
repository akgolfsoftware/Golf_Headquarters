import { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TekniskPlanPrecisionView } from "@/components/portal/teknisk/TekniskPlanPrecisionView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teknisk Plan & Progresjon | AK Golf HQ",
  description:
    "Systematisk teknisk treningsplan med grunnslag (5m draw), TrackMan radarmål, P1-P10 svingoppgaver, motoriske læringssteg og treningsdagbok.",
};

export default async function TekniskPlanPage() {
  await requirePortalUser({ kreverTilgang: "FULL" });

  return <TekniskPlanPrecisionView />;
}
