"use client";
/**
 * DataGolf · spilleren utforsker proffer og sammenligner egne målinger.
 * Fasit: designsystem/train-lock/DG-01 DataGolf topplister og SG-profil.dc.html
 * Avvik:
 *   - Funksjonell videreutvikling av dagens komponenter, ikke pikselportering.
 *   - Proffvalg, målekilder og like SG-skalaer erstatter HCP-felt/True SG/Rest.
 *   - Sammenligning, innspill og lagret utfordringshistorikk er nye innholdsflater.
 */
import Link from "next/link";
import { TurneringshistorikkTrainLock } from "./TurneringshistorikkTrainLock";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { TL } from "@/lib/v2/train-lock";
import type { SpillerverktoyData } from "@/lib/datagolf/player-tool-data";
import type { UtfordringResultat } from "@/lib/datagolf/challenge";
import { bandEtikett, fellesRunder, rundeOppsummering, SG_FELT, skillDifferanse,
  turneringer, visTall, type HistoriskRunde, type Proff } from "@/lib/datagolf/player-tool";
import { STASJON_SLAG } from "@/lib/datagolf/stasjon";

const panel: CSSProperties = { background: TL.elev, borderRadius: TL.radius.card, padding: 20 };
const felt: CSSProperties = { minHeight: 48, width: "100%", minWidth: 0, background: TL.elev,
  color: TL.text, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.field, padding: "8px 12px", fontSize: 16 };
