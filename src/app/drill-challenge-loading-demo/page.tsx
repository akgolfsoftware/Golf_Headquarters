/**
 * DEMO — Drill Challenge Loading (sender invitasjoner)
 * Bygd fra wireframe live-states/e1-drill-challenge-loading.html
 * URL: /drill-challenge-loading-demo
 */

import { Check, Loader2, X } from "lucide-react";

type Recipient = { name: string; sent: boolean };

const RECIPIENTS: Recipient[] = [
  { name: "Henrik Nilsen", sent: true },
  { name: "Anna Karlsen", sent: true },
  { name: "Mads Rønning", sent: true },
  { name: "Lise Sandberg", sent: false },
];

export default function DrillChallengeLoadingDemo() {
  const sentCount = RECIPIENTS.filter((r) => r.sent).length;
  const total = RECIPIENTS.length;
  const percent = Math.round((sentCount / total) * 100);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b border-border px-6 pt-6 pb-5">
          <div className="flex-1">
            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
              Drill-<em className="italic">challenge</em>
            </h1>
            <div className="mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Sender invitasjoner
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-primary" />
              <span className="h-1.5 w-8 rounded-full bg-primary" />
            </div>
          </div>
          <button
            className="grid h-9 w-9 cursor-not-allowed place-items-center rounded-md border border-border text-muted-foreground opacity-40"
            aria-label="Lukk"
            disabled
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </header>

        {/* Body */}
        <div className="flex flex-col items-center gap-6 px-7 py-12">
          <div className="grid h-16 w-16 place-items-center text-primary">
            <Loader2 size={56} strokeWidth={1.5} className="animate-spin" />
          </div>

          <div className="text-center">
            <div className="font-display text-[22px] italic leading-tight">
              Sender invitasjoner …
            </div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
              10 putts fra 3m · 4 venner
            </div>
          </div>

          {/* Progress */}
          <div className="w-full max-w-[420px]">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {sentCount} av {total} sendt
              </span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {percent} %
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Recipient list */}
            <div className="mt-5 flex flex-col gap-2">
              {RECIPIENTS.map((r) => (
                <div key={r.name} className="flex items-center gap-2.5 text-[13px]">
                  {r.sent ? (
                    <span className="text-[#1A7D56]">
                      <Check size={16} strokeWidth={1.5} />
                    </span>
                  ) : (
                    <Loader2
                      size={14}
                      strokeWidth={1.5}
                      className="animate-spin text-primary"
                    />
                  )}
                  <span
                    className={r.sent ? "text-muted-foreground" : "text-foreground"}
                  >
                    {r.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button
            className="cursor-not-allowed rounded-md px-3 py-2 text-sm font-medium text-muted-foreground opacity-50"
            disabled
          >
            Avbryt
          </button>
          <button
            className="cursor-not-allowed rounded-md bg-border px-5 py-2.5 text-sm font-medium text-muted-foreground"
            disabled
          >
            Sender …
          </button>
        </footer>
      </div>
    </div>
  );
}
