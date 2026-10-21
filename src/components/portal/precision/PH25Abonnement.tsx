"use client";

/**
 * PH-25 Abonnement i nytt design: PlayerHQ-nivået (Gratis eller Full) øverst, coaching-pakken med
 * klipp, betaling og kvitteringer, og «Avslutt» med rust bekreftelse i en dialog.
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, skjermen «PH-25 Abonnement»).
 * Stil: src/styles/playerhq-ny-meg.css.
 *
 * Betaling: skjermen viser bare data fra databasen. Avslutt kaller cancelPro (uendret: Stripe før egen
 * database, gotchas §Betaling). Kort og kvitteringer åpner de eksisterende sidene.
 *
 * Avvik:
 *   - Velgeren «I pakke · Betaler selv · Gratis» er ikke med: skjermen viser spillerens eget abonnement.
 *   - Kortets siste fire siffer vises ikke: kortet lagres bare hos Stripe. «Bytt kort» åpner kortsiden.
 *   - «Bytt til årlig» er ikke med: appen har ingen handling for å bytte periode.
 *   - Klippene viser brukt og igjen. Klipp som er booket, men ikke brukt, skilles ikke ut.
 *   - Prisene kommer fra PH25_PLANER, samme kilde som forrige versjon.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-25.
 */
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CreditCard, FileText } from "lucide-react";
import { cancelPro } from "@/app/portal/meg/abonnement/avbestill/actions";
import { PH25_PLANER, formaterKroner } from "@/lib/portal-abonnement/ph25-abonnement-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type PH25Faktura = { id: string; dato: string; gjelder: string; belop: number };
export type PH25Data = {
  niva: "Full" | "Gratis";
  /** Coaching-pakken (Performance eller Performance Pro) med klipp, eller null. */
  pakke: { navn: string; igjen: number; totalt: number } | null;
  /** Abonnementet er sagt opp og løper ut perioden. */
  avsluttes: boolean;
  /** Neste trekk eller siste dag, formatert («1. november»), eller null. */
  periodeSlutt: string | null;
  /** Finnes et Stripe-abonnement som kan avsluttes her. */
  kanAvsluttes: boolean;
  fakturaer: PH25Faktura[];
  /** Spilleren kom fra en flate som er låst i Gratis. */
  fraLaast?: boolean;
};

const FULL = PH25_PLANER.find((p) => p.id === "FULL");
const GRATIS = PH25_PLANER.find((p) => p.id === "TALENT");

