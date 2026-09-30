"use client";

/**
 * PH-18 Runder og statistikk — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-18.jsx, etag 1790567099789847).
 *
 * Fire faner: Runder (liste + scorekort), Statistikk, Hull, Sesonger.
 *
 * Bevisste avvik fra tegningen:
 *   - Etter-runden-gjennomgang viser det som er lagret på runden: SG per kategori
 *     (OTT/APP/ARG/PUTT), kilde, status og notat. 3-putter er ikke med: det finnes
 *     ikke noe felt for det.
 *   - «SG mot PGA Tour» (Data Golf) er ikke med: DataGolf vises aldri for andre enn Anders.
 *   - Scrambling er ikke med som metrikk: HoleScore har ikke opp-og-ned.
 *   - «Del runde» åpner ikke eget ark, men fører til eksisterende delingsside for runden.
 *   - Kategori-kolonnen i sesongtabellen (D–H fra snittscore) er ikke med: A–K-kategorien
 *     settes fra handicap og tester, ikke fra snitt brutto.
 *   - Hull-fanen viser ikke «utslaget havner i bunker»: slagdata har ikke det for alle runder.
 */
import { useState } from "react";
import { Flag, Share2, CircleAlert, Play } from "lucide-react";
import { KnappLenke, Meta, Tall, TomTilstand, FeilTilstand } from "@/components/precision/pa";
import { SideHode, Side, Stabel, Kort, Tabell, Nedtrekk, Skjemafelt, Nokkelverdi } from "@/components/precision/pa-a4";
import { useHarRundeKladd } from "@/components/portal/runde-logg/fortsett-runde-cta";
import { formaterTall, formaterFortegn } from "@/lib/format-tall";
import { PH18_METRIKKER, metrikkVerdi, type PH18Metrikk, type PH18Model, type PH18Runde } from "@/lib/portal-runder/ph18-data";

export type PH18Props = {
  tilstand: "data" | "tom" | "feil";
  ukjentKode?: string;
  /** Fanen som er åpen først. */
  startFane?: "runder" | "stat" | "hull" | "sesong";
  modell: PH18Model;
  /** Satt når siden bare regner på de siste N rundene. */
  avkortet?: number;
  registrerHref: string;
  liveHref: string;
  /** Lenke til delingssiden for en runde. */
  delHref: (id: string) => string;
  /** Lenke til hull-for-hull for en runde. */
  detaljHref: (id: string) => string;
};

const FANER = [
  { verdi: "runder", navn: "Runder" },
  { verdi: "stat", navn: "Statistikk" },
  { verdi: "hull", navn: "Hull" },
  { verdi: "sesong", navn: "Sesonger" },
];
const MND = ["APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT"];

const dec = (v: number, d = 1) => formaterTall(v, d, true);
const tilPar = (v: number | null) => (v == null ? "—" : v === 0 ? "E" : v > 0 ? `+${v}` : `−${Math.abs(v)}`);
const sgTxt = (v: number | null) => (v == null ? "—" : formaterFortegn(v, 2));
/** To kolonner i gitt forhold på bred skjerm; stables under 360 px per kolonne. */
function Par({ forhold, children }: { forhold: [number, number]; children: [React.ReactNode, React.ReactNode] }) {
  const kol = (f: number): React.CSSProperties => ({ flex: `${f} 1 0`, minWidth: "min(100%, 360px)" });
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 16, minWidth: 0, alignItems: "flex-start" }}>
    <div style={kol(forhold[0])}>{children[0]}</div>
    <div style={kol(forhold[1])}>{children[1]}</div>
  </div>;
}

function Merke({ slag, par }: { slag: number; par: number }) {
  const d = slag - par;
  const dobbel = d <= -2 || d >= 2;
  return <span style={{
    display: "inline-grid", placeItems: "center", width: 30, height: 30, boxSizing: "border-box",
    borderRadius: d <= -1 ? "999px" : d >= 1 ? "2px" : 0,
    border: d ? "1.5px solid var(--text-primary)" : "none",
    boxShadow: dobbel ? "0 0 0 2px var(--surface-card), 0 0 0 3.5px var(--text-primary)" : "none",
    font: "600 14px/1 var(--font-mono)", color: "var(--text-primary)",
  }}>{slag}</span>;
}

