"use client";

/**
 * Kjøp av gavekort (bookingplanen steg 7). Velg beløp, fyll inn deg og eventuelt mottaker,
 * og betal med kort eller Apple Pay i Stripe. Koden sendes på e-post når betalingen er gjennomført.
 */
import { useState } from "react";
import { Lock } from "lucide-react";
import { startGavekortKjop } from "@/app/(marketing)/gavekort/actions";
import { Knapp, KnappLenke, Meta } from "@/components/precision/pa";
import { Skjemafelt } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import "@/styles/precision-athletics.css";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-a4.css";
import "@/styles/precision-bk.css";

const BELOP = [500, 1000, 1500, 2000] as const;
const kr = (v: number) => `${Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} kr`;
const okMail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

function Ramme({ children }: { children: React.ReactNode }) {
  return <div className="pa-root bk" data-design="precision-athletics">
    <header className="bk__topp"><div className="bk__toppin" style={{ maxWidth: 720 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="bk__logo" src="/logos/logo-ak-golf-academy.svg" alt="AK Golf Academy" />
      <span style={{ flex: 1 }} /><Meta>GAVEKORT</Meta>
    </div></header>
    <main className="bk__innhold" style={{ maxWidth: 720 }}>{children}</main>
  </div>;
}

export function GavekortKjop({ apen, acuityUrl }: { apen: boolean; acuityUrl: string }) {
  const [belop, setBelop] = useState<number>(1000);
  const [annet, setAnnet] = useState("");
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [tilAnnen, setTilAnnen] = useState(false);
  const [mottaker, setMottaker] = useState("");
  const [melding, setMelding] = useState("");
  const [feil, setFeil] = useState<Record<string, string>>({});
  const [betalfeil, setBetalfeil] = useState<string | null>(null);
  const [sender, setSender] = useState(false);

  if (!apen) {
    return <Ramme>
      <h1 className="bk__h1">Gavekort</h1>
      <p style={{ margin: 0, font: "var(--type-body-m)" }}>Gavekort kjøpes foreløpig hos bookingtjenesten vår.</p>
      <div><KnappLenke href={acuityUrl}>Gå til bookingtjenesten</KnappLenke></div>
    </Ramme>;
  }

  const valgt = annet.trim() ? Number(annet.replace(/\s/g, "")) : belop;

  const betal = async () => {
    const x: Record<string, string> = {};
    if (!Number.isInteger(valgt) || valgt < 500 || valgt > 10000) x.belop = "Velg et beløp mellom 500 og 10 000 kroner.";
    if (!navn.trim()) x.navn = "Skriv inn navnet ditt.";
    if (!okMail(epost.trim())) x.epost = "Skriv inn en gyldig e-post.";
    if (tilAnnen && !okMail(mottaker.trim())) x.mottaker = "Skriv inn mottakerens e-post.";
    setFeil(x);
    if (Object.keys(x).length) return;
    setSender(true); setBetalfeil(null);
    const res = await startGavekortKjop({
      belopKr: valgt, navn: navn.trim(), epost: epost.trim(),
      ...(tilAnnen ? { mottakerEpost: mottaker.trim(), melding: melding.trim() || undefined } : {}),
    });
    if (res.ok) { window.location.href = res.url; return; }
    setSender(false); setBetalfeil(res.error);
  };

  return <Ramme>
    <h1 className="bk__h1">Gi bort en time</h1>
    <p style={{ margin: 0, font: "var(--type-body-m)", color: "var(--text-secondary)" }}>
      Gavekortet har en verdi i kroner og gjelder alle tjenester og alle coacher. Er kortet mindre enn prisen på timen, betaler man resten med kort, og det som er igjen kan brukes senere. Gyldig i tre år.
    </p>
    <div className="bk__skjema">
      <Skjemafelt label="Beløp" error={feil.belop}>
        <div role="group" aria-label="Beløp" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {BELOP.map((b) => <button key={b} type="button" className="bk__valg" style={{ minHeight: 0, padding: "10px 14px" }} aria-checked={!annet.trim() && belop === b} role="radio"
            onClick={() => { setBelop(b); setAnnet(""); }}><span className="bk__valg-navn">{kr(b)}</span></button>)}
        </div>
      </Skjemafelt>
      <Skjemafelt label="Annet beløp i kroner (valgfritt)">
        <input className="a4-input a4-input--mono bk__input" aria-label="Annet beløp i kroner" inputMode="numeric" value={annet} onChange={(e) => setAnnet(e.target.value.replace(/[^\d\s]/g, ""))} />
      </Skjemafelt>
      <Skjemafelt label="Ditt navn" required error={feil.navn}><input className="a4-input bk__input" aria-label="Ditt navn" value={navn} autoComplete="name" onChange={(e) => setNavn(e.target.value)} /></Skjemafelt>
      <Skjemafelt label="Din e-post" required error={feil.epost}><input className="a4-input bk__input" aria-label="Din e-post" type="email" value={epost} autoComplete="email" onChange={(e) => setEpost(e.target.value)} /></Skjemafelt>
      <label className="pa-check"><input type="checkbox" checked={tilAnnen} onChange={(e) => setTilAnnen(e.target.checked)} />
        <span className="pa-check__box" aria-hidden>{tilAnnen && <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>}</span>
        <span>Send gavekortet direkte til mottakeren</span></label>
      {tilAnnen && <>
        <Skjemafelt label="Mottakerens e-post" required error={feil.mottaker}><input className="a4-input bk__input" aria-label="Mottakerens e-post" type="email" value={mottaker} autoComplete="off" onChange={(e) => setMottaker(e.target.value)} /></Skjemafelt>
        <Skjemafelt label="Hilsen (valgfritt)"><textarea className="a4-input bk__input" aria-label="Hilsen" rows={3} maxLength={300} value={melding} onChange={(e) => setMelding(e.target.value)} /></Skjemafelt>
      </>}
      <Meta>DU SENDES TIL STRIPE FOR Å BETALE MED KORT ELLER APPLE PAY</Meta>
      {betalfeil && <InlineVarsel tone="signal">{betalfeil}</InlineVarsel>}
    </div>
    <div className="bk__knapper">
      <Knapp icon={Lock} loading={sender} loadingText="Sender deg til betaling …" onClick={() => void betal()}>
        {Number.isInteger(valgt) && valgt > 0 ? `Betal ${kr(valgt)}` : "Betal"}
      </Knapp>
    </div>
  </Ramme>;
}

export function GavekortTakk() {
  return <Ramme>
    <h1 className="bk__h1">Takk</h1>
    <p style={{ margin: 0, font: "var(--type-body-m)" }}>
      Betalingen er mottatt. Gavekortet og koden sendes på e-post om et øyeblikk. Kommer det ikke innen noen minutter, sjekk søppelpost eller skriv til post@akgolf.no.
    </p>
    <div><KnappLenke href="/booking">Book en time</KnappLenke></div>
  </Ramme>;
}
