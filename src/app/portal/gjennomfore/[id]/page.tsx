/**
 * PlayerHQ øktark — PH-03 i Precision Athletics.
 * Samme økt-ID, tilgang og data som før. Visningen er PH03Oktark.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { getOktDetaljData } from "@/lib/portal-okt/okt-detalj-data";
import { loadNesteOkt } from "@/lib/portal/load-neste-okt";
import { nesteOktTekst } from "@/lib/portal/neste-okt-tekst";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH03Oktark } from "@/components/portal/precision/PH03Oktark";

export const dynamic = "force-dynamic";
export const metadata = { title: "Økt · PlayerHQ" };

export default async function OktDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const { id } = await params;
  const [data, uleste] = await Promise.all([
    getOktDetaljData({ id: user.id, role: user.role }, id),
    getUnreadNotifications(user.id, 1),
  ]);

  const naa = new Date();
  const trengerNeste = !data.found || data.status === "done";
  const neste = trengerNeste ? await loadNesteOkt(user.id, naa) : null;
  const nesteTekst = !data.found && neste ? nesteOktTekst(neste.okt, neste.href, naa) : null;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH03Oktark
        data={data}
        userId={user.id}
        nesteTekst={nesteTekst?.tekst ?? null}
        nesteHref={neste?.href ?? "/portal/planlegge"}
        harNeste={Boolean(neste?.okt)}
      />
    </PlayerHQSkall>
  );
}
