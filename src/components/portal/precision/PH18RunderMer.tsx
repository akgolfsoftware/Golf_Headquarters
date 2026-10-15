"use client";

/**
 * PH-18 Mer statistikk — statistikk, hull og sesonger fra den forrige PH-18-skjermen, beholdt under
 * «Mer statistikk» på Runder i nytt design (pakke 5).
 * Fasit: docs/design-system/utkast-playerhq/runder.html (skjerm PH-18).
 * Avvik:
 *   - Tegningen har ikke disse tre visningene. De er beholdt fordi skjermen ikke skal miste funksjoner,
 *     og de har fortsatt Precision-uttrykket fra før.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-18.
 */

import { useState } from "react";
import { Flag } from "lucide-react";
import { Meta, Tall, TomTilstand } from "@/components/precision/pa";
import { Stabel, Kort, Tabell, Nedtrekk, Skjemafelt } from "@/components/precision/pa-a4";
import { formaterTall } from "@/lib/format-tall";
import { PH18_METRIKKER, metrikkVerdi, type PH18Metrikk, type PH18Model } from "@/lib/portal-runder/ph18-data";
import "@/styles/precision-komponenter.css";

const MND = ["APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT"];
const dec = (v: number, d = 1) => formaterTall(v, d, true);

function Linje({ verdier, hoyde, label }: { verdier: (number | null)[]; hoyde: number; label: string }) {
  const kjent = verdier
    .map((v, i) => (v == null ? null : ([i, v] as const)))
    .filter((x): x is readonly [number, number] => x != null);
  if (kjent.length < 2) return <Meta>FOR FÅ RUNDER TIL KURVE</Meta>;
  const vs = kjent.map((k) => k[1]);
  const min = Math.min(...vs);
  const span = Math.max(...vs) - min || 1;
  const w = 200;
  const n = verdier.length - 1 || 1;
  const pts = kjent
    .map(([i, v]) => `${(i / n) * w},${hoyde - 3 - ((v - min) / span) * (hoyde - 6)}`)
    .join(" ");
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${w} ${hoyde}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: hoyde, display: "block" }}
    >
      <polyline
        points={pts}
        fill="none"
        stroke="var(--text-primary)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Statistikk({ m }: { m: PH18Model }) {
  const [valgt, setValgt] = useState<PH18Metrikk>("snitt");
  const met = PH18_METRIKKER.find((x) => x.verdi === valgt)!;
  const serie = [...m.runder].reverse().map((r) => metrikkVerdi(r, valgt));
  const gyldige = serie.filter((v): v is number => v != null);
  const snitt = gyldige.length ? gyldige.reduce((a, b) => a + b, 0) / gyldige.length : null;
  const fmt = (v: number | null) => (v == null ? "—" : met.enhet === "%" ? `${v} %` : `${dec(v)} ${met.enhet}`);
  const sisteDato = m.runder[0]?.dato ?? "I dag";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 16, alignItems: "start" }}>
      <Kort pad={16}>
        <div style={{ maxWidth: 320 }}>
          <Skjemafelt label="Metrikk">
            <Nedtrekk
              value={valgt}
              onChange={(v) => setValgt(v as PH18Metrikk)}
              options={PH18_METRIKKER.map((x) => ({ value: x.verdi, label: x.navn }))}
            />
          </Skjemafelt>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ font: "var(--type-metric-l)", color: "var(--text-primary)" }}>
            {snitt == null ? "—" : met.enhet === "%" ? Math.round(snitt) : dec(snitt)}
          </span>
          <Tall style={{ color: "var(--text-muted)" }}>
            {met.enhet} · snitt {gyldige.length} {gyldige.length === 1 ? "runde" : "runder"}
          </Tall>
        </div>
        <Linje verdier={serie} hoyde={120} label={`${met.navn} over tid`} />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <Meta>{m.runder[m.runder.length - 1]?.kortDato}</Meta>
          <Meta>{met.lavereErBedre ? "LAVERE ER BEDRE" : "HØYERE ER BEDRE"}</Meta>
          <Meta>{m.runder[0]?.kortDato}</Meta>
        </div>
        <div style={{ borderTop: "1px solid var(--border-hairline)", paddingTop: 8, marginTop: 4 }}>
          <Meta>KILDE: RUNDELOGG · SIST OPPDATERT {sisteDato}</Meta>
        </div>
        {met.bareAtten && <Meta>RUNDER UTEN 18 HULL TELLER IKKE I SNITT BRUTTO OG PUTTER</Meta>}
      </Kort>
      <Tabell
        caption={`${met.navn} per runde`}
        rows={m.runder}
        tomTekst="—"
        columns={[
          { key: "d", label: "Dato", mono: true, render: (r) => r.kortDato },
          { key: "b", label: "Bane", render: (r) => r.bane },
          { key: "v", label: met.navn, mono: true, align: "right", render: (r) => fmt(metrikkVerdi(r, valgt)) },
        ]}
      />
    </div>
  );
}

