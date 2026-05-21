import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { InnstillingerStub } from "@/components/meg/innstillinger-stub";

export const dynamic = "force-dynamic";

export default async function VarslerPage() {
  await requirePortalUser();
  return (
    <InnstillingerStub
      title="Notifikasjoner"
      description="Velg hvilke varsler du vil ha — push, e-post, SMS. Coach-meldinger, planendringer, foreldre-oppdateringer, turneringsvarsel."
      comingInRound="Runde 9"
    />
  );
}
