"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/security/safe-redirect-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(oversettAuthFeil(error.message));
      return;
    }
    const next = safeRedirectPath(searchParams.get("next"), "/portal");
    router.push(next);
    router.refresh();
  }

  async function loggInnGoogle() {
    setError(null);
    setLoading(true);
    const next = safeRedirectPath(searchParams.get("next"), "/portal");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/oauth-callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setLoading(false);
      setError(oversettAuthFeil(error.message));
    }
    // Hvis ingen feil: Supabase redirecter til Google. Ingen videre handling her.
  }

  // TODO: Apple OAuth — krever Apple Developer account + provisioning
  // Når aktivert: render <button onClick={loggInnApple}> i UI-en under.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function loggInnApple() {
    setError(null);
    setLoading(true);
    const next = safeRedirectPath(searchParams.get("next"), "/portal");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${origin}/api/auth/oauth-callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setLoading(false);
      setError(oversettAuthFeil(error.message));
    }
  }

  const errorId = "login-form-error";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-describedby={error ? errorId : undefined}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
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
          className="w-full rounded-md border border-input bg-card px-4 py-4 text-base sm:text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="navn@eksempel.no"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
        >
          Passord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-input bg-card px-4 py-4 text-base sm:text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex items-center justify-between pt-2 text-xs">
        <label htmlFor="remember-me" className="inline-flex items-center gap-2 text-muted-foreground">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />{" "}
          Husk meg
        </label>
        <Link
          href="/auth/forgot-password"
          className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm"
        >
          Glemt passord?
        </Link>
      </div>

      <div role="alert" aria-live="polite" aria-atomic="true" id={errorId}>
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading || undefined}
        className="w-full rounded-md bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {loading ? "Logger inn…" : "Logg inn"}
      </button>

      <div className="relative pt-2">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span
            aria-hidden="true"
            className="bg-card px-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            eller
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={loggInnGoogle}
        disabled={loading}
        aria-busy={loading || undefined}
        aria-label="Logg inn med Google"
        className="flex w-full items-center justify-center gap-4 rounded-md border border-input bg-card px-4 py-4 text-sm font-medium text-foreground transition-colors hover:border-border disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <GoogleLogo />
        Logg inn med Google
      </button>

      <p className="pt-4 text-center text-sm text-muted-foreground">
        Har du ikke konto?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm"
        >
          Registrer deg
        </Link>
      </p>
    </form>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
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
