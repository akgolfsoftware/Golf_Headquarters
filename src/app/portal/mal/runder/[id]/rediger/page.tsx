import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";
export default async function RedigerRundePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"], kreverTilgang: "TALENT" });
  const { id } = await params;
  redirect(`/portal/mal/runder/${encodeURIComponent(id)}/hull`);
}
