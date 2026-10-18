"use client";

import React from "react";
import Link from "next/link";
import { DgOvelseSkjema, DgPlanSkjema } from "@/components/datagolf/DgForslagSkjema";
import { WangTomTilstand } from "./WangIkkeKoblet";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import { dgFunn, nesteMandag } from "@/lib/datagolf/spiller-mot-proff";
import type { DgSpillerVisning } from "@/lib/datagolf/spiller-mot-proff-data";
import type { WangDgElevSide } from "@/app/team-wang/_data/wang-datagolf-visning";

/**
 * DG-05 Elev mot proff, DG-06 Innspill-tak og DG-07 Fra funn til forslag i WANG (Konkurranse › Data Golf).
 * Fasit: docs/design-system/utkast-wang/datagolf.html og utkast-agencyos/datagolf.html.
 * Bare for kanSeDataGolf (siden og hentDgSpillerVisning). Elevens tall leses bare når eleven har delt
 * med treneren (medWangElevData). WANG foreslår, eleven bestemmer: alt går som forslag til elevens Workbench.
 *
 * Avvik: tour-referansen (PgaApproachDistance) og «Gruppas øvelsesbank» er ikke med. «Driver» er ute:
 * elevens driverlengde er ikke koblet til TrackMan her.
 */

const nb = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric" });
const dato = (d: Date | string | null | undefined) => (d ? nb.format(new Date(d)) : "—");
const sg = (v: number | null | undefined) => formaterFortegn(v, 1);
const tall = (v: number | null | undefined, d = 1) => formaterTall(v, d, true);

function href(side: WangDgElevSide, v: DgSpillerVisning) {
  const q = new URLSearchParams({ omraade: "konkurranse", fane: `dg-${side}` });
  if (v.spiller) q.set("spiller", v.spiller.id);
  if (v.proff) q.set("pro", String(v.proff.dgId));
  return `/team-wang/coach?${q.toString()}`;
}

const UNDER: [WangDgElevSide, string][] = [["spiller", "Elev mot proff"], ["innspill", "Innspill-tak"], ["forslag", "Fra funn til forslag"]];

function Velger({ side, v }: { side: WangDgElevSide; v: DgSpillerVisning }) {
  return (
    <>
      <div className="wg-filter wg-dg-chips" role="group" aria-label="Elev mot proff">
        {UNDER.map(([id, t]) => (
          <Link key={id} href={href(id, v)} className={`wg-chip${id === side ? " wg-chip-pa" : ""}`} aria-current={id === side ? "page" : undefined}>{t}</Link>
        ))}
      </div>
      <form className="wg-kort wg-fyll wg-dg-filter" action="/team-wang/coach">
        <input type="hidden" name="omraade" value="konkurranse" />
        <input type="hidden" name="fane" value={`dg-${side}`} />
        <label className="wg-lbl">
          Elev
          <select className="wg-field" name="spiller" defaultValue={v.spiller?.id ?? ""}>
            <option value="">Velg elev</option>
            {v.spillere.map((s) => <option key={s.id} value={s.id}>{s.navn}</option>)}
          </select>
        </label>
        <label className="wg-lbl">
          Proff
          <select className="wg-field" name="pro" defaultValue={v.proff ? String(v.proff.dgId) : ""}>
            {v.proffer.map((p) => <option key={p.dgId} value={p.dgId}>{p.navn}{p.norsk ? " (norsk)" : ""}</option>)}
          </select>
        </label>
        <button type="submit" className="wg-btn wg-btn-primary">Vis</button>
      </form>
    </>
  );
}

function Tomt({ v }: { v: DgSpillerVisning }) {
  if (!v.proff) return <WangTomTilstand tittel="Ingen Data Golf-tall ennå" tekst="Proff-tallene hentes ukentlig." />;
  if (v.spillere.length === 0) return <WangTomTilstand tittel="Ingen elever har delt med deg" tekst="Bare elever som har delt PlayerHQ med deg kan velges." />;
  return <WangTomTilstand tittel="Velg en elev" tekst="Bare elever som har delt PlayerHQ med deg vises i lista." />;
}

function Rad({ tittel, tekst, verdi }: { tittel: string; tekst: string; verdi: string }) {
  return (
    <div className="wg-rad">
      <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <b>{tittel}</b>
        <span className="wg-kilde">{tekst}</span>
      </span>
      <span className="wg-tall">{verdi}</span>
    </div>
  );
}

