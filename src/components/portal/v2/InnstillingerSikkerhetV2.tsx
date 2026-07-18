"use client";

/**
 * PlayerHQ Innstillinger · Sikkerhet — v2 (retning C «Presis»). KANONISK
 * sikkerhet-skjerm etter D7-konsolideringen 17. juli 2026: den tidligere
 * /portal/meg/sikkerhet (MegSikkerhetV2) er slått sammen hit, og gammel
 * adresse er redirect. Funksjon bevart 1:1 fra begge:
 *  - Sikkerhetsscore: samme ærlige heuristikk (utregnes fortsatt i page.tsx —
 *    verifisert e-post → 80, ellers 55; +20 opptjenes via 2FA-flyten).
 *  - Endre passord / Endre e-post: skjema klientside mot Supabase Auth
 *    (samme mønster som reset-form.tsx). Krever Supabase step-up (AAL-feil)
 *    → gjenbruker ReauthModal-mønsteret fra 2FA-flyten (twofa-client.tsx).
 *  - Glemt passord: lenke til Supabase-tilbakestilling (/auth/forgot-password).
 *  - Tofaktor: lenke til den ekte TOTP-flyten (/portal/meg/sikkerhet/2fa).
 *  - Aktive økter: ekte lastLoginAt for denne enheten; full øktliste/historikk
 *    markeres «kommer snart» — aldri falske rader.
 *
 * Kun v2-komponenter fra "@/components/v2" + T.*-tokens. Ingen rå hex.
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
  Icon,
  Inndata,
  Knapp,
  type StatusTone,
} from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type InnstillingerSikkerhetData = {
  /** Ærlig score fra page.tsx-heuristikken (e-post bekreftet → 80, ellers 55). */
  score: number;
  /** Ferdigformatert siste innlogging (nb-NO), eller «Ukjent». */
  sisteInnlogging: string;
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

/** Rundt ikon-emblem foran en rad (samme idiom som InnstillingerV2). */
function SeksjonIkon({ name, farge }: { name: string; farge?: string }) {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: T.panel3,
        border: `1px solid ${T.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={name} size={14} style={{ color: farge || T.fg2 }} />
    </span>
  );
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

export function InnstillingerSikkerhetV2({ data }: { data: InnstillingerSikkerhetData }) {
  const mobile = useMobile();
  const supabase = createClient();
  const { score, sisteInnlogging } = data;

  const niva = score >= 80 ? "Sterk" : "Grei";
  const tone: StatusTone = score >= 80 ? "up" : "warn";

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
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6, margin: "-8px 0 0" }}>
        Tofaktor-autentisering anbefales for alle som har koblet betalingskort.
      </p>

      {/* Sikkerhetsscore — hero */}
      <Kort tint>
        <TallHero
          label="Sikkerhetsscore"
          value={score}
          unit="/ 100"
          size={mobile ? 44 : 52}
          action={<StatusPill tone={tone}>{niva}</StatusPill>}
          hjelp="sikkerhetsscore"
        />
        <div style={{ marginTop: 16 }}>
          <ProgresjonsBar variant="bar" value={score} max={100} label={null} showValue={false} />
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "12px 0 0" }}>
          Sterkt passord og bekreftet e-post er på plass. Aktiver tofaktor for +20.
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

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
        {/* Innlogging */}
        <div>
          <Caps size={9} style={{ margin: "0 4px 8px" }}>Innlogging</Caps>
          <Kort pad="4px 20px 6px">
            <Link href="/auth/forgot-password" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <Rad
                leading={<SeksjonIkon name="lock" />}
                title="Glemt passord?"
                sub="Send tilbakestillingslenke til e-posten din"
              />
            </Link>
            <Link href="/portal/meg/sikkerhet/2fa" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <Rad
                last
                leading={<SeksjonIkon name="shield-check" farge={T.lime} />}
                title="Tofaktor-autentisering"
                sub="Authenticator-app · ekstra beskyttelse"
                meta={<StatusPill tone="lime">Anbefalt</StatusPill>}
              />
            </Link>
          </Kort>
        </div>

        {/* Aktive økter */}
        <div>
          <Caps size={9} style={{ margin: "0 4px 8px" }}>Aktive økter</Caps>
          <Kort pad="4px 20px 6px">
            <Rad
              leading={<SeksjonIkon name="monitor" farge={T.lime} />}
              title="Denne enheten"
              sub={`Siste innlogging · ${sisteInnlogging}`}
              meta={<StatusPill tone="lime">Aktiv</StatusPill>}
              trailing={null}
            />
            <Rad
              last
              leading={<SeksjonIkon name="history" />}
              title="Andre enheter og innloggings-historikk"
              sub="Med IP, enhet og tidspunkt"
              meta={<StatusPill tone="info">Kommer snart</StatusPill>}
              trailing={null}
            />
          </Kort>
        </div>
      </div>

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