const muted: CSSProperties = { color: TL.mute, fontSize: 14, lineHeight: 1.55 };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16 };
const dato = (s: string | null) => s ? new Date(s).toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" }) : "Dato mangler";
function Seksjon({ title, children }: { title: string; children: ReactNode }) {
  return <section style={panel}><h2 style={{ fontSize: 20, fontWeight: 650, marginBottom: 16 }}>{title}</h2>{children}</section>;
}
function Merknad({ children }: { children: ReactNode }) { return <p style={{ ...muted, marginTop: 12 }}>{children}</p>; }
function SgLinje({ value, max }: { value: number | null; max: number }) {
  return <div aria-hidden="true" data-sg-value={value ?? "missing"} style={{ position: "relative", height: 12, background: TL.dock, borderRadius: 4 }}>
    <span style={{ position: "absolute", left: "50%", height: "100%", width: 1, background: TL.mute }} />
    {value != null && <span style={{ position: "absolute", left: `${value < 0 ? 50 - Math.abs(value) / max * 50 : 50}%`,
      height: "100%", width: `${Math.abs(value) / max * 50}%`, background: TL.fill, borderRadius: 3 }} />}
  </div>;
}
function Ferdighet({ pro, mot }: { pro: Proff; mot: Proff | null }) {
  const max = Math.max(1, ...SG_FELT.flatMap(f => [Math.abs(pro[f.key] ?? 0), Math.abs(mot?.[f.key] ?? 0)]));
  return <Seksjon title="Beregnet ferdighetsnivå">
    <p style={muted}>Strokes Gained (SG) er slag vunnet eller tapt mot en referanse. Her viser DataGolf forventet prestasjon på en gjennomsnittlig PGA Tour-bane.</p>
    <p style={{ ...muted, marginTop: 8 }}>{pro.name}: {dato(pro.asOf)}{mot ? ` · ${mot.name}: ${dato(mot.asOf)}` : ""}</p>
    {SG_FELT.map(f => <div key={f.key} style={{ padding: "16px 0", borderBottom: `1px solid ${TL.hair}` }}>
      <strong>{f.label}</strong>
      {[pro, ...(mot ? [mot] : [])].map(p => <div key={p.dgId} style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
          <span>{p.name}</span><strong>{visTall(p[f.key], 2, true)}</strong>
        </div><SgLinje value={p[f.key]} max={max} />
      </div>)}
      {mot && skillDifferanse(pro, mot, f.key) !== null && <p style={{ ...muted, marginTop: 8 }}>
        Forskjell, {pro.name}: {visTall(skillDifferanse(pro, mot, f.key), 2, true)} slag per runde.
      </p>}
    </div>)}
    <Merknad>Samme skala på begge sider av null. Dette er en modellberegning, ikke et sesongsnitt eller en garantert rundescore. Forskjell vises bare for samme kildeuttak.</Merknad>
  </Seksjon>;
}
function Resultater({ rounds, name }: { rounds: HistoriskRunde[]; name: string }) {
  return <Seksjon title={`Turneringer · ${name}`}>
    {rounds.length === 0 ? <p style={muted}>Ingen runder er tilgjengelige for dette utvalget.</p> : <>
      <p style={muted}>Siste {rounds.length} importerte runder. Datoen tilhører turneringen; eksakt spilledag kan mangle. En turnering kan være delvis med i utvalget.</p>
      {turneringer(rounds).map(e => <details key={e.id} style={{ padding: "16px 0", borderBottom: `1px solid ${TL.hair}` }}>
        <summary style={{ cursor: "pointer", minHeight: 44 }}><strong>{e.name}</strong><br />
          <span style={muted}>{dato(e.date)} · {e.tour.toUpperCase()} · {e.position != null ? `Plass ${e.position}` : e.madeCut === false ? "Misset cut" : "Sluttplassering mangler"}</span>
        </summary>
        {e.rounds.map(r => <div key={r.round} style={{ marginTop: 12 }}>
          <strong>Runde {r.round}: {visTall(r.score, 0)} slag</strong> · {visTall(r.toPar, 0, true)} mot par
          <p style={muted}>SG mot rundens felt: {visTall(r.total, 2, true)}{r.app != null ? ` · innspill ${visTall(r.app, 2, true)}` : " · kategorier mangler"}</p>
        </div>)}
      </details>)}
      <Merknad>Data sist importert {dato(rounds.reduce((a, b) => a.importedAt > b.importedAt ? a : b).importedAt)}. Rå SG er relativt til rundens felt og bane, ikke True SG.</Merknad>
    </>}
  </Seksjon>;
}
export type DataGolfProps = { data: SpillerverktoyData; spillerNavn?: string; historikk: (UtfordringResultat & { id: string })[] };
export function DataGolfV2({ data, historikk }: DataGolfProps) {
  const router = useRouter(); const search = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [fane, setFane] = useState("oversikt"); const [sok, setSok] = useState("");
  function velg(key: string, value: string) {
    const params = new URLSearchParams(search.toString());
    if (value) params.set(key, value); else params.delete(key);
    if (key === "pro" && value === params.get("mot")) params.delete("mot");
    startTransition(() => router.replace(`/portal/analysere/datagolf?${params.toString()}`, { scroll: false }));
  }
  const pro = data.proff;
  if (!pro) return <div data-screen="DG-01"><h1 style={{ fontSize: 34 }}>DataGolf</h1>
    <p style={muted}>{data.kildefeil ? "DataGolf-data kunne ikke hentes. Prøv igjen." : "Proffreferansene er ikke tilgjengelige ennå."}</p>
    <button type="button" style={felt} onClick={() => router.refresh()}>Prøv igjen</button>
    <TurneringshistorikkTrainLock h={data.turneringshistorikk} /></div>;
  const mot = data.mot;
  const scorer = data.proffRunder.flatMap(r => r.score == null ? [] : [r.score]);
  const a = rundeOppsummering(data.proffRunder);
  const b = mot ? rundeOppsummering(data.motRunder) : data.egne.count ? data.egne : rundeOppsummering(data.egneDgRunder);
  const motNavn = mot?.name ?? "Deg";
  const otherSkill = mot ?? data.egenSkill;
  const styrke = SG_FELT.filter(f => f.key !== "total" && pro[f.key] !== null).toSorted((a, b) => (pro[b.key] ?? 0) - (pro[a.key] ?? 0))[0];
  const felles = fellesRunder(data.proffRunder, mot ? data.motRunder : data.egneDgRunder);
  const profiler = data.proffer.filter(p => p.dgId === pro.dgId || p.name.toLocaleLowerCase("nb").includes(sok.toLocaleLowerCase("nb")));
  const faner = [{ id: "oversikt", name: "Proffen" }, { id: "sammenlign", name: "Sammenlign" }, { id: "innspill", name: "Innspill" }, { id: "resultater", name: "Resultater" }];
  return <div data-screen="DG-01" aria-busy={pending} style={{ color: TL.text, fontVariantNumeric: "tabular-nums", display: "grid", gap: 20, paddingTop: 16 }}>
    <header><h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>Hvor god er proffen?</h1>
      <p style={{ ...muted, marginTop: 8 }}>Utforsk tallene, sammenlign med deg selv og prøv en utfordring. Du trenger ingen egen DataGolf-profil.</p></header>
    {data.kildefeil && <p role="alert">Deler av datakilden er utilgjengelige. Visningen kan være ufullstendig. <button onClick={() => router.refresh()} style={{ textDecoration: "underline" }}>Prøv igjen</button></p>}
    <div style={grid}>
      <label style={{ display: "grid", gap: 8 }}>Søk etter proff<input type="search" value={sok} onChange={e => setSok(e.target.value)} placeholder="Navn" style={felt} /></label>
      <label style={{ display: "grid", gap: 8 }}>Velg proff · {data.proffer.length} i utvalget<select value={pro.dgId} onChange={e => velg("pro", e.target.value)} style={felt}>
        {profiler.map(p => <option key={p.dgId} value={p.dgId}>{p.name}</option>)}</select></label>
    </div>
    {sok && !data.proffer.some(p => p.name.toLocaleLowerCase("nb").includes(sok.toLocaleLowerCase("nb"))) && <p role="status" style={muted}>Ingen proffer matcher søket. Den valgte profilen er beholdt.</p>}
    <nav aria-label="DataGolf-visning" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
      {faner.map(f => <button key={f.id} type="button" aria-pressed={fane === f.id} onClick={() => setFane(f.id)}
        style={{ ...felt, borderRadius: TL.radius.pill, fontWeight: 600, background: fane === f.id ? TL.fill : TL.elev, color: fane === f.id ? TL.onFill : TL.text }}>{f.name}</button>)}
    </nav>
    <p role="status" style={muted}>{pending ? "Henter sammenligningen …" : `${pro.name}${mot ? ` mot ${mot.name}` : ""}`}</p>
    {fane === "oversikt" && <>
      <Seksjon title={pro.name}><div style={grid}>
        <div><div style={{ fontSize: 44, fontWeight: 700 }}>{visTall(pro.total, 2, true)}</div><p style={muted}>Forventet SG per runde · {dato(pro.asOf)}</p></div>
        <div><strong>Største styrke i profilen</strong><p style={{ fontSize: 26, marginTop: 6 }}>{styrke?.label ?? "Data mangler"}</p>
          <p style={muted}>{styrke ? `${visTall(pro[styrke.key], 2, true)} SG per runde` : ""}</p></div>
      </div><Merknad>Driver-lengde: {visTall(pro.distance, 1, true)} yards relativt til referansen. Presisjon: {visTall(pro.accuracy, 1, true)} prosentpoeng. Tallene er justert for forholdene og er ikke absolutt lengde eller fairway-prosent.</Merknad></Seksjon>
      {scorer.length > 0 && <Seksjon title="Hva scorer proffen?">
        <p><strong>{visTall(a.score.value)} slag i brutto rundesnitt</strong> over {a.score.count} importerte runder.</p>
        <Merknad>Laveste rundescore: {Math.min(...scorer)}. Høyeste: {Math.max(...scorer)}. Rundene er spilt under ulike forhold. Åpne Resultater for å se hver turnering og runde.</Merknad>
      </Seksjon>}
      <Ferdighet pro={pro} mot={null} />
    </>}
    {fane === "sammenlign" && <>
      <div style={grid}><label style={{ display: "grid", gap: 8 }}>Sammenlign med<select value={mot?.dgId ?? ""} onChange={e => velg("mot", e.target.value)} style={felt}>
        <option value="">Meg</option>{data.proffer.filter(p => p.dgId !== pro.dgId).map(p => <option key={p.dgId} value={p.dgId}>{p.name}</option>)}</select></label>
        <label style={{ display: "grid", gap: 8 }}>Rundeutvalg<select value={data.valg.runder} onChange={e => velg("runder", e.target.value)} style={felt}>{[12, 24, 50].map(n => <option key={n} value={n}>Siste {n} registrerte runder</option>)}</select></label></div>
      <Seksjon title={`${pro.name} og ${motNavn}`}>
        <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", textAlign: "left", overflowWrap: "anywhere" }}>
          <thead><tr><th scope="col" style={{ width: "40%", padding: "8px 4px" }}>Måling</th><th scope="col" style={{ padding: "8px 4px" }}>{pro.name}</th><th scope="col" style={{ padding: "8px 4px" }}>{motNavn}</th></tr></thead><tbody>
          {([{ key: "score", name: "Brutto rundesnitt", unit: "slag" }, { key: "accuracy", name: "Fairwaytreff", unit: "%" }, { key: "gir", name: "Green på regulært antall slag", unit: "%" }] as const).map(f => <ComparisonRow key={f.key} label={f.name} unit={f.unit} a={a[f.key]} b={b[f.key]} />)}
        </tbody></table>
        <Merknad>Antall runder vises under hver verdi. Baner, teesteder, vær og tidsrom kan være forskjellige; tallene beskriver prestasjoner og gir ikke et justert nivågap.</Merknad>
        <Merknad>{pro.name}: {dato(data.proffRunder.at(-1)?.date ?? null)}–{dato(data.proffRunder[0]?.date ?? null)}.
          {mot ? ` ${mot.name}: ${dato(data.motRunder.at(-1)?.date ?? null)}–${dato(data.motRunder[0]?.date ?? null)}.` : data.egne.count ? ` ${data.egneKilde}, dokumenterte 18-hullsrunder: ${dato(data.egne.from)}–${dato(data.egne.to)}.` : ` Dine DataGolf-runder: ${dato(data.egneDgRunder.at(-1)?.date ?? null)}–${dato(data.egneDgRunder[0]?.date ?? null)}.`}</Merknad>
        {!mot && b.count === 0 && <Merknad>Registrer en hel runde med hullscore for å sammenligne. Fairwaytreff og greentreff krever fullstendig registrering. <Link href="/portal/mal/runder/ny" style={{ textDecoration: "underline" }}>Registrer runde</Link></Merknad>}
        {felles.count > 0 && <Merknad>I {felles.count} felles runder på samme bane var forskjellen {visTall(felles.value, 2, true)} SG per runde i favør av {pro.name}. Positiv verdi betyr at proffen presterte bedre.</Merknad>}
      </Seksjon>
      {otherSkill ? <Ferdighet pro={pro} mot={otherSkill} /> : <Merknad>Dine registrerte SG-tall har et annet eller ukjent sammenligningsgrunnlag. De trekkes derfor ikke fra proffens beregnede nivå.</Merknad>}
    </>}
    {fane === "innspill" && <>
      <Seksjon title={`Innspill · ${pro.name}`}><p style={muted}>Siste 24 måneder i kildeuttaket{data.approach ? ` · oppdatert ${dato(data.approach.asOf)}` : ""}. Nærhet er justert for slagets vanskelighetsgrad og viser gjennomsnittlig avstand til hullet. Det er ikke en sirkel som en bestemt andel av slagene treffer.</p>
        {!data.approach?.bands.length && <Merknad>Detaljerte innspilltall er ikke hentet for denne proffen ennå. Du kan fortsatt utforske ferdighetsprofilen og resultatene.</Merknad>}
        {data.approach?.bands.map(band => {
          const other = data.motApproach?.bands.find(b => b.band === band.band && b.lie === band.lie);
          return <div key={`${band.band}-${band.lie}`} style={{ borderTop: `1px solid ${TL.hair}`, marginTop: 20, paddingTop: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600 }}>{bandEtikett(band)}</h3>
            <div style={{ ...grid, marginTop: 12 }}>
              <div><strong style={{ fontSize: 30 }}>{visTall(band.proximityMeters)} m</strong><p style={muted}>Justert nærhet · {band.shotCount ?? "ukjent antall"} slag</p></div>
              <div>SG per slag: <strong>{visTall(band.sgPerShot, 3, true)}</strong><br />Greentreff: {visTall(band.girRate == null ? null : band.girRate * 100)} %<br />Gode slag: {visTall(band.goodShotRate == null ? null : band.goodShotRate * 100)} %</div>
            </div>
            {other && <Merknad>{mot?.name}: {visTall(other.proximityMeters)} m · {other.shotCount ?? "ukjent antall"} slag · {dato(data.motApproach?.asOf ?? null)}.</Merknad>}
            {band.proximityMeters != null && <Link href={`/portal/analysere/datagolf/stasjon?tak=${pro.dgId}&slag=${band.band}&lie=${band.lie}`}
              style={{ display: "inline-flex", alignItems: "center", minHeight: 48, marginTop: 12, textDecoration: "underline", fontWeight: 600 }}>Prøv selv fra dette intervallet</Link>}
          </div>;
        })}
        <Merknad>Gode slag følger DataGolfs definisjon innenfor intervallet. Putting per fot og bunkerprofiler for enkeltproffer inngår ikke i denne datakilden.</Merknad>
      </Seksjon>
    </>}
    {fane === "resultater" && <div style={grid}><Resultater rounds={data.proffRunder} name={pro.name} />{mot && <Resultater rounds={data.motRunder} name={mot.name} />}</div>}
    {fane === "resultater" && <>
      <TurneringshistorikkTrainLock h={data.turneringshistorikk} />
      <Link href="/portal/tren/turneringer" style={{ display: "inline-flex", minHeight: 48, alignItems: "center", textDecoration: "underline" }}>Se turneringskalenderen</Link>
    </>}
    <Seksjon title="Dine siste utfordringer">
      {!historikk.length ? <p style={muted}>Prøv en innspillutfordring for å lagre ditt første resultat.</p> : historikk.map(r => <div key={r.id} style={{ padding: "12px 0", borderBottom: `1px solid ${TL.hair}` }}>
        <strong>{r.inne}/10 innenfor målet</strong> · {STASJON_SLAG.find(s => s.id === r.slag)?.etikett ?? r.slag}
        <p style={muted}>{dato(r.completedAt)} · {r.source === "datagolf" ? r.name : "Egen treningsregel"} · {r.carry != null ? `${visTall(r.carry)} m · ` : ""}{r.lie} · mål {visTall(r.target)} {r.unit ?? ""}</p>
        <Link href={`/portal/analysere/datagolf/stasjon?tak=${r.tak}&slag=${r.slag}&lie=${r.lie}${r.carry != null ? `&carry=${r.carry}` : ""}`} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", textDecoration: "underline" }}>Prøv igjen</Link>
      </div>)}
      <Merknad>Sammenlign egne forsøk med samme avstand, leie og treningsmål. Referansen kan endres når DataGolf oppdateres.</Merknad>
    </Seksjon>
    <footer style={muted}>Data powered by <a href="https://datagolf.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>DataGolf</a>. <a href="https://datagolf.com/frequently-asked-questions" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Slik beregnes tallene</a>. Manglende verdier vises som —.</footer>
  </div>;
}
function ComparisonRow({ label, unit, a, b }: { label: string; unit: string; a: { value: number | null; count: number }; b: { value: number | null; count: number } }) {
  return <tr><th scope="row" style={{ padding: "12px 4px", fontWeight: 400 }}>{label}</th>{[a, b].map((m, i) => <td key={i} style={{ padding: "12px 4px" }}><strong>{visTall(m.value)} {unit}</strong><br /><small style={muted}>{m.count} runder</small></td>)}</tr>;
}
