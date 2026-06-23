"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { CaddieMessage } from "./types";
import { CaddieToolCall } from "./caddie-tool-call";

type Props = {
  message: CaddieMessage;
  streaming?: boolean;
};

/**
 * Markdown-rendering for Caddie-svar via react-markdown + remark-gfm.
 * Støtter GFM-tabeller (Caddie presenterer tall i tabeller per systemprompt),
 * lister, bold, lenker og kodeblokker. Tabeller bruker JetBrains Mono
 * (tabulære tall, jf. designsystem).
 */
const MD_CLASS = cn(
  "space-y-2 break-words text-sm leading-relaxed",
  "[&_p]:leading-relaxed [&_strong]:font-semibold [&_em]:italic",
  "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
  "[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
  "[&_a]:text-primary [&_a]:underline",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px]",
  "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-[12px]",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_table]:my-2 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:font-mono [&_table]:text-[12px]",
  "[&_th]:border [&_th]:border-border [&_th]:bg-background/40 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold [&_th]:whitespace-nowrap",
  "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:align-top",
);

function CaddieMarkdown({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className={MD_CLASS}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}

export function CaddieMessage({ message, streaming }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] space-y-2 rounded-lg px-4 py-2 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground",
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
              <CaddieMarkdown text={part.text} />
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
