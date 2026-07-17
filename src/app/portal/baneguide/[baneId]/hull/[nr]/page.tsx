// Gameplan (B30, 16. jul 2026) — "Baneguide" er det gamle navnet på funksjonen.
// Ruten lever videre kun som redirect for gamle lenker/bokmerker (bevarer ?type=).
import { redirect } from "next/navigation";

export default async function BaneguideHoleRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ baneId: string; nr: string }>;
  searchParams: Promise<{ type?: string }>;
}): Promise<never> {
  const { baneId, nr } = await params;
  const { type } = await searchParams;
  redirect(`/portal/gameplan/${baneId}/hull/${nr}${type ? `?type=${type}` : ""}`);
}
