/**
 * AgencyOS · Innboks — redirect (MASTERPLAN 15.7).
 *
 * Slått sammen til /admin/kommunikasjon (fane "innboks", standardfanen —
 * ren adresse). `?filter=varsler` videreføres (brukt av /admin/varsler).
 * Server actions ligger fortsatt i src/app/admin/innboks/actions.ts —
 * kun denne siden er en redirect, ikke ruten som helhet.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminInnboksRedirect({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  redirect(filter ? `/admin/kommunikasjon?filter=${filter}` : "/admin/kommunikasjon");
}
