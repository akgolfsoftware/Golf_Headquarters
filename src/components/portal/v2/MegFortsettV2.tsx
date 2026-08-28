"use client";

/**
 * Vinn-tilbake-tilbudet (plan A4): «Behold PlayerHQ etter coaching».
 * To priskort (299 kr/mnd · 2 690 kr/år — tre måneder gratis), CTA går til
 * Stripe Checkout med startEtterCoaching (abonnementet starter når
 * coaching-perioden utløper — aldri dobbelbetaling), og «Nei takk» stopper
 * påminnelsene. Bygget på oppgrader-flytens byggeklosser (ingen Paper-fasit
 * for skjermen ennå — merket for fasit-runde).
 */

import { useState, useTransition } from "react";
import { Knapp, Caps, Tittel, Kort, TilbakeLenke } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";

import { avslaaWinback } from "@/app/portal/meg/abonnement/fortsett/actions";

export function MegFortsettV2({
  tilbudId,
  utlopsDato,
}: {
  tilbudId: string;
  utlopsDato: string | null;
}) {
  const [intervall, setIntervall] = useState<"mnd" | "aar">("aar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avslaar, startAvslaa] = useTransition();

  async function handleFortsett() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: intervall === "aar" ? "pro_aar" : "pro",
          startEtterCoaching: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const { url } = await res.json();
      if (!url) throw new Error("Mangler checkout-URL");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke åpne betaling.");
      setLoading(false);
    }
  }

  return (
    <div
      data-paper-slug="playerhq-abonnement"
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 0 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <TilbakeLenke href="/portal/meg/abonnement">Abonnement</TilbakeLenke>

      <div>
        <Caps>Abonnement · Fortsett</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="PlayerHQ">Behold</Tittel>
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "8px 0 0", lineHeight: 1.5, maxWidth: "42ch" }}>
          {utlopsDato
            ? `Coaching-pakken din avsluttes ${utlopsDato}. Treningsplanen, statistikken og historikken ligger klar til deg videre — og abonnementet starter først når coaching-perioden utløper, så du betaler aldri dobbelt.`
            : "Coaching-pakken din er sagt opp. Treningsplanen, statistikken og historikken ligger klar til deg videre."}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Velg abonnement"
        style={{ display: "grid", gap: 10 }}
      >
        {(
          [
            {
              key: "aar",
              label: "Årlig",
              pris: "2 690 kr/år",
              under: "Tre måneder gratis — spar 898 kr",
              anbefalt: true,
            },
            { key: "mnd", label: "Månedlig", pris: "299 kr/mnd", under: "Avbryt når som helst", anbefalt: false },
          ] as const
        ).map((v) => (
          <button
            key={v.key}
            type="button"
            role="radio"
            aria-checked={intervall === v.key}
            onClick={() => setIntervall(v.key)}
            style={{
              textAlign: "left",
              borderRadius: TL.radius.row,
              border: `2px solid ${intervall === v.key ? TL.fill : TL.hair}`,
              background: intervall === v.key ? TL.dim : TL.elev,
              padding: "14px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 700, color: TL.text }}>
                {v.label}
                {v.anbefalt ? (
                  <span
                    style={{
                      marginLeft: 8,
                      fontFamily: TL.font.mono,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      color: TL.fill,
                      background: TL.fill,
                      borderRadius: 9999,
                      padding: "2px 8px",
                    }}
                  >
                    BESTE PRIS
                  </span>
                ) : null}
              </div>
              <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, marginTop: 3 }}>{v.under}</div>
            </div>
            <div style={{ fontFamily: TL.font.mono, fontSize: 16, fontWeight: 800, color: TL.text, whiteSpace: "nowrap" }}>
              {v.pris}
            </div>
          </button>
        ))}
      </div>

      <Kort>
        <Caps>Dette beholder du</Caps>
        <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.7 }}>
          <li>Treningsplanen og hele historikken din</li>
          <li>Statistikk, runder og Strokes Gained</li>
          <li>Testbatteriet og utviklingen din</li>
          <li>Booking av enkelttimer når du trenger coach</li>
        </ul>
      </Kort>

      {error && (
        <div
          role="alert"
          style={{
            borderRadius: TL.radius.row,
            border: `1px solid color-mix(in srgb, ${TL.danger} 30%, transparent)`,
            background: `color-mix(in srgb, ${TL.danger} 10%, ${TL.elev})`,
            padding: 12,
            fontFamily: TL.font.sans,
            fontSize: 13,
            color: TL.danger,
          }}
        >
          {error}
        </div>
      )}

      <Knapp full icon="arrow-right" onClick={handleFortsett} disabled={loading || avslaar}>
        {loading
          ? "Åpner betaling …"
          : intervall === "aar"
            ? "Fortsett med årlig — 2 690 kr"
            : "Fortsett med månedlig — 299 kr"}
      </Knapp>

      <button
        type="button"
        onClick={() => startAvslaa(() => void avslaaWinback(tilbudId))}
        disabled={loading || avslaar}
        style={{
          background: "none",
          border: "none",
          fontFamily: TL.font.sans,
          fontSize: 12.5,
          color: TL.mute,
          textDecoration: "underline",
          cursor: "pointer",
          padding: 6,
        }}
      >
        {avslaar ? "Lagrer …" : "Nei takk, avslutt tilgangen når perioden utløper"}
      </button>

      <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, textAlign: "center", lineHeight: 1.5 }}>
        Sikker betaling via Stripe. Abonnementet starter når coaching-perioden utløper.
      </p>
    </div>
  );
}
