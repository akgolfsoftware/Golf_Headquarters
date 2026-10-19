import { DgOvelseSkjema, DgPlanSkjema } from "@/components/datagolf/DgForslagSkjema";
import type { DgSpillerVisning } from "@/lib/datagolf/spiller-mot-proff-data";
import { dgFunn, nesteMandag, type InnspillRad } from "@/lib/datagolf/spiller-mot-proff";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import type { ReactNode } from "react";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFilterknapper, TnFlate, TnFlatehode, TnFotnote, TnListerad, TnMangler, TnSkjermhode, TnTekstlenke } from "../tn-flate";
import { TnHelt, TnHeltSporsmaal, TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";

/**
 * DG-05 Spiller mot proff, DG-06 Innspill-tak og DG-07 Fra funn til forslag i Team Norway
 * (Analyse › Data Golf). Fasit: docs/design-system/utkast-tn/datagolf.html og
 * utkast-agencyos/datagolf.html. Bare for kanSeDataGolf (siden og hentDgSpillerVisning).
 * Spillerens tall leses bare når spilleren har delt med treneren (medTnSpillerData).
 * Forslag går til spillerens Workbench som forslag; Team Norway skriver aldri i planen.
 *
 * Avvik: tour-referansen (PgaApproachDistance) og «Gruppas øvelsesbank» er ikke med. Målingen
 * «Driver» er ute: spillerens driverlengde er ikke koblet til TrackMan her.
 */

export type DgSpillerSide = "spiller" | "innspill" | "forslag";

const nb = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric" });
const dato = (d: Date | string | null | undefined) => (d ? nb.format(new Date(d)) : "—");
const sg = (v: number | null | undefined) => formaterFortegn(v, 1);
const tall = (v: number | null | undefined, d = 1) => formaterTall(v, d, true);
const mono = { fontFamily: TN.font.mono, fontSize: 18 } as const;

function adresse(side: DgSpillerSide, v: DgSpillerVisning) {
  const p = new URLSearchParams({ side });
  if (v.spiller) p.set("spiller", v.spiller.id);
  if (v.proff) p.set("pro", String(v.proff.dgId));
  return `/team-norway/datagolf?${p.toString()}`;
}

function Undermeny({ aktiv, v }: { aktiv: DgSpillerSide; v: DgSpillerVisning }) {
  const valg: [DgSpillerSide, string][] = [["spiller", "Spiller mot proff"], ["innspill", "Innspill-tak"], ["forslag", "Fra funn til forslag"]];
  return <TnFilterknapper etikett="Spiller mot proff" valg={valg.map(([id, label]) => ({ href: adresse(id, v), label, aktiv: id === aktiv }))} />;
}

function Velger({ side, v }: { side: DgSpillerSide; v: DgSpillerVisning }) {
  const felt = { minHeight: 44, padding: "0 12px", border: `1px solid ${TN.ink200}`, borderRadius: TN.radius.sm, background: TN.white, font: "inherit", minWidth: 0, width: "100%" } as const;
  return (
    <form action="/team-norway/datagolf" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", alignItems: "end" }}>
      <input type="hidden" name="side" value={side} />
      <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 700 }}>Spiller
        <select style={felt} name="spiller" defaultValue={v.spiller?.id ?? ""}>
          <option value="">Velg spiller</option>
          {v.spillere.map((s) => <option key={s.id} value={s.id}>{s.navn}</option>)}
        </select>
      </label>
      <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 700 }}>Proff
        <select style={felt} name="pro" defaultValue={v.proff ? String(v.proff.dgId) : ""}>
          {v.proffer.map((p) => <option key={p.dgId} value={p.dgId}>{p.navn}{p.norsk ? " (norsk)" : ""}</option>)}
        </select>
      </label>
      <button type="submit" style={{ minHeight: 44, border: `1px solid ${TN.navy900}`, background: TN.navy900, color: TN.white, fontWeight: 700, fontFamily: "inherit", borderRadius: TN.radius.sm, cursor: "pointer" }}>Vis</button>
    </form>
  );
}

