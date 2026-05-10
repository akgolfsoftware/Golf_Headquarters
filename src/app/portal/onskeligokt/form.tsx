"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { sendOnskeligOkt } from "./actions";

const PYR = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

type Coach = { id: string; name: string };

export function OnskeligOktForm({ coacher }: { coacher: Coach[] }) {
  const today = new Date().toISOString().split("T")[0];
  const [preferredDate, setPreferredDate] = useState(today);
  const [preferredTime, setPreferredTime] = useState("16:00");
  const [pyramidArea, setPyramidArea] = useState("SLAG");
  const [coachId, setCoachId] = useState(coacher[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await sendOnskeligOkt({
          preferredAt: `${preferredDate}T${preferredTime}:00`,
          pyramidArea,
          notes,
          coachId: coachId || undefined,
        });
      } catch {
        setError("Kunne ikke sende. Prøv igjen.");
      }
    });
  }

  return (
    <form onSubmit={send} className="space-y-4">
      {coacher.length > 0 && (
        <Felt label="Foretrukket coach (valgfritt)">
          <select
            value={coachId}
            onChange={(e) => setCoachId(e.target.value)}
            className={input}
          >
            <option value="">Ingen preferanse</option>
            {coacher.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Felt>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Felt label="Dato">
          <input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className={input}
          />
        </Felt>
        <Felt label="Tid">
          <input
            type="time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className={input}
          />
        </Felt>
      </div>

      <Felt label="Område">
        <div className="flex flex-wrap gap-2">
          {PYR.map((p) => {
            const aktiv = p === pyramidArea;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPyramidArea(p)}
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                  aktiv
                    ? "border-primary bg-primary/5 font-semibold text-primary"
                    : "border-input bg-card text-foreground hover:border-border"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </Felt>

      <Felt label="Notat / hva du vil jobbe med (valgfritt)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="f.eks. Pitch 50–100 m, korthold før turnering"
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

      <div className="flex gap-3">
        <Link
          href="/portal"
          className="rounded-md border border-input bg-card px-5 py-3 text-sm font-medium text-foreground hover:border-border"
        >
          Avbryt
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="ml-auto rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Sender…" : "Send forespørsel"}
        </button>
      </div>
    </form>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
