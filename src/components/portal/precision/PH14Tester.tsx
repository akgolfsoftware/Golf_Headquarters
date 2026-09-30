"use client";

/**
 * PH-14 Tester — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-14.jsx, etag 1790567099789847).
 *
 * Liste med søk, historikk til valgt test i side-panel (fra 768 px) eller ark
 * (mobil), «Gjennomfør test» og «Lag egen test».
 *
 * Bevisste avvik fra tegningen:
 *   - Grupperingen er Golfslag / Teknikk / Andre (hub-gruppe.ts), ikke
 *     Team Norway / AK Golf / Mine tester: appen har ingen slik gruppering.
 *   - «Registrer resultat» og «Lag egen test» åpner ikke eget ark; de fører til
 *     eksisterende flyter (/ny og /ny/egen). /ny velger test i eget steg 1 (fra en
 *     fast katalog, ikke test-id), så valgt test tas ikke med dit. Loggen krever sted og utstyr, og
 *     Team Norway-tester kan ikke føres som ett tall (poengsum regnes fra forsøkene).
 *   - Enhet vises bare der verdiformateringen har en (prosent, poeng, «OK av N»): testene
 *     har ingen enhetskolonne. Norm A–K vises ikke: normene finnes ikke for alle tester.
 *   - Kurven er en enkel linje uten mål: testene har ikke målverdi i dataene.
 */
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ClipboardList, Pencil, Play, Plus, CircleAlert } from "lucide-react";
import { KnappLenke, AkseMerke, Meta, Tall, TomTilstand, FeilTilstand, type Akse } from "@/components/precision/pa";
import { SideHode, Side, Stabel, Tabell, Ark } from "@/components/precision/pa-a4";
import { Sokefelt } from "@/components/precision/pa-a2";
import "@/styles/precision-ph14.css";

export type PH14Test = {
  id: string;
  navn: string;
  akse: Akse;
  regel: string;
  verdi: string | null;
  maalinger: number;
  sisteDato: string | null;
  delta: { tekst: string; bra: boolean } | null;
  hoyereErBedre: boolean;
  forsok: number;
  /** Nyeste først. */
  historikk: { dato: string; verdi: string }[];
  /** Eldste først. */
  kurve: number[];
  href: string;
};
export type PH14Gruppe = { id: string; label: string; tester: PH14Test[] };
export type PH14Props = {
  tilstand: "data" | "tom" | "feil";
  ukjentKode?: string;
  grupper: PH14Gruppe[];
  antallForfaller: number;
  egenHref: string;
  registrerHref: string;
  tnHref: string;
};

const bred = (cb: () => void) => { const m = window.matchMedia("(min-width: 768px)"); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };

function Kurve({ verdier, hoyde, label }: { verdier: number[]; hoyde: number; label: string }) {
  const min = Math.min(...verdier), max = Math.max(...verdier), span = max - min || 1, h = hoyde, w = 200;
  const pts = verdier.map((v, i) => `${(i / (verdier.length - 1)) * w},${h - 3 - ((v - min) / span) * (h - 6)}`).join(" ");
  return <svg {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: h, display: "block" }}>
    <polyline points={pts} fill="none" stroke="var(--text-primary)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
  </svg>;
}

type HistRad = { id: string; dato: string; verdi: string; n: string };

function Historikk({ t, registrerHref }: { t: PH14Test; registrerHref: string }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <AkseMerke axis={t.akse} />
      <Meta>{t.forsok} FORSØK · {t.hoyereErBedre ? "HØYERE ER BEDRE" : "LAVERE ER BEDRE"}</Meta>
    </div>
    <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty", overflowWrap: "anywhere" }}>{t.regel || "—"}</p>
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
      <span style={{ font: "var(--type-metric-l)", color: "var(--text-primary)" }}>{t.verdi ?? "—"}</span>
      {t.delta && <Meta style={{ color: t.delta.bra ? "var(--text-primary)" : "var(--text-muted)" }}>{t.delta.tekst} SIDEN FORRIGE</Meta>}
    </div>
    {t.kurve.length >= 2 ? <Kurve verdier={t.kurve} hoyde={48} label={`Utvikling ${t.navn}`} /> : <Meta>FOR FÅ RESULTATER TIL KURVE</Meta>}
    {t.historikk.length
      ? <Tabell<HistRad> caption="Historikk" columns={[{ key: "d", label: "Dato", mono: true, render: (r: HistRad) => r.dato }, { key: "v", label: "Resultat", mono: true, align: "right", render: (r: HistRad) => r.verdi }, { key: "n", label: "", render: (r: HistRad) => r.n }]} rows={t.historikk.map((h, i) => ({ id: String(i), ...h, n: i === 0 ? "Siste" : "" }))} />
      : <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen resultater ennå. Gjennomfør testen for å få første måling.</p>}
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <KnappLenke fullWidth icon={Play} iconName="play" href={t.href}>Gjennomfør test</KnappLenke>
      <KnappLenke variant="secondary" fullWidth icon={Pencil} iconName="pencil-line" href={registrerHref}>Registrer resultat</KnappLenke>
    </div>
  </div>;
}

