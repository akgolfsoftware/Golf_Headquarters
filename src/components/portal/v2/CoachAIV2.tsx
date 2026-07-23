"use client";

/**
 * PlayerHQ AI-coach — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Tier } from "@/generated/prisma/client";
import type { ChatMelding } from "@/lib/anthropic";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Knapp,
  TomTilstand,
  AiMerke,
  SamtaleBoble,
  SamtaleSkriver,
  SamtaleFeil,
  Skrivefelt,
  ForslagRad,
} from "@/components/v2";

/* ── Datakontrakt (1:1 med den ekte siden) ─────────────────────────── */

export type CoachAIData = {
  /** Effektiv tier — GRATIS ⇒ Pro-gate (AI-coach er Pro-funksjon). */
  tier: Tier;
  /** Spillerens fornavn (tittel + identitetsmerke). */
  fornavn: string;
  /** Initialer for brukerens meldingsbobler. */
  initialer: string;
  /** Aktiv/siste AI-sesjon (null ⇒ ny opprettes ved første melding). */
  sessionId: string | null;
  /** Historikk fra siste AI-sesjon (tom ⇒ tom-tilstand). */
  initialMessages: ChatMelding[];
};

const FORSLAG = [
  "Hva bør jeg trene på i dag?",
  "Analyser siste runde",
  "Lag en putt-plan for uken",
];

/** true på klient etter mount når viewport < 768px (styrer kun høyde/tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function CoachAIV2({ data }: { data: CoachAIData }) {
  const mobile = useMobile();
  const { tier, fornavn, initialer } = data;

  const [meldinger, setMeldinger] = useState<ChatMelding[]>(data.initialMessages);
  const [input, setInput] = useState("");
  const [sender, setSender] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(data.sessionId);
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Generasjons-teller: økes ved «Ny samtale» slik at en pågående stream fra
      en forkastet samtale aldri skriver sessionId/meldinger inn i den nye. */
  const genRef = useRef(0);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [meldinger]);

  // Pro-gate — AI-coach krever Pro (samme regel som den ekte siden).
  if (tier === "GRATIS") return <ProGate mobile={mobile} />;

  async function send() {
    const tekst = input.trim();
    if (!tekst || sender) return;

    const gen = genRef.current;
    const userMsg: ChatMelding = { role: "user", content: tekst };
    const nyHistorikk = [...meldinger, userMsg];
    setMeldinger([...nyHistorikk, { role: "assistant", content: "" }]);
    setInput("");
    setSender(true);
    setFeil(null);

    try {
      const res = await fetch("/api/coach/ai-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, messages: nyHistorikk }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }

      const nySessionId = res.headers.get("x-session-id");
      if (gen === genRef.current && nySessionId && nySessionId !== sessionId) setSessionId(nySessionId);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Ingen respons-stream");
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (gen !== genRef.current) {
          // Samtalen er forkastet («Ny samtale») — stopp streamen, rør ikke ny state.
          await reader.cancel();
          break;
        }
        acc += decoder.decode(value, { stream: true });
        setMeldinger((m) => {
          const kopi = [...m];
          kopi[kopi.length - 1] = { role: "assistant", content: acc };
          return kopi;
        });
      }
    } catch (err) {
      if (gen === genRef.current) {
        setMeldinger((m) => m.slice(0, -1));
        setFeil(err instanceof Error ? err.message : "Kunne ikke sende melding.");
      }
    } finally {
      setSender(false);
    }
  }

  function nySamtale() {
    genRef.current += 1; // forkast ev. pågående stream
    setMeldinger([]);
    setSessionId(null);
    setInput("");
    setFeil(null);
  }

  function eksporter() {
    const md = meldinger
      .map((m) => `## ${m.role === "user" ? "Du" : "AI-coach"}\n\n${m.content}\n`)
      .join("\n");
    const blob = new Blob(
      [`# AI-coach chat\n\nEksportert ${new Date().toISOString()}\n\n${md}`],
      { type: "text/markdown;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-coach-chat-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const tom = meldinger.length === 0;

  return (
    <>
      {/* Hode */}
      <div>
        <Caps>PlayerHQ · AI-coach</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em={`${fornavn}.`}>AI om</Tittel>
        </div>
      </div>

      {/* Chat-flate */}
      <Kort pad="0" style={{ height: mobile ? "auto" : "min(66vh, 640px)", minHeight: mobile ? 520 : undefined }}>
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", height: "100%", minHeight: 0 }}>
          {/* Identitetsstripe + verktøy */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <AiMerke navn={`AI om ${fornavn}`} sub="Personlig kontekst" />
            <div style={{ display: "flex", gap: 8 }}>
              <Knapp ghost icon="download" onClick={eksporter} disabled={tom}>Eksporter</Knapp>
              <Knapp ghost icon="plus" onClick={nySamtale} disabled={sender}>Ny samtale</Knapp>
            </div>
          </div>

          {/* Meldinger */}
          <div ref={scrollRef} style={{ overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
            {tom ? (
              <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", gap: 18, alignItems: "center", padding: "20px 8px" }}>
                <TomTilstand
                  icon="sparkles"
                  title="Hva vil du jobbe med i dag?"
                  sub="Spør om treningsforslag, analyse av siste runder eller hjelp til å lage en plan. AI-coach kjenner profilen din."
                />
                <ForslagRad items={FORSLAG} onPick={setInput} sentrert />
              </div>
            ) : (
              meldinger.map((m, i) =>
                m.role === "assistant" && m.content === "" ? (
                  <SamtaleSkriver key={i} />
                ) : (
                  <SamtaleBoble key={i} rolle={m.role} initialer={initialer}>
                    {m.content}
                  </SamtaleBoble>
                ),
              )
            )}
          </div>

          {/* Komposisjon */}
          <div style={{ padding: "12px 16px 14px", borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
            {feil && <SamtaleFeil>{feil}</SamtaleFeil>}
            <Skrivefelt value={input} onChange={setInput} onSend={send} sender={sender} />
            {!tom && <ForslagRad items={FORSLAG} onPick={setInput} />}
          </div>
        </div>
      </Kort>
    </>
  );
}

/* ── Pro-gate ──────────────────────────────────────────────────────── */

function ProGate({ mobile }: { mobile: boolean }) {
  return (
    <>
      <div>
        <Caps>PlayerHQ · AI-coach</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="Pro.">Krever</Tittel>
        </div>
      </div>
      <Kort tint>
        <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "0 0 16px" }}>
          AI-coach er en del av Pro-abonnementet.
        </p>
        <Link href="/portal/meg/abonnement" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
          <Knapp icon="arrow-up-right">Oppgrader til Pro</Knapp>
        </Link>
      </Kort>
    </>
  );
}
