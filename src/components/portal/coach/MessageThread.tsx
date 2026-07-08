"use client";

import { useState, useTransition } from "react";
import { CheckCheck } from "lucide-react";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticCard } from "@/components/athletic/card";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticAvatar } from "@/components/athletic/avatar";
import { MessageInput } from "./MessageInput";
import type { CoachMessageItem } from "@/app/portal/coach/actions";

type MessageThreadProps = {
  coachName: string;
  coachInitials: string;
  coachAvatarUrl?: string | null;
  meName: string;
  meInitials: string;
  initialMessages: CoachMessageItem[];
  onSend: (body: string) => Promise<void>;
};

export function MessageThread({
  coachName,
  coachInitials,
  coachAvatarUrl,
  meName,
  meInitials,
  initialMessages,
  onSend,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<CoachMessageItem[]>(initialMessages);
  const [isPending, startTransition] = useTransition();

  async function handleSend(body: string) {
    const optimistic: CoachMessageItem = {
      id: `tmp-${Date.now()}`,
      role: "me",
      body,
      ts: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    startTransition(async () => {
      try {
        await onSend(body);
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      }
    });
  }

  return (
    <AthleticCard label="Meldinger" className="flex flex-col">
      <div className="scrollbar-none -mx-4 -my-4 flex-1 space-y-3 overflow-y-auto p-4 md:-mx-6 md:-my-6 md:p-6">
        {messages.length === 0 ? (
          <EmptyState coachName={coachName} />
        ) : (
          messages.map((m, i) => {
            const showDate =
              i === 0 || new Date(messages[i - 1].ts).toDateString() !== new Date(m.ts).toDateString();
            return (
              <div key={m.id}>
                {showDate && <DateDivider ts={m.ts} />}
                <Bubble
                  msg={m}
                  coachName={coachName}
                  coachInitials={coachInitials}
                  coachAvatarUrl={coachAvatarUrl}
                  meName={meName}
                  meInitials={meInitials}
                />
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <MessageInput
          placeholder={`Skriv til ${coachName.split(" ")[0]}…`}
          disabled={isPending}
          onSend={handleSend}
        />
        <p className="mt-1.5 flex items-center justify-between px-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground/70">
          <span>↵ Send · ⇧↵ Ny linje</span>
          <span>Svartid typisk innen 4 timer</span>
        </p>
      </div>
    </AthleticCard>
  );
}

function EmptyState({ coachName }: { coachName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-sm text-muted-foreground">
        Ingen meldinger ennå. Start samtalen med {coachName.split(" ")[0]}.
      </p>
    </div>
  );
}

function DateDivider({ ts }: { ts: string }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {new Date(ts).toLocaleDateString("nb-NO", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function Bubble({
  msg,
  coachName,
  coachInitials,
  coachAvatarUrl,
  meName,
  meInitials,
}: {
  msg: CoachMessageItem;
  coachName: string;
  coachInitials: string;
  coachAvatarUrl?: string | null;
  meName: string;
  meInitials: string;
}) {
  const isMe = msg.role === "me";
  const time = new Date(msg.ts).toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex gap-3 ${isMe ? "justify-end" : ""}`}>
      {!isMe && (
        <div className="shrink-0">
          {coachAvatarUrl ? (
            <AthleticAvatar src={coachAvatarUrl} alt={coachName} initials={coachInitials} size="sm" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {coachInitials}
            </div>
          )}
        </div>
      )}
      <div className={`flex max-w-[75%] flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
        <div
          className={`flex items-baseline gap-2 font-mono text-[10.5px] text-muted-foreground ${
            isMe ? "flex-row-reverse" : ""
          }`}
        >
          <span className="font-semibold normal-case text-foreground">{isMe ? meName : coachName}</span>
          <span>{time}</span>
          {isMe && <CheckCheck className="h-3 w-3 text-primary" strokeWidth={2} />}
        </div>
        <div
          className={`whitespace-pre-line rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
            isMe
              ? "rounded-tr-md bg-primary text-primary-foreground"
              : "rounded-tl-md border border-border bg-card text-foreground"
          }`}
        >
          {msg.body}
        </div>
      </div>
      {isMe && (
        <div className="shrink-0">
          <AthleticAvatar alt={meName} initials={meInitials} size="sm" />
        </div>
      )}
    </div>
  );
}
