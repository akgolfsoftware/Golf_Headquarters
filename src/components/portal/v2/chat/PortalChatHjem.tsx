"use client";

/**
 * PortalChatHjem — PlayerHQ "I dag", chat-først (designport steg 7 PR1).
 * Erstatter HjemV2 som innhold på /portal. V2Shell (rail/bunn-nav) er uendret
 * rundt denne komponenten — se src/app/portal/page.tsx.
 *
 * Matcher Paper-fasiten (designsystem/paper/fase1/playerhq-chat-desktop.html)
 * strukturelt: tråd + composer + artefaktpanel + FØR/UNDER/ETTER-løkke. Bygget
 * med EKSISTERENDE v2-primitiver (SamtaleBoble/Skrivefelt/ForslagRad fra
 * components/v2/samtale.tsx, BunnArk) i stedet for å kopiere Paper sin egen
 * rå CSS — appen står fortsatt på v2-tokens (CLAUDE.md invariant 2).
 *
 * FØR/UNDER/ETTER er IKKE bygget om til moduser i denne skjermen ennå (se
 * plan-designport-alle-skjermer.md steg 7 PR1, punkt 9) — løkken lenker til
 * dagens faktiske live-økt-ruter når de finnes, i stedet for å late som en
 * modus-veksling som ikke er bygget.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { T } from "@/lib/v2/tokens";
import { SamtaleBoble, SamtaleSkriver, SamtaleFeil, Skrivefelt, ForslagRad } from "@/components/v2/samtale";
import { MicButton } from "@/components/shared/mic-button";
import type { DashboardData } from "@/app/portal/actions";
import type { GjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { usePortalChat } from "./use-portal-chat";
import { PortalStegListe } from "./PortalStegListe";
import { PortalHvorforDette } from "./PortalHvorforDette";
import { ArtefaktPanel } from "./ArtefaktPanel";
import type { PortalChatMessage } from "./types";

const FORSLAG = ["Hva skal jeg trene i dag?", "Hva var resultatet sist?", "Hva står på ukeplanen?"];

function meldingTekst(m: PortalChatMessage): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function LoopNav({ gjennomfore }: { gjennomfore: GjennomforeData }) {
  const under = gjennomfore.nesteOkt?.status === "now" ? gjennomfore.nesteOkt : null;
  const etter = gjennomfore.fullfortIdag.at(-1) ?? null;

  const stegStil = (aktiv: boolean, kan: boolean) => ({
    minHeight: 44,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    padding: "0 12px",
    borderRadius: 8,
    textDecoration: "none",
    color: aktiv ? T.fg : kan ? T.mut : T.border,
    fontFamily: T.mono,
    fontSize: 10,
    letterSpacing: "0.09em",
    textTransform: "uppercase" as const,
    background: aktiv ? T.panel2 : "transparent",
    pointerEvents: kan ? ("auto" as const) : ("none" as const),
  });

  return (
    <nav aria-label="Sløyfen før, under og etter økta" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
      <span style={stegStil(true, true)}>FØR</span>
      <span style={{ color: T.border, fontSize: 12 }} aria-hidden>→</span>
      {under ? (
        <Link href={under.href} style={stegStil(false, true)}>UNDER</Link>
      ) : (
        <span title="Ingen pågående økt akkurat nå" style={stegStil(false, false)}>UNDER</span>
      )}
      <span style={{ color: T.border, fontSize: 12 }} aria-hidden>→</span>
      {etter ? (
        <Link href={etter.href} style={stegStil(false, true)}>ETTER</Link>
      ) : (
        <span title="Ingen fullført økt å oppsummere i dag ennå" style={stegStil(false, false)}>ETTER</span>
      )}
    </nav>
  );
}

function DagensOktInnhold({ gjennomfore }: { gjennomfore: GjennomforeData }) {
  const okt = gjennomfore.nesteOkt ?? gjennomfore.fullfortIdag[0] ?? null;
  if (!okt) {
    return <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.mut }}>Ingen økt registrert i dag.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 600, color: T.fg }}>{okt.tittel}</div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 4 }}>{okt.meta}</div>
      </div>
      {okt.drillNavn.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {okt.drillNavn.map((navn, i) => (
            <li key={i} style={{ display: "flex", gap: 8, fontSize: 12.5, color: T.fg, padding: "6px 0", borderTop: i > 0 ? `1px solid ${T.border}` : undefined }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{i + 1}</span>
              {navn}
            </li>
          ))}
        </ul>
      )}
      <Link
        href={okt.href}
        className="v2-press v2-focus"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 44,
          borderRadius: 10,
          background: T.handling,
          color: T.onHandling,
          fontFamily: T.ui,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {okt.status === "now" ? "Fortsett økta" : okt.status === "done" ? "Se oppsummering" : "Start økta"}
      </Link>
    </div>
  );
}

export function PortalChatHjem({
  data,
  gjennomfore,
}: {
  data: DashboardData;
  gjennomfore: GjennomforeData;
}) {
  const { messages, status, error, sendMessage } = usePortalChat();
  const [input, setInput] = useState("");
  const [artefaktApen, setArtefaktApen] = useState(false);
  const trådRef = useRef<HTMLDivElement>(null);
  const busy = status === "streaming" || status === "submitted";

  useEffect(() => {
    trådRef.current?.scrollTo({ top: trådRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(tekst: string) {
    setInput("");
    await sendMessage(tekst);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* ── Topplinje ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 20px",
          borderBottom: `1px solid ${T.border}`,
          background: T.bg,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>I dag</h1>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.04em", color: T.mut, marginTop: 2 }}>
            {data.greeting} · uke {data.weekNumber}
          </div>
        </div>
        <LoopNav gjennomfore={gjennomfore} />
        <button
          type="button"
          onClick={() => setArtefaktApen(true)}
          className="v2-press v2-focus"
          style={{
            minHeight: 36,
            padding: "0 12px",
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.fg,
            fontFamily: T.ui,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Dagens økt
        </button>
      </header>

      {/* ── Tråd ── */}
      <div ref={trådRef} style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "20px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: T.panel2,
                  border: `1px solid ${T.border}`,
                  fontFamily: T.ui,
                  fontSize: 12.5,
                  color: T.mut,
                }}
              >
                <Sparkles size={14} style={{ color: T.lime }} />
                Spør meg om treningen din — jeg henter ekte tall fra planen og loggen din.
              </div>
              <ForslagRad items={FORSLAG} onPick={send} />
            </div>
          )}

          {messages.map((m) => {
            if (m.role !== "user" && m.role !== "assistant") return null;
            const tekst = meldingTekst(m);
            const toolCalls = m.parts.filter((p) => p.type === "tool-call").map((p) => p.toolCall);
            return (
              <SamtaleBoble key={m.id} rolle={m.role} initialer={data.user.name.slice(0, 2).toUpperCase()}>
                {m.role === "assistant" && toolCalls.length > 0 && <PortalStegListe steg={toolCalls} />}
                {tekst || (busy && m.role === "assistant" ? "…" : "")}
                {m.role === "assistant" &&
                  toolCalls
                    .filter((tc) => tc.state === "result")
                    .map((tc) => <PortalHvorforDette key={tc.id} toolCall={tc} />)}
              </SamtaleBoble>
            );
          })}

          {busy && messages.at(-1)?.role === "user" && <SamtaleSkriver />}
          {error && <SamtaleFeil>Kunne ikke svare akkurat nå. Prøv igjen om litt.</SamtaleFeil>}
        </div>
      </div>

      {/* ── Composer ── */}
      <div style={{ borderTop: `1px solid ${T.border}`, background: T.panel, padding: "12px 20px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Skrivefelt
              value={input}
              onChange={setInput}
              onSend={() => send(input)}
              sender={busy}
              placeholder="Spør om treningen din …"
            />
          </div>
          <MicButton variant="suffix" onResult={(tekst) => setInput((v) => (v ? `${v} ${tekst}` : tekst))} disabled={busy} />
        </div>
      </div>

      <ArtefaktPanel open={artefaktApen} onClose={() => setArtefaktApen(false)} tittel="Dagens økt">
        <DagensOktInnhold gjennomfore={gjennomfore} />
      </ArtefaktPanel>
    </div>
  );
}
