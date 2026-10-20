"use client";

/**
 * Turneringsplanleggeren med WAGR-anslag. Én skjerm for spiller (PlayerHQ), AK Golf-coach
 * (AgencyOS) og Team Norway-trener, i Team Norway-retningen «Skrå» slik den er godkjent i
 * «Referansespillere Norden» (Anders 20.10.2026). Alle tall er regnet på serveren.
 * Spiller og coach endrer planen; Team Norway-treneren sender forslag.
 */
import { useMemo, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { Schibsted_Grotesk } from "next/font/google";
import {
  fjernFraPlan, foreslaaTurnering, fyllMedForslag, leggTilIPlan, settPrioritet, svarPaTurneringsforslag, trekkForslag,
} from "@/lib/turneringsplan/actions";
import type { ForslagRad, KatalogRad, PlanRad, Planvisning } from "@/lib/turneringsplan/data";
import type { Merke, PlanTier } from "@/lib/turneringsplan/wagr-modell";
import { formaterProsent, formaterTall } from "@/lib/format-tall";
import "@/styles/turneringsplan.css";

const font = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export type PlanRolle = "spiller" | "coach" | "tn";
type Fane = "plan" | "kalender" | "finn" | "om";

const KILDE = "Kilde: World Amateur Golf Ranking (WAGR), The R&A";
const ROLLE: Record<PlanRolle, { navn: string; tekst: string }> = {
  spiller: { navn: "Spiller", tekst: "Du lager og endrer planen selv. Coachen og Team Norway ser det du har delt." },
  coach: { navn: "AK Golf-coach", tekst: "Du endrer planen direkte. Spilleren får beskjed og kan angre." },
  tn: { navn: "Team Norway", tekst: "Du foreslår endringer. Ingenting endres før spilleren godtar forslaget." },
};
const MERKE: Record<Merke, { tekst: string; klasse: string; kal: string; farge: string }> = {
  PRESTASJON: { tekst: "Kan vinne", klasse: "m-gronn", kal: "k-vinn", farge: "var(--gronn)" },
  UTVIKLING: { tekst: "Topp 10", klasse: "m-info", kal: "k-topp", farge: "var(--navy-600)" },
  TRENING: { tekst: "Læring", klasse: "m-noytral", kal: "k-laer", farge: "var(--ink-400)" },
};
const MERKER: Merke[] = ["PRESTASJON", "UTVIKLING", "TRENING"];
const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const MNDL = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"];
const LAND: Record<string, string> = {
  Norway: "Norge", Sweden: "Sverige", Denmark: "Danmark", Finland: "Finland", England: "England", Scotland: "Skottland",
  Wales: "Wales", Ireland: "Irland", "Northern Ireland": "Nord-Irland", Germany: "Tyskland", Netherlands: "Nederland",
  Spain: "Spania", Portugal: "Portugal", France: "Frankrike", Italy: "Italia", Belgium: "Belgia", Austria: "Østerrike",
  Switzerland: "Sveits", Czechia: "Tsjekkia", "Czech Republic": "Tsjekkia", Poland: "Polen", "United States": "USA",
  Iceland: "Island", Estonia: "Estland", Latvia: "Latvia", Lithuania: "Litauen", Slovakia: "Slovakia", Slovenia: "Slovenia",
  Hungary: "Ungarn", Croatia: "Kroatia", Turkey: "Tyrkia", Greece: "Hellas", Canada: "Canada", Mexico: "Mexico",
  Bulgaria: "Bulgaria", Romania: "Romania", Serbia: "Serbia", Luxembourg: "Luxembourg", Cyprus: "Kypros", Malta: "Malta",
};

// Tall vises med prosjektets felles format (komma, mellomrom, ekte minus, «—» når tallet mangler).
const nf = (v: number | null | undefined, d = 0) => formaterTall(v, d, true);
const pst = (x: number) => formaterProsent(x * 100);
const land = (l: string | null) => (l ? LAND[l] ?? l : "—");
const dag = (s: string) => new Date(`${s}T00:00:00Z`);
function isoUke(s: string) {
  const d = dag(s); const n = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - n + 3);
  const f = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((d.getTime() - f.getTime()) / 864e5 - 3 + ((f.getUTCDay() + 6) % 7)) / 7);
}
const ukeIAar = (s: string) => { const u = isoUke(s); const m = dag(s).getUTCMonth(); return m === 0 && u > 50 ? 1 : m === 11 && u === 1 ? 52 : Math.min(u, 52); };
const kort = (x: Date) => `${String(x.getUTCDate()).padStart(2, "0")}.${String(x.getUTCMonth() + 1).padStart(2, "0")}.`;
function tDato(d: string, dager = 1) {
  const a = dag(d); const b = new Date(a); b.setUTCDate(b.getUTCDate() + dager - 1);
  return dager > 1 ? `${kort(a)}–${kort(b)}` : kort(a);
}

