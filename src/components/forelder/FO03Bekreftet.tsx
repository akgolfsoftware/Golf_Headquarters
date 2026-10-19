/**
 * FO-03 Bekreftet: kvitteringen etter at forelderen har booket for barnet — Precision Athletics.
 * Fasit: docs/design-system/utkast-flater/forelder.html, mal «bekreftet».
 * Stil: src/styles/flater-ny-forelder-booking.css. Ingen "use client": siden lager dataene (eierskapssjekk
 * mot forelderens barn og Google Kalender-lenke) på serveren.
 *
 * Avvik:
 *   - Referanse og klippestatus er ikke med: siden har bare bookingen, ikke barnets klipp.
 */
import { Check } from "lucide-react";
import { KnappLenke } from "@/components/precision/pa";
import "@/styles/flater-ny-forelder-booking.css";

export type FO03BekreftetData = {
  barnFornavn: string | null;
  tjeneste: string;
  ukedagKort: string;
  dagTall: string;
  maanedKort: string;
  datoLang: string;
  klokkeslett: string;
  coachNavn: string | null;
  sted: string;
  varighetMin: number;
  kalenderUrl: string;
  avbestillingTimer: number;
};

export function FO03Bekreftet({ data }: { data: FO03BekreftetData }) {
  const coachFornavn = data.coachNavn?.split(" ")[0] ?? null;
  return (
    <div className="fob">
      <header className="fob-hode">
        <span className="pa-status pa-status--ok" style={{ alignSelf: "flex-start" }}><Check size={14} aria-hidden />Bekreftet</span>
        <h1>Timen er booket</h1>
        <p>
          {data.barnFornavn ? `Timen er lagt inn på ${data.barnFornavn}.` : "Timen er lagt inn."} Du finner den under Bookinger.
        </p>
      </header>
      <div className="fob-booking">
        <div className="fob-dag" aria-hidden><span>{data.ukedagKort}</span><b>{data.dagTall}</b><span>{data.maanedKort}</span></div>
        <div>
          <strong>{data.tjeneste}{coachFornavn ? ` med ${coachFornavn}` : ""}</strong>
          <p>kl. {data.klokkeslett} · {data.varighetMin} min · {data.sted || "—"}</p>
        </div>
      </div>
      <div className="fob-kort">
        <dl className="fob-dl">
          <div><dt>Dato</dt><dd>{data.datoLang}</dd></div>
          <div><dt>Coach</dt><dd>{data.coachNavn ?? "—"}</dd></div>
          <div><dt>Gratis avbestilling</dt><dd>Inntil {data.avbestillingTimer} timer før</dd></div>
        </dl>
      </div>
      <div className="fob-knapper">
        <a href={data.kalenderUrl} target="_blank" rel="noopener noreferrer" className="pa-btn pa-btn--secondary pa-btn--lg">Legg i kalender</a>
        <KnappLenke href="/forelder/bookinger" variant="secondary" size="lg">Til bookinger</KnappLenke>
      </div>
    </div>
  );
}
