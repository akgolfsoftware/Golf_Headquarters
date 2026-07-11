/**
 * v2-forhåndsvisning — PlayerHQ Kalender (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), KalenderV2 rendrer innholds-stacken.
 *
 * Auth gjenbrukt fra den ekte siden (src/app/portal/kalender/page.tsx);
 * loaderen (hentKalenderData) gjenbruker Aar-logikken derfra og utvider med
 * ekte økt-spørringer for Dag/Uke/Maaned.
 *
 * Periode-navigasjon: `?dato=YYYY-MM-DD` sentrerer kalenderen på en gitt dag —
 * styrer hvilken dag/uke/måned/år Dag/Uke/Maaned/Aar viser. Mangler param →
 * i dag (samme mønster som `?uke=` på Workbench).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { KalenderV2 } from "@/components/portal/v2/KalenderV2";
import { hentKalenderData } from "./data";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ dato?: string }> };

function parseDato(param: string | undefined): Date | undefined {
  if (!param || !/^\d{4}-\d{2}-\d{2}$/.test(param)) return undefined;
  const [aar, mnd, dag] = param.split("-").map(Number);
  const d = new Date(aar, mnd - 1, dag);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function V2KalenderPreviewPage({ searchParams }: Props) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const refDato = parseDato((await searchParams).dato);
  const data = await hentKalenderData(user.id, user.name ?? "Spiller", user.avatarUrl ?? null, refDato);

  return (
    <V2Shell aktiv="plan" nav={PLAYERHQ_NAV} navn={data.spillerNavn} avatarUrl={data.avatarUrl}>
      <KalenderV2 data={data} />
    </V2Shell>
  );
}
