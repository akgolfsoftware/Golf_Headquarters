import { AdminShell } from "@/components/admin/admin-shell";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Krever ADMIN eller COACH rolle — redirecter til /auth/login hvis ikke innlogget,
  // eller til /portal hvis innlogget med feil rolle (PLAYER/PARENT).
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return <AdminShell>{children}</AdminShell>;
}
