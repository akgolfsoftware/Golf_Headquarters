"use client";

/**
 * Teknisk plan · delte deler for PH-TP-01, AG-10 og AG-TP-01 i Precision
 * Athletics. Tegning: Claude Design 7d7c2994, ui_kits/_shared/tp-parts.jsx
 * (etag 1790543238833929). Stiler i src/styles/precision-tp.css.
 *
 * Avvik fra tegningen, fordi dataene ikke finnes i basen ennå (tillegg D1–D4 i
 * docs/planer/portering-skjermer-2026-09-27.md §9 venter på Anders' ja):
 * - Læringssteg er de tre som lagres: Uten ball · Lav hastighet · Automatikk.
 *   Tegningens 25/50/75 % er ikke egne rep-mål i databasen.
 * - Kvalitetssjekk og før og nå vises som tom tilstand, uten knapp som ikke kan lagre.
 * - Posisjonsstatus (Ikke startet · Jobber med · Godkjent) vises ikke.
 */
import { useId, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { Knapp, StatusPille } from "@/components/precision/pa";
import { formaterTall } from "@/lib/format-tall";
import { TP_FASER, TP_POSISJONER, type TpOppgave, type TpPlan, type TpTmRad } from "@/lib/teknisk-plan/tp-visning";
import "@/styles/precision-tp.css";

export const tall = (v: number | null | undefined) => (v == null ? "—" : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " "));
export const brok = (a: number, b: number | null) => (b == null ? "—" : `${tall(a)} / ${tall(b)}`);
export const desimal = (v: number | null | undefined, d = 1) => formaterTall(v, d, true);

export function Meta({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere", ...style }}>{children}</span>;
}
export const Etikett = ({ children }: { children: ReactNode }) => <span className="kicker">{children}</span>;

export function Strek({ v, av, tynn }: { v: number; av: number | null; tynn?: boolean }) {
  const p = !av ? 0 : Math.max(0, Math.min(100, (v / av) * 100));
  return <span aria-hidden className={tynn ? "tp-strek tp-strek--tynn" : "tp-strek"}><span className="tp-strek__fyll" style={{ width: `${p}%` }} /></span>;
}

export function Formel({ children, stor }: { children: ReactNode; stor?: boolean }) {
  return <code title="AK-formelen" className={stor ? "tp-formel tp-formel--stor" : "tp-formel"}>{children}</code>;
}

/* ---------- Oppsummering ---------- */

export function Oppsummering({ plan }: { plan: TpPlan }) {
  const celle = (k: string, v: ReactNode) => <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}><Meta>{k}</Meta>{v}</div>;
  return <div className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
    <div className="tp-oppsummering">
      {celle("PLANSTATUS", <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <StatusPille tone={plan.statusTone}>{plan.status}</StatusPille>
        <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Publisert —</span>
      </span>)}
      {celle("HOVEDFOKUS", <span style={{ font: "600 15px/1.3 var(--font-mono)" }}>{plan.hovedfokus.length ? plan.hovedfokus.join(" · ") : "—"}</span>)}
      {celle("SAMLET FREMDRIFT", <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ font: "600 15px/1.3 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{brok(plan.gjort, plan.maal || null)} repetisjoner</span>
        <Strek v={plan.gjort} av={plan.maal} />
      </span>)}
    </div>
    <Meta>KILDE {plan.kilde} · SIST REGISTRERT {plan.sistRegistrert}</Meta>
  </div>;
}

/* ---------- Posisjonslinje ---------- */

