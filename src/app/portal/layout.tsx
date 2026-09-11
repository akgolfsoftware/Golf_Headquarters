import { PortalProviders } from "@/components/portal/portal-providers";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { registrerDagligAktivitet } from "@/lib/analytics/daglig-aktivitet";
import { BindAktivBruker } from "@/components/auth/bind-aktiv-bruker";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  await registrerDagligAktivitet(user.id);
  return (
    <PortalProviders>
      <BindAktivBruker userId={user.id} />
      {children}
    </PortalProviders>
  );
}
