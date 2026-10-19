"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WangTomTilstand } from "./WangIkkeKoblet";
import {
  WangBaand,
  WangElevrad,
  WangHelt,
  WangSmaaTall,
  WangTilbake,
  WangTopp,
  initialer,
  wangHref,
} from "./wang-felles";
import type { WangTrenerData } from "@/app/team-wang/_data/wang-trener-data";
import { TOM_TESTERDATA, type WangTesterData } from "@/app/team-wang/_data/wang-tester-visning";
import { TOM_PLANDATA, trengerDeg, visPct, type WangPlanData } from "@/app/team-wang/_data/wang-plan-visning";
import {
  TOM_ELEVINFO,
  UTEN_KLASSE,
  elevLinje,
  filtrerElever,
  klasserIGruppa,
  visHcp,
  type WangElevdata,
  type WangElevInfo,
  type WangFireukerssjekk,
} from "@/app/team-wang/_data/wang-elevdata-visning";
import { NIVA_NAVN, PROSESS_NAVN, desimal, fireukerOmraader, snitt } from "@/lib/iup/fireukerssjekk";

interface WangEleverProps {
  data: WangTrenerData;
  /** Testdelingen: hvem som deler testene med WANG, og egenførte resultater. */
  tester?: WangTesterData;
  /** Elevenes delte plan: etterlevelse og morgentrening, bare for elever som har delt. */
  plan?: WangPlanData;
  /** Klasse for alle elever; HCP og kategori bare for dem som har delt med treneren. */
  elevdata?: WangElevdata;
  /** Fireukerssjekken for eleven undersiden gjelder (bare på «sjekk»). */
  fireukerssjekk?: WangFireukerssjekk;
  /** Underside: liste · elev · sjekk · ikke-delt. */
  aktivFane?: string;
  /** Eleven undersiden gjelder. */
  id?: string;
  onFaneEndret?: (fane: string) => void;
}

const iupHref = (id: string) => `/team-wang/coach/iup/${id}`;

/**
 * Pakke 7 Elever for trener og sportssjef: Elevlista (WANG-07), Én elev (WANG-44), IUP, Fireukerssjekk (WANG-45),
 * Foreslå endring og Ikke delt.
 * Fasit: docs/design-system/utkast-wang/elever.html (utkast 2, retning B, godkjent av Anders 16.10.2026).
 * Bare ekte gruppedata og testdelingen (hentWangTesterData).
 * Avvik:
 *   - Etterlevelse og morgentrening leses fra elevens delte plan (W1, hentWangPlanData). Elever som ikke har delt
 *     planen, står i «Ikke delt» med «—». Morgentrening er gruppas økter i elevens plan, gjennomført mot planlagt.
 *   - IUP og Foreslå endring åpner den eksisterende IUP-siden (/team-wang/coach/iup/[elevId]), der forslagene lagres.
 *   - Fireukerssjekken er elevens leverte svar fra PlayerHQ (PH-IUP-01), bare når eleven har delt profilen med
 *     treneren (navngitt deling). Trenerens egen vurdering lagres ikke her ennå; den føres i IUP-samtalen.
 *   - Klasse kommer fra elevens profil (VG1–VG3, ført av coach/admin). HCP og kategori A–K vises bare for elever som
 *     har delt profilen med treneren, ellers «Ikke delt» (W2, nattkjøringen 18.10).
 */
export function WangElever({
  data,
  tester = TOM_TESTERDATA,
  plan = TOM_PLANDATA,
  elevdata = {},
  fireukerssjekk = { status: "ikke-delt" },
  aktivFane,
  id,
}: WangEleverProps) {
  const elev = id ? data.elever.find((e) => e.id === id) : undefined;
  if (aktivFane === "elev" || aktivFane === "sjekk") {
    if (!elev) {
      return (
        <>
          <WangTilbake href={wangHref("elever")} tekst="Elever" />
          <WangTomTilstand tittel="Fant ikke eleven" tekst="Eleven er ikke med i gruppa." />
        </>
      );
    }
    return aktivFane === "sjekk" ? (
      <Fireukerssjekk data={data} elev={elev} sjekk={fireukerssjekk} />
    ) : (
      <EnElev
        data={data}
        elev={elev}
        deler={tester.delerIder.includes(elev.id)}
        tester={tester}
        plan={plan}
        info={elevdata[elev.id] ?? TOM_ELEVINFO}
      />
    );
  }
  return <Elevlista data={data} tester={tester} plan={plan} elevdata={elevdata} />;
}

