import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { InnstillingerStub } from "@/components/meg/innstillinger-stub";

export const dynamic = "force-dynamic";

export default async function SprakPage() {
  await requirePortalUser();
  return (
    <InnstillingerStub
      title="Språk og region"
      description="Hva appen vises på (norsk/engelsk), tidssone og datoformat."
      comingInRound="Runde 9"
    />
  );
}
