"use client";

/**
 * AG-06 Bookingen, pakke 3 (bygget natt 17.10 etter
 * docs/design-system/utkast-agencyos/kalender.html, skjermen «Bookingen»).
 * Én booking på egen side: tid i stort, oppsummering og handlingene.
 *
 * - Venter (uten betaling): Bekreft · Avvis (begrunnelsen blir utkast i Innboks).
 * - Bekreftet og kommende: Foreslå ny tid (spilleren godtar i PlayerHQ) · Avlys
 *   (alltid full refusjon eller klippet tilbake, §COACH SOM AVLYSER, 15.10).
 *
 * Avvik mot utkastet:
 *   - Avlysning har ikke «Angre i 10 sekunder»: refusjonen i Stripe kan ikke
 *     trekkes tilbake, så dialogen er bekreftelsen.
 *   - «Start live» står ikke her; live-økta startes fra Cockpit og Kalender.
 *   - Bildet øverst i utkastet er tatt ut (ingen bilde per tjeneste i basen).
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Knapp, KnappLenke, Pille, Topp, Varsel, type PilleTone } from "@/components/admin/agencyos-ny/ny";
import { bekreftBooking } from "@/app/admin/(legacy)/bookinger/actions";
import { avlysBookingSomCoach, avvisBookingMedBegrunnelse } from "@/app/admin/bookinger/actions";
import { foreslaaNyBookingtid, trekkTilbakeForslag } from "@/app/admin/kalender/flytt-actions";
import "@/styles/agencyos-ny-kalender.css";

export type AG06BookingenData = {
  id: string;
  hvem: string;
  tjeneste: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  datoLang: string;
  tid: string;
  /** Til flytteforslaget: «YYYY-MM-DD». */
  datoIso: string;
  varighetMin: number;
  sted: string;
  coach: string | null;
  betaling: string;
  pris: string;
  kontakt: string | null;
  spillerHref: string | null;
  notat: string | null;
  bestilt: string;
  forslag: string | null;
  kommende: boolean;
  harKonto: boolean;
};

const STATUS: Record<AG06BookingenData["status"], { tekst: string; tone: PilleTone }> = {
  PENDING: { tekst: "Venter på deg", tone: "vent" },
  CONFIRMED: { tekst: "Bekreftet", tone: "ok" },
  COMPLETED: { tekst: "Gjennomført", tone: "noy" },
  CANCELLED: { tekst: "Avlyst", tone: "noy" },
};

