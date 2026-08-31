import { redirect } from "next/navigation";

/**
 * /admin/settings (gammel adresse) → /admin/oppsett (MASTERPLAN 15.3).
 * Akademi er standardfanen — ren adresse uten `?fane=`. «Tilgang» og
 * «Klubb» ble EGNE toppnivå-faner i Oppsett (ikke lenger rader inne i
 * Akademi, se AdminOppsettHubTrainLock) — gamle `?rad=tilgang`/`?rad=klubb`
 * mappes derfor til `?fane=`, ikke `?rad=`. `?rad=akademi|varsler|konto`
 * gjelder fortsatt inne i Akademi-fanen.
 */
export default async function SettingsRedirect({
  searchParams,
}: {
  searchParams: Promise<{ rad?: string; tab?: string }>;
}): Promise<never> {
  const { rad, tab } = await searchParams;
  const effektivRad = rad ?? (tab === "team" || tab === "tilgang" ? "tilgang" : tab === "org" ? "akademi" : undefined);

  if (effektivRad === "tilgang") redirect("/admin/oppsett?fane=tilgang");
  if (effektivRad === "klubb") redirect("/admin/oppsett?fane=klubb");
  if (effektivRad && effektivRad !== "akademi") redirect(`/admin/oppsett?rad=${effektivRad}`);
  redirect("/admin/oppsett");
}
