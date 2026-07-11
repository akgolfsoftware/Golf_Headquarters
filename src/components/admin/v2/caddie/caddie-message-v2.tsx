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

/* Ett-gangs scoped CSS for markdown-innhold (lister, kode, tabeller, lenker)
   — samme mønster som v2/core.tsx sin ensureStyles(). */
function ensureMdStyles(): void {
  if (typeof document === "undefined" || document.getElementById("v2-caddie-md-style")) return;
  const el = document.createElement("style");
  el.id = "v2-caddie-md-style";
  el.textContent =
    `.v2-md p{margin:0 0 8px;}.v2-md p:last-child{margin-bottom:0;}` +
    `.v2-md strong{font-weight:700;}.v2-md em{font-style:italic;}` +
    `.v2-md ul{margin:4px 0;padding-left:18px;list-style:disc;}` +
    `.v2-md ol{margin:4px 0;padding-left:18px;list-style:decimal;}` +
    `.v2-md li{margin:2px 0;}` +
    `.v2-md a{color:${T.lime};text-decoration:underline;}` +
    `.v2-md code{border-radius:4px;background:${T.panel3};padding:1px 5px;font-family:${T.mono};font-size:12px;}` +
    `.v2-md pre{margin:8px 0;overflow-x:auto;border-radius:8px;background:${T.panel3};padding:8px;font-family:${T.mono};font-size:12px;}` +
    `.v2-md pre code{background:transparent;padding:0;}` +
    `.v2-md table{margin:8px 0;width:100%;border-collapse:collapse;font-family:${T.mono};font-size:12px;}` +
    `.v2-md th,.v2-md td{border:1px solid ${T.border};padding:4px 8px;text-align:left;}` +
    `.v2-md th{background:${T.panel3};font-weight:700;}`;
  document.head.appendChild(el);
}
if (typeof document !== "undefined") ensureMdStyles();

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