function Seksjon({ id, tittel, merknad, children }: { id: string; tittel: string; merknad?: string; children: React.ReactNode }) {
  return (
    <section className="wg-seksjon" aria-labelledby={id}>
      <div className="wg-sek-topp">
        <h2 id={id}>{tittel}</h2>
        {merknad ? <span className="wg-kilde">{merknad}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function WangDataGolfElev({ side, v, idag, hode }: { side: WangDgElevSide; v: DgSpillerVisning; idag: string; hode: (tittel: string, ingress: string) => React.ReactNode }) {
  const tittel = side === "innspill" ? "Innspill-tak" : side === "forslag" ? "Fra funn til forslag" : "Elev mot proff";
  const ingress = side === "innspill" ? "Proffens nærhet til hullet per avstand og leie, mot elevens registrerte innspill."
    : side === "forslag" ? "Funnet blir en målsetning og et planforslag. WANG foreslår, eleven bestemmer."
      : "Gap per område i slag per runde. Elevens tall er estimat, proffens er modell.";
  return (
    <>
      {hode(tittel, ingress)}
      <Velger side={side} v={v} />
      {!v.spiller || !v.proff ? <Tomt v={v} /> : side === "innspill" ? <Innspill v={v} idag={idag} /> : side === "forslag" ? <Forslag v={v} idag={idag} /> : <MotProff v={v} />}
    </>
  );
}

function MotProff({ v }: { v: DgSpillerVisning }) {
  const g = v.gap!;
  const e = v.spiller!.navn;
  const p = v.proff!;
  return (
    <>
      <section className="wg-kort wg-fyll wg-fylt-slag" aria-label="Gap samlet">
        <p className="wg-hoved">
          <strong>{sg(g.samlet.gap)}</strong>
          <span>slag per runde mot {p.navn}, samlet (estimat)</span>
        </p>
        <p className="wg-rad-info">
          <span>{g.storst ? `Størst gap i ${g.storst.label.toLowerCase()}` : g.antallRunder === 0 ? "Ingen runder med SG ennå" : "Ingen områder med gap"}</span>
          <span>Runder med SG <b>{g.antallRunder}</b></span>
          <span>DG-rang <b>{p.dgRang ?? "—"}</b></span>
        </p>
      </section>
      <div className="wg-to-kol">
        <Seksjon id="wg-dg-gap" tittel="Gap per område" merknad="Elev · proff · gap">
          <div className="wg-kort wg-rader">
            {[...g.rader, g.samlet].map((r) => (
              <Rad key={r.key} tittel={r.label} tekst={`${e} ${sg(r.spiller.verdi)} (${r.spiller.antall} r) · ${p.navn} ${sg(r.proff)}`} verdi={sg(r.gap)} />
            ))}
          </div>
          <p className="wg-kilde">
            {e}: {g.antallRunder} runder, {dato(g.fra)}–{dato(g.til)}, SG etter Broadie (estimat). {p.navn}: Data Golfs ferdighetsmodell {dato(p.asOf)} (modell). To ulike referanser; gapet er en pekepinn, ikke et målt tall.
          </p>
        </Seksjon>
        <Seksjon id="wg-dg-maal" tittel="Målinger" merknad={p.sesong ? `${p.navn}: ${p.sesong.aar} · ${p.sesong.tour.toUpperCase()}` : "Ingen sesongtall for proffen"}>
          <div className="wg-kort wg-rader">
            {v.maalinger.map((m) => (
              <Rad key={m.label} tittel={m.label}
                tekst={`${e} ${maal(m.spiller, m.enhet)} (${m.spillerAntall} r) · ${p.navn} ${maal(m.proff, m.enhet)}${m.proffAntall ? ` (${m.proffAntall} r)` : ""}`}
                verdi={m.enhet === "slag" || m.spiller == null || m.proff == null ? "—" : formaterFortegn(m.spiller - m.proff, m.enhet === "%" ? 0 : 1)} />
            ))}
          </div>
          <p className="wg-kilde">Snittscore spilt på ulike baner sammenlignes ikke som justert nivågap. «—» betyr at tallet mangler.</p>
        </Seksjon>
      </div>
      <Seksjon id="wg-dg-neste" tittel="Neste steg">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href={href("innspill", v)} className="wg-btn">Se innspill per avstand</Link>
          <Link href={href("forslag", v)} className="wg-btn">Lag forslag til {e}</Link>
        </div>
        <p className="wg-kilde">Eleven ser aldri denne sammenligningen. Et forslag går til elevens Workbench; eleven godtar selv.</p>
      </Seksjon>
    </>
  );
}

function maal(v: number | null, enhet: "slag" | "%" | "putt") {
  if (v == null) return "—";
  return enhet === "%" ? `${tall(v, 0)} %` : tall(v, 1);
}

function Innspill({ v, idag }: { v: DgSpillerVisning; idag: string }) {
  const e = v.spiller!;
  const p = v.proff!;
  const funn = dgFunn(v.gap, v.innspill);
  return (
    <div className="wg-to-kol">
      <Seksjon id="wg-dg-avstand" tittel="Per avstand" merknad="Nærhet i meter · gap">
        <div className="wg-kort wg-rader">
          {v.innspill.map((r) => (
            <Rad key={r.id} tittel={`${r.etikett} · ${r.lie === "fairway" ? "Fairway" : "Rough"}`}
              tekst={`${p.navn} ${r.proffMeter == null ? "—" : `${tall(r.proffMeter)} m`} · ${e.navn} ${r.spillerMeter == null ? "—" : `${tall(r.spillerMeter)} m`} (${r.spillerSlag} slag)`}
              verdi={r.gap == null ? "—" : `${formaterFortegn(r.gap, 1)} m`} />
          ))}
        </div>
        <p className="wg-kilde">
          {p.navn}: justert nærhet, Data Golf {dato(p.asOf)} (modell). {e.navn}: snitt av registrerte innspill fra samme avstand, ikke justert for vanskelighet. «—» når eleven har under 10 slag fra avstanden.
        </p>
      </Seksjon>
      {funn?.band && funn.maalMeter != null ? (
        <Seksjon id="wg-dg-ovelse" tittel="Lag øvelse" merknad={`${tall(funn.maalMeter)} meter fra hullet`}>
          <DgOvelseSkjema tema="wang" organisasjon="WANG" spillerId={e.id} spillerNavn={e.navn} rad={funn.band} maalMeter={funn.maalMeter} standardDato={nesteMandag(idag)} />
          <p className="wg-kilde">Målet er proffens justerte nærhet. Eleven ser målet i meter, ikke proffen.</p>
        </Seksjon>
      ) : (
        <WangTomTilstand tittel="Ingen innspillsdata" tekst="Proffen har ingen innspillsdata, så det finnes ikke noe mål å lage øvelse fra." />
      )}
    </div>
  );
}

const STATUS: Record<string, [string, string]> = {
  PENDING: ["Venter på elev", "wg-pille-vent"],
  ACCEPTED: ["Lagt inn", "wg-pille-ok"],
  REJECTED: ["Avvist", ""],
  CONFLICT: ["Konflikt", "wg-pille-haster"],
};

function Forslag({ v, idag }: { v: DgSpillerVisning; idag: string }) {
  const e = v.spiller!;
  const p = v.proff!;
  const funn = dgFunn(v.gap, v.innspill);
  if (!funn) return <WangTomTilstand tittel="Ingen funn ennå" tekst="Eleven har ingen runder med SG, og proffen har ingen innspillsdata." />;
  const omr = funn.omraade;
  return (
    <div className="wg-to-kol">
      <div>
        <section className="wg-kort wg-fyll" aria-label="Funnet">
          <b>{omr ? `${omr.label}: ${sg(omr.gap)} slag per runde mot ${p.navn}` : "Innspill"}</b>
          <p className="wg-kilde">
            {funn.band ? `Størst gap ${funn.band.etikett.split(" · ")[1]} fra ${funn.band.lie}: ${funn.band.spillerMeter == null ? "—" : `${tall(funn.band.spillerMeter)} m`} mot ${tall(funn.band.proffMeter)} m. ` : ""}
            Kilde: {v.gap?.antallRunder ?? 0} runder og Data Golf {dato(p.asOf)}.
          </p>
        </section>
        <Seksjon id="wg-dg-plan" tittel="Målsetning og økter" merknad={funn.maalsetning}>
          <DgPlanSkjema tema="wang" organisasjon="WANG" spillerId={e.id} spillerNavn={e.navn} tittel={funn.tittel} maalsetning={funn.maalsetning} fraMandag={nesteMandag(idag)} />
        </Seksjon>
      </div>
      <Seksjon id="wg-dg-sendt" tittel="Forslag fra deg" merknad="Siste fem">
        {v.forslag.length === 0 ? <p className="wg-baand-tom">Ingen forslag sendt til {e.navn} ennå.</p> : (
          <div className="wg-kort wg-rader">
            {v.forslag.map((f) => {
              const [t, k] = STATUS[f.status] ?? [f.status, ""];
              return (
                <div key={f.id} className="wg-rad">
                  <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
                    <b>{f.okter ? `${f.okter} økter` : "Én økt"}</b>
                    <span className="wg-kilde">Sendt {dato(f.opprettet)}</span>
                  </span>
                  <span className={`wg-pille ${k}`}><i />{t}</span>
                </div>
              );
            })}
          </div>
        )}
      </Seksjon>
    </div>
  );
}