export function PH25Abonnement({ data, avslutt = cancelPro }: { data: PH25Data; avslutt?: typeof cancelPro }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const p = data.pakke;
  const hva = p ? p.navn : "abonnementet";

  function bekreft() {
    setFeil(null);
    start(async () => {
      try {
        const r = await avslutt(p ? "COACHING" : "PLAYERHQ");
        if (r && !r.ok) setFeil(r.error ?? "Kunne ikke avslutte. Prøv igjen, eller ta kontakt.");
      } catch (e) {
        // redirect() fra server-handlingen kastes videre slik at Next navigerer.
        if (e && typeof e === "object" && "digest" in e) throw e;
        setFeil("Kunne ikke avslutte. Prøv igjen, eller ta kontakt.");
      }
    });
  }

  const nivaInfo = data.niva === "Gratis"
    ? "Du bruker PlayerHQ gratis. Full gir Plan, Workbench og Caddie."
    : p ? `Inkludert i coaching-pakken ${p.navn}. Du betaler ikke ekstra for appen.` : "Du betaler for PlayerHQ selv.";

  return <div className="phn phn-meg phn-skra">
    <SkraTopp
      lav
      etikett="Meg"
      bilde="/images/playerhq/spill-bane.jpg" bildePosisjon="50% 50%"
      overlinje={<>Meg · abonnement</>}
      tittel={<>Abonnement</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link></span>}
    />
    <SkraFlyt lav><div className="side">

    {data.fraLaast && <div className="phn-kort dempet" role="status">
      <b className="phn-undertittel">Denne delen krever Full</b>
      <p className="phn-forklar">Du kom hit fordi flaten er låst i Gratis.</p>
    </div>}

    <div className="to-del">
      <div>
        <div className="niva"><div className="nt">
          <span className="e">PlayerHQ-nivå</span>
          <b className="navn">{data.niva}</b>
          {data.niva === "Full" && <span className={`phn-pille ${data.avsluttes ? "vent" : "ok"}`}><i />{data.avsluttes ? `Avsluttes ${data.periodeSlutt ?? ""}`.trim() : "Aktiv"}</span>}
          <span className="info">{nivaInfo}</span>
        </div></div>

        {data.niva === "Gratis" && FULL && GRATIS && <div style={{ display: "grid", gap: 12 }}>
          <div className="sammenlign">
            <div className="valgt"><b className="n">{GRATIS.navn}</b><span className="pris">{formaterKroner(0)}</span><ul>{GRATIS.features.map((f) => <li key={f}>{f}</li>)}</ul></div>
            <div><b className="n">{FULL.navn}</b><span className="pris">{FULL.prisMnd}<small> kr/mnd</small></span><ul>{FULL.features.map((f) => <li key={f}>{f}</li>)}</ul></div>
          </div>
          <Link className="phn-knapp pri stor" href="/portal/meg/abonnement/oppgrader/flyt">Velg Full</Link>
          <p className="phn-kilde">Eller {formaterKroner(FULL.prisAr)}/år. Du kan si opp når som helst.</p>
        </div>}

        {p && <div className="phn-kort">
          <div className="phn-sek-topp"><b className="phn-undertittel">{p.navn}</b><span className="phn-kilde">{data.periodeSlutt ? `${data.avsluttes ? "Siste dag" : "Fornyes"} ${data.periodeSlutt}` : "—"}</span></div>
          <div className="phn-hoved"><strong>{p.igjen}</strong><span className="phn-forklar">klipp igjen denne perioden</span></div>
          <div className="klipp" role="img" aria-label={`${Math.max(0, p.totalt - p.igjen)} brukt, ${p.igjen} igjen av ${p.totalt}`}>
            {Array.from({ length: p.totalt }, (_, i) => <i key={i} className={i < p.totalt - p.igjen ? "brukt" : undefined} />)}
          </div>
          <p className="phn-kilde">{p.totalt} klipp i måneden. Én coachet økt trekker ett klipp.</p>
        </div>}
      </div>

      <div>
        <section className="phn-seksjon" aria-labelledby="abo-betaling">
          <div className="phn-sek-topp"><h2 id="abo-betaling">Betaling</h2></div>
          <div className="liste">
            <Link href="/portal/meg/abonnement/kort/ny"><span className="ikonboks" aria-hidden><CreditCard size={18} /></span><span><b>Bytt kort</b><span className="phn-kilde">Kortet lagres bare hos Stripe</span></span><ChevronRight size={20} aria-hidden /></Link>
            <Link href="/portal/meg/bookinger"><span className="ikonboks" aria-hidden><FileText size={18} /></span><span><b>Bookinger</b><span className="phn-kilde">Klippene brukes når du booker</span></span><ChevronRight size={20} aria-hidden /></Link>
          </div>
        </section>

        <section className="phn-seksjon" aria-labelledby="abo-kvitt">
          <div className="phn-sek-topp"><h2 id="abo-kvitt">Kvitteringer</h2></div>
          {data.fakturaer.length
            ? <div className="liste">{data.fakturaer.map((f) => <Link key={f.id} href={`/portal/meg/abonnement/faktura/${f.id}`}>
              <span className="ikonboks" aria-hidden><FileText size={18} /></span>
              <span><b>{f.gjelder}</b><span className="phn-kilde">{f.dato}</span></span>
              <span className="hoyre">{formaterKroner(f.belop)}<ChevronRight size={20} aria-hidden /></span>
            </Link>)}</div>
            : <p className="phn-forklar">Ingen betalinger ennå.</p>}
        </section>

        {data.kanAvsluttes && !data.avsluttes && <div className="phn-kort dempet">
          <b className="phn-undertittel">Avslutte {hva}</b>
          <p className="phn-forklar">Du beholder {p ? "pakken, klippene og Full" : "Full"}{data.periodeSlutt ? ` til og med ${data.periodeSlutt}` : " ut perioden"}.</p>
          <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => { setFeil(null); dialog.current?.showModal(); }}>Avslutt</button></div>
        </div>}
        {data.avsluttes && <div className="phn-kort dempet">
          <b className="phn-undertittel">Abonnementet er sagt opp</b>
          <p className="phn-forklar">Du beholder alt{data.periodeSlutt ? ` til og med ${data.periodeSlutt}` : " ut perioden"}. Ingen flere trekk etter det.</p>
        </div>}
      </div>
    </div>

    <dialog ref={dialog} className="phn-ark dialog" role="alertdialog" aria-labelledby="abo-dialog-tittel">
      <div className="phn-ark-kropp">
        <h2 id="abo-dialog-tittel">Avslutte {hva}?</h2>
        <p className="phn-forklar">Du beholder {p ? `pakken, klippene som er igjen (${p.igjen}) og Full` : "Full"}{data.periodeSlutt ? ` til og med ${data.periodeSlutt}` : " ut perioden"}. Etterpå har du Gratis, med mindre du velger Full. Planen og dataene dine blir liggende.</p>
        {data.periodeSlutt && <ul className="vilkaar"><li><b>Siste dag: {data.periodeSlutt}</b></li><li>Ingen flere trekk etter det.</li></ul>}
        <div aria-live="polite">{feil && <p className="phn-melding" role="alert">{feil}</p>}</div>
        <div className="phn-knapper">
          <button type="button" className="phn-knapp rust stor" onClick={bekreft} disabled={pending}>{pending ? "Avslutter …" : "Avslutt abonnementet"}</button>
          <button type="button" className="phn-knapp sek stor" onClick={() => dialog.current?.close()} disabled={pending}>Behold</button>
        </div>
      </div>
    </dialog>
  </div></SkraFlyt></div>;
}
