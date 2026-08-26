import { redirect } from "next/navigation";

/**
 * `/admin/spillere/[id]/fremgang` → `/admin/spillere/[id]` (T4, 26.08.2026).
 *
 * Fremgangs-seksjonen (SG-fremgang, treningsvolum, korrelasjon) er flettet
 * inn i Spiller 360 — samme loader (`hentTreningsVolum`, `beregnKorrelasjon`,
 * samme 8-ukers ISO-ukesnitt-aggregering) kjøres nå der, ikke duplisert.
 */
export default async function SpillerFremgangRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<never> {
  const { id } = await params;
  redirect(`/admin/spillere/${id}`);
}
