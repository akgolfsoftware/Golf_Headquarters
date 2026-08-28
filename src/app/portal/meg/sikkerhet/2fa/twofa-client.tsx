"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { ReauthModal } from "@/components/auth/reauth-modal";
import { createClient } from "@/lib/supabase/client";
import { TL } from "@/lib/v2/train-lock";

import { Caps, Kort, Knapp, StatusPill, Icon } from "@/components/v2";

type Steg = 1 | 2 | 3;

type EnrolledFactor = {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
};

type AktivFactor = {
  id: string;
  friendlyName: string | null;
  createdAt: string;
};

/**
 * 2FA-flyt via Supabase MFA (TOTP) — B-pakke UI.
 */
export function TwoFaClient() {
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  const [aktivFactor, setAktivFactor] = useState<AktivFactor | null>(null);
  const [henter, setHenter] = useState(true);
  const [feil, setFeil] = useState<string | null>(null);

  const [steg, setSteg] = useState<Steg>(1);
  const [enrolled, setEnrolled] = useState<EnrolledFactor | null>(null);
  const [kode, setKode] = useState("");
  const [pending, setPending] = useState(false);
  const [lagret, setLagret] = useState(false);
  const [backupKoder, setBackupKoder] = useState<string[]>([]);

  const [showReauth, setShowReauth] = useState(false);
  const [deaktiverer, setDeaktiverer] = useState(false);

  const hentFactors = useCallback(async () => {
    setHenter(true);
    setFeil(null);
    const { data, error } = await supabase.auth.mfa.listFactors();
    setHenter(false);
    if (error) {
      setFeil(error.message);
      return;
    }
    const verifisert = data?.totp[0];
    if (verifisert) {
      setAktivFactor({
        id: verifisert.id,
        friendlyName: verifisert.friendly_name ?? null,
        createdAt: verifisert.created_at,
      });
    } else {
      setAktivFactor(null);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    hentFactors();
  }, [hentFactors]);

  async function tilSteg2() {
    setFeil(null);
    setPending(true);
    const { data: existingFactors } = await supabase.auth.mfa.listFactors();
    const uverifiserte = existingFactors?.all.filter(
      (f) => f.factor_type === "totp" && f.status === "unverified",
    );
    if (uverifiserte && uverifiserte.length > 0) {
      for (const f of uverifiserte) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `AK Golf TOTP (${new Date().toLocaleDateString("nb-NO")})`,
    });
    setPending(false);
    if (error || !data) {
      setFeil(oversettAuthFeil(error?.message ?? "Kunne ikke starte 2FA-oppsett"));
      return;
    }
    setEnrolled({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    });
    setSteg(2);
  }

  async function bekreftKode() {
    if (!enrolled) return;
    setFeil(null);
    if (kode.length !== 6) {
      setFeil("Skriv inn alle 6 sifrene.");
      return;
    }
    setPending(true);
    const challenge = await supabase.auth.mfa.challenge({
      factorId: enrolled.factorId,
    });
    if (challenge.error) {
      setPending(false);
      setFeil(oversettAuthFeil(challenge.error.message));
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: enrolled.factorId,
      challengeId: challenge.data.id,
      code: kode,
    });
    setPending(false);
    if (error) {
      setFeil(oversettAuthFeil(error.message));
      return;
    }
    setBackupKoder(genererBackupKoder());
    setSteg(3);
  }

  function fullfor() {
    if (!lagret) {
      setFeil("Bekreft at du har lagret backup-kodene.");
      return;
    }
    toast.success("2FA aktivert");
    setEnrolled(null);
    setKode("");
    setBackupKoder([]);
    setLagret(false);
    setSteg(1);
    hentFactors();
    router.refresh();
  }

  async function deaktiver() {
    if (!aktivFactor) return;
    setDeaktiverer(true);
    setFeil(null);
    const { error } = await supabase.auth.mfa.unenroll({
      factorId: aktivFactor.id,
    });
    setDeaktiverer(false);
    if (error) {
      toast.error("Kunne ikke deaktivere 2FA");
      setFeil(oversettAuthFeil(error.message));
      return;
    }
    toast.success("2FA deaktivert");
    setAktivFactor(null);
    router.refresh();
  }

  async function kopierBackup() {
    try {
      await navigator.clipboard.writeText(backupKoder.join("\n"));
      toast.success("Backup-koder kopiert");
    } catch {
      toast.error("Kunne ikke kopiere — last ned i stedet");
    }
  }

  function lastNedBackup() {
    const blob = new Blob([backupKoder.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ak-golf-backup-koder.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.info("Backup-koder lastet ned");
  }

  if (henter) {
    return (
      <Kort>
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
          <Icon name="loader" size={18} style={{ color: TL.mute }} />
        </div>
      </Kort>
    );
  }

  if (aktivFactor) {
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <StatusPill tone="up">Aktiv</StatusPill>
          </div>
          <Kort>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 9999,
                  background: `color-mix(in srgb, ${TL.ok} 12%, ${TL.elev})`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                <Icon name="shield-check" size={20} style={{ color: TL.ok }} />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, color: TL.text }}>
                  2FA er aktivert
                </div>
                <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
                  Kontoen din er beskyttet. Du må oppgi en 6-sifret kode ved innlogging.
                </p>
                {aktivFactor.friendlyName && (
                  <p style={{ margin: "8px 0 0", fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {aktivFactor.friendlyName}
                  </p>
                )}
                <p style={{ margin: "4px 0 0", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>
                  Aktivert{" "}
                  {new Date(aktivFactor.createdAt).toLocaleDateString("nb-NO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {feil && <FeilBoks msg={feil} />}

            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowReauth(true)}
                disabled={deaktiverer}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  minHeight: 40,
                  borderRadius: 9999,
                  border: `1px solid color-mix(in srgb, ${TL.danger} 35%, transparent)`,
                  background: `color-mix(in srgb, ${TL.danger} 10%, ${TL.elev})`,
                  padding: "0 14px",
                  fontFamily: TL.font.sans,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: TL.danger,
                  cursor: deaktiverer ? "default" : "pointer",
                  opacity: deaktiverer ? 0.5 : 1,
                }}
              >
                <Icon name="trash-2" size={14} />
                {deaktiverer ? "Deaktiverer …" : "Deaktivér 2FA"}
              </button>
            </div>
          </Kort>
        </div>

        <ReauthModal
          open={showReauth}
          onClose={() => setShowReauth(false)}
          onSuccess={() => {
            setShowReauth(false);
            deaktiver();
          }}
          reason="Du er i ferd med å deaktivere tofaktor-autentisering. Kontoen din vil være mindre beskyttet etter dette."
          bekreftTekst="Bekreft og deaktiver"
        />
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StegIndikator steg={steg} />

      {steg === 1 && (
        <Kort>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, color: TL.text }}>Aktiver tofaktor</div>
            <Caps>Steg 1 av 3</Caps>
          </div>
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
            Beskytt kontoen med en 6-sifret engangskode i tillegg til passord. Du trenger en authenticator-app:
          </p>
          <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {["Google Authenticator", "Authy", "1Password", "Microsoft Authenticator"].map((app) => (
              <li key={app} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>
                <Icon name="phone" size={14} style={{ color: TL.fill }} />
                {app}
              </li>
            ))}
          </ul>
          {feil && <FeilBoks msg={feil} />}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <Knapp icon="arrow-right" onClick={tilSteg2} disabled={pending}>
              {pending ? "Starter …" : "Start oppsett"}
            </Knapp>
          </div>
        </Kort>
      )}

      {steg === 2 && enrolled && (
        <Kort>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, color: TL.text }}>Skann QR-kode</div>
            <Caps>Steg 2 av 3</Caps>
          </div>
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
            Åpne authenticator-appen og skann QR-koden. Eller skriv inn secret manuelt.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 16 }}>
            <div style={{ borderRadius: 12, border: `1px solid ${TL.hair}`, background: TL.dock, padding: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={enrolled.qrCode} alt="QR-kode for 2FA-oppsett" width={200} height={200} style={{ display: "block" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <Caps>Manuell secret</Caps>
              <code
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  borderRadius: 10,
                  border: `1px solid ${TL.hair}`,
                  background: TL.dock,
                  padding: "8px 12px",
                  fontFamily: TL.font.mono,
                  fontSize: 12,
                  color: TL.text,
                  wordBreak: "break-all",
                }}
              >
                {enrolled.secret}
              </code>
            </div>
          </div>

          <label style={{ display: "block", marginTop: 16 }}>
            <Caps style={{ marginBottom: 8 }}>6-sifret kode fra appen</Caps>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={kode}
              onChange={(e) => setKode(e.target.value.replace(/[^0-9]/g, ""))}
              autoFocus
              placeholder="000000"
              style={{
                width: "100%",
                height: 52,
                borderRadius: 12,
                border: `1px solid ${TL.hair}`,
                background: TL.dock,
                textAlign: "center",
                fontFamily: TL.font.mono,
                fontSize: 20,
                letterSpacing: "0.4em",
                color: TL.text,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </label>

          {feil && <FeilBoks msg={feil} />}

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <Knapp
              ghost
              disabled={pending}
              onClick={async () => {
                if (enrolled) {
                  await supabase.auth.mfa.unenroll({ factorId: enrolled.factorId });
                }
                setEnrolled(null);
                setKode("");
                setSteg(1);
              }}
            >
              Tilbake
            </Knapp>
            <Knapp icon="arrow-right" onClick={bekreftKode} disabled={pending || kode.length !== 6}>
              {pending ? "Bekrefter …" : "Bekreft"}
            </Knapp>
          </div>
        </Kort>
      )}

      {steg === 3 && (
        <Kort>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, color: TL.text }}>Backup-koder</div>
            <Caps>Steg 3 av 3</Caps>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              borderRadius: TL.radius.row,
              border: `1px solid color-mix(in srgb, ${TL.warn} 35%, transparent)`,
              background: `color-mix(in srgb, ${TL.warn} 10%, ${TL.elev})`,
              padding: "10px 12px",
            }}
          >
            <Icon name="lock" size={14} style={{ color: TL.warn, marginTop: 2, flex: "none" }} />
            <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.5 }}>
              Hver kode kan brukes <strong>én gang</strong> hvis du mister appen. Lagre dem trygt — du får ikke se dem igjen.
            </p>
          </div>

          <ul
            style={{
              margin: "14px 0 0",
              padding: 0,
              listStyle: "none",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {backupKoder.map((k, i) => (
              <li
                key={k}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 10,
                  border: `1px solid ${TL.hair}`,
                  background: TL.dock,
                  padding: "8px 10px",
                  fontFamily: TL.font.mono,
                  fontSize: 12,
                  color: TL.text,
                }}
              >
                <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {k}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Knapp ghost icon="download" onClick={lastNedBackup}>
              Last ned
            </Knapp>
            <Knapp ghost icon="copy" onClick={kopierBackup}>
              Kopier alle
            </Knapp>
          </div>

          <label
            style={{
              marginTop: 14,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              borderRadius: TL.radius.row,
              border: `1px solid ${TL.hair}`,
              background: TL.dock,
              padding: "12px 14px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={lagret}
              onChange={(e) => {
                setLagret(e.target.checked);
                setFeil(null);
              }}
              style={{ marginTop: 2, accentColor: "var(--tl-fill)" }}
            />
            <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.45 }}>
              Jeg har lagret backup-kodene på et trygt sted.
            </span>
          </label>

          {feil && <FeilBoks msg={feil} />}

          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <Knapp icon="shield-check" onClick={fullfor} disabled={!lagret}>
              Fullfør og aktiver
            </Knapp>
          </div>
        </Kort>
      )}
    </div>
  );
}

