"use client";

/**
 * PlayerHQ Hjelp › Én kategori og Én artikkel — nytt design, pakke 15 (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/hjelp.html, skjermene «Én kategori» og «Én artikkel».
 *
 * Avvik:
 *   - «I artikkelen» (innholdsliste) vises ikke: artiklene er korte og har ingen mellomtitler.
 *   - Pyramide-artikkelen viser de fem aksene som fargede rader, som i utkastet; eksempelstolpen med
 *     prosenter er ikke med, fordi tallene ikke er spillerens egne.
 *   - «Spør Anders» heter «Skriv til coachen» og går til Ny melding: ikke alle spillere har Anders som coach.
 *   - «Var dette nyttig?» lagres som tilbakemelding (vurderArtikkel) og kan gis én gang per visning.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import type { HjelpArtikkel, HjelpBlokk, HjelpKategori } from "@/lib/portal-hjelp/artikler";
import { vurderArtikkel } from "@/app/portal/meg/help/kontakt/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-hjelp.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

function SkrivKort({ tekst }: { tekst: string }) {
  return <div className="phn-kort dempet">
    <b className="phn-undertittel">Fant du ikke svaret?</b>
    <p className="phn-forklar">{tekst}</p>
    <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/meg/help/kontakt">Skriv til oss</Link></div>
  </div>;
}

export function PHHjelpKategori({ kategori, artikler }: { kategori: HjelpKategori; artikler: HjelpArtikkel[] }) {
  return <div className="phn phn-meg phn-hjelp"><div className="side smal">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg/help"><ChevronLeft size={18} aria-hidden />Hjelp</Link>
      <div><div className="phn-dato">Hjelp · kategori</div><h1 className="phn-tittel">{kategori.tittel}</h1></div>
      <p className="hj-ingress">{kategori.ingress}</p>
    </div>
    <section className="phn-seksjon" aria-labelledby="hj-art">
      <div className="phn-sek-topp"><h2 id="hj-art">Artikler</h2><span className="phn-kilde">{artikler.length} {artikler.length === 1 ? "artikkel" : "artikler"}</span></div>
      {artikler.length === 0
        ? <div className="phn-kort dempet"><b className="phn-undertittel">Ingen artikler ennå</b><p className="phn-forklar">Artiklene i denne kategorien kommer når funksjonene de beskriver, er klare.</p></div>
        : <div className="liste">{artikler.map((a) => <Link key={a.slug} href={`/portal/meg/help/artikkel/${a.slug}`}><span><b>{a.tittel}</b><span className="phn-kilde">{a.lesetid} min lesing</span></span><ChevronRight size={20} aria-hidden /></Link>)}</div>}
    </section>
    <SkrivKort tekst="Skriv til oss. Spørsmålet havner hos AK Golf, og svaret kommer på e-post." />
  </div></div>;
}

/* Pyramiden ovenfra: TURN øverst, FYS nederst. Følger punktrekkefølgen i artikkelen «pyramiden». */
const AKSER = [
  { k: "TURN", c: "turn", n: "Turnering" }, { k: "SPILL", c: "spill", n: "Spill" }, { k: "SLAG", c: "slag", n: "Golfslag" },
  { k: "TEK", c: "tek", n: "Teknisk" }, { k: "FYS", c: "fys", n: "Fysisk" },
] as const;

function Blokk({ b, pyramide }: { b: HjelpBlokk; pyramide: boolean }) {
  if (b.t === "p") return <p>{b.fet && <b>{b.fet} </b>}{b.tekst}</p>;
  if (b.t === "nr") return <ol>{b.punkter.map((p) => <li key={p}>{p}</li>)}</ol>;
  if (pyramide && b.punkter.length === 5) return <div className="hj-akser">{b.punkter.map((p, i) => <div key={p.tekst} className={`hj-akse-rad ${AKSER[i].c}`}><b className="k">{AKSER[i].k}</b><span><b>{AKSER[i].n}</b> {p.tekst}</span></div>)}</div>;
  return <ul>{b.punkter.map((p) => <li key={p.tekst}>{p.fet && <b>{p.fet} </b>}{p.tekst}</li>)}</ul>;
}

export function PHHjelpArtikkel({ artikkel, kategori }: { artikkel: HjelpArtikkel; kategori: HjelpKategori }) {
  const [svar, setSvar] = useState<boolean | null>(null);
  const [lagrer, start] = useTransition();
  const pyramide = artikkel.slug === "pyramiden";

  function vurder(nyttig: boolean) {
    setSvar(nyttig);
    start(async () => { await vurderArtikkel({ slug: artikkel.slug, nyttig }); });
  }

  return <div className="phn phn-meg phn-hjelp phn-skra">
    <SkraTopp
      lav
      etikett="Meg"
      bilde="/images/playerhq/tek-video.jpg" bildePosisjon="50% 50%"
      overlinje={<>Hjelp · {kategori.tittel.toLowerCase()} · {artikkel.lesetid} min lesing</>}
      tittel={<>{artikkel.tittel}</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href={`/portal/meg/help/kategori/${kategori.slug}`}><ChevronLeft size={18} aria-hidden />{kategori.tittel}</Link></span>}
    />
    <SkraFlyt lav><div className="side">
    <div className="hj-grid artikkel">
      <article className="hj-artikkel">
        {artikkel.blokker.map((b, i) => <Blokk key={i} b={b} pyramide={pyramide} />)}
        <section className="phn-kort" aria-label="Var dette nyttig?">
          <b className="phn-undertittel">Var dette nyttig?</b>
          {svar === null
            ? <div className="hj-nyttig"><button type="button" onClick={() => vurder(true)}>Ja</button><button type="button" onClick={() => vurder(false)}>Nei</button></div>
            : <p className="phn-forklar" role="status">{lagrer ? "Lagrer …" : svar ? "Takk. Bra at den hjalp." : "Takk. Skriv gjerne til oss hva som manglet."}</p>}
        </section>
      </article>
      <aside>
        <div className="phn-kort dempet">
          <div className="hj-skriv"><span className="ikonboks" aria-hidden><MessageSquare size={20} /></span><span><b className="phn-undertittel">Skriv til coachen</b><p className="phn-forklar">Lurer du på noe i din egen plan? Skriv til coachen.</p></span></div>
          <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/coach/melding/ny">Skriv til coachen</Link></div>
        </div>
        <SkrivKort tekst="Gjelder det appen? Skriv til oss, så kommer svaret på e-post." />
      </aside>
    </div>
  </div></SkraFlyt></div>;
}
