"use client";

/**
 * Sikkerhet: score, passord, e-post, glemt passord, tofaktor og siste innlogging.
 */

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ReauthModal } from "@/components/auth/reauth-modal";
import { createClient } from "@/lib/supabase/client";
import { Knapp, StatusPille } from "@/components/precision/pa";

export type InnstillingerSikkerhetData = {
  /** Ærlig score fra page.tsx-heuristikken (e-post bekreftet → 80, ellers 55). */
  score: number;
  /** Ferdigformatert siste innlogging (nb-NO), eller «Ukjent». */
  sisteInnlogging: string;
};

/** Oversetter Supabase auth-feilmeldinger til norsk. */
function oversettAuthFeil(msg: string): string {
  if (msg.includes("should be different from the old password"))
    return "Velg et annet passord enn det du hadde fra før.";
  if (msg.includes("Password should be at least"))
    return "Passordet må være minst 8 tegn.";
  if (msg.includes("Auth session missing"))
    return "Økten din er utløpt. Logg ut og inn igjen.";
  if (msg.includes("A user with this email address has already been registered"))
    return "Denne e-postadressen er allerede i bruk.";
  return msg;
}

/** true hvis feilen betyr at Supabase krever en fersk (nylig re-autentisert) sesjon. */
function krevesReauth(msg: string): boolean {
  return msg.includes("AAL") || msg.includes("reauthenticat");
}

