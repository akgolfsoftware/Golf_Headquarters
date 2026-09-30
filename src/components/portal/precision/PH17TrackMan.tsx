"use client";

/**
 * PH-17 TrackMan — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-17.jsx, etag 1790575336603608).
 *
 * Fire faner som ekte ruter: Økter, Gapping, Utstyr og Stasjon. Denne fila dekker de tre første;
 * Stasjon beholder dagens skjerm (se PR-beskrivelsen).
 *
 * Bevisste avvik fra tegningen:
 *   - Bay vises ikke: TrackManSession har ingen bay-kolonne. Tittelen er miljøet (eller «TrackMan-økt»).
 *   - Gapping bruker appens domeneregler (band 25.–75. persentil, hull over 22 m, minst 20 slag),
 *     ikke tegningens 8/18 m. «Overlapp» finnes ikke i domenet og vises derfor ikke.
 *   - Utstyr viser målvinduene fra equipment-fit (launch, spin, smash) per kølle. Modell og siste
 *     fitting finnes ikke i dataene og vises ikke.
 *   - «Koble TrackMan» er «Importer økt» (CSV/HTML/konto) via eksisterende importdialog.
 */
import { useState } from "react";
import { ArrowLeft, CircleAlert, Crosshair, TriangleAlert } from "lucide-react";
import { KnappLenke, Meta, StatusPille, TomTilstand, FeilTilstand } from "@/components/precision/pa";
import { Side, SideHode, Stabel, Tabell, FanerLenker, Nokkelverdi } from "@/components/precision/pa-a4";
import { Valgpille } from "@/components/precision/pa-planhub";
import { formaterTall } from "@/lib/format-tall";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";
import type { Ph17Okt, Ph17Kolle } from "@/lib/trackman/ph17-data";
import type { GappingData } from "@/lib/portal/gapping-data";
import type { ClubFitReport, FitStatus } from "@/lib/sg-hub/equipment-fit";
import "@/styles/precision-ph17.css";

export type PH17Fane = "okter" | "gap" | "utstyr" | "stasjon";
const FANER = [
  { id: "okter", navn: "Økter", href: "/portal/analysere/trackman" },
  { id: "gap", navn: "Gapping", href: "/portal/mal/trackman/gapping" },
  { id: "utstyr", navn: "Utstyr", href: "/portal/mal/sg-hub/equipment" },
  { id: "stasjon", navn: "Stasjon", href: "/portal/analysere/datagolf/stasjon" },
] as const;

const dec = (n: number, d = 1) => formaterTall(n, d, true);
const tusen = (n: number) => formaterTall(n, 0);
const Kilde = ({ children }: { children: React.ReactNode }) => <span className="ph17-kilde">{children}</span>;
const Kort = ({ children, gap = 12, pad = 16 }: { children: React.ReactNode; gap?: number; pad?: number }) =>
  <div className="pa-card" style={{ padding: pad, gap, display: "flex", flexDirection: "column", minWidth: 0 }}>{children}</div>;
const KortHode = ({ tittel, kilde }: { tittel: string; kilde?: string }) =>
  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}><span className="kicker">{tittel}</span>{kilde && <Kilde>{kilde}</Kilde>}</div>;

export function PH17Ramme({ aktiv, tilstand = "data", kode, importerFor, children }: {
  aktiv: PH17Fane; tilstand?: "data" | "feil"; kode?: string; importerFor?: string; children: React.ReactNode;
}) {
  return <Side max={1320}>
    <SideHode kicker="Stats · TrackMan" title="TrackMan" sub="Økter importeres fra TrackMan-eksport eller -konto. Tallene står på engelsk slik TrackMan viser dem."
      actions={<>
        <TrackmanImportModal label="Importer økt" className="pa-btn pa-btn--secondary" onBehalfOfUserId={importerFor} />
        <KnappLenke variant="secondary" icon={ArrowLeft} iconName="arrow-left" href="/portal/analysere">Stats</KnappLenke>
      </>} />
    {tilstand === "feil"
      ? <FeilTilstand icon={CircleAlert} title="TrackMan-øktene kunne ikke hentes" text="Øktene er ikke slettet. Prøv igjen om litt." code={kode ?? "FEIL 503 · TRACKMAN"} retry={<KnappLenke variant="secondary" href="/portal/analysere/trackman">Prøv igjen</KnappLenke>} />
      : <>
        <FanerLenker faner={FANER.map((f) => ({ href: f.href, navn: f.navn, aktiv: f.id === aktiv }))} />
        {children}
      </>}
  </Side>;
}

