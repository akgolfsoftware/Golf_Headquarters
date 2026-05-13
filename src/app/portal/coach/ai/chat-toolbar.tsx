"use client";

import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChatMelding } from "@/lib/anthropic";

export function ChatToolbar({ messages }: { messages: ChatMelding[] }) {
  const router = useRouter();

  function eksporterChat() {
    const md = messages
      .map((m) => {
        const tittel = m.role === "user" ? "Du" : "AI-coach";
        return `## ${tittel}\n\n${m.content}\n`;
      })
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

  function nyChat() {
    router.push("/portal/coach/ai?ny=1");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={eksporterChat}
        disabled={messages.length === 0}
        className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
      >
        <Download size={14} strokeWidth={1.5} />
        Eksporter chat
      </button>
      <button
        type="button"
        onClick={nyChat}
        className="grid h-10 w-10 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary"
        aria-label="Ny chat"
      >
        <Plus size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
