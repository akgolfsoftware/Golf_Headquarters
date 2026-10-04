/**
 * PH16Historikk — samlet historikk i PlayerHQSkall.
 * Runder, økter, tester og TrackMan lastes som før. Filteret er fortsatt på skjermen.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getRoundStats, getTestResults, getTrackManData } from "@/app/portal/analysere/actions";
import { hentTreningsHistorikk } from "@/lib/portal-analyse/trenings-historikk";
import { startOfYear } from "@/lib/uke-helpers";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { HistorikkV2, type HistorikkEntry } from "@/components/portal/v2/HistorikkV2";
import type { HistorikkSone } from "@/components/portal/v2/HistorikkFilterSheet";

export const dynamic = "force-dynamic";

const OSLO_DAG = new Intl.DateTimeFormat("nb-NO", { day: "numeric", timeZone: "Europe/Oslo" });
const OSLO_MND = new Intl.DateTimeFormat("nb-NO", { month: "short", timeZone: "Europe/Oslo" });

/** AK-formelens område → fasitens sone. Ukjente områder får ingen sone. */
function tilSone(tekst: string | null): HistorikkSone | null {
  if (!tekst) return null;
  const o = tekst.toUpperCase();
  if (o.includes("PUTT")) return "putt";
  if (o.includes("TEE") || o.includes("DRIVER")) return "tee";
  if (
    o.includes("CHIP") ||
    o.includes("PITCH") ||
    o.includes("BUNKER") ||
    o.includes("LOB") ||
    o.includes("NÆRSPILL") ||
    o.includes("NAERSPILL") ||
    o.includes("ARG")
  ) {
    return "naerspill";
  }
  if (o.includes("INNSPILL") || o.includes("APP") || o.includes("JERN") || o.includes("WEDGE")) return "innspill";
  return null;
}

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

  const [runder, trening, tester, trackman] = await Promise.all([
    getRoundStats(user.id, "all"),
    // Hele historikken i én henting — «Alt»-perioden i arket skal være ærlig.
    hentTreningsHistorikk({ userId: user.id, fra: new Date(0), til: naa }),
    getTestResults(user.id, "all"),
    getTrackManData(user.id, "all"),
  ]);

  function basis(dato: Date) {
    return {
      dag: OSLO_DAG.format(dato),
      mnd: OSLO_MND.format(dato).replace(".", ""),
      dagerSiden: Math.max(0, Math.floor((naa.getTime() - dato.getTime()) / 86_400_000)),
      iSesong: dato >= sesongStart,
    };
  }

  type Rad = HistorikkEntry & { _dato: number };
  const rader: Rad[] = [];

  for (const r of runder.rounds) {
    rader.push({
      id: r.id,
      type: "runde",
      ...basis(r.playedAt),
      navn: r.courseName,
      meta: `Par ${r.par} · ${r.score} slag`,
      verdi: r.sgTotal != null ? fmtSg(r.sgTotal) : "—",
      tone: r.sgTotal == null ? null : r.sgTotal >= 0 ? "pos" : "neg",
      soner: [],
      sg: r.sgTotal,
      href: `/portal/mal/runder/${r.id}`,
      _dato: r.playedAt.getTime(),
    });
  }

  // Økter: TreningsRad er én rad per øvelse — grupper per økt.
  const okter = new Map<
    string,
    { tittel: string; dato: Date; minutter: number; kilde: string; soner: Set<HistorikkSone> }
  >();
  for (const rad of trening) {
    const eks = okter.get(rad.oktId);
    const sone = tilSone(rad.omraade);
    if (eks) {
      eks.minutter += rad.minutter;
      if (sone) eks.soner.add(sone);
      if (rad.dato < eks.dato) eks.dato = rad.dato;
    } else {
      okter.set(rad.oktId, {
        tittel: rad.oktTittel,
        dato: rad.dato,
        minutter: rad.minutter,
        kilde: rad.kilde,
        soner: new Set(sone ? [sone] : []),
      });
    }
  }
  for (const [id, o] of okter) {
    rader.push({
      id,
      type: "okt",
      ...basis(o.dato),
      navn: o.tittel,
      meta: `${o.minutter} min · ${o.kilde === "FYS" ? "Fysisk" : "Golf"}`,
      verdi: "Fullført",
      tone: null,
      soner: [...o.soner],
      sg: null,
      href: null,
      _dato: o.dato.getTime(),
    });
  }

  for (const t of tester) {
    const sone = tilSone(t.name);
    rader.push({
      id: t.id,
      type: "test",
      ...basis(t.takenAt),
      navn: t.name,
      meta: `Test · ${t.pyramidArea}`,
      verdi: t.score.toLocaleString("nb-NO"),
      tone: null,
      soner: sone ? [sone] : [],
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
      meta: `${s.shotCount} slag · ${s.source}`,
      verdi: "Importert",
      tone: null,
      soner: [],
      sg: null,
      href: `/portal/trackman/${s.id}`,
      _dato: s.recordedAt.getTime(),
    });
  }

  // Nyeste først — klientens «Eldste»-sortering snur denne rekkefølgen.
  rader.sort((a, b) => b._dato - a._dato);
  const entries: HistorikkEntry[] = rader.map(({ _dato: _ignorert, ...e }) => e);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <Link href="/portal/analysere" className="ph-tilbake">Analyse</Link>
        <HistorikkV2 entries={entries} navn={user.name ?? ""} />
      </div>
    </PlayerHQSkall>
  );
}
