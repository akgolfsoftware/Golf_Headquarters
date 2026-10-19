/**
 * PH-11-MAL-IUP IUP-måltall (PlayerHQSkall). Komponent: PHIupMaaltall.
 * Bare for spillere med aktivt WANG-/TN-medlemskap; andre sendes til Målsetninger.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHIupMaaltall } from "@/components/portal/precision/PHIupMaaltall";
import { hentIupMaaltall } from "@/lib/iup/maaltall-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "IUP-måltall · PlayerHQ" };

const TILBAKE = "/portal/planlegge/workbench?niva=malsetninger";

export default async function IupMaaltallPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  const [data, uleste] = await Promise.all([
    hentIupMaaltall(),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  if (!data) redirect(TILBAKE);
  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}><PHIupMaaltall data={data} tilbake={TILBAKE} /></PlayerHQSkall>;
}
