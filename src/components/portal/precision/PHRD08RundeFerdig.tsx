/**
 * PH-RD-08 Runde ferdig — Precision Athletics
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-RD-2.jsx › RD08, etag 1790575336603608;
 * SGBar fra ui_kits/playerhq/an-parts.jsx).
 *
 * Siden viser en lagret runde: score, Strokes Gained og hull for hull.
 *
 * Bevisste avvik fra tegningen:
 *   - Tegningens «Lagre runde» og «Lagre delvis» finnes ikke: runden er allerede lagret når siden
 *     åpnes. Handlingene er de siden allerede hadde (fullfør slag-kjeden, rediger hull for hull,
 *     slag for slag, import fra UpGame, del med coach).
 *   - Hull-SG under hvert hull mangler: appen lagrer ikke SG per hull, og et tall vi ikke har
 *     vises ikke som gjetning.
 *   - Handlingsraden er ikke klebrig nederst: PlayerHQ-skallet har allerede fanelinje nederst.
 *   - Manuell SG-redigering, UpGame-import og kontekstspørsmålene er beholdt med eget uttrykk
 *     til RD-09 (rediger) og RD-07 (import) er portert.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Flag, MessageSquare, Pencil, Route, TrendingUp, TriangleAlert, ListChecks } from "lucide-react";
import { formaterFortegn } from "@/lib/format-tall";
import { ManuellSgRedigering } from "@/components/portal/runde-ny/manuell-sg-redigering";
import { SG_DETALJGRUPPER, type ManuellSgVerdier } from "@/lib/portal-runder/manuell-sg";
import {
  RUNDE_DATAQUALITY_META,
  RUNDE_SG_KILDE,
  RUNDE_STATUS_META,
  type RundeRegistreringStatus,
} from "@/lib/runde-logg/kontrakt";
import { UpGameImportModal } from "@/app/portal/mal/runder/[id]/upgame-import-modal";
import { ResultatKontekst } from "@/components/tester/ResultatKontekst";
import { Ikon, KnappLenke, Meta, Sidehode, StatusPille, TomTilstand } from "@/components/precision/pa";
import { InlineVarsel, Nokkelverdi } from "@/components/precision/pa-a5";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";

export type PHRD08Hull = { nr: number; par: number; score: number };
export type PHRD08Data = {
  id: string;
  nettoppLagret: boolean;
  baneNavn: string;
  /** «dd.mm.åååå», Oslo-tid. */
  datoKort: string;
  score: number;
  /** Sum av par for spilte hull. */
  par: number;
  sgTotal: number | null;
  sgKategorier: ReadonlyArray<{ akse: "OTT" | "APP" | "ARG" | "PUTT"; sg: number }>;
  sgSource: string | null;
  registrering: RundeRegistreringStatus;
  manuellSg?: ManuellSgVerdier;
  granulaerSg: Partial<ManuellSgVerdier>;
  hull: PHRD08Hull[];
  erEier: boolean;
  visKjedeStatus: boolean;
  antallKomplette: number;
  antallHullMedScore: number;
  putter: { totalt: number; hull: number } | null;
  fairway: { treff: number; av: number } | null;
  gir: { treff: number; av: number } | null;
  /** null når ingen slag er ført (ingen kilde for straff). */
  straff: number | null;
  ut: { score: number; par: number } | null;
  inn: { score: number; par: number } | null;
};

/** Fortegn og én desimal, som tegningens sg(): «+0,4», «−0,8», «±0,0», «—». */
export function sg1(v: number | null): string {
  if (v == null) return "—";
  return Math.abs(v) <= 0.04 ? "±0,0" : formaterFortegn(v, 1);
}
export function tilPar(d: number): string {
  return d > 0 ? `+${d}` : d < 0 ? `−${Math.abs(d)}` : "±0";
}

/** Divergerende SG-stolpe. Grafitt for alle verdier: fortegnet bærer betydningen, ikke fargen. */
function SGBar({ label, v, max = 1.5 }: { label: string; v: number | null; max?: number }) {
  const w = v == null ? 0 : Math.min(50, (Math.abs(v) / max) * 50);
  return <div style={{ display: "grid", gridTemplateColumns: "minmax(64px,120px) minmax(0,1fr) 56px", gap: 12, alignItems: "center", minHeight: 44 }}>
    <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)", minWidth: 0 }}>{label}</span>
    <span style={{ position: "relative", height: 14, background: "var(--surface-sunken)" }} aria-hidden="true">
      <span style={{ position: "absolute", left: "50%", top: -4, bottom: -4, width: 1, background: "var(--border-ink)" }} />
      {v != null && <span style={{ position: "absolute", top: 0, bottom: 0, background: v < 0 ? "var(--text-secondary)" : "var(--text-primary)", left: v < 0 ? `${50 - w}%` : "50%", width: `${w}%` }} />}
    </span>
    <span style={{ font: "600 15px/1 var(--font-mono)", color: "var(--text-primary)", textAlign: "right" }}>{sg1(v)}</span>
  </div>;
}

