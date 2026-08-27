import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
import { GruppeFaner } from "@/components/admin/v2/GruppeFaner";
import { SkoledataForm } from "./skoledata-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skoledata · Grupper · AgencyOS" };

export default async function SkoledataPage({ params }: { params: Promise<{ id: string }> }) {
  // G6: skoledata redigerer årsplan-grunnlaget → EDIT_GROUP_PLANS.
  const user = await requireCapability(Capability.EDIT_GROUP_PLANS);
  const { id } = await params;

  const gruppe = await prisma.group.findUnique({ where: { id }, select: { id: true } });
  if (!gruppe) notFound();

  return (
    <V2Shell bredde="kolonne" aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TlTilbake href={`/admin/grupper/${id}/arsplan`}>Årsplan</TlTilbake>

      <div className="flex flex-col gap-4">
        <GruppeFaner groupId={id} aktiv="skoledata" />

        <div>
          <h1 className="mb-1 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">Legg inn skoledata</h1>
          <p className="mb-4 max-w-2xl text-[13px] text-muted-foreground">
            Lim inn skolerute, timeplan eller prøveplan — ett rad per linje. Brukes til å legge inn
            strukturen fra skolens prøveplan/timeplan når den er publisert.
          </p>

          <SkoledataForm groupId={id} />
        </div>
      </div>
    </V2Shell>
  );
}