function Halvdel({ kort, fra, navn }: { kort: { par: number; slag: number }[]; fra: number; navn: string }) {
  const del = kort.slice(fra, fra + 9);
  const cel = (b: string, c: string): React.CSSProperties => ({ font: b, color: c });
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(9,minmax(0,1fr)) minmax(36px,auto)", rowGap: 6, alignItems: "center", textAlign: "center", minWidth: 0 }}>
    {del.map((_, k) => <span key={`h${k}`} style={cel("var(--type-meta)", "var(--text-muted)")}>{fra + k + 1}</span>)}<span style={cel("var(--type-meta)", "var(--text-muted)")}>{fra ? "INN" : "UT"}</span>
    {del.map((h, k) => <span key={`p${k}`} style={cel("var(--type-num-s)", "var(--text-secondary)")}>{h.par}</span>)}<span style={cel("var(--type-num-s)", "var(--text-secondary)")}>{del.reduce((s, h) => s + h.par, 0)}</span>
    {del.map((h, k) => <span key={`s${k}`}><Merke slag={h.slag} par={h.par} /></span>)}<span style={cel("600 15px/1 var(--font-mono)", "var(--text-primary)")}>{del.reduce((s, h) => s + h.slag, 0)}</span>
    <span className="pa-sr">{navn}</span>
  </div>;
}

function Scorekort({ r }: { r: PH18Runde }) {
  if (!r.kort) return <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Scorekort per hull er ikke registrert for denne runden. Bare totalen er lagret.</p>;
  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Halvdel kort={r.kort} fra={0} navn="Hull 1 til 9" />
    {r.kort.length === 18 && <Halvdel kort={r.kort} fra={9} navn="Hull 10 til 18" />}
    <Meta>RUND = BIRDIE · FIRKANT = BOGEY · DOBBEL = ±2</Meta>
  </div>;
}

