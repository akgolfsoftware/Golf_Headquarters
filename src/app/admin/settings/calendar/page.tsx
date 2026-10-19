import { redirect } from "next/navigation";

/**
 * /admin/settings/calendar (gammel adresse, også Google OAuth-callbacken)
 * → Kalender › Tilgjengelighet, der Google Calendar-koblingen bor fra 19.10.2026.
 * `?ok=`/`?error=` fra callbacken bevares.
 */
export default async function CalendarRedirect({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}): Promise<never> {
  const { ok, error } = await searchParams;
  const qs = new URLSearchParams({ fane: "tilg" });
  if (ok) qs.set("ok", ok);
  if (error) qs.set("error", error);
  redirect(`/admin/kalender?${qs.toString()}`);
}
