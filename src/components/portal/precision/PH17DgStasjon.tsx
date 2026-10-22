"use client";

/**
 * PH17DgStasjon — Data Golf-stasjonen i Skrå-drakten (bare ADMIN, krevDataGolfBruker i siden).
 * Samme oppsett som TrackMan-sidene: lav topp med slag-simulator.jpg og hvite kort.
 * Spillerens egne tall er ikke målt her, så de vises som «—». Referanse: PGA Tour (Data Golf) og Kategori C (estimat).
 */
import { useState } from "react";
import { CheckCircle2, Play } from "lucide-react";
import { SkraFlyt, SkraKort, SkraTopp } from "@/components/precision/skra/Skra";
import { TmTilbake } from "./PH17TmFelles";
import { formaterDesimal, formaterHeltall, type PH17TrackManData } from "@/lib/portal-analyse/ph17-trackman-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-dgstasjon.css";

export function PH17DgStasjon({ station }: { station: PH17TrackManData["station"] }) {
  const [startet, setStartet] = useState(false);
  return (
    <div className="phn phn-skra">
      <SkraTopp
        lav
        etikett="Stasjon"
        bilde="/images/playerhq/slag-simulator.jpg" bildePosisjon="50% 50%"
        overlinje="Stats · Data Golf"
        tittel="Stasjon"
        ingress={`${station.club} mot proff-referanse · 10 slag`}
        handling={<span className="skra-tilbake"><TmTilbake href="/portal/analysere/datagolf" tekst="Data Golf" /></span>}
      />
      <SkraFlyt lav>
        <SkraKort tittel={`Stasjonsmodus · ${station.club}`} meta="Powered by Data Golf">
          <p className="phn-dg-tekst">
            Slå 10 slag med samme kølle. Tallene sammenlignes med PGA Tour-snitt fra Data Golf og normen for kategori C.
          </p>
          <div className="phn-dg-liste">
            {station.rows.map((row) => {
              const des = row.param === "Smash Factor" ? 2 : 1;
              const f = (v: number) => (row.param === "Spin Rate" ? formaterHeltall(v) : formaterDesimal(v, des)) + (row.enhet ? ` ${row.enhet}` : "");
              return (
                <div className="phn-dg-rad" key={row.id}>
                  <b>{row.param}</b>
                  <dl>
                    <div><dt>{station.spillerNavn}</dt><dd>—</dd></div>
                    <div><dt>PGA Tour</dt><dd>{f(row.pgaTourVerdi)}</dd></div>
                    <div><dt>Kategori C</dt><dd>{f(row.kategoriCVerdi)}</dd></div>
                    <div><dt>Avvik PGA</dt><dd>—</dd></div>
                  </dl>
                </div>
              );
            })}
          </div>
          <p className="phn-dg-kilde">PGA Tour · Data Golf · Sesong 2025 · Kategori C · AK Golf-norm · Estimat</p>
          <button type="button" className="phn-knapp pri phn-dg-start" onClick={() => setStartet(true)}>
            {startet ? <CheckCircle2 className="phn-ikon" aria-hidden /> : <Play className="phn-ikon" aria-hidden />}
            {startet ? "Stasjonsmodus aktiv" : "Start stasjon · 10 slag"}
          </button>
        </SkraKort>
      </SkraFlyt>
    </div>
  );
}
