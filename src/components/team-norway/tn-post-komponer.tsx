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
export function TnPostKomponer({
  send,
  plassholder,
}: {
  send: (input: { tekst: string; kind: string }) => Promise<Feilbart>;
  plassholder: string;
}) {
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function publiser() {
    if (pending || tekst.trim().length === 0) return;
    setFeil(null);
    startTransition(async () => {
      const svar = await send({ tekst: tekst.trim(), kind: "TEKST" });
      if (!svar.ok) {
        setFeil(svar.feil);
        return;
      }
      setTekst("");
    });
  }

  return (
    <div
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
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {feil && (
          <span style={{ fontFamily: TN.font.body, fontSize: TN.text.xs, color: TN.status.redText }}>{feil}</span>
        )}
        <div style={{ flex: 1 }} />
        <TnKnapp variant="primaer" onClick={publiser}>
          {pending ? "Publiserer …" : "Publiser"}
        </TnKnapp>
      </div>
    </div>
  );
}
