"use client";

/**
 * COL 2 — Samtale for AgencyOS Innboks.
 *
 * Header (spillernavn + tid + åpne-profil) → meldingsstrøm med dato-skiller →
 * composer. Meldingsbobler per design-prompt:
 *   - Innkommende (spiller): venstre, bg forest-100 (bg-primary/10), radius 12
 *     med skarpt bunn-venstre hjørne.
 *   - Utgående (coach): høyre, bg lime (bg-accent), tekst forest, radius 12
 *     med skarpt bunn-høyre hjørne.
 * Composer kaller den eksisterende sendMelding-actionen fra /admin/messages
 * (appender til CoachingSession.messages-JSON). Sender → router.refresh().
 */

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendMelding } from "@/app/admin/messages/actions";
import type { InboxMessage } from "./inbox-screen";

export function InboxConversation({
  threadId,
  playerName,
  playerId,
  headerWhen,
  messages,
}: {
  threadId: string;
  playerName: string;
  playerId: string;
  headerWhen: string;
  messages: InboxMessage[];
}) {
  const router = useRouter();
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function håndterSend() {
    const body = tekst.trim();
    if (!body) {
      setFeil("Skriv et svar først.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const res = await sendMelding(threadId, body);
      if (!res.ok) {
        setFeil(res.error ?? "Kunne ikke sende melding.");
        return;
      }
      setTekst("");
      if (textareaRef.current) textareaRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <section className="flex min-w-0 flex-col border-l border-border bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-5 py-3.5">
        <div className="min-w-0">
          <div className="truncate font-display text-[15px] font-bold leading-tight tracking-[-0.015em] text-foreground">
            {playerName}
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            {headerWhen}
          </div>
        </div>
        <Link
          href={`/admin/spillere/${playerId}`}
          className="ml-auto inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowUpRight className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
          Profil
        </Link>
      </div>

      {/* Meldingsstrøm */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[13px] text-muted-foreground">
              Ingen meldinger ennå — start samtalen nedenfor.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex flex-col gap-3">
              {m.dayLabel && (
                <div className="my-1 flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                  {m.dayLabel}
                </div>
              )}
              <Bubble message={m} />
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card px-5 py-4">
        <div className="rounded-xl border border-border bg-background px-3.5 py-3">
          <textarea
            ref={textareaRef}
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                håndterSend();
              }
            }}
            placeholder="Skriv svar …"
            rows={2}
            disabled={pending}
            className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none"
          />
          <div className="mt-2 flex items-center gap-2">
            {feil && <span className="text-[11px] text-destructive">{feil}</span>}
            <span className="flex-1" />
            <button
              type="button"
              onClick={håndterSend}
              disabled={pending || tekst.trim().length === 0}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-primary px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? (
                <Loader2 className="h-[13px] w-[13px] animate-spin" aria-hidden />
              ) : (
                <>
                  Send
                  <Send className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bubble({ message }: { message: InboxMessage }) {
  const out = message.direction === "out";
  return (
    <div className={cn("flex max-w-[70%] flex-col gap-1", out ? "self-end items-end" : "self-start items-start")}>
      <div className="flex items-baseline gap-2 px-1">
        <span className="text-[11px] font-semibold text-foreground">{message.author}</span>
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">{message.time}</span>
      </div>
      <div
        className={cn(
          "whitespace-pre-wrap px-3.5 py-2.5 text-[14px] leading-relaxed",
          out
            ? "rounded-xl rounded-br-sm bg-accent text-primary"
            : "rounded-xl rounded-bl-sm bg-primary/10 text-foreground",
        )}
      >
        {message.text}
      </div>
    </div>
  );
}
