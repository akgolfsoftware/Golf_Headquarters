/**
 * PH10Uke — spillerens uke i PlayerHQSkall.
 * Leser kun. Samme tall og samme nevner som coachens ukesrapport.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getUnreadNotifications } from "@/app/portal/actions";
import { UkesdigestV2 } from "@/components/portal/v2/UkesdigestV2";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentUkesdigest } from "@/lib/portal/ukesdigest";

export const dynamic = "force-dynamic";
export const metadata = { title: "Uka di · PlayerHQ" };

export default async function UkesdigestPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");

  const [data, ulest] = await Promise.all([
    hentUkesdigest(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <div className="ph-flate">
          <Link href="/portal" className="ph-tilbake">I dag</Link>
          <UkesdigestV2 data={data} />
        </div>
      </div>
    </PlayerHQSkall>
  );
}
