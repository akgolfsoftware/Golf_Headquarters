"use client";

/**
 * PH-25 Innstillinger i nytt design: samtykker, kalender, varsler, sikkerhet, hjelp og konto, med
 * «Slett kontoen min» som forespørsel bak en dialog der spilleren skriver SLETT (rust bekreft).
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, skjermen «Innstillinger»).
 * Stil: src/styles/playerhq-ny-meg.css. Sletting går via opprettGdprForesporsel (uendret).
 *
 * Avvik:
 *   - Radene er lenker til undersidene med status, ikke brytere direkte på skjermen: hver innstilling
 *     har sin egen side med egen lagring og samtykketekst. Samtykker (helse og deling) skal ikke slås
 *     av eller på uten at teksten er lest.
 *   - «Opptak i coachingøkt» er ikke egen rad: opptakssamtykket gis i oppstarten.
 *   - Google-kalender ligger under Integrasjoner; status hentes ikke her.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-25-INNSTILLINGER.
 */
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Bot, Building2, CalendarDays, ChevronLeft, ChevronRight, CircleHelp, Download, HeartPulse, Languages, MessageSquare, Share2, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { opprettGdprForesporsel } from "@/lib/moderering/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";

export type PH25InnstillingerData = {
  helseLogg: boolean;
  /** Antall varseltyper som er slått på, og hvor mange det finnes. */
  varsler: { paa: number; av: number };
  deling: number | null;
  spraak: "Norsk" | "English";
  /** Det finnes allerede en åpen sletteforespørsel. */
  slettingSendt?: boolean;
};

function Rad({ href, ikon, tittel, kilde, status }: { href: string; ikon: ReactNode; tittel: string; kilde: string; status?: ReactNode }) {
  return <Link href={href}>
    <span className="ikonboks" aria-hidden>{ikon}</span>
    <span><b>{tittel}</b><span className="phn-kilde">{kilde}</span></span>
    <span className="hoyre">{status}<ChevronRight size={20} aria-hidden /></span>
  </Link>;
}
const Pille = ({ paa, tekst }: { paa: boolean; tekst?: string }) => <span className={`phn-pille ${paa ? "ok" : "noy"}`}><i />{tekst ?? (paa ? "På" : "Av")}</span>;

