"use client";

/**
 * Rapporter-inngang på venn-profilen — B-pakke (T tokens + Knapp).
 */

import { useState, useTransition } from "react";
import { Knapp, Kort } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { opprettRapport } from "@/lib/moderering/actions";

export function RapporterVennKnapp({ vennUserId }: { vennUserId: string }) {
  const [apen, setApen] = useState(false);
  const [begrunnelse, setBegrunnelse] = useState("");
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);

  function send() {
    setFeil(null);
    startTransition(async () => {
      const res = await opprettRapport("SPILLERPROFIL", vennUserId, begrunnelse);
      if (!res.ok) {
        setFeil(res.error ?? "Kunne ikke sende rapport. Prøv igjen.");
        return;
      }
      setSendt(true);
      setApen(false);
      setBegrunnelse("");
    });
  }

  if (sendt) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          borderRadius: 9999,
          border: `1px solid ${T.border}`,
          background: T.panel,
          padding: "8px 14px",
          fontFamily: T.ui,
          fontSize: 12,
          color: T.fg2,
        }}
      >
        Rapport sendt — takk. En coach ser på den.
      </div>
    );
  }

  if (!apen) {
    return (
      <Knapp ghost icon="flag" onClick={() => setApen(true)}>
        Rapporter
      </Knapp>
    );
  }

  return (
    <Kort style={{ maxWidth: 360 }}>
      <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
        Rapporter denne profilen
      </div>
      <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.45 }}>
        Fortell kort hva som er galt. En coach vurderer rapporten. Vi deler ikke hvem som har rapportert.
      </p>
      <textarea
        value={begrunnelse}
        onChange={(e) => setBegrunnelse(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Hva vil du melde fra om?"
        style={{
          marginTop: 10,
          width: "100%",
          resize: "none",
          borderRadius: 11,
          border: `1px solid ${T.borderS}`,
          background: T.panel2,
          padding: "10px 12px",
          fontFamily: T.ui,
          fontSize: 13,
          color: T.fg,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {feil ? (
        <p style={{ margin: "8px 0 0", fontFamily: T.mono, fontSize: 11, color: T.down }}>{feil}</p>
      ) : null}
      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Knapp icon="flag" onClick={send} disabled={pending || begrunnelse.trim().length === 0}>
          {pending ? "Sender…" : "Send rapport"}
        </Knapp>
        <Knapp
          ghost
          disabled={pending}
          onClick={() => {
            setApen(false);
            setBegrunnelse("");
            setFeil(null);
          }}
        >
          Avbryt
        </Knapp>
      </div>
    </Kort>
  );
}
