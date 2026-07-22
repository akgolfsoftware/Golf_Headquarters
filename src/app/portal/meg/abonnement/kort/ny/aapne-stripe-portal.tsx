"use client";

/**
 * Åpner Stripe Customer Billing Portal — B-pakke (én grønn Knapp).
 */

import { useState } from "react";
import { Knapp, Icon } from "@/components/v2";
import { T } from "@/lib/v2/tokens";

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
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Knapp full icon="external-link" onClick={handleClick} disabled={loading}>
        {loading ? "Åpner Stripe …" : "Administrer kort i Stripe"}
      </Knapp>

      {error ? (
        <div
          role="alert"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            borderRadius: T.rRow,
            border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`,
            background: `color-mix(in srgb, ${T.down} 10%, ${T.panel})`,
            padding: 12,
          }}
        >
          <Icon name="triangle-alert" size={14} style={{ color: T.down, marginTop: 2, flex: "none" }} />
          <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.45 }}>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