export function Posisjonslinje({ oppgaver, valgt, onVelg, hovedfokus }: {
  oppgaver: readonly TpOppgave[]; valgt: string | null; onVelg: (p: string | null) => void; hovedfokus: readonly string[];
}) {
  const antall = (p: string) => oppgaver.filter((o) => o.hovedP === p).length;
  const valgtNavn = TP_POSISJONER.find((p) => p.pNummer === valgt)?.navn;
  return <div className="tp-poslinje">
    <div aria-hidden className="tp-poslinje__faser">
      {TP_FASER.map((f) => <span key={f.navn} className="tp-poslinje__fase" style={{ gridColumn: `span ${f.antall}` }}>
        <span className="tp-poslinje__fasenavn">{f.navn}</span><Meta>{f.fra}</Meta>
      </span>)}
    </div>
    <div role="group" aria-label="Posisjoner P1.0–P10.0" className="tp-poslinje__rutenett">
      {TP_POSISJONER.map(({ pNummer, navn }) => {
        const c = antall(pNummer), paa = valgt === pNummer, f = hovedfokus.includes(pNummer);
        return <button key={pNummer} type="button" className="tp-pos" aria-pressed={paa}
          aria-label={`${pNummer} ${navn} · ${c} ${c === 1 ? "oppgave" : "oppgaver"}${f ? " · hovedfokus" : ""}`}
          onClick={() => onVelg(paa ? null : pNummer)}>
          <span className="tp-pos__nr">{pNummer}</span>
          <span className={c ? "tp-pos__antall" : "tp-pos__antall tp-pos__antall--tom"}>{c || "—"}{f && <span className="tp-fokusmerke">FOKUS</span>}</span>
        </button>;
      })}
    </div>
    <span className="tp-poslinje__mobilfaser"><Meta>BAKSVING P1–P4 · NEDSVING P5–P7 · GJENNOMSVING P8–P10</Meta></span>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minHeight: 44 }}>
      {valgt
        ? <><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{valgt} {valgtNavn}</span>
          <Knapp size="sm" variant="ghost" onClick={() => onVelg(null)}>Vis alle posisjoner</Knapp></>
        : <Meta>ALLE POSISJONER · TRYKK EN POSISJON FOR Å FILTRERE · TALL = OPPGAVER</Meta>}
    </div>
  </div>;
}

/* ---------- Repetisjoner ---------- */

export function RepStreker({ steg }: { steg: TpOppgave["steg"] }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {steg.map((s) => <div key={s.navn} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ font: "var(--type-body-s)", color: "var(--text-primary)" }}>{s.navn}</span>
        <span style={{ font: "500 13px/1.3 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{brok(s.gjort, s.maal)}</span>
      </span>
      <Strek v={s.gjort} av={s.maal} />
    </div>)}
  </div>;
}

export function MiljoRutenett({ miljo }: { miljo: TpOppgave["miljo"] }) {
  return <div className="tp-miljo">
    {miljo.map((m) => <div key={m.kode} style={{ display: "flex", flexDirection: "column", gap: 6, padding: 10, border: "1px solid var(--border-hairline)", borderRadius: "var(--radius)", minWidth: 0 }}>
      <Meta>{m.navn.toUpperCase()}</Meta>
      <span style={{ font: "500 14px/1.2 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: m.maal == null ? "var(--text-muted)" : "var(--text-primary)" }}>
        {m.maal == null ? (m.gjort ? `${tall(m.gjort)} / —` : "—") : brok(m.gjort, m.maal)}
      </span>
      {m.maal != null ? <Strek v={m.gjort} av={m.maal} tynn /> : <Meta>IKKE I PLANEN</Meta>}
    </div>)}
  </div>;
}

/* ---------- TrackMan ---------- */

function boksTekst(r: TpTmRad): string {
  const u = r.enhet ? (r.enhet === "°" ? "°" : ` ${r.enhet}`) : "";
  if (r.fra != null && r.til != null) return r.fra === r.til ? `${desimal(r.fra, r.desimaler)}${u}` : `${desimal(r.fra, r.desimaler)} til ${desimal(r.til, r.desimaler)}${u}`;
  if (r.til != null) return `under ${desimal(r.til, r.desimaler)}${u}`;
  if (r.fra != null) return `over ${desimal(r.fra, r.desimaler)}${u}`;
  return "—";
}

export function TmSkala({ r }: { r: TpTmRad }) {
  const u = r.enhet ? (r.enhet === "°" ? "°" : ` ${r.enhet}`) : "";
  const verdier = [r.utgangspunkt, r.fra, r.til, r.naa].filter((v): v is number => v != null);
  const mn = Math.min(...verdier), mx = Math.max(...verdier), pad = (mx - mn) * 0.18 || 1, a = mn - pad, b = mx + pad;
  const x = (v: number) => ((v - a) / (b - a)) * 100;
  const fra = r.fra ?? a, til = r.til ?? b;
  return <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10, borderTop: "1px solid var(--border-hairline)" }}>
    <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
      <span style={{ font: "600 14px/1.3 var(--font-sans)" }}>{r.navn}</span>
      {r.innenfor == null ? <Meta>—</Meta> : <StatusPille tone={r.innenfor ? "ok" : "neutral"}>{r.innenfor ? "Innenfor målboksen" : "Utenfor målboksen"}</StatusPille>}
    </span>
    <div role="img" className="tp-skala"
      aria-label={`${r.navn}: utgangspunkt ${desimal(r.utgangspunkt, r.desimaler)}${r.utgangspunkt != null ? u : ""}, mål ${boksTekst(r)}, nå ${desimal(r.naa, r.desimaler)}${r.naa != null ? u : ""}`}>
      <span className="tp-skala__linje" />
      <span className="tp-skala__boks" style={{ left: `${x(fra)}%`, width: `${Math.max(0, x(til) - x(fra))}%` }} />
      {r.utgangspunkt != null && <span className="tp-skala__start" style={{ left: `${x(r.utgangspunkt)}%` }} />}
      {r.naa != null && <span className="tp-skala__naa" style={{ left: `${x(r.naa)}%` }} />}
    </div>
    <div className="tp-legende">
      <Legende merke={<span style={{ width: 10, height: 10, borderRadius: 999, border: "2px solid var(--text-secondary)", flex: "none" }} />} navn="UTGANGSPUNKT" verdi={`${desimal(r.utgangspunkt, r.desimaler)}${r.utgangspunkt != null ? u : ""}`} />
      <Legende merke={<span style={{ width: 14, height: 10, border: "1px solid var(--border-ink)", background: "var(--surface-sunken)", flex: "none" }} />} navn="MÅLBOKS" verdi={boksTekst(r)} />
      <Legende merke={<span style={{ width: 10, height: 10, borderRadius: 999, background: "var(--text-primary)", flex: "none" }} />} navn="MÅLING NÅ" verdi={`${desimal(r.naa, r.desimaler)}${r.naa != null ? u : ""}`} />
    </div>
    <Meta>{r.klubb.toUpperCase()} · UTGANGSPUNKT {r.utgangspunktDato} · SIST MÅLT {r.sistMaalt}</Meta>
  </div>;
}
function Legende({ merke, navn, verdi }: { merke: ReactNode; navn: string; verdi: string }) {
  return <span style={{ display: "flex", gap: 6, alignItems: "center", minWidth: 0 }}>
    <span aria-hidden style={{ display: "flex" }}>{merke}</span>
    <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}><Meta>{navn}</Meta><span style={{ font: "500 13px/1.3 var(--font-mono)" }}>{verdi}</span></span>
  </span>;
}

