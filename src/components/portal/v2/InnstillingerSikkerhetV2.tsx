"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Innstillinger · Sikkerhet.
 *
 * Avvik:
 *   - PH-12-kontroll 21.09.2026: «Sikkerhetsscore 80 / 100 · Sterk» er fjernet.
 *     Tallet var `harEpost ? 80 : 55` — to hardkodede verdier uten måling bak
 *     seg, vist med progresjonsbar og en dom («Sterk»). Appen vet ikke om
 *     kontoen har tofaktor (flagget finnes ikke på User), så den kan ikke
 *     vurdere sikkerheten. Nå vises de tilstandene vi faktisk kjenner.
 */

import { useRef, useState } from "react";
import Link from "next/link";
import { ReauthModal } from "@/components/auth/reauth-modal";
import { InnstillingerHode } from "@/components/portal/v2/InnstillingerHode";
import { createClient } from "@/lib/supabase/client";
import { Caps, Kort, Rad, StatusPill, Icon, Inndata, Knapp } from "@/components/v2";
/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type InnstillingerSikkerhetData = {
  /** Har kontoen en e-postadresse registrert? Det er det vi faktisk vet. */
  harEpost: boolean;
  /** Ferdigformatert siste innlogging (nb-NO), eller «Ukjent». */
  sisteInnlogging: string;
};

/* ── Hjelpere ──────────────────────────────────────────────────────── */

/** Rundt ikon-emblem foran en rad (samme idiom som InnstillingerV2). */
function SeksjonIkon({ name, farge }: { name: string; farge?: string }) {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: TL.dim,
        border: `1px solid ${TL.hair}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={name} size={14} style={{ color: farge || TL.mute }} />
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
  const supabase = createClient();
  const { harEpost, sisteInnlogging } = data;



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
    <div data-paper-wave-g="innstillingersikkerhet" data-paper-portal-innstillinger-sikkerhet data-paper-slug="playerhq-innstillinger" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <InnstillingerHode tittel="Sikkerhet" undertekst="Innstillinger" tilbakeHref="/portal/meg/innstillinger" />

      {/* Hva vi faktisk vet om kontoen — ingen samlet vurdering. */}
      <Kort tint eyebrow="Kontoens sikkerhet">
        <Rad
          title="E-postadresse"
          sub={harEpost ? "Registrert på kontoen" : "Ikke registrert"}
          trailing={<StatusPill tone={harEpost ? "up" : "warn"}>{harEpost ? "Ja" : "Nei"}</StatusPill>}
        />
        <Rad
          title="Tofaktor"
          sub="Appen kjenner ikke status. Åpne tofaktor for å se og endre."
          trailing={<StatusPill tone="info">Ukjent</StatusPill>}
        />
        <Rad
          title="Sist innlogget"
          sub={sisteInnlogging}
          last
        />
      </Kort>

      <Link href="/portal/meg/sikkerhet/2fa" style={{ textDecoration: "none", display: "block" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
          borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
        }}>Åpne tofaktor</span>
      </Link>

      {/* Endre passord + Endre e-post */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16, alignItems: "start" }}>
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
              <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.text, margin: 0 }}>{passordFeil}</p>
            )}
            {passordSuksess && !passordFeil && (
              <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.text, margin: 0 }}>Passord oppdatert.</p>
            )}
            <Knapp icon="check" full disabled={passordLagrer} onClick={lagrePassord}>
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
              <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.text, margin: 0 }}>{epostFeil}</p>
            )}
            {epostSuksess && !epostFeil && (
              <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.text, lineHeight: 1.5, margin: 0 }}>
                Bekreftelseslenke sendt til {nyEpost.trim()}. E-posten din endres først når du klikker
                lenken.
              </p>
            )}
            <Knapp icon="check" full disabled={epostLagrer} onClick={lagreEpost}>
              {epostLagrer ? "Sender …" : "Lagre ny e-post"}
            </Knapp>
          </div>
        </Kort>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16, alignItems: "start" }}>
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
                leading={<SeksjonIkon name="shield-check" farge={TL.fill} />}
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
              leading={<SeksjonIkon name="monitor" farge={TL.fill} />}
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
