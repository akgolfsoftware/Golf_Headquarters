import { redirect } from "next/navigation";

/**
 * /admin/settings/calendar (gammel adresse) → /admin/oppsett?fane=kalender
 * (MASTERPLAN 15.3). `?ok=`/`?error=` fra Google OAuth-callback bevares.
 */
export default async function CalendarRedirect({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}): Promise<never> {
  const { ok, error } = await searchParams;
  const qs = new URLSearchParams({ fane: "kalender" });
  if (ok) qs.set("ok", ok);
  if (error) qs.set("error", error);
  redirect(`/admin/oppsett?${qs.toString()}`);
}