export function TmBlokk({ o }: { o: TpOppgave }) {
  if (!o.harRadar && o.tm.length === 0) {
    return <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Etikett>Måleutstyr</Etikett>
      <Meta>{o.utstyr ? `${o.utstyr.toUpperCase()} · INGEN TRACKMAN-MÅL` : "IKKE VALGT · INGEN TRACKMAN-MÅL"}</Meta>
    </div>;
  }
  return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <Etikett>TrackMan-mål · {o.tm.length}</Etikett>
    {o.tm.length === 0
      ? <><span style={{ font: "500 14px/1.3 var(--font-mono)" }}>—</span><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen TrackMan-mål satt.</span></>
      : o.tm.map((r) => <TmSkala key={r.id} r={r} />)}
  </div>;
}

export function Protokoll({ o }: { o: TpOppgave }) {
  const p = o.protokoll;
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <Etikett>Treffprotokoll · {p ? p.navn : "—"}</Etikett>
    {p
      ? <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <span style={{ font: "500 14px/1.4 var(--font-sans)", color: "var(--text-primary)", flex: "1 1 220px", textWrap: "pretty" }}>{p.tekst}</span>
        <span style={{ font: "600 14px/1.3 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>Nå {p.naa}</span>
      </div>
      : <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen treffprotokoll på denne oppgaven.</span>}
  </div>;
}

/** Kvalitetssjekk lagres ikke ennå (tillegg D2). Vist som tom, uten knapp. */
export function Kvalitetssjekk() {
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <Etikett>Kvalitetssjekk</Etikett>
    <span style={{ font: "600 14px/1.3 var(--font-mono)" }}>—</span>
    <Meta>INGEN KVALITETSSJEKK REGISTRERT · LÅSER IKKE NESTE LÆRINGSSTEG</Meta>
  </div>;
}

/* ---------- Oppgavekort ---------- */

export function OppgaveKort({ o, aapen, onVeksle, handlinger }: {
  o: TpOppgave; aapen: boolean; onVeksle?: () => void; handlinger?: ReactNode;
}) {
  const detaljId = useId();
  return <article className="pa-card tp-kort" aria-labelledby={`${detaljId}-t`}>
    <span aria-hidden className="tp-kort__stripe" />
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span style={{ font: "600 13px/1 var(--font-mono)" }}>{o.pNummer}</span>
      <h3 id={`${detaljId}-t`} style={{ margin: 0, font: "600 15px/1.3 var(--font-sans)", flex: "1 1 200px", minWidth: 0 }}>{o.tittel}</h3>
      <StatusPille>{o.status}</StatusPille>
    </div>
    <dl className="tp-kv">
      {([["Slag", o.slag], ["Område", o.omraade], ["Teknisk fokus", o.fokus]] as const).map(([k, v]) =>
        <div key={k} style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <dt><Meta>{k.toUpperCase()}</Meta></dt>
          <dd style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{v}</dd>
        </div>)}
    </dl>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <Formel>{o.formel ?? "—"}</Formel><Meta>AK-FORMELEN</Meta>
    </div>
    {!aapen
      ? <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ font: "500 13px/1.3 var(--font-mono)" }}>{brok(o.gjort, o.maal || null)} repetisjoner</span>
          <Strek v={o.gjort} av={o.maal} />
        </span>
        <Meta>{o.protokoll ? `PROTOKOLL NÅ ${o.protokoll.naa.toUpperCase()}` : "INGEN PROTOKOLL"}</Meta>
        {onVeksle && <Knapp size="sm" variant="ghost" iconRight={ChevronDown} aria-expanded={false} aria-controls={detaljId} onClick={onVeksle}>Vis detaljer</Knapp>}
      </div>
      : <>
        <div id={detaljId} className="tp-kort__detaljer">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            <Etikett>{o.steg.length > 1 ? "Repetisjoner per læringssteg" : "Repetisjoner"}</Etikett>
            <RepStreker steg={o.steg} />
            <Etikett>Fordeling per miljø</Etikett>
            <MiljoRutenett miljo={o.miljo} />
            <Meta>KILDE {o.kilde}</Meta>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            <TmBlokk o={o} /><Protokoll o={o} /><Kvalitetssjekk />
          </div>
        </div>
        {onVeksle && <div><Knapp size="sm" variant="ghost" iconRight={ChevronUp} aria-expanded aria-controls={detaljId} onClick={onVeksle}>Skjul detaljer</Knapp></div>}
      </>}
    {handlinger && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}>{handlinger}</div>}
  </article>;
}

