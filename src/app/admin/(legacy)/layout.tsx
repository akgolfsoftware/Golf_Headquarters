import { AdminShell } from "@/components/admin/admin-shell";

// Legacy-flater under /admin — rendrer AdminShell-chromen (sidebar/topbar/
// mobilnav). Auth-guarden ligger i src/app/admin/layout.tsx (toppen);
// AdminShell gjør i tillegg sitt eget requirePortalUser-kall for chrome-data
// (uendret, pre-eksisterende).
export default function AdminLegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
