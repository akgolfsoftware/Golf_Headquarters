"use client";

/**
 * PH-RD-01 Registrer runde: hvor mye vil du føre? — nytt design (pakke 5, godkjent av Anders 14.10.2026, utkast 2 med farge).
 * Fasit: docs/design-system/utkast-playerhq/runder.html, skjerm «niva». Stil: playerhq-ny-runder.css.
 *
 * Tre nivåer: Rask score → PH-RD-06 (/portal/runde/logg), Importer eller før SG selv → SG-skjemaet
 * (/portal/mal/runder/ny?flyt=sg), Slag for slag → oppsett og føring (/portal/runde/live).
 *
 * Avvik:
 *   - Kladden leses fra telefonen og vises bare når en runde er i gang. Teksten bruker bane, ført og dato fra kladden.
 *   - Linja «12 av dine 18 runder i år er ført slag for slag» er tatt ut: siden henter ikke rundene dine.
 *   - Importer går til dagens SG-skjema. CSV-import (PH-RD-07) finnes ikke i appen ennå.
 *   - «Tom» vises når appen ikke har baner å velge blant.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-RD-01.
 */
import { useCallback, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { lesKladdCached, lesKladdServer, type RundeKladd } from "@/lib/runde-logg/draft";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { RunderFeil, Tilbake } from "./PHRunderFelles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-runder.css";

export type Niva = "rask" | "import" | "slag";
export type PHRD01Kladd = { bane: string; ferdige: number; av: number; dato: string };

type NivaDef = { id: Niva; navn: string; tid: string; gir: string[]; kvalitet: 1 | 2 | 3; bilde: string; href: string };

const NIVAER: NivaDef[] = [
  { id: "rask", navn: "Rask score", tid: "10 sek per hull", kvalitet: 1, bilde: "/images/playerhq/spill-bane.jpg", href: "/portal/runde/logg",
    gir: ["Snittscore og kategori", "Putter, fairway og GIR hvis du fører dem", "Ingen Strokes Gained"] },
  { id: "import", navn: "Importer eller før SG selv", tid: "2 min per runde", kvalitet: 2, bilde: "/images/playerhq/slag-simulator.jpg", href: "/portal/mal/runder/ny?flyt=sg",
    gir: ["Strokes Gained per kategori fra appen du bruker", "Kilden står på hvert tall", "Ingen tall per slag"] },
  { id: "slag", navn: "Slag for slag", tid: "30 sek per hull", kvalitet: 3, bilde: "/images/playerhq/slag-utslag.jpg", href: "/portal/runde/live",
    gir: ["Strokes Gained per slag og kategori", "Tiger 5 og hvor slagene forsvinner", "Planen din kan justeres etter runden"] },
];
const KVALITET = ["", "lav", "middels", "høy"];

const abonnerIngen = () => () => {};
const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

function tilKladdInfo(k: RundeKladd | null): PHRD01Kladd | null {
  if (!k || k.steg === "oppsett") return null;
  const dato = new Date(k.oppdatert);
  return {
    bane: k.oppsett.courseNavn.trim(),
    ferdige: k.hullData.filter((h) => h.slag.length > 0).length,
    av: k.oppsett.hullValg === "18" ? 18 : 9,
    dato: Number.isNaN(dato.getTime()) ? "—" : DATO.format(dato),
  };
}

/** Leser kladden fra telefonen. Sendes videre til visningen, som ikke kjenner localStorage. */
function useKladd(): PHRD01Kladd | null {
  const eierId = useLokalDataEier();
  const snapshot = useCallback(() => lesKladdCached(eierId), [eierId]);
  return tilKladdInfo(useSyncExternalStore(abonnerIngen, snapshot, lesKladdServer));
}

export function PHRD01VelgNiva({ tilstand = "data", kladd = null, uleste = 0, feilKode }: {
  tilstand?: "data" | "tom" | "feil"; kladd?: PHRD01Kladd | null; uleste?: number; feilKode?: string;
}) {
  const [valgt, setValgt] = useState<Niva>("slag");
  const gjeldende = NIVAER.find((n) => n.id === valgt) ?? NIVAER[2];

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <div className="phn">
        <Tilbake href="/portal/mal/runder" tekst="Runder" />
        <div className="phr-topp">
          <div className="phn-dato">Registrer runde · steg 1 av 2</div>
          <h1 className="phn-tittel">Hvor mye vil du føre?</h1>
          <p className="phr-ingress">Jo mer du fører, jo mer kan appen si om spillet ditt. Du kan alltid føre mindre på neste runde.</p>
        </div>

        {tilstand === "feil" ? (
          <RunderFeil tittel="Siden kunne ikke hentes" tekst="Noe gikk galt da banene skulle hentes. Prøv igjen om litt." href="/portal/mal/runder/ny" kode={feilKode} />
        ) : tilstand === "tom" ? (
          <section className="phn-kort phr-kort-dempet">
            <h2 className="phr-undertittel">Ingen baner å velge</h2>
            <p className="phn-forklar">Det finnes ingen baner i AK Golf ennå, så en runde kan ikke lagres. Si fra til coachen din, så legges banen inn.</p>
          </section>
        ) : (
          <>
            {kladd && (
              <section className="phr-kladd" aria-label="Runde som ikke er ferdig">
                <div className="phr-kladd-topp">
                  <span className="phr-kladd-ikon"><Flag className="phn-ikon" aria-hidden /></span>
                  <span>
                    <b className="phr-undertittel">Runde i gang{kladd.bane ? ` · ${kladd.bane}` : ""}</b>
                    <span className="phn-kilde" style={{ display: "block" }}>{kladd.ferdige} av {kladd.av} hull ført · slag for slag · lagret på telefonen {kladd.dato}</span>
                  </span>
                </div>
                <Link className="phn-knapp sek" href="/portal/runde/live">Fortsett runden</Link>
              </section>
            )}
            <section className="phn-seksjon" aria-label="Nivå">
              <div className="phr-nivaa" role="radiogroup" aria-label="Hvor mye vil du føre?">
                {NIVAER.map((n) => (
                  <button key={n.id} type="button" role="radio" aria-checked={n.id === valgt} className="phr-nivaakort" onClick={() => setValgt(n.id)}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- dekorbilde fra public, samme som I dag */}
                    <img src={n.bilde} alt="" width={400} height={96} />
                    <span className="phr-nk-tekst">
                      <span className="phr-nk-topp"><span className="phr-nk-navn">{n.navn}</span><span className="phr-nk-tid">{n.tid}</span></span>
                      <span className="phr-hvaer">Hva får du ut av dette?</span>
                      <ul>{n.gir.map((g) => <li key={g}>{g}</li>)}</ul>
                      <span className="phr-kvalitet">
                        <span className="phr-prikker" aria-hidden>{[1, 2, 3].map((i) => <i key={i} className={i <= n.kvalitet ? "paa" : ""} />)}</span>
                        Datakvalitet: {KVALITET[n.kvalitet]}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="phn-kilde">Nærspill og putting blir sikre i Stats fra 24 runder ført slag for slag.</p>
            </section>
            <div className="phr-festet"><Link className="phn-knapp pri phr-knapp-stor" href={gjeldende.href}>Videre med {gjeldende.navn}</Link></div>
          </>
        )}
      </div>
    </PlayerHQSkall>
  );
}

/** Sideversjonen: leser kladden fra telefonen. */
export function PHRD01MedKladd(props: { tilstand?: "data" | "tom" | "feil"; uleste?: number }) {
  const kladd = useKladd();
  return <PHRD01VelgNiva {...props} kladd={kladd} />;
}
