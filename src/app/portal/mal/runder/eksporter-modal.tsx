"use client";

/**
 * Eksporter-runder-modal.
 * Migrert fra public/design/batch3/eksporter-runder-modal.html.
 */
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Download, FileText, Table, X, Check } from "lucide-react";
import { exportRounds } from "./actions";

type Format = "csv" | "pdf";
type Periode = "10" | "30d" | "90d" | "2026" | "custom";
type PdfStyle = "compact" | "detail" | "stats";

const PERIODE_OPTIONS: Array<{ id: Periode; label: string; count: string }> = [
  { id: "10", label: "Siste 10 runder", count: "10 runder" },
  { id: "30d", label: "Siste 30 dager", count: "8 runder" },
  { id: "90d", label: "Siste 90 dager", count: "23 runder" },
  { id: "2026", label: "Hele 2026", count: "47 runder" },
  { id: "custom", label: "Egendefinert intervall", count: "velg datoer" },
];

const ALL_COLS = [
  "Dato",
  "Bane",
  "Score",
  "FIR",
  "GIR",
  "Putts",
  "Vær",
  "Partnere",
  "Notater",
  "Coach-kommentar",
];

export function EksporterRunderModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>("pdf");
  const [periode, setPeriode] = useState<Periode>("2026");
  const [pdfStyle, setPdfStyle] = useState<PdfStyle>("stats");
  const [cols, setCols] = useState<string[]>(ALL_COLS.slice(0, 6));
  const [fromDate, setFromDate] = useState("2026-01-01");
  const [toDate, setToDate] = useState("2026-05-20");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  const counts: Record<Periode, number> = {
    "10": 10,
    "30d": 8,
    "90d": 23,
    "2026": 47,
    custom: 47,
  };
  const n = counts[periode];

  const previewFile = useMemo(() => {
    const periodSlug: Record<Periode, string> = {
      "10": "siste-10",
      "30d": "siste-30d",
      "90d": "siste-90d",
      "2026": "2026",
      custom: "egendefinert",
    };
    const styleSlug = format === "pdf" ? `-${pdfStyle}` : "";
    return `runder-${periodSlug[periode]}${styleSlug}.${format}`;
  }, [format, periode, pdfStyle]);

  const previewSize = useMemo(() => {
    if (format === "csv") {
      const kb = Math.max(1, Math.round(n * cols.length * 0.04));
      return `${n} rader · ${cols.length} kolonner · ~ ${kb} KB`;
    }
    const pages =
      pdfStyle === "compact" ? 1 : pdfStyle === "stats" ? 8 : n;
    const mb =
      pdfStyle === "stats"
        ? "2,1"
        : pdfStyle === "detail"
          ? (Math.round(n * 0.3 * 10) / 10).toString().replace(".", ",")
          : "0,6";
    return `${pages} side${pages !== 1 ? "r" : ""} · ~ ${mb} MB · ${n} runder`;
  }, [format, n, pdfStyle, cols.length]);

  function toggleCol(c: string) {
    setCols((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function lukk() {
    setOpen(false);
    setError(null);
  }

  function lastNed() {
    setError(null);
    startTransition(async () => {
      try {
        await exportRounds({
          format,
          periode,
          pdfStyle: format === "pdf" ? pdfStyle : undefined,
          cols: format === "csv" ? cols : undefined,
          fromDate: periode === "custom" ? fromDate : undefined,
          toDate: periode === "custom" ? toDate : undefined,
        });
        lukk();
      } catch {
        setError("Kunne ikke generere eksport. Prøv igjen.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/40"
      >
        <Download size={12} strokeWidth={1.75} /> Eksporter
      </button>

      <dialog
        ref={dialogRef}
        onClose={lukk}
        className="max-w-xl w-full rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40"
      >
        <header className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              PlayerHQ · Runder
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
              Eksporter <em className="italic text-primary">runder</em>
            </h2>
          </div>
          <button
            type="button"
            onClick={lukk}
            aria-label="Lukk"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </header>

        <div className="space-y-6 px-6 py-5 max-h-[70vh] overflow-y-auto">
          {/* Format */}
          <div>
            <Label>Format *</Label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <FormatCard
                icon={Table}
                name="CSV"
                sub="Råtall · Excel, Sheets"
                active={format === "csv"}
                onClick={() => setFormat("csv")}
              />
              <FormatCard
                icon={FileText}
                name="PDF rapport"
                sub="Print-ferdig · for coach"
                active={format === "pdf"}
                onClick={() => setFormat("pdf")}
              />
            </div>
          </div>

          {/* Periode */}
          <div>
            <Label>Periode *</Label>
            <div className="mt-2 grid grid-cols-1 gap-1">
              {PERIODE_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriode(p.id)}
                  className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left text-sm ${
                    periode === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      periode === p.id ? "border-primary" : "border-border"
                    }`}
                  >
                    {periode === p.id && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="flex-1 font-medium">{p.label}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {p.count}
                  </span>
                </button>
              ))}
            </div>
            {periode === "custom" && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    Fra
                  </span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    Til
                  </span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                  />
                </label>
              </div>
            )}
          </div>

          {/* CSV columns */}
          {format === "csv" && (
            <div>
              <Label>Kolonner</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ALL_COLS.map((c) => {
                  const on = cols.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCol(c)}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-xs ${
                        on
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                          on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                      >
                        {on && <Check size={10} strokeWidth={2.5} />}
                      </span>
                      <span className={on ? "text-foreground" : ""}>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PDF style */}
          {format === "pdf" && (
            <div>
              <Label>PDF-stil</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "compact", name: "Kompakt", sub: "1 side · alle runder" },
                    { id: "detail", name: "Detaljert", sub: "1 side per runde" },
                    { id: "stats", name: "Statistikk", sub: "rapport · 8 sider" },
                  ] as Array<{ id: PdfStyle; name: string; sub: string }>
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPdfStyle(s.id)}
                    className={`rounded-md border p-3 text-center ${
                      pdfStyle === s.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="mx-auto mb-2 h-10 w-8 rounded-sm border border-border bg-background" />
                    <div className="font-display text-xs font-semibold">
                      {s.name}
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground">
                      {s.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview block */}
          <div className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <FileText size={14} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] opacity-80">
                Genererer
              </div>
              <div className="mt-1 truncate font-mono text-sm font-semibold">
                {previewFile}
              </div>
              <div className="mt-0.5 font-mono text-[11px] opacity-80 tabular-nums">
                {previewSize}
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border bg-card px-6 py-4">
          <button
            type="button"
            onClick={lukk}
            disabled={pending}
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={lastNed}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Download size={13} strokeWidth={2} />
            {pending ? "Genererer…" : "Last ned"}
          </button>
        </footer>
      </dialog>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
      {children}
    </div>
  );
}

function FormatCard({
  icon: Icon,
  name,
  sub,
  active,
  onClick,
}: {
  icon: typeof Table;
  name: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-start gap-3 rounded-lg border p-4 text-left ${
        active ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      {active && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check size={11} strokeWidth={2.5} />
        </span>
      )}
      <Icon size={20} strokeWidth={1.5} className="text-primary" />
      <div>
        <div className="font-display text-sm font-semibold">{name}</div>
        <div className="font-mono text-[10px] text-muted-foreground">{sub}</div>
      </div>
    </button>
  );
}
