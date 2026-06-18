"use client";

import { useState, useTransition } from "react";
import { Check, CheckCheck, Paperclip, Send } from "lucide-react";
import { sendReply } from "./actions";

export type TradMelding = {
  id: string;
  role: "me" | "coach";
  body: string;
  ts: string;
};

const QUICK_REPLIES = [
  "Mottatt",
  "Takk!",
  "Sees i morgen",
  "Får tilbake til deg",
  "Når passer det?",
  "Skal teste i kveld",
];

export function TradUi({
  threadId,
  coachName,
  coachInitials,
  meName,
  meInitials,
  initialMeldinger,
}: {
  threadId: string;
  coachName: string;
  coachInitials: string;
  meName: string;
  meInitials: string;
  initialMeldinger: TradMelding[];
}) {
  const [meldinger, setMeldinger] = useState<TradMelding[]>(initialMeldinger);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  const meFornavn = meName.split(" ")[0];

  function send() {
    if (!draft.trim()) return;
    const optimistic: TradMelding = {
      id: `tmp-${Date.now()}`,
      role: "me",
      body: draft.trim(),
      ts: new Date().toISOString(),
    };
    setMeldinger((p) => [...p, optimistic]);
    const sentBody = draft.trim();
    setDraft("");
    startTransition(async () => {
      try {
        await sendReply(threadId, sentBody);
      } catch {
        setMeldinger((p) => p.filter((m) => m.id !== optimistic.id));
      }
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <main className="mx-auto max-w-[880px] space-y-4 px-4 py-6 pb-40 sm:px-6 sm:py-8" aria-live="polite">
        {meldinger.map((m, i) => {
          const showDate =
            i === 0 ||
            new Date(meldinger[i - 1].ts).toDateString() !==
              new Date(m.ts).toDateString();
          return (
            <div key={m.id}>
              {showDate && (
                <div className="my-4 flex items-center gap-2">
                  <span className="h-px flex-1 bg-border" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
                    {new Date(m.ts).toLocaleDateString("nb-NO", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              )}
              <Bubble
                msg={m}
                coachInitials={coachInitials}
                coachName={coachName}
                meInitials={meInitials}
                meFornavn={meFornavn}
              />
            </div>
          );
        })}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-[880px] px-4 py-2 sm:px-6">
          <div className="mb-2 flex flex-wrap gap-2">
            {QUICK_REPLIES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDraft(r)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11.5px] font-medium text-foreground hover:border-primary hover:text-primary"
              >
                {r === "Mottatt" && <Check className="h-3 w-3" strokeWidth={1.75} />}
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2 rounded-2xl border border-input bg-background p-2">
            <button
              type="button"
              title="Vedlegg"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Paperclip className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`Skriv et svar til ${coachName.split(" ")[0]}…`}
              rows={1}
              className="flex-1 resize-none bg-transparent py-2 text-[14.5px] leading-relaxed focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            />
            <button
              type="button"
              onClick={send}
              disabled={pending || !draft.trim()}
              title="Send"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-foreground hover:bg-[#C5ED32] disabled:opacity-40"
            >
              <Send className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
          <div className="mt-1.5 flex items-center gap-2 px-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground/70">
            <span>↵ Send · ⇧↵ Ny linje</span>
            <span className="ml-auto">End-to-end kryptert</span>
          </div>
        </div>
      </div>
    </>
  );
}

function Bubble({
  msg,
  coachInitials,
  coachName,
  meInitials,
  meFornavn,
}: {
  msg: TradMelding;
  coachInitials: string;
  coachName: string;
  meInitials: string;
  meFornavn: string;
}) {
  const isMe = msg.role === "me";
  const time = new Date(msg.ts).toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex gap-2 ${isMe ? "justify-end" : ""}`}>
      {!isMe && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {coachInitials}
        </div>
      )}
      <div className={`max-w-[68%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`flex items-baseline gap-2 font-mono text-[10.5px] text-muted-foreground ${
            isMe ? "flex-row-reverse" : ""
          }`}
        >
          <span className="font-semibold normal-case text-foreground">
            {isMe ? meFornavn : coachName.split(" ")[0]}
          </span>
          <span>{time}</span>
          {isMe && <CheckCheck className="h-3 w-3 text-primary" strokeWidth={2} />}
        </div>
        <div
          className={`whitespace-pre-line rounded-2xl px-4 py-2 text-[14px] leading-relaxed ${
            isMe
              ? "rounded-tr-md bg-primary text-primary-foreground"
              : "rounded-tl-md border border-border bg-card text-foreground"
          }`}
        >
          {msg.body}
        </div>
      </div>
      {isMe && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-semibold text-foreground">
          {meInitials}
        </div>
      )}
    </div>
  );
}
