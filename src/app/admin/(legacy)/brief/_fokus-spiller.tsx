"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  Check,
  Info,
  MessageSquare,
  Pin,
  Sparkles,
  User,
  ZapOff,
} from "lucide-react";
import { AgAvatar, AgChip, agBtnClass } from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";

export type FokusSpillerData = {
  id: string;
  name: string;
  initials: string;
  tone: "pri" | "lime" | "neu";
  meta: string;
  signal: string;
  signalType: "alert" | "warn" | "info";
  reason: string;
};

function SpillerKort({
  spiller,
  pinned,
  onPin,
  onUnpin,
}: {
  spiller: FokusSpillerData;
  pinned: boolean;
  onPin: () => void;
  onUnpin: () => void;
}) {
  const SignalIcon =
    spiller.signalType === "alert"
      ? AlertTriangle
      : spiller.signalType === "warn"
        ? ZapOff
        : Info;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        pinned && "border-l-[3px] border-l-primary",
        !pinned && spiller.signalType === "alert" && "border-l-[3px] border-l-destructive",
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <AgAvatar initials={spiller.initials} size={40} tone={spiller.tone} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-foreground">{spiller.name}</div>
          <div className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {spiller.meta}
          </div>
        </div>
        {pinned ? (
          <button
            type="button"
            title="Løsne fra topp"
            onClick={onUnpin}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Pin size={13} strokeWidth={2} />
          </button>
        ) : (
          <AgChip
            tone={
              spiller.signalType === "alert"
                ? "alert"
                : spiller.signalType === "warn"
                  ? "warn"
                  : "neu"
            }
          >
            <SignalIcon size={10} strokeWidth={2.5} />
            {spiller.signal}
          </AgChip>
        )}
      </div>

      <div className="mb-3 flex gap-2 rounded-lg bg-secondary/50 p-3 text-[12px] leading-relaxed text-foreground">
        <Sparkles size={13} strokeWidth={1.75} className="mt-px shrink-0 text-primary" />
        <span>{spiller.reason}</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Link
          href={`/admin/booking/ny?player=${spiller.id}`}
          className={agBtnClass("primary", "sm")}
        >
          <Calendar size={12} strokeWidth={1.75} />
          Book økt
        </Link>
        <Link
          href={`/admin/messages?player=${spiller.id}`}
          className={agBtnClass("ghost", "sm")}
        >
          <MessageSquare size={12} strokeWidth={1.75} />
          Melding
        </Link>
        <Link
          href={`/admin/spillere/${spiller.id}`}
          className={agBtnClass("ghost", "sm")}
        >
          <User size={12} strokeWidth={1.75} />
          Profil
        </Link>
        <span className="flex-1" />
        {!pinned && (
          <button
            type="button"
            title="Fest øverst"
            onClick={onPin}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Pin size={13} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );
}

export function FokusSpillerPanel({ spillere }: { spillere: FokusSpillerData[] }) {
  const firstAlert = spillere.find((s) => s.signalType === "alert");
  const [pinnedId, setPinnedId] = useState<string | null>(firstAlert?.id ?? null);

  const pinned = spillere.find((s) => s.id === pinnedId) ?? null;
  const suggestions = spillere.filter((s) => s.id !== pinnedId);

  if (spillere.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-6 text-[13px] text-muted-foreground">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary">
          <Check size={14} strokeWidth={1.75} className="text-primary" />
        </span>
        Ingen spillere trenger oppmerksomhet akkurat nå.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
        <Pin size={10} strokeWidth={2} />
        Pinnet av deg
        <span className="h-px flex-1 bg-border" />
      </div>

      {pinned ? (
        <SpillerKort
          spiller={pinned}
          pinned
          onPin={() => setPinnedId(pinned.id)}
          onUnpin={() => setPinnedId(null)}
        />
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-4 py-4 text-[12px] text-muted-foreground">
          <Pin size={14} strokeWidth={1.75} className="shrink-0 opacity-40" />
          Ingen pinnet. Trykk pin-ikonet for å feste en spiller øverst.
        </div>
      )}

      {suggestions.length > 0 && (
        <>
          <div className="mt-1 flex items-center gap-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
            <Sparkles size={10} strokeWidth={2} />
            AI-forslag · Caddie
            <span className="h-px flex-1 bg-border" />
          </div>
          {suggestions.map((s) => (
            <SpillerKort
              key={s.id}
              spiller={s}
              pinned={false}
              onPin={() => setPinnedId(s.id)}
              onUnpin={() => setPinnedId(null)}
            />
          ))}
        </>
      )}
    </div>
  );
}
