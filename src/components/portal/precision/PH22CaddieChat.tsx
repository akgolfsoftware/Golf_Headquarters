"use client";

/**
 * PH22CaddieChat — Precision Athletics implementasjon av PH-22 Caddie-chat.
 * Kilde: Claude Design ui_kits/playerhq/screens/PH-22.jsx
 *
 * Ansvar:
 * - Autentisk visning etter Precision Athletics med ren CSS og tokens
 * - Støtter data-, tom-, laste-, feil- og ikke-tilgangstilstander
 * - Streaming chat mot /api/coach/ai-chat med feilhåndtering og rate-limit
 * - Utkast (Draft) for treningsforslag med "Godta og send til coach"
 * - Eksport til Markdown og hurtigforslag (chips)
 */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Database,
  ArrowUp,
  MessageSquare,
  RotateCcw,
  Download,
  AlertCircle,
  Lock,
  ArrowUpRight,
  Send,
} from "lucide-react";
import type { Tier } from "@/generated/prisma/client";
import {
  PH22_HURTIGSPORSMAL,
  genererCaddieEksportMarkdown,
  formaterKlokkeslett,
  harCaddieTilgang,
  type PH22CaddieMelding,
  type PH22CaddieDraft,
} from "@/lib/portal-caddie/ph22-caddie-data";
import { StatusPille } from "@/components/precision/pa";

export interface PH22CaddieChatProps {
  tier: Tier;
  fornavn: string;
  initialer: string;
  sessionId: string | null;
  initialMessages: PH22CaddieMelding[];
  coachNavn?: string;
  userRole?: string;
  stateOverride?: "data" | "tom" | "laster" | "feil";
}

