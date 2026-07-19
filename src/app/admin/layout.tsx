import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminRolleProvider } from "@/components/v2/rolle";

// TOPP-layout for /admin — kun auth-guarden, INGEN visuell chrome. page.tsx
// (rot) er en ren redirect til /admin/agencyos og trenger ingen chrome.
// Alle andre admin-sider ligger i (legacy) og får AdminShell-chromen via
// src/app/admin/(legacy)/layout.tsx.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Krever ADMIN eller COACH rolle — redirecter til /auth/login hvis ikke innlogget,
  // eller til /portal hvis innlogget med feil rolle (PLAYER/PARENT).
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // COACH får adminOnly-nav-punkter skjult i V2Shell (ren UI-skjuling —
  // hver ADMIN-side er i tillegg server-gated med egen requirePortalUser).
  return (
    <AdminRolleProvider erAdmin={user.role === "ADMIN"}>
      {children}
    </AdminRolleProvider>
  );
}
