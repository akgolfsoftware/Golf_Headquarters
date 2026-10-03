"use client";

/**
 * AG-19 fane «Samtale» — Administrator-Caddie for coach.
 * Tegning: 7d7c2994 · ui_kits/agencyos/screens/AG-19.jsx (fanen «Samtale»).
 *
 * Kobling (ingen skjemaendring): siden henter en lagret samtale
 * (`getOrCreateActiveConversation`) og gir id-en hit. Chat-hooken sender
 * `conversationId` til `/api/caddie/chat`, og da lagrer ruta hvert forslag fra
 * Caddie som `CaddieDraft` (PENDING). Forslaget ligger dermed som utkast også
 * i godkjenn-køen (/admin/godkjenninger). «Godkjenn» her går via
 * `/api/caddie/approve`, som re-validerer og utfører én gang. Caddie sender og
 * endrer ingenting før du har trykket Godkjenn.
 */
import { useState } from "react";
import Link from "next/link";
import { Check, Send, X } from "lucide-react";
import { Knapp, StatusPille, Meta } from "@/components/precision/pa";
import { Skjemafelt, TekstOmrade, Stabel } from "@/components/precision/pa-a4";
import { InlineVarsel, KortHode } from "@/components/precision/pa-a5";
import { useCaddieChat, type ToolApprovalState } from "@/components/admin/caddie/use-caddie-chat";
import type { CaddieToolCall } from "@/components/admin/caddie/types";
import type { JarvisSamtaleMelding } from "@/lib/admin/jarvis/last-jarvis";

export type AG19SamtaleProps = {
  conversationId: string;
  historikk: readonly JarvisSamtaleMelding[];
  utkastVenter: number;
};

function Boble({ fraCoach, etikett, children }: { fraCoach: boolean; etikett: string; children: React.ReactNode }) {
  return <div style={{
    alignSelf: fraCoach ? "flex-end" : "flex-start", maxWidth: "min(92%, 600px)", minWidth: 0, padding: "10px 12px", borderRadius: 8,
    background: fraCoach ? "var(--surface-sunken)" : "var(--surface-card)", border: "1px solid var(--border-hairline)",
    display: "flex", flexDirection: "column", gap: 6,
  }}>
    <Meta>{etikett}</Meta>
    {children}
  </div>;
}

const tekstStil = { font: "var(--type-body)", textWrap: "pretty", overflowWrap: "anywhere", whiteSpace: "pre-wrap", margin: 0, minWidth: 0 } as const;

function Forslag({ tc, tilstand, onSvar }: { tc: CaddieToolCall; tilstand: ToolApprovalState | undefined; onSvar: (godkjent: boolean) => void }) {
  const forhandsvisning = tc.approvalPreview;
  const status = tilstand?.status ?? "pending";
  return <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 10, borderRadius: 6, border: "1px solid var(--border-hairline)", background: "var(--surface-flat)", minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <StatusPille tone={status === "done" ? "ok" : status === "failed" ? "warn" : "neutral"}>
        {status === "pending" ? "Forslag" : status === "executing" ? "Utfører" : status === "done" ? "Utført" : status === "rejected" ? "Avvist" : "Feilet"}
      </StatusPille>
      {forhandsvisning?.recipient && <Meta>TIL {forhandsvisning.recipient.toUpperCase()}</Meta>}
    </div>
    <span style={{ font: "600 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{forhandsvisning?.title ?? "Forslag fra Caddie"}</span>
    {forhandsvisning?.body && <p style={{ ...tekstStil, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{forhandsvisning.body}</p>}
    {tilstand?.summary && <Meta>{tilstand.summary.toUpperCase()}</Meta>}
    {tilstand?.error && <Meta>{tilstand.error.toUpperCase()}</Meta>}
    {(status === "pending" || status === "executing") && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Knapp size="sm" icon={Check} iconName="check" loading={status === "executing"} loadingText="Utfører …" onClick={() => onSvar(true)}>Godkjenn</Knapp>
      <Knapp size="sm" variant="secondary" icon={X} iconName="x" disabled={status === "executing"} onClick={() => onSvar(false)}>Avvis</Knapp>
    </div>}
    {status === "pending" && <Meta>LAGRET SOM UTKAST I GODKJENNINGER. INGENTING ER SENDT ELLER ENDRET.</Meta>}
  </div>;
}

export function AG19Samtale({ conversationId, historikk, utkastVenter }: AG19SamtaleProps) {
  const { messages, status, sendMessage, updateToolApproval, approvals } = useCaddieChat({ conversationId });
  const [sporsmal, setSporsmal] = useState("");
  const live = messages.filter((m) => m.id !== "intro");
  const opptatt = status === "streaming" || status === "submitted";
  const send = () => {
    if (!sporsmal.trim() || opptatt) return;
    void sendMessage(sporsmal);
    setSporsmal("");
  };

  return <div className="pa-card" style={{ padding: 16, gap: 12, maxWidth: 820, minWidth: 0 }}>
    <KortHode tittel="Caddie · samtale" aside="SVARER MED KILDE OG DATO" />
    {utkastVenter > 0 && <InlineVarsel tone="info" tittel={`${utkastVenter} utkast venter på deg.`}>
      <Link href="/admin/godkjenninger" style={{ textDecoration: "underline", color: "inherit" }}>Åpne godkjenninger</Link>
    </InlineVarsel>}
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }} aria-live="polite">
      {historikk.length === 0 && live.length === 0 && <p style={{ ...tekstStil, color: "var(--text-secondary)", font: "var(--type-body-s)" }}>
        Spør om kalender, spillerlogger, fakturaer eller utkast. Caddie svarer kort og foreslår handlinger du kan godkjenne.
      </p>}
      {historikk.map((m) => <Boble key={m.id} fraCoach={m.rolle === "coach"} etikett={`${m.rolle === "coach" ? "DU" : "CADDIE"} · ${m.tid}`}>
        <p style={tekstStil}>{m.tekst}</p>
      </Boble>)}
      {live.filter((m) => !(m.role === "user" && m.parts.some((p) => p.type === "text" && p.text.startsWith("[System]")))).map((m) => {
        const fraCoach = m.role === "user";
        return <Boble key={m.id} fraCoach={fraCoach} etikett={fraCoach ? "DU" : "CADDIE"}>
          {m.parts.map((p, i) => {
            if (p.type === "text") return p.text ? <p key={i} style={tekstStil}>{p.text}</p> : null;
            if (!p.toolCall.needsApproval) return null;
            const tc = p.toolCall;
            return <Forslag key={tc.id} tc={tc} tilstand={approvals[tc.id]}
              onSvar={(godkjent) => { void updateToolApproval(tc.id, godkjent, { toolName: tc.toolName, toolInput: tc.input }); }} />;
          })}
        </Boble>;
      })}
    </div>
    {status === "error" && <InlineVarsel tone="warn" tittel="Caddie kunne ikke svare.">Ingenting er sendt eller endret. Prøv igjen om litt.</InlineVarsel>}
    <Stabel gap={8}>
      <Skjemafelt label="Spør Caddie">
        <TekstOmrade value={sporsmal} onChange={setSporsmal} placeholder="Spør Caddie om stallen, planer eller tall" />
      </Skjemafelt>
      <div><Knapp icon={Send} iconName="send" disabled={!sporsmal.trim()} loading={opptatt} loadingText="Caddie svarer …" onClick={send}>Spør Caddie</Knapp></div>
    </Stabel>
  </div>;
}
