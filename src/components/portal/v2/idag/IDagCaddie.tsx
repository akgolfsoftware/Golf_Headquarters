"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { Mic } from "lucide-react";
import { TL } from "@/lib/v2/train-lock";
import { usePortalChat } from "@/components/portal/v2/chat/use-portal-chat";
import { SamtaleBoble, SamtaleSkriver } from "@/components/v2/samtale";
import { FangstSheet } from "@/components/portal/v2/chat/FangstSheet";
import type { FangstFormel } from "@/lib/domain/fangst-chips";
import type { PortalChatMessagePart } from "@/components/portal/v2/chat/types";

function meldingTekst(parts: PortalChatMessagePart[]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

const felt: CSSProperties = {
  flex: 1,
  height: 48,
  borderRadius: 999,
  background: TL.dock,
  border: `1px solid ${TL.hair}`,
  display: "flex",
  alignItems: "center",
  padding: "0 18px",
  fontFamily: TL.font.sans,
  fontSize: 15,
  fontWeight: 400,
  color: TL.text,
  outline: "none",
};

export function IDagCaddie({
  plassering,
  placeholder,
  fangstFormel,
  oktLabel,
}: {
  plassering: "mobil" | "mac";
  placeholder: string;
  fangstFormel: FangstFormel | null;
  oktLabel: string | null;
}) {
  const { messages, status, sendMessage } = usePortalChat();
  const [tekst, setTekst] = useState("");
  const [fangst, setFangst] = useState(false);
  const sender = status === "streaming" || status === "submitted";
  const visTrad = messages.length > 0 || sender;

  async function send(t: string) {
    const trim = t.trim();
    if (!trim) return;
    setTekst("");
    await sendMessage(trim);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(tekst);
  }

  const bar = (
    <form onSubmit={onSubmit} style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <input
        aria-label={placeholder}
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        placeholder={placeholder}
        disabled={sender}
        className="ph01-caddie"
        style={{ ...felt, color: TL.text }}
      />
      <button
        type="button"
        className="v2-press v2-focus"
        aria-label="Mikrofon"
        onClick={() => setFangst(true)}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: TL.fill,
          color: TL.onFill,
          border: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flex: "none",
        }}
      >
        <Mic size={20} strokeWidth={1.8} />
      </button>
    </form>
  );

  return (
    <>
      {visTrad && (
        <div
          role="log"
          aria-live="polite"
          style={{
            marginBottom: 12,
            maxHeight: plassering === "mac" ? 280 : 220,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "4px 2px",
          }}
        >
          {messages.map((m) => {
            const t = meldingTekst(m.parts);
            if (!t) return null;
            return (
              <SamtaleBoble key={m.id} rolle={m.role === "user" ? "user" : "assistant"}>
                {t}
              </SamtaleBoble>
            );
          })}
          {sender && <SamtaleSkriver />}
        </div>
      )}
      {bar}
      {fangst && (
        <FangstSheet
          onClose={() => setFangst(false)}
          onLagre={(inn) => {
            void send(inn);
          }}
          formel={fangstFormel}
          oktLabel={oktLabel}
        />
      )}
    </>
  );
}


