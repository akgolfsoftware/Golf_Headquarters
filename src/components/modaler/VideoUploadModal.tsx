"use client"

import { useState, useRef } from "react"
import { X, Video, UploadCloud, Play } from "lucide-react"

type Props = {
  open: boolean
  onClose: () => void
  shotId?: number
}

export function VideoUploadModal({ open, onClose, shotId }: Props) {
  const [valgtFil, setValgtFil] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  function handleLukk() {
    setValgtFil(null)
    setVideoUrl("")
    setDragOver(false)
    onClose()
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

  const harInnhold = valgtFil !== null || videoUrl.trim().length > 0
  const visPreview = harInnhold

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleLukk}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
        <button
          type="button"
          onClick={handleLukk}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Lukk"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-1 flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {shotId !== undefined ? `Slag #${shotId}` : "Videoklipp"}
          </span>
        </div>
        <h2 className="mb-6 text-xl font-semibold">Last opp videoklipp</h2>

        {/* Drop-zone */}
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : valgtFil
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary"
          }`}
        >
          <Video
            className={`h-8 w-8 ${valgtFil ? "text-primary" : "text-muted-foreground"}`}
          />
          {valgtFil ? (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{valgtFil.name}</p>
              <p className="text-xs text-muted-foreground">
                {(valgtFil.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Dra videofil hit eller{" "}
              <span className="text-primary underline">klikk for å velge</span>
            </p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".mp4,.mov,.avi,video/*"
            onChange={handleFilValg}
            className="sr-only"
          />
        </label>

        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          Støttede formater: MP4, MOV, AVI. Maks 500 MB.
        </p>

        {/* URL-alternativ */}
        <div className="mt-4">
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Eller lim inn video-URL
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {/* Thumbnail-preview */}
        {visPreview && (
          <div className="mt-4">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Forhåndsvisning
            </p>
            <div className="flex items-center justify-center rounded-lg bg-muted/50 border border-border" style={{ height: "120px" }}>
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Play className="h-5 w-5" />
                </div>
                <p className="text-xs">
                  {valgtFil ? valgtFil.name : "Video-URL"}
                </p>
              </div>
            </div>
          </div>
        )}

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
            disabled={!harInnhold}
            onClick={handleLukk}
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Last opp
          </button>
        </div>
      </div>
    </div>
  )
}
