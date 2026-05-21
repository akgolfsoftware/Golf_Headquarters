import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { InnstillingerStub } from "@/components/meg/innstillinger-stub";

export const dynamic = "force-dynamic";

export default async function EksportPage() {
  await requirePortalUser();
  return (
    <InnstillingerStub
      title="Eksport av data"
      description="Last ned alle dine data — runder, økter, TrackMan-shots, kommentarer, planer — som CSV eller JSON. GDPR-rettighet."
      comingInRound="Runde 9"
    />
  );
}