const I: Record<string, ReactNode> = {
  x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
  angre: <><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></>,
  stav: <><path d="m15 4 5 5" /><path d="M4 20 15 9" /><path d="M19 3v4" /><path d="M21 5h-4" /></>,
  sjekk: <path d="M20 6 9 17l-5-5" />,
};
const Ikon = ({ n }: { n: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{I[n]}</svg>
);
const MerkeChip = ({ v }: { v: KatalogRad["v"] }) =>
  v ? <span className={`merke ${MERKE[v.merke].klasse}`}>{MERKE[v.merke].tekst}</span> : <span className="merke m-noytral">Uten WAGR-tall</span>;
const vars = (o: Record<string, string | number>) => o as CSSProperties;

function sammendrag(plan: PlanRad[]) {
  const P = plan.filter((p): p is PlanRad & { rad: KatalogRad } => Boolean(p.rad));
  const telling: Record<Merke, number> = { PRESTASJON: 0, UTVIKLING: 0, TRENING: 0 };
  P.forEach((x) => { if (x.rad.v) telling[x.rad.v.merke]++; });
  const uker = [...new Set(P.map((x) => ukeIAar(x.rad.d)))].sort((a, b) => a - b);
  let lengst = 0, n = 0;
  uker.forEach((u, i) => { n = i && u === uker[i - 1] + 1 ? n + 1 : 1; lengst = Math.max(lengst, n); });
  const varsler: [string, string][] = [];
  const perUke = new Map<number, string[]>();
  P.forEach((x) => { const u = ukeIAar(x.rad.d); perUke.set(u, [...(perUke.get(u) ?? []), x.rad.navn]); });
  perUke.forEach((v, u) => { if (v.length > 1) varsler.push(["var(--rodstatus)", `Uke ${u}: ${v.join(" og ")} er i samme uke.`]); });
  if (lengst >= 4) varsler.push(["var(--rodstatus)", `${lengst} uker på rad med turnering. Vurder en hvileuke.`]);
  P.filter((x) => x.rad.aldersvarsel).forEach((x) => varsler.push(["var(--navy-600)", `${x.rad.navn}: ${x.rad.aldersvarsel}`]));
  const anslatt = P.filter((x) => !x.rad.sikker).length;
  if (anslatt) varsler.push(["var(--ink-400)", `${anslatt} av ${P.length} datoer er anslått til samme uke som året før.`]);
  if (!varsler.length && P.length) varsler.push(["var(--gronn)", "Ingen kollisjoner i planen."]);
  const runder = P.length * 3;
  const utland = new Set(P.filter((x) => x.rad.land !== "Norway").map((x) => ukeIAar(x.rad.d))).size;
  return { P, telling, lengst, varsler, runder, utland };
}

export function Turneringsplanlegger({ visning, rolle, bilde = "/team-norway/bilder/tee-hand.jpg" }: { visning: Planvisning; rolle: PlanRolle; bilde?: string }) {
  const [fane, setFane] = useState<Fane>("plan");
  const [melding, setMelding] = useState<{ tekst: string; feil: boolean } | null>(null);
  const [venter, start] = useTransition();
  const [ny, setNy] = useState<string | null>(null);
  const kanEndre = rolle !== "tn";
  const spillerId = rolle === "spiller" ? undefined : visning.spiller.id;
  const S = useMemo(() => sammendrag(visning.plan), [visning.plan]);
  const iPlan = useMemo(() => new Map(visning.plan.flatMap((p) => (p.rad ? [[p.rad.id, p] as const] : []))), [visning.plan]);
  const foreslatt = useMemo(() => new Map(visning.forslag.map((f) => [`${f.handling}:${f.rad.id}`, f])), [visning.forslag]);

  function kjor(fn: () => Promise<{ ok: true; melding?: string } | { ok: false; feil: string }>, nyId?: string) {
    start(async () => {
      try {
        const r = await fn();
        setMelding(r.ok ? { tekst: r.melding ?? "Lagret.", feil: false } : { tekst: r.feil, feil: true });
        if (r.ok && nyId) setNy(nyId);
      } catch {
        setMelding({ tekst: "Kunne ikke lagre. Prøv igjen.", feil: true });
      }
      window.setTimeout(() => setMelding(null), 3600);
    });
  }
  const leggTil = (id: string) => kjor(() => leggTilIPlan({ spillerId, wagrPlanEventId: id }), id);
  const foreslaa = (id: string, handling: "ADD" | "REMOVE") => kjor(() => foreslaaTurnering({ spillerId: visning.spiller.id, handling, wagrPlanEventId: id }));

  const a = visning.anslag;

  return (
    <div className={`tpl ${font.className}`} style={vars({ "--grot": font.style.fontFamily, "--tall": font.style.fontFamily })} aria-busy={venter}>
      <header className="topplinje">
        <div className="bredde gutter">
          <span className="overlinje" style={{ color: "var(--hvit)" }}>Turneringsplan 2027</span>
          <nav className="faner" role="tablist" aria-label="Velg visning">
            {([["plan", "Plan"], ["kalender", "Kalender"], ["finn", kanEndre ? "Finn turneringer" : "Foreslå turneringer"], ["om", "Om tallene"]] as [Fane, string][]).map(([id, t]) => (
              <button key={id} type="button" className="fane" role="tab" aria-selected={fane === id} onClick={() => setFane(id)}>{t}</button>
            ))}
          </nav>
        </div>
      </header>

      <section className="hjem">
        <div className="topp" aria-hidden="true"><div className="foto">
          {/* eslint-disable-next-line @next/next/no-img-element -- dekorbilde i skråkuttet, samme som referansen */}
          <img src={bilde} alt="" />
        </div></div>
        <div className="toppInnhold gutter"><div className="bredde">
          <div className="stig" style={vars({ "--i": 0 })}>
            <p className="overlinje">Turneringsplan 2027 · {ROLLE[rolle].navn}</p>
            <h1 className="tittel">{visning.spiller.fornavn} <em>{visning.spiller.etternavn}</em></h1>
            <p className="ingress">
              {visning.spiller.harNivaa
                ? `Planen bygger på WAGR: styrken i hvert felt (Power), nivået fra ${nf(visning.spiller.runder)} WAGR-runder og poengene WAGR gir for hver plassering.`
                : "Spilleren er ikke koblet til WAGR ennå. Turneringene vises med Power, men uten sjanser og WAGR-anslag."}
            </p>
          </div>
          <div className="stats">
            {[
              [visning.spiller.rang != null ? nf(visning.spiller.rang) : "—", "WAGR nå"],
              [a ? `${nf(a.p10)}–${nf(a.p90)}` : "—", "WAGR-anslag ut 2027"],
              [nf(S.P.length), "WAGR-turneringer i planen"],
              [nf(visning.plan.length), "Turneringer totalt"],
            ].map(([v, l], i) => <div key={l} className="stat stig" style={vars({ "--i": i + 1 })}><b>{v}</b><span>{l}</span></div>)}
          </div>
        </div></div>
      </section>

      <section className="kortflate">
        {visning.modellMangler ? (
          <div className="bredde gutter en"><article className="kort"><h2>WAGR-data mangler</h2><p className="forklaring" style={{ marginTop: 8 }}>Turneringskatalogen for 2027 er ikke lastet inn ennå.</p></article></div>
        ) : fane === "plan" ? (
          <div className="bredde gutter">
            <div className="kolonne">
              <PlanKort visning={visning} rolle={rolle} ny={ny} foreslatt={foreslatt} venter={venter}
                onPrio={(e, t) => kjor(() => settPrioritet({ spillerId, entryId: e, tier: t }))}
                onFjern={(e) => kjor(() => fjernFraPlan({ spillerId, entryId: e }))}
                onForeslaaFjern={(id) => foreslaa(id, "REMOVE")}
                onFinn={() => setFane("finn")}
                onFyll={() => kjor(() => fyllMedForslag({ spillerId }))} />
              <Kalender plan={visning.plan} i={6} />
            </div>
            <div className="kolonne">
              <AnslagKort visning={visning} />
              <ForslagKort forslag={visning.forslag} rolle={rolle} venter={venter}
                onSvar={(id, b) => kjor(() => svarPaTurneringsforslag({ actionId: id, beslutning: b }))}
                onTrekk={(id) => kjor(() => trekkForslag({ actionId: id }))} />
              <VurderingKort visning={visning} S={S} />
            </div>
          </div>
        ) : fane === "kalender" ? (
          <div className="bredde gutter en">
            <Kalender plan={visning.plan} i={1} />
            <div className="kolonne" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))" }}>
              <AnslagKort visning={visning} />
              <VurderingKort visning={visning} S={S} />
            </div>
          </div>
        ) : fane === "finn" ? (
          <div className="bredde gutter en">
            <FinnKort visning={visning} kanEndre={kanEndre} iPlan={iPlan} foreslatt={foreslatt} venter={venter}
              onLeggTil={leggTil} onForeslaa={(id) => foreslaa(id, "ADD")} />
          </div>
        ) : (
          <div className="bredde gutter en"><OmKort /></div>
        )}
      </section>
      <div className="gutter"><div className="bredde"><p className="kilde">{KILDE}. {ROLLE[rolle].tekst} Data hentet {visning.laget ? visning.laget.split("-").reverse().join(".") : "—"}. GolfBox-resultater og DataGolf er ikke brukt.</p></div></div>
      <div className={`melding${melding ? " vis" : ""}`} role="status" aria-live="polite" style={melding?.feil ? { background: "var(--rodstatus)" } : undefined}>{melding?.tekst ?? ""}</div>
    </div>
  );
}

