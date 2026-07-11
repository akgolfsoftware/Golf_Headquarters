"use client";

/**
 * PlayerHQ Meg · Sikkerhet — v2 (retning C «Presis»). Rekomponert fra den ekte
 * skjermen src/app/portal/meg/sikkerhet/page.tsx (+ 2fa), men med v2-komponenter
 * fra "@/components/v2". Kun T.*-tokens, ingen rå hex, ingen ad-hoc UI.
 *
 * Funksjon + datakontrakt bevart 1:1:
 *  - Sikkerhetsscore: samme heuristikk som originalen (verifisert e-post → 65,
 *    ellers 40). Ingen 2FA-status i data ennå → ikke regnet inn (ærlig).
 *  - Endre passord / Endre e-post: nye skjema, klientside mot Supabase Auth
 *    (samme mønster som reset-form.tsx). Krever Supabase step-up (AAL-feil)
 *    → gjenbruker ReauthModal-mønsteret fra 2FA-flyten (twofa-client.tsx).
 *  - Tofaktor: lenke til /portal/meg/sikkerhet/2fa (uendret adresse).
 *  - Aktive økter + Innloggings-historikk: IKKE koblet til Supabase auth-sessions
 *    ennå → merket «Kommer snart». «Denne enheten · Aktiv» er den faktiske,
 *    inneværende økten (ikke fabrikkert); logg-ut-andre + full historikk er
 *    ærlige tom-/kommer-snart-tilstander. Aldri falske tall.
 *
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ReauthModal } from "@/components/auth/reauth-modal";
import { createClient } from "@/lib/supabase/client";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  TallHero,
  ProgresjonsBar,
  TomTilstand,
  Icon,
  Inndata,
  Knapp,
  type StatusTone,
} from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type MegSikkerhetData = {
  /** Kontoen har verifisert e-post — eneste ekte signal bak score-heuristikken. */
  harEpost: boolean;
};

/* ── Hjelpere ──────────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

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

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegSikkerhetV2({ data }: { data: MegSikkerhetData }) {
  const mobile = useMobile();
  const supabase = createClient();

  // Samme heuristikk som originalen: verifisert e-post + satt passord = 65.
  // 2FA-status er ikke eksponert i data ennå, så den regnes ikke inn.
  const score = data.harEpost ? 65 : 40;
  const niva = score >= 80 ? "Sterk" : score >= 60 ? "God" : "Svak";
  const tone: StatusTone = score >= 80 ? "up" : score >= 60 ? "lime" : "warn";
  const scoreTekst = data.harEpost
    ? "Sterkt passord og verifisert e-post. Aktiver tofaktor for å løfte scoren ytterligere."
    : "Legg til og verifiser e-post for å sikre kontoen og løfte scoren.";

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Tittel mobile={mobile}>Sikkerhet</Tittel>

      {/* Sikkerhetsscore — hero */}
      <Kort tint>
        <TallHero
          label="Sikkerhetsscore"
          value={score}
          unit="/ 100"
          size={mobile ? 44 : 52}
          action={<StatusPill tone={tone}>{niva}</StatusPill>}
        />
        <div style={{ marginTop: 16 }}>
          <ProgresjonsBar variant="bar" value={score} max={100} label={null} showValue={false} />
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "12px 0 0" }}>
          {scoreTekst}
        </p>
      </Kort>

      {/* Endre passord + Endre e-post */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
        <Kort eyebrow="Endre passord">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Inndata
              label="Nytt passord"
              type="password"
              value={nyttPassord}
              onChange={setNyttPassord}
              placeholder="Minst 8 tegn"
            />
            <Inndata
              label="Bekreft nytt passord"
              type="password"
              value={bekreftPassord}
              onChange={setBekreftPassord}
              placeholder="Gjenta passordet"
            />
            {passordFeil && (
              <p style={{ fontFamily: T.ui, fontSize: 12, color: T.down, margin: 0 }}>{passordFeil}</p>
            )}
            {passordSuksess && !passordFeil && (
              <p style={{ fontFamily: T.ui, fontSize: 12, color: T.up, margin: 0 }}>Passord oppdatert.</p>
            )}
            <Knapp icon="check" disabled={passordLagrer} onClick={lagrePassord}>
              {passordLagrer ? "Lagrer …" : "Lagre nytt passord"}
            </Knapp>
          </div>
        </Kort>

        <Kort eyebrow="Endre e-post">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Inndata
              label="Ny e-postadresse"
              type="email"
              value={nyEpost}
              onChange={setNyEpost}
              placeholder="navn@eksempel.no"
            />
            {epostFeil && (
              <p style={{ fontFamily: T.ui, fontSize: 12, color: T.down, margin: 0 }}>{epostFeil}</p>
            )}
            {epostSuksess && !epostFeil && (
              <p style={{ fontFamily: T.ui, fontSize: 12, color: T.up, lineHeight: 1.5, margin: 0 }}>
                Bekreftelseslenke sendt til {nyEpost.trim()}. E-posten din endres først når du klikker
                lenken.
              </p>
            )}
            <Knapp icon="check" disabled={epostLagrer} onClick={lagreEpost}>
              {epostLagrer ? "Sender …" : "Lagre ny e-post"}
            </Knapp>
          </div>
        </Kort>
      </div>

      {/* Tofaktor + Aktive økter */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
        <Kort eyebrow="Tofaktor" action={<Caps size={9}>Authenticator-app</Caps>}>
          <Link
            href="/portal/meg/sikkerhet/2fa"
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <Rad
              last
              leading={<Icon name="shield" size={16} style={{ color: T.lime }} />}
              title="Konfigurer 2FA"
              sub="Ekstra beskyttelse med engangskode"
            />
          </Link>
        </Kort>

        <Kort eyebrow="Aktive økter" action={<StatusPill tone="info">Kommer snart</StatusPill>}>
          <Rad
            last
            leading={<Icon name="monitor" size={16} style={{ color: T.fg2 }} />}
            title="Denne enheten"
            sub="Logg ut andre enheter — under utvikling"
            meta={<StatusPill tone="lime">Aktiv</StatusPill>}
            trailing={null}
          />
        </Kort>
      </div>

      {/* Innloggings-historikk */}
      <Kort eyebrow="Innloggings-historikk" action={<StatusPill tone="info">Kommer snart</StatusPill>}>
        <TomTilstand
          icon="shield-check"
          title="Ikke tilgjengelig ennå"
          sub="Full historikk med IP, enhet og tidspunkt aktiveres snart."
        />
      </Kort>

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
