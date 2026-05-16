"use client";

import { Plus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaddieConversation } from "./types";

type Props = {
  conversations: CaddieConversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" });
}

export function CaddieConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
}: Props) {
  return (
    <section
      aria-label="Samtaler"
      className="flex h-full flex-col rounded-lg border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <h2 className="font-display text-sm font-semibold tracking-tight">
          Samtaler
        </h2>
        <button
          type="button"
          onClick={onNew}
          aria-label="Ny samtale"
          className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-card px-4 font-mono text-[10px] uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary"
        >
          <Plus className="h-3 w-3" aria-hidden="true" /> Ny
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto divide-y divide-border">
        {conversations.length === 0 && (
          <li className="px-4 py-6 text-center text-xs text-muted-foreground">
            Ingen samtaler ennå.
          </li>
        )}
        {conversations.map((c) => {
          const isActive = c.id === activeId;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={isActive}
                className={cn(
                  "flex w-full items-start gap-2 px-4 py-4 text-left transition-colors",
                  isActive ? "bg-secondary" : "hover:bg-secondary/60"
                )}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {c.title}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {formatTime(c.updatedAt)}
                    </span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {c.snippet}
                  </div>
                </div>
                {c.unread && (
                  <span
                    aria-hidden="true"
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
