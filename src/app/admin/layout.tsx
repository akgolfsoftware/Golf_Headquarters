import { requirePortalUser } from "@/lib/auth/requirePortalUser";

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
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return <>{children}</>;
}
