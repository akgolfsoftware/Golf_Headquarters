"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MessageSquarePlus, X, Check } from "lucide-react";
import { sendOktFeedback } from "./actions";

type Props = {
  sessionId: string;
  sessionTitle: string;
  playerName: string;
  existingFeedback?: string | null;
  existingFeedbackAt?: string | null;
};

/**
 * Modal for å sende coach-feedback på en fullført live-økt.
 *
 * A11y:
 * - `role="dialog"` + `aria-modal` + `aria-labelledby`
 * - Esc lukker, fokus-fanger holder fokus inne i dialogen
 * - Bakgrunnsklikk lukker
 */
export function FeedbackModal({
  sessionId,
  sessionTitle,
  playerName,
  existingFeedback,
  existingFeedbackAt,
}: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(existingFeedback ?? "");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const harTidligere = !!existingFeedback;

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
      // Enkel fokus-felle
      if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, textarea, input, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    textareaRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleSubmit() {
    setFeil(null);
    startTransition(async () => {
      const res = await sendOktFeedback(sessionId, text);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-secondary"
        aria-label={`Send feedback på ${sessionTitle}`}
      >
        <MessageSquarePlus className="h-3 w-3" strokeWidth={1.75} />
        {harTidligere ? "Rediger feedback" : "Send feedback"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Coach-feedback · {playerName}
                </div>
                <h2
                  id="feedback-modal-title"
                  className="mt-1 font-display text-[20px] font-semibold leading-tight"
                >
                  <em className="italic">{sessionTitle}</em>
                </h2>
                {existingFeedbackAt && (
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    Sist oppdatert{" "}
                    {new Date(existingFeedbackAt).toLocaleString("nb-NO", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Lukk"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <label
              htmlFor="feedback-text"
              className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            >
              Tilbakemelding til spilleren
            </label>
            <textarea
              id="feedback-text"
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              rows={6}
              placeholder="Skriv kort hva du så, hva som var bra og hva som er fokus til neste økt."
              className="w-full resize-none rounded-md border border-input bg-background px-4 py-2 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
            />
            <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span>Maks 2000 tegn</span>
              <span className="tabular-nums">{text.length}/2000</span>
            </div>

            {feil && (
              <p
                role="alert"
                className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-[12px] text-destructive"
              >
                {feil}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-border bg-transparent px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={pending || text.trim().length < 2}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                {pending ? "Sender…" : harTidligere ? "Oppdater" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