function Sek({ k, aside, children }: { k?: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return <section className="pa-card" style={{ padding: 16, gap: 12, minWidth: 0 }}>
    {(k || aside) && <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {k && <h2 className="kicker" style={{ margin: 0 }}>{k}</h2>}{aside}
    </div>}
    {children}
  </section>;
}

function Kvalitet({ r }: { r: RundeRegistreringStatus }) {
  const meta = RUNDE_DATAQUALITY_META[r.dataQuality];
  const klasse = r.kanBeregneSg ? "pa-status--ok" : r.beskytterManuellSg ? "pa-status--info" : "pa-status--warn";
  const detalj = r.kanBeregneSg ? ` · ${r.antallKompletteHull} av ${r.antallHullMedScore} hull med slag` : "";
  return <span className={`pa-status ${klasse}`}><span className="pa-status__dot" />{meta.label}{detalj}</span>;
}

function Kilde({ d }: { d: PHRD08Data }) {
  const beregnet = d.sgSource === RUNDE_SG_KILDE.BEREGNET;
  const manuell = d.sgSource === RUNDE_SG_KILDE.MANUAL;
  const est = d.sgSource === RUNDE_SG_KILDE.ESTIMERT;
  const tekst = beregnet ? "Beregnet · slag-for-slag" : manuell ? "Manuell SG" : est ? "Estimert fra score" : "Kilde mangler";
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap", font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", textTransform: "uppercase", minWidth: 0 }}>
    <span>{[tekst, d.datoKort].join(" · ")}</span>
    {est && <span style={{ padding: "1px 6px", border: "1px dashed var(--border-strong)", borderRadius: 4, color: "var(--text-secondary)" }}>Estimat</span>}
  </span>;
}

const CSS = `
.phrd08-kol{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;min-width:0}
@media (min-width:1024px){.phrd08-kol{grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)}}
.phrd08-hull{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;margin:0;padding:0;list-style:none}
@media (min-width:600px){.phrd08-hull{grid-template-columns:repeat(9,minmax(0,1fr))}}
.phrd08-hullcelle{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;border-radius:var(--radius-inner);border:1px solid var(--border-hairline);min-width:0}
.phrd08-handling{display:flex;gap:8px;flex-wrap:wrap;align-items:center;min-width:0}
.phrd08-handling>a,.phrd08-handling>button{flex:1 1 100%}
@media (min-width:1024px){.phrd08-handling{justify-content:flex-end}.phrd08-handling>a,.phrd08-handling>button{flex:0 0 auto}}
.phrd08-detalj{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;min-width:0}
@media (min-width:600px){.phrd08-detalj{grid-template-columns:repeat(2,minmax(0,1fr))}}
.phrd08-rad{display:flex;gap:8px;flex-wrap:wrap;align-items:center;min-width:0}
`;

const sgUnder = (d: PHRD08Data) => {
  if (d.sgSource === RUNDE_SG_KILDE.BEREGNET) return "Brutto score. SG er beregnet fra slag-for-slag.";
  if (d.sgSource === RUNDE_SG_KILDE.MANUAL) return "Brutto score. SG er lagt inn manuelt.";
  if (d.sgSource === RUNDE_SG_KILDE.ESTIMERT) return "Brutto score. SG er estimert fra score, ikke beregnet fra slag.";
  return "Brutto score. SG er ikke registrert.";
};