export function PH14Tester(p: PH14Props) {
  const split = useSyncExternalStore(bred, () => window.matchMedia("(min-width: 768px)").matches, () => false);
  const alle = p.grupper.flatMap((g) => g.tester);
  const [q, setQ] = useState("");
  const [valgt, setValgt] = useState<string | null>(null);
  const treff = (t: PH14Test) => t.navn.toLowerCase().includes(q.trim().toLowerCase());
  const sel = alle.find((t) => t.id === valgt) ?? (split ? alle[0] ?? null : null);
  const antallTreff = alle.filter(treff).length;
  const tom = p.tilstand === "tom" || alle.length === 0;

  const handlinger = <>
    <KnappLenke variant="secondary" icon={Plus} iconName="plus" href={p.egenHref}>Lag egen test</KnappLenke>
    {sel && <KnappLenke icon={Play} iconName="play" href={sel.href}>Gjennomfør test</KnappLenke>}
  </>;

  const liste = <Stabel>
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Sokefelt label="Søk test" placeholder="Søk test" value={q} onChange={setQ} />
      <Meta>{antallTreff} {antallTreff === 1 ? "TEST" : "TESTER"}</Meta>
    </div>
    {p.grupper.map((g) => {
      const rader = g.tester.filter(treff);
      if (!rader.length) return null;
      return <div key={g.id} className="pa-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", padding: "12px 16px", borderBottom: "1px solid var(--border-hairline)", background: "var(--surface-flat)" }}>
          <span className="kicker">{g.label}</span><Meta>{rader.length} {rader.length === 1 ? "TEST" : "TESTER"}</Meta>
        </div>
        {rader.map((t) => <button key={t.id} type="button" className="ph14-rad" aria-pressed={sel?.id === t.id} onClick={() => setValgt(t.id)}>
          <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{t.navn}</span>
            <Meta>{t.maalinger ? `SISTE ${t.sisteDato ?? "—"} · ${t.maalinger} ${t.maalinger === 1 ? "MÅLING" : "MÅLINGER"}` : "IKKE TESTET"}</Meta>
          </span>
          {split && (t.kurve.length >= 2 ? <Kurve verdier={t.kurve} hoyde={24} label="" /> : <Meta>—</Meta>)}
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <Tall style={{ font: "var(--type-num-s)" }}>{t.verdi ?? "—"}</Tall>
            {t.delta && <Meta style={{ color: t.delta.bra ? "var(--text-primary)" : "var(--text-muted)" }}>{t.delta.tekst}</Meta>}
          </span>
        </button>)}
      </div>;
    })}
    {p.antallForfaller > 0 && <Meta>{p.antallForfaller === 1 ? "1 TEST FORFALLER" : `${p.antallForfaller} TESTER FORFALLER`}</Meta>}
    <Link href={p.tnHref} className="pa-btn pa-btn--ghost" style={{ justifySelf: "start" }}>Team Norway · oppdaterte scorekort</Link>
  </Stabel>;

  return <Side max={1320}>
    <SideHode kicker="Plan · Tester" title="Tester" sub="Team Norway-testbatteriet, AK Golf-tester og egne tester. Resultatene vises i Stats." actions={handlinger} />
    {p.tilstand === "feil"
      ? <FeilTilstand icon={CircleAlert} title="Testene kunne ikke hentes" text="Resultatene dine er ikke slettet. Prøv igjen." code={p.ukjentKode} retry={<KnappLenke variant="secondary" href="/portal/tren/tester">Prøv igjen</KnappLenke>} />
      : tom
        ? <TomTilstand icon={ClipboardList} title="Ingen tester ennå" text="Testene dukker opp her når coachen din har registrert deg. Du kan lage en egen test nå." actions={<KnappLenke href={p.egenHref} icon={Plus} iconName="plus">Lag egen test</KnappLenke>} />
        : <div className="ph14-kolonner">
          {liste}
          <div className="pa-card ph14-panel">
            {sel ? <>
              <span className="kicker">Test</span>
              <div style={{ font: "var(--type-title-s)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{sel.navn}</div>
              <Historikk t={sel} registrerHref={p.registrerHref} />
            </> : <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Velg en test for å se historikk.</p>}
          </div>
        </div>}
    {!split && <Ark open={!!sel} onClose={() => setValgt(null)} kicker="Test" title={sel?.navn}>
      {sel && <Historikk t={sel} registrerHref={p.registrerHref} />}
    </Ark>}
  </Side>;
}
