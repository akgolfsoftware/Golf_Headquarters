"use client";

/**
 * PH-11-MAL Målsetninger — nytt design (pakke 3 Plan og Workbench, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan.html, malen «mal».
 * Stil: src/styles/playerhq-ny.css og src/styles/playerhq-ny-maal.css.
 *
 * Data som før: aktive Goal-rader, fremdrift fra beregnGoalProgress, siste milepæl og IUP-inngangen
 * (harEgenIupInngang). «Ny målsetning» går til /portal/mal/ny (pakke 17b). Hvert kort åpner
 * /portal/mal/goal/[id].
 *
 * Avvik:
 *   - Nivået (År · Periode · Måned og uke · Økt) er målsetningens valgte planleggingsnivå, ellers
 *     foreslått ut fra fristen (losPlanNivaa). Foreslått nivå merkes «foreslått» på kortet.
 *   - «Burde vært»-streken finnes bare når start, målsetning og frist er kjent. Bare SG-målsetninger
 *     lagrer start i dag, så de andre viser «—» som start og ingen strek.
 *   - Prosessmål vises med fremdriftsspor, ikke ukeprikker: appen lagrer ikke antall per uke på målsetningen.
 *   - IUP-raden lenker til utviklingssjekk og sesongevaluering (/portal/mal/evaluering). Tallet
 *     «7 av 37 med mål» finnes ikke i dataene og er utelatt.
 *   - Nivåmenyen øverst vises når siden er nivået Målsetninger i Workbench (`nivaer`). /portal/mal er
 *     fortsatt egen adresse uten nivåmenyen.
 *   - Ekstra filter «Avsluttet» viser nådde og avsluttede målsetninger, slik Avslutt-dialogen lover.
 *   - Siste milepæl vises under det store tallet når den finnes.
 */

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { PLAN_NIVAA_LABEL } from "@/lib/domain/maal-plannivaa";
import { erIRute, NIVA_FILTER, TEMPO_TEKST, type MaalKortNy, type MaalListeData, type MaalNivaFilter } from "@/lib/portal-mal/maal-ny";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-maal.css";

type Filter = MaalNivaFilter | "avsluttet";

export type PHMalsetningerProps = {
  data: MaalListeData;
  /** Nådde og avsluttede målsetninger. */
  avsluttede?: MaalKortNy[];
  visIup?: boolean;
  state?: "data" | "tom" | "laster" | "feil";
  onRetry?: () => void;
  /** Nivåmenyen i spillerens Workbench (År · Periode · Måned · Uke · Målsetninger). */
  nivaer?: ReactNode;
};

const FILTRE: { id: Filter; navn: string }[] = [
  { id: "alle", navn: "Alle" },
  { id: "ar", navn: "År" },
  { id: "per", navn: "Periode" },
  { id: "mnd", navn: "Måned og uke" },
  { id: "okt", navn: "Økt" },
  { id: "avsluttet", navn: "Avsluttet" },
];

const PILLE: Record<MaalKortNy["tempo"], "ok" | "vent" | "noy"> = { nadd: "ok", foran: "ok", "i-rute": "ok", bak: "vent", "ingen-data": "noy" };

function Hode({ nivaer }: { nivaer?: ReactNode }) {
  return (
    <div className="phn-topp">
      <div className="phn-topp-rad">
        <div>
          <div className="phn-dato">{nivaer ? "Workbench" : "Plan · Workbench"}</div>
          <h1 className="phn-tittel">Målsetninger</h1>
        </div>
        <div className="phn-knapper">
          <Link className="phn-knapp pri" href="/portal/mal/ny"><Plus className="phn-ikon" aria-hidden />Ny målsetning</Link>
        </div>
      </div>
      {nivaer}
    </div>
  );
}

export function MaalKort({ m }: { m: MaalKortNy }) {
  const type = m.kategori === "OUTCOME" ? "Resultatmål" : "Prosessmål";
  const niva = `${PLAN_NIVAA_LABEL[m.niva]}${m.nivaKilde === "foreslatt" ? " (foreslått)" : ""}`;
  return (
    <Link className="phn-m-kort" href={`/portal/mal/goal/${m.id}`}>
      <div className="phn-m-topp">
        <div>
          {m.akseTekst && <span className="phn-m-akse"><i className={m.akse ? `akse-${m.akse}` : undefined} />{m.akseTekst}</span>}
          <b>{m.navn}</b>
          <small>{type} · {niva} · {m.fristTekst}</small>
        </div>
        <span className={`phn-pille ${PILLE[m.tempo]}`}>{TEMPO_TEKST[m.tempo]}</span>
      </div>
      {m.pst != null && (
        <div className="phn-m-framdrift">
          <div className="phn-m-spor" role="img" aria-label={`${m.pst} prosent av veien${m.burdePst != null ? `. Etter tidsplanen burde du vært på ${m.burdePst} prosent` : ""}.`}>
            <span style={{ width: `${m.pst}%`, background: m.akse ? `var(--phn-${m.akse})` : undefined }} />
            {m.burdePst != null && <em style={{ left: `${m.burdePst}%` }} />}
          </div>
        </div>
      )}
      <div className="phn-m-tall">
        <span>Start<b>{m.start ?? "—"}</b></span>
        <span>Nå<b>{m.naa ?? "—"}</b></span>
        <span>Målsetning<b>{m.maal ?? "—"}</b></span>
      </div>
      <p className="phn-forklar">{m.statusTekst}</p>
      {m.kildeTekst && <p className="phn-kilde">{m.kildeTekst}</p>}
    </Link>
  );
}