/** Linja under navnet: klasse og profil (W2), og plantallene når planen er delt (W1). */
function radLinje(info: WangElevInfo, tall: WangPlanData["perElev"][string] | undefined): string {
  if (!tall) return elevLinje(info);
  const plantekst =
    tall.etterlevelse.pct === null ? "ingen økter er forfalt" : `morgentrening ${visPct(tall.morgen)}`;
  return info.delt ? `${elevLinje(info)} · ${plantekst}` : `${info.klasse ?? "Klasse ikke satt"} · ${plantekst}`;
}

function Elevlista({
  data,
  tester,
  plan,
  elevdata,
}: {
  data: WangTrenerData;
  tester: WangTesterData;
  plan: WangPlanData;
  elevdata: WangElevdata;
}) {
  const [sok, setSok] = useState("");
  const [klasse, setKlasse] = useState("");
  const klasser = klasserIGruppa(data.elever, elevdata);
  const harUtenKlasse = data.elever.some((e) => !elevdata[e.id]?.klasse);
  const klassevalg = [
    { verdi: "", tekst: "Alle" },
    ...klasser.map((k) => ({ verdi: k, tekst: k })),
    ...(harUtenKlasse ? [{ verdi: UTEN_KLASSE, tekst: "Uten klasse" }] : []),
  ];
  const treff = filtrerElever(data.elever, elevdata, { sok, klasse });
  const tilKontroll = tester.resultater.filter((r) => !r.kontrollert && !r.avvist).length;
  const lavestFoerst = (a: { id: string }, b: { id: string }) =>
    (plan.perElev[a.id]?.etterlevelse.pct ?? 101) - (plan.perElev[b.id]?.etterlevelse.pct ?? 101);
  const delt = treff.filter((e) => plan.perElev[e.id]);
  const trenger = delt.filter((e) => trengerDeg(plan.perElev[e.id])).sort(lavestFoerst);
  const folger = delt.filter((e) => !trengerDeg(plan.perElev[e.id])).sort(lavestFoerst);
  const ikke = treff.filter((e) => !plan.perElev[e.id]);
  const alleTrenger = data.elever.filter((e) => plan.perElev[e.id] && trengerDeg(plan.perElev[e.id])).length;
  const rad = (e: { id: string; navn: string }, type: "trenger" | "folger" | "ikke") => {
    const tall = plan.perElev[e.id];
    return (
      <WangElevrad
        key={e.id}
        type={type}
        navn={e.navn}
        linje={radLinje(elevdata[e.id] ?? TOM_ELEVINFO, tall)}
        verdi={visPct(tall?.etterlevelse)}
        prosent={tall?.etterlevelse.pct ?? null}
        href={wangHref("elever", "elev", e.id)}
      />
    );
  };

  return (
    <>
      <WangTopp dato={`${data.gruppeNavn} · ${data.ukeTekst.split(" · ")[0].toLowerCase()}`} tittel="Elever" />

      <WangHelt
        etikett="Elever som trenger deg"
        merke="Siste fire uker"
        tall={plan.delerIder.length > 0 ? String(alleTrenger) : "—"}
        tekst="elever trenger deg"
        forklar={
          plan.delerIder.length > 0
            ? "Under 80 % av planen eller av morgentreningen siste fire uker. Bare elever som har delt planen med deg teller."
            : "Oppfølging bygges av gjennomført tid mot plan. Ingen elever har delt planen med deg ennå."
        }
        bilde="/team-wang/hero/trening-golf.jpg"
      />

      <WangSmaaTall
        tall={[
          { verdi: String(data.elever.length), tekst: "Elever i gruppa" },
          { verdi: `${plan.delerIder.length} av ${data.elever.length}`, tekst: "Har delt med deg" },
          { verdi: String(tilKontroll), tekst: "Test til kontroll" },
        ]}
      />

      {data.elever.length === 0 ? (
        <WangTomTilstand tittel="Ingen elever i gruppa." tekst="Elevene vises her når de er lagt inn i gruppa." />
      ) : (
        <>
          <label className="wg-lbl">
            <span className="wg-skjult">Søk etter elev</span>
            <input
              className="wg-field"
              type="search"
              placeholder="Søk etter elev"
              value={sok}
              onChange={(e) => setSok(e.target.value)}
            />
          </label>
          {klassevalg.length > 2 ? (
            <div className="wg-filter" role="group" aria-label="Klasse">
              {klassevalg.map((k) => (
                <button
                  key={k.verdi || "alle"}
                  type="button"
                  className={`wg-chip ${klasse === k.verdi ? "wg-chip-pa" : ""}`}
                  aria-pressed={klasse === k.verdi}
                  onClick={() => setKlasse(k.verdi)}
                >
                  {k.tekst}
                </button>
              ))}
            </div>
          ) : null}
          <div className="wg-baand wg-baand-kol">
            <WangBaand type="trenger" tittel="Trenger deg" tekst="Under 80 % av planen, eller av morgentreningen." antall={trenger.length} tomTekst={delt.length > 0 ? "Ingen elever under 80 %." : "Ingen elever å vise før planen er delt."}>
              {trenger.map((e) => rad(e, "trenger"))}
            </WangBaand>
            <WangBaand type="folger" tittel="Følger planen" tekst="80 % eller mer. Lavest først." antall={folger.length} tomTekst={delt.length > 0 ? "Ingen elever på 80 % eller mer." : "Ingen elever å vise før planen er delt."}>
              {folger.map((e) => rad(e, "folger"))}
            </WangBaand>
            <WangBaand
              type="ikke"
              tittel="Ikke delt"
              tekst="Eleven har ikke delt planen med WANG. Testene vises når eleven har samtykket til dem."
              antall={ikke.length}
              tomTekst={treff.length === 0 ? "Ingen elever passer søket eller klassen." : "Alle elevene har delt planen."}
            >
              {ikke.map((e) => rad(e, "ikke"))}
            </WangBaand>
          </div>
        </>
      )}
      <p className="wg-kilde">Elever ved andre WANG-skoler vises aldri.</p>
    </>
  );
}

