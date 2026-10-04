"use client";

/**
 * Foreldresamtykke i Precision (AU-05).
 * Token-status kommer fra siden. confirmGuardianConsent og veien til
 * /auth/login?guardian_consent_given=1 er uendret. Begge avkryssingene
 * og fullt navn kreves fortsatt.
 */

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { confirmGuardianConsent } from "@/app/auth/guardian-consent/[token]/actions";
import "@/styles/precision-athletics.css";

export type GuardianConsentV2Props =
  | {
      state: "form";
      token: string;
      playerName: string;
      playerAge: number | null;
      playerEmail: string;
      guardianEmail: string;
    }
  | { state: "expired"; playerName: string; playerAge: number | null; email: string }
  | { state: "success"; playerName: string; playerAge: number | null };

function InfoSeksjon() {
  return (
    <div className="au-tips">
      <p className="au-kicker">Hva betyr dette samtykket?</p>
      <ul className="au-liste">
        <li>GDPR artikkel 8: norske barn under 16 år trenger foreldresamtykke før de kan dele persondata med en tjeneste.</li>
        <li>
          Du kan trekke samtykket når som helst ved å kontakte oss på{" "}
          <a href="mailto:post@akgolf.no">post@akgolf.no</a>.
        </li>
        <li>Du får tilgang til en foreldreportal som lar deg følge barnets utvikling, fakturaer og kommunikasjon med coach.</li>
      </ul>
      <p>
        Mer info i <Link href="/personvern">personvernerklæringen</Link> og{" "}
        <Link href="/vilkar">vilkårene</Link>.
      </p>
    </div>
  );
}

function Hode({ playerName, playerAge }: { playerName: string; playerAge: number | null }) {
  return (
    <header>
      <p className="au-kicker">Foreldresamtykke</p>
      <h1>Bekreft samtykke</h1>
      <p>
        For at {playerName}
        {playerAge !== null ? ` (${playerAge} år)` : ""} skal kunne bruke AK Golf.
      </p>
    </header>
  );
}

function ExpiredKort({ email }: { email: string }) {
  return (
    <p className="au-melding" data-tone="feil" role="alert">
      Invitasjonen er utløpt. Lenken er ikke lenger gyldig. Be spilleren sende deg en ny invitasjon til {email}.
    </p>
  );
}

function SuccessKort({ playerName }: { playerName: string }) {
  return (
    <>
      <p className="au-melding" role="status">
        Samtykke allerede gitt for {playerName}.
      </p>
      <Link href="/forelder" className="pa-btn pa-btn--primary pa-btn--full">Gå til foreldreportal</Link>
    </>
  );
}

function ConsentKort({
  token,
  playerName,
  playerEmail,
  guardianEmail,
  playerAge,
}: {
  token: string;
  playerName: string;
  playerEmail: string;
  guardianEmail: string;
  playerAge: number | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [navn, setNavn] = useState("");
  const [databehandling, setDatabehandling] = useState(false);
  const [vilkar, setVilkar] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const kanSende = navn.trim().length > 0 && databehandling && vilkar;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (!navn.trim()) {
      setFeil("Skriv inn fullt navn.");
      return;
    }
    if (!databehandling || !vilkar) {
      setFeil("Du må samtykke til begge punktene for å fortsette.");
      return;
    }
    startTransition(async () => {
      const result = await confirmGuardianConsent({ token, guardianName: navn.trim() });
      if (!result.ok) {
        setFeil(result.error ?? "Noe gikk galt. Prøv igjen.");
        return;
      }
      router.push("/auth/login?guardian_consent_given=1");
    });
  }

  return (
    <form className="au-skjema" onSubmit={onSubmit}>
      <div className="au-tips">
        <p className="au-kicker">Spiller</p>
        <p>
          <strong>{playerName}</strong>
          {playerAge !== null ? ` (${playerAge} år)` : ""}
        </p>
        <p>{playerEmail}</p>
      </div>
      <label>Ditt fulle navn (foresatt)
        <input value={navn} autoComplete="name" onChange={(e) => setNavn(e.target.value)} />
      </label>
      <p>Registrert e-post: {guardianEmail}</p>
      <label className="au-sjekk">
        <input type="checkbox" checked={databehandling} onChange={(e) => setDatabehandling(e.target.checked)} />
        <span>
          Jeg samtykker til at AK Golf behandler {playerName} sine persondata iht. personvernerklæringen — profil, treningsdata, golf-statistikk, bookinger og kommunikasjon med coach.
        </span>
      </label>
      <label className="au-sjekk">
        <input type="checkbox" checked={vilkar} onChange={(e) => setVilkar(e.target.checked)} />
        <span>
          Jeg har lest og godtar vilkårene for bruk av AK Golf på vegne av {playerName}, og bekrefter at jeg har foreldreansvar.
        </span>
      </label>
      {feil ? <p className="au-melding" data-tone="feil" role="alert">{feil}</p> : null}
      <button type="submit" className="pa-btn pa-btn--primary pa-btn--full" disabled={!kanSende || isPending}>
        {isPending ? "Lagrer samtykke…" : "Bekreft samtykke"}
      </button>
      <p>
        Ved å bekrefte gir du juridisk samtykke iht. GDPR artikkel 8. Du kan trekke samtykket når som helst via{" "}
        <a href="mailto:post@akgolf.no">post@akgolf.no</a>.
      </p>
    </form>
  );
}

export function GuardianConsentV2(props: GuardianConsentV2Props) {
  return (
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks au-boks--bred">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        <Hode playerName={props.playerName} playerAge={props.playerAge} />
        {props.state === "expired" ? (
          <ExpiredKort email={props.email} />
        ) : props.state === "success" ? (
          <SuccessKort playerName={props.playerName} />
        ) : (
          <ConsentKort
            token={props.token}
            playerName={props.playerName}
            playerEmail={props.playerEmail}
            guardianEmail={props.guardianEmail}
            playerAge={props.playerAge}
          />
        )}
        <InfoSeksjon />
        <div className="au-lenker">
          <Link href="/personvern">Personvern</Link>
          <Link href="/vilkar">Vilkår</Link>
        </div>
      </div>
    </div>
  );
}
