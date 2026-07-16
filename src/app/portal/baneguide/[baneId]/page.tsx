// Gameplan (B30, 16. jul 2026) — "Baneguide" er det gamle navnet på funksjonen.
// Ruten lever videre kun som redirect for gamle lenker/bokmerker.
import { redirect } from "next/navigation";

export default async function BaneguideDetailRedirect({
  params,
}: {
  params: Promise<{ baneId: string }>;
}): Promise<never> {
  const { baneId } = await params;
  redirect(`/portal/gameplan/${baneId}`);
}