export function PH22CaddieChat({
  tier,
  fornavn,
  initialer: _initialer,
  sessionId: initialSessionId,
  initialMessages,
  coachNavn = "Anders",
  userRole = "PLAYER",
  stateOverride,
}: PH22CaddieChatProps) {
  const harTilgang = harCaddieTilgang(tier, userRole);

  const [meldinger, setMeldinger] = useState<PH22CaddieMelding[]>(
    stateOverride === "tom" ? [] : initialMessages,
  );
  const [inputTekst, setInputTekst] = useState("");
  const [sender, setSender] = useState(false);
  const [feil, setFeil] = useState<string | null>(
    stateOverride === "feil" ? "Caddie svarer ikke. Ingen forslag er sendt og ingenting er endret." : null,
  );
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [toastMelding, setToastMelding] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const genRef = useRef(0);
  const idCounterRef = useRef(0);
  const streamAccRef = useRef("");

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [meldinger, sender]);

  // Toast auto-hide
  useEffect(() => {
    if (!toastMelding) return;
    const t = setTimeout(() => setToastMelding(null), 4000);
    return () => clearTimeout(t);
  }, [toastMelding]);

  // Hvis tilgang mangler og ikke coach/admin
  if (!harTilgang) {
    return <PH22ProGate />;
  }

  // Hvis overstyrt til laster
  if (stateOverride === "laster") {
    return (
      <div className="pa-side" style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
        <PH22Header coachNavn={coachNavn} onReset={() => {}} onExport={() => {}} kanEksportere={false} />
        <div className="pa-card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ display: "inline-flex", gap: 10, alignItems: "center", color: "var(--text-muted)" }}>
            <Sparkles className="animate-spin" size={18} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Caddie leser dataene dine …</span>
          </div>
        </div>
      </div>
    );
  }

  async function sendMelding(valgtTekst?: string) {
    const tekst = (valgtTekst || inputTekst).trim();
    if (!tekst || sender) return;

    const klokke = formaterKlokkeslett();
    const gen = genRef.current;
    idCounterRef.current += 1;
    const uId = `u-${idCounterRef.current}`;
    idCounterRef.current += 1;
    const cId = `c-${idCounterRef.current}`;

    const brukerMelding: PH22CaddieMelding = {
      id: uId,
      role: "user",
      content: tekst,
      timestamp: klokke,
    };

    const assisterendePlaceholder: PH22CaddieMelding = {
      id: cId,
      role: "assistant",
      content: "",
      timestamp: klokke,
      source: "PLAN OG ØKTER",
    };

    setMeldinger((m) => [...m, brukerMelding, assisterendePlaceholder]);
    setInputTekst("");
    setSender(true);
    setFeil(null);

    try {
      const payloadMessages = [...meldinger, brukerMelding].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/coach/ai-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, messages: payloadMessages }),
      });

      if (!res.ok) {
        const feilMelding = await res.text();
        throw new Error(feilMelding || `HTTP ${res.status}`);
      }

      const nySessionId = res.headers.get("x-session-id");
      if (gen === genRef.current && nySessionId && nySessionId !== sessionId) {
        setSessionId(nySessionId);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Ingen respons-stream mottatt fra Caddie");
      }

      const decoder = new TextDecoder();
      streamAccRef.current = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (gen !== genRef.current) {
          await reader.cancel();
          break;
        }

        streamAccRef.current += decoder.decode(value, { stream: true });
        const gjeldendeTekst = streamAccRef.current;

        setMeldinger((tidligere) => {
          const nyListe = [...tidligere];
          const siste = nyListe[nyListe.length - 1];
          if (siste && siste.role === "assistant") {
            nyListe[nyListe.length - 1] = {
              ...siste,
              content: gjeldendeTekst,
            };
          }
          return nyListe;
        });
      }
    } catch (err) {
      if (gen === genRef.current) {
        // Fjern den tomme placeholder-meldingen ved feil
        setMeldinger((m) => m.filter((msg) => msg.id !== assisterendePlaceholder.id));
        setFeil(
          err instanceof Error
            ? `Caddie svarer ikke: ${err.message}`
            : "Kunne ikke nå Caddie. Kontroller nettverk eller prøv igjen om et øyeblikk.",
        );
      }
    } finally {
      setSender(false);
    }
  }

  function nullstillSamtale() {
    genRef.current += 1;
    setMeldinger([]);
    setSessionId(null);
    setInputTekst("");
    setFeil(null);
  }

  function eksporterSamtale() {
    const md = genererCaddieEksportMarkdown(meldinger, fornavn);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `caddie-samtale-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function oppdaterDraftStatus(meldingId: string, status: "godtatt" | "forkastet") {
    setMeldinger((m) =>
      m.map((msg) => {
        if (msg.id === meldingId && msg.draft) {
          return {
            ...msg,
            draft: { ...msg.draft, status },
          };
        }
        return msg;
      }),
    );
    if (status === "godtatt") {
      setToastMelding(`Utkastet er sendt til ${coachNavn}. Trener godkjenner før det legges inn i planen.`);
    }
  }

  const erTom = meldinger.length === 0;

  return (
    <div className="pa-side" style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
      {/* Toast bekreftelse */}
      {toastMelding && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--primary)",
            color: "var(--text-on-primary)",
            padding: "10px 16px",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-pop)",
            zIndex: 100,
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Sparkles size={14} style={{ color: "var(--signal)" }} />
          <span>{toastMelding}</span>
        </div>
      )}

      {/* Header etter PH-22 Claude Design */}
      <PH22Header
        coachNavn={coachNavn}
        onReset={nullstillSamtale}
        onExport={eksporterSamtale}
        kanEksportere={!erTom}
      />

      {/* Chat-ramme */}
      <div
        className="pa-card"
        style={{
          padding: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 520,
          background: "var(--surface-flat)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "var(--radius)",
        }}
      >
        {/* Meldingsområde */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minHeight: 340,
          }}
          aria-live="polite"
        >
          {erTom ? (
            <div
              style={{
                margin: "auto 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "32px 16px",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius)",
                  background: "var(--surface-sunken)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--text-primary)",
                }}
              >
                <Sparkles size={22} />
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Spør Caddie om treningen din
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--text-muted)",
                  maxWidth: 440,
                  lineHeight: 1.45,
                }}
              >
                Caddie kjenner planen, øktene, rundene og TrackMan-tallene dine.
                Caddie sender og endrer ingenting selv.
              </p>
            </div>
          ) : (
            meldinger.map((m) =>
              m.role === "user" ? (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "min(520px, 88%)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius)",
                      background: "var(--primary)",
                      color: "var(--text-on-primary)",
                      fontSize: 14,
                      lineHeight: 1.45,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {m.content}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.04em",
                      color: "var(--text-muted)",
                    }}
                  >
                    DU · {m.timestamp}
                  </span>
                </div>
              ) : (
                <div
                  key={m.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px minmax(0, 1fr)",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--radius)",
                      background: "var(--surface-sunken)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--text-primary)",
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={16} />
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                    {m.content ? (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          lineHeight: 1.45,
                          color: "var(--text-primary)",
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {m.content}
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          color: "var(--text-muted)",
                        }}
                      >
                        <Sparkles size={14} className="animate-spin" />
                        <span>Caddie tenker …</span>
                      </div>
                    )}

                    {m.source && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          letterSpacing: "0.04em",
                          color: "var(--text-muted)",
                        }}
                      >
                        <Database size={12} />
                        KILDE · {m.source}
                      </span>
                    )}

                    {m.draft && (
                      <PH22DraftBox
                        draft={m.draft}
                        coachNavn={coachNavn}
                        onAccept={() => oppdaterDraftStatus(m.id, "godtatt")}
                        onDrop={() => oppdaterDraftStatus(m.id, "forkastet")}
                      />
                    )}

                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        letterSpacing: "0.04em",
                        color: "var(--text-muted)",
                      }}
                    >
                      CADDIE · {m.timestamp}
                    </span>
                  </div>
                </div>
              ),
            )
          )}

          {sender && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "var(--text-muted)",
                paddingLeft: 42,
              }}
            >
              CADDIE LESER PLAN OG ØKTER …
            </div>
          )}

          {feil && (
            <div
              style={{
                padding: 12,
                borderRadius: "var(--radius)",
                background: "var(--surface-sunken)",
                border: "1px solid var(--signal)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <AlertCircle size={16} style={{ color: "var(--signal)", flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                  Caddie svarer ikke
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                  {feil}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFeil(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                Lukk
              </button>
            </div>
          )}
        </div>

        {/* Input og chips i bunn */}
        <div
          style={{
            padding: 12,
            borderTop: "1px solid var(--border-hairline)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "var(--surface-sunken)",
          }}
        >
          {/* Hurtig-chips */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 2,
              scrollbarWidth: "none",
            }}
          >
            {PH22_HURTIGSPORSMAL.map((spm) => (
              <button
                key={spm}
                type="button"
                onClick={() => sendMelding(spm)}
                disabled={sender}
                className="pa-filter__opt"
                style={{
                  height: 36,
                  padding: "0 12px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-flat)",
                  color: "var(--text-primary)",
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: sender ? "not-allowed" : "pointer",
                  flexShrink: 0,
                }}
              >
                {spm}
              </button>
            ))}
          </div>

          {/* Tekstfelt med send-knapp */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              aria-label="Spørsmål til Caddie"
              value={inputTekst}
              onChange={(e) => setInputTekst(e.target.value)}
              placeholder="Spør Caddie"
              disabled={sender}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMelding();
                }
              }}
              style={{
                flex: 1,
                minWidth: 0,
                height: 44,
                padding: "0 14px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-hairline)",
                background: "var(--surface-flat)",
                color: "var(--text-primary)",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                outline: "none",
              }}
            />
            <button
              type="button"
              aria-label="Send til Caddie"
              disabled={!inputTekst.trim() || sender}
              onClick={() => sendMelding()}
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius)",
                border: "none",
                background:
                  !inputTekst.trim() || sender
                    ? "var(--surface-sunken)"
                    : "var(--primary)",
                color:
                  !inputTekst.trim() || sender
                    ? "var(--text-muted)"
                    : "var(--text-on-primary)",
                display: "grid",
                placeItems: "center",
                cursor: !inputTekst.trim() || sender ? "not-allowed" : "pointer",
                transition: "background 0.15s ease",
                flexShrink: 0,
              }}
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Header for PH-22 Caddie-siden etter Claude Design.
 */
function PH22Header({
  coachNavn,
  onReset,
  onExport,
  kanEksportere,
}: {
  coachNavn: string;
  onReset: () => void;
  onExport: () => void;
  kanEksportere: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              display: "block",
              marginBottom: 4,
            }}
          >
            Meg · Caddie
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Caddie
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.45,
              maxWidth: 580,
            }}
          >
            Caddie svarer ut fra dine data og viser kilden. Alt Caddie foreslår er
            utkast. Du eller {coachNavn} godtar før noe endres.
          </p>
        </div>

        {/* Handlinger */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Link
            href="/portal/coach"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              padding: "0 12px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-hairline)",
              background: "var(--surface-flat)",
              color: "var(--text-primary)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <MessageSquare size={14} />
            <span>Skriv til {coachNavn}</span>
          </Link>

          <button
            type="button"
            onClick={onExport}
            disabled={!kanEksportere}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              padding: "0 12px",
              borderRadius: "var(--radius)",
              border: "1px solid transparent",
              background: "transparent",
              color: kanEksportere
                ? "var(--text-primary)"
                : "var(--text-muted)",
              fontSize: 13,
              fontWeight: 500,
              cursor: kanEksportere ? "pointer" : "not-allowed",
            }}
          >
            <Download size={14} />
            <span>Eksporter</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              padding: "0 12px",
              borderRadius: "var(--radius)",
              border: "1px solid transparent",
              background: "transparent",
              color: "var(--text-primary)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
            <span>Ny samtale</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Utkast (Draft) for forslag fra Caddie.
 */
function PH22DraftBox({
  draft,
  coachNavn,
  onAccept,
  onDrop,
}: {
  draft: PH22CaddieDraft;
  coachNavn: string;
  onAccept: () => void;
  onDrop: () => void;
}) {
  const erAvgjort = draft.status !== "utkast";

  return (
    <div
      style={{
        border: "1px dashed var(--border-strong)",
        borderRadius: "var(--radius)",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: "var(--surface-sunken)",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <StatusPille
          tone={
            draft.status === "godtatt"
              ? "ok"
              : draft.status === "forkastet"
              ? "neutral"
              : "neutral"
          }
        >
          {draft.status === "godtatt"
            ? `Sendt til ${coachNavn}`
            : draft.status === "forkastet"
            ? "Forkastet"
            : "Utkast"}
        </StatusPille>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {draft.kind.toUpperCase()}
        </span>
      </div>

      <div
        style={{
          fontWeight: 600,
          fontSize: 14,
          lineHeight: 1.35,
          color: "var(--text-primary)",
        }}
      >
        {draft.title}
      </div>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        {draft.meta}
      </div>

      {!erAvgjort && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <button
              type="button"
              onClick={onAccept}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 32,
                padding: "0 10px",
                borderRadius: "var(--radius)",
                border: "none",
                background: "var(--primary)",
                color: "var(--text-on-primary)",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Send size={12} />
              <span>Godta og send til {coachNavn}</span>
            </button>
            <button
              type="button"
              onClick={onDrop}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 32,
                padding: "0 10px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-hairline)",
                background: "transparent",
                color: "var(--text-primary)",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <span>Forkast</span>
            </button>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.04em",
              color: "var(--text-muted)",
            }}
          >
            CADDIE ENDRER IKKE PLANEN. {coachNavn.toUpperCase()} GODKJENNER FØR DET BLIR LAGT INN.
          </span>
        </>
      )}
    </div>
  );
}

/**
 * Pro-gate for brukere uten Caddie-tilgang.
 */
function PH22ProGate() {
  return (
    <div className="pa-side" style={{ maxWidth: 640, margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: 16 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            display: "block",
            marginBottom: 4,
          }}
        >
          PlayerHQ · Caddie
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          Krever Pro-abonnement
        </h1>
      </div>

      <div
        className="pa-card"
        style={{
          padding: 24,
          background: "var(--surface-flat)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "var(--radius)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius)",
              background: "var(--surface-sunken)",
              display: "grid",
              placeItems: "center",
              color: "var(--text-primary)",
              flexShrink: 0,
            }}
          >
            <Lock size={18} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              Personlig AI-assistent for treningen din
            </div>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.45,
              }}
            >
              Caddie leser dine planer, økter og runder, og hjelper deg med å
              forberede spørsmål og forslag til coachen din.
            </p>
          </div>
        </div>

        <Link
          href="/portal/meg/abonnement"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 40,
            padding: "0 16px",
            borderRadius: "var(--radius)",
            background: "var(--primary)",
            color: "var(--text-on-primary)",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            alignSelf: "flex-start",
          }}
        >
          <span>Oppgrader til Pro</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
