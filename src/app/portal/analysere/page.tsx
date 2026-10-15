/**
 * PH-16 Stats: oversikt i nytt design (stats.html) og dybden per del (PH16Stats med ?del=).
 * Analyse-hub for PlayerHQ med fire deler: Snittscore, Strokes Gained, Trening og Tester.
 * Kilde: ui_kits/playerhq/screens/PH-16-stats.jsx (Runde 22, 28.09.2026).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16Stats } from "@/components/portal/precision/PH16Stats";
import { PH16StatsOversikt, type PH16Trening } from "@/components/portal/precision/PH16StatsOversikt";
import { hentStallEtterlevelse } from "@/lib/portal/etterlevelse-data";
import { etterlevelseFra } from "@/lib/domain/etterlevelse";
import { hentEffektivNaa } from "@/lib/testing/dato-override";
import { loadPH16Stats } from "@/lib/portal-analyse/load-ph16-stats";
import { getUnreadNotifications } from "@/app/portal/actions";
import type { StatsFane } from "@/lib/portal-analyse/ph16-stats-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stats · PlayerHQ" };

interface AnalyserePageProps {
  searchParams?: Promise<{
    del?: string;
    fane?: string;
    pga?: string;
  }>;
}

export default async function AnalyserePage({ searchParams }: AnalyserePageProps) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const resolvedParams = searchParams ? await searchParams : {};
  const valgtFaneParam = resolvedParams.del || resolvedParams.fane;
  const gyldigeFaner: StatsFane[] = ["snitt", "sg", "tren", "test"];
  const aktivFane: StatsFane | undefined = gyldigeFaner.includes(valgtFaneParam as StatsFane)
    ? (valgtFaneParam as StatsFane)
    : undefined;
  const pgaTourInit = resolvedParams.pga === "true" || resolvedParams.pga === "1";

  const naa = await hentEffektivNaa(user.email);
  const [data, uleste, etterlevelse] = await Promise.all([
    loadPH16Stats(user.id, user.name),
    getUnreadNotifications(user.id, 1),
    aktivFane ? Promise.resolve(null) : hentStallEtterlevelse([user.id], naa).then((m) => m.get(user.id) ?? null),
  ]);

  // Uten valgt del vises oversikten med fire deler (nytt design); ?del= åpner dybden.
  if (!aktivFane) {
    const kort = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
    const trening: PH16Trening | null = etterlevelse && etterlevelse.planlagtMinutter > 0 ? {
      gjortMin: etterlevelse.gjennomfortMinutter, planMin: etterlevelse.planlagtMinutter, pct: etterlevelse.pct,
      akser: (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((k) => ({ akse: k.toLowerCase() as PH16Trening["akser"][number]["akse"], gjortMin: etterlevelse.perAkse.get(k)?.gjennomfortMinutter ?? 0 })),
      periode: `${kort.format(etterlevelseFra(naa))}–${kort.format(naa)}`,
    } : null;
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
        <PH16StatsOversikt data={data} trening={trening} />
      </PlayerHQSkall>
    );
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH16Stats data={data} aktivFane={aktivFane} pgaTourInit={pgaTourInit} />
    </PlayerHQSkall>
  );
}
