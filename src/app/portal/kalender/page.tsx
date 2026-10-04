/**
 * PlayerHQ kalender — PH10Kalender i PlayerHQSkall.
 * Dag, uke, måned og år beholder hentKalenderData og ?dato=-navigasjon.
 * Opptatt tid er fortsatt en egen flate.
 * Tegningen ui_kits/playerhq/screens/PH-10.jsx ligger ikke i git.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { KalenderV2 } from "@/components/portal/v2/KalenderV2";
import { hentKalenderData } from "./data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kalender · PlayerHQ" };

type Props = { searchParams: Promise<{ dato?: string }> };

function parseDato(param: string | undefined): Date | undefined {
  if (!param || !/^\d{4}-\d{2}-\d{2}$/.test(param)) return undefined;
  const [aar, mnd, dag] = param.split("-").map(Number);
  const d = new Date(aar, mnd - 1, dag);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function KalenderSide({ searchParams }: Props) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const refDato = parseDato((await searchParams).dato);
  const [data, uleste] = await Promise.all([
    hentKalenderData(user.id, user.name ?? "Spiller", user.avatarUrl ?? null, refDato),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <div className="pa-side">
        <KalenderV2 data={data} />
        <p className="ph-kal-bunn">
          <Link href="/portal/kalender/opptatt">Opptatt tid — egne avtaler</Link>
        </p>
      </div>
    </PlayerHQSkall>
  );
}
