import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { InnstillingerStub } from "@/components/meg/innstillinger-stub";

export const dynamic = "force-dynamic";

export default async function OkterPage() {
  await requirePortalUser();
  return (
    <InnstillingerStub
      title="Apparater og økter"
      description="Hvor du er logget inn akkurat nå — administrer aktive sesjoner og pålitelige enheter."
      comingInRound="Runde 9"
    />
  );
}
