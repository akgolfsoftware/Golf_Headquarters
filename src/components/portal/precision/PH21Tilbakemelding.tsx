"use client";

/**
 * PH-21 Tilbakemelding på én økt — nytt design (pakke 11 og 12, godkjent 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/booking-meldinger.html, mal «tilbakemelding».
 * Data: getCoachTilbakemeldingData. Handlinger: kvitterTilbakemelding («Forstått») og sendTilbakemeldingSvar.
 *
 * Avvik:
 *   - Coachens egne ord (notatet) står øverst som «Fra {coach}». Utkastet har bare «Tre ting å ta med»;
 *     de vises bare når coachen har skrevet dem (completedSummary.coachTakeaways).
 *   - Videoklipp vises som lenker til klippene fra økta (ingen miniatyrbilde eller lengde i basen).
 *     Uten klipp står «Ingen videoklipp fra denne økta».
 *   - «Lagt i planen din» er utelatt: dataene sier ikke hvilke økter coachen la inn etter økta.
 *     Lenken «Se planen din» står i stedet.
 *   - «Hvordan opplevde du økta?» 1–5 er utelatt: ingen handling lagrer tallet. Kommentaren sendes
 *     med «Send kommentar» (samme lagring som før, completedSummary.dineOrd).
 *   - Venter-tilstanden lover ikke når tilbakemeldingen kommer.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, MessageSquare, Video } from "lucide-react";
import { kvitterTilbakemelding, sendTilbakemeldingSvar } from "@/app/portal/coach/tilbakemelding/[oktId]/actions";
import type { CoachTilbakemeldingData } from "@/lib/portal-okt/coach-tilbakemelding-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-booking-meldinger.css";

const TRAAD = "/portal/coach/melding";

function Tilbake() {
  return <Link href="/portal/coach" className="phn-k-tilbake"><ChevronLeft className="phn-ikon" aria-hidden />Meldinger</Link>;
}

/** sub er «tittel · dato · sted»; de to siste leddene er dato og sted. */
function delSub(sub: string): { tittel: string; naar: string } {
  const deler = sub.split(" · ");
  if (deler.length < 3) return { tittel: sub, naar: "" };
  return { tittel: deler.slice(0, -2).join(" · "), naar: deler.slice(-2).join(" · ") };
}

