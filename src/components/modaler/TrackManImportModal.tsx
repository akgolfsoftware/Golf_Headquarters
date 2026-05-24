"use client"

import { useState, useRef } from "react"
import { X, UploadCloud } from "lucide-react"

type Props = {
  open: boolean
  onClose: () => void
  onImported?: () => void
}

type Fane = "html" | "csv"

export function TrackManImportModal({ open, onClose, onImported }: Props) {
  const [aktivFane, setAktivFane] = useState<Fane>("html")
  const [valgtFil, setValgtFil] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  function handleLukk() {
    setValgtFil(null)
    setDragOver(false)
    onClose()
  }

  function handleLastOpp() {
    if (!valgtFil) return
    onImported?.()
    handleLukk()
  }

  function handleFilValg(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0] ?? null
    setValgtFil(fil)
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragOver(false)
    const fil = e.dataTransfer.files[0] ?? null
    setValgtFil(fil)
  }

  const accept = aktivFane === "html" ? ".html" : ".csv"
  const tips =
    aktivFane === "html"
      ? "HTML: eksporter fra TrackMan Performance Studio."
      : "CSV: fil → eksporter med alle kolonner."

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleLukk}
      />
      <div className="relative z-10 w-full max-h-[95vh] overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-xl sm:p-6">
        <button
          type="button"
          onClick={handleLukk}
          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground sm:h-9 sm:w-9"
          aria-label="Lukk"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-1 flex items-center gap-2">
          <UploadCloud className="h-4 w-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            TrackMan
          </span>
        </div>
        <h2 className="mb-6 text-xl font-semibold">Importer TrackMan-økt</h2>

        {/* Faner */}
        <div className="mb-6 flex gap-1 rounded-md border border-border bg-secondary p-1">
          {(["html", "csv"] as const).map((fane) => (
            <button
              key={fane}
              type="button"
              onClick={() => {
                setAktivFane(fane)
                setValgtFil(null)
              }}
              className={`flex-1 rounded px-4 py-1.5 text-sm font-medium transition-colors ${
                aktivFane === fane
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {fane === "html" ? "HTML-rapport" : "CSV-fil"}
            </button>
          ))}
        </div>

        {/* Drop-zone */}
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : valgtFil
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary"
          }`}
        >
          <UploadCloud
            className={`h-8 w-8 ${valgtFil ? "text-primary" : "text-muted-foreground"}`}
          />
          {valgtFil ? (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{valgtFil.name}</p>
              <p className="text-xs text-muted-foreground">
                {(valgtFil.size / 1024).toFixed(0)} KB
              </p>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Dra {aktivFane.toUpperCase()}-fil hit eller{" "}
              <span className="text-primary underline">klikk for å velge</span>
            </p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFilValg}
            className="sr-only"
          />
        </label>

        <p className="mt-3 font-mono text-[10px] text-muted-foreground">{tips}</p>

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
            disabled={!valgtFil}
            onClick={handleLastOpp}
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Last opp
          </button>
        </div>
      </div>
    </div>
  )
}
