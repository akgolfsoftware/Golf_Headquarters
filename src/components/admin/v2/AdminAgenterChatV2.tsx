"use client";

/**
 * AgencyOS Agenter — v2 (retning C «Presis»). Rekomponert fra den legacy
 * skjermen (src/app/admin/(legacy)/agenter/page.tsx + kommando/agent-chat.tsx)
 * med BEVART funksjon: flermodell-chat (Claude/Gemini/Grok/Ollama) mot
 * /api/kommando/chat (uendret backend), samtale-id generert på serveren.
 *
 * Bygget av v2-samtale-familien (src/components/v2/samtale.tsx) — samme
 * mønster som PlayerHQ CoachAIV2. Ingen ad-hoc UI, ingen rå hex (kun T.*).
 */

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  T,
  Caps,
  Tittel,
  Kort,
  PillTabs,
  AiMerke,
  SamtaleBoble,
  SamtaleSkriver,
  TomTilstand,
  ForslagRad,
  Skrivefelt,
} from "@/components/v2";
import { KOMMANDO_MODELS, DEFAULT_MODEL, type KommandoModelId } from "@/lib/kommando/models";

type TextPart = { type: "text"; text: string };

function messageText(parts: ReadonlyArray<{ type: string }>): string {
  return parts
    .filter((p): p is TextPart => p.type === "text" && typeof (p as TextPart).text === "string")
    .map((p) => p.text)
    .join("");
}

const FORSLAG = ["Oppsummer dagens saker", "Utkast til foreldre-e-post", "Sjekk siste turneringsresultat"];

export function AdminAgenterChatV2({ conversationId }: { conversationId: string }) {
  const [model, setModel] = useState<KommandoModelId>(DEFAULT_MODEL);
  const [input, setInput] = useState("");

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: "/api/kommando/chat" }),
    onError: (e) => console.error("Agenter chat-feil:", e),
  });

  const busy = status === "streaming" || status === "submitted";
  const tom = messages.length === 0;
  const aktivModell = KOMMANDO_MODELS.find((m) => m.id === model) ?? KOMMANDO_MODELS[0];
  const sisteRolle = messages[messages.length - 1]?.role;

  async function send() {
    const tekst = input.trim();
    if (!tekst || busy) return;
    setInput("");
    await sendMessage({ text: tekst }, { body: { conversationId, model } });
  }

  return (
    <>
      <div>
        <Caps>AgencyOS · Agenter</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="modeller.">Snakk med 4</Tittel>
        </div>
      </div>

      <Kort pad="0" style={{ height: "min(66vh, 640px)", minHeight: 520 }}>
        <div style={{ display: "grid", gridTemplateRows: "auto auto 1fr auto", height: "100%", minHeight: 0 }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <AiMerke navn={aktivModell.label} sub={aktivModell.role} />
          </div>

          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
            <PillTabs
              tabs={KOMMANDO_MODELS.map((m) => ({ id: m.id, l: m.label }))}
              value={model}
              onChange={(id) => setModel(id as KommandoModelId)}
            />
          </div>

          <div style={{ overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
            {tom ? (
              <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", gap: 18, alignItems: "center", padding: "20px 8px" }}>
                <TomTilstand
                  icon="bot"
                  title="Velg en modell og still et spørsmål"
                  sub="Hver modell har sin rolle — Claude for kode/bygg, Gemini for research, Grok for marked/nyheter, Ollama lokalt/privat."
                />
                <ForslagRad items={FORSLAG} onPick={setInput} sentrert />
              </div>
            ) : (
              messages.map((m) => {
                const text = messageText(m.parts);
                return (
                  <SamtaleBoble key={m.id} rolle={m.role === "user" ? "user" : "assistant"}>
                    {text || (busy && m.role !== "user" ? "…" : "")}
                  </SamtaleBoble>
                );
              })
            )}
            {busy && sisteRolle === "user" && <SamtaleSkriver />}
          </div>

          <div style={{ padding: "12px 16px 14px", borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
            <Skrivefelt value={input} onChange={setInput} onSend={send} sender={busy} placeholder={`Spør ${aktivModell.label} …`} />
            {!tom && <ForslagRad items={FORSLAG} onPick={setInput} />}
          </div>
        </div>
      </Kort>
    </>
  );
}
