"use client";

/**
 * AgencyOS · Godkjenning-detalj — v2 (retning C «Presis»). Listen
 * (`/admin/godkjenninger`, `AdminGodkjenningerV2`) ble portet til v2 i en
 * tidligere runde — denne detaljsiden ble stående igjen i hand-Tailwind.
 * Restylet til samme v2-mønster som listen (Kort/Knapp/StatusPill/
 * AvatarInit/InnsiktChip), samme server actions uendret.
 *
 * Byttet samtidig den lokale ACTION_LABEL-duplikaten ut med den delte
 * `handlingstypeLabel` (@/lib/labels/handlingstyper) — kanon-kilden resten
 * av appen (varsler/innboks/caddie/godkjenninger-lista) allerede leser fra,
 * per filens egen "aldri egne lokale maps"-regel.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Caps, Kort, Knapp, StatusPill, AvatarInit, InnsiktChip, TilbakeLenke, TomTilstand, Tittel } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { handlingstypeLabel } from "@/lib/labels/handlingstyper";
import { approveRequestDetailed, declineRequestDetailed, requestMoreInfo } from "@/app/admin/(legacy)/approvals/actions";
import type { ApprovalDetail } from "@/app/admin/(legacy)/godkjenninger/[id]/page";

type DialogMode = "none" | "decline" | "info";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Venter",
  ACCEPTED: "Godkjent",
  REJECTED: "Avslått",
};

export function ApprovalNotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <TilbakeLenke href="/admin/godkjenninger">Tilbake til godkjenninger</TilbakeLenke>
      <Kort>
        <TomTilstand
          icon="inbox"
          title="Fant ikke godkjenningen"
          sub="Denne handlingen finnes ikke, eller er allerede behandlet."
        />
      </Kort>
      <Link href="/admin/godkjenninger" style={{ textDecoration: "none", display: "block" }}>
        <Knapp icon="arrow-left" full>Tilbake til godkjenninger</Knapp>
      </Link>
    </div>
  );
}

function relativeTimeNb(d: Date): string {
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "Opprettet nå";
  if (min < 60) return `Opprettet ${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) return `Opprettet ${t} timer siden`;
  const dg = Math.floor(t / 24);
  return `Opprettet ${dg} dager siden`;
}

export function ApprovalDetailClient({ detail }: { detail: ApprovalDetail }) {
  const [mode, setMode] = useState<DialogMode>("none");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setComment("");
    setError(null);
    setMode("none");
  }

  function godkjenn() {
    setError(null);
    startTransition(async () => {
      try {
        await approveRequestDetailed(detail.id, undefined);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Noe gikk galt");
      }
    });
  }

  function submitDialog() {
    setError(null);
    startTransition(async () => {
      try {
        if (comment.trim().length < 3) {
          setError(mode === "decline" ? "Skriv en kort begrunnelse (minst 3 tegn)." : "Formulér spørsmålet du vil sende spilleren.");
          return;
        }
        if (mode === "decline") await declineRequestDetailed(detail.id, comment.trim());
        else if (mode === "info") await requestMoreInfo(detail.id, comment.trim());
        reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Noe gikk galt");
      }
    });
  }

  const isPending = detail.status === "PENDING";
  const eyebrow = ["Godkjenning", relativeTimeNb(detail.createdAt), detail.agentName].join(" · ");
  const statusTone = detail.status === "PENDING" ? "info" as const : detail.status === "ACCEPTED" ? "lime" as const : "down" as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, paddingBottom: 96 }}>
      <TilbakeLenke href="/admin/godkjenninger">{eyebrow}</TilbakeLenke>

      {/* B: status først */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Caps>AI-forslag · {detail.player.name}</Caps>
          <div style={{ marginTop: 8 }}>
            <Tittel>
              {handlingstypeLabel(detail.actionType)}
              {detail.title.trail}
            </Tittel>
          </div>
        </div>
        <StatusPill tone={statusTone}>{STATUS_LABEL[detail.status] ?? detail.status}</StatusPill>
      </div>

      {(detail.signalSnapshot || detail.diffPreview || detail.beforeSummary) && (
        <Kort eyebrow="Analyse">
          <p style={{ margin: 0, fontFamily: T.ui, fontSize: 13, color: T.fg }}>{detail.rationale}</p>
          {detail.signalSnapshot && (
            <p style={{ margin: "8px 0 0", fontFamily: T.mono, fontSize: 11, color: T.mut }}>
              Signal: {detail.signalSnapshot.kind}
              {detail.signalSnapshot.value != null ? ` = ${detail.signalSnapshot.value}` : ""}
            </p>
          )}
          {detail.beforeSummary && (
            <p style={{ margin: "6px 0 0", fontFamily: T.mono, fontSize: 11, color: T.mut }}>Før: {detail.beforeSummary}</p>
          )}
          {detail.diffPreview && (
            <p style={{ margin: "8px 0 0", padding: "8px 10px", borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 11, color: T.fg }}>
              {detail.diffPreview}
            </p>
          )}
        </Kort>
      )}

      <Kort>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
          <AvatarInit navn={detail.player.name} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, background: `color-mix(in srgb, ${T.lime} 16%, transparent)`, padding: "3px 10px", fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.lime }}>
              <Icon name="sparkles" size={11} />
              AI-foreslått
            </span>
            <p style={{ margin: "8px 0 0", fontFamily: T.ui, fontSize: 13, color: T.mut }}>{detail.player.name}</p>
          </div>
        </div>
      </Kort>

      {isPending ? (
        <div style={{ position: "sticky", bottom: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, borderRadius: T.rCard, background: T.panel, border: `1px solid ${T.borderS}`, padding: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.35)" }}>
          {/* B: én primær = Godkjenn; resten ghost */}
          <Knapp icon="check" disabled={pending} onClick={godkjenn}>Godkjenn</Knapp>
          <Knapp icon="x" ghost disabled={pending} onClick={() => { setMode("decline"); setComment(""); setError(null); }}>Avslå med begrunnelse</Knapp>
          <Knapp icon="message-circle" ghost disabled={pending} onClick={() => { setMode("info"); setComment(""); setError(null); }}>Be om mer info</Knapp>
          <Link href={`/admin/spillere/${detail.player.id}?compose=1`} style={{ marginLeft: "auto", textDecoration: "none" }}>
            <Knapp ghost icon="send">Send melding</Knapp>
          </Link>
        </div>
      ) : (
        <InnsiktChip cta="Send melding" href={`/admin/spillere/${detail.player.id}?compose=1`}>
          Denne handlingen er allerede behandlet — {STATUS_LABEL[detail.status] ?? detail.status}.
        </InnsiktChip>
      )}

      {(mode === "decline" || mode === "info") && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) reset(); }}
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.5)", padding: 16 }}
        >
          <div style={{ width: "100%", maxWidth: 420, borderRadius: T.rCard, background: T.panel, border: `1px solid ${T.borderS}`, padding: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Caps>{mode === "decline" ? "Avslå med begrunnelse" : "Be om mer info"}</Caps>
              <button onClick={reset} aria-label="Lukk" style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 8, background: "transparent", border: "none", color: T.mut, cursor: "pointer" }}>
                <Icon name="x" size={14} />
              </button>
            </div>
            <p style={{ margin: "10px 0 0", fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>
              {mode === "decline"
                ? "Forklar kort hvorfor du avslår — dette logges på saken og deles med spilleren."
                : "Spørsmålet sendes som notifikasjon til spilleren. Status forblir «venter»."}
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={mode === "decline" ? "F.eks: for tett innpå turnering, vi tar dette neste uke." : "F.eks: hvordan kjentes forrige putt-drill — for lett eller for tøff?"}
              style={{ marginTop: 10, width: "100%", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: 12, fontFamily: T.ui, fontSize: 13, color: T.fg, outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
            {error && <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 11, color: T.down }}>{error}</p>}
            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Knapp ghost disabled={pending} onClick={reset}>Avbryt</Knapp>
              <Knapp icon="send" disabled={pending} onClick={submitDialog}>{mode === "decline" ? "Send avslag" : "Send spørsmål"}</Knapp>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
