import { redirect } from "next/navigation";

/**
 * /admin/settings/tilgang (gammel adresse) → /admin/oppsett?fane=tilgang
 * (MASTERPLAN 15.3). `?fane=per-trener` (indre fane) mappes til `?visning=`
 * — `fane` eies nå av toppnivå-fanevalget.
 */
export default async function TilgangRedirect({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}): Promise<never> {
  const { fane } = await searchParams;
  redirect(fane === "per-trener" ? "/admin/oppsett?fane=tilgang&visning=per-trener" : "/admin/oppsett?fane=tilgang");
}
