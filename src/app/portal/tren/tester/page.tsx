/**
 * PlayerHQ · Tester (/portal/tren/tester) — Precision Athletics PH-14
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-14.jsx).
 * Data og tilgang som før (loadTesterScreen, grupper fra hub-gruppe.ts); visningen er PH14Tester.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadTesterScreen, type TestRow } from "@/lib/portal-tester/tester-data";
import { hubGruppeForNavn, formatHubVerdi, HUB_GRUPPE_LABEL, HUB_GRUPPE_REKKEFOLGE, type HubGruppe } from "@/lib/portal-tester/hub-gruppe";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH14Tester, type PH14Gruppe, type PH14Test } from "@/components/portal/precision/PH14Tester";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tester · PlayerHQ" };

const OSLO_DMA = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });
const dma = (d: Date) => OSLO_DMA.format(d).replaceAll("/", ".");

export default async function TesterHubPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  let grupper: PH14Gruppe[] = [];
  let antallForfaller = 0;
  let feil = false;
  let uleste = 0;
  try {
    const [screen, resultater, dash] = await Promise.all([
      loadTesterScreen({ id: user.id, name: user.name, hcp: user.hcp, tier: user.tier }),
      prisma.testResult.findMany({ where: { userId: user.id }, orderBy: { takenAt: "desc" }, select: { testId: true, score: true, takenAt: true } }),
      getUnreadNotifications(user.id, 1).catch(() => null),
    ]);
    uleste = dash?.count ?? 0;
    const perTest = new Map<string, { score: number; takenAt: Date }[]>();
    for (const r of resultater) perTest.set(r.testId, [...(perTest.get(r.testId) ?? []), r]);

    const alleRader = screen.groups.flatMap((g) => g.rows);
    antallForfaller = alleRader.filter((r) => r.forfallDato != null).length;
    const perGruppe = new Map<HubGruppe, PH14Test[]>(HUB_GRUPPE_REKKEFOLGE.map((g) => [g, []]));
    for (const r of alleRader) {
      const hist = perTest.get(r.id) ?? [];
      const fmt = (raw: number | null) => (raw == null ? null : formatHubVerdi({ scoringKind: r.scoringKind, latestRaw: raw, shotsCount: r.shotsCount }));
      perGruppe.get(r.hubGruppe ?? hubGruppeForNavn(r.name))!.push(tilTest(r, hist, fmt));
    }
    grupper = HUB_GRUPPE_REKKEFOLGE.map((g) => ({ id: g, label: HUB_GRUPPE_LABEL[g], tester: perGruppe.get(g)! })).filter((g) => g.tester.length > 0);
  } catch {
    feil = true;
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH14Tester
        tilstand={feil ? "feil" : grupper.length === 0 ? "tom" : "data"}
        grupper={grupper}
        antallForfaller={antallForfaller}
        egenHref="/portal/tren/tester/ny/egen"
        registrerHref="/portal/tren/tester/ny"
        tnHref="/portal/tren/tester/team-norway"
      />
    </PlayerHQSkall>
  );
}

function tilTest(r: TestRow, hist: { score: number; takenAt: Date }[], fmt: (raw: number | null) => string | null): PH14Test {
  return {
    id: r.id,
    navn: r.name,
    akse: r.axis,
    regel: r.rule,
    verdi: r.attempts > 0 ? fmt(r.latestRaw) : null,
    maalinger: r.attempts,
    sisteDato: r.latestDate,
    delta: r.delta ? { tekst: r.delta.text, bra: r.delta.tone === "pos" } : null,
    hoyereErBedre: !r.lowerIsBetter,
    forsok: r.shotsCount,
    historikk: hist.map((h) => ({ dato: dma(h.takenAt), verdi: fmt(h.score) ?? "—" })),
    kurve: r.history,
    href: r.href,
  };
}
