import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import type { TnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { lagreTrackManMaal } from "@/app/team-norway/tn-trackman-actions";
import { TnFilterknapper, TnFlate, TnFlatehode, TnFotnote, TnRutenett } from "../tn-flate";
import { TnShell, TnSpillerFaner, TnTomtilstand, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltTekst } from "../tn-stall";

/**
 * TrackMan-statistikk i IUP › Tester (utkast 3, gruppa «TrackMan-statistikk», godkjent av Anders 22.10.2026).
 * Fasit: docs/design-system/utkast-tn/trenerflate/utkast-3.html. Ren visning; siden regner tallene.
 * Visningene: Statistikk (per kølle, med mål og vinduer, treffpunkt, gapping og Club Speed), Tendens og Sammenheng.
 *
 * Avvik:
 *   - Parametertabellen er kortrader på alle bredder, ikke tabell, så ingen skjerm ruller sidelengs.
 *   - Ytterpunktene er lenker til slaget (slagkortet øverst), ikke en egen side.
 *   - Club Speed vises, men lagres ikke av treneren: Fysisk fører spilleren selv i PlayerHQ (trenerKanFore, 20.10).
 *     Utkastet viser «Bekreft» for treneren; det står som avvik til Anders avgjør.
 */

export type VisParameter = { navn: string; enhet: string; desimaler: number; n: number; forFaa: boolean; snitt: number | null; median: number | null; min: { verdi: number; href: string } | null; maks: { verdi: number; href: string } | null; spredning: number | null; andel: number | null; vindu: string };
export type VisMaalRad = { parameter: string; key: string; navn: string; enhet: string; maal: number | null; vinduMin: number | null; vinduMax: number | null; standard: string; gjelder: string; eget: boolean };
export type VisGap = { kolle: string; n: number; carry: number | null; spredning: number | null; gap: number | null };
export type VisTendensPunkt = { dato: string; n: number; snitt: number | null; spredning: number | null };
export type VisMaaned = { maaned: string; tm: { n: number; andelFtp: number | null; carrySpredning: number | null } | null; trening: VisRunder | null; turnering: VisRunder | null };
export type VisRunder = { antall: number; sgOtt: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null };
export type VisSlag = { nr: number; club: string; verdier: { navn: string; tekst: string }[] };

export type TnTrackManVisningData = {
  spillerId: string;
  tilgang: TnSpillerTilgang;
  brukerNavn: string;
  kanSkrive: boolean;
  feil: string | null;
  okter: { href: string; label: string; aktiv: boolean }[];
  akser: { href: string; label: string; aktiv: boolean }[];
  koller: { href: string; label: string; aktiv: boolean }[];
  visninger: { href: string; label: string; aktiv: boolean }[];
  kolle: string | null;
  kilde: string;
  visning: "statistikk" | "tendens" | "sammenheng";
  slag: VisSlag | null;
  parametre: VisParameter[];
  maal: VisMaalRad[];
  tilbake: string;
  gapping: VisGap[];
  treffpunkt: { n: number; tekst: string; punkter: { x: number; y: number }[] };
  clubSpeed: { beste: number | null; slag: { nr: number; verdi: number | null; beste: boolean }[] };
  tendens: { parametre: { href: string; label: string; aktiv: boolean }[]; navn: string; enhet: string; punkter: VisTendensPunkt[] };
  maaneder: VisMaaned[];
};

const tall = (v: number | null | undefined, d = 1) => (v == null ? "—" : v.toLocaleString("nb-NO", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−"));
const pst = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)} %`);
const mono: CSSProperties = { fontFamily: TN.font.mono, fontVariantNumeric: "tabular-nums" };
const rad: CSSProperties = { display: "grid", gap: 4, padding: "10px 0", borderTop: `1px solid ${TN.ink100}`, minWidth: 0 };
const merke: CSSProperties = { fontSize: 12.5, color: TN.ink500 };

function Felt({ navn, children }: { navn: string; children: ReactNode }) {
  return <span style={{ display: "inline-flex", gap: 6, alignItems: "baseline", whiteSpace: "nowrap" }}><span style={merke}>{navn}</span><b style={{ ...mono, fontWeight: 600, fontSize: 14, color: TN.navy900 }}>{children}</b></span>;
}

function Ytterpunkt({ p, v }: { p: VisParameter; v: { verdi: number; href: string } | null }) {
  if (!v) return <>—</>;
  return <Link href={v.href} style={{ color: TN.navy900, textUnderlineOffset: 3 }}>{tall(v.verdi, p.desimaler)}</Link>;
}

function Statistikk({ d }: { d: TnTrackManVisningData }) {
  return (
    <>
      {d.slag ? (
        <TnFlate>
          <TnFlatehode tittel={`Slag ${d.slag.nr} · ${d.slag.club}`} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
            {d.slag.verdier.map((v) => <Felt key={v.navn} navn={v.navn}>{v.tekst}</Felt>)}
          </div>
        </TnFlate>
      ) : null}
      <TnFlate>
        <TnFlatehode tittel={d.kolle ? `${d.kolle} · ${d.parametre[0]?.n ?? 0} slag` : "Ingen slag"} merknad={d.parametre.some((p) => p.forFaa && p.n > 0) ? "Under 5 slag: for få slag" : undefined} />
        {d.parametre.map((p) => (
          <div key={p.navn} style={rad}>
            <span style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "2px 12px", alignItems: "baseline" }}>
              <b style={{ fontSize: 14.5, color: TN.ink900 }}>{p.navn}</b>
              <span style={merke}>{p.n ? `${p.n} slag${p.forFaa ? " · for få slag" : ""}` : "—"}</span>
            </span>
            <span style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
              <Felt navn="Snitt">{tall(p.snitt, p.desimaler)}{p.snitt !== null && p.enhet ? (p.enhet === "°" ? "°" : ` ${p.enhet}`) : ""}</Felt>
              <Felt navn="Median">{tall(p.median, p.desimaler)}</Felt>
              <Felt navn="Min"><Ytterpunkt p={p} v={p.min} /></Felt>
              <Felt navn="Maks"><Ytterpunkt p={p} v={p.maks} /></Felt>
              <Felt navn="Spredning">{tall(p.spredning, p.desimaler)}</Felt>
              <Felt navn="I målvindu">{p.vindu === "—" ? "—" : `${pst(p.andel)} (${p.vindu})`}</Felt>
            </span>
          </div>
        ))}
        <TnFotnote>{d.kilde} Spredning = standardavvik. Min og maks åpner slaget. «—» når verdien mangler.</TnFotnote>
      </TnFlate>

      {d.kolle ? (
        <TnFlate>
          <TnFlatehode tittel={`Mål og vinduer for ${d.tilgang.spillerNavn.split(" ")[0]} · ${d.kolle}`} />
          {d.feil ? <p role="alert" style={{ margin: "0 0 8px", color: TN.status.redText, fontWeight: 700 }}>{d.feil}</p> : null}
          {d.maal.map((m) => (
            <div key={m.key} style={rad}>
              <span style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", alignItems: "baseline" }}>
                <b style={{ fontSize: 14.5, color: TN.ink900 }}>{m.parameter}</b>
                <Felt navn="Mål">{m.maal === null ? "—" : tall(m.maal, 2)}</Felt>
                <Felt navn="Vindu">{m.standard}</Felt>
                <span style={merke}>{m.gjelder}</span>
              </span>
              {d.kanSkrive ? (
                <details>
                  <summary style={{ cursor: "pointer", minHeight: 44, display: "inline-flex", alignItems: "center", fontWeight: 700, color: TN.navy600 }}>Endre mål og vindu</summary>
                  <form action={lagreTrackManMaal} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "end", paddingTop: 6 }}>
                    <input type="hidden" name="spillerId" value={d.spillerId} />
                    <input type="hidden" name="kolle" value={d.kolle!} />
                    <input type="hidden" name="parameter" value={m.key} />
                    <input type="hidden" name="tilbake" value={d.tilbake} />
                    {(["maal", "vinduMin", "vinduMax"] as const).map((felt) => (
                      <label key={felt} style={{ display: "grid", gap: 2, fontSize: 12.5, color: TN.ink500 }}>
                        {felt === "maal" ? "Mål" : felt === "vinduMin" ? "Vindu fra" : "Vindu til"}{m.enhet ? ` (${m.enhet})` : ""}
                        <input name={felt} inputMode="decimal" defaultValue={m[felt] === null ? "" : String(m[felt])} style={{ width: 96, minHeight: 44, ...mono, fontSize: 15, padding: "0 8px", border: `1.5px solid ${TN.ink300}`, borderRadius: 8 }} />
                      </label>
                    ))}
                    <button type="submit" name="handling" value="lagre" style={{ minHeight: 44, padding: "0 16px", borderRadius: 999, border: 0, background: TN.navy900, color: TN.white, fontWeight: 700 }}>Lagre</button>
                    {m.eget ? <button type="submit" name="handling" value="standard" style={{ minHeight: 44, padding: "0 16px", borderRadius: 999, border: `1.5px solid ${TN.navy900}`, background: "transparent", color: TN.navy900, fontWeight: 700 }}>Tilbake til standard</button> : null}
                  </form>
                </details>
              ) : null}
            </div>
          ))}
          <TnFotnote>Standardvinduene gjelder til trener eller spiller setter egne mål for parameteren og køllen. Hver endring viser hvem og når.</TnFotnote>
        </TnFlate>
      ) : null}

      <TnRutenett min={320}>
        <TnFlate>
          <TnFlatehode tittel={`Treffpunkt${d.kolle ? ` · ${d.kolle}` : ""}`} />
          {d.treffpunkt.n ? (
            <svg viewBox="0 0 300 160" role="img" aria-label={`Treffpunkt på køllebladet: ${d.treffpunkt.tekst}`} style={{ width: "min(100%, 360px)", height: "auto", color: TN.navy900 }}>
              <rect x={30} y={20} width={240} height={120} rx={24} fill="none" stroke="currentColor" strokeOpacity={0.4} />
              <line x1={150} y1={20} x2={150} y2={140} stroke="currentColor" strokeOpacity={0.15} />
              <line x1={30} y1={80} x2={270} y2={80} stroke="currentColor" strokeOpacity={0.15} />
              <text x={34} y={154} fontSize={11} fill="currentColor" fillOpacity={0.6}>X −1</text>
              <text x={266} y={154} textAnchor="end" fontSize={11} fill="currentColor" fillOpacity={0.6}>X +1</text>
              {d.treffpunkt.punkter.map((p, i) => <circle key={i} cx={150 + p.x * 110} cy={80 - p.y * 55} r={4} fill="currentColor" fillOpacity={0.7} />)}
            </svg>
          ) : null}
          <p style={{ margin: 0, fontSize: 13.5, color: TN.textSecondary }}>{d.treffpunkt.n ? d.treffpunkt.tekst : "Ingen slag har treffpunkt i denne økta. «—»."}</p>
        </TnFlate>
        <TnFlate>
          <TnFlatehode tittel="Gapping, carry per kølle" />
          {d.gapping.map((g) => (
            <div key={g.kolle} style={{ ...rad, display: "flex", flexWrap: "wrap", gap: "4px 16px", alignItems: "baseline" }}>
              <b style={{ fontSize: 14.5, minWidth: 72 }}>{g.kolle}</b>
              <Felt navn="Carry">{g.carry === null ? "—" : `${tall(g.carry)} m`}</Felt>
              <Felt navn="Spredning">{tall(g.spredning)}</Felt>
              <Felt navn="Gap">{g.n < 5 ? "for få slag" : g.gap === null ? "—" : `${tall(g.gap)} m`}</Felt>
            </div>
          ))}
          <TnFotnote>Gap regnes bare mellom køller med minst 5 slag.</TnFotnote>
        </TnFlate>
        <TnFlate>
          <TnFlatehode tittel="Club Speed" />
          <p style={{ margin: 0 }}><b style={{ ...mono, fontSize: 30, color: TN.navy900 }}>{tall(d.clubSpeed.beste)}</b> <span style={merke}>mph · beste av de fem første driverslagene</span></p>
          {d.clubSpeed.slag.map((s) => (
            <div key={s.nr} style={{ ...rad, display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span>TM {s.nr}{s.beste ? " · beste" : ""}</span><b style={mono}>{tall(s.verdi)} mph</b>
            </div>
          ))}
          <TnFotnote>Club Speed i Fysisk føres av spilleren i PlayerHQ. Treneren fører bare teknikk- og PEI-tester.</TnFotnote>
        </TnFlate>
      </TnRutenett>
    </>
  );
}

function Tendens({ d }: { d: TnTrackManVisningData }) {
  const p = d.tendens.punkter;
  const med = p.filter((x) => x.snitt !== null);
  const verdier = med.flatMap((x) => [x.snitt! - (x.spredning ?? 0), x.snitt! + (x.spredning ?? 0)]);
  const lo = Math.min(...verdier), hi = Math.max(...verdier);
  const y = (v: number) => 150 - ((v - lo) / (hi - lo || 1)) * 120;
  const x = (i: number) => 40 + (med.length > 1 ? (i * 540) / (med.length - 1) : 270);
  return (
    <TnFlate>
      <TnFilterknapper etikett="Parameter" valg={d.tendens.parametre} />
      <TnFlatehode tittel={`${d.tendens.navn} over tid${d.kolle ? ` · ${d.kolle}` : ""}`} />
      {med.length ? (
        <svg viewBox="0 0 620 180" role="img" aria-label={`${d.tendens.navn}: snitt og spredning per økt`} style={{ width: "100%", height: "auto", color: TN.navy900 }}>
          {med.map((pt, i) => pt.spredning !== null ? <line key={`b${i}`} x1={x(i)} x2={x(i)} y1={y(pt.snitt! - pt.spredning)} y2={y(pt.snitt! + pt.spredning)} stroke="currentColor" strokeOpacity={0.25} strokeWidth={10} strokeLinecap="round" /> : null)}
          <polyline fill="none" stroke="currentColor" strokeWidth={2} points={med.map((pt, i) => `${x(i)},${y(pt.snitt!)}`).join(" ")} />
          {med.map((pt, i) => <circle key={i} cx={x(i)} cy={y(pt.snitt!)} r={5} fill={pt.n >= 5 ? "currentColor" : TN.white} stroke="currentColor" strokeWidth={2} />)}
          {med.map((pt, i) => <text key={`t${i}`} x={x(i)} y={174} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.6}>{pt.dato}</text>)}
        </svg>
      ) : <p style={{ margin: 0, color: TN.textSecondary }}>Ingen økter med {d.tendens.navn} for denne køllen. «—».</p>}
      {p.map((pt) => (
        <div key={pt.dato} style={{ ...rad, display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
          <b style={{ minWidth: 72 }}>{pt.dato}</b>
          <Felt navn="Snitt">{tall(pt.snitt)}{pt.snitt !== null && d.tendens.enhet ? (d.tendens.enhet === "°" ? "°" : ` ${d.tendens.enhet}`) : ""}</Felt>
          <Felt navn="Spredning">{pt.n < 5 ? "for få slag" : tall(pt.spredning)}</Felt>
          <span style={merke}>{pt.n} slag</span>
        </div>
      ))}
      <TnFotnote>Stolpen er snitt pluss og minus ett standardavvik. Åpen prikk: under 5 slag i økta.</TnFotnote>
    </TnFlate>
  );
}

function Runder({ navn, r }: { navn: string; r: VisRunder | null }) {
  if (!r) return <span style={merke}>{navn}: —</span>;
  return (
    <span style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px", alignItems: "baseline" }}>
      <span style={merke}>{navn} · {r.antall} runder</span>
      <Felt navn="SG tee">{tall(r.sgOtt, 2)}</Felt>
      <Felt navn="Innspill">{tall(r.sgApp, 2)}</Felt>
      <Felt navn="Nærspill">{tall(r.sgArg, 2)}</Felt>
      <Felt navn="Putting">{tall(r.sgPutt, 2)}</Felt>
    </span>
  );
}

function Sammenheng({ d }: { d: TnTrackManVisningData }) {
  return (
    <TnFlate>
      <TnFlatehode tittel={`TrackMan mot spill${d.kolle ? ` · ${d.kolle}` : ""}`} merknad="Sammenstilling, ikke årsak" />
      {d.maaneder.length ? d.maaneder.map((m) => (
        <div key={m.maaned} style={rad}>
          <b style={{ fontSize: 14.5 }}>{m.maaned}</b>
          <span style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px", alignItems: "baseline" }}>
            <span style={merke}>TrackMan{m.tm ? ` · ${m.tm.n} slag` : ""}</span>
            <Felt navn="Face to Path i vindu">{m.tm ? pst(m.tm.andelFtp) : "—"}</Felt>
            <Felt navn="Carry-spredning">{m.tm ? tall(m.tm.carrySpredning) : "—"}</Felt>
          </span>
          <Runder navn="Treningsrunder" r={m.trening} />
          <Runder navn="Turneringsrunder" r={m.turnering} />
        </div>
      )) : <p style={{ margin: 0, color: TN.textSecondary }}>Ingen TrackMan-slag eller registrerte runder de siste seks månedene.</p>}
      <TnFotnote>Sammenstilling, ikke årsak: tallene står side om side per måned og sier ikke at det ene gir det andre. Bare brutto (Strokes Gained fra spillerens egne slag). Runder uten type (trening eller turnering) er holdt utenfor.</TnFotnote>
    </TnFlate>
  );
}

export function TnTrackManVisning({ d }: { d: TnTrackManVisningData }) {
  const t = d.tilgang;
  return (
    <TnShell aktiv="spillere" brukerNavn={d.brukerNavn} rolle={tnRolleNavn(t.kontekst.rolle)} groupId={t.kontekst.gruppe.id} visTrenerflater={!t.kontekst.erSpiller} kanAdministrere={t.kontekst.kanAdministrere} tilbake={{ href: `/team-norway/spiller/${d.spillerId}/tester`, label: "Tester" }}>
      <TnSkraTopp bilde="spiller-ved-vannet" lav etikett={`TrackMan for ${t.spillerNavn}`} overlinje={`IUP · ${t.spillerNavn} · Tester`} tittel="TrackMan" venstre={<TnHeltTekst>Snitt, median, ytterpunkter og spredning per kølle, og hvordan tallene utvikler seg.</TnHeltTekst>} />
      <TnSkraKort lav>
        <TnFlate style={{ display: "grid", gap: 8 }}>
          <TnSpillerFaner spillerId={d.spillerId} spillerNavn={t.spillerNavn} aktiv="tester" kanAdministrere={!t.kontekst.erSpiller} />
          {d.okter.length ? (
            <>
              <TnFilterknapper etikett="Økt" valg={d.okter} />
              <TnFilterknapper etikett="Akse" valg={d.akser} />
              {d.koller.length ? <TnFilterknapper etikett="Kølle" valg={d.koller} /> : null}
              <TnFilterknapper etikett="Visning" valg={d.visninger} />
            </>
          ) : null}
        </TnFlate>
        {!d.okter.length ? (
          <TnTomtilstand tittel="Ingen TrackMan-økter ennå" tekst="Når en TrackMan-fil er importert for spilleren, vises statistikken her. Importen gjøres fra IUP › Tester eller midt i testøkta." />
        ) : d.visning === "tendens" ? <Tendens d={d} /> : d.visning === "sammenheng" ? <Sammenheng d={d} /> : <Statistikk d={d} />}
      </TnSkraKort>
    </TnShell>
  );
}