export function AG06Bookingen({ navn, b }: { navn: string; b: AG06BookingenData }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"avlys" | "avvis" | "flytt" | null>(null);
  const [tekst, setTekst] = useState("");
  const [nyDato, setNyDato] = useState(b.datoIso);
  const [nyTid, setNyTid] = useState(b.tid);
  const [feil, setFeil] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fornavn = b.hvem.split(" ")[0];

  const ferdig = (m: string) => { setFeil(null); setMelding(m); setDialog(null); setTekst(""); router.refresh(); };
  const kjor = (fn: () => Promise<{ ok: true } | { ok: false; feil: string } | void>, m: string) => start(async () => {
    try {
      const res = await fn();
      if (res && !res.ok) { setFeil(res.feil); return; }
      ferdig(m);
    } catch (e) {
      setFeil(e instanceof Error ? e.message : "Endringen kunne ikke lagres.");
    }
  });

  const avlys = () => start(async () => {
    const res = await avlysBookingSomCoach({ bookingId: b.id, begrunnelse: tekst.trim() || undefined });
    if (!res.ok) { setFeil(res.feil); setDialog(null); return; }
    ferdig(res.refusjonVenter ? "Timen er avlyst. Refusjonen venter hos Stripe og følges opp."
      : res.refundert ? "Timen er avlyst og hele beløpet er refundert."
      : res.klippTilbake ? "Timen er avlyst og klippet er ført tilbake." : "Timen er avlyst.");
  });
  const avvis = () => start(async () => {
    const res = await avvisBookingMedBegrunnelse({ bookingId: b.id, begrunnelse: tekst });
    if (!res.ok) { setFeil(res.feil); setDialog(null); return; }
    ferdig(res.utkast ? "Bookingen er avvist. Svaret ligger som utkast i Innboks." : "Bookingen er avvist. Kunden har ingen e-post, så det ble ikke laget noe utkast.");
  });

  const st = STATUS[b.status];
  return (
    <AgencyOSSkall navn={navn}>
      <div className="agn-s">
        <Topp tilbake={{ href: "/admin/bookinger", tekst: "Booking" }} dato="Booking" tittel={`${b.hvem} · ${b.tjeneste}`} />
        <div className="smal-innhold">
          {feil && <Varsel tone="advarsel">{feil}</Varsel>}
          {melding && !feil && <Varsel tone="ok">{melding}</Varsel>}
          <div className="booking-helt">
            <Pille tone={st.tone}>{st.tekst}</Pille>
            <span style={{ font: "600 15px/1.2 var(--sans)", opacity: 0.9 }}>{b.datoLang}</span>
            <span className="bt-tid">{b.tid}<small>{b.varighetMin} min</small></span>
            <span style={{ fontSize: 14, opacity: 0.92 }}>{b.sted}</span>
          </div>
          <ul className="oppsummering">
            <li><span>Coach</span><b>{b.coach ?? "—"}</b></li>
            <li><span>Betaling</span><b>{b.betaling} · {b.pris}</b></li>
            <li><span>Kontakt</span><b>{b.kontakt ?? "—"}</b></li>
            <li><span>Beskjed</span><b>{b.notat ?? "—"}</b></li>
            <li><span>Bestilt</span><b>{b.bestilt}</b></li>
            {b.forslag && <li><span>Ny tid</span><b>{b.forslag} · venter på {fornavn}</b></li>}
          </ul>
          <div className="knapper">
            {b.status === "PENDING" && <>
              <Knapp disabled={pending} onClick={() => kjor(() => bekreftBooking(b.id), "Bookingen er bekreftet.")}>Bekreft booking</Knapp>
              <Knapp variant="sek" onClick={() => { setDialog("avvis"); setTekst(""); setFeil(null); }}>Avvis</Knapp>
            </>}
            {b.status === "CONFIRMED" && b.kommende && b.harKonto && (b.forslag
              ? <Knapp variant="sek" disabled={pending} onClick={() => kjor(() => trekkTilbakeForslag(b.id), "Forslaget er trukket tilbake.")}>Trekk tilbake forslaget</Knapp>
              : <Knapp variant="sek" onClick={() => { setDialog("flytt"); setFeil(null); }}>Foreslå ny tid</Knapp>)}
            {b.status === "CONFIRMED" && b.kommende && <Knapp variant="sek" onClick={() => { setDialog("avlys"); setTekst(""); setFeil(null); }}>Avlys</Knapp>}
            {b.spillerHref && <KnappLenke href={b.spillerHref}>Åpne spilleren</KnappLenke>}
          </div>
          {b.status === "CONFIRMED" && b.kommende && !b.harKonto && <p className="kildetekst">Gjesten har ingen PlayerHQ-konto å godta ny tid i. Avtal ny tid direkte, eller avlys.</p>}
        </div>

        {dialog === "avlys" && <div className="dialog-lag"><div role="alertdialog" aria-modal="true" aria-labelledby="av-tittel" className="dialog">
          <h2 id="av-tittel">Avlyse timen med {fornavn} kl. {b.tid}?</h2>
          <p className="forklar">{fornavn} får beskjed på e-post{b.harKonto ? " og i PlayerHQ" : ""}. {b.betaling === "Betalt" ? "Hele beløpet refunderes." : b.betaling === "Klipp" ? "Klippet går tilbake til pakken." : "Det er ingen betaling å føre tilbake."}</p>
          <label className="felt"><span className="etikett">Begrunnelse (valgfritt, lagres i loggen)</span><textarea rows={2} value={tekst} onChange={(e) => setTekst(e.target.value)} /></label>
          <div className="knapper">
            <Knapp variant="rust" stor disabled={pending} onClick={avlys}>{pending ? "Avlyser …" : "Avlys timen"}</Knapp>
            <Knapp variant="sek" stor onClick={() => setDialog(null)}>Behold timen</Knapp>
          </div>
        </div></div>}

        {dialog === "avvis" && <div className="dialog-lag"><div role="alertdialog" aria-modal="true" aria-labelledby="avv-tittel" className="dialog">
          <h2 id="avv-tittel">Avvise bookingen?</h2>
          <p className="forklar">Begrunnelsen blir et svarutkast i Innboks. Ingenting sendes før du sender det selv.</p>
          <label className="felt"><span className="etikett">Kort begrunnelse</span>
            <textarea rows={3} value={tekst} onChange={(e) => setTekst(e.target.value)} />
            <span className={tekst && tekst.trim().length < 8 ? "feiltekst" : "hjelp"}>Minst 8 tegn.</span></label>
          <div className="knapper">
            <Knapp variant="rust" stor disabled={tekst.trim().length < 8 || pending} onClick={avvis}>Avvis</Knapp>
            <Knapp variant="sek" stor onClick={() => setDialog(null)}>Avbryt</Knapp>
          </div>
        </div></div>}

        {dialog === "flytt" && <div className="dialog-lag"><div role="dialog" aria-modal="true" aria-labelledby="fl-tittel" className="dialog">
          <h2 id="fl-tittel">Foreslå ny tid</h2>
          <p className="forklar">Timen står på den gamle tiden til {fornavn} godtar i PlayerHQ.</p>
          <div className="to-felt">
            <label className="felt"><span className="etikett">Dato</span><input type="date" value={nyDato} onChange={(e) => setNyDato(e.target.value)} /></label>
            <label className="felt"><span className="etikett">Tid</span><input type="time" value={nyTid} onChange={(e) => setNyTid(e.target.value)} /></label>
          </div>
          <div className="knapper">
            <Knapp stor disabled={pending || !nyDato || !nyTid} onClick={() => kjor(() => foreslaaNyBookingtid({ bookingId: b.id, dato: nyDato, tid: nyTid }), "Forslaget er sendt. Timen står på den gamle tiden til spilleren har godtatt.")}>{pending ? "Sender …" : "Send forslaget"}</Knapp>
            <Knapp variant="sek" stor onClick={() => setDialog(null)}>Avbryt</Knapp>
          </div>
        </div></div>}
      </div>
    </AgencyOSSkall>
  );
}
