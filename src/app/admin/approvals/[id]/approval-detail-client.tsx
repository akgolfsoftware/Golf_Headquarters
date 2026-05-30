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
import type { ApprovalDetail } from "./page";

type DialogMode = "none" | "decline" | "info" | "approve";

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

  const confidencePct = Math.round(detail.aiReasoning.confidence * 100);
  const eyebrowParts = [
    "Godkjenning",
    relativeTimeNb(detail.createdAt),
    detail.agentName,
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Eyebrow + tilbake */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/approvals"
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
            {detail.title.italic && (
              <em className="font-normal italic text-primary">
                {detail.title.italic}
              </em>
            )}
            {detail.title.trail}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {detail.player.name} · {detail.player.meta}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start sm:items-end gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <span>Konfidens {confidencePct}%</span>
          <span>Basis: {detail.aiReasoning.history}</span>
        </div>
      </header>

      {/* Sammenligning: foreslått vs nåværende */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ComparePanel
          variant="proposed"
          label="Foreslått"
          title={detail.title.lead}
          rows={detail.proposed}
        />
        <ComparePanel
          variant="current"
          label="Nåværende"
          title="Plan denne uka"
          rows={detail.current}
        />
      </section>

      {/* Konflikt-validering */}
      {detail.conflictNote && (
        <div className="flex items-start gap-2 rounded-md border border-accent/40 bg-accent/15 p-4">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent/40 text-accent-foreground">
            <Check size={14} strokeWidth={2} />
          </div>
          <div className="flex-1 text-sm">
            <p className="text-foreground">{detail.conflictNote.text}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-accent-foreground">
              {detail.conflictNote.validation}
            </p>
          </div>
        </div>
      )}

      {/* AI-begrunnelse */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary/85 p-4 sm:p-6 text-primary-foreground shadow-sm">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent/80">
          <Sparkles size={12} strokeWidth={1.75} />
          AI-begrunnelse
        </span>
        <h2 className="mt-2 font-display text-xl font-semibold leading-tight tracking-tight">
          {detail.aiReasoning.headlineLead}
          <em className="font-normal italic text-accent">
            {detail.aiReasoning.headlineItalic}
          </em>
          {detail.aiReasoning.headlineTrail}
        </h2>
        <div className="mt-2 space-y-2 text-[14px] leading-relaxed text-primary-foreground/90">
          {detail.aiReasoning.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2 border-t border-accent/15 pt-4 font-mono text-[11px] font-semibold text-accent">
          <span>
            <span className="mr-1.5 text-accent/60">KONFIDENS</span>
            {confidencePct}%
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <span className="text-[10px]">
            <span className="mr-1.5 text-accent/60">HISTORIKK</span>
            {detail.aiReasoning.history}
          </span>
        </div>
      </section>

      {/* Spillerens kontekst */}
      {detail.playerQuote && (
        <section className="rounded-lg border border-border bg-card p-6">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Spillerens kontekst
          </span>
          <blockquote className="mt-2 border-l-2 border-accent pl-4 font-display text-base italic leading-snug text-foreground">
            {detail.playerQuote.text}
          </blockquote>
          <p className="mt-2 pl-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            {detail.playerQuote.meta}
          </p>
        </section>
      )}

      {/* Coach-historikk */}
      <section className="rounded-lg border border-border bg-card p-6">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Coach-historikk på {detail.player.name.split(" ")[0]}
        </span>
        <ul className="mt-2 space-y-2 text-sm text-foreground">
          <li className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-2">
            <span>Godkjente forrige putt-drill</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              12.5
            </span>
          </li>
          <li className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-2">
            <span>Avslo iron-økt: «for tett før turnering»</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              08.5
            </span>
          </li>
          <li className="flex items-baseline justify-between gap-2">
            <span>14/16 AI-forslag godkjent siste 30 dager</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              88 %
            </span>
          </li>
        </ul>
      </section>

      {/* Action-bar */}
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
          href={`/admin/elever/${detail.player.id}?compose=1`}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle size={14} strokeWidth={1.75} />
          Send melding
        </Link>
      </div>

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

function ComparePanel({
  variant,
  label,
  title,
  rows,
}: {
  variant: "proposed" | "current";
  label: string;
  title: string;
  rows: ReadonlyArray<{ k: string; v: string; tone?: string }>;
}) {
  const isProposed = variant === "proposed";
  return (
    <div
      className={`relative flex flex-col gap-2 rounded-lg border p-6 ${
        isProposed
          ? "border-accent/55 bg-accent/10"
          : "border-border bg-background"
      }`}
    >
      <span
        className={`absolute right-4 top-4 font-mono text-[9px] font-bold uppercase tracking-[0.10em] ${
          isProposed ? "text-accent-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <h3 className="pr-20 font-display text-base font-semibold tracking-tight">
        {title}
      </h3>
      <dl className="flex flex-col divide-y divide-border/60">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[80px_1fr] items-center gap-2 py-2"
          >
            <dt className="font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              {row.k}
            </dt>
            <dd
              className={`text-sm font-medium ${rowToneClass(row.tone, isProposed)}`}
            >
              {row.v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function rowToneClass(tone: string | undefined, isProposed: boolean): string {
  if (tone === "highlight")
    return "inline-flex w-fit rounded-sm bg-accent px-2 py-0.5 font-mono text-accent-foreground";
  if (tone === "ok") return "font-mono text-primary";
  if (tone === "warn") return "font-mono text-destructive";
  if (tone === "dim") return "text-muted-foreground line-through opacity-70";
  return isProposed ? "text-foreground" : "text-muted-foreground";
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