function Hode({ side, v, tittel, ingress, faner }: { side: DgSpillerSide; v: DgSpillerVisning; tittel: string; ingress: string; faner: ReactNode }) {
  return (
    <>
      <TnSkjermhode overlinje={`Analyse · Data Golf${v.spiller && v.proff ? ` · ${v.spiller.navn} mot ${v.proff.navn}` : ""}`} tittel={tittel} ingress={ingress} />
      {faner}
      <Undermeny aktiv={side} v={v} />
      <Velger side={side} v={v} />
    </>
  );
}

function Tomt({ v }: { v: DgSpillerVisning }) {
  if (!v.proff) return <TnFlate><TnMangler>Ingen Data Golf-tall ennå. Proff-tallene hentes ukentlig.</TnMangler></TnFlate>;
  if (v.spillere.length === 0) return <TnFlate><TnMangler>Ingen spillere har delt PlayerHQ med deg ennå. Bare spillere som har delt, kan velges.</TnMangler></TnFlate>;
  return <TnFlate><TnMangler>Velg en spiller. Bare spillere som har delt PlayerHQ med deg vises i lista.</TnMangler></TnFlate>;
}

export function TnDgSpillerSide({ side, v, faner }: { side: DgSpillerSide; v: DgSpillerVisning; faner: ReactNode }) {
  if (side === "innspill") return <Innspill v={v} faner={faner} />;
  if (side === "forslag") return <Forslag v={v} faner={faner} />;
  return <SpillerMotProff v={v} faner={faner} />;
}

function SpillerMotProff({ v, faner }: { v: DgSpillerVisning; faner: ReactNode }) {
  const g = v.gap;
  return (
    <>
      <Hode side="spiller" v={v} faner={faner} tittel="Spiller mot proff" ingress="Gap per område i slag per runde. Spillerens tall er estimat, proffens er modell." />
      {!v.spiller || !v.proff || !g ? <Tomt v={v} /> : (
        <>
          <TnHelt
            etikett="Gap per område"
            venstre={
              <>
                <TnHeltSporsmaal>Hvor langt unna er {v.spiller.navn}, og hvor?</TnHeltSporsmaal>
                <TnHeltTall verdi={sg(g.samlet.gap)}>slag per runde mot {v.proff.navn}, samlet (estimat)</TnHeltTall>
                <TnHeltTekst>{g.storst ? `Størst gap i ${g.storst.label.toLowerCase()}.` : g.antallRunder === 0 ? "Ingen runder med SG ennå." : "Ingen områder med gap."}</TnHeltTekst>
              </>
            }
            hoyre={<TnHeltTellere tall={[{ verdi: g.antallRunder, tekst: "runder med SG" }, { verdi: v.proff.dgRang ?? "—", tekst: "DG-rang" }]} />}
          />
          <section style={{ display: "grid", gap: 12 }}>
            <TnFlatehode tittel="Gap per område" merknad="Spiller · proff · gap" />
            <TnFlate style={{ paddingBlock: 4 }}>
              {[...g.rader, g.samlet].map((r) => (
                <TnListerad key={r.key} tittel={r.label}
                  tekst={`${v.spiller!.navn} ${sg(r.spiller.verdi)} (${r.spiller.antall} r) · ${v.proff!.navn} ${sg(r.proff)}`}
                  hoyre={<span style={mono}>{sg(r.gap)}</span>} />
              ))}
            </TnFlate>
            <TnFotnote>
              {v.spiller.navn}: {g.antallRunder} runder, {dato(g.fra)}–{dato(g.til)}, SG etter Broadie <TnPille>Estimat</TnPille>. {v.proff.navn}: Data Golfs ferdighetsmodell {dato(v.proff.asOf)} <TnPille>Modell</TnPille>. To ulike referanser; gapet er en pekepinn, ikke et målt tall.
            </TnFotnote>
          </section>
          <section style={{ display: "grid", gap: 12 }}>
            <TnFlatehode tittel="Målinger" merknad={v.proff.sesong ? `${v.proff.navn}: ${v.proff.sesong.aar} · ${v.proff.sesong.tour.toUpperCase()}` : "Ingen sesongtall for proffen"} />
            <TnFlate style={{ paddingBlock: 4 }}>
              {v.maalinger.map((m) => (
                <TnListerad key={m.label} tittel={m.label}
                  tekst={`${v.spiller!.navn} ${maal(m.spiller, m.enhet)} (${m.spillerAntall} r) · ${v.proff!.navn} ${maal(m.proff, m.enhet)}${m.proffAntall ? ` (${m.proffAntall} r)` : ""}`}
                  hoyre={<span style={mono}>{m.enhet === "slag" || m.spiller == null || m.proff == null ? "—" : formaterFortegn(m.spiller - m.proff, m.enhet === "%" ? 0 : 1)}</span>} />
              ))}
            </TnFlate>
            <TnFotnote>Snittscore spilt på ulike baner sammenlignes ikke som justert nivågap. Hver måling har sitt eget datagrunnlag; «—» betyr at tallet mangler.</TnFotnote>
          </section>
          <TnFlate>
            <b style={{ fontSize: 15 }}>Neste steg</b>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
              <TnTekstlenke href={adresse("innspill", v)}>Se innspill per avstand</TnTekstlenke>
              <TnTekstlenke href={adresse("forslag", v)}>Lag forslag til {v.spiller.navn}</TnTekstlenke>
            </div>
            <TnMangler>Spilleren ser aldri denne sammenligningen. Et forslag går til spillerens Workbench; spilleren godtar selv.</TnMangler>
          </TnFlate>
        </>
      )}
    </>
  );
}

