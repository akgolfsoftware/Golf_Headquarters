"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createApiKey } from "./actions";

const SCOPES = [
  { value: "read:players", label: "Les spillerdata" },
  { value: "read:bookings", label: "Les bookinger" },
  { value: "write:rounds", label: "Skriv runder" },
  { value: "admin", label: "Full admin (kun ADMIN)" },
];

export function CreateApiKeyModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [valgteScopes, setValgteScopes] = useState<string[]>(["read:players"]);
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lukk() {
    setOpen(false);
    setName("");
    setValgteScopes(["read:players"]);
    setSecret(null);
    setError(null);
    router.refresh();
  }

  function toggleScope(value: string) {
    setValgteScopes((curr) =>
      curr.includes(value) ? curr.filter((s) => s !== value) : [...curr, value]
    );
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Skriv navn på nøkkelen.");
      return;
    }
    if (valgteScopes.length === 0) {
      setError("Velg minst én scope.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await createApiKey({ name, scopes: valgteScopes });
        setSecret(res.secret);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke opprette.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        + Ny API-nøkkel
      </button>

      <dialog
        ref={dialogRef}
        onClose={lukk}
        className="rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 max-w-md w-full"
      >
        {secret ? (
          <div className="p-6">
            <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
              <em className="font-normal text-primary md:italic">Lagre</em> nøkkelen nå
            </h2>
            <p className="mt-2 mb-4 text-sm text-muted-foreground">
              Dette er den eneste gangen du kan se hele nøkkelen. Lagre den i
              passordforvalter.
            </p>
            <code className="block break-all rounded-md border border-border bg-muted/50 px-3 py-3 font-mono text-xs text-foreground">
              {secret}
            </code>
            <button
              type="button"
              onClick={lukk}
              className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Jeg har lagret den
            </button>
          </div>
        ) : (
          <form onSubmit={lagre} className="p-6">
            <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
              <em className="font-normal text-primary md:italic">Ny</em> API-nøkkel
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              For tredjeparts-integrasjoner.
            </p>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Navn
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="f.eks. GolfBox-sync"
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </label>

              <div>
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Scopes
                </span>
                <div className="space-y-1.5">
                  {SCOPES.map((s) => (
                    <label
                      key={s.value}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm hover:border-border"
                    >
                      <input
                        type="checkbox"
                        checked={valgteScopes.includes(s.value)}
                        onChange={() => toggleScope(s.value)}
                        className="accent-primary"
                      />
                      <span>{s.label}</span>
                      <code className="ml-auto font-mono text-[10px] text-muted-foreground">
                        {s.value}
                      </code>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={lukk}
                disabled={pending}
                className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium hover:border-border"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Oppretter…" : "Opprett"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
