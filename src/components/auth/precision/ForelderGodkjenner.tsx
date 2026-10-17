"use client";

/**
 * AU-05 Forelder godkjenner, i nytt design (utkast-flater/innlogging.html, «godkjenn»).
 * Token-status kommer fra siden. confirmGuardianConsent er uendret. Fullt navn og begge
 * avkrysningene kreves (GDPR art. 8).
 *
 * Avvik mot utkastet: opptak og ytelsesbilde gis ikke her. Opptak har egen lenke fra coach
 * (AU-05 Opptak), og ytelsesbilde styres i Forelder › Samtykke. Etter godkjenning går forelderen
 * til «Opprett konto» som forelder, med e-posten fra invitasjonen ferdig utfylt (via sessionStorage,
 * aldri i adressen). Kontoen kobles til godkjenningen av claimPendingAccountByEmail.
 */
import { useState, useTransition, type FormEvent } from "react";
import { AlertCircle, Check } from "lucide-react";
import { confirmGuardianConsent } from "@/app/auth/guardian-consent/[token]/actions";
import { FlateRamme } from "@/components/flater/FlateRamme";
import "@/styles/flater-ny-konto.css";

const FORELDER_EPOST_NOKKEL = "ak-forelder-epost";

export type ForelderGodkjennerProps =
  | { state: "form"; token: string; playerName: string; playerAge: number | null; guardianEmail: string; fristTekst: string | null }
  | { state: "expired"; playerName: string }
  | { state: "success"; playerName: string };

export function ForelderGodkjenner(props: ForelderGodkjennerProps) {
  const fornavn = props.playerName.split(/\s+/)[0] || props.playerName;
  if (props.state === "expired") {
    return (
      <FlateRamme skall="konto">
        <div className="topp"><h1 className="tittel">Lenken er utløpt</h1><p className="ingress">Lenken gjaldt i sju dager. Be {fornavn} sende en ny fra Meg.</p></div>
      </FlateRamme>
    );
  }
  if (props.state === "success") {
    return (
      <FlateRamme skall="konto">
        <span className="stor-ikon"><Check className="ikon" aria-hidden="true" /></span>
        <div className="topp"><h1 className="tittel">Kontoen er godkjent</h1><p className="ingress">{fornavn} kan bruke AK Golf HQ. Logg inn eller opprett konto som forelder for å følge med.</p></div>
        <a href="/auth/login" className="knapp pri stor">Logg inn</a>
        <a href="/auth/signup?rolle=forelder" className="lenke">Opprett konto som forelder</a>
      </FlateRamme>
    );
  }
  return <Skjema {...props} fornavn={fornavn} />;
}

function Skjema({ token, playerName, playerAge, guardianEmail, fristTekst, fornavn }: Extract<ForelderGodkjennerProps, { state: "form" }> & { fornavn: string }) {
  const [navn, setNavn] = useState("");
  const [konto, setKonto] = useState(false);
  const [vilkar, setVilkar] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, startTransition] = useTransition();

  function godkjenn(e: FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (!navn.trim()) return setFeil("Skriv fullt navn.");
    if (!konto || !vilkar) return setFeil("Kryss av for begge punktene for å godkjenne.");
    startTransition(async () => {
      const r = await confirmGuardianConsent({ token, guardianName: navn.trim() });
      if (!r.ok) return setFeil(r.error ?? "Noe gikk galt. Prøv igjen.");
      try {
        sessionStorage.setItem(FORELDER_EPOST_NOKKEL, guardianEmail);
      } catch {
        // Uten lagring skriver forelderen e-posten selv.
      }
      window.location.replace("/auth/signup?rolle=forelder&godkjent=1");
    });
  }

  return (
    <FlateRamme skall="konto">
      <div className="topp">
        <span className="dato">Lenke fra AK Golf HQ</span>
        <h1 className="tittel">{fornavn} vil bruke AK Golf HQ</h1>
        <p className="ingress">{playerName}{playerAge != null ? ` (${playerAge} år)` : ""} har opprettet konto. Som forelder godkjenner du kontoen{fristTekst ? ` innen ${fristTekst}` : " innen sju dager"}.</p>
      </div>
      <div className="kort">
        <dl className="dl">
          <div><dt>Spiller</dt><dd>{playerName}</dd></div>
          <div><dt>Alder</dt><dd className="mono">{playerAge ?? "—"}</dd></div>
          <div><dt>Frist</dt><dd>{fristTekst ?? "—"}</dd></div>
        </dl>
      </div>
      <form className="seksjon" onSubmit={godkjenn} noValidate>
        <div className="sek-topp"><h2>Du bestemmer</h2></div>
        <div className="felt"><label htmlFor="gn">Ditt fulle navn</label><input id="gn" autoComplete="name" value={navn} onChange={(e) => setNavn(e.target.value)} /><span className="hjelp">Registrert e-post: {guardianEmail}</span></div>
        <label className="avkrysning">
          <input type="checkbox" checked={konto} onChange={(e) => setKonto(e.target.checked)} />
          <span><b>Godkjenn kontoen</b>AK Golf behandler {fornavn}s profil, treningsdata, golfstatistikk, bookinger og kommunikasjon med coach etter personvernerklæringen.</span>
        </label>
        <label className="avkrysning">
          <input type="checkbox" checked={vilkar} onChange={(e) => setVilkar(e.target.checked)} />
          <span><b>Vilkår og foreldreansvar</b>Jeg har lest <a href="/vilkar">vilkårene</a> og har foreldreansvar for {fornavn}.</span>
        </label>
        <p className="kilde">Deling med trenere godkjenner du hver gang {fornavn} spør. Som foresatt kan du trekke samtykket tilbake når som helst under Samtykke.</p>
        {feil && <p className="feilmelding" role="alert"><AlertCircle className="ikon" aria-hidden="true" />{feil}</p>}
        <button type="submit" className="knapp pri stor" disabled={venter}>{venter ? "Lagrer …" : "Godkjenn"}</button>
      </form>
      <a href="mailto:post@akgolf.no" className="lenke">Jeg er ikke forelder til {fornavn}</a>
    </FlateRamme>
  );
}