function PlanKort({ visning, rolle, ny, foreslatt, venter, onPrio, onFjern, onForeslaaFjern, onFinn, onFyll }: {
  visning: Planvisning; rolle: PlanRolle; ny: string | null; foreslatt: Map<string, ForslagRad>; venter: boolean;
  onPrio: (entryId: string, t: PlanTier) => void; onFjern: (entryId: string) => void; onForeslaaFjern: (id: string) => void;
  onFinn: () => void; onFyll: () => void;
}) {
  const kanEndre = rolle !== "tn";
  const leggTilForslag = visning.forslag.filter((f) => f.handling === "ADD");
  return (
    <article className="kort stig" style={vars({ "--i": 2 })}>
      <div className="kortHode"><h2>Plan 2027</h2><span className="forklaring">{visning.plan.length} turneringer{visning.stadium ? ` · nivå: ${visning.stadium.navn.toLowerCase()}` : ""}</span></div>
      <div className="tabell-ramme"><div className="plan turneringer">
        <div className="t-hode"><span>Dato</span><span>Turnering</span><span className="h">Power</span><span className="h">Seier</span><span className="h">Topp 10</span><span className="h">Poeng</span><span>Prioritet</span><span className="skjult">Handling</span></div>
        {visning.plan.length === 0 ? <p className="tomt">Planen er tom. {kanEndre ? "Legg til turneringer eller lag et forslag." : "Spilleren har ikke lagt inn turneringer ennå."}</p> : null}
        {visning.plan.map((p, i) => {
          const mndAv = (d: string | null) => (d ? d.slice(0, 7) : "");
          const nyMnd = i === 0 || mndAv(visning.plan[i - 1].d) !== mndAv(p.d);
          const m = p.d ? dag(p.d).getUTCMonth() : -1;
          const skille = nyMnd ? <div className="mndskille">{m >= 0 ? `${MNDL[m]} ${p.d!.slice(0, 4)}` : "Uten dato"}</div> : null;
          const v = p.rad?.v ?? null;
          const fjernes = p.rad ? foreslatt.has(`REMOVE:${p.rad.id}`) : false;
          return (
            <div key={p.entryId} style={{ display: "contents" }}>
              {skille}
              <div className={`t-rad${ny && p.rad?.id === ny ? " ny" : ""}${fjernes ? " fjernes forslag" : ""}`} style={vars({ "--i": i })}>
                <span className="dato">{p.d ? tDato(p.d, p.rad?.dager) : "—"}</span>
                <div>
                  <div className="navn">{p.navn}</div>
                  <div className="runder">
                    {p.rad ? <>{land(p.rad.land)} · <MerkeChip v={v} />{p.rad.sikker ? null : <> <span className="anslaatt">anslått dato</span></>}</>
                      : <span className="anslaatt">Ikke i WAGR-katalogen · {p.statusTekst}</span>}
                    {v ? <span className="kun-mobil"> · Topp 10 {pst(v.p10)} · {nf(v.poeng, 1)} p</span> : null}
                  </div>
                </div>
                <span className="tall">{nf(p.rad?.power)}</span>
                <span className="tall">{v ? pst(v.p1) : "—"}</span>
                <span className="tall">{v ? pst(v.p10) : "—"}</span>
                <span className="tall">{v ? nf(v.poeng, 1) : "—"}</span>
                <div className="prio">
                  {kanEndre ? (
                    <div className="velger liten" role="group" aria-label={`Prioritet for ${p.navn}`}>
                      {(["A", "B", "C"] as PlanTier[]).map((t) => (
                        <button key={t} type="button" className="velg" aria-pressed={p.tier === t} disabled={venter} onClick={() => onPrio(p.entryId, t)}>{t}</button>
                      ))}
                    </div>
                  ) : <span className="merke m-noytral">Prioritet {p.tier}</span>}
                </div>
                {kanEndre ? (
                  <button type="button" className="ikon" disabled={venter || p.status !== "PLANNED"} onClick={() => onFjern(p.entryId)} aria-label={`Fjern ${p.navn}`} title={p.status !== "PLANNED" ? "Påmeldt: trekk påmeldingen først" : undefined}><Ikon n="x" /></button>
                ) : p.rad && !fjernes ? (
                  <button type="button" className="ikon" disabled={venter} onClick={() => onForeslaaFjern(p.rad!.id)} aria-label={`Foreslå å fjerne ${p.navn}`}><Ikon n="x" /></button>
                ) : <span />}
              </div>
            </div>
          );
        })}
        {leggTilForslag.length ? <div className="mndskille">Forslag fra Team Norway</div> : null}
        {leggTilForslag.map((f) => (
          <div key={f.id} className="t-rad forslag">
            <span className="dato">{tDato(f.rad.d, f.rad.dager)}</span>
            <div><div className="navn">{f.rad.navn}</div><div className="runder">{f.trener} foreslår · {land(f.rad.land)} · <MerkeChip v={f.rad.v} /></div></div>
            <span className="tall">{nf(f.rad.power)}</span><span className="tall">{f.rad.v ? pst(f.rad.v.p1) : "—"}</span>
            <span className="tall">{f.rad.v ? pst(f.rad.v.p10) : "—"}</span><span className="tall">{f.rad.v ? nf(f.rad.v.poeng, 1) : "—"}</span>
            <div className="prio"><span className="merke m-info">Venter</span></div><span />
          </div>
        ))}
      </div></div>
      <div className="filter" style={{ marginTop: 14 }}>
        {kanEndre ? (
          <>
            <button type="button" className="knapp" onClick={onFinn}><Ikon n="plus" /> Legg til turnering</button>
            {visning.stadium ? <button type="button" className="knapp sek" disabled={venter} onClick={onFyll}><Ikon n="stav" /> Fyll med forslag</button> : null}
          </>
        ) : <button type="button" className="knapp" onClick={onFinn}><Ikon n="send" /> Foreslå en turnering</button>}
      </div>
    </article>
  );
}

