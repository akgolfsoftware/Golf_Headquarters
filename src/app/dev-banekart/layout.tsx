import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/**
 * Midlertidig dev-rute for banekart-verifisering — kun ADMIN.
 * (Gates her + i proxy.ts; fjernes når baneguide-skjermene er verifisert.)
 */
export default async function DevBanekartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePortalUser({ allow: ["ADMIN"] });
  return children;
}
