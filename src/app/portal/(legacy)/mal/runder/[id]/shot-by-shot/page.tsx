import { redirect } from "next/navigation";

/** Legacy → moderne runde-detalj. */
export default async function LegacyRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/portal/mal/runder/${id}`);
}
