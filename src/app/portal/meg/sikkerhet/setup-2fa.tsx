"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type EnrollResult = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export function Setup2FA() {
  const supabase = createClient();
  const [enroll, setEnroll] = useState<EnrollResult | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  async function start() {
    setPending(true);
    setError(null);
    const { data, error: err } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });
    setPending(false);
    if (err || !data) {
      setError(err?.message ?? "Kunne ikke starte 2FA-oppsett");
      return;
    }
    setEnroll({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }

  async function verify() {
    if (!enroll) return;
    setPending(true);
    setError(null);
    const challenge = await supabase.auth.mfa.challenge({
      factorId: enroll.factorId,
    });
    if (challenge.error) {
      setPending(false);
      setError(challenge.error.message);
      return;
    }
    const { error: err } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: challenge.data.id,
      code,
    });
    setPending(false);
    if (err) {
      setError(err.message);
      return;
    }
    setVerified(true);
  }

  if (verified) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
        <strong>2FA aktivert.</strong> Du må nå bruke autentiseringskode ved
        innlogging.
      </div>
    );
  }

  if (!enroll) {
    return (
      <div className="space-y-3 rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Beskytt kontoen din med tofaktor-autentisering. Du trenger en TOTP-app
          (Google Authenticator, 1Password, Authy).
        </p>
        <button
          type="button"
          onClick={start}
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Starter…" : "Aktiver 2FA"}
        </button>
        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">
        Skann QR-koden med autentiseringsappen din, eller skriv inn secret manuelt.
      </p>
      <div className="flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={enroll.qrCode}
          alt="QR-kode for 2FA"
          width={200}
          height={200}
          className="rounded-md border border-border"
        />
        <code className="break-all rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
          {enroll.secret}
        </code>
      </div>

      <label className="block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          6-sifret kode
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full rounded-md border border-input bg-card px-4 py-3 text-center text-lg font-mono tabular-nums tracking-widest outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          placeholder="000000"
        />
      </label>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={verify}
        disabled={pending || code.length !== 6}
        className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Bekrefter…" : "Bekreft og aktiver"}
      </button>
    </div>
  );
}