function AnslagKort({ visning }: { visning: Planvisning }) {
  const s = visning.anslag;
  if (!s) {
    return (
      <article className="kort stig" style={vars({ "--i": 3 })}>
        <div className="kortHode"><h2>WAGR ved utgangen av 2027</h2></div>
        <p className="tomt">{visning.spiller.harNivaa ? "Legg til WAGR-turneringer for å se anslaget." : "Anslaget kommer når spilleren er koblet til WAGR og har spilt WAGR-turneringer."}</p>
      </article>
    );
  }
  const lg = (r: number) => Math.max(0, Math.min(100, ((Math.log10(3000) - Math.log10(Math.max(r, 1))) / Math.log10(3000)) * 100));
  const naa = visning.spiller.rang;
  return (
    <article className="kort stig" style={vars({ "--i": 3 })}>
      <div className="kortHode"><h2>WAGR ved utgangen av 2027</h2><span className="forklaring">1 500 simulerte sesonger</span></div>
      <div className="anslag"><b>{nf(s.p10)}–{nf(s.p90)}</b><span className="hva">8 av 10 utfall havner her. Mest sannsynlig plass {nf(s.p50)}.</span></div>
      <div className="spenn" role="img" aria-label={`Nå plass ${nf(naa)}, anslag ${nf(s.p10)} til ${nf(s.p90)}`}>
        <i style={{ left: `${lg(s.p90)}%`, width: `${lg(s.p10) - lg(s.p90)}%` }} />
        <em style={{ left: `${lg(s.p50)}%` }} />
        {naa != null ? <s style={{ left: `${lg(naa)}%` }} title="Nå" /> : null}
      </div>
      <div className="spenn-akse"><span>3 000</span><span>1 000</span><span>300</span><span>100</span><span>30</span><span>1</span></div>
      <div className="forklaringer">
        {naa != null ? <span><i style={vars({ "--f": "var(--rod)" })} />Nå: plass {nf(naa)}</span> : null}
        <span><i style={vars({ "--f": "var(--navy-600)" })} />Anslag</span><span><i style={vars({ "--f": "var(--navy)" })} />Mest sannsynlig</span>
      </div>
      <p className="forklaring" style={{ marginTop: 10 }}>WAGR-poeng i planen: {nf(s.s10, 1)}–{nf(s.s90, 1)}. Anslaget holder dagens nivå og resten av listen fast. Yngre spillere blir som regel bedre gjennom året.</p>
    </article>
  );
}

