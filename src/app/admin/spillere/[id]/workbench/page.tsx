/**
 * Gammel coach-workbench (plan-modellen) er pensjonert (C1).
 * Alle lenker og bokmerker lander på den nye Workbench-uka.
 */
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function GammelWorkbenchRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/workbench/${id}`);
}