function RundeDetalj({ r, p }: { r: PH18Runde; p: PH18Props }) {
  return <Kort pad={16} gap={16}>
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <span className="kicker">{r.dato}{r.art ? ` · ${r.art.toUpperCase()}` : ""}</span>
        <div style={{ font: "var(--type-title-s)", color: "var(--text-primary)", marginTop: 4, overflowWrap: "anywhere" }}>{r.bane}</div>
      </div>
      <KnappLenke variant="secondary" icon={Share2} href={p.delHref(r.id)}>Del runde</KnappLenke>
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
      <span style={{ font: "var(--type-metric-l)", color: "var(--text-primary)" }}>{r.score}</span>
      <Tall style={{ color: "var(--text-muted)" }}>slag ({tilPar(r.par == null ? null : r.score - r.par)}) · brutto{r.hull === 9 ? " · 9 hull" : ""}</Tall>
    </div>
    <Scorekort r={r} />
    <Nokkelverdi items={[
      ["SG total", sgTxt(r.sg), { hint: r.sgKilde ? `KILDE · ${r.sgKilde === "manual" ? "MANUELL" : "BEREGNET"}` : undefined }],
      ["Fairway treff", r.fairwayPct == null ? "—" : `${r.fairwayPct} %`],
      ["GIR", r.girPct == null ? "—" : `${r.girPct} %`],
      ["Putter", r.putter ?? "—"],
      ["SG utslag", sgTxt(r.sgKategorier.ott)],
      ["SG innspill", sgTxt(r.sgKategorier.app)],
      ["SG rundt green", sgTxt(r.sgKategorier.arg)],
      ["SG putting", sgTxt(r.sgKategorier.putt)],
      ["Status", r.status ?? "—"],
      ["Kilde", r.kilde ?? "—"],
    ]} />
    {r.notat && <div>
      <span className="kicker">Notat</span>
      <p style={{ margin: "4px 0 0", font: "var(--type-body-s)", color: "var(--text-secondary)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{r.notat}</p>
    </div>}
    <div><KnappLenke variant="ghost" icon={Flag} href={p.detaljHref(r.id)}>Hull for hull</KnappLenke></div>
  </Kort>;
}

function Linje({ verdier, hoyde, label }: { verdier: (number | null)[]; hoyde: number; label: string }) {
  const kjent = verdier.map((v, i) => (v == null ? null : ([i, v] as const))).filter((x): x is readonly [number, number] => x != null);
  if (kjent.length < 2) return <Meta>FOR FÅ RUNDER TIL KURVE</Meta>;
  const vs = kjent.map((k) => k[1]), min = Math.min(...vs), span = Math.max(...vs) - min || 1, w = 200, n = verdier.length - 1 || 1;
  const pts = kjent.map(([i, v]) => `${(i / n) * w},${hoyde - 3 - ((v - min) / span) * (hoyde - 6)}`).join(" ");
  return <svg role="img" aria-label={label} viewBox={`0 0 ${w} ${hoyde}`} preserveAspectRatio="none" style={{ width: "100%", height: hoyde, display: "block" }}>
    <polyline points={pts} fill="none" stroke="var(--text-primary)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
  </svg>;
}

function kilder(rs: PH18Runde[]): string {
  const k = [...new Set(rs.map((r) => r.kilde).filter((x): x is string => x != null))];
  return (k.length ? k.join(" · ") : "DINE REGISTRERTE RUNDER").toUpperCase();
}

function Statistikk({ m }: { m: PH18Model }) {
  const [valgt, setValgt] = useState<PH18Metrikk>("snitt");
  const met = PH18_METRIKKER.find((x) => x.verdi === valgt)!;
  const serie = [...m.runder].reverse().map((r) => metrikkVerdi(r, valgt));
  const gyldige = serie.filter((v): v is number => v != null);
  const snitt = gyldige.length ? gyldige.reduce((a, b) => a + b, 0) / gyldige.length : null;
  const fmt = (v: number | null) => (v == null ? "—" : met.enhet === "%" ? `${v} %` : `${dec(v)} ${met.enhet}`);
  return <Par forhold={[1.3,1]}>
    <Kort pad={16}>
      <div style={{ maxWidth: 320 }}>
        <Skjemafelt label="Metrikk"><Nedtrekk value={valgt} onChange={(v) => setValgt(v as PH18Metrikk)} options={PH18_METRIKKER.map((x) => ({ value: x.verdi, label: x.navn }))} /></Skjemafelt>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ font: "var(--type-metric-l)", color: "var(--text-primary)" }}>{snitt == null ? "—" : met.enhet === "%" ? Math.round(snitt) : dec(snitt)}</span>
        <Tall style={{ color: "var(--text-muted)" }}>{met.enhet} · snitt {gyldige.length} runder</Tall>
      </div>
      <Linje verdier={serie} hoyde={120} label={`${met.navn} over tid`} />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <Meta>{m.runder[m.runder.length - 1]?.kortDato}</Meta>
        <Meta>{met.lavereErBedre ? "LAVERE ER BEDRE" : "HØYERE ER BEDRE"}</Meta>
        <Meta>{m.runder[0]?.kortDato}</Meta>
      </div>
      <Meta>KILDE · {kilder(m.runder)} · SIST {m.runder[0]?.dato}</Meta>
      {met.bareAtten && <Meta>9-HULLSRUNDER TELLER IKKE I SNITT BRUTTO OG PUTTER</Meta>}
    </Kort>
    <Tabell caption={`${met.navn} per runde`} rows={m.runder} tomTekst="—" columns={[
      { key: "d", label: "Dato", mono: true, render: (r) => r.kortDato },
      { key: "b", label: "Bane", render: (r) => r.bane },
      { key: "v", label: met.navn, mono: true, align: "right", render: (r) => fmt(metrikkVerdi(r, valgt)) },
    ]} />
  </Par>;
}