export function PH25Innstillinger({ data, slett = opprettGdprForesporsel }: { data: PH25InnstillingerData; slett?: typeof opprettGdprForesporsel }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [tekst, setTekst] = useState("");
  const [sendt, setSendt] = useState(Boolean(data.slettingSendt));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function send() {
    setFeil(null);
    start(async () => {
      try {
        const r = await slett();
        if (r.ok) { setSendt(true); setTekst(""); dialog.current?.close(); }
        else setFeil(r.error ?? "Kunne ikke sende forespørselen. Prøv igjen.");
      } catch { setFeil("Kunne ikke sende forespørselen. Prøv igjen."); }
    });
  }

  return <div className="phn phn-meg"><div className="side">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link>
      <div><div className="phn-dato">Meg · innstillinger</div><h1 className="phn-tittel">Innstillinger</h1></div>
    </div>

    <div className="to-del">
      <div>
        <section className="phn-seksjon" aria-labelledby="inn-samtykker">
          <div className="phn-sek-topp"><h2 id="inn-samtykker">Samtykker</h2></div>
          <div className="liste">
            <Rad href="/portal/meg/innstillinger/personvern" ikon={<HeartPulse size={18} />} tittel="Helse-logg og Ytelsesbilde" kilde="Søvn, puls og skader. Coachen ser det." status={<Pille paa={data.helseLogg} />} />
            <Rad href="/portal/meg/innstillinger/personvern/deling" ikon={<Share2 size={18} />} tittel="Deling" kilde="Hvem ser profilen din" status={data.deling != null ? <span className="phn-pille noy"><i />{data.deling}</span> : undefined} />
          </div>
          <p className="phn-kilde">Navnet ditt tas ut før tekst sendes til AI. AK Golf kan bruke dataene anonymisert, som det står i vilkårene.</p>
        </section>
        <section className="phn-seksjon" aria-labelledby="inn-kalender">
          <div className="phn-sek-topp"><h2 id="inn-kalender">Kalender og varsler</h2></div>
          <div className="liste">
            <Rad href="/portal/meg/innstillinger/integrasjoner" ikon={<CalendarDays size={18} />} tittel="Kalender og integrasjoner" kilde="Google-kalender og TrackMan" />
            <Rad href="/portal/meg/innstillinger/varsler" ikon={<Bell size={18} />} tittel="Varsler" kilde={`${data.varsler.paa} av ${data.varsler.av} slått på`} />
          </div>
        </section>
        <section className="phn-seksjon" aria-labelledby="inn-trening">
          <div className="phn-sek-topp"><h2 id="inn-trening">Trening</h2></div>
          <div className="liste">
            <Rad href="/portal/meg/innstillinger/anlegg" ikon={<Building2 size={18} />} tittel="Fasiliteter" kilde="Hvor du kan trene" />
            <Rad href="/portal/meg/innstillinger/ai-coach" ikon={<Bot size={18} />} tittel="Caddie" kilde="Hva Caddie husker om deg" />
            <Rad href="/portal/meg/innstillinger/sprak" ikon={<Languages size={18} />} tittel="Språk og enheter" kilde={data.spraak} />
          </div>
        </section>
      </div>

      <div>
        <section className="phn-seksjon" aria-labelledby="inn-sikkerhet">
          <div className="phn-sek-topp"><h2 id="inn-sikkerhet">Sikkerhet</h2></div>
          <div className="liste">
            <Rad href="/portal/meg/innstillinger/sikkerhet" ikon={<ShieldCheck size={18} />} tittel="Innlogging og tofaktor" kilde="Passord, tofaktor og enheter" />
            <Rad href="/portal/meg/innstillinger/eksport" ikon={<Download size={18} />} tittel="Last ned dataene dine" kilde="Profil, runder, økter og betalinger i én fil" />
          </div>
        </section>
        <section className="phn-seksjon" aria-labelledby="inn-hjelp">
          <div className="phn-sek-topp"><h2 id="inn-hjelp">Hjelp</h2></div>
          <div className="liste">
            <Rad href="/portal/meg/help" ikon={<CircleHelp size={18} />} tittel="Spørsmål og svar" kilde="Slik bruker du PlayerHQ" />
            <Rad href="/portal/meg/feedback" ikon={<MessageSquare size={18} />} tittel="Gi tilbakemelding" kilde="Vi leser alt" />
          </div>
        </section>
        <section className="phn-seksjon" aria-labelledby="inn-konto">
          <div className="phn-sek-topp"><h2 id="inn-konto">Konto</h2></div>
          <div className="phn-kort dempet">
            <b className="phn-undertittel">Slett kontoen min</b>
            {sendt
              ? <p className="phn-forklar" role="status">Forespørselen er sendt. Coachen eller AK Golf sletter kontoen, og du får beskjed når det er gjort.</p>
              : <>
                <p className="phn-forklar">Du sender en forespørsel. Coachen eller AK Golf sletter kontoen og dataene dine, og du får beskjed når det er gjort.</p>
                <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => { setFeil(null); dialog.current?.showModal(); }}>Slett kontoen min</button></div>
              </>}
          </div>
        </section>
      </div>
    </div>

    <dialog ref={dialog} className="phn-ark dialog" role="alertdialog" aria-labelledby="slett-tittel">
      <div className="phn-ark-kropp">
        <h2 id="slett-tittel">Slette kontoen?</h2>
        <p className="phn-forklar">Ved godkjenning anonymiseres navn, e-post, telefon og bilde. Det kan ikke angres. Avidentifisert treningshistorikk beholdes, og turneringsresultatene i GolfBox blir liggende der.</p>
        <label className="phn-felt">Skriv SLETT for å bekrefte<input className="slett-felt" value={tekst} onChange={(e) => setTekst(e.target.value)} autoComplete="off" autoCapitalize="characters" /></label>
        <div aria-live="polite">{feil && <p className="phn-melding" role="alert">{feil}</p>}</div>
        <div className="phn-knapper">
          <button type="button" className="phn-knapp rust stor" onClick={send} disabled={pending || tekst.trim() !== "SLETT"}>{pending ? "Sender …" : "Send sletteforespørsel"}</button>
          <button type="button" className="phn-knapp sek stor" onClick={() => { setTekst(""); dialog.current?.close(); }} disabled={pending}>Avbryt</button>
        </div>
      </div>
    </dialog>
  </div></div>;
}
