"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importTrackManHtml } from "./actions";
import type { TrackManEnvironment } from "./actions";
import { ENVIRONMENT_OPTIONS } from "@/lib/sg-hub/environment-labels";

export function HtmlImportModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [recordedAt, setRecordedAt] = useState(today);
  const [environment, setEnvironment] = useState<TrackManEnvironment>("SIMULATOR_INDOOR");
  const [filename, setFilename] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lukk() {
    setOpen(false);
    setFilename(null);
    setHtmlContent("");
    setEnvironment("SIMULATOR_INDOOR");
    setError(null);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    setFilename(fil.name);
    const text = await fil.text();
    setHtmlContent(text);
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!htmlContent) {
      setError("Velg en HTML-fil først.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await importTrackManHtml({ recordedAt, htmlContent, environment });
        lukk();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke importere.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        Last opp HTML-rapport
      </button>

      <dialog
        ref={dialogRef}
        onClose={lukk}
        className="rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 max-w-lg w-full"
      >
        <form onSubmit={lagre} className="p-6">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Importer</em> Multi Group-rapport
          </h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Lagre rapporten som HTML fra TrackMan-nettleseren og last opp her.
            Alle køllegrupper med slag, snitt og konsistens blir automatisk tolket.
          </p>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Dato for økt
              </span>
              <input
                type="date"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Treningsmiljø
              </span>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as TrackManEnvironment)}
                required
                className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                {ENVIRONMENT_OPTIONS.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                HTML-fil (Multi Group Report)
              </span>
              <input
                type="file"
                accept=".html,text/html"
                onChange={handleFile}
                required
                className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-secondary-foreground"
              />
              {filename && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  Valgt: {filename}
                </span>
              )}
            </label>

            <div className="rounded-md bg-secondary px-4 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Slik eksporterer du fra TrackMan:</strong>
              <br />
              Åpne rapporten i nettleseren → Fil → Lagre som → Nettside, bare HTML
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={lukk}
              disabled={pending}
              className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-border"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Importerer…" : "Importer"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
