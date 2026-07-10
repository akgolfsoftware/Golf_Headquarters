"use client";

import { Tag } from "@/components/athletic/golfdata";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/security/safe-redirect-client";

/**
 * LoginForm — hybrid design (2026-06-17).
 * Fasit: Auth Innlogging (hybrid).dc.html — PlayerHQ-tab.
 * Mono-etiketter, sand-bakgrunn på inputs, pill CTA (forest+lime),
 * "eller"-divider, Google-knapp, signup-lenke i bunn.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (authErr) {
      setError(oversettAuthFeil(authErr.message));
      return;
    }
    const next = safeRedirectPath(searchParams.get("next"), "/auth/etter-innlogging");
    router.push(next);
    router.refresh();
  }

  async function loggInnGoogle() {
    setError(null);
    setLoading(true);
    const next = safeRedirectPath(searchParams.get("next"), "/auth/etter-innlogging");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: authErr } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/oauth-callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (authErr) {
      setLoading(false);
      setError(oversettAuthFeil(authErr.message));
    }
    // Ingen videre handling — Supabase redirecter til Google.
  }

  // TODO: Apple OAuth — krever Apple Developer account + provisioning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function loggInnApple() {
    setError(null);
    setLoading(true);
    const next = safeRedirectPath(searchParams.get("next"), "/auth/etter-innlogging");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: authErr } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${origin}/api/auth/oauth-callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (authErr) {
      setLoading(false);
      setError(oversettAuthFeil(authErr.message));
    }
  }

  const errorId = "login-form-error";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-describedby={error ? errorId : undefined}
      className="flex flex-col"
    >
      {/* E-post */}
      <div className="mb-[14px]">
        <label
          htmlFor="email"
          className="mb-[5px] block font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
        >
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="oyvind@akgolf.no"
          className="w-full rounded-xl border border-border bg-secondary px-[14px] py-[11px] text-sm text-foreground outline-none placeholder:text-muted-foreground/60 transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,88,64,0.10)]"
        />
      </div>

      {/* Passord */}
      <div className="mb-[5px]">
        <label
          htmlFor="password"
          className="mb-[5px] block font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
        >
          Passord
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-required="true"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-border bg-secondary px-[14px] py-[11px] pr-11 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,88,64,0.10)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Skjul passord" : "Vis passord"}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Glemt passord — høyrejustert */}
      <div className="mb-5 flex justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-[12px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          Glemt passordet?
        </Link>
      </div>

      {/* Feilmelding */}
      <div role="alert" aria-live="polite" aria-atomic="true" id={errorId}>
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
            <Tag variant="down">Feil</Tag>
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}
      </div>

      {/* CTA — pill, forest + lime */}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading || undefined}
        className="mb-4 w-full rounded-full bg-accent py-[13px] font-mono text-[12px] font-bold uppercase tracking-[0.10em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {loading ? "Logger inn…" : "Logg inn"}
      </button>

      {/* Divider */}
      <div className="mb-[14px] flex items-center gap-[10px]" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          eller
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={loggInnGoogle}
        disabled={loading}
        aria-busy={loading || undefined}
        aria-label="Logg inn med Google"
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-transparent py-[11px] text-[13.5px] font-medium text-foreground transition-colors hover:border-primary disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <GoogleLogo />
        Fortsett med Google
      </button>

      {/* Signup-lenke */}
      <p className="mt-[18px] text-center text-[12.5px] text-muted-foreground">
        Ikke bruker?{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          Registrer deg
        </Link>
      </p>
    </form>
  );
}

function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function oversettAuthFeil(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "Feil e-post eller passord.";
  if (msg.includes("Email not confirmed"))
    return "E-posten er ikke bekreftet. Sjekk innboksen din.";
  return msg;
}
