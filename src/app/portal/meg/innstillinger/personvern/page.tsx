import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { InnstillingerStub } from "@/components/meg/innstillinger-stub";

export const dynamic = "force-dynamic";

export default async function PersonvernPage() {
  await requirePortalUser();
  return (
    <InnstillingerStub
      title="Personvern"
      description="Synlighet, datadeling, GDPR-eksport og sletting. Hvem ser hva av profilen din."
      comingInRound="Runde 9"
    />
  );
}