function FeilBoks({ msg }: { msg: string }) {
  return (
    <div
      role="alert"
      style={{
        marginTop: 12,
        borderRadius: 10,
        border: `1px solid color-mix(in srgb, ${TL.danger} 30%, transparent)`,
        background: `color-mix(in srgb, ${TL.danger} 10%, ${TL.elev})`,
        padding: "10px 12px",
        fontFamily: TL.font.sans,
        fontSize: 13,
        color: TL.danger,
      }}
    >
      {msg}
    </div>
  );
}

function genererBackupKoder(): string[] {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  function tilfeldigByte(): number {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const arr = new Uint8Array(1);
      crypto.getRandomValues(arr);
      return arr[0];
    }
    return Math.floor(Math.random() * 256);
  }
  function lagSegment(len: number) {
    let s = "";
    for (let i = 0; i < len; i++) {
      s += chars[tilfeldigByte() % chars.length];
    }
    return s;
  }
  return Array.from({ length: 10 }, () => `${lagSegment(5)}-${lagSegment(5)}`);
}

function oversettAuthFeil(msg: string): string {
  if (msg.includes("Invalid TOTP code") || msg.includes("invalid code"))
    return "Feil kode. Prøv på nytt — pass på at klokken på telefonen er riktig.";
  if (msg.includes("AAL")) return "Du må logge inn på nytt for å bruke 2FA.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "For mange forsøk. Vent litt og prøv igjen.";
  return msg;
}

