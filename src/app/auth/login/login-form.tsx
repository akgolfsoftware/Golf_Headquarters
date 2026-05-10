"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
    const next = searchParams.get("next") ?? "/portal";
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
        >
          E-post
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
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
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="flex items-center justify-between pt-2 text-xs">
        <label className="inline-flex items-center gap-2 text-muted-foreground">
          <input type="checkbox" className="accent-primary" /> Husk meg
        </label>
        <Link
          href="/auth/forgot-password"
          className="font-medium text-primary hover:underline"
        >
          Glemt passord?
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Logger inn…" : "Logg inn"}
      </button>

      <p className="pt-4 text-center text-sm text-muted-foreground">
        Har du ikke konto?{" "}
        <Link href="/auth/signup" className="font-medium text-primary hover:underline">
          Registrer deg
        </Link>
      </p>
    </form>
  );
}

function oversettAuthFeil(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "Feil e-post eller passord.";
  if (msg.includes("Email not confirmed"))
    return "E-posten er ikke bekreftet. Sjekk innboksen din.";
  return msg;
}
