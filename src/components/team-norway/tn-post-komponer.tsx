"use client";

import { useState, useTransition } from "react";
import { TN } from "@/lib/v2/team-norway";
import { TnKnapp } from "./core";

type Feilbart = { ok: true } | { ok: false; feil: string };

/**
 * Komponer-felt for TN-09/TN-10 — «oppslagstavle, ikke chat» (prompt-batch-3.md):
 * kun tekst inn, ingen svarfelt på selve posten. Kall-siden gir hvilken
 * server action som skal kjøre (gruppe- eller spillerpost).
 */
const KIND_VALG = [
  { id: "TEKST", label: "Tekst" },
  { id: "REISE", label: "Reise" },
  { id: "MOTE", label: "Møte" },
  { id: "OKT", label: "Økt" },
] as const;

export function TnPostKomponer({
  send,
  plassholder,
  etikett,
  mottakerPille,
}: {
  send: (input: { tekst: string; kind: string }) => Promise<Feilbart>;
  plassholder: string;
  etikett?: string;
  mottakerPille?: string;
}) {
  const [tekst, setTekst] = useState("");
  const [kind, setKind] = useState<string>("TEKST");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function publiser() {
    if (pending || tekst.trim().length === 0) return;
    setFeil(null);
    startTransition(async () => {
      const svar = await send({ tekst: tekst.trim(), kind });
      if (!svar.ok) {
        setFeil(svar.feil);
        return;
      }
      setTekst("");
      setKind("TEKST");
    });
  }

  return (
    <div
      id="ny-post"
      style={{
        background: TN.surfaceCard,
        border: `1px solid ${TN.borderSubtle}`,
        borderRadius: TN.radius.lg,
        boxShadow: TN.shadow.sm,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {(etikett || mottakerPille) && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {etikett && (
            <span
              style={{
                fontFamily: TN.font.mono,
                fontSize: TN.text.micro,
                letterSpacing: TN.tracking.eyebrow,
                textTransform: "uppercase",
                color: TN.textSecondary,
              }}
            >
              {etikett}
            </span>
          )}
          <div style={{ flex: 1 }} />
          {mottakerPille && (
            <span
              style={{
                fontFamily: TN.font.mono,
                fontSize: TN.text.micro,
                letterSpacing: TN.tracking.eyebrow,
                textTransform: "uppercase",
                color: TN.navy700,
                background: TN.navy50,
                borderRadius: TN.radius.xs,
                padding: "3px 8px",
              }}
            >
              {mottakerPille}
            </span>
          )}
        </div>
      )}
      <textarea
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        placeholder={plassholder}
        rows={2}
        style={{
          minHeight: 44,
          border: `1px solid ${TN.borderDefault}`,
          borderRadius: TN.radius.md,
          padding: "10px 14px",
          fontFamily: TN.font.body,
          fontSize: TN.text.sm,
          color: TN.textPrimary,
          lineHeight: TN.leading.normal,
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {KIND_VALG.map((k) => {
          const aktiv = kind === k.id;
          return (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              style={{
                height: 32,
                padding: "0 12px",
                borderRadius: TN.radius.full,
                border: `1px solid ${aktiv ? TN.navy100 : TN.borderDefault}`,
                background: aktiv ? TN.navy50 : "transparent",
                fontFamily: TN.font.body,
                fontSize: TN.text.xs,
                fontWeight: aktiv ? TN.weight.semibold : TN.weight.medium,
                color: aktiv ? TN.navy900 : TN.textSecondary,
                cursor: "pointer",
              }}
            >
              {k.label}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        {feil && (
          <span style={{ fontFamily: TN.font.body, fontSize: TN.text.xs, color: TN.status.redText }}>{feil}</span>
        )}
        <TnKnapp variant="primaer" size="sm" onClick={publiser}>
          {pending ? "Publiserer …" : "Publiser"}
        </TnKnapp>
      </div>
    </div>
  );
}
