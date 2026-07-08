"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Copy,
  Download,
  KeyRound,
  Loader2,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/shared/toast-provider";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticButton } from "@/components/athletic/button";
import { ReauthModal } from "@/components/auth/reauth-modal";
import { createClient } from "@/lib/supabase/client";

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
 * 2FA-flyt via Supabase MFA (TOTP).
 *
 * Tre tilstander:
 * 1. Ingen verifisert factor → vis 3-stegs setup-flyt (metode → QR → backup)
 * 2. Verifisert factor finnes → vis status + "Deaktivér 2FA"-knapp (krever re-auth)
 * 3. Laster → spinner
 *
 * Backup-koder genereres lokalt og vises kun én gang. Supabase Auth støtter
 * IKKE serverside backup-koder for TOTP — derfor lager vi koder kun til
 * visning, og lar brukeren laste ned/kopiere selv.
 */
export function TwoFaClient() {
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  const [aktivFactor, setAktivFactor] = useState<AktivFactor | null>(null);
  const [henter, setHenter] = useState(true);
  const [feil, setFeil] = useState<string | null>(null);

  // Setup-flyt state
  const [steg, setSteg] = useState<Steg>(1);
  const [enrolled, setEnrolled] = useState<EnrolledFactor | null>(null);
  const [kode, setKode] = useState("");
  const [pending, setPending] = useState(false);
  const [lagret, setLagret] = useState(false);
  const [backupKoder, setBackupKoder] = useState<string[]>([]);

  // Deaktivering
  const [showReauth, setShowReauth] = useState(false);
  const [deaktiverer, setDeaktiverer] = useState(false);

  // Sjekk om brukeren allerede har 2FA aktivert
  const hentFactors = useCallback(async () => {
    setHenter(true);
    setFeil(null);
    const { data, error } = await supabase.auth.mfa.listFactors();
    setHenter(false);
    if (error) {
      setFeil(error.message);
      return;
    }
    // data.totp er allerede filtrert til kun verifiserte TOTP-factors
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

  // Steg 1 → 2: kall enroll() og hent QR-kode
  async function tilSteg2() {
    setFeil(null);
    setPending(true);
    // Hvis det allerede finnes en ikke-verifisert factor, rydd opp først.
    // Supabase returnerer feil hvis vi prøver å enrolle en ny factor mens
    // det finnes "unverified" factors. data.all inneholder factors med alle
    // statuser, mens data.totp kun er verifiserte.
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

  // Steg 2 → 3: kall challenge() + verify()
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
    // Generer backup-koder lokalt (kun for visning — Supabase støtter ikke
    // server-side backup-koder for TOTP).
    setBackupKoder(genererBackupKoder());
    setSteg(3);
  }

  function fullfor() {
    if (!lagret) {
      setFeil("Bekreft at du har lagret backup-kodene.");
      return;
    }
    toast.success("2FA aktivert");
    // Reset setup-state og hent oppdatert factor-liste
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

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------

  if (henter) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12">
        <Loader2
          className="h-5 w-5 animate-spin text-muted-foreground"
          strokeWidth={1.75}
        />
      </div>
    );
  }

  // Tilstand A: 2FA er allerede aktivert
  if (aktivFactor) {
    return (
      <>
        <div className="space-y-6">
          <Kort tittel="2FA er aktivert" aux="Aktiv">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-foreground">
                  Kontoen din er beskyttet med tofaktor-autentisering. Du må
                  oppgi en 6-sifret kode hver gang du logger inn.
                </p>
                {aktivFactor.friendlyName && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {aktivFactor.friendlyName}
                  </p>
                )}
                <p className="font-mono text-xs text-muted-foreground">
                  Aktivert{" "}
                  {new Date(aktivFactor.createdAt).toLocaleDateString("nb-NO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {feil && (
              <div
                role="alert"
                className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
              >
                {feil}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReauth(true)}
                disabled={deaktiverer}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-60"
              >
                {deaktiverer ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                    Deaktiverer …
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    Deaktivér 2FA
                  </>
                )}
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

  // Tilstand B: Setup-flyt
  return (
    <div className="space-y-6">
      <StegIndikator steg={steg} />

      {steg === 1 && (
        <Kort tittel="Aktiver tofaktor" aux="Steg 1 av 3">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Beskytt kontoen din med en 6-sifret engangskode i tillegg til
              passord. Du trenger en autenticator-app:
            </p>
            <ul className="space-y-2 text-sm text-foreground">
              {[
                "Google Authenticator",
                "Authy",
                "1Password",
                "Microsoft Authenticator",
              ].map((app) => (
                <li key={app} className="flex items-center gap-2">
                  <Smartphone
                    className="h-4 w-4 text-primary"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  {app}
                </li>
              ))}
            </ul>
          </div>

          {feil && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {feil}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <AthleticButton
              type="button"
              variant="primary"
              onClick={tilSteg2}
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  Starter …
                </>
              ) : (
                <>
                  Start oppsett
                  <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                </>
              )}
            </AthleticButton>
          </div>
        </Kort>
      )}

      {steg === 2 && enrolled && (
        <Kort tittel="Skann QR-kode" aux="Steg 2 av 3">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Åpne autenticator-appen og skann QR-koden under. Eller skriv inn
              secret-koden manuelt.
            </p>
            <div className="flex flex-col items-center gap-4">
              <QrKode src={enrolled.qrCode} />
              <div className="text-center">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Manuell secret
                </div>
                <code className="mt-1 inline-block break-all rounded-md border border-border bg-muted px-4 py-2 font-mono text-sm tabular-nums text-foreground">
                  {enrolled.secret}
                </code>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                6-sifret kode fra appen
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={kode}
                onChange={(e) =>
                  setKode(e.target.value.replace(/[^0-9]/g, ""))
                }
                autoFocus
                className="w-full rounded-md border border-input bg-card px-4 py-4 text-center font-mono text-lg tabular-nums tracking-[0.5em] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                placeholder="000000"
              />
            </label>

            {feil && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
              >
                {feil}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={async () => {
                  // Avbryt: fjern uverifisert factor
                  if (enrolled) {
                    await supabase.auth.mfa.unenroll({
                      factorId: enrolled.factorId,
                    });
                  }
                  setEnrolled(null);
                  setKode("");
                  setSteg(1);
                }}
                disabled={pending}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-input bg-card px-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary disabled:opacity-60"
              >
                Tilbake
              </button>
              <AthleticButton
                type="button"
                variant="primary"
                onClick={bekreftKode}
                disabled={pending || kode.length !== 6}
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                    Bekrefter …
                  </>
                ) : (
                  <>
                    Bekreft
                    <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                  </>
                )}
              </AthleticButton>
            </div>
          </div>
        </Kort>
      )}

      {steg === 3 && (
        <Kort tittel="Backup-koder" aux="Steg 3 av 3">
          <div className="flex items-start gap-2 rounded-md border border-accent/40 bg-accent/10 px-4 py-2">
            <KeyRound
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-foreground"
              strokeWidth={1.75}
            />
            <p className="text-sm text-foreground">
              Hver kode kan brukes <strong>én gang</strong> hvis du mister
              tilgang til autenticator-appen. Lagre dem trygt — du får ikke se
              dem igjen.
            </p>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {backupKoder.map((k, i) => (
              <li
                key={k}
                className="flex items-center gap-2 rounded-md border border-border bg-muted px-4 py-2 font-mono text-sm tabular-nums text-foreground"
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {k}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={lastNedBackup}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-input bg-card px-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
              Last ned
            </button>
            <button
              type="button"
              onClick={kopierBackup}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-input bg-card px-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              Kopier alle
            </button>
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-2 rounded-md border border-border bg-card px-4 py-2">
            <input
              type="checkbox"
              checked={lagret}
              onChange={(e) => {
                setLagret(e.target.checked);
                setFeil(null);
              }}
              className="mt-1 h-4 w-4 cursor-pointer rounded-sm border-input accent-primary"
            />
            <span className="text-sm text-foreground">
              Jeg har lagret backup-kodene på et trygt sted.
            </span>
          </label>

          {feil && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {feil}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <AthleticButton
              type="button"
              variant="primary"
              onClick={fullfor}
              disabled={!lagret}
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
              Fullfør og aktiver
            </AthleticButton>
          </div>
        </Kort>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HJELPERE
// ---------------------------------------------------------------------------

function genererBackupKoder(): string[] {
  // Bruk crypto API hvis tilgjengelig (browser), fallback til Math.random
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

// ---------------------------------------------------------------------------
// UI-KOMPONENTER
// ---------------------------------------------------------------------------

function QrKode({ src }: { src: string }) {
  // Supabase returnerer QR-koden som data-URL (SVG eller PNG).
  return (
    <div className="rounded-md border border-border bg-card p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="QR-kode for 2FA-oppsett"
        width={200}
        height={200}
        className="block h-[200px] w-[200px]"
      />
    </div>
  );
}

function Kort({
  tittel,
  aux,
  children,
}: {
  tittel: string;
  aux?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-6 py-4">
        <h2 className="font-display text-base font-semibold text-foreground">
          {tittel}
        </h2>
        {aux && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {aux}
          </span>
        )}
      </header>
      <div className="p-4 md:p-6">{children}</div>
    </section>
  );
}

function StegIndikator({ steg }: { steg: Steg }) {
  const stegene: { id: Steg; label: string }[] = [
    { id: 1, label: "Start" },
    { id: 2, label: "Verifiser" },
    { id: 3, label: "Backup" },
  ];
  return (
    <ol className="flex items-center gap-2" aria-label="Fremdrift">
      {stegene.map((s, i) => {
        const ferdig = steg > s.id;
        const aktiv = steg === s.id;
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs tabular-nums ${
                aktiv
                  ? "border-primary bg-primary text-primary-foreground"
                  : ferdig
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
              }`}
            >
              {ferdig ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
              ) : (
                s.id
              )}
            </span>
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.10em] ${
                aktiv ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < stegene.length - 1 && (
              <span
                aria-hidden
                className={`mx-2 h-px w-8 ${
                  ferdig ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