export function InnstillingerSikkerhetV2({ data }: { data: InnstillingerSikkerhetData }) {
  const supabase = createClient();
  const { score, sisteInnlogging } = data;

  const niva = score >= 80 ? "Sterk" : "Grei";
  const tone = score >= 80 ? "ok" : "warn";

  // ── Endre passord ──
  const [nyttPassord, setNyttPassord] = useState("");
  const [bekreftPassord, setBekreftPassord] = useState("");
  const [passordLagrer, setPassordLagrer] = useState(false);
  const [passordFeil, setPassordFeil] = useState<string | null>(null);
  const [passordSuksess, setPassordSuksess] = useState(false);

  // ── Endre e-post ──
  const [nyEpost, setNyEpost] = useState("");
  const [epostLagrer, setEpostLagrer] = useState(false);
  const [epostFeil, setEpostFeil] = useState<string | null>(null);
  const [epostSuksess, setEpostSuksess] = useState(false);

  // ── Re-auth (delt mellom passord- og e-post-skjemaet) ──
  const [showReauth, setShowReauth] = useState(false);
  const [reauthReason, setReauthReason] = useState("");
  const reauthRetry = useRef<(() => void) | null>(null);

  async function lagrePassord() {
    setPassordFeil(null);
    setPassordSuksess(false);
    if (nyttPassord.length < 8) {
      setPassordFeil("Passordet må være minst 8 tegn.");
      return;
    }
    if (nyttPassord !== bekreftPassord) {
      setPassordFeil("Passordene er ikke like.");
      return;
    }
    setPassordLagrer(true);
    const { error } = await supabase.auth.updateUser({ password: nyttPassord });
    setPassordLagrer(false);
    if (error) {
      if (krevesReauth(error.message)) {
        reauthRetry.current = () => lagrePassord();
        setReauthReason("Du er i ferd med å endre passordet ditt. Bekreft identiteten din for å fortsette.");
        setShowReauth(true);
        return;
      }
      setPassordFeil(oversettAuthFeil(error.message));
      return;
    }
    setPassordSuksess(true);
    setNyttPassord("");
    setBekreftPassord("");
  }

  async function lagreEpost() {
    setEpostFeil(null);
    setEpostSuksess(false);
    const trimmet = nyEpost.trim();
    if (!trimmet || !trimmet.includes("@")) {
      setEpostFeil("Skriv inn en gyldig e-postadresse.");
      return;
    }
    setEpostLagrer(true);
    const { error } = await supabase.auth.updateUser({ email: trimmet });
    setEpostLagrer(false);
    if (error) {
      if (krevesReauth(error.message)) {
        reauthRetry.current = () => lagreEpost();
        setReauthReason("Du er i ferd med å endre e-postadressen din. Bekreft identiteten din for å fortsette.");
        setShowReauth(true);
        return;
      }
      setEpostFeil(oversettAuthFeil(error.message));
      return;
    }
    setEpostSuksess(true);
  }

  function sendPassord(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void lagrePassord();
  }

  function sendEpost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void lagreEpost();
  }

  return (
    <div className="ph-flate">
      <Link href="/portal/meg/innstillinger" className="ph-tilbake">Innstillinger</Link>
      <header>
        <p>Innstillinger</p>
        <h1>Sikkerhet</h1>
        <p>
          <StatusPille tone={tone}>{niva}</StatusPille>
        </p>
        <p>Sist innlogget: {sisteInnlogging}. Aktiver tofaktor for +20.</p>
      </header>

      <div className="ph-kpi">
        <p className="pa-card">
          <span>Sikkerhetsscore</span>
          <strong>{score}/100</strong>
        </p>
        <p className="pa-card">
          <span>Nivå</span>
          <strong>{niva}</strong>
        </p>
      </div>

      {score < 100 && (
        <Link href="/portal/meg/sikkerhet/2fa" className="pa-btn pa-btn--primary pa-btn--full">
          Aktiver tofaktor
        </Link>
      )}

      <section className="pa-card ph-kort">
        <p>Endre passord</p>
        <form className="ph-skjema" onSubmit={sendPassord}>
          <label>
            Nytt passord
            <input
              type="password"
              value={nyttPassord}
              onChange={(e) => setNyttPassord(e.target.value)}
              placeholder="Minst 8 tegn"
              autoComplete="new-password"
            />
          </label>
          <label>
            Bekreft nytt passord
            <input
              type="password"
              value={bekreftPassord}
              onChange={(e) => setBekreftPassord(e.target.value)}
              placeholder="Gjenta passordet"
              autoComplete="new-password"
            />
          </label>
          {passordFeil && <p role="alert">{passordFeil}</p>}
          {passordSuksess && !passordFeil && <p>Passord oppdatert.</p>}
          <Knapp
            type="submit"
            variant="primary"
            fullWidth
            disabled={passordLagrer}
            loading={passordLagrer}
            loadingText="Lagrer …"
          >
            Lagre nytt passord
          </Knapp>
        </form>
      </section>

      <section className="pa-card ph-kort">
        <p>Endre e-post</p>
        <form className="ph-skjema" onSubmit={sendEpost}>
          <label>
            Ny e-postadresse
            <input
              type="email"
              value={nyEpost}
              onChange={(e) => setNyEpost(e.target.value)}
              placeholder="navn@eksempel.no"
              autoComplete="email"
            />
          </label>
          {epostFeil && <p role="alert">{epostFeil}</p>}
          {epostSuksess && !epostFeil && (
            <p>
              Bekreftelseslenke sendt til {nyEpost.trim()}. E-posten din endres først når du klikker
              lenken.
            </p>
          )}
          <Knapp
            type="submit"
            variant="primary"
            fullWidth
            disabled={epostLagrer}
            loading={epostLagrer}
            loadingText="Sender …"
          >
            Lagre ny e-post
          </Knapp>
        </form>
      </section>

      <section className="pa-card ph-kort">
        <p>Innlogging</p>
        <ul className="ph-rader">
          <li>
            <Link href="/auth/forgot-password">
              <span>
                <strong>Glemt passord?</strong>
                <small>Send tilbakestillingslenke til e-posten din</small>
              </span>
            </Link>
          </li>
          <li>
            <Link href="/portal/meg/sikkerhet/2fa">
              <span>
                <strong>Tofaktor-autentisering</strong>
                <small>Authenticator-app · ekstra beskyttelse</small>
              </span>
              <StatusPille tone="ok">Anbefalt</StatusPille>
            </Link>
          </li>
        </ul>
      </section>

      <section className="pa-card ph-kort">
        <p>Aktive økter</p>
        <ul className="ph-rader">
          <li>
            <span>
              <strong>Denne enheten</strong>
              <small>Siste innlogging · {sisteInnlogging}</small>
            </span>
            <StatusPille tone="live">Aktiv</StatusPille>
          </li>
          <li>
            <span>
              <strong>Andre enheter og innloggings-historikk</strong>
              <small>Med IP, enhet og tidspunkt</small>
            </span>
            <StatusPille tone="neutral">Kommer snart</StatusPille>
          </li>
        </ul>
      </section>

      <ReauthModal
        open={showReauth}
        onClose={() => setShowReauth(false)}
        onSuccess={() => {
          setShowReauth(false);
          reauthRetry.current?.();
        }}
        reason={reauthReason}
        bekreftTekst="Bekreft og fortsett"
      />
    </div>
  );
}
