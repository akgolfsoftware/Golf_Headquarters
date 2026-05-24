"use client"

import { useState } from "react"
import { X, MessageSquare } from "lucide-react"

type Props = {
  open: boolean
  onClose: () => void
  agentAction?: string
}

const STJERNER = [1, 2, 3, 4, 5]

export function AgentFeedbackModal({ open, onClose, agentAction }: Props) {
  const [valgtStjerne, setValgtStjerne] = useState<number | null>(null)
  const [hoverStjerne, setHoverStjerne] = useState<number | null>(null)
  const [kommentar, setKommentar] = useState("")

  if (!open) return null

  function handleLukk() {
    setValgtStjerne(null)
    setHoverStjerne(null)
    setKommentar("")
    onClose()
  }

  function handleSend() {
    handleLukk()
  }

  const aktivStjerne = hoverStjerne ?? valgtStjerne

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleLukk}
      />
      <div className="relative z-10 w-full max-h-[95vh] overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:max-w-md sm:rounded-xl sm:p-6">
        <button
          type="button"
          onClick={handleLukk}
          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground sm:h-9 sm:w-9"
          aria-label="Lukk"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-1 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            AI-tilbakemelding
          </span>
        </div>
        <h2 className="mb-6 text-xl font-semibold">Tilbakemelding på AI-forslag</h2>

        {agentAction && (
          <div className="mb-6 rounded-md bg-secondary p-3 text-sm text-foreground">
            {agentAction}
          </div>
        )}

        <div className="mb-6">
          <p className="mb-3 text-sm text-muted-foreground">Var dette forslaget nyttig?</p>
          <div className="flex gap-2">
            {STJERNER.map((stjerne) => (
              <button
                key={stjerne}
                type="button"
                onClick={() => setValgtStjerne(stjerne)}
                onMouseEnter={() => setHoverStjerne(stjerne)}
                onMouseLeave={() => setHoverStjerne(null)}
                aria-label={`${stjerne} av 5 stjerner`}
                className="text-3xl leading-none transition-transform hover:scale-110"
              >
                <span
                  className={
                    aktivStjerne !== null && stjerne <= aktivStjerne
                      ? "text-accent-foreground"
                      : "text-muted-foreground/40"
                  }
                  style={{
                    color:
                      aktivStjerne !== null && stjerne <= aktivStjerne
                        ? "var(--color-primary)"
                        : undefined,
                  }}
                >
                  &#9733;
                </span>
              </button>
            ))}
          </div>
          {valgtStjerne !== null && (
            <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
              {valgtStjerne} av 5 stjerner
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Legg til kommentar (valgfritt)
          </label>
          <textarea
            value={kommentar}
            onChange={(e) => setKommentar(e.target.value)}
            rows={3}
            placeholder="Hva fungerte bra eller dårlig med forslaget?"
            className="w-full resize-none rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleLukk}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Hopp over
          </button>
          <button
            type="button"
            disabled={valgtStjerne === null}
            onClick={handleSend}
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send tilbakemelding
          </button>
        </div>
      </div>
    </div>
  )
}