export function PHMalsetninger({ data, avsluttede = [], visIup, state, onRetry, nivaer }: PHMalsetningerProps) {
  const [filter, setFilter] = useState<Filter>("alle");
  const tilstand = state ?? (data.goals.length === 0 && avsluttede.length === 0 ? "tom" : "data");

  if (tilstand === "laster") {
    return (
      <div className="phn phn-m" aria-busy="true">
        <Hode nivaer={nivaer} />
        <span className="phn-skjelett" style={{ height: 120 }} />
        <div className="phn-m-liste">
          <span className="phn-skjelett" style={{ height: 180 }} />
          <span className="phn-skjelett" style={{ height: 180 }} />
        </div>
      </div>
    );
  }

  if (tilstand === "feil") {
    return (
      <div className="phn phn-m">
        <Hode nivaer={nivaer} />
        <section className="phn-kort">
          <p className="phn-k-feil" role="alert">Målsetningene kunne ikke hentes. Ingenting er endret.</p>
          {onRetry && <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={onRetry}>Prøv igjen</button></div>}
        </section>
      </div>
    );
  }

  const aktive = data.goals;
  const iRute = aktive.filter((g) => erIRute(g.tempo)).length;
  const bak = aktive.filter((g) => g.tempo === "bak").length;
  const utenData = aktive.filter((g) => g.tempo === "ingen-data").length;
  const antall = (f: Filter) => (f === "alle" ? aktive.length : f === "avsluttet" ? avsluttede.length : aktive.filter((g) => NIVA_FILTER[g.niva] === f).length);
  const synlige = filter === "alle" ? aktive : filter === "avsluttet" ? avsluttede : aktive.filter((g) => NIVA_FILTER[g.niva] === filter);
  const forklar = [
    "Fremdriften regnes ut fra runder, tester og gjennomførte økter.",
    bak > 0 ? `${bak === 1 ? "Én er" : `${bak} er`} bak tidsplanen.` : null,
    utenData > 0 ? `${utenData === 1 ? "Én mangler" : `${utenData} mangler`} målinger.` : null,
  ].filter(Boolean).join(" ");

  const iupRad = visIup ? (
    <Link className="phn-m-iup" href="/portal/mal/evaluering">
      <span><b>Utviklingssjekk og sesongevaluering</b><small>IUP · det du deler med treneren din</small></span>
      <ChevronRight className="phn-ikon" aria-hidden />
    </Link>
  ) : null;

  return (
    <div className="phn phn-m">
      <Hode nivaer={nivaer} />

      {tilstand === "tom" ? (
        <section className="phn-kort phn-k-dempet phn-m-tomt">
          <b className="phn-k-undertittel">Ingen målsetninger ennå</b>
          <p className="phn-forklar">Sett en målsetning for året, en periode eller en enkelt økt. Fremdriften regnes ut fra det du registrerer.</p>
          <Link className="phn-knapp pri" href="/portal/mal/ny"><Plus className="phn-ikon" aria-hidden />Ny målsetning</Link>
        </section>
      ) : null}
      {tilstand === "tom" ? iupRad : (
        <>
          <section className="phn-kort" aria-label="Målsetningene i tall">
            <div className="phn-hoved">
              <strong>{aktive.length ? iRute : "—"}<small>av {aktive.length}</small></strong>
              <span className="phn-trend opp">I rute</span>
            </div>
            <p className="phn-forklar">{forklar}</p>
            {data.milepael && <p className="phn-kilde">Siste milepæl: {data.milepael.tittel} · {data.milepael.dato}</p>}
          </section>

          {iupRad}

          <div className="phn-valg" role="group" aria-label="Nivå">
            {FILTRE.map((f) => (
              <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.navn} {antall(f.id)}
              </button>
            ))}
          </div>

          {synlige.length > 0 ? (
            <div className="phn-m-liste">{synlige.map((m) => <MaalKort key={m.id} m={m} />)}</div>
          ) : (
            <div className="phn-kort phn-k-dempet">
              <b className="phn-k-undertittel">{filter === "avsluttet" ? "Ingen avsluttede målsetninger" : "Ingen målsetninger på dette nivået"}</b>
              <p className="phn-forklar">{filter === "avsluttet" ? "Nådde og avsluttede målsetninger samles her." : "Sett en målsetning for en enkelt økt, for eksempel antall godkjente i en test."}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
