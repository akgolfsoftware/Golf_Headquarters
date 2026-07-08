"use client";

/**
 * AapneStripePortal — åpner Stripe Customer Billing Portal for kort-administrasjon.
 *
 * Kort lagres ALDRI hos oss. Spilleren legger til / endrer kort i Stripes egen
 * sikre portal (PCI-DSS). POST /api/stripe/portal oppretter en portal-session
 * for innlogget bruker og returnerer URL-en vi redirecter til.
 */

import { useState } from "react";
import { Loader2, ExternalLink, AlertTriangle } from "lucide-react";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticButton } from "@/components/athletic";

export function AapneStripePortal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const { url } = (await res.json()) as { url?: string };
      if (!url) throw new Error("Mangler portal-URL fra Stripe.");
      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunne ikke åpne Stripe akkurat nå.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <AthleticButton
        type="button"
        variant="lime"
        size="lg"
        className="w-full"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
            Åpner Stripe …
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden />
            Administrer kort i Stripe
          </span>
        )}
      </AthleticButton>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/25 border-l-[3px] border-l-destructive bg-destructive/10 p-3.5"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
            strokeWidth={2}
            aria-hidden
          />
          <span className="text-[13px] leading-relaxed text-foreground">{error}</span>
        </div>
      ) : null}
    </div>
  );
}