function maal(v: number | null, enhet: "slag" | "%" | "putt") {
  if (v == null) return "—";
  return enhet === "%" ? `${tall(v, 0)} %` : tall(v, 1);
}

function InnspillRader({ rader, v }: { rader: InnspillRad[]; v: DgSpillerVisning }) {
  return (
    <TnFlate style={{ paddingBlock: 4 }}>
      {rader.map((r) => (
        <TnListerad key={r.id} tittel={`${r.etikett} · ${r.lie === "fairway" ? "Fairway" : "Rough"}`}
          tekst={`${v.proff!.navn} ${r.proffMeter == null ? "—" : `${tall(r.proffMeter)} m`} · ${v.spiller!.navn} ${r.spillerMeter == null ? "—" : `${tall(r.spillerMeter)} m`} (${r.spillerSlag} slag)`}
          hoyre={<span style={mono}>{r.gap == null ? "—" : `${formaterFortegn(r.gap, 1)} m`}</span>} />
      ))}
    </TnFlate>
  );
}

const idagOslo = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());

function Innspill({ v, faner }: { v: DgSpillerVisning; faner: ReactNode }) {
  const funn = dgFunn(v.gap, v.innspill);
  return (
    <>
      <Hode side="innspill" v={v} faner={faner} tittel="Innspill-tak" ingress="Proffens nærhet til hullet per avstand og leie, mot spillerens registrerte innspill." />
      {!v.spiller || !v.proff ? <Tomt v={v} /> : (
        <>
          <section style={{ display: "grid", gap: 12 }}>
            <TnFlatehode tittel="Per avstand" merknad="Nærhet i meter · gap" />
            <InnspillRader rader={v.innspill} v={v} />
            <TnFotnote>
              {v.proff.navn}: justert nærhet, Data Golf {dato(v.proff.asOf)} <TnPille>Modell</TnPille>. {v.spiller.navn}: snitt av registrerte innspill fra samme avstand, ikke justert for vanskelighet. «—» når spilleren har under 10 slag fra avstanden.
            </TnFotnote>
          </section>
          {funn?.band && funn.maalMeter != null ? (
            <section style={{ display: "grid", gap: 12 }}>
              <TnFlatehode tittel="Lag øvelse" merknad={`${tall(funn.maalMeter)} meter fra hullet`} />
              <DgOvelseSkjema tema="tn" organisasjon="TEAM_NORWAY" spillerId={v.spiller.id} spillerNavn={v.spiller.navn}
                rad={funn.band} maalMeter={funn.maalMeter} standardDato={nesteMandag(idagOslo())} />
              <TnFotnote>Målet er proffens justerte nærhet. Spilleren ser målet i meter, ikke proffen. Måles med TrackMan eller for hånd.</TnFotnote>
            </section>
          ) : <TnFlate><TnMangler>Proffen har ingen innspillsdata, så det finnes ikke noe mål å lage øvelse fra.</TnMangler></TnFlate>}
        </>
      )}
    </>
  );
}