function StegIndikator({ steg }: { steg: Steg }) {
  const stegene: { id: Steg; label: string }[] = [
    { id: 1, label: "Start" },
    { id: 2, label: "Verifiser" },
    { id: 3, label: "Backup" },
  ];
  return (
    <ol style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, padding: 0, listStyle: "none" }} aria-label="Fremdrift">
      {stegene.map((s, i) => {
        const ferdig = steg > s.id;
        const aktiv = steg === s.id;
        return (
          <li key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 9999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: TL.font.mono,
                fontSize: 11,
                fontWeight: 700,
                border: `1px solid ${aktiv || ferdig ? "transparent" : TL.hair}`,
                background: aktiv ? TL.fill : ferdig ? `color-mix(in srgb, ${TL.ok} 14%, ${TL.elev})` : TL.dock,
                color: aktiv ? TL.onFill : ferdig ? TL.ok : TL.mute,
              }}
            >
              {ferdig ? <Icon name="check" size={12} /> : s.id}
            </span>
            <span
              style={{
                fontFamily: TL.font.mono,
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: aktiv ? TL.text : TL.mute,
              }}
            >
              {s.label}
            </span>
            {i < stegene.length - 1 && (
              <span
                aria-hidden
                style={{
                  width: 24,
                  height: 1,
                  background: ferdig ? TL.ok : TL.hair,
                  margin: "0 4px",
                }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