/* ---------------- Økter ---------------- */

function Spredning({ pts, height, label }: { pts: [number, number][]; height: number; label: string }) {
  const n = pts.length;
  const maks = pts.reduce((a, p) => Math.max(a, Math.abs(p[0]), Math.abs(p[1])), 0);
  const range = [6, 9, 12, 18, 24, 36, 60].find((r) => r >= maks) ?? 100;
  const mx = n ? pts.reduce((a, p) => a + p[0], 0) / n : 0, my = n ? pts.reduce((a, p) => a + p[1], 0) / n : 0;
  const sx = n ? Math.sqrt(pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0) / n) : 0, sy = n ? Math.sqrt(pts.reduce((a, p) => a + (p[1] - my) ** 2, 0) / n) : 0;
  const S = 100 / range;
  return <div className="ph17-spred" style={{ height }}>
    <svg viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>
      {[1, 2, 3].map((r) => <circle key={r} cx="0" cy="0" r={r * 100 / 3} fill="none" stroke="var(--border-hairline)" vectorEffect="non-scaling-stroke" />)}
      <line x1="-100" x2="100" y1="0" y2="0" stroke="var(--border-strong)" vectorEffect="non-scaling-stroke" />
      <line y1="-100" y2="100" x1="0" x2="0" stroke="var(--border-strong)" vectorEffect="non-scaling-stroke" />
      {n > 2 && <ellipse cx={mx * S} cy={-my * S} rx={sx * 2 * S} ry={sy * 2 * S} fill="var(--surface-sunken)" stroke="var(--text-secondary)" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />}
      {pts.map((p, i) => <circle key={i} cx={Math.max(-98, Math.min(98, p[0] * S))} cy={Math.max(-98, Math.min(98, -p[1] * S))} r="3.4" fill="var(--text-primary)" />)}
      <circle cx="0" cy="0" r="4" fill="none" stroke="var(--border-ink)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
    <span className="ph17-spred__m" style={{ left: 10, top: 8 }}>LENGRE</span>
    <span className="ph17-spred__m" style={{ left: 10, bottom: 8 }}>KORTERE · RINGER {dec(range / 3, 0)} M</span>
    <span className="ph17-spred__m" style={{ right: 10, bottom: 8 }}>STIPLET = 2 SD</span>
  </div>;
}

function Metrikk({ k, v, e }: { k: string; v: string | null; e?: string }) {
  return <div className="ph17-metrikk"><span className="ph17-metrikk__k">{k}</span><span><span className="ph17-metrikk__v">{v ?? "—"}</span>{v != null && e && <span className="ph17-metrikk__e">{e}</span>}</span></div>;
}

