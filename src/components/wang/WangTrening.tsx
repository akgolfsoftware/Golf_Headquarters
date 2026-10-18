"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WangTomTilstand } from "./WangIkkeKoblet";
import {
  AKSER,
  AKSE_NAVN,
  WangBaand,
  WangElevrad,
  WangFaner,
  WangHelt,
  WangSmaaTall,
  WangTilbake,
  WangTopp,
  dagerMellom,
  visMinutter,
  wangHref,
  type WangAkse,
} from "./wang-felles";
import {
  visDato,
  type WangTrenerData,
  type WangTrenerPeriode,
  type WangTrenerUkeOkt,
} from "@/app/team-wang/_data/wang-trener-data";

interface WangTreningProps {
  data: WangTrenerData;
  /** Underside: oversikt · arsplan · periode · uke · nyokt. */
  aktivFane?: string;
  /** Perioden periodeskjemaet gjelder. Uten id er det en ny periode. */
  id?: string;
  /** Beholdt for kallere fra før; fanene er lenker. */
  onFaneEndret?: (fane: string) => void;
}

const FANER = [
  { id: "oversikt", tittel: "Oversikt" },
  { id: "arsplan", tittel: "Årsplan" },
  { id: "uke", tittel: "Uka" },
];

const PERIODETYPER = [
  ["GRUNN", "Grunnperiode"],
  ["SPESIAL", "Spesialperiode"],
  ["TURNERING", "Turneringsperiode"],
  ["EVALUERING", "Evaluering"],
  ["FERIE", "Ferie"],
  ["RESTITUSJON", "Restitusjon"],
] as const;

const OMRAADER: Record<WangAkse, string[]> = {
  FYS: ["Styrke", "Hurtighet", "Mobilitet", "Kondisjon"],
  TEK: ["Full sving", "Kort spill", "Putting"],
  SLAG: ["Utslag", "Innspill", "Nærspill", "Bunker", "Putting"],
  SPILL: ["Banespill", "Strategi", "Spill i press"],
  TURN: ["Rutiner", "Mental forberedelse", "Turneringsspill"],
};

/**
 * Pakke 3 Trening for trener og sportssjef: Oversikt (WANG-42), Årsplan, Periodeskjema, Uka og Ny økt.
 * Fasit: docs/design-system/utkast-wang/trening.html (utkast 2, retning B, godkjent av Anders 16.10.2026)
 * og felles/wang.css §Nærmere wang.no. Bare ekte gruppedata (byggWangTrenerData).
 * Avvik:
 *   - Gjennomført tid mot plan, morgentrening, fravær, per akse og uke for uke viser «—»: elevenes plan deles
 *     ikke med WANG (delingen gjelder bare tester), og oppmøte lagres ikke ennå.
 *   - Per elev: alle elevene står i «Ikke delt» av samme grunn. Trenger deg og Følger planen er tomme.
 *   - Periodeskjemaet viser periodens type, uker, fokus og ukevolum fra basen. Timer per akse finnes ikke på
 *     perioden (§PLANNIVÅENE punkt 1), og lagring fra trenerflaten er ikke koblet. Lagre er sperret.
 *   - Uka viser gruppas økter fra kalenderen uten akse, og «lagt inn mot fordelt» viser «—». Bare denne uka.
 *   - Ny økt: skjemaet er tegnet, men gruppeøkter kan ikke lagres herfra ennå, og øvelsesbanken er ikke koblet.
 */
export function WangTrening({ data, aktivFane, id }: WangTreningProps) {
  if (aktivFane === "arsplan") return <Arsplan data={data} />;
  if (aktivFane === "periode") return <Periodeskjema data={data} periode={data.perioder.find((p) => p.id === id)} />;
  if (aktivFane === "uke") return <Uka data={data} />;
  if (aktivFane === "nyokt") return <NyOkt data={data} />;
  return <Oversikt data={data} />;
}

// ---------------------------------------------------------------------------
// Oversikt (WANG-42)
// ---------------------------------------------------------------------------

