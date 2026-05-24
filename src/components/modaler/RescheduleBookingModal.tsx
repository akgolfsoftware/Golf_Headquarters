"use client"

import { useState } from "react"
import { X, CalendarClock, AlertCircle } from "lucide-react"

type Props = {
  open: boolean
  onClose: () => void
  bookingId: string
  currentDate: string
}

const TIDSPUNKTER = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]

export function RescheduleBookingModal({ open, onClose, currentDate }: Props) {
  const [nyDato, setNyDato] = useState("")
  const [nyTid, setNyTid] = useState<string | null>(null)

  if (!open) return null

  function handleLukk() {
    setNyDato("")
    setNyTid(null)
    onClose()
  }

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
          <CalendarClock className="h-4 w-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Endre booking
          </span>
        </div>
        <h2 className="mb-6 text-xl font-semibold">Endre tidspunkt</h2>

        <div className="mb-6 rounded-md bg-secondary px-4 py-3 text-sm">
          <p className="text-xs text-muted-foreground">Nåværende</p>
          <p className="mt-0.5 font-medium">{currentDate}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="reschedule-ny-dato"
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              Ny dato
            </label>
            <input
              id="reschedule-ny-dato"
              type="date"
              value={nyDato}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setNyDato(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Nytt tidspunkt
            </p>
            <div className="grid grid-cols-4 gap-2">
              {TIDSPUNKTER.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNyTid(t)}
                  className={`rounded-md border px-3 py-2 font-mono text-sm font-medium transition-colors ${
                    nyTid === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 px-4 py-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Gratis endring inntil 24 timer før. Etter det brukes én kredit.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleLukk}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Avbryt
          </button>
          <button
            type="button"
            disabled={!nyDato || !nyTid}
            onClick={handleLukk}
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bekreft ny tid →
          </button>
        </div>
      </div>
    </div>
  )
}
