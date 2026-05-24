"use client"

import { useState } from "react"
import { X, Clock, Calendar, CheckCircle } from "lucide-react"

type Props = {
  open: boolean
  onClose: () => void
  coachId?: string
}

const SESSION_TYPER = [
  { id: "coaching", label: "Coaching-time", varighet: "60 min" },
  { id: "swing", label: "Swing-analyse", varighet: "45 min" },
  { id: "video", label: "Videovurdering", varighet: "online" },
] as const

const TIDSPUNKTER = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]

export function BookSessionModal({ open, onClose }: Props) {
  const [steg, setSteg] = useState(1)
  const [sessionType, setSessionType] = useState<string | null>(null)
  const [dato, setDato] = useState("")
  const [tid, setTid] = useState<string | null>(null)

  if (!open) return null

  function reset() {
    setSteg(1)
    setSessionType(null)
    setDato("")
    setTid(null)
  }

  function handleLukk() {
    reset()
    onClose()
  }

  function nesteSteg() {
    setSteg((s) => s + 1)
  }

  function forrigeSteg() {
    setSteg((s) => s - 1)
  }

  const valgtType = SESSION_TYPER.find((t) => t.id === sessionType)

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
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Steg {steg} av 3
          </span>
        </div>
        <h2 className="mb-6 text-xl font-semibold">Book økt</h2>

        {steg === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Velg type økt</p>
            {SESSION_TYPER.map((type) => (
              <label
                key={type.id}
                className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${
                  sessionType === type.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <input
                  type="radio"
                  name="sessionType"
                  value={type.id}
                  checked={sessionType === type.id}
                  onChange={() => setSessionType(type.id)}
                  className="accent-primary"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{type.label}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {type.varighet}
                </span>
              </label>
            ))}
            <button
              type="button"
              disabled={!sessionType}
              onClick={nesteSteg}
              className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Neste →
            </button>
          </div>
        )}

        {steg === 2 && (
          <div className="space-y-4">
            {valgtType && (
              <div className="rounded-md bg-secondary px-4 py-2 text-sm">
                <span className="font-medium">{valgtType.label}</span>
                <span className="ml-2 text-muted-foreground">({valgtType.varighet})</span>
              </div>
            )}
            <div>
              <label
                htmlFor="book-session-dato"
                className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
              >
                Velg dato
              </label>
              <input
                id="book-session-dato"
                type="date"
                value={dato}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDato(e.target.value)}
                className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={forrigeSteg}
                className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Tilbake
              </button>
              <button
                type="button"
                disabled={!dato}
                onClick={nesteSteg}
                className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Neste →
              </button>
            </div>
          </div>
        )}

        {steg === 3 && (
          <div className="space-y-4">
            {valgtType && dato && (
              <div className="rounded-md bg-secondary px-4 py-2 text-sm">
                <span className="font-medium">{valgtType.label}</span>
                <span className="ml-2 text-muted-foreground">
                  · {new Date(dato).toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>
            )}
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Velg tidspunkt
              </p>
              <div className="grid grid-cols-4 gap-2">
                {TIDSPUNKTER.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTid(t)}
                    className={`rounded-md border px-3 py-2 font-mono text-sm font-medium transition-colors ${
                      tid === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={forrigeSteg}
                className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Tilbake
              </button>
              <button
                type="button"
                disabled={!tid}
                onClick={handleLukk}
                className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Book økt →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
