import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { SkoledataForm } from "./skoledata-form";

export const dynamic = "force-dynamic";

export default async function SkoledataPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const gruppe = await prisma.group.findUnique({ where: { id }, select: { id: true } });
  if (!gruppe) notFound();

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href={`/admin/grupper/${id}/arsplan`}>Årsplan</TilbakeLenke>

      <h1 className="mb-1 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">Legg inn skoledata</h1>
      <p className="mb-4 max-w-2xl text-[13px] text-muted-foreground">
        Lim inn skolerute, timeplan eller prøveplan — ett rad per linje. Brukes til å legge inn
        strukturen fra skolens prøveplan/timeplan når den er publisert.
      </p>

      <SkoledataForm groupId={id} />
    </V2Shell>
  );
}
