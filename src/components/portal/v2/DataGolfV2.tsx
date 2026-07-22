"use client";

/**
 * PlayerHQ DataGolf — v2 Presis + B-pakke (status mot tour + én vei til plan).
 * Ekte SG vs PGA Tour-baseline. T.* only. Tom = registrer runde / se analyse.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DataGolfData, DataGolfKategori } from "@/lib/portal-stats/datagolf-data";
import { WORKBENCH_HREF } from "./WorkbenchInngang";
import {
  T,
  fmtSg,
  Caps,
  Tittel,
  Kort,
  TallHero,
  StatusPill,
  Trend,
  InnsiktChip,
  PillVelger,
  TomTilstand,
  MikroMeta,
  HjelpTips,
  CTAPill,
} from "@/components/v2";

export type DataGolfProps = { data: DataGolfData; spillerNavn?: string };

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/** SG-verdi → norsk komma-desimal m/ fortegn, «—» for null. */
function sg(v: number | null): string {
  return v == null ? "—" : fmtSg(v);
}

/* ── Legende: Deg vs referansespiller vs tour-baseline (0) ───────────── */
function DGLegend({ refNavn }: { refNavn: string }) {
  const serier = [
    { l: "Deg", c: T.lime },
    { l: refNavn, c: T.info },
    { l: "Tour-baseline (0,0)", c: T.fg2 },
  ];
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {serier.map((s) => (
        <span key={s.l} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 11, color: T.mut }}>
          <span style={{ width: 7, height: 7, borderRadius: 9999, background: s.c }} />
          {s.l}
        </span>
      ))}
    </div>
  );
}

/* Divergerende SG-bar rundt 0-linjen (tour-baseline). Positiv = høyre (foran
   touren), negativ = venstre (bak). Reprodusert fra mockupens DGGruppe-bar,
   men to-veis fordi ekte SG-verdier kan være både + og −. */
function SgBar({ v, max, farge }: { v: number | null; max: number; farge: string }) {
  if (v == null) {
    return <div style={{ flex: 1, height: 7, borderRadius: 9999, background: T.track }} />;
  }
  const halv = Math.min(50, (Math.abs(v) / max) * 50);
  const neg = v < 0;
  return (
    <div style={{ flex: 1, height: 7, borderRadius: 9999, background: T.track, position: "relative", overflow: "hidden" }}>
      <span style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: T.borderS }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          ...(neg ? { right: "50%" } : { left: "50%" }),
          width: halv + "%",
          background: farge,
          opacity: 0.9,
          borderRadius: 9999,
        }}
      />
    </div>
  );
}

