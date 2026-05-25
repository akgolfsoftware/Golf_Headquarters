"use client";

/**
 * InvitationCard — vises på PlayerHQ Workbench når noen har invitert
 * spilleren til en delt treningsøkt.
 *
 * Tre svar-CTA-er: Bli med / Kanskje / Avslå. Kaller server actions
 * (svarPaInvitasjon) og bruker optimistic UI via useTransition. Etter
 * svar slipper kortet ut av rendering — revalidatePath på serveren
 * fjerner invitasjonen fra neste render.
 */

import { useState, useTransition } from "react";
import { Check, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { svarPaInvitasjon } from "./invite-actions";

export type InvitationCardProps = {
  participantId: string;
  hostName: string;
  hostAvatarUrl?: string;
  okt: {
    title: string;
    startAt: Date;
    location?: string;
  };
  className?: string;
};

type SvarState = "idle" | "pending" | "done" | "error";

function relativeWhen(date: Date, now: Date): string {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const days = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days === 0) return "I dag";
  if (days === 1) return "I morgen";
  if (days > 1 && days < 7) {
    return target.toLocaleDateString("nb-NO", { weekday: "long" });
  }
  return target.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InvitationCard({
  participantId,
  hostName,
  hostAvatarUrl: _hostAvatarUrl,
  okt,
  className,
}: InvitationCardProps) {
  const [state, setState] = useState<SvarState>("idle");
  const [svar, setSvar] = useState<"ACCEPTED" | "DECLINED" | "MAYBE" | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const now = new Date();

  function handleSvar(s: "ACCEPTED" | "DECLINED" | "MAYBE") {
    if (state === "pending" || state === "done") return;
    setState("pending");
    setSvar(s);
    startTransition(async () => {
      const res = await svarPaInvitasjon({ participantId, svar: s });
      setState(res.ok ? "done" : "error");
    });
  }

  // Skjul kortet etter vellykket svar (revalidatePath fjerner det neste render).
  if (state === "done") {
    return (
      <section
        className={cn(
          "rounded-lg border border-primary/30 bg-primary/5 p-4",
          className,
        )}
      >
        <p className="flex items-center gap-2 text-sm text-foreground">
          <Check size={14} className="text-primary" strokeWidth={2.5} aria-hidden />
          <span>
            Svar registrert
            {svar === "ACCEPTED"
              ? " — sees på økta!"
              : svar === "DECLINED"
                ? " — du takket nei."
                : " — du svarte kanskje."}
          </span>
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-accent/40 bg-accent/10 p-4 sm:p-5",
        className,
      )}
      aria-labelledby={`invitasjon-${participantId}-heading`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: avatarBg(hostName) }}
          aria-hidden
        >
          {initialsFromName(hostName)}
        </div>

        {/* Tekst */}
        <div className="min-w-0 flex-1">
          <p
            id={`invitasjon-${participantId}-heading`}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-accent-foreground/80"
          >
            Ny invitasjon
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {hostName} har invitert deg
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {okt.title} · {relativeWhen(okt.startAt, now)}{" "}
            {formatTime(okt.startAt)}
            {okt.location ? ` · ${okt.location}` : ""}
          </p>
        </div>
      </div>

      {/* CTA-er */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isPending || state === "pending"}
          onClick={() => handleSvar("ACCEPTED")}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:flex-initial sm:min-w-[120px]"
        >
          <Check size={14} strokeWidth={2.5} aria-hidden />
          Bli med
        </button>
        <button
          type="button"
          disabled={isPending || state === "pending"}
          onClick={() => handleSvar("MAYBE")}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
        >
          <HelpCircle size={14} strokeWidth={2} aria-hidden />
          Kanskje
        </button>
        <button
          type="button"
          disabled={isPending || state === "pending"}
          onClick={() => handleSvar("DECLINED")}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          <X size={14} strokeWidth={2} aria-hidden />
          Avslå
        </button>
      </div>

      {state === "error" && (
        <p className="mt-2 text-xs text-destructive">
          Noe gikk galt. Prøv igjen.
        </p>
      )}
    </section>
  );
}
