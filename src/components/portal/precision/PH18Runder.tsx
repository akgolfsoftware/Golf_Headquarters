"use client";

/**
 * PH-18 Runder og statistikk — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-18.jsx).
 *
 * Fire faner: Runder (liste + scorekort + SG), Statistikk, Hull, Sesonger.
 * Brutto score, ærlig Strokes Gained og streng par-beregning.
 */

import { useState } from "react";
import { Flag, Share2, CircleAlert, Play } from "lucide-react";
import { KnappLenke, Meta, Tall, TomTilstand, FeilTilstand, StatusPille } from "@/components/precision/pa";
import { SideHode, Side, Stabel, Kort, Tabell, Nedtrekk, Skjemafelt, Nokkelverdi } from "@/components/precision/pa-a4";
import { useHarRundeKladd } from "@/components/portal/runde-logg/fortsett-runde-cta";
import { formaterTall, formaterFortegn } from "@/lib/format-tall";
import { PH18_METRIKKER, metrikkVerdi, type PH18Metrikk, type PH18Model, type PH18Runde } from "@/lib/portal-runder/ph18-data";
import "@/styles/precision-komponenter.css";

export type PH18Props = {
  tilstand: "data" | "tom" | "feil";
  ukjentKode?: string;
  startFane?: "runder" | "stat" | "hull" | "sesong";
  modell: PH18Model;
  registrerHref?: string;
  liveHref?: string;
  baseHref?: string;
  delHref?: (id: string) => string;
  detaljHref?: (id: string) => string;
};

const FANER = [
  { verdi: "runder", navn: "Runder" },
  { verdi: "stat", navn: "Statistikk" },
  { verdi: "hull", navn: "Hull" },
  { verdi: "sesong", navn: "Sesonger" },
];
const MND = ["APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT"];

const dec = (v: number, d = 1) => formaterTall(v, d, true);
const sgTxt = (v: number | null) => (v == null ? "—" : formaterFortegn(v, 2));

function Merke({ slag, par }: { slag: number; par: number }) {
  const d = slag - par;
  const dobbel = d <= -2 || d >= 2;
  return (
    <span
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: 30,
        height: 30,
        boxSizing: "border-box",
        borderRadius: d <= -1 ? "999px" : d >= 1 ? "2px" : 0,
        border: d ? "1.5px solid var(--text-primary)" : "none",
        boxShadow: dobbel ? "0 0 0 2px var(--surface-card), 0 0 0 3.5px var(--text-primary)" : "none",
        font: "600 14px/1 var(--font-mono)",
        color: "var(--text-primary)",
      }}
    >
      {slag}
    </span>
  );
}

function Halvdel({ kort, fra, navn }: { kort: { par: number; slag: number }[]; fra: number; navn: string }) {
  const del = kort.slice(fra, fra + 9);
  const cel = (b: string, c: string): React.CSSProperties => ({ font: b, color: c });
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(9,minmax(0,1fr)) minmax(36px,auto)",
        rowGap: 6,
        alignItems: "center",
        textAlign: "center",
        minWidth: 0,
      }}
    >
      {del.map((_, k) => (
        <span key={`h${k}`} style={cel("var(--type-meta)", "var(--text-muted)")}>
          {fra + k + 1}
        </span>
      ))}
      <span style={cel("var(--type-meta)", "var(--text-muted)")}>{fra ? "INN" : "UT"}</span>
      {del.map((h, k) => (
        <span key={`p${k}`} style={cel("var(--type-num-s)", "var(--text-secondary)")}>
          {h.par}
        </span>
      ))}
      <span style={cel("var(--type-num-s)", "var(--text-secondary)")}>
        {del.reduce((s, h) => s + h.par, 0)}
      </span>
      {del.map((h, k) => (
        <span key={`s${k}`}>
          <Merke slag={h.slag} par={h.par} />
        </span>
      ))}
      <span style={cel("600 15px/1 var(--font-mono)", "var(--text-primary)")}>
        {del.reduce((s, h) => s + h.slag, 0)}
      </span>
      <span className="pa-sr">{navn}</span>
    </div>
  );
}