function Hull({ m }: { m: PH18Model }) {
  const h = m.hull;
  if (!h) return <TomTilstand icon={Flag} title="Ingen hull-for-hull-runder ennå" text="Snitt per hull krever en runde med score på alle 18 hull." />;
  const maks = Math.max(1.2, ...h.snitt);
  return <Par forhold={[1.4,1]}>
    <Kort pad={16} gap={6}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="kicker">Snitt til par per hull · {h.bane}</span><Meta>{h.antallRunder} {h.antallRunder === 1 ? "RUNDE" : "RUNDER"}</Meta>
      </div>
      {h.snitt.map((v, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "72px minmax(0,1fr) 48px", gap: 10, alignItems: "center", minHeight: 28 }}>
        <span style={{ font: "var(--type-num-s)", color: "var(--text-primary)" }}>Hull {i + 1}</span>
        <span style={{ height: 10, background: "var(--surface-sunken)", position: "relative" }}>
          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.max(0, v / maks) * 100}%`, background: i + 1 === h.dyreste.hull ? "var(--text-primary)" : "var(--text-secondary)" }} />
        </span>
        <span style={{ font: "var(--type-num-s)", color: "var(--text-primary)", textAlign: "right" }}>{v > 0 ? "+" : ""}{dec(v)}</span>
      </div>)}
      <Meta>PAR {h.par.join(" · ")}</Meta>
    </Kort>
    <Stabel>
      <Kort pad={16} gap={8}>
        <span className="kicker">Dyreste hull</span>
        <div style={{ font: "var(--type-title-s)", color: "var(--text-primary)" }}>Hull {h.dyreste.hull} · par {h.dyreste.par}</div>
        <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Snitt {h.dyreste.snitt > 0 ? "+" : ""}{dec(h.dyreste.snitt)} til par. {h.dyreste.rundeMedBogey} av {h.antallRunder} runder med bogey eller verre.</p>
      </Kort>
      <Kort pad={16} gap={8}>
        <span className="kicker">Beste hull</span>
        <div style={{ font: "var(--type-title-s)", color: "var(--text-primary)" }}>Hull {h.beste.hull} · par {h.beste.par}</div>
        <Meta>SNITT {h.beste.snitt > 0 ? "+" : ""}{dec(h.beste.snitt)} TIL PAR · {h.antallRunder} {h.antallRunder === 1 ? "RUNDE" : "RUNDER"}</Meta>
      </Kort>
    </Stabel>
  </Par>;
}

function Sesonger({ m }: { m: PH18Model }) {
  const s = m.sesonger;
  if (s.length === 0) return <TomTilstand icon={Flag} title="Ingen sesongdata ennå" text="Sesongene bygges av 18-hullsrunder." />;
  const W = 600, H = 220, alle = s.flatMap((x) => x.maaneder).filter((v): v is number => v != null);
  const topp = Math.max(4, Math.ceil(Math.max(...alle, 0) / 4) * 4), bunn = Math.min(0, Math.floor(Math.min(...alle, 0) / 4) * 4);
  const ticks: number[] = []; for (let v = bunn; v <= topp; v += 4) ticks.push(v);
  const x = (i: number) => 30 + (i * (W - 50)) / 6, y = (v: number) => 16 + (1 - (v - bunn) / (topp - bunn)) * (H - 40);
  const ink = ["var(--graphite-400)", "var(--graphite-500)", "var(--graphite-600)", "var(--text-primary)"].slice(-s.length);
  return <Par forhold={[1.4,1]}>
    <Kort pad={16}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}><span className="kicker">Til par per måned · 18 hull</span><Meta>{s[0].aar}–{s[s.length - 1].aar}</Meta></div>
      <div style={{ width: "100%", minWidth: 0 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`Til par per måned, ${s.length} sesonger`}>
          {ticks.map((v) => <g key={v}><line x1="30" x2={W - 20} y1={y(v)} y2={y(v)} stroke="var(--border-hairline)" /><text x="24" y={y(v) + 4} textAnchor="end" style={{ font: "400 11px var(--font-mono)", fill: "var(--text-muted)" }}>{v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : "±0"}</text></g>)}
          {MND.map((mm, i) => <text key={mm} x={x(i)} y={H - 4} textAnchor="middle" style={{ font: "400 11px var(--font-mono)", fill: "var(--text-muted)" }}>{mm}</text>)}
          {s.map((se, si) => {
            const pts = se.maaneder.map((v, i) => (v == null ? null : ([x(i), y(v)] as const))).filter((p): p is readonly [number, number] => p != null);
            if (pts.length === 0) return null;
            const siste = si === s.length - 1;
            return <g key={se.aar}>
              <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={ink[si]} strokeWidth={siste ? 2.5 : 1.5} strokeDasharray={siste ? "none" : "4 3"} />
              <text x={Math.min(pts[pts.length - 1][0] + 6, W - 26)} y={pts[pts.length - 1][1] + 4} style={{ font: "600 11px var(--font-mono)", fill: ink[si] }}>{se.aar}</text>
            </g>;
          })}
        </svg>
      </div>
      <Meta>MÅNEDER UTEN 18-HULLSRUNDE ER TOMME, IKKE NULL</Meta>
    </Kort>
    <Tabell caption="Snitt brutto per sesong" rows={[...s].reverse().map((x) => ({ ...x, id: String(x.aar) }))} columns={[
      { key: "y", label: "Sesong", mono: true, render: (x) => x.aar },
      { key: "n", label: "Runder", mono: true, align: "right", render: (x) => x.antall },
      { key: "a", label: "Snitt brutto", mono: true, align: "right", render: (x) => (x.snittBrutto == null ? "—" : `${dec(x.snittBrutto)} slag`) },
    ]} />
  </Par>;
}

export function PH18Runder(p: PH18Props) {
  const harKladd = useHarRundeKladd();
  const [fane, setFane] = useState<string>(p.startFane ?? "runder");
  const [rid, setRid] = useState<string | null>(null);
  const runder = p.modell.runder;
  const r = runder.find((x) => x.id === rid) ?? runder[0] ?? null;
  return <Side max={1320}>
    <SideHode kicker="Stats · Runder og statistikk" title="Runder og statistikk" sub="Score er alltid brutto. Til par regnes av par på hullene du har ført; uten hullscore vises «—»."
      actions={<KnappLenke icon={Flag} href={p.registrerHref}>Registrer runde</KnappLenke>} />
    {p.tilstand === "feil" ? <FeilTilstand icon={CircleAlert} title="Rundene kunne ikke hentes" text="Ingen runder er slettet. Prøv å laste siden på nytt." code={p.ukjentKode ?? "FEIL · RUNDER"} />
      : <>
        {harKladd && <div><KnappLenke variant="secondary" icon={Play} href={p.liveHref}>Fortsett runde</KnappLenke></div>}
        <div className="pa-tabs" role="tablist">
          {FANER.map((f) => <button key={f.verdi} type="button" role="tab" aria-selected={f.verdi === fane} className="pa-tab" style={{ minWidth: 44 }} onClick={() => setFane(f.verdi)}>{f.navn}</button>)}
        </div>
        {p.avkortet != null && <Meta>VISER DE {p.avkortet} SISTE RUNDENE</Meta>}
        {p.tilstand === "tom" && (fane === "runder" || fane === "stat") ? <TomTilstand icon={Flag} title="Ingen runder ennå" text="Registrer første runde for å få scorekort, statistikk og hull-analyse."
          actions={<><KnappLenke icon={Flag} href={p.registrerHref}>Registrer runde</KnappLenke><KnappLenke variant="secondary" icon={Play} href={p.liveHref}>Spill med live-registrering</KnappLenke></>} /> : <>
        {fane === "runder" && <Par forhold={[1, 1.2]}>
          <Tabell caption="Runder" rows={runder} selectedId={r?.id} onSelect={setRid} columns={[
            { key: "d", label: "Dato", mono: true, render: (x) => x.kortDato },
            { key: "b", label: "Bane", render: (x) => x.bane },
            { key: "s", label: "Brutto", mono: true, align: "right", render: (x) => `${x.score} slag (${tilPar(x.par == null ? null : x.score - x.par)})${x.hull === 9 ? " · 9 hull" : ""}` },
            { key: "g", label: "SG", mono: true, align: "right", render: (x) => sgTxt(x.sg) },
          ]} />
          {r ? <RundeDetalj r={r} p={p} /> : <span />}
        </Par>}
        {fane === "stat" && <Statistikk m={p.modell} />}
        {fane === "hull" && <Hull m={p.modell} />}
        {fane === "sesong" && <Sesonger m={p.modell} />}
      </>}
      </>}
  </Side>;
}