function VurderingKort({ visning, S }: { visning: Planvisning; S: ReturnType<typeof sammendrag> }) {
  return (
    <article className="kort stig" style={vars({ "--i": 4 })}>
      <div className="kortHode"><h2>Vurdering av planen</h2>{visning.stadium ? <span className="forklaring">Mål for {visning.stadium.navn.toLowerCase()} (utkast)</span> : null}</div>
      <div className="nokkel">
        {([[S.P.length, "WAGR-turneringer"], [S.runder, "runder (ca.)"], [S.utland, "uker ute"], [S.lengst, "uker på rad"]] as [number, string][]).map(([t, l]) => (
          <div key={l}><b>{nf(t)}</b><span>{l}</span></div>
        ))}
      </div>
      {visning.stadium ? (
        <div className="blanding">
          {MERKER.map((m) => {
            const andel = S.P.length ? S.telling[m] / S.P.length : 0;
            return (
              <div key={m} className="rad">
                <span className={`merke ${MERKE[m].klasse}`}>{MERKE[m].tekst}</span>
                <div className="spor"><i style={vars({ "--w": `${andel * 100}%`, "--f": MERKE[m].farge })} /><em style={{ left: `${visning.stadium!.mal[m] * 100}%` }} title="Mål" /></div>
                <span className="tall">{pst(andel)} / mål {pst(visning.stadium!.mal[m])}</span>
              </div>
            );
          })}
        </div>
      ) : null}
      <ul className="varsler">{S.varsler.map(([f, t]) => <li key={t} style={vars({ "--f": f })}>{t}</li>)}</ul>
    </article>
  );
}

