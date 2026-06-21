"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Edit3,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  approveRequestDetailed,
  declineRequestDetailed,
  requestMoreInfo,
} from "../actions";
import { avatarBg } from "@/lib/avatar-colors";
import type { ApprovalDetail } from "@/app/admin/godkjenninger/[id]/page";

type DialogMode = "none" | "decline" | "info" | "approve";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Venter",
  ACCEPTED: "Godkjent",
  REJECTED: "Avslått",
};

export function ApprovalNotFound() {
  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/godkjenninger"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Tilbake til godkjenninger"
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Godkjenning
        </span>
      </div>
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Fant ikke godkjenningen
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Denne handlingen finnes ikke, eller er allerede behandlet.
        </p>
        <Link
          href="/admin/godkjenninger"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Tilbake til godkjenninger
        </Link>
      </div>
    </div>
  );
}

export function ApprovalDetailClient({ detail }: { detail: ApprovalDetail }) {
  const [mode, setMode] = useState<DialogMode>("none");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setComment("");
    setError(null);
    setMode("none");
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "decline") {
          if (comment.trim().length < 3) {
            setError("Skriv en kort begrunnelse (minst 3 tegn).");
            return;
          }
          await declineRequestDetailed(detail.id, comment.trim());
        } else if (mode === "info") {
          if (comment.trim().length < 3) {
            setError("Formulér spørsmålet du vil sende spilleren.");
            return;
          }
          await requestMoreInfo(detail.id, comment.trim());
          reset();
        } else if (mode === "approve") {
          await approveRequestDetailed(
            detail.id,
            comment.trim() || undefined,
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Noe gikk galt");
      }
    });
  }

  const eyebrowParts = [
    "Godkjenning",
    relativeTimeNb(detail.createdAt),
    detail.agentName,
  ];
  const isPending = detail.status === "PENDING";

  return (
    <div className="space-y-6 pb-24">
      {/* Eyebrow + tilbake */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/godkjenninger"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Tilbake til godkjenninger"
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {eyebrowParts.join(" · ")}
        </span>
      </div>

      {/* Hero: spiller + tittel */}
      <header className="flex flex-col gap-6 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm sm:flex-row sm:items-center">
        <div
          aria-hidden="true"
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full font-mono text-base font-semibold text-white ring-2 ring-accent"
          style={{ background: avatarBg(detail.player.name) }}
        >
          {detail.player.initials}
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/40 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
            <Sparkles size={11} strokeWidth={1.75} />
            AI-foreslått
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {detail.title.lead}
            {detail.title.trail}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {detail.player.name}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start sm:items-end gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <span>Status: {STATUS_LABEL[detail.status] ?? detail.status}</span>
        </div>
      </header>

      {/* Action-bar */}
      {isPending ? (
        <div className="sticky bottom-4 z-10 mt-8 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-4 shadow-md">
          <button
            type="button"
            onClick={() => {
              setMode("approve");
              submit();
            }}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Check size={14} strokeWidth={2.5} />
            Godkjenn
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("decline");
              setComment("");
              setError(null);
            }}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-60"
          >
            <X size={14} strokeWidth={1.75} />
            Avslå med begrunnelse
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("info");
              setComment("");
              setError(null);
            }}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
          >
            <Edit3 size={14} strokeWidth={1.75} />
            Be om mer info
          </button>
          <Link
            href={`/admin/spillere/${detail.player.id}?compose=1`}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle size={14} strokeWidth={1.75} />
            Send melding
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-4">
          <span className="text-sm text-muted-foreground">
            Denne handlingen er allerede behandlet
            {" — "}
            {STATUS_LABEL[detail.status] ?? detail.status}.
          </span>
          <Link
            href={`/admin/spillere/${detail.player.id}?compose=1`}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle size={14} strokeWidth={1.75} />
            Send melding
          </Link>
        </div>
      )}

      {/* Inline dialog for begrunnelse / spørsmål */}
      {(mode === "decline" || mode === "info") && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) reset();
          }}
        >
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                {mode === "decline" ? "Avslå med begrunnelse" : "Be om mer info"}
              </h3>
              <button
                type="button"
                onClick={reset}
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Lukk"
              >
                <X size={14} strokeWidth={1.75} />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "decline"
                ? "Forklar kort hvorfor du avslår — dette logges på saken og deles med spilleren."
                : "Spørsmålet sendes som notifikasjon til spilleren. Status forblir 'venter'."}
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-md border border-input bg-background p-4 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
              placeholder={
                mode === "decline"
                  ? "F.eks: for tett innpå turnering, vi tar dette neste uke."
                  : "F.eks: hvordan kjentes forrige putt-drill — for lett eller for tøff?"
              }
            />
            {error && (
              <p className="mt-2 text-xs text-destructive">{error}</p>
            )}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={reset}
                disabled={pending}
                className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-60"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                <Send size={13} strokeWidth={1.75} />
                {mode === "decline" ? "Send avslag" : "Send spørsmål"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function relativeTimeNb(d: Date): string {
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "Opprettet nå";
  if (min < 60) return `Opprettet ${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) return `Opprettet ${t} timer siden`;
  const dg = Math.floor(t / 24);
  return `Opprettet ${dg} dager siden`;
}