export function PH17Okter({ okter, valgtId }: { okter: Ph17Okt[]; valgtId?: string }) {
  const start = okter.find((o) => o.id === valgtId) ?? okter[0];
  const [sid, setSid] = useState(start?.id ?? "");
  const [kolle, setKolle] = useState(start?.klubber[0]?.navn ?? "");
  if (!okter.length) return <TomTilstand icon={Crosshair} title="Ingen TrackMan-økter" text="Importer en økt fra TrackMan, eller book en bay. Øktene dukker opp her etter import." actions={<>
    <TrackmanImportModal label="Importer økt" className="pa-btn pa-btn--primary" />
    <KnappLenke variant="secondary" href="/portal/booking">Book bay</KnappLenke></>} />;
  const ses = okter.find((o) => o.id === sid) ?? okter[0];
  const k: Ph17Kolle | undefined = ses.klubber.find((c) => c.navn === kolle) ?? ses.klubber[0];
  const src = `TRACKMAN · ${ses.kilde} · ${ses.dato}`;
  const velg = (id: string) => { setSid(id); setKolle(okter.find((o) => o.id === id)?.klubber[0]?.navn ?? ""); };
  const s = k?.snitt;
  return <div className="ph17-kol ph17-kol--okter">
    <div className="pa-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-hairline)", background: "var(--surface-flat)", display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span className="kicker">TrackMan-økter</span><Meta>{okter.length} SISTE</Meta>
      </div>
      {okter.map((o) => <button key={o.id} type="button" className="ph17-rad" aria-pressed={o.id === ses.id} onClick={() => velg(o.id)}>
        <span style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{o.tittel}</span>
          <span style={{ font: "var(--type-num-s)", color: "var(--text-primary)" }}>{o.slag} slag</span>
        </span>
        <Meta>{o.dato} · {o.klubber.map((c) => c.navn).join(" · ").toUpperCase() || "—"}</Meta>
      </button>)}
    </div>
    <Stabel>
      {ses.klubber.length > 0 && <div className="ph17-valg">{ses.klubber.map((c) => <Valgpille key={c.navn} mono valgt={c.navn === k?.navn} onVelg={() => setKolle(c.navn)}>{c.navn}</Valgpille>)}</div>}
      <Kort>
        <KortHode tittel={`Spredning · ${k?.navn ?? "—"} · ${k?.pts.length ?? 0} slag`} kilde={src} />
        {k && k.pts.length > 0
          ? <Spredning pts={k.pts} height={320} label={`Spredning ${k.navn}`} />
          : <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen slag med sideavvik og carry i denne økta.</p>}
      </Kort>
      <Kort>
        <KortHode tittel={`Snitt · ${k?.navn ?? "—"}`} kilde={src} />
        {s ? <div className="ph17-metrikker">
          <Metrikk k="Carry" v={s.carry != null ? dec(s.carry) : null} e="m" />
          <Metrikk k="Club Speed" v={s.clubSpeed != null ? dec(s.clubSpeed) : null} e="mph" />
          <Metrikk k="Ball Speed" v={s.ballSpeed != null ? dec(s.ballSpeed) : null} e="mph" />
          <Metrikk k="Smash Factor" v={s.smash != null ? dec(s.smash, 2) : null} />
          <Metrikk k="Launch Angle" v={s.launch != null ? dec(s.launch) : null} e="°" />
          <Metrikk k="Club Path" v={s.clubPath != null ? dec(s.clubPath) : null} e="°" />
          <Metrikk k="Face to Path" v={s.faceToPath != null ? dec(s.faceToPath) : null} e="°" />
          <Metrikk k="Spin Rate" v={s.spin != null ? tusen(s.spin) : null} e="rpm" />
        </div> : <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>—</p>}
        {s && (s.faceToPath == null || s.spin == null) && <Meta>{[s.faceToPath == null && "FACE TO PATH", s.spin == null && "SPIN RATE"].filter(Boolean).join(" OG ")} MANGLER I DENNE ØKTA</Meta>}
      </Kort>
    </Stabel>
  </div>;
}

/* ---------------- Gapping ---------------- */

type GapRad = { id: string; klubb: string; median: number; gap: number | null; hull: boolean; tynn: boolean };