function Oversikt({ data }: { data: WangTrenerData }) {
  const ukeNaa = Number(data.ukeTekst.match(/Uke (\d+)/)?.[1] ?? 0);
  const fireUker = ukeNaa > 4 ? `uke ${ukeNaa - 4}–${ukeNaa - 1}` : "siste fire uker";

  return (
    <>
      <WangTopp dato={`${data.gruppeNavn} · ${fireUker}`} tittel="Trening">
        <WangFaner omraade="trening" aktiv="oversikt" faner={FANER} etikett="Trening" />
      </WangTopp>

      <WangHelt
        etikett="Etterlevelse"
        merke="Mål 80 % av planen"
        tall="—"
        tekst="av planen gjennomført siste fire uker"
        forklar="Gjennomført tid mot plan kan ikke regnes ut ennå: elevenes plan deles ikke med WANG."
        knapp={{ tekst: "Se uka", href: wangHref("trening", "uke") }}
        bilde="/images/playerhq/spill-bane.jpg"
      />

      <WangSmaaTall
        tall={[
          { verdi: "—", tekst: "Gjennomført per elev" },
          { verdi: "—", tekst: "Morgen\u00ADtrening" },
          { verdi: "—", tekst: "Fravær meldt" },
        ]}
      />

      <div className="wg-to-kol">
        <section className="wg-seksjon" aria-labelledby="wg-akse-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-akse-tittel">Per akse</h2>
            <span className="wg-kilde">Gjennomført mot planlagt</span>
          </div>
          <div className="wg-kort wg-fyll" style={{ gap: 0 }}>
            {AKSER.map((a) => (
              <div key={a} className="wg-akserad">
                <span className={`wg-akse wg-akse-${a.toLowerCase()}`}>{a}</span>
                <span className="wg-stolpe" aria-hidden />
                <span className="wg-tall">
                  —<span>av —</span>
                </span>
              </div>
            ))}
            <p className="wg-kilde" style={{ marginTop: 10 }}>Fylles når elevene deler planen sin med WANG.</p>
          </div>
        </section>
        <section className="wg-seksjon" aria-labelledby="wg-uke-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-uke-tittel">Uke for uke</h2>
            <span className="wg-kilde">{fireUker}</span>
          </div>
          <WangTomTilstand
            tittel="Ingen tid mot plan ennå"
            tekst="Grafen viser gjennomført mot plan per uke, med mål 80 %. Bare økter med passert sluttid teller."
          />
        </section>
      </div>

      <section className="wg-seksjon" aria-labelledby="wg-elev-tittel">
        <div className="wg-sek-topp">
          <h2 id="wg-elev-tittel">Per elev</h2>
          <span className="wg-kilde">Gjennomført mot plan siste fire uker · streken er 80 %</span>
        </div>
        {data.elever.length === 0 ? (
          <WangTomTilstand tittel="Ingen elever i gruppa" tekst="Elevene vises her når de er lagt inn i gruppa." />
        ) : (
          <div className="wg-baand wg-baand-kol">
            <WangBaand
              type="trenger"
              tittel="Trenger deg"
              tekst="Under 80 % av planen, eller borte fra morgentreningen."
              antall={0}
              tomTekst="Ingen elever å vise før planen er delt."
            />
            <WangBaand
              type="folger"
              tittel="Følger planen"
              tekst="80 % eller mer. Lavest først."
              antall={0}
              tomTekst="Ingen elever å vise før planen er delt."
            />
            <WangBaand
              type="ikke"
              tittel="Ikke delt"
              tekst="Planen deles ikke med WANG ennå. Du ser bare det som ligger i gruppas kalender."
              antall={data.elever.length}
              tomTekst=""
            >
              {data.elever.map((e) => (
                <WangElevrad
                  key={e.id}
                  type="ikke"
                  navn={e.navn}
                  linje="Plan ikke delt"
                  verdi="—"
                  prosent={null}
                  href={`/team-wang/coach/iup/${e.id}`}
                />
              ))}
            </WangBaand>
          </div>
        )}
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Årsplan
// ---------------------------------------------------------------------------

function hendelserIPerioden(data: WangTrenerData, p: WangTrenerPeriode): string[] {
  return [...data.testdager, ...data.samlinger, ...data.turneringer]
    .filter((h) => h.startIso >= p.startIso && h.startIso <= p.endIso)
    .sort((a, b) => a.startIso.localeCompare(b.startIso))
    .map((h) => `${h.tittel} ${visDato(h.startIso).slice(0, 5)}`);
}

const PERIODE_KANT: Record<string, string> = {
  GRUNN: "var(--wg-n400)",
  SPESIAL: "var(--wg-n300)",
  TURNERING: "var(--wg-navy)",
  EVALUERING: "var(--wg-gul)",
  TESTUKE: "var(--wg-gul)",
  RESTITUSJON: "var(--wg-mint)",
};

function ukevol(p: WangTrenerPeriode): string {
  if (p.ukevolMin == null && p.ukevolMax == null) return "—";
  if (p.ukevolMin != null && p.ukevolMax != null && p.ukevolMin !== p.ukevolMax) {
    return `${visMinutter(p.ukevolMin)}–${visMinutter(p.ukevolMax)}`;
  }
  return visMinutter((p.ukevolMin ?? p.ukevolMax) as number);
}

function Arsplan({ data }: { data: WangTrenerData }) {
  const perioder = data.perioder;
  const naa = perioder.find((p) => p.status === "naa");
  const forste = perioder[0];
  const siste = perioder[perioder.length - 1];
  const typer = [...new Map(perioder.map((p) => [p.fase, p.navn])).entries()];

  return (
    <>
      <WangTopp
        dato={forste && siste ? `${data.gruppeNavn} · ${visDato(forste.startIso)}–${visDato(siste.endIso)}` : data.gruppeNavn}
        tittel="Årsplan"
        ingress="Gruppas plan. Elevene arver den. Det eleven har endret selv, står som «Egen» hos eleven."
      >
        <WangFaner omraade="trening" aktiv="arsplan" faner={FANER} etikett="Trening" />
      </WangTopp>

      {perioder.length === 0 ? (
        <WangTomTilstand
          tittel="Ingen perioder"
          tekst="Gruppa har ingen årsplan med perioder ennå. Forslaget er skoleåret august–juni."
        />
      ) : (
        <>
          <div className="wg-kort wg-fyll">
            <div className="wg-periodebaand" role="img" aria-label="Periodene i årsplanen">
              {perioder.map((p) => {
                const dager = Math.max(1, dagerMellom(p.startIso, p.endIso) + 1);
                return (
                  <span key={p.id} className={`wg-p-${p.fase}`} style={{ flex: dager }} title={p.navn}>
                    {dager >= 45 ? p.navn.replace("periode", "") : ""}
                  </span>
                );
              })}
            </div>
            <div className="wg-lg-rad">
              {typer.map(([fase, navn]) => (
                <span key={fase} className="wg-lg">
                  <i className={`wg-p-${fase}`} />
                  {navn}
                </span>
              ))}
            </div>
            <p className="wg-kilde">
              {naa ? `Nå: uke ${naa.fraUke === naa.tilUke ? naa.fraUke : `${naa.fraUke}–${naa.tilUke}`}, ${naa.navn}.` : "Ingen periode gjelder i dag."}
            </p>
          </div>

          <section className="wg-seksjon" aria-labelledby="wg-perioder-tittel">
            <div className="wg-sek-topp">
              <h2 id="wg-perioder-tittel">Periodene</h2>
              <Link href={wangHref("trening", "periode")} className="wg-btn wg-btn-primary">
                Ny periode
              </Link>
            </div>
            <div className="wg-perioder">
              {perioder.map((p) => {
                const hendelser = hendelserIPerioden(data, p);
                const uker = Math.round((dagerMellom(p.startIso, p.endIso) + 1) / 7);
                return (
                  <Link
                    key={p.id}
                    href={wangHref("trening", "periode", p.id)}
                    className={`wg-periode ${p.status === "naa" ? "wg-periode-naa" : ""}`}
                    style={{ borderLeftColor: PERIODE_KANT[p.fase] ?? "var(--wg-n200)" }}
                  >
                    <div className="wg-periode-topp">
                      <b>{p.navn}</b>
                      <span>
                        Uke {p.fraUke}–{p.tilUke} · {uker} {uker === 1 ? "uke" : "uker"}
                      </span>
                    </div>
                    <p className="wg-forklar" style={{ fontSize: 15 }}>{p.fokus || "Ingen fokus skrevet."}</p>
                    <p className="wg-kilde">
                      {visDato(p.startIso)}–{visDato(p.endIso)} · {ukevol(p)} per uke
                      {p.status === "naa" ? " · nå" : ""}
                    </p>
                    {hendelser.length > 0 ? (
                      <div className="wg-hendelser">
                        {hendelser.map((h) => (
                          <span key={h} className="wg-hend">{h}</span>
                        ))}
                      </div>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Periodeskjema
// ---------------------------------------------------------------------------

function Periodeskjema({ data, periode }: { data: WangTrenerData; periode?: WangTrenerPeriode }) {
  const [timer, setTimer] = useState<Record<WangAkse, { vanlig: string; lett: string }>>(
    () => Object.fromEntries(AKSER.map((a) => [a, { vanlig: "", lett: "" }])) as Record<WangAkse, { vanlig: string; lett: string }>,
  );
  const [lette, setLette] = useState<"ingen" | "fjerde" | "tredje">("ingen");
  const sum = AKSER.reduce((s, a) => s + (Number.parseInt(timer[a].vanlig, 10) || 0), 0);

  return (
    <>
      <WangTilbake href={wangHref("trening", "arsplan")} tekst="Årsplan" />
      <WangTopp dato={`${data.gruppeNavn} · årsplan`} tittel={periode ? periode.navn : "Ny periode"} />

      <form className="wg-to-kol" onSubmit={(e) => e.preventDefault()}>
        <div className="wg-kort wg-fyll">
          <label className="wg-lbl">
            Type
            <select className="wg-field" defaultValue={periode?.fase ?? "GRUNN"}>
              {PERIODETYPER.map(([kode, navn]) => (
                <option key={kode} value={kode}>{navn}</option>
              ))}
            </select>
          </label>
          <div className="wg-to-felt">
            <label className="wg-lbl">
              Fra uke
              <input className="wg-field" inputMode="numeric" defaultValue={periode ? String(periode.fraUke) : ""} />
            </label>
            <label className="wg-lbl">
              Til uke
              <input className="wg-field" inputMode="numeric" defaultValue={periode ? String(periode.tilUke) : ""} />
            </label>
          </div>
          <label className="wg-lbl">
            Målsetning for perioden
            <textarea className="wg-field" rows={3} defaultValue={periode?.fokus ?? ""} />
          </label>
          <div className="wg-lbl" role="group" aria-label="Lette uker">
            Lette uker
            <div className="wg-valg">
              {([["ingen", "Ingen"], ["fjerde", "Hver 4. uke"], ["tredje", "Hver 3. uke"]] as const).map(([v, t]) => (
                <button key={v} type="button" aria-pressed={lette === v} onClick={() => setLette(v)}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="wg-kort wg-fyll">
          <b className="wg-undertittel">Timer per akse per uke</b>
          <div className="wg-timetabell">
            <div className="wg-t wg-t-hode">
              <span />
              <span>Vanlig uke</span>
              <span>Lett uke</span>
            </div>
            {AKSER.map((a) => (
              <div key={a} className="wg-t">
                <span className={`wg-akse wg-akse-${a.toLowerCase()}`}>{a}</span>
                {(["vanlig", "lett"] as const).map((k) => (
                  <input
                    key={k}
                    className="wg-field"
                    inputMode="numeric"
                    placeholder="—"
                    aria-label={`${AKSE_NAVN[a]} ${k === "vanlig" ? "vanlig" : "lett"} uke, minutter`}
                    value={timer[a][k]}
                    onChange={(e) => setTimer((t) => ({ ...t, [a]: { ...t[a], [k]: e.target.value.replace(/\D/g, "") } }))}
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="wg-kilde">
            {sum > 0 ? `Vanlig uke: ${visMinutter(sum)} per elev. ` : ""}
            Minutter. Ukevolum i basen i dag: {periode ? ukevol(periode) : "—"}.
          </p>
        </div>
      </form>

      <div className="wg-knapper">
        <button type="button" className="wg-btn wg-btn-primary" disabled>Lagre perioden</button>
        <Link href={wangHref("trening", "arsplan")} className="wg-btn wg-btn-secondary">Avbryt</Link>
        {periode ? <button type="button" className="wg-btn wg-btn-fare" disabled>Slett perioden</button> : null}
      </div>
      <p className="wg-kilde">
        Perioden kan ikke lagres herfra ennå. Timer per akse finnes ikke på perioden i basen, og lagring skal oppdatere
        ukene fra og med denne uka, aldri uker som er gått. Ingenting er endret.
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Uka
// ---------------------------------------------------------------------------

function Uka({ data }: { data: WangTrenerData }) {
  const aktiv = data.perioder.find((p) => p.status === "naa");
  const dager = [...new Map(data.ukeOkter.map((o) => [o.datoIso, o.dag])).entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <WangTopp dato={`${data.gruppeNavn} · ${data.ukeTekst.toLowerCase()}${aktiv ? ` · ${aktiv.navn}` : ""}`} tittel="Uka">
        <WangFaner omraade="trening" aktiv="uke" faner={FANER} etikett="Trening" />
        <div className="wg-knapper">
          <Link href={wangHref("trening", "nyokt")} className="wg-btn wg-btn-primary">Ny økt</Link>
        </div>
      </WangTopp>

      <div className="wg-kort wg-fyll" style={{ gap: 0 }}>
        <b className="wg-undertittel" style={{ marginBottom: 6 }}>Lagt inn mot fordelt</b>
        {AKSER.map((a) => (
          <div key={a} className="wg-akserad">
            <span className={`wg-akse wg-akse-${a.toLowerCase()}`}>{a}</span>
            <span className="wg-stolpe" aria-hidden />
            <span className="wg-tall">
              —<span>av —</span>
            </span>
          </div>
        ))}
        <p className="wg-kilde" style={{ marginTop: 10 }}>
          Fordelt skal komme fra perioden{aktiv ? ` ${aktiv.navn}` : ""}, men perioden har ikke timer per akse ennå.
          Kalenderens økter har ingen akse. Forslag, ikke sperrer.
        </p>
      </div>

      {dager.length === 0 ? (
        <WangTomTilstand tittel="Ingen økter denne uka" tekst="Gruppas kalender har ingen økter denne uka." />
      ) : (
        <div className="wg-ukeplan">
          {dager.map(([datoIso, dag]) => {
            const iDag = datoIso === data.idagIso;
            return (
              <div key={datoIso} className={`wg-dagkol ${iDag ? "wg-dagkol-idag" : ""}`}>
                <h3>
                  <span>{dag} {visDato(datoIso).slice(0, 5)}</span>
                  {iDag ? <span>I dag</span> : null}
                </h3>
                {data.ukeOkter
                  .filter((o) => o.datoIso === datoIso)
                  .map((o) => (
                    <UkeOkt key={o.id} okt={o} iDag={iDag} />
                  ))}
                <Link href={wangHref("trening", "nyokt")} className="wg-leggtil">Legg til økt</Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function UkeOkt({ okt, iDag }: { okt: WangTrenerUkeOkt; iDag: boolean }) {
  return (
    <Link href={`/team-wang/coach?omraade=idag&fane=okt&okt=${encodeURIComponent(okt.id)}`} className="wg-okt wg-okt-lenke">
      <span className="wg-navn">{okt.tittel}</span>
      <span className="wg-okt-info">
        <span>{okt.tid}</span>
        <span>{okt.passert ? "Passert" : iDag ? "I dag" : "Planlagt"}</span>
        {okt.sted ? <span>{okt.sted}</span> : null}
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Ny økt
// ---------------------------------------------------------------------------

function NyOkt({ data }: { data: WangTrenerData }) {
  const [akse, setAkse] = useState<WangAkse>("SLAG");
  const [gjenta, setGjenta] = useState<"en" | "periode">("en");
  const steder = [...new Set([...data.fasteOkter, ...data.ukeOkter].map((o) => o.sted).filter((s): s is string => Boolean(s)))];

  return (
    <>
      <WangTilbake href={wangHref("trening", "uke")} tekst="Uka" />
      <WangTopp dato={`${data.gruppeNavn} · ${data.ukeTekst.split(" · ")[0].toLowerCase()}`} tittel="Ny økt" />

      <form className="wg-to-kol" onSubmit={(e) => e.preventDefault()}>
        <div className="wg-kort wg-fyll">
          <div className="wg-lbl" role="group" aria-label="Pyramiden">
            1 · Pyramiden
            <div className="wg-aksevalg">
              {AKSER.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`wg-akse-${a.toLowerCase()}`}
                  aria-pressed={akse === a}
                  onClick={() => setAkse(a)}
                >
                  {a}
                </button>
              ))}
            </div>
            <span className="wg-hjelp">{AKSE_NAVN[akse]}. Områdene under er for {akse}.</span>
          </div>
          <label className="wg-lbl">
            2 · Område
            <select className="wg-field" key={akse} defaultValue={OMRAADER[akse][0]}>
              {OMRAADER[akse].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="wg-lbl">
            Navn
            <input className="wg-field" placeholder="For eksempel Innspill 50–100 m" />
          </label>
          <div className="wg-to-felt">
            <label className="wg-lbl">
              Dato
              <input className="wg-field" type="date" defaultValue={data.idagIso} />
            </label>
            <label className="wg-lbl">
              Minutter
              <input className="wg-field" inputMode="numeric" placeholder="60" />
            </label>
          </div>
          <label className="wg-lbl">
            Sted
            <select className="wg-field" defaultValue="">
              <option value="">Velg sted</option>
              {steder.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <div className="wg-lbl" role="group" aria-label="Gjenta">
            Gjenta
            <div className="wg-valg wg-valg-to">
              <button type="button" aria-pressed={gjenta === "en"} onClick={() => setGjenta("en")}>Bare denne</button>
              <button type="button" aria-pressed={gjenta === "periode"} onClick={() => setGjenta("periode")}>Hver uke i perioden</button>
            </div>
          </div>
        </div>

        <div className="wg-kort wg-fyll">
          <b className="wg-undertittel">Øvelser</b>
          <WangTomTilstand
            tittel="Ingen øvelser lagt til"
            tekst="Øvelsesbanken er ikke koblet til trenerflaten ennå. Økta kan bare ha tid, sted og område."
          />
          <p className="wg-kilde">
            Økta skal legges i planen til alle {data.elever.length} elever i gruppa og telle med en gang i uka, måneden og
            perioden.
          </p>
        </div>
      </form>

      <div className="wg-knapper">
        <button type="button" className="wg-btn wg-btn-primary" disabled>Lagre økta</button>
        <Link href={wangHref("trening", "uke")} className="wg-btn wg-btn-secondary">Avbryt</Link>
      </div>
      <p className="wg-kilde">
        Gruppeøkter kan ikke lagres fra trenerflaten ennå. Ingenting er lagt inn, og elevene har ikke fått noe.
      </p>
    </>
  );
}

