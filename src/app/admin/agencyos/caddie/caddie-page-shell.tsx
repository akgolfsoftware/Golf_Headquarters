"use client";

import { useState } from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { CaddieChat } from "@/components/admin/caddie/caddie-chat";
import { CaddieConversationList } from "@/components/admin/caddie/caddie-conversation-list";
import { ForeslatteSporsmaal } from "@/components/admin/caddie/foreslatte-sporsmaal";
import type { CaddieConversation } from "@/components/admin/caddie/types";

const MOCK_CONVERSATIONS: CaddieConversation[] = [
  {
    id: "c_active",
    title: "Ny samtale",
    snippet: "Hei Anders. Jeg er klar når du er.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c_uke",
    title: "Ukesrapport sponsor",
    snippet: "Jeg har samlet tallene — vil du ha PDF eller e-post?",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "c_fakt",
    title: "Utestående fakturaer",
    snippet: "Totalt 12 450 kr på 4 fakturaer.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unread: true,
  },
  {
    id: "c_vinter",
    title: "Vinterpakke til Bjørn",
    snippet: "Utkast laget — venter på godkjenning.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const MOCK_APPROVALS = [
  {
    id: "ap_1",
    title: "Vinterpakke-tilbud til Bjørn",
    type: "E-post",
    age: "5 min",
  },
  {
    id: "ap_2",
    title: "Purring · Markus #2026-0094",
    type: "Faktura",
    age: "1 t",
  },
  {
    id: "ap_3",
    title: "Notion-logg fra Nicolai-økt",
    type: "Logg",
    age: "3 t",
  },
];

export function CaddiePageShell() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>(MOCK_CONVERSATIONS[0]!.id);
  const [seed, setSeed] = useState<string>("");

  const handleNew = () => {
    const id = `c_${Date.now()}`;
    setConversations((cs) => [
      {
        id,
        title: "Ny samtale",
        snippet: "Caddie venter på første melding…",
        updatedAt: new Date().toISOString(),
      },
      ...cs,
    ]);
    setActiveId(id);
  };

  const handleSuggest = (q: string) => {
    setSeed(q);
    // Reset seed etter at den er plukket opp av chat-komponenten.
    setTimeout(() => setSeed(""), 50);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
      {/* Venstre: samtale-liste */}
      <div className="lg:max-w-[240px]">
        <CaddieConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNew}
        />
      </div>

      {/* Senter: chat */}
      <CaddieChat key={activeId} conversationId={activeId} initialSeed={seed} />

      {/* Høyre: approval-kø + foreslåtte spørsmål */}
      <aside className="space-y-6">
        <section
          aria-label="Godkjennings-kø"
          className="rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-4">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <h3 className="font-display text-sm font-semibold tracking-tight">
              Venter på godkjenning
            </h3>
            <span className="ml-auto rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
              {MOCK_APPROVALS.length}
            </span>
          </div>
          <ul className="divide-y divide-border">
            {MOCK_APPROVALS.map((a) => (
              <li key={a.id} className="px-4 py-4">
                <div className="text-xs font-semibold text-foreground">{a.title}</div>
                <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <span>{a.type}</span>
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <span>{a.age}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <ForeslatteSporsmaal onPick={handleSuggest} />
      </aside>
    </div>
  );
}
