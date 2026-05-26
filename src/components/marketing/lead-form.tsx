"use client";

import { useState } from "react";

export function LeadForm({
  source,
  cta = "Send",
  placeholder = "din@epost.no",
  visNavn = false,
  takkemelding = "Takk! Sjekk innboksen din.",
}: {
  source: string;
  cta?: string;
  placeholder?: string;
  visNavn?: boolean;
  takkemelding?: string;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [sendt, setSendt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          source,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Noe gikk galt");
      }
      setSendt(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke sende.");
    } finally {
      setPending(false);
    }
  }

  if (sendt) {
    return (
      <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-4 text-sm text-foreground">
        ✓ {takkemelding}
      </div>
    );
  }

  return (
    <form onSubmit={send} className="space-y-4">
      {visNavn && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ditt navn"
          className="w-full rounded-md border border-input bg-card px-4 py-4 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder={placeholder}
          className="flex-1 rounded-md border border-input bg-card px-4 py-4 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {pending ? "Sender…" : cta}
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}
    </form>
  );
}
