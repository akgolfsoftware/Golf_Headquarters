"use client";

import { useState, useTransition } from "react";
import { createBookingCheckout } from "./actions";

type Props = {
  slug: string;
  start: string;
  coachId: string;
  innloggetEpost: string | null;
  innloggetNavn: string | null;
  priceOre: number;
};

export function BekreftForm({
  slug,
  start,
  coachId,
  innloggetEpost,
  innloggetNavn,
  priceOre,
}: Props) {
  const [name, setName] = useState(innloggetNavn ?? "");
  const [email, setEmail] = useState(innloggetEpost ?? "");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Navn er påkrevd.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Gyldig e-post er påkrevd.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createBookingCheckout({
        slug,
        start,
        coachId,
        name,
        email,
        phone,
        notes,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Naviger til Stripe Checkout
      window.location.href = result.url;
    });
  }

  return (
    <form onSubmit={send} className="space-y-4">
      <Felt label="Navn">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={input}
        />
      </Felt>
      <Felt label="E-post">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={input}
        />
      </Felt>
      <Felt label="Telefon (valgfri)">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+47 …"
          className={input}
        />
      </Felt>
      <Felt label="Notater til coach (valgfri)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Hva vil du jobbe med?"
          className={input}
        />
      </Felt>

      {error && (
        <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Sender til betaling…" : `Betal ${priceOre / 100} kr →`}
      </button>
    </form>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
