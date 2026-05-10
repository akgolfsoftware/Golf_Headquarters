"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetForm() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
      setError(err.message);
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  return (
    <form onSubmit={lagre} className="space-y-4">
      <Felt label="Nytt passord">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          className={input}
        />
      </Felt>
      <Felt label="Bekreft passord">
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          className={input}
        />
      </Felt>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Lagrer…" : "Lagre nytt passord"}
      </button>
    </form>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
