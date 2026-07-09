"use client";

/**
 * AgencyOS Spiller-tester — v2 (retning C «Presis»). Coach-view av EN spillers
 * testprofil, rekomponert fra /admin/spillere/[id]/tester mot v2-biblioteket
 * (src/components/v2). Ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Datakontrakt bevart 1:1 fra loadSpillerTesterData:
 *  - Radaret viser DEKNING per disiplin (tester målt / tilgjengelig), IKKE en
 *    fabrikkert 0–100 ferdighetsskala.
 *  - Nivå (bestLevel) vises kun der testen har ekte benchmarks (FYS uten → ingen).
 *  - Sterkeste/svakeste og per-disiplin-detaljer er alle utledet av loaderen.
 *
 * Desktop: hode → KPI (4) → grid [3fr/2fr] (radar + sterk/svak | neste-test +
 * per-disiplin-liste). Ærlig tom-tilstand når ingen målinger finnes.
 */

import Link from "next/link";
import {
  Caps,
  Kort,
  Rad,
  AvatarInit,
  KpiFlis,
  CTAPill,
  InnsiktChip,
  AkseChip,
  TomTilstand,
  Radar,
  T,
  type RadarPunkt,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import type { SpillerTesterData } from "@/lib/admin/spiller-tester-data";

function fmtHcp(hcp: number | null): string {
  return hcp != null ? hcp.toFixed(1).replace(".", ",") : "—";
}

export function AdminSpillerTesterV2({
  data,
  playerId,
}: {
  data: SpillerTesterData;
  playerId: string;
}) {
  const { player, omrader, sterkeste, svakeste } = data;
  const batteriPct = data.testsTotal > 0 ? Math.round((data.testsDone / data.testsTotal) * 100) : 0;
  const harMalinger = data.measurements > 0;
  const tildelHref = `/admin/tester/tildel/${playerId}`;

  const radarData: RadarPunkt[] = omrader.map((o) => ({ akse: o.area as AkseKey, verdi: o.coveragePct }));

  // ── Hode: spiller-identitet + tildel-CTA ────────────────────────
  const meta: string[] = [];
  meta.push(`Hcp ${fmtHcp(player.hcp)}`);
  if (player.alder != null) meta.push(`${player.alder} år`);
  if (player.homeClub) meta.push(player.homeClub);
  if (player.sistAktiv) meta.push(`Sist aktiv ${player.sistAktiv}`);

  const hode = (
    <Kort tint>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <AvatarInit navn={player.name} size={52} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <Caps>AgencyOS · Stall · Tester</Caps>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg, letterSpacing: "-0.01em" }}>
              {player.name}
            </span>
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: T.fg2,
                background: T.panel2,
                border: `1px solid ${T.border}`,
                borderRadius: 5,
                padding: "3px 7px",
              }}
            >
              {player.tier}
            </span>
          </div>
          <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 4 }}>
            {meta.join(" · ")}
          </div>
        </div>
        <Link href={tildelHref} style={{ textDecoration: "none" }}>
          <CTAPill icon="plus">Tildel test</CTAPill>
        </Link>
      </div>
    </Kort>
  );

  // ── KPI (4) ─────────────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiFlis label="Tester gjennomført" value={`${data.testsDone}/${data.testsTotal}`} />
      <KpiFlis label="Disipliner dekket" value={`${data.omraderDekket}/5`} />
      <KpiFlis label="Målinger totalt" value={data.measurements} />
      <KpiFlis label="Andel av batteriet" value={`${batteriPct}%`} />
    </div>
  );

  // ── Radar-kort (dekning per disiplin) + sterk/svak-føtter ───────
  const statBlokk = (label: string, o: typeof sterkeste, farge: string) => (
    <div>
      <Caps size={9}>{label}</Caps>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
        <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>
          {o ? `${o.area} · ${o.label}` : "—"}
        </span>
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: farge, marginTop: 3, fontVariantNumeric: "tabular-nums" }}>
        {o ? `${o.coveragePct}% dekket${o.bestLevel ? ` · nivå ${o.bestLevel}` : ""}` : "Ingen målinger ennå"}
      </div>
    </div>
  );

  const radarKort = (
    <Kort eyebrow="Radar · 5 disipliner">
      {harMalinger ? (
        <>
          <div style={{ display: "flex", justifyContent: "center", padding: "4px 0 2px" }}>
            <Radar data={radarData} max={100} size={260} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
              fontFamily: T.mono,
              fontSize: 10,
              color: T.mut,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 3, background: T.lime, flex: "none" }} />
            Dekning (tester målt / tilgjengelig)
            <span style={{ marginLeft: "auto" }}>Skala 0–100 %</span>
          </div>
        </>
      ) : (
        <TomTilstand
          icon="target"
          title="Ingen tester registrert ennå"
          sub="Tildel en test for å bygge dekningsprofilen."
        />
      )}

      <div
        className="grid grid-cols-2"
        style={{ gap: T.gap, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}
      >
        {statBlokk("Sterkeste dekning", sterkeste, T.up)}
        {statBlokk("Svakeste dekning", svakeste, T.warn)}
      </div>
    </Kort>
  );

  // ── Neste test (svakest dekket) ─────────────────────────────────
  const nesteTest = svakeste ? (
    <Link href={tildelHref} style={{ textDecoration: "none" }}>
      <InnsiktChip cta="Tildel test">
        {`Dekk ${svakeste.label} — ${svakeste.measured} av ${svakeste.available} tester er tatt. Tildel en test her for et komplett bilde.`}
      </InnsiktChip>
    </Link>
  ) : null;

  // ── Per-disiplin-liste (ekte) ───────────────────────────────────
  const liste = (
    <Kort eyebrow="Dekning per disiplin" pad="4px 20px">
      {omrader.map((o, i) => {
        const detalj = [`${o.measured}/${o.available} tester`];
        if (o.bestLevel) detalj.push(`nivå ${o.bestLevel}`);
        if (o.lastDate) detalj.push(`sist ${o.lastDate}`);
        return (
          <Rad
            key={o.area}
            leading={<AkseChip a={o.area as AkseKey} />}
            title={o.label}
            sub={detalj.join(" · ")}
            meta={
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 14,
                  fontWeight: 700,
                  color: o.coveragePct > 0 ? T.fg : T.mut,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {o.coveragePct}%
              </span>
            }
            last={i === omrader.length - 1}
          />
        );
      })}
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {radarKort}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {nesteTest}
          {liste}
        </div>
      </div>
    </div>
  );
}