/* Én kategori = gruppe m/ Deg · referansespiller (begge ekte SG-verdier). */
function DGGruppe({ k, refNavn, max, last }: { k: DataGolfKategori; refNavn: string; max: number; last: boolean }) {
  const rows = [
    { l: "Deg", v: k.deg, c: T.lime },
    { l: refNavn, v: k.ref, c: T.info },
  ];
  return (
    <div style={{ padding: "11px 0", borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2 }}>{k.code}</span>
        <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>{k.name}</span>
        {k.gap != null && (
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 10, color: T.mut }}>
            gap {sg(-k.gap)}
            <HjelpTips k="sgGap" size={10} />
          </span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {rows.map((r) => (
          <div key={r.l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 86,
                flex: "none",
                fontFamily: T.mono,
                fontSize: 9,
                fontWeight: 700,
                color: T.mut,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.l}
            </span>
            <SgBar v={r.v} max={max} farge={r.c} />
            <span
              style={{
                width: 44,
                flex: "none",
                textAlign: "right",
                fontFamily: T.mono,
                fontSize: 12,
                fontWeight: 700,
                color: r.v == null ? T.mut : T.fg,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {sg(r.v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function DataGolfV2({ data, spillerNavn }: DataGolfProps) {
  const navn = spillerNavn?.trim() || "Deg";
  const mobile = useMobile();
  const [periode, setPeriode] = useState("alle");

  if (!data.harData) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>DataGolf · PGA Tour-baseline · {navn}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="touren">Deg mot</Tittel>
          </div>
        </div>
        <div className="grid grid-cols-3" style={{ gap: 8 }}>
          {(
            [
              { l: "Gap", v: "—" },
              { l: "Kategorier", v: "—" },
              { l: "Status", v: "Ingen data" },
            ] as const
          ).map((k) => (
            <Kort key={k.l} pad="12px">
              <Caps size={9}>{k.l}</Caps>
              <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 15, marginTop: 8, color: T.fg }}>{k.v}</div>
            </Kort>
          ))}
        </div>
        <Kort>
          <TomTilstand
            icon="bar-chart"
            title="Ingen sammenligning ennå"
            sub="Registrer SG på runder — da fylles gap mot touren per kategori."
          />
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/portal/runde/live" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill icon="flag" full>
                Start live-føring
              </CTAPill>
            </Link>
            <Link href="/portal/analysere" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill ghost full icon="bar-chart">
                Se SG-analyse
              </CTAPill>
            </Link>
          </div>
        </Kort>
      </div>
    );
  }

  const refNavn = data.refNavn ?? "Referanse";
  // Barskala: største absoluttverdi blant alle SG-verdier, min 0,5 for luft.
  const alleVerdier = data.kategorier.flatMap((k) => [k.deg, k.ref]).filter((v): v is number => v != null);
  const max = Math.max(0.5, ...alleVerdier.map((v) => Math.abs(v)));

  // Posisjon mot touren (deg − ref). Negativ = bak.
  const posisjon = data.gapTotal != null ? -data.gapTotal : null;

  const hero = (
    <Kort tint>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <Caps>Deg mot touren · SG total</Caps>
          <HjelpTips k="dataGolfBaseline" size={12} />
        </span>
        {data.gapDelta != null && (
          <StatusPill tone={data.gapDeltaDir === "up" ? "up" : "down"}>
            {data.gapDeltaDir === "up" ? "Nærmer seg" : "Økende gap"}
          </StatusPill>
        )}
      </div>
      <div style={{ marginTop: 14 }}>
        <TallHero
          value={posisjon != null ? fmtSg(posisjon) : "—"}
          unit="slag/runde"
          delta={data.gapDelta != null ? fmtSg(data.gapDelta) : undefined}
          dir={data.gapDeltaDir ?? undefined}
          size={mobile ? 44 : 56}
          sub={
            <>
              mot {refNavn}
              {data.refAar != null ? ` (${data.refAar})` : ""} · brutto
              {data.sgTotalDeg != null && data.sgTotalRef != null ? (
                <> · din SG {sg(data.sgTotalDeg)} mot {sg(data.sgTotalRef)}</>
              ) : null}
            </>
          }
        />
      </div>
    </Kort>
  );

  const kategorier = (
    <Kort eyebrow={`Per kategori · deg vs ${refNavn}`} action={<Caps size={9}>Slag/runde</Caps>}>
      <div style={{ marginBottom: 8 }}>
        <DGLegend refNavn={refNavn} />
      </div>
      {data.kategorier.map((k, i) => (
        <DGGruppe key={k.code} k={k} refNavn={refNavn} max={max} last={i === data.kategorier.length - 1} />
      ))}
    </Kort>
  );

  // Trend over registrerte sammenligninger (kun når ≥2 snapshots).
  const harTrend = data.trend.length >= 2;
  const trendLo = harTrend ? Math.min(0, ...data.trend) - 0.4 : 0;
  const trendHi = harTrend ? Math.max(0, ...data.trend) + 0.4 : 0;
  const trend = harTrend ? (
    <Kort eyebrow="Gap mot touren · registrerte sammenligninger" action={<Caps size={9}>0-linjen = tour</Caps>}>
      <Trend
        series={data.trend}
        yMin={trendLo}
        yMax={trendHi}
        baseline={0}
        height={mobile ? 92 : 110}
        xLabels={data.trendLabels.length ? data.trendLabels : undefined}
      />
      <div style={{ marginTop: 10, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
        {data.gapDelta != null && data.gapDelta >= 0
          ? `Gapet har krympet ${sg(Math.abs(data.gapDelta))} slag siden forrige sammenligning.`
          : `Basert på ${data.antallSnapshots} registrerte sammenligninger.`}
      </div>
    </Kort>
  ) : (
    <Kort eyebrow="Gap mot touren · over tid" action={<Caps size={9}>0-linjen = tour</Caps>}>
      <TomTilstand
        icon="activity"
        title="Trenger flere sammenligninger"
        sub="Registrer minst to sammenligninger for å se hvordan gapet mot touren endrer seg over tid."
      />
    </Kort>
  );

  const innsikt = data.storsteGap ? (
    <InnsiktChip cta="Planlegg dette" href={WORKBENCH_HREF}>
      Størst avstand til {refNavn} er i {data.storsteGap.name.toLowerCase()} ({sg(-data.storsteGap.gap)} slag) — det er der gapet mot touren lukkes raskest.
    </InnsiktChip>
  ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>DataGolf · PGA Tour-baseline · {navn}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="touren">Deg mot</Tittel>
          </div>
          <div style={{ marginTop: 8 }}>
            <MikroMeta icon="trophy">
              Referanse: {refNavn}
              {data.refTour ? ` · ${data.refTour.toUpperCase()}` : ""}
              {data.refAar != null ? ` ${data.refAar}` : ""}
            </MikroMeta>
          </div>
        </div>
        <PillVelger
          options={[{ v: "alle", l: `Alle (${data.antallSnapshots})` }]}
          value={periode}
          onChange={setPeriode}
        />
      </div>
      {mobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {hero}
          {kategorier}
          {trend}
          {innsikt}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: T.gap, alignItems: "start" }}>
          {hero}
          {trend}
          {kategorier}
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>{innsikt}</div>
        </div>
      )}
    </div>
  );
}
