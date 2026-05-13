"use client";

import { useState } from "react";

type Plan = "pro" | "performance" | "performance_pro";

type Props = {
  plan: Plan;
  children: React.ReactNode;
  className?: string;
};

/**
 * Subscribe-knapp som starter Stripe Checkout for valgt plan.
 * Hvis brukeren ikke er logget inn, redirectes de til signup med plan
 * som returnerings-parameter.
 */
export function SubscribeButton({ plan, children, className = "" }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) {
        // Ikke innlogget — send til signup med returnerings-param
        window.location.href = `/auth/signup?subscribe=${plan}`;
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Noe gikk galt.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={className}
      >
        {pending ? "Sender deg til Stripe …" : children}
      </button>
      {error && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
