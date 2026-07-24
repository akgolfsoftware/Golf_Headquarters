"use client";

/**
 * Caddie · meldingsboble (v2). Rekomponert fra
 * src/components/admin/caddie/caddie-message.tsx med v2-tokens. Samme
 * markdown-rendering (react-markdown + remark-gfm, GFM-tabeller i mono).
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { T } from "@/components/v2";
import type { CaddieMessage } from "@/components/admin/caddie/types";
import { CaddieToolCallV2 } from "./caddie-tool-call-v2";

/* Scoped CSS for markdown-innhold (.v2-md — lister, kode, tabeller, lenker)
   bor statisk i src/styles/v2/motion.css (FASIT §4b). */

function CaddieMarkdown({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div
      style={{ fontFamily: T.ui, fontSize: 13.5, lineHeight: 1.55, color: "inherit" }}
      className="v2-md"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}

export function CaddieMessageV2({ message, streaming }: { message: CaddieMessage; streaming?: boolean }) {
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", width: "100%", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: "80%", display: "flex", flexDirection: "column", gap: 8, borderRadius: 14, padding: "10px 14px", fontSize: 13.5,
          background: isUser ? T.lime : T.panel2,
          color: isUser ? T.onLime : T.fg,
          border: isUser ? "none" : `1px solid ${T.border}`,
        }}
      >
        {!isUser && (
          <div style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>
            Caddie
          </div>
        )}
        {message.parts.map((part, i) => {
          if (part.type === "tool-call") {
            return <CaddieToolCallV2 key={i} toolCall={part.toolCall} />;
          }
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <CaddieMarkdown text={part.text} />
              {streaming && i === message.parts.length - 1 && (
                <span
                  aria-hidden="true"
                  className="animate-pulse"
                  style={{ display: "inline-block", marginLeft: 2, height: 12, width: 6, background: "currentColor", verticalAlign: "middle" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
