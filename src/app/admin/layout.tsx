import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AdminToaster } from "@/components/admin/admin-toaster";
import { BindAktivBruker } from "@/components/auth/bind-aktiv-bruker";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <AdminRolleProvider erAdmin={user.role === "ADMIN"}>
      <BindAktivBruker userId={user.id} />
      {children}
      <AdminToaster />
    </AdminRolleProvider>
  );
}
