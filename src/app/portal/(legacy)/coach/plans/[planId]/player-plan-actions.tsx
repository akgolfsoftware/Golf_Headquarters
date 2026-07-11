"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  MessageSquare,
  RotateCcw,
  X,
} from "lucide-react";
import { godtaPlan, beOmEndring, trekkTilbakeAvvisning } from "./actions";

type PlanStatusVerdi =
  | "DRAFT"
  | "PENDING_PLAYER"
  | "ACCEPTED"
  | "REJECTED"
  | "ACTIVE"
  | "PAUSED"
  | "ARCHIVED";

type Props = {
  planId: string;
  status: PlanStatusVerdi;
  playerComment: string | null;
  acceptedAt: Date | null;
};

function fmtDatoLang(d: Date) {
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function PlayerPlanActions({
  planId,
  status,
  playerComment,
  acceptedAt,
}: Props) {
  if (status === "PENDING_PLAYER") {
    return <PendingCta planId={planId} />;
  }
  if (status === "ACCEPTED" || status === "ACTIVE") {
    return <AcceptedBadge acceptedAt={acceptedAt} />;
  }
  if (status === "REJECTED") {
    return (
      <RejectedBanner planId={planId} playerComment={playerComment} />
    );
  }
  return null;
}

/* =========================================================
   PENDING_PLAYER — primær CTA + "Be om endring"
   ========================================================= */

function PendingCta({ planId }: { planId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [modalAapen, setModalAapen] = useState(false);

  function godta() {
    setFeil(null);
    startTransition(async () => {
      const res = await godtaPlan(planId);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-accent/50 bg-accent/15 p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/40">
          <CheckCircle
            size={20}
            strokeWidth={1.5}
            className="text-foreground"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Venter på din godkjenning
          </div>
          <h2 className="mt-2 font-display text-[24px] leading-tight tracking-tight">
            <span className="italic">Godta</span> planen
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-[1.5] text-muted-foreground">
            Coachen din har sendt planen til deg. Godta hvis du er fornøyd, eller
            be om endring hvis noe må justeres.
          </p>

          {feil && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-[12px] text-destructive">
              {feil}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={godta}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <CheckCircle size={16} strokeWidth={1.5} />
              Godta plan
            </button>
            <button
              type="button"
              onClick={() => setModalAapen(true)}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <MessageSquare size={16} strokeWidth={1.5} />
              Be om endring
            </button>
          </div>
        </div>
      </div>

      {modalAapen && (
        <BeOmEndringModal
          planId={planId}
          onLukk={() => setModalAapen(false)}
          onSendt={() => {
            setModalAapen(false);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}

/* =========================================================
   ACCEPTED — grønn badge
   ========================================================= */

function AcceptedBadge({ acceptedAt }: { acceptedAt: Date | null }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[12px] font-medium text-primary">
      <CheckCircle size={14} strokeWidth={1.5} />
      Godtatt{acceptedAt ? ` ${fmtDatoLang(acceptedAt)}` : ""}
    </div>
  );
}

/* =========================================================
   REJECTED — varselsbanner med kommentar + "Trekk tilbake"
   ========================================================= */

function RejectedBanner({
  planId,
  playerComment,
}: {
  planId: string;
  playerComment: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function trekkTilbake() {
    setFeil(null);
    startTransition(async () => {
      const res = await trekkTilbakeAvvisning(planId);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
      <div className="flex items-start gap-4">
        <AlertCircle
          size={20}
          strokeWidth={1.5}
          className="mt-0.5 shrink-0 text-destructive"
        />
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-destructive">
            Du har bedt om endring
          </div>
          <p className="mt-2 text-[13px] leading-[1.5] text-foreground">
            Coachen din er varslet. Du kan trekke tilbake meldingen og godta
            planen som den er.
          </p>
          {playerComment && (
            <blockquote className="mt-4 rounded-md border-l-2 border-destructive/60 bg-card px-4 py-4 font-display text-[14px] italic leading-snug text-foreground">
              «{playerComment}»
            </blockquote>
          )}

          {feil && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[12px] text-destructive">
              {feil}
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={trekkTilbake}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <RotateCcw size={14} strokeWidth={1.5} />
              Trekk tilbake
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Modal — "Be om endring"
   ========================================================= */

function BeOmEndringModal({
  planId,
  onLukk,
  onSendt,
}: {
  planId: string;
  onLukk: () => void;
  onSendt: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pending, startTransition] = useTransition();
  const [kommentar, setKommentar] = useState("");
  const [feil, setFeil] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    requestAnimationFrame(() => textareaRef.current?.focus());
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  function send() {
    setFeil(null);
    startTransition(async () => {
      const res = await beOmEndring(planId, kommentar);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      onSendt();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onLukk}
      onCancel={(e) => {
        e.preventDefault();
        onLukk();
      }}
      className="w-full max-w-lg rounded-lg border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-foreground/40"
    >
      <div className="flex items-start justify-between border-b border-border px-6 py-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Tilbakemelding til coach
          </div>
          <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
            Be om endring i planen
          </h3>
        </div>
        <button
          type="button"
          onClick={onLukk}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Lukk"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="space-y-4 px-6 py-6">
        <div>
          <label
            htmlFor="kommentar"
            className="block text-[12px] font-medium text-foreground"
          >
            Hva ønsker du endret?
          </label>
          <textarea
            ref={textareaRef}
            id="kommentar"
            value={kommentar}
            onChange={(e) => setKommentar(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Skriv kort hva du vil ha endret — antall økter, fokus, tidspunkt…"
            className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2 text-[13px] leading-[1.5] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-1 focus:ring-ring"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>Minst 5 tegn. Coachen din får denne meldingen.</span>
            <span className="font-mono tabular-nums">
              {kommentar.length} / 2000
            </span>
          </div>
        </div>

        {feil && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-[12px] text-destructive">
            {feil}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border bg-secondary/40 px-6 py-4">
        <button
          type="button"
          onClick={onLukk}
          disabled={pending}
          className="rounded-md border border-border bg-card px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          Avbryt
        </button>
        <button
          type="button"
          onClick={send}
          disabled={pending || kommentar.trim().length < 5}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <MessageSquare size={14} strokeWidth={1.5} />
          {pending ? "Sender…" : "Send melding"}
        </button>
      </div>
    </dialog>
  );
}
