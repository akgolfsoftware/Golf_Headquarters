/**
 * DataGolf-spillerkort (DG-01 / C10). Kun DataGolf-motor — Broadie og PEI
 * blandes aldri inn. V2Shell leverer chrome, DataGolfV2 innholdet.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentSpillerverktoy } from "@/lib/datagolf/player-tool-data";
import { hentUtfordringer } from "@/lib/datagolf/challenge-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { DataGolfV2 } from "@/components/portal/v2/DataGolfV2";
import Link from "next/link";
import { TilbakeLenke } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";

export const dynamic = "force-dynamic";

export default async function AnalysereDataGolfPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const sp = await searchParams;
  const [data, historikk] = await Promise.all([hentSpillerverktoy(user.id, sp), hentUtfordringer(user.id)]);

  return (
    <V2Shell bredde="full" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <TilbakeLenke href="/portal/analysere">Analyse</TilbakeLenke>
        <Link
          href={`/portal/analysere/datagolf/stasjon${data.proff ? `?tak=${data.proff.dgId}` : ""}`}
          style={{
            height: 48,
            padding: "0 20px",
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            display: "flex",
            alignItems: "center",
            fontSize: 16,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Prøv selv
        </Link>
      </div>
      <DataGolfV2 data={data} historikk={historikk} />
    </V2Shell>
  );
}
