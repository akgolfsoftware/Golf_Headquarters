/**
 * /skjermer — intern skjermkatalog med demodata. Bare for coach og admin:
 * katalogen lå åpent uten innlogging 26.–27.09.2026.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { SkjermKatalog } from "./SkjermKatalog";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Skjermkatalog · AK Golf HQ",
  robots: { index: false, follow: false },
};

export default async function SkjermKatalogPage() {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  return <SkjermKatalog />;
}
