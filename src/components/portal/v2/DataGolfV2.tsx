"use client";

/**
 * PlayerHQ DataGolf — v2 (retning C «Presis»). Komponert 1:1 fra
 * ui_kits/v2/datagolf-tester.jsx → funksjonen DataGolf (+ DGGruppe, DGLegend,
 * Hjelp), men med EKTE data fra hentDataGolf (BrukerSammenligning + BrukerSgInput
 * + PgaPlayerSeason). Kun v2-komponenter fra "@/components/v2"; ingen ad-hoc
 * UI-primitiver, ingen rå hex (kun T.*).
 *
 * Ærlighet foran pixel-1:1: der datakontrakten ikke bærer et felt bygges ærlig
 * tom-tilstand — aldri fabrikkerte tall. Konkret: percentil-plassering på eget
 * nivå og «nivå-snitt per kategori» finnes ikke som kilde og er derfor utelatt
 * (meldt som gap), ikke diktet opp. DGGruppe viser to EKTE serier — Deg og
 * referansespilleren — som divergerende SG-barer rundt 0-linjen (tour-baseline).
 *
 * V2Shell (montert i (v2preview)/v2-datagolf/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import { useEffect, useState } from "react";
import type { DataGolfData, DataGolfKategori } from "@/lib/portal-stats/datagolf-data";
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

/* ── Delt: «?»-hjelp (title-tooltip) — reprodusert fra mockupens Hjelp ── */
function Hjelp({ tekst }: { tekst: string }) {
  return (
    <span
      title={tekst}
      style={{
        width: 15,
        height: 15,
        borderRadius: 9999,
        border: `1px solid ${T.borderS}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: T.mono,
        fontSize: 9,
        fontWeight: 700,
        color: T.mut,
        cursor: "help",
        flex: "none",
      }}
    >
      ?
    </span>
  );
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
          <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, color: T.mut }}>
            gap {sg(-k.gap)}
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
        <Kort>
          <TomTilstand
            icon="bar-chart"
            title="Ingen sammenligning ennå"
            sub="Registrer strokes gained og sammenlign deg mot en PGA Tour-spiller — så fyller denne skjermen seg med ekte tall for hvor du står mot touren, per kategori og over tid."
          />
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
          <Hjelp tekst="Strokes gained mot en ekte PGA Tour-spiller (DataGolf). Tour-baselinen er 0,0 — tallet viser hvor mange slag per runde du ligger foran (+) eller bak (−) referansen." />
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
    <InnsiktChip cta="Planlegg dette">
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
