"use client";

import { cn } from "@/lib/utils";
import type { CaddieMessage } from "./types";
import { CaddieToolCall } from "./caddie-tool-call";

type Props = {
  message: CaddieMessage;
  streaming?: boolean;
};

/**
 * Minimal markdown-renderer for assistant-svar. Støtter:
 * - **bold**
 * - punktlister (linjer som starter med "- ")
 * - kodeblokker mellom ```
 *
 * Holdes bevisst enkel — vi unngår å installere react-markdown her.
 */
function renderInline(text: string) {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <strong key={`b${key++}`} className="font-semibold">
        {m[1]}
      </strong>
    );
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderText(text: string) {
  if (!text) return null;
  const blocks = text.split(/```/);
  return blocks.map((block, idx) => {
    if (idx % 2 === 1) {
      return (
        <pre
          key={`code-${idx}`}
          className="my-2 overflow-x-auto rounded-sm bg-muted px-2 py-2 font-mono text-[12px] text-foreground"
        >
          {block.trim()}
        </pre>
      );
    }
    const lines = block.split("\n");
    const nodes: React.ReactNode[] = [];
    let listBuffer: string[] = [];
    const flushList = (k: string) => {
      if (listBuffer.length === 0) return;
      nodes.push(
        <ul key={`ul-${k}`} className="my-2 list-disc space-y-1 pl-6">
          {listBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    };
    lines.forEach((line, i) => {
      if (/^\s*-\s+/.test(line)) {
        listBuffer.push(line.replace(/^\s*-\s+/, ""));
      } else {
        flushList(`${idx}-${i}`);
        if (line.trim().length > 0) {
          nodes.push(
            <p key={`p-${idx}-${i}`} className="leading-relaxed">
              {renderInline(line)}
            </p>
          );
        }
      }
    });
    flushList(`${idx}-end`);
    return <div key={`blk-${idx}`}>{nodes}</div>;
  });
}

export function CaddieMessage({ message, streaming }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] space-y-2 rounded-lg px-4 py-2 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground"
        )}
      >
        {!isUser && (
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Caddie
          </div>
        )}
        {message.parts.map((part, i) => {
          if (part.type === "tool-call") {
            return <CaddieToolCall key={i} toolCall={part.toolCall} />;
          }
          return (
            <div key={i} className="space-y-1">
              {renderText(part.text)}
              {streaming && i === message.parts.length - 1 && (
                <span
                  className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-current align-middle"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
