/**
 * PH-21 Ønsket økt sendt — nytt design (pakke 11 og 12, godkjent 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/booking-meldinger.html, mal «onsket».
 * Ingen "use client": siden har ingen egen tilstand.
 *
 * Avvik:
 *   - Viser siste ønske med status (Venter på coach · Godtatt · Avslått · Trukket). Hake og overskrift følger statusen.
 *   - «Hva skjer nå?» sier hva koden faktisk gjør: coachen godtar eller avslår ønsket, og en godtatt økt
 *     legges i planen. Steget om forslag i Innboks og klipp er utelatt: et ønske blir ikke en booking.
 *   - Coachens svar (coachResponse) vises når det finnes.
 *   - Uten coach på ønsket står «coachen».
 */
import Link from "next/link";
import { Check, Clock, X } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-booking-meldinger.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke8-skra.css";

export type PH21OnsketStatus = "PENDING" | "APPROVED" | "DECLINED" | "CANCELLED";

export type PH21OnsketData = {
  coachNavn: string | null;
  /** «i dag 14:20» / «5. okt. 14:20». */
  sendt: string;
  naar: string | null;
  tema: string | null;
  hvorfor: string | null;
  status: PH21OnsketStatus;
  svar: string | null;
} | null;

const STATUS: Record<PH21OnsketStatus, { tekst: string; pille: string }> = {
  PENDING: { tekst: "Venter på coach", pille: "vent" },
  APPROVED: { tekst: "Godtatt", pille: "ok" },
  DECLINED: { tekst: "Avslått", pille: "noy" },
  CANCELLED: { tekst: "Trukket", pille: "noy" },
};

export function PH21OnsketBekreftet({ data }: { data: PH21OnsketData }) {
  if (!data) {
    return <div className="phn"><div className="phn-k-smal">
      <div><div className="phn-dato">Ønsket økt</div><h1 className="phn-tittel">Ingen ønsker ennå</h1></div>
      <section className="phn-kort" style={{ background: "var(--phn-sand-100)" }}>
        <p className="phn-forklar">Du har ikke sendt noe ønske om økt. Send et ønske, så hjelper coachen deg å finne en tid.</p>
        <div className="phn-knapper"><Link href="/portal/onskeligokt" className="phn-knapp pri">Be om økt</Link></div>
      </section>
    </div></div>;
  }

  const coach = data.coachNavn ?? "coachen";
  const fornavn = data.coachNavn?.split(" ")[0] ?? "coachen";
  const s = STATUS[data.status];
  const tittel = data.status === "APPROVED" ? `${fornavn} har godtatt ønsket ditt`
    : data.status === "DECLINED" ? `${fornavn} har avslått ønsket`
    : data.status === "CANCELLED" ? "Ønsket er trukket"
    : `${fornavn.charAt(0).toUpperCase()}${fornavn.slice(1)} har fått ønsket ditt`;
  const venter = data.status === "PENDING";

  return <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Ønsket økt"
      bilde="/images/playerhq/tek-video.jpg" bildePosisjon="50% 50%"
      overlinje={`Ønsket økt · sendt ${data.sendt}`}
      tittel={tittel}
    />
    <SkraFlyt lav>
    <div className="phn-k-smal">
    <div className="phn-k-bekreftet-topp">
      <span className={`phn-k-hake${data.status === "APPROVED" ? "" : " phn-bm-venter"}`} aria-hidden>
        {data.status === "APPROVED" ? <Check className="phn-ikon" /> : venter ? <Clock className="phn-ikon" /> : <X className="phn-ikon" />}
      </span>
      <span className={`phn-pille ${s.pille}`}>{s.tekst}</span>
    </div>
    <div className="phn-kort">
      <ul className="phn-k-oppsummering">
        <li><span>Til</span><b>{coach}</b></li>
        <li><span>Når</span><b>{data.naar ?? "—"}</b></li>
        <li><span>Tema</span><b>{data.tema ?? "—"}</b></li>
        <li><span>Hvorfor</span><span style={{ color: "var(--phn-g900)" }}>{data.hvorfor ? `«${data.hvorfor}»` : "—"}</span></li>
        {data.svar && <li><span>Svar</span><span style={{ color: "var(--phn-g900)" }}>«{data.svar}»</span></li>}
      </ul>
    </div>
    {venter && <section className="phn-seksjon">
      <div className="phn-sek-topp"><h2>Hva skjer nå?</h2></div>
      <ol className="phn-bm-steg">
        <li className="gjort"><i><Check className="phn-ikon" aria-hidden /></i><span>Ønsket er sendt til {coach}.</span></li>
        <li><i>2</i><span>{fornavn.charAt(0).toUpperCase()}{fornavn.slice(1)} godtar eller avslår ønsket. Du ser svaret her og i Meldinger.</span></li>
        <li><i>3</i><span>Godtar {fornavn} ønsket, legges økta inn i planen din.</span></li>
      </ol>
    </section>}
    <div className="phn-knapper">
      <Link href="/portal/coach?tab=ønske" className="phn-knapp pri">Til meldingene</Link>
      <Link href="/portal" className="phn-knapp sek">Til I dag</Link>
    </div>
  </div></SkraFlyt></div>;
}
