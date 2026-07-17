import { redirect } from "next/navigation";

/**
 * /portal/tren/ovelser/[id] (gammel adresse) → /portal/drills/[id].
 * Detalj-siden serveres fortsatt fra legacy-treet på kanonisk adresse —
 * id-en bevares så gamle lenker fortsatt treffer riktig øvelse.
 */
export default async function OvelseDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<never> {
  const { id } = await params;
  redirect(`/portal/drills/${id}`);
}