/** Før og nå krever to daterte bilder per oppgave (tillegg D1). Til da: tom ramme. */
export function ForOgNaaTom() {
  return <div className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
      <span className="kicker">Før og nå</span><Meta>FØR — · NÅ —</Meta>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8, maxWidth: 480 }}>
      {["FØR", "NÅ"].map((k) => <div key={k} className="tp-ramme"><Meta>{k}</Meta><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen bilde registrert</span></div>)}
    </div>
    <Meta>FØR OG NÅ KREVER TO DATERTE BILDER · INGEN NOTAT FRA COACH</Meta>
  </div>;
}

/* ---------- Teller (Stepper) ---------- */

export function Teller({ label, verdi, onEndre, min = 0, maks = 1000, steg = 1, storrelse = "sm", format }: {
  label: string; verdi: number; onEndre: (v: number) => void; min?: number; maks?: number; steg?: number;
  storrelse?: "sm" | "md" | "xl"; format?: (v: number) => string;
}) {
  const id = useId();
  const sett = (v: number) => onEndre(Math.max(min, Math.min(maks, Math.round(v * 100) / 100)));
  return <div className={`pa-stepper${storrelse === "md" ? "" : ` pa-stepper--${storrelse}`}`} role="group" aria-labelledby={id}>
    <span id={id} className="pa-field__label">{label}</span>
    <div className="pa-stepper__row">
      <button type="button" className="pa-stepper__btn" aria-label={`Mindre ${label.toLowerCase()}`} disabled={verdi <= min} onClick={() => sett(verdi - steg)}><Minus size={18} aria-hidden /></button>
      <output className="pa-stepper__val" aria-live="polite">{format ? format(verdi) : tall(verdi)}</output>
      <button type="button" className="pa-stepper__btn" aria-label={`Mer ${label.toLowerCase()}`} disabled={verdi >= maks} onClick={() => sett(verdi + steg)}><Plus size={18} aria-hidden /></button>
    </div>
  </div>;
}

/** Valgknapp (ChoicePill). */
export function Valg({ valgt, onClick, children, mono, stor }: { valgt: boolean; onClick: () => void; children: ReactNode; mono?: boolean; stor?: boolean }) {
  return <button type="button" aria-pressed={valgt} onClick={onClick}
    className={`pa-choice${mono ? " pa-choice--mono" : ""}${stor ? " pa-choice--lg" : ""}`}>{children}</button>;
}