function ForslagKort({ forslag, rolle, venter, onSvar, onTrekk }: {
  forslag: ForslagRad[]; rolle: PlanRolle; venter: boolean;
  onSvar: (id: string, b: "ACCEPTED" | "REJECTED") => void; onTrekk: (id: string) => void;
}) {
  if (!forslag.length && rolle !== "tn") return null;
  return (
    <article className="kort stig" style={vars({ "--i": 5 })}>
      <div className="kortHode"><h2>{rolle === "tn" ? "Forslag til spilleren" : "Forslag fra Team Norway"}</h2><span className="forklaring">{forslag.length} venter</span></div>
      {forslag.length ? (
        <ul className="forslagsliste">
          {forslag.map((f) => (
            <li key={f.id} style={{ flexWrap: "wrap" }}>
              <span style={{ minWidth: 0 }}>{f.handling === "ADD" ? "Legg til" : "Fjern"}: <b>{f.rad.navn}</b><span className="forklaring" style={{ display: "block" }}>{tDato(f.rad.d, f.rad.dager)} · {f.trener}</span></span>
              {rolle === "spiller" ? (
                <span style={{ display: "flex", gap: 6 }}>
                  <button type="button" className="knapp liten" disabled={venter} onClick={() => onSvar(f.id, "ACCEPTED")}><Ikon n="sjekk" /> Godta</button>
                  <button type="button" className="knapp liten sek" disabled={venter} onClick={() => onSvar(f.id, "REJECTED")}>Avvis</button>
                </span>
              ) : rolle === "tn" ? (
                <button type="button" className="knapp liten sek" disabled={venter} onClick={() => onTrekk(f.id)}><Ikon n="angre" /> Trekk tilbake</button>
              ) : <span className="merke m-info">Venter på spilleren</span>}
            </li>
          ))}
        </ul>
      ) : <p className="forklaring" style={{ marginTop: 8 }}>Ingen forslag sendt. Bruk krysset i planen for å foreslå å fjerne en turnering, eller «Foreslå turneringer».</p>}
    </article>
  );
}

