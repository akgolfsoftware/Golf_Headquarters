/**
 * PH-16 Stats: oversikt i nytt design (stats.html) og dybden per del (PH16Stats med ?del=).
 * ?del=tren er PH-17 Trening i nytt design (pakke 6, stats-dybde.html, malen «trening»).
 * Avvik:
 *   - Avvikene for Trening står øverst i PH17Trening.tsx.
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
import { PH17Trening } from "@/components/portal/precision/PH17Trening";
import { hentLoggetTrening } from "@/lib/portal-analyse/logget-trening";
import { loadVisibleSessionRange } from "@/lib/portal/visible-session-range";
import { hentTmOkter } from "@/lib/portal-analyse/load-trackman-stats";
import { TM_FILTER_STANDARD, tellende } from "@/lib/portal-analyse/trackman-stats";
import type { TreningAkse } from "@/lib/portal-analyse/trening-stats";
import { loadTesterScreen } from "@/lib/portal-tester/tester-data";
import { byggPH14 } from "@/lib/portal-tester/ph14-tester-data";

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
  const kort = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });

  // PH-17 Trening: øktene siste fire uker og TrackMan i samme vindu.
  if (aktivFane === "tren") {
    const fra = etterlevelseFra(naa);
    const [okter, tmOkter, ulest, logget] = await Promise.all([
      loadVisibleSessionRange(user.id, fra.toISOString(), naa.toISOString()),
      hentTmOkter(user.id, fra),
      getUnreadNotifications(user.id, 1),
      // Logg økt (pakke 13): teller i tiden, aldri mot planen.
      hentLoggetTrening(user.id, fra, naa),
    ]);
    const slag = tmOkter.reduce((a, o) => a + tellende(o.slag, TM_FILTER_STANDARD).length, 0);
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
        <PH17Trening data={{
          okter: okter.map((o) => ({ start: o.startTime.toISOString(), min: o.durationMin, status: o.status, akse: o.pyramidArea as TreningAkse, sted: o.sted })),
          logget,
          naa: naa.toISOString(),
          periode: `${kort.format(fra)}–${kort.format(naa)}`,
          tm: tmOkter.length ? { okter: tmOkter.length, slag } : null,
        }} />
      </PlayerHQSkall>
    );
  }

  const [data, uleste, etterlevelse, testSkjerm] = await Promise.all([
    loadPH16Stats(user.id, user.name),
    getUnreadNotifications(user.id, 1),
    aktivFane ? Promise.resolve(null) : hentStallEtterlevelse([user.id], naa).then((m) => m.get(user.id) ?? null),
    // Testdelen i oversikten leser samme testliste som Tester (PH-14).
    aktivFane ? Promise.resolve(null) : loadTesterScreen({ id: user.id, name: user.name, hcp: user.hcp, tier: user.tier }),
  ]);

  // Uten valgt del vises oversikten med fire deler (nytt design); ?del= åpner dybden.
  if (!aktivFane) {
    const trening: PH16Trening | null = etterlevelse && etterlevelse.planlagtMinutter > 0 ? {
      gjortMin: etterlevelse.gjennomfortMinutter, planMin: etterlevelse.planlagtMinutter, pct: etterlevelse.pct,
      akser: (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((k) => ({ akse: k.toLowerCase() as PH16Trening["akser"][number]["akse"], gjortMin: etterlevelse.perAkse.get(k)?.gjennomfortMinutter ?? 0 })),
      periode: `${kort.format(etterlevelseFra(naa))}–${kort.format(naa)}`,
    } : null;
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
        <PH16StatsOversikt data={data} trening={trening}
          tester={testSkjerm ? byggPH14(testSkjerm.groups.flatMap((g) => g.rows), naa) : null} />
      </PlayerHQSkall>
    );
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH16Stats data={data} aktivFane={aktivFane} pgaTourInit={pgaTourInit} />
    </PlayerHQSkall>
  );
}
