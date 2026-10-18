/**
 * PlayerHQ · Skill map (/portal/analysere/skill-map) i nytt design (pakke 13, Stats resten).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «skillmap».
 * Avvik:
 *   - står øverst i PH16bSkillMap.tsx. ?pga=1 starter fortsatt på PGA Tour.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16bSkillMap } from "@/components/portal/precision/PH16bSkillMap";
import { loadPH16Stats } from "@/lib/portal-analyse/load-ph16-stats";
import { hentSgRunder } from "@/lib/portal-analyse/load-omrade";
import { gruppeGrunnlag, periodeTekst, type SgGruppe } from "@/lib/portal-analyse/omrade-data";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skill map · PlayerHQ" };

interface SkillMapPageProps {
  searchParams?: Promise<{
    pga?: string;
  }>;
}

export default async function SkillMapPage({ searchParams }: SkillMapPageProps) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const resolvedParams = searchParams ? await searchParams : {};
  const pgaTour = resolvedParams.pga === "true" || resolvedParams.pga === "1";

  const [data, runder, uleste] = await Promise.all([
    loadPH16Stats(user.id, user.name),
    hentSgRunder(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  const grunnlag = Object.fromEntries((["tee", "innspill", "naer", "putt"] as const).map((g) => {
    const x = gruppeGrunnlag(runder, g);
    return [g, { antall: x.antall, periode: periodeTekst(x.fra, x.til) }];
  })) as Record<SgGruppe, { antall: number; periode: string | null }>;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH16bSkillMap data={data} grunnlag={grunnlag} pgaTour={pgaTour} />
    </PlayerHQSkall>
  );
}
