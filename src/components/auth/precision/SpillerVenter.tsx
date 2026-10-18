"use client";

/**
 * AU-05 Spiller venter på forelder, i nytt design (utkast-flater/innlogging.html, «venter»).
 * Vises når fristen på sju dager er passert og kontoen er låst (D-63). resendGuardianInvitation
 * og utlogging er beholdt.
 *
 * Avvik mot utkastet: utkastet viser dager igjen mens kontoen fortsatt er åpen. Denne siden vises
 * bare etter fristen, så den sier at kontoen er låst. Ingenting du har lagt inn, blir borte.
 */
import { useState, useTransition, type FormEvent } from "react";
import { resendGuardianInvitation } from "@/app/auth/onboarding/actions";
import { FlateRamme } from "@/components/flater/FlateRamme";
import "@/styles/flater-ny-konto.css";

export function SpillerVenter({ spillerNavn, invitasjonEmail, fristTekst, loggUt }: { spillerNavn: string; invitasjonEmail: string | null; fristTekst: string | null; loggUt: () => Promise<void> }) {
  const [venter, startTransition] = useTransition();
  const [epost, setEpost] = useState(invitasjonEmail ?? "");
  const [status, setStatus] = useState<{ ok: boolean; tekst: string } | null>(null);
  const fornavn = spillerNavn.split(/\s+/)[0] || "Hei";

  function send(e: FormEvent) {
    e.preventDefault();
    if (!epost.trim()) return;
    startTransition(async () => {
      setStatus(null);
      const r = await resendGuardianInvitation({ guardianEmail: epost.trim() });
      setStatus(r.ok ? { ok: true, tekst: "Ny lenke er sendt til forelderen." } : { ok: false, tekst: r.error ?? "Lenken ble ikke sendt. Prøv igjen." });
    });
  }

  return (
    <FlateRamme skall="konto">
      <div className="topp">
        <span className="pille vent"><i />Venter på forelder</span>
        <h1 className="tittel">{invitasjonEmail ? "Forelderen har fått lenken" : "En forelder må godkjenne kontoen"}</h1>
        <p className="ingress">{fornavn}, du er under 16 år. Forelderen din skulle godkjenne kontoen innen sju dager{fristTekst ? ` (${fristTekst})` : ""}. Kontoen er låst til det skjer. Ingenting du har lagt inn, blir borte.</p>
      </div>
      <form className="seksjon" onSubmit={send}>
        <div className="felt">
          <label htmlFor="ve">{invitasjonEmail ? "Forelderens e-post" : "Legg til forelder"}</label>
          <input id="ve" type="email" required autoComplete="off" value={epost} onChange={(e) => setEpost(e.target.value)} />
        </div>
        <button type="submit" className="knapp pri stor" disabled={venter || !epost.trim()}>{venter ? "Sender …" : "Send lenken på nytt"}</button>
        {status && <p className={status.ok ? "kilde" : "feilmelding"} role="status">{status.tekst}</p>}
      </form>
      <form action={loggUt}>
        <button type="submit" className="knapp sek hel">Logg ut</button>
      </form>
      <p className="kilde">Spørsmål? <a href="mailto:post@akgolf.no">post@akgolf.no</a></p>
    </FlateRamme>
  );
}
