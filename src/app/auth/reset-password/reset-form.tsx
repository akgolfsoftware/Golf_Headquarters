"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticBadge } from "@/components/athletic/badge";

/**
 * ResetForm — hybrid design (2026-06-17).
 * Brukes fra /auth/reset-password etter at brukeren klikker
 * tilbakestillingslenken fra e-posten. Feltene er styled likt
 * forgot-form (sand-bakgrunn, pill CTA).
 */
export function ResetForm() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Passordet må være minst 8 tegn.");
      return;
    }
    if (password !== confirm) {
      setError("Passordene er ikke like.");
      return;
    }
    setError(null);
    setPending(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (err) {
      setError(oversettPassordFeil(err.message));
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  return (
    <form onSubmit={lagre} className="flex flex-col gap-[14px]">
      {/* Nytt passord */}
      <div>
        <label
          htmlFor="new-password"
          className="mb-[5px] block font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
        >
          Nytt passord
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            placeholder="Minst 8 tegn"
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

      {/* Bekreft passord */}
      <div>
        <label
          htmlFor="confirm-password"
          className="mb-[5px] block font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
        >
          Bekreft passord
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            placeholder="Gjenta passordet"
            className="w-full rounded-xl border border-border bg-secondary px-[14px] py-[11px] pr-11 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,88,64,0.10)]"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Skjul passord" : "Vis passord"}
            aria-pressed={showConfirm}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"
        >
          <AthleticBadge variant="urgent">Feil</AthleticBadge>
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full rounded-full bg-accent py-[13px] font-mono text-[12px] font-bold uppercase tracking-[0.10em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {pending ? "Lagrer…" : "Lagre nytt passord"}
      </button>
    </form>
  );
}

function oversettPassordFeil(msg: string): string {
  if (msg.includes("should be different from the old password"))
    return "Velg et annet passord enn det du hadde fra før.";
  if (msg.includes("Auth session missing"))
    return "Lenken er brukt eller utløpt. Be om en ny tilbakestillingslenke fra «Glemt passordet?».";
  return msg;
}