function Scorekort({ r }: { r: PH18Runde }) {
  if (!r.kort) {
    return (
      <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
        Scorekort per hull er ikke registrert for denne runden. Bare totalscore er lagret.
      </p>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Halvdel kort={r.kort} fra={0} navn="Hull 1 til 9" />
      {r.kort.length === 18 && <Halvdel kort={r.kort} fra={9} navn="Hull 10 til 18" />}
      <Meta>RUND = BIRDIE · FIRKANT = BOGEY · DOBBEL = ±2</Meta>
    </div>
  );
}

function RundeDetalj({ r, p }: { r: PH18Runde; p: PH18Props }) {
  const base = p.baseHref ?? "/portal/mal/runder";
  const delHref = p.delHref ? p.delHref(r.id) : `${base}/${r.id}/del`;
  const detaljHref = p.detaljHref ? p.detaljHref(r.id) : `${base}/${r.id}`;
  const sgFelt = [
    r.sgOtt != null ? `Tee: ${sgTxt(r.sgOtt)}` : null,
    r.sgApp != null ? `Innspill: ${sgTxt(r.sgApp)}` : null,
    r.sgArg != null ? `Nærspill: ${sgTxt(r.sgArg)}` : null,
    r.sgPutt != null ? `Putting: ${sgTxt(r.sgPutt)}` : null,
  ].filter(Boolean);

  return (
    <Kort pad={16} gap={16}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="kicker">{r.dato}{r.art ? ` · ${r.art.toUpperCase()}` : ""}</span>
            <StatusPille tone={r.partialSave ? "warn" : "ok"}>{r.status}</StatusPille>
          </div>
          <div style={{ font: "var(--type-title-s)", color: "var(--text-primary)", marginTop: 4, overflowWrap: "anywhere" }}>
            {r.bane}
          </div>
        </div>
        <KnappLenke variant="secondary" icon={Share2} href={delHref}>
          Del runde
        </KnappLenke>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ font: "var(--type-metric-l)", color: "var(--text-primary)" }}>{r.score}</span>
        <Tall style={{ color: "var(--text-muted)" }}>
          slag ({r.tilPar ?? "—"}) · brutto{r.hull === 9 ? " · 9 hull" : r.hull === 18 ? " · 18 hull" : ""}
        </Tall>
      </div>

      {r.kilde && (
        <Meta>KILDE: {r.kilde.toUpperCase()}{r.kildeDato ? ` · REGISTRERT ${r.kildeDato}` : ""}</Meta>
      )}

      {r.notater && (
        <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", fontStyle: "italic" }}>
          «{r.notater}»
        </p>
      )}

      <Scorekort r={r} />

      <Nokkelverdi
        items={[
          ["SG total", sgTxt(r.sg), { hint: r.sgKilde ? `KILDE · ${r.sgKilde.toUpperCase()}` : undefined }],
          ["Fairway treff", r.fairwayPct == null ? "—" : `${r.fairwayPct} %`],
          ["GIR", r.girPct == null ? "—" : `${r.girPct} %`],
          ["Putter", r.putter ?? "—"],
        ]}
      />

      {sgFelt.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="kicker">Strokes Gained per kategori</span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", font: "var(--type-num-s)", color: "var(--text-secondary)" }}>
            {sgFelt.map((t, idx) => (
              <span key={idx}>{t}</span>
            ))}
          </div>
        </div>
      )}

      <div>
        <KnappLenke variant="ghost" icon={Flag} href={detaljHref}>
          Hull for hull
        </KnappLenke>
      </div>
    </Kort>
  );
}

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

export function PH18Runder(p: PH18Props) {
  const harKladd = useHarRundeKladd();
  const regHref = p.registrerHref ?? "/portal/mal/runder/ny";
  const liveHref = p.liveHref ?? "/portal/runde-live";
  const [fane, setFane] = useState<string>(p.startFane ?? "runder");
  const [rid, setRid] = useState<string | null>(null);
  const runder = p.modell.runder;
  const r = runder.find((x) => x.id === rid) ?? runder[0] ?? null;

  return (
    <Side max={1320}>
      <SideHode
        kicker="Stats · Runder og statistikk"
        title="Runder og statistikk"
        sub="Score er alltid brutto. Til par regnes av par på hullene du har spilt."
        actions={<KnappLenke icon={Flag} href={regHref}>Registrer runde</KnappLenke>}
      />

      {/* Fanene vises alltid (punkt 5 i review) */}
      <div className="pa-tabs" role="tablist">
        {FANER.map((f) => (
          <button
            key={f.verdi}
            type="button"
            role="tab"
            aria-selected={f.verdi === fane}
            className="pa-tab"
            style={{ minWidth: 44 }}
            onClick={() => setFane(f.verdi)}
          >
            {f.navn}
          </button>
        ))}
      </div>

      {harKladd && (
        <div style={{ marginTop: 8 }}>
          <KnappLenke variant="secondary" icon={Play} href={liveHref}>
            Fortsett runde
          </KnappLenke>
        </div>
      )}

      {p.tilstand === "feil" ? (
        <FeilTilstand
          icon={CircleAlert}
          title="Rundene kunne ikke hentes"
          text="Ingen runder er slettet. Prøv å laste siden på nytt."
          code={p.ukjentKode ?? "FEIL · RUNDER"}
        />
      ) : p.tilstand === "tom" ? (
        <TomTilstand
          icon={Flag}
          title="Ingen runder ennå"
          text="Registrer første runde for å få scorekort, statistikk og hull-analyse."
          actions={
            <>
              <KnappLenke icon={Flag} href={regHref}>
                Registrer runde
              </KnappLenke>
              <KnappLenke variant="secondary" icon={Play} href={liveHref}>
                Spill med live-registrering
              </KnappLenke>
            </>
          }
        />
      ) : (
        <>
          {fane === "runder" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 16, alignItems: "start" }}>
              <Tabell
                caption="Runder"
                rows={runder}
                selectedId={r?.id}
                onSelect={setRid}
                columns={[
                  { key: "d", label: "Dato", mono: true, render: (x) => x.kortDato },
                  { key: "b", label: "Bane", render: (x) => x.bane },
                  {
                    key: "s",
                    label: "Brutto",
                    mono: true,
                    align: "right",
                    render: (x) => `${x.score} slag (${x.tilPar ?? "—"})${x.hull === 9 ? " · 9 hull" : ""}`,
                  },
                  { key: "g", label: "SG", mono: true, align: "right", render: (x) => sgTxt(x.sg) },
                ]}
              />
              {r && <RundeDetalj r={r} p={p} />}
            </div>
          )}
          {fane === "stat" && <Statistikk m={p.modell} />}
          {fane === "hull" && <Hull m={p.modell} />}
          {fane === "sesong" && <Sesonger m={p.modell} />}
        </>
      )}
    </Side>
  );
}