function EnElev({
  data,
  elev,
  deler,
  tester,
  plan,
  info,
}: {
  data: WangTrenerData;
  elev: { id: string; navn: string };
  deler: boolean;
  tester: WangTesterData;
  plan: WangPlanData;
  info: WangElevInfo;
}) {
  const sisteTest = tester.resultater.find((r) => r.elevId === elev.id);
  const tall = plan.perElev[elev.id];
  return (
    <>
      <WangTilbake href={wangHref("elever")} tekst="Elever" />
      <section className="wg-topp" style={{ gap: 14 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
          <span className="wg-avatar" aria-hidden style={{ width: 56, height: 56, fontSize: 18, flex: "none" }}>{initialer(elev.navn)}</span>
          <div style={{ minWidth: 0 }}>
            <p className="wg-dato">{data.gruppeNavn}{info.klasse ? ` · ${info.klasse}` : ""}</p>
            <h1 className="wg-tittel">{elev.navn}</h1>
          </div>
        </div>
        <div className="wg-knapper">
          <span className={`wg-pille ${deler ? "wg-pille-ok" : ""}`}>
            <i />
            {deler ? "Deler testene med WANG" : "Deler ikke testene"}
          </span>
          <span className={`wg-pille ${tall ? "wg-pille-ok" : ""}`}><i />{tall ? "Har delt planen med deg" : "Plan ikke delt"}</span>
          <span className={`wg-pille ${info.delt ? "wg-pille-ok" : ""}`}>
            <i />
            {info.delt ? "Har delt profilen med deg" : "Profilen er ikke delt"}
          </span>
        </div>
        <nav aria-label="Elev" className="wgf-rad">
          <Link href={wangHref("elever", "elev", elev.id)} className="wgf wgf-pa" aria-current="page">Oversikt</Link>
          <Link href={iupHref(elev.id)} className="wgf">IUP</Link>
          <Link href={wangHref("elever", "sjekk", elev.id)} className="wgf">Fireukerssjekk</Link>
          <Link href={wangHref("tester", "elev", elev.id)} className="wgf">Tester</Link>
        </nav>
      </section>

      <WangSmaaTall
        tall={[
          { verdi: info.klasse ?? "—", tekst: "Klasse" },
          { verdi: info.delt ? info.kategori ?? "—" : "—", tekst: info.delt ? "Kategori A–K" : "Kategori · ikke delt" },
          { verdi: info.delt ? visHcp(info.hcp) : "—", tekst: info.delt ? "HCP" : "HCP · ikke delt" },
        ]}
      />

      <WangSmaaTall
        fire
        tall={[
          { verdi: visPct(tall?.etterlevelse), tekst: "Etterlevelse" },
          { verdi: visPct(tall?.morgen), tekst: "Morgentrening" },
          { verdi: sisteTest ? sisteTest.verdi : "—", tekst: sisteTest ? `Siste test: ${sisteTest.testNavn}` : "Siste test" },
          { verdi: "—", tekst: "Neste samtale" },
        ]}
      />

      <div className="wg-to-kol">
        <section className="wg-seksjon" aria-labelledby="wg-fokus-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-fokus-tittel">Fokus nå</h2>
            <Link className="wg-lenke" href={iupHref(elev.id)}>Hele IUP</Link>
          </div>
          <div className="wg-kort wg-fyll">
            <p className="wg-forklar">Fokusområdene står i IUP-en, avtalt i IUP-samtalen.</p>
          </div>
          <div className="wg-sek-topp">
            <h2>Siste turneringer</h2>
            <Link className="wg-lenke" href={`/team-wang/coach/turneringer/${elev.id}`}>Turneringene</Link>
          </div>
          <div className="wg-kort wg-fyll">
            <p className="wg-kilde">Brutto. Kilde: GolfBox. Eleven må ha delt med deg.</p>
          </div>
        </section>
        <section className="wg-seksjon" aria-labelledby="wg-forslag-tittel">
          <div className="wg-sek-topp"><h2 id="wg-forslag-tittel">Forslag fra deg</h2></div>
          <div className="wg-kort wg-fyll">
            <p className="wg-forklar">Forslagene står i IUP-en. Forslaget endrer ikke planen før eleven godtar det.</p>
            <div className="wg-knapper">
              <Link href={iupHref(elev.id)} className="wg-btn wg-btn-primary">Foreslå endring</Link>
              <Link href={wangHref("meldinger", "elev", elev.id)} className="wg-btn wg-btn-secondary">Skriv melding</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const datoKort = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

function Fireukerssjekk({
  data,
  elev,
  sjekk,
}: {
  data: WangTrenerData;
  elev: { id: string; navn: string };
  sjekk: WangFireukerssjekk;
}) {
  const topp = (
    <>
      <WangTilbake href={wangHref("elever", "elev", elev.id)} tekst={elev.navn} />
      <WangTopp dato={`${elev.navn} · ${data.gruppeNavn}`} tittel="Fireukerssjekk" />
    </>
  );
  if (sjekk.status === "ikke-delt") {
    return (
      <>
        {topp}
        <WangTomTilstand
          tittel="Ikke delt"
          tekst="Eleven har ikke delt profilen med deg. Fireukerssjekken vises her når eleven (og forelder under 16) har delt fra PlayerHQ."
        />
        <p className="wg-kilde">Elever ved andre WANG-skoler vises aldri.</p>
      </>
    );
  }
  const [siste, ...tidligere] = sjekk.runder;
  if (!siste) {
    return (
      <>
        {topp}
        <WangTomTilstand tittel="Ingen levert fireukerssjekk" tekst="Eleven har delt med deg, men har ikke levert en fireukerssjekk ennå. Utkast vises ikke." />
      </>
    );
  }
  return (
    <>
      {topp}
      <FireukerRunde runde={siste} prosessmal={sjekk.prosessmal} />
      {tidligere.length > 0 ? (
        <section className="wg-seksjon" aria-labelledby="wg-tidligere-sjekk">
          <div className="wg-sek-topp"><h2 id="wg-tidligere-sjekk">Tidligere runder</h2></div>
          <div className="wg-kort wg-fyll">
            {tidligere.map((r) => (
              <div key={r.id} className="wg-rad">
                <b>{datoKort(r.periodeStart)}–{datoKort(r.periodeSlutt)}</b>
                <span className="wg-tall">{r.innhold ? desimal(snitt(fireukerOmraader(r.innhold.niva).flatMap((o) => o.sporsmal), r.innhold.svar)) : "—"}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <p className="wg-kilde">
        Elevens leverte svar fra PlayerHQ. Din vurdering lagres ikke her; før den i IUP-samtalen.
      </p>
    </>
  );
}

function FireukerRunde({
  runde,
  prosessmal,
}: {
  runde: Extract<WangFireukerssjekk, { status: "delt" }>["runder"][number];
  prosessmal: Record<string, string>;
}) {
  const innhold = runde.innhold;
  if (!innhold) {
    return <WangTomTilstand tittel="Kan ikke vises" tekst="Besvarelsen avviker fra kilden eller formatet og vises ikke." />;
  }
  const omraader = fireukerOmraader(innhold.niva);
  const mal = Object.entries(innhold.prosessmal ?? {});
  return (
    <>
      <WangSmaaTall
        tall={[
          { verdi: desimal(snitt(omraader.flatMap((o) => o.sporsmal), innhold.svar)), tekst: "Snitt 1–5" },
          { verdi: NIVA_NAVN[innhold.niva], tekst: "Nivå" },
          { verdi: datoKort(runde.levert), tekst: `Levert · ${datoKort(runde.periodeStart).slice(0, 5)}–${datoKort(runde.periodeSlutt).slice(0, 5)}` },
        ]}
      />
      <div className="wg-to-kol">
        <section className="wg-seksjon" aria-labelledby="wg-sjekk-omr">
          <div className="wg-sek-topp"><h2 id="wg-sjekk-omr">Utviklingssjekken</h2></div>
          {omraader.map((o) => (
            <details key={o.kategori} className="wg-kort wg-fyll">
              <summary className="wg-rad" style={{ cursor: "pointer", padding: 0 }}>
                <b>{o.kategori}</b>
                <span className="wg-tall">{desimal(snitt(o.sporsmal, innhold.svar))}</span>
              </summary>
              {o.sporsmal.map((sp) => (
                <div key={sp.id} className="wg-rad">
                  <span className="wg-hjelp">{sp.tekst}</span>
                  <span className="wg-tall">{innhold.svar[sp.id] ?? "—"}</span>
                </div>
              ))}
            </details>
          ))}
        </section>
        <section className="wg-seksjon" aria-labelledby="wg-sjekk-mal">
          <div className="wg-sek-topp"><h2 id="wg-sjekk-mal">Prosessmål</h2></div>
          <div className="wg-kort wg-fyll">
            {mal.length === 0 ? (
              <p className="wg-kilde">Ingen prosessmål i denne runden.</p>
            ) : (
              mal.map(([malId, svar]) => (
                <div key={malId} className="wg-rad">
                  <span>{prosessmal[malId] ?? "Prosessmål som er fjernet"}</span>
                  <b>{PROSESS_NAVN[svar]}</b>
                </div>
              ))
            )}
          </div>
          {innhold.notat ? (
            <>
              <div className="wg-sek-topp"><h2>Notat til trenerne</h2></div>
              <div className="wg-kort wg-fyll"><p className="wg-forklar" style={{ overflowWrap: "anywhere" }}>{innhold.notat}</p></div>
            </>
          ) : null}
        </section>
      </div>
    </>
  );
}
