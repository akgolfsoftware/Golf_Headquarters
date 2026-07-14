"use client";

/**
 * AgencyOS v2 — Godkjenning-detalj (`/admin/godkjenninger/[id]`, AgencyOS
 * Bølge 3.6, 2026-07-14). Port fra `(legacy)/godkjenninger/[id]/page.tsx` +
 * `(legacy)/approvals/[id]/approval-detail-client.tsx` — samme
 * `approveRequestDetailed`/`declineRequestDetailed`/`requestMoreInfo`-kontrakt
 * (`(legacy)/approvals/actions.ts`, uendret, kun konsumert her). Avslå/
 * info-dialogen er nå `BunnArk` i stedet for en rå `role="dialog"`-overlay.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { Kort, Knapp, StatusPill, BunnArk, Icon, T, type StatusTone } from "@/components/v2";
import { TekstOmraade } from "@/components/v2/skjema";
import { approveRequestDetailed, declineRequestDetailed, requestMoreInfo } from "@/app/admin/(legacy)/approvals/actions";

export interface AdminGodkjenningDetaljV2Data {
  id: string;
  status: string;
  agentName: string;
  opprettetTekst: string;
  spillerId: string;
  spillerNavn: string;
  spillerInitialer: string;
  tittelLead: string;
  tittelTrail?: string;
  rationale: string;
  signalTekst: string | null;
  beforeSummary: string | null;
  diffPreview: string | null;
}

const STATUS_LABEL: Record<string, string> = { PENDING: "Venter", ACCEPTED: "Godkjent", REJECTED: "Avslått" };
const STATUS_TONE: Record<string, StatusTone> = { PENDING: "info", ACCEPTED: "up", REJECTED: "down" };

type DialogMode = "none" | "decline" | "info";

export function AdminGodkjenningNotFoundV2() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 560 }}>
      <Link href="/admin/godkjenninger" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Icon name="arrow-left" size={13} /> Godkjenning
      </Link>
      <Kort>
        <div style={{ padding: "48px 10px", textAlign: "center" }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>Fant ikke godkjenningen</div>
          <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Denne handlingen finnes ikke, eller er allerede behandlet.</p>
        </div>
      </Kort>
    </div>
  );
}

export function AdminGodkjenningDetaljV2(detail: AdminGodkjenningDetaljV2Data) {
  const [mode, setMode] = useState<DialogMode>("none");
  const [kommentar, setKommentar] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const erPending = detail.status === "PENDING";

  const lukk = () => { setMode("none"); setKommentar(""); setFeil(null); };

  const godkjenn = () => {
    setFeil(null);
    startTransition(async () => {
      try { await approveRequestDetailed(detail.id, undefined); }
      catch (e) { setFeil(e instanceof Error ? e.message : "Noe gikk galt"); }
    });
  };

  const sendDialog = () => {
    setFeil(null);
    startTransition(async () => {
      try {
        if (mode === "decline") {
          if (kommentar.trim().length < 3) { setFeil("Skriv en kort begrunnelse (minst 3 tegn)."); return; }
          await declineRequestDetailed(detail.id, kommentar.trim());
        } else if (mode === "info") {
          if (kommentar.trim().length < 3) { setFeil("Formulér spørsmålet du vil sende spilleren."); return; }
          await requestMoreInfo(detail.id, kommentar.trim());
        }
        lukk();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Noe gikk galt");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 680 }}>
      <Link href="/admin/godkjenninger" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Icon name="arrow-left" size={13} /> Godkjenning · {detail.opprettetTekst} · {detail.agentName}
      </Link>

      {(detail.signalTekst || detail.diffPreview || detail.beforeSummary) && (
        <Kort eyebrow="Analyse">
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, margin: 0 }}>{detail.rationale}</p>
          {detail.signalTekst && <p style={{ marginTop: 8, fontFamily: T.mono, fontSize: 11, color: T.mut }}>Signal: {detail.signalTekst}</p>}
          {detail.beforeSummary && <p style={{ marginTop: 4, fontFamily: T.mono, fontSize: 11, color: T.mut }}>Før: {detail.beforeSummary}</p>}
          {detail.diffPreview && <p style={{ marginTop: 8, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, padding: "8px 12px", fontFamily: T.mono, fontSize: 11, color: T.fg }}>{detail.diffPreview}</p>}
        </Kort>
      )}

      <Kort>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
          <span style={{ width: 56, height: 56, borderRadius: 9999, background: T.lime, color: T.onLime, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 16, fontWeight: 700, flex: "none" }}>{detail.spillerInitialer}</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <StatusPill tone="lime">AI-foreslått</StatusPill>
            <div style={{ marginTop: 8, fontFamily: T.disp, fontWeight: 700, fontSize: 21, color: T.fg }}>{detail.tittelLead}{detail.tittelTrail}</div>
            <div style={{ marginTop: 2, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>{detail.spillerNavn}</div>
          </div>
          <StatusPill tone={STATUS_TONE[detail.status] ?? "info"}>{STATUS_LABEL[detail.status] ?? detail.status}</StatusPill>
        </div>
      </Kort>

      {erPending ? (
        <Kort>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <Knapp icon="check" onClick={godkjenn} disabled={pending}>Godkjenn</Knapp>
            <Knapp ghost icon="x" onClick={() => setMode("decline")} disabled={pending}>Avslå med begrunnelse</Knapp>
            <Knapp ghost icon="pencil" onClick={() => setMode("info")} disabled={pending}>Be om mer info</Knapp>
            <Link href={`/admin/spillere/${detail.spillerId}?compose=1`} style={{ marginLeft: "auto", textDecoration: "none" }}>
              <Knapp ghost icon="message-circle">Send melding</Knapp>
            </Link>
          </div>
        </Kort>
      ) : (
        <Kort>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Denne handlingen er allerede behandlet — {STATUS_LABEL[detail.status] ?? detail.status}.</span>
            <Link href={`/admin/spillere/${detail.spillerId}?compose=1`} style={{ marginLeft: "auto", textDecoration: "none" }}>
              <Knapp ghost icon="message-circle">Send melding</Knapp>
            </Link>
          </div>
        </Kort>
      )}

      {(mode === "decline" || mode === "info") && (
        <BunnArk tittel={mode === "decline" ? "Avslå med begrunnelse" : "Be om mer info"} onLukk={lukk} laast={pending}>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
            {mode === "decline" ? "Forklar kort hvorfor du avslår — dette logges på saken og deles med spilleren." : "Spørsmålet sendes som notifikasjon til spilleren. Status forblir «venter»."}
          </p>
          <div style={{ marginTop: 12 }}>
            <TekstOmraade
              label={null}
              value={kommentar}
              onChange={setKommentar}
              rows={4}
              placeholder={mode === "decline" ? "F.eks: for tett innpå turnering, vi tar dette neste uke." : "F.eks: hvordan kjentes forrige putt-drill — for lett eller for tøff?"}
            />
          </div>
          {feil && <div role="alert" style={{ marginTop: 8, fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
            <Knapp ghost onClick={lukk} disabled={pending}>Avbryt</Knapp>
            <Knapp icon="send" onClick={sendDialog} disabled={pending}>{mode === "decline" ? "Send avslag" : "Send spørsmål"}</Knapp>
          </div>
        </BunnArk>
      )}
    </div>
  );
}
