"use client";

import { Knapp } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { useState, useTransition } from "react";
import { exportUserData } from "@/app/portal/meg/innstillinger/actions";
import { opprettGdprForesporsel } from "@/lib/moderering/actions";

type Props = {
  kind: "export" | "delete";
};

export function PersonvernActions({ kind }: Props) {
  if (kind === "export") return <ExportAction />;
  return <SlettKontoAction />;
}

type Status = { ok: boolean; msg: string };

function ExportAction() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status | null>(null);

  function onExport() {
    startTransition(async () => {
      setStatus(null);
      const result = await exportUserData();
      if (!result.ok || !result.data) {
        setStatus({ ok: false, msg: result.error ?? "Eksport feilet." });
        return;
      }
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `akgolf-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({ ok: true, msg: "Eksport lastet ned" });
    });
  }

  return (
    <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
      <Knapp icon="download" onClick={onExport} disabled={isPending}>
        {isPending ? "Genererer…" : "Last ned mine data"}
      </Knapp>
      {status ? (
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 11,
            letterSpacing: "0.04em",
            color: status.ok ? T.up : T.down,
          }}
        >
          {status.msg}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Slett kontoen din: forespørsel til moderering-køen.
 * Ved godkjenning anonymiseres opplysninger — ingen hard-delete.
 */
function SlettKontoAction() {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [begrunnelse, setBegrunnelse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

  function onSend() {
    startTransition(async () => {
      setError(null);
      const result = await opprettGdprForesporsel(begrunnelse.trim() || undefined);
      if (!result.ok) {
        setError(result.error ?? "Kunne ikke sende forespørselen.");
        return;
      }
      setShowConfirm(false);
      setConfirmText("");
      setBegrunnelse("");
      setStatus({
        ok: true,
        msg: result.alleredeSendt
          ? "Du har allerede en åpen forespørsel."
          : "Forespørsel om sletting sendt",
      });
    });
  }

  if (!showConfirm) {
    return (
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <Knapp ghost icon="trash-2" onClick={() => setShowConfirm(true)}>
          Slett kontoen min
        </Knapp>
        {status ? (
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 11,
              letterSpacing: "0.04em",
              color: status.ok ? T.up : T.down,
            }}
          >
            {status.msg}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 14,
        borderRadius: T.rRow,
        border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`,
        background: `color-mix(in srgb, ${T.down} 6%, ${T.panel})`,
        padding: 14,
      }}
    >
      <p style={{ margin: 0, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.down }}>
        Er du helt sikker?
      </p>
      <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.5 }}>
        Forespørselen behandles av coach eller admin. Skriv <strong style={{ color: T.fg }}>SLETT</strong> for å bekrefte.
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="SLETT"
        autoComplete="off"
        autoCapitalize="characters"
        style={{
          marginTop: 10,
          width: "100%",
          maxWidth: 200,
          height: 42,
          borderRadius: 11,
          border: `1px solid ${T.borderS}`,
          background: T.panel2,
          padding: "0 12px",
          fontFamily: T.mono,
          fontSize: 13,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: T.fg,
          outline: "none",
        }}
      />
      <textarea
        value={begrunnelse}
        onChange={(e) => setBegrunnelse(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Begrunnelse (valgfritt)"
        style={{
          marginTop: 8,
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
      {error ? (
        <p style={{ margin: "8px 0 0", fontFamily: T.mono, fontSize: 11, color: T.down }}>{error}</p>
      ) : null}
      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button
          type="button"
          onClick={onSend}
          disabled={isPending || confirmText !== "SLETT"}
          className="v2-press v2-focus"
          style={{
            appearance: "none",
            height: 40,
            borderRadius: 9999,
            border: "none",
            padding: "0 18px",
            background: T.down,
            color: T.onLime,
            fontFamily: T.ui,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: isPending || confirmText !== "SLETT" ? "default" : "pointer",
            opacity: isPending || confirmText !== "SLETT" ? 0.45 : 1,
          }}
        >
          {isPending ? "Sender…" : "Send slette-forespørsel"}
        </button>
        <Knapp
          ghost
          disabled={isPending}
          onClick={() => {
            setShowConfirm(false);
            setConfirmText("");
            setBegrunnelse("");
            setError(null);
          }}
        >
          Avbryt
        </Knapp>
      </div>
    </div>
  );
}