function Kalender({ plan, i }: { plan: PlanRad[]; i: number }) {
  const [aapen, setAapen] = useState<number | null>(null);
  const rad = new Map<Merke, Map<number, PlanRad[]>>(MERKER.map((m) => [m, new Map()]));
  plan.forEach((p) => {
    if (!p.rad?.v || !p.rad.d.startsWith("2027")) return;
    const u = ukeIAar(p.rad.d); const r = rad.get(p.rad.v.merke)!;
    r.set(u, [...(r.get(u) ?? []), p]);
  });
  const mndStart = Array.from({ length: 12 }, (_, m) => ukeIAar(new Date(Date.UTC(2027, m, 4)).toISOString().slice(0, 10)));
  const valgt = aapen != null ? plan.filter((p) => p.rad && p.rad.d.startsWith("2027") && ukeIAar(p.rad.d) === aapen) : [];
  return (
    <article className="kort stig full" style={vars({ "--i": i })}>
      <div className="kortHode"><h2>Året 2027, uke for uke</h2><span className="forklaring">Bokstaven er prioriteten. Trykk på en uke for detaljer.</span></div>
      <div className="tabell-ramme">
        <div className="ukekalender plan-kal">
          <span />
          {mndStart.map((fra, m) => <span key={m} className="mnd" style={{ gridColumn: `span ${(m < 11 ? mndStart[m + 1] : 53) - fra}` }}>{MND[m]}</span>)}
          <span />
          {Array.from({ length: 52 }, (_, k) => <span key={k} className="ukenr">{(k + 1) % 2 ? k + 1 : ""}</span>)}
          {MERKER.map((m) => (
            <div key={m} style={{ display: "contents" }}>
              <span className="navn"><span className={`merke ${MERKE[m].klasse}`}>{MERKE[m].tekst}</span></span>
              {Array.from({ length: 52 }, (_, k) => {
                const u = k + 1; const l = rad.get(m)!.get(u);
                if (!l) return <span key={u} className={`uke tom${u % 2 ? "" : " partall"}`} />;
                return (
                  <button key={u} type="button" className={`uke full treff ${MERKE[m].kal}${l.length > 1 ? " flere" : ""}`} style={vars({ "--i": MERKER.indexOf(m) * 8 + Math.floor(u / 7), border: 0, padding: 0, font: "inherit" })}
                    aria-pressed={aapen === u} aria-label={`Uke ${u}: ${l.map((p) => p.navn).join(", ")}`} onClick={() => setAapen(aapen === u ? null : u)}>{l[0].tier}</button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {valgt.length ? (
        <div className="forslagsliste" style={{ marginTop: 12 }}>
          {valgt.map((p) => (
            <div key={p.entryId} style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", justifyContent: "space-between", padding: "10px 12px", borderRadius: "var(--r-boks)", background: "var(--navy-50)", fontSize: 13.5 }}>
              <span><b>Uke {aapen}</b> · {p.navn} · {land(p.rad!.land)}</span>
              <span className="forklaring">Power {nf(p.rad!.power)} · Seier {pst(p.rad!.v!.p1)} · Topp 10 {pst(p.rad!.v!.p10)} · {nf(p.rad!.v!.poeng, 1)} poeng · prioritet {p.tier}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="forklaringer">
        <span><i style={vars({ "--f": "var(--gronn)" })} />Kan vinne: minst 15 % sjanse for seier</span>
        <span><i style={vars({ "--f": "var(--navy-600)" })} />Topp 10: minst 40 % sjanse</span>
        <span><i style={vars({ "--f": "var(--ink-400)" })} />Læring</span>
      </div>
    </article>
  );
}

type Sortering = "d" | "power" | "p1" | "p10" | "ep" | "poeng";
function FinnKort({ visning, kanEndre, iPlan, foreslatt, venter, onLeggTil, onForeslaa }: {
  visning: Planvisning; kanEndre: boolean; iPlan: Map<string, PlanRad>; foreslatt: Map<string, ForslagRad>; venter: boolean;
  onLeggTil: (id: string) => void; onForeslaa: (id: string) => void;
}) {
  const [sok, setSok] = useState("");
  const [landvalg, setLandvalg] = useState("");
  const [nivaa, setNivaa] = useState<Merke | "">("");
  const [sort, setSort] = useState<[Sortering, 1 | -1]>(visning.spiller.harNivaa ? ["poeng", -1] : ["d", 1]);
  const landene = useMemo(() => [...new Set(visning.katalog.map((e) => e.land).filter((x): x is string => Boolean(x)))].sort((a, b) => land(a).localeCompare(land(b), "nb")), [visning.katalog]);
  const liste = useMemo(() => {
    const q = sok.trim().toLowerCase();
    let l = visning.katalog;
    if (q) l = l.filter((e) => e.navn.toLowerCase().includes(q) || (e.bane ?? "").toLowerCase().includes(q));
    if (landvalg) l = l.filter((e) => e.land === landvalg);
    if (nivaa) l = l.filter((e) => e.v?.merke === nivaa);
    const [k, r] = sort;
    const verdi = (e: KatalogRad): number | string => (k === "d" ? e.d : k === "power" ? e.power ?? -1 : e.v ? e.v[k] : r > 0 ? Infinity : -Infinity);
    return [...l].sort((a, b) => (verdi(a) < verdi(b) ? -1 : verdi(a) > verdi(b) ? 1 : 0) * r);
  }, [visning.katalog, sok, landvalg, nivaa, sort]);
  const vis = liste.slice(0, 60);
  const sorter = (k: Sortering) => setSort(([gk, gr]) => (gk === k ? [k, (gr * -1) as 1 | -1] : [k, k === "d" || k === "ep" ? 1 : -1]));
  const th = (k: Sortering, t: string) => (
    <th key={k} aria-sort={sort[0] === k ? (sort[1] > 0 ? "ascending" : "descending") : "none"}><button type="button" className="sorter" onClick={() => sorter(k)}>{t}</button></th>
  );
  return (
    <article className="kort stig full" style={vars({ "--i": 1 })}>
      <div className="kortHode"><h2>{kanEndre ? "Finn turneringer" : "Foreslå turneringer"}</h2><span className="forklaring">{nf(visning.katalog.length)} WAGR-turneringer i Europa og Nord-Amerika som passer spilleren</span></div>
      <div className="filter" style={{ marginTop: 10 }}>
        <label className="skjult" htmlFor="tpl-sok">Søk</label>
        <input className="sok" id="tpl-sok" type="search" autoComplete="off" placeholder="Søk på turnering eller bane" value={sok} onChange={(e) => setSok(e.target.value)} />
        <label className="skjult" htmlFor="tpl-land">Land</label>
        <select className="nedtrekk" id="tpl-land" value={landvalg} onChange={(e) => setLandvalg(e.target.value)}>
          <option value="">Alle land</option>
          {landene.map((x) => <option key={x} value={x}>{land(x)}</option>)}
        </select>
        {visning.spiller.harNivaa ? (
          <div className="velger" role="group" aria-label="Nivå">
            {([["", "Alle"], ["PRESTASJON", "Kan vinne"], ["UTVIKLING", "Topp 10"], ["TRENING", "Læring"]] as [Merke | "", string][]).map(([v, t]) => (
              <button key={t} type="button" className="velg" aria-pressed={nivaa === v} onClick={() => setNivaa(v)}>{t}</button>
            ))}
          </div>
        ) : null}
      </div>
      <p className="antall-linje">{nf(liste.length)} treff{liste.length > 60 ? ", viser de 60 første" : ""}.</p>
      <div className="bred-ramme">
        <table className="liste">
          <thead><tr>
            {th("d", "Dato")}<th className="venstre">Turnering</th><th className="venstre">Land</th>{th("power", "Power")}
            {th("p1", "Seier")}{th("p10", "Topp 10")}{th("ep", "Plass")}{th("poeng", "Poeng")}<th className="venstre">Nivå</th><th><span className="skjult">Handling</span></th>
          </tr></thead>
          <tbody>
            {vis.map((e, i) => {
              const harDen = iPlan.has(e.id);
              return (
                <tr key={e.id} style={vars({ "--i": i })}>
                  <td className="num">{tDato(e.d, e.dager)}{e.sikker ? null : <div className="anslaatt">anslått</div>}</td>
                  <td className="venstre bryt"><a href={e.wagr} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{e.navn}</a>{e.aldersvarsel ? <div className="anslaatt" style={{ whiteSpace: "normal" }}>{e.aldersvarsel}</div> : e.alder ? <div className="anslaatt">{e.alder}</div> : null}</td>
                  <td className="venstre">{land(e.land)}</td>
                  <td className="num">{nf(e.power)}</td>
                  <td className="num">{e.v ? pst(e.v.p1) : "—"}</td>
                  <td className="num">{e.v ? pst(e.v.p10) : "—"}</td>
                  <td className="num">{e.v ? nf(e.v.ep) : "—"}</td>
                  <td className="num sterk">{e.v ? nf(e.v.poeng, 1) : "—"}</td>
                  <td className="venstre"><MerkeChip v={e.v} /></td>
                  <td>
                    {harDen ? <span className="merke m-gronn">I planen</span>
                      : kanEndre ? <button type="button" className="knapp liten" disabled={venter} onClick={() => onLeggTil(e.id)}><Ikon n="plus" /> Legg til</button>
                        : foreslatt.has(`ADD:${e.id}`) ? <span className="merke m-info">Foreslått</span>
                          : <button type="button" className="knapp liten sek" disabled={venter} onClick={() => onForeslaa(e.id)}><Ikon n="send" /> Foreslå</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function OmKort() {
  return (
    <article className="kort stig full" style={vars({ "--i": 1 })}>
      <div className="kortHode"><h2>Slik regnes tallene</h2></div>
      <div style={{ display: "grid", gap: 10, marginTop: 10, maxWidth: "75ch" }}>
        <p><b>Power</b> er WAGRs mål på hvor sterkt feltet er. Høyere Power gir flere WAGR-poeng for samme plassering.</p>
        <p><b>Seier og topp 10</b> er sjansen for spilleren, regnet fra nivået i WAGR-runder siste to år mot spillerne som stilte i turneringen året før. Har WAGR ingen resultatliste, brukes et typisk felt med samme Power.</p>
        <p><b>Poeng</b> er forventede WAGR-poeng: snittet av 300 simulerte turneringer.</p>
        <p><b>WAGR-anslaget</b> legger planen oppå de tellende resultatene spilleren har i dag, med WAGRs regel for hvordan gamle resultater teller mindre, og simulerer 1 500 sesonger.</p>
        <p><b>Kan vinne, Topp 10 og Læring</b> er merkelapper: minst 15 % sjanse for seier, minst 40 % sjanse for topp 10, eller under det. Målene for blandingen er et utkast.</p>
        <p><b>Aldersgrenser</b> varierer mellom arrangørene. Står det «sjekk», avhenger det av regelen eller fødselsdatoen. Turneringer spilleren er for gammel til etter alle vanlige regler, vises ikke.</p>
        <p><b>Datoer for 2027</b> er anslått til samme uke og ukedag som året før der arrangøren ikke har lagt ut datoen. GolfBox-resultater og DataGolf er ikke brukt.</p>
      </div>
    </article>
  );
}
