/**
 * Stats › Historikk i nytt design (PlayerHQ pakke 13, godkjent av Anders 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «historikk».
 * Avvik:
 *   - står øverst i PH16eHistorikk.tsx.
 * Runder, økter, tester og TrackMan lastes som før, hele historikken, og filtreres på skjermen. Bare brutto.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getRoundStats, getTestResults, getTrackManData } from "@/app/portal/analysere/actions";
import { getUnreadNotifications } from "@/app/portal/actions";
import { hentTreningsHistorikk } from "@/lib/portal-analyse/trenings-historikk";
import { startOfYear } from "@/lib/uke-helpers";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16eHistorikk, type HistorikkAkse, type HistorikkRad } from "@/components/portal/precision/PH16eHistorikk";

export const dynamic = "force-dynamic";
export const metadata = { title: "Historikk · PlayerHQ" };

const OSLO_DAG = new Intl.DateTimeFormat("nb-NO", { day: "numeric", timeZone: "Europe/Oslo" });
const OSLO_UKEDAG = new Intl.DateTimeFormat("nb-NO", { weekday: "short", timeZone: "Europe/Oslo" });
const OSLO_MND = new Intl.DateTimeFormat("nb-NO", { month: "long", year: "numeric", timeZone: "Europe/Oslo" });

const AKSE: Record<string, HistorikkAkse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const tilAkse = (v: string | null | undefined): HistorikkAkse | null => (v ? AKSE[v.toUpperCase()] ?? null : null);

function fmtSg(v: number): string {
  const s = v.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v > 0 ? `+${s}` : s;
}

export default async function HistorikkPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const naa = new Date();
  const sesongStart = startOfYear(naa);

  const [runder, trening, tester, trackman, ulest] = await Promise.all([
    getRoundStats(user.id, "all"),
    // Hele historikken i én henting — «Alt»-perioden i arket skal være ærlig.
    hentTreningsHistorikk({ userId: user.id, fra: new Date(0), til: naa }),
    getTestResults(user.id, "all"),
    getTrackManData(user.id, "all"),
    getUnreadNotifications(user.id, 1),
  ]);

  function basis(dato: Date) {
    const mnd = OSLO_MND.format(dato);
    return {
      dag: OSLO_DAG.format(dato),
      ukedag: OSLO_UKEDAG.format(dato).replace(".", ""),
      maaned: mnd.charAt(0).toUpperCase() + mnd.slice(1),
      dagerSiden: Math.max(0, Math.floor((naa.getTime() - dato.getTime()) / 86_400_000)),
      iSesong: dato >= sesongStart,
    };
  }

  type Rad = HistorikkRad & { _dato: number };
  const rader: Rad[] = [];

  for (const r of runder.rounds) {
    rader.push({
      id: r.id,
      type: "runde",
      ...basis(r.playedAt),
      navn: `Runde · ${r.courseName}`,
      meta: [`Par ${r.par}`, ...(r.sgTotal != null ? [`SG ${fmtSg(r.sgTotal)}`] : [])],
      akse: null,
      akser: [],
      verdi: String(r.score),
      verdiTekst: "brutto",
      sg: r.sgTotal,
      href: `/portal/mal/runder/${r.id}`,
      _dato: r.playedAt.getTime(),
    });
  }

  // Økter: TreningsRad er én rad per øvelse — grupper per økt. Aksen er den med flest minutter.
  const okter = new Map<string, { tittel: string; dato: Date; minutter: number; antall: number; fys: boolean; akser: Map<HistorikkAkse, number> }>();
  for (const rad of trening) {
    const akse = rad.kilde === "FYS" ? "fys" : tilAkse(rad.pyramide);
    const o = okter.get(rad.oktId) ?? { tittel: rad.oktTittel, dato: rad.dato, minutter: 0, antall: 0, fys: rad.kilde === "FYS", akser: new Map() };
    o.minutter += rad.minutter;
    o.antall += 1;
    if (rad.dato < o.dato) o.dato = rad.dato;
    if (akse) o.akser.set(akse, (o.akser.get(akse) ?? 0) + Math.max(rad.minutter, 1));
    okter.set(rad.oktId, o);
  }
  for (const [id, o] of okter) {
    const sortert = [...o.akser.entries()].sort((a, b) => b[1] - a[1]);
    rader.push({
      id,
      type: "okt",
      ...basis(o.dato),
      navn: o.tittel,
      meta: [o.fys ? "Fysisk" : "Golf", `${o.antall} ${o.antall === 1 ? "øvelse" : "øvelser"}`],
      akse: sortert[0]?.[0] ?? null,
      akser: sortert.map(([a]) => a),
      verdi: String(o.minutter),
      verdiTekst: "min",
      sg: null,
      href: null,
      _dato: o.dato.getTime(),
    });
  }

  for (const t of tester) {
    const akse = tilAkse(t.pyramidArea);
    rader.push({
      id: t.id,
      type: "test",
      ...basis(t.takenAt),
      navn: t.name,
      meta: ["Test"],
      akse,
      akser: akse ? [akse] : [],
      verdi: t.score.toLocaleString("nb-NO"),
      verdiTekst: "resultat",
      sg: null,
      href: null,
      _dato: t.takenAt.getTime(),
    });
  }

  for (const s of trackman.sessions) {
    rader.push({
      id: s.id,
      type: "trackman",
      ...basis(s.recordedAt),
      navn: `TrackMan${s.primaryClub ? ` · ${s.primaryClub}` : ""}`,
      meta: [s.source],
      akse: "slag",
      akser: ["slag"],
      verdi: String(s.shotCount),
      verdiTekst: "slag",
      sg: null,
      href: `/portal/trackman/${s.id}`,
      _dato: s.recordedAt.getTime(),
    });
  }

  // Nyeste først — «Eldste først» i arket snur denne rekkefølgen.
  rader.sort((a, b) => b._dato - a._dato);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <PH16eHistorikk rader={rader.map(({ _dato: _ignorert, ...r }) => r)} />
    </PlayerHQSkall>
  );
}
