import { redirect } from "next/navigation";

/**
 * /admin/approvals/[id] (gammel adresse) → /admin/godkjenninger/[id].
 * Detalj-siden serveres fortsatt fra legacy-treet på kanonisk adresse —
 * id-en bevares så dyplenker (e-post, varsler) fortsatt treffer riktig sak.
 */
export default async function ApprovalDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<never> {
  const { id } = await params;
  redirect(`/admin/godkjenninger/${id}`);
}
