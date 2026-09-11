import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { BindAktivBruker } from "@/components/auth/bind-aktiv-bruker";

export default async function ForelderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({ allow: ["PARENT"] });

  return (
    <>
      <BindAktivBruker userId={user.id} />
      {children}
    </>
  );
}