export function PH17Gapping({ data }: { data: GappingData }) {
  if (data.okter === 0 || data.forFaaSlag) return <TomTilstand icon={Crosshair} title={data.okter === 0 ? "Ingen TrackMan-data ennå" : "For få slag til gapping"}
    text={data.okter === 0 ? `Importer en økt, så tegnes carry per kølle her. Vinduet er siste ${data.vinduDager} dager.` : `Kartet trenger flere slag per kølle. Så langt: ${data.totaltSlag} slag siste ${data.vinduDager} dager.`}
    actions={<TrackmanImportModal label="Importer økt" className="pa-btn pa-btn--primary" />} />;
  const hull = new Set(data.gap.map((g) => g.over));
  const rader: GapRad[] = data.koller.map((c, i) => { const nx = data.koller[i + 1]; return { id: c.klubb, klubb: c.klubb, median: c.median, gap: nx ? c.median - nx.median : null, hull: hull.has(c.klubb) && !c.tynn, tynn: c.tynn }; });
  const skala = Math.max(...data.koller.map((c) => c.p75), 1) * 1.04;
  const src = `TRACKMAN · ${data.okter} ØKTER · SISTE ${data.vinduDager} DAGER`;
  return <div className="ph17-kol ph17-kol--gap">
    <Kort gap={10}>
      <KortHode tittel="Carry per kølle" kilde={src} />
      {data.koller.map((c) => <div key={c.klubb} className="ph17-gap">
        <span className="ph17-gap__k">{c.klubb}</span>
        <span className="ph17-gap__bar" aria-hidden>
          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(c.median / skala) * 100}%`, background: "var(--text-primary)" }} />
          <span style={{ position: "absolute", top: -3, bottom: -3, left: `${(c.p25 / skala) * 100}%`, width: `${((c.p75 - c.p25) / skala) * 100}%`, borderLeft: "1px solid var(--text-muted)", borderRight: "1px solid var(--text-muted)" }} />
        </span>
        <span className="ph17-gap__v">{dec(c.median)} m</span>
      </div>)}
      <Meta>STREK = 25.–75. PERSENTIL I LENGDE · STOLPE = MEDIAN</Meta>
    </Kort>
    <Tabell<GapRad> caption="Gapping mellom køller" columns={[
      { key: "c", label: "Kølle", mono: true, render: (r) => r.klubb },
      { key: "carry", label: "Carry", mono: true, align: "right", render: (r) => `${dec(r.median)} m` },
      { key: "g", label: "Gap til neste", mono: true, align: "right", render: (r) => (r.gap == null ? "—" : `${dec(r.gap)} m`) },
      { key: "f", label: "Vurdering", render: (r) => r.hull ? <span className="ph17-vurd"><TriangleAlert size={14} aria-hidden />Hull · over 22 m</span> : r.tynn ? "For få slag" : "Jevnt" },
    ]} rows={rader} />
  </div>;
}

/* ---------------- Utstyr ---------------- */

const STATUS: Record<FitStatus, { tone: "ok" | "warn" | "neutral"; tekst: string }> = {
  ok: { tone: "ok", tekst: "I target" }, warn: { tone: "warn", tekst: "Utenfor target" }, critical: { tone: "warn", tekst: "Kritisk avvik" }, missing: { tone: "neutral", tekst: "Data mangler" },
};

const fmtM = (unit: string, v: number, utenEnhet = false) => {
  const tall = unit === "rpm" ? tusen(v) : dec(v, unit === "" ? 2 : 0 === v % 1 ? 0 : 1);
  return utenEnhet || !unit ? tall : unit === "°" ? `${tall}°` : `${tall} ${unit}`;
};

export function PH17Utstyr({ reports }: { reports: ClubFitReport[] }) {
  if (!reports.length) return <TomTilstand icon={Crosshair} title="Ingen TrackMan-data ennå" text="Importer din første økt for å aktivere utstyrssjekken." actions={<TrackmanImportModal label="Importer økt" className="pa-btn pa-btn--primary" />} />;
  return <Stabel>
    <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", maxWidth: 680, textWrap: "pretty" }}>Launch, spin og smash sjekkes mot målvinduer per kølletype. Avvik kan tyde på feil køllevalg, oppsett eller ball-fitting, og er ofte raskere å fikse enn teknikk.</p>
    <div className="ph17-utstyr">{reports.map((r) => <Kort key={r.clubId} gap={10}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ font: "600 17px/1 var(--font-mono)", color: "var(--text-primary)", flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{r.clubId}</span>
        <StatusPille tone={STATUS[r.overall].tone}>{STATUS[r.overall].tekst}</StatusPille>
      </div>
      {r.metrics.length
        ? <Nokkelverdi items={r.metrics.map((m) => [m.label, m.value != null ? fmtM(m.unit, m.value) : null, { mono: true, hint: m.target ? `Mål ${fmtM(m.unit, m.target.min, true)}–${fmtM(m.unit, m.target.max)}` : undefined }] as const)} />
        : <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen målvinduer definert for denne køllen.</p>}
      <Kilde>TRACKMAN · {r.shotCount} SLAG</Kilde>
    </Kort>)}</div>
  </Stabel>;
}