export function PHRD08RundeFerdig({ data: d, uleste = 0 }: { data: PHRD08Data; uleste?: number }) {
  const status = RUNDE_STATUS_META[d.registrering.status];
  const harHull = d.hull.length > 0;
  const forklaring = RUNDE_DATAQUALITY_META[d.registrering.dataQuality].forklaring;
  const harSg = d.sgTotal != null || d.sgKategorier.length > 0;
  const harDetalj = SG_DETALJGRUPPER.some((g) => g.fields.some((f) => d.granulaerSg[f.key] != null));
  const tone = d.registrering.status === "komplett" ? "ok" : "warn";

  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
    <div className="pa-side" style={{ maxWidth: 1200 }}>
      <style>{CSS}</style>
      <Link href="/portal/mal/runder" className="pa-btn pa-btn--ghost pa-btn--sm pa-btn--icon-l" style={{ alignSelf: "flex-start" }}>
        <Ikon icon={ArrowLeft} size={16} name="arrow-left" />Runder
      </Link>
      <Sidehode kicker={`Runde · Ferdig · ${d.datoKort}`} title={d.baneNavn} sub={sgUnder(d)} />
      <div className="phrd08-rad"><StatusPille tone={tone}>{status.label}</StatusPille></div>

      {d.nettoppLagret && d.erEier && <InlineVarsel tone="ok" tittel="Runden er lagret.">
        {d.sgSource === RUNDE_SG_KILDE.MANUAL ? "SG-tallene dine er lagret." : d.sgTotal != null ? "Strokes Gained er klar." : "Mangler hull-score for full Strokes Gained."}
      </InlineVarsel>}
      {d.visKjedeStatus && <InlineVarsel tone="warn" tittel="SG venter på slag-kjeden.">
        {d.antallKomplette} av {d.antallHullMedScore} hull er komplette.{" "}
        <Link href={`/portal/mal/runder/${d.id}/fullfor`} style={{ color: "inherit", textDecoration: "underline" }}>Fullfør kjeden</Link> for full Strokes Gained.
      </InlineVarsel>}

      <div className="phrd08-kol">
        <Sek k="Score" aside={<Kvalitet r={d.registrering} />}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ font: "600 56px/1 var(--font-mono)" }}>{d.score}</span>
            <Meta>BRUTTO · {tilPar(d.score - d.par)} · PAR {d.par}</Meta>
          </div>
          <Nokkelverdi kolonner={2} items={[
            ["Putter", d.putter ? String(d.putter.totalt) : "—", d.putter && d.putter.hull < d.hull.length ? `${d.putter.hull} hull ført` : undefined],
            ["Fairway", d.fairway ? `${d.fairway.treff} av ${d.fairway.av}` : "—"],
            ["GIR", d.gir ? `${d.gir.treff} av ${d.gir.av}` : "—"],
            ["Straff", d.straff != null ? String(d.straff) : "—"],
          ]} />
          <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>
            {d.registrering.beskytterManuellSg ? "Manuell SG er låst mot automatisk overskriving. Slag og scorekort kan fortsatt rettes." : forklaring}
          </p>
        </Sek>

        <Sek k="Strokes Gained" aside={<Kilde d={d} />}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ font: "600 40px/1 var(--font-mono)" }}>{sg1(d.sgTotal)}</span><Meta>SG TOTALT</Meta>
          </div>
          {d.sgKategorier.length > 0
            ? <>
              {d.sgKategorier.map((k) => <SGBar key={k.akse} label={k.akse} v={k.sg} />)}
              <Meta>{d.sgSource === RUNDE_SG_KILDE.MANUAL ? "NULL = DIN REFERANSE" : "NULL = BASELINE KATEGORI D"}</Meta>
            </>
            : !harSg && <TomTilstand icon={TrendingUp} title="Ingen SG registrert"
              text="Før slag for slag for å beregne SG, eller legg inn tallene fra en annen app. Ukjente tall vises som —." />}
        </Sek>
      </div>

      {d.erEier && d.manuellSg && <Sek k="Manuell SG">
        <ManuellSgRedigering roundId={d.id} verdier={d.manuellSg} kilde={d.sgSource} />
      </Sek>}

      {harDetalj && <div className="phrd08-detalj">
        {SG_DETALJGRUPPER.map((g) => <Sek key={g.label} k={g.label}>
          <Nokkelverdi items={g.fields.map((f) => [f.label, sg1(d.granulaerSg[f.key] ?? null)] as const)} />
        </Sek>)}
      </div>}

      {harHull
        ? <Sek k="Hull for hull">
          <ul className="phrd08-hull" aria-label="Score per hull">
            {d.hull.map((h) => <li className="phrd08-hullcelle" key={h.nr}>
              <Meta>{h.nr}</Meta>
              <span style={{ font: "600 15px/1 var(--font-mono)" }}>{h.score}</span>
              <Meta style={{ fontSize: 10 }}>P{h.par}</Meta>
            </li>)}
          </ul>
          <Meta>TALL = BRUTTO · UNDER = PAR{d.ut && d.inn ? ` · UT ${d.ut.score} · INN ${d.inn.score}` : d.ut ? ` · SUM ${d.ut.score}` : ""}</Meta>
        </Sek>
        : <Sek k="Hull for hull">
          <TomTilstand icon={Flag} title="Ingen hull-for-hull ennå" text="Kun totalscore er registrert for denne runden."
            actions={d.erEier ? <KnappLenke href={`/portal/mal/runder/${d.id}/hull`} icon={ListChecks} iconName="list-checks">Legg til hull-for-hull</KnappLenke> : undefined} />
        </Sek>}

      <Sek><ResultatKontekst /></Sek>

      <div className="phrd08-handling">
        {d.erEier && harHull && <>
          <UpGameImportModal roundId={d.id} />
          <KnappLenke variant="ghost" icon={Route} iconName="route" href={`/portal/mal/runder/${d.id}/slag`}>Slag for slag</KnappLenke>
          <KnappLenke variant="secondary" icon={Pencil} iconName="pencil" href={`/portal/mal/runder/${d.id}/hull`}>Rediger hull for hull</KnappLenke>
        </>}
        {d.erEier && d.visKjedeStatus
          ? <KnappLenke icon={TriangleAlert} iconName="triangle-alert" href={`/portal/mal/runder/${d.id}/fullfor`}>Fullfør slag-kjeden</KnappLenke>
          : d.erEier
            ? <KnappLenke icon={TrendingUp} iconName="trending-up" href="/portal/analysere">Se SG-trend i Stats</KnappLenke>
            : <KnappLenke icon={MessageSquare} iconName="message-square" href="/portal/coach/melding">Del med coach</KnappLenke>}
      </div>
    </div>
  </PlayerHQSkall>;
}
