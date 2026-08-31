/**
 * AgencyOS E-postmaler — redirect (MASTERPLAN 15.7).
 *
 * Slått sammen til /admin/kommunikasjon (fane "maler"). Editor-ruten
 * (`/admin/email-templates/[id]/rediger`) er UENDRET — kun listesiden er en
 * redirect.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function V2AdminEmailRedirect() {
  redirect("/admin/kommunikasjon?fane=maler");
}