function Hull({ m }: { m: PH18Model }) {
  const h = m.hull;
  if (!h) {
    return (
      <TomTilstand
        icon={Flag}
        title="Ingen hull-for-hull-runder ennå"
        text="Snitt per hull krever minst én runde med score på alle 18 hull."
      />
    );
  }
  const maks = Math.max(1.2, ...h.snitt);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 16, alignItems: "start" }}>
      <Kort pad={16} gap={6}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span className="kicker">Snitt til par per hull · {h.bane}</span>
          <Meta>{h.antallRunder} {h.antallRunder === 1 ? "RUNDE" : "RUNDER"}</Meta>
        </div>
        {h.snitt.map((v, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "72px minmax(0,1fr) 48px",
              gap: 10,
              alignItems: "center",
              minHeight: 28,
            }}
          >
            <span style={{ font: "var(--type-num-s)", color: "var(--text-primary)" }}>Hull {i + 1}</span>
            <span style={{ height: 10, background: "var(--surface-sunken)", position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${Math.max(0, v / maks) * 100}%`,
                  background: i + 1 === h.dyreste.hull ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              />
            </span>
            <span style={{ font: "var(--type-num-s)", color: "var(--text-primary)", textAlign: "right" }}>
              {v > 0 ? "+" : ""}{dec(v)}
            </span>
          </div>
        ))}
        <Meta>PAR {h.par.join(" · ")}</Meta>
      </Kort>
      <Stabel>
        <Kort pad={16} gap={8}>
          <span className="kicker">Dyreste hull</span>
          <div style={{ font: "var(--type-title-s)", color: "var(--text-primary)" }}>
            Hull {h.dyreste.hull} · par {h.dyreste.par}
          </div>
          <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>
            Snitt {h.dyreste.snitt > 0 ? "+" : ""}{dec(h.dyreste.snitt)} til par. {h.dyreste.rundeMedBogey} av {h.antallRunder} runder med bogey eller verre.
          </p>
        </Kort>
        <Kort pad={16} gap={8}>
          <span className="kicker">Beste hull</span>
          <div style={{ font: "var(--type-title-s)", color: "var(--text-primary)" }}>
            Hull {h.beste.hull} · par {h.beste.par}
          </div>
          <Meta>
            SNITT {h.beste.snitt > 0 ? "+" : ""}{dec(h.beste.snitt)} TIL PAR · {h.antallRunder} {h.antallRunder === 1 ? "RUNDE" : "RUNDER"}
          </Meta>
        </Kort>
      </Stabel>
    </div>
  );
}

function Sesonger({ m }: { m: PH18Model }) {
  const s = m.sesonger;
  if (s.length === 0) {
    return (
      <TomTilstand
        icon={Flag}
        title="Ingen sesongdata ennå"
        text="Sesongene bygges automatisk av 18-hullsrunder med registrert hullscore."
      />
    );
  }
  const W = 600;
  const H = 220;
  const alle = s.flatMap((x) => x.maaneder).filter((v): v is number => v != null);
  const topp = Math.max(4, Math.ceil(Math.max(...alle, 0) / 4) * 4);
  const bunn = Math.min(0, Math.floor(Math.min(...alle, 0) / 4) * 4);
  const ticks: number[] = [];
  for (let v = bunn; v <= topp; v += 4) ticks.push(v);
  const x = (i: number) => 30 + (i * (W - 50)) / 6;
  const y = (v: number) => 16 + (1 - (v - bunn) / (topp - bunn)) * (H - 40);
  const ink = ["var(--graphite-400)", "var(--graphite-500)", "var(--graphite-600)", "var(--text-primary)"].slice(-s.length);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 16, alignItems: "start" }}>
      <Kort pad={16}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <span className="kicker">Til par per måned · 18 hull</span>
          <Meta>{s[0].aar}–{s[s.length - 1].aar}</Meta>
        </div>
        <div style={{ width: "100%", minWidth: 0 }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: "100%", height: "auto", display: "block" }}
            role="img"
            aria-label={`Til par per måned, ${s.length} sesonger`}
          >
            {ticks.map((v) => (
              <g key={v}>
                <line x1="30" x2={W - 20} y1={y(v)} y2={y(v)} stroke="var(--border-hairline)" />
                <text x="24" y={y(v) + 4} textAnchor="end" style={{ font: "400 11px var(--font-mono)", fill: "var(--text-muted)" }}>
                  {v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : "±0"}
                </text>
              </g>
            ))}
            {MND.map((mm, i) => (
              <text key={mm} x={x(i)} y={H - 4} textAnchor="middle" style={{ font: "400 11px var(--font-mono)", fill: "var(--text-muted)" }}>
                {mm}
              </text>
            ))}
            {s.map((se, si) => {
              const pts = se.maaneder
                .map((v, i) => (v == null ? null : ([x(i), y(v)] as const)))
                .filter((p): p is readonly [number, number] => p != null);
              if (pts.length === 0) return null;
              const siste = si === s.length - 1;
              return (
                <g key={se.aar}>
                  <polyline
                    points={pts.map((p) => p.join(",")).join(" ")}
                    fill="none"
                    stroke={ink[si]}
                    strokeWidth={siste ? 2.5 : 1.5}
                    strokeDasharray={siste ? "none" : "4 3"}
                  />
                  <text
                    x={Math.min(pts[pts.length - 1][0] + 6, W - 26)}
                    y={pts[pts.length - 1][1] + 4}
                    style={{ font: "600 11px var(--font-mono)", fill: ink[si] }}
                  >
                    {se.aar}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <Meta>MÅNEDER UTEN 18-HULLSRUNDE ER TOMME, IKKE NULL</Meta>
      </Kort>
      <Tabell
        caption="Snitt brutto per sesong"
        rows={[...s].reverse().map((x) => ({ ...x, id: String(x.aar) }))}
        columns={[
          { key: "y", label: "Sesong", mono: true, render: (x) => x.aar },
          { key: "n", label: "Runder", mono: true, align: "right", render: (x) => x.antall },
          {
            key: "a",
            label: "Snitt brutto",
            mono: true,
            align: "right",
            render: (x) => (x.snittBrutto == null ? "—" : `${dec(x.snittBrutto)} slag`),
          },
        ]}
      />
    </div>
  );
}


const VISNINGER = [
  { id: "stat", navn: "Statistikk" },
  { id: "hull", navn: "Hull" },
  { id: "sesong", navn: "Sesonger" },
] as const;

export function PH18MerStatistikk({ modell }: { modell: PH18Model }) {
  const [vis, setVis] = useState<(typeof VISNINGER)[number]["id"]>("stat");
  return (
    <details className="phr-mer">
      <summary>Mer statistikk <span className="phn-kilde">Fairway, GIR, putter, hull og sesonger</span></summary>
      <div className="phn-sek-topp">
        <div className="phn-valg" role="group" aria-label="Visning">
          {VISNINGER.map((v) => (
            <button key={v.id} type="button" aria-pressed={vis === v.id} onClick={() => setVis(v.id)}>{v.navn}</button>
          ))}
        </div>
      </div>
      <div>
        {vis === "stat" && <Statistikk m={modell} />}
        {vis === "hull" && <Hull m={modell} />}
        {vis === "sesong" && <Sesonger m={modell} />}
      </div>
    </details>
  );
}