export function PH21Tilbakemelding({ data }: { data: CoachTilbakemeldingData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [svar, setSvar] = useState(data.found && data.dittSvar ? data.dittSvar.tekst : "");
  const [status, setStatus] = useState<{ ok: boolean; tekst: string } | null>(null);

  if (!data.found) {
    return <div className="phn">
      <div className="phn-bm-topp"><Tilbake /></div>
      <section className="phn-kort" style={{ background: "var(--phn-sand-100)" }}>
        <b className="phn-bm-undertittel">Fant ikke økta</b>
        <p className="phn-forklar">Den kan være slettet fra planen, eller lenken er gammel. Alt fra coachen din ligger fortsatt under Meldinger.</p>
        <div className="phn-knapper"><Link href="/portal/coach" className="phn-knapp pri">Til Meldinger</Link></div>
      </section>
    </div>;
  }

  const { tittel, naar } = delSub(data.sub);
  const fornavn = data.coach?.fornavn ?? "coachen";
  const skrevet = data.tilstand === "skrevet";

  const kjor = (handling: () => Promise<{ ok: true } | { ok: false; error: string }>, okTekst: string) => {
    setStatus(null);
    startTransition(async () => {
      const res = await handling();
      if (res.ok) {
        setStatus({ ok: true, tekst: okTekst });
        router.refresh();
      } else {
        setStatus({ ok: false, tekst: res.error });
      }
    });
  };

  return <div className="phn">
    <div className="phn-bm-topp">
      <Tilbake />
      <div>
        <div className="phn-dato">Tilbakemelding · fra {data.coach?.navn ?? "coachen"}{naar ? ` · ${naar}` : ""}</div>
        <h1 className="phn-tittel">{tittel}</h1>
      </div>
      <p className="phn-bm-kildetekst">{data.kildeMeta}</p>
    </div>

    {skrevet ? <div className="phn-bm-grid">
      <div>
        <section className="phn-seksjon">
          <div className="phn-sek-topp"><h2>Fra {fornavn}</h2></div>
          <div className="phn-bm-prosa">{data.prosa.map((a, i) => <p key={i}>{a}</p>)}</div>
        </section>
        {data.punkter.length > 0 && <section className="phn-seksjon">
          <div className="phn-sek-topp"><h2>Tre ting å ta med</h2></div>
          <ol className="phn-bm-tre-ting">{data.punkter.map((p, i) => <li key={i}><span>{p}</span></li>)}</ol>
        </section>}
        <section className="phn-seksjon">
          <div className="phn-sek-topp"><h2>Videoklipp</h2>{data.klipp.length > 0 && <span className="phn-kilde">{data.klipp.length} fra økta</span>}</div>
          {data.klipp.length > 0
            ? <div className="phn-bm-klipp">{data.klipp.map((k) => <a key={k.id} href={k.url} target="_blank" rel="noreferrer">
                <Video className="phn-ikon" aria-hidden /><span><b>{k.label}</b><small>{k.meta}</small></span><span className="phn-kilde" style={{ color: "inherit" }}>Spill av</span>
              </a>)}</div>
            : <p className="phn-bm-klipp-tom phn-kilde">Ingen videoklipp fra denne økta.</p>}
        </section>
        <div className="phn-knapper"><Link href="/portal/planlegge" className="phn-knapp sek">Se planen din</Link><Link href="/portal/drills" className="phn-knapp sek">Til Øvelsesbanken</Link></div>
      </div>
      {data.kanSvare && <aside>
        <section className="phn-kort">
          <b className="phn-bm-undertittel">Din side av det</b>
          {data.kvittert && <div className="phn-bm-kvittert"><Check className="phn-ikon" aria-hidden />Kvittert. {fornavn} ser at du har lest.</div>}
          {data.dittSvar && <p className="phn-kilde">{data.dittSvar.sendt}. Du kan oppdatere kommentaren under.</p>}
          <div className="phn-felt">
            <label htmlFor="tb-tekst">Kommentar til {fornavn}</label>
            <textarea id="tb-tekst" rows={3} value={svar} onChange={(e) => setSvar(e.target.value)} maxLength={2000} />
          </div>
          <div className="phn-bm-knapper">
            {!data.kvittert && <button type="button" className="phn-knapp pri phn-k-stor" disabled={pending}
              onClick={() => kjor(() => kvitterTilbakemelding({ oktId: data.oktId }), `Kvittert. ${fornavn} ser at du har lest.`)}>Forstått</button>}
            <button type="button" className={`phn-knapp ${data.kvittert ? "pri" : "sek"}`} disabled={pending || svar.trim().length === 0}
              onClick={() => kjor(() => sendTilbakemeldingSvar({ oktId: data.oktId, tekst: svar }), "Kommentaren er sendt.")}>Send kommentar</button>
            <Link href={TRAAD} className="phn-knapp sek"><MessageSquare className="phn-ikon" aria-hidden />Åpne tråden med {fornavn}</Link>
          </div>
          {status && <p role="status" className={status.ok ? "phn-bm-kvittert" : "phn-k-feil"}>{status.tekst}</p>}
        </section>
      </aside>}
    </div> : <section className="phn-kort phn-k-smal" style={{ background: "var(--phn-sand-100)" }}>
      <b className="phn-bm-undertittel">Tilbakemeldingen er ikke skrevet ennå</b>
      <p className="phn-forklar">Du får beskjed i Innboks når {fornavn} har skrevet den. Vil du spørre om noe før det, skriv i tråden.</p>
      <div className="phn-knapper">
        <Link href={`/portal/gjennomfore/${data.oktId}`} className="phn-knapp pri">Se hva økta inneholdt</Link>
        <Link href={TRAAD} className="phn-knapp sek"><MessageSquare className="phn-ikon" aria-hidden />Åpne tråden med {fornavn}</Link>
      </div>
    </section>}
  </div>;
}
