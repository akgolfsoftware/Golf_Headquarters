"use client";

/**
 * Oppgrader til Pro — B-pakke.
 * Pris/status først, fordeler, én grønn «Gå til betaling».
 */

import { useState } from "react";
import { Knapp, Caps, Tittel, Kort, TilbakeLenke, StatusPill, Icon } from "@/components/v2";
import { T } from "@/lib/v2/tokens";

const FORDELER: { icon: string; tittel: string; meta: string }[] = [
  { icon: "sparkles", tittel: "AI-coach 24/7", meta: "Svar tilpasset dine TrackMan-data" },
  { icon: "crosshair", tittel: "4 coaching-credits / mnd", meta: "1:1-time, video eller treningsuke" },
  { icon: "video", tittel: "Videoanalyse", meta: "Coach tegner linjer og vinkler" },
  { icon: "calendar", tittel: "Smart planlegger", meta: "Pyramide-balansert ukeplan" },
  { icon: "bar-chart", tittel: "Komplett historikk", meta: "Alle runder og økter, ubegrenset" },
  { icon: "users", tittel: "Familiekonto", meta: "Opptil 3 sammenkoblinger" },
];

export function OppgraderFlytWizard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBekreft() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const { url } = await res.json();
      if (!url) throw new Error("Mangler checkout-URL");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke åpne checkout.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 0 24px",
        display: "flex",
        flexDirection: "column",
        gap: T.gap,
      }}
    >
      <TilbakeLenke href="/portal/meg/abonnement">Abonnement</TilbakeLenke>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>Abonnement · Oppgrader</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="Pro">Løft spillet med</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "8px 0 0", lineHeight: 1.45, maxWidth: "36ch" }}>
            AI-coach, videoanalyse og komplett historikk. Avbryt når som helst.
          </p>
        </div>
        <StatusPill tone="lime">299 kr/mnd</StatusPill>
      </div>

      <Kort
        style={{
          background: T.forest,
          border: "none",
        }}
      >
        <Caps color="color-mix(in srgb, var(--v2-on-lime) 70%, transparent)">Din pris</Caps>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
          <span style={{ fontFamily: T.mono, fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", color: T.onLime, lineHeight: 1 }}>
            299
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: "color-mix(in srgb, var(--v2-on-lime) 70%, transparent)" }}>
            kr / mnd
          </span>
        </div>
        <p style={{ margin: "10px 0 0", fontFamily: T.ui, fontSize: 13, color: "color-mix(in srgb, var(--v2-on-lime) 80%, transparent)", lineHeight: 1.45 }}>
          Alt inkludert. Fri pause, fri avbestilling.
        </p>
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["AI-coach", "4 credits", "Video", "Familie"].map((c) => (
            <span
              key={c}
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: T.forest,
                background: T.lime,
                borderRadius: 9999,
                padding: "4px 9px",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </Kort>

      <Kort pad="0">
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.border}` }}>
          <Caps>Inkludert i Pro</Caps>
        </div>
        {FORDELER.map((f, i) => (
          <div
            key={f.tittel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 18px",
              borderBottom: i < FORDELER.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: T.panel3,
                border: `1px solid ${T.border}`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              <Icon name={f.icon} size={15} style={{ color: T.fg2 }} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{f.tittel}</div>
              <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 2 }}>{f.meta}</div>
            </div>
            <Icon name="check" size={14} style={{ color: T.up, marginLeft: "auto", flex: "none" }} />
          </div>
        ))}
      </Kort>

      {error && (
        <div
          role="alert"
          style={{
            borderRadius: T.rRow,
            border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`,
            background: `color-mix(in srgb, ${T.down} 10%, ${T.panel})`,
            padding: 12,
            fontFamily: T.ui,
            fontSize: 13,
            color: T.down,
          }}
        >
          {error}
        </div>
      )}

      <Knapp full icon="arrow-right" onClick={handleBekreft} disabled={loading}>
        {loading ? "Åpner betaling …" : "Gå til betaling"}
      </Knapp>

      <p style={{ margin: 0, fontFamily: T.ui, fontSize: 11.5, color: T.mut, textAlign: "center", lineHeight: 1.5 }}>
        Sikker betaling via Stripe. 30 dagers angrerett.
      </p>
    </div>
  );
}
