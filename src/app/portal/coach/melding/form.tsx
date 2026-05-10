"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { sendCoachMelding } from "./actions";

type Coach = { id: string; name: string };

export function MeldingForm({ coacher }: { coacher: Coach[] }) {
  const [coachId, setCoachId] = useState(coacher[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!coachId) {
      setError("Velg coach.");
      return;
    }
    if (!content.trim()) {
      setError("Skriv en melding først.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await sendCoachMelding({ coachId, content });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kunne ikke sende.";
        if (msg === "upgrade-required") {
          setError("Krever Pro-abonnement.");
        } else {
          setError(msg);
        }
      }
    });
  }

  if (coacher.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Ingen coacher er registrert. Direkte meldinger blir tilgjengelig når en coach er knyttet til AK Golf-plattformen.
      </div>
    );
  }

  return (
    <form onSubmit={send} className="space-y-4">
      <label className="block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Til
        </span>
        <select
          value={coachId}
          onChange={(e) => setCoachId(e.target.value)}
          className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          {coacher.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Melding
        </span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 1000))}
          rows={6}
          placeholder="Skriv direkte til coachen din…"
          className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <span className="mt-1 block text-right font-mono text-[10px] text-muted-foreground">
          {content.length} / 1000
        </span>
      </label>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/portal/coach"
          className="rounded-md border border-input bg-card px-5 py-3 text-sm font-medium text-foreground hover:border-border"
        >
          Avbryt
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="ml-auto rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Sender…" : "Send melding"}
        </button>
      </div>
    </form>
  );
}