const STATUS: Record<string, { tekst: string; tone: "green" | "red" | "nøytral" }> = {
  PENDING: { tekst: "Venter på spiller", tone: "nøytral" },
  ACCEPTED: { tekst: "Lagt inn", tone: "green" },
  REJECTED: { tekst: "Avvist", tone: "nøytral" },
  CONFLICT: { tekst: "Konflikt", tone: "red" },
};

function Forslag({ v, faner }: { v: DgSpillerVisning; faner: ReactNode }) {
  const funn = dgFunn(v.gap, v.innspill);
  const omr = funn?.omraade;
  return (
    <>
      <Hode side="forslag" v={v} faner={faner} tittel="Fra funn til forslag" ingress="Funnet blir en målsetning og et planforslag spilleren godtar. Team Norway foreslår, skriver aldri direkte." />
      {!v.spiller || !v.proff ? <Tomt v={v} /> : !funn ? (
        <TnFlate><TnMangler>Ingen funn ennå: spilleren har ingen runder med SG, og proffen har ingen innspillsdata.</TnMangler></TnFlate>
      ) : (
        <>
          <TnFlate>
            <b style={{ fontSize: 15 }}>{omr ? `${omr.label}: ${sg(omr.gap)} slag per runde mot ${v.proff.navn}` : "Innspill"}</b>
            <TnMangler>
              {funn.band ? `Størst gap ${funn.band.etikett.split(" · ")[1]} fra ${funn.band.lie}: ${funn.band.spillerMeter == null ? "—" : `${tall(funn.band.spillerMeter)} m`} mot ${tall(funn.band.proffMeter)} m. ` : ""}
              Kilde: {v.gap?.antallRunder ?? 0} runder og Data Golf {dato(v.proff.asOf)}.
            </TnMangler>
          </TnFlate>
          <section style={{ display: "grid", gap: 12 }}>
            <TnFlatehode tittel="Målsetning og økter" merknad={funn.maalsetning} />
            <DgPlanSkjema tema="tn" organisasjon="TEAM_NORWAY" spillerId={v.spiller.id} spillerNavn={v.spiller.navn}
              tittel={funn.tittel} maalsetning={funn.maalsetning} fraMandag={nesteMandag(idagOslo())} />
          </section>
          <section style={{ display: "grid", gap: 12 }}>
            <TnFlatehode tittel="Forslag fra deg" merknad="Siste fem" />
            {v.forslag.length === 0 ? <TnFlate><TnMangler>Ingen forslag sendt til {v.spiller.navn} ennå.</TnMangler></TnFlate> : (
              <TnFlate style={{ paddingBlock: 4 }}>
                {v.forslag.map((f) => {
                  const s = STATUS[f.status] ?? { tekst: f.status, tone: "nøytral" as const };
                  return <TnListerad key={f.id} tittel={f.okter ? `${f.okter} økter` : "Én økt"} tekst={`Sendt ${dato(f.opprettet)}`} hoyre={<TnPille tone={s.tone}>{s.tekst}</TnPille>} />;
                })}
              </TnFlate>
            )}
          </section>
        </>
      )}
    </>
  );
}
