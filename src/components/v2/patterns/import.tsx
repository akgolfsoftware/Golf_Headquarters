"use client";

/**
 * ImportPattern — 3-step generic data import wizard.
 *
 * Step 1: File upload (drag/drop + click)
 * Step 2: Preview + row-level validation
 * Step 3: Commit options + success state
 */

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Check,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

// ── Public types ─────────────────────────────────────────────────

export type ImportColumn = {
  key: string;
  label: string;
  required: boolean;
};

export type ImportRow = {
  __row: number;
  __status: "OK" | "WARNING" | "ERROR";
  __errors: string[];
  [key: string]: unknown;
};

export type ImportPatternProps = {
  title: string;
  description?: string;
  columns: ImportColumn[];
  templateUrl?: string;
  onUpload?: (file: File) => Promise<ImportRow[]>;
  onCommit?: (
    rows: ImportRow[],
    options: { mode: "replace" | "skip" | "create-only"; sendWelcome: boolean }
  ) => Promise<void>;
};

// ── Internal types ───────────────────────────────────────────────

type CommitOptions = {
  mode: "replace" | "skip" | "create-only";
  sendWelcome: boolean;
};

type ImportState =
  | { phase: "idle" }
  | { phase: "uploading" }
  | { phase: "committing" }
  | { phase: "done"; count: number };

// ── Step definitions ─────────────────────────────────────────────

const STEPS = ["Last opp", "Forhåndsvisning", "Importer"] as const;
type StepIndex = 0 | 1 | 2;

// ── Stepper UI ───────────────────────────────────────────────────

function Stepper({
  current,
  completed,
}: {
  current: StepIndex;
  completed: boolean[];
}) {
  return (
    <div className="flex items-center gap-0" role="list" aria-label="Importsteg">
      {STEPS.map((label, idx) => {
        const isDone = completed[idx] ?? false;
        const isCurrent = current === idx;
        const isFuture = !isDone && !isCurrent;

        return (
          <div key={label} className="flex items-center" role="listitem">
            {/* Circle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex items-center justify-center rounded-full font-mono text-[11px] font-bold"
                style={{
                  width: 32,
                  height: 32,
                  background: isDone
                    ? "hsl(var(--accent))"
                    : isCurrent
                      ? "hsl(var(--primary))"
                      : "color-mix(in oklab, hsl(var(--foreground)) 8%, transparent)",
                  color: isDone
                    ? "hsl(var(--accent-foreground))"
                    : isCurrent
                      ? "hsl(var(--primary-foreground))"
                      : "hsl(var(--muted-foreground))",
                  outline: isCurrent
                    ? "2px solid hsl(var(--accent))"
                    : "none",
                  outlineOffset: 2,
                  transition: "background 300ms, outline 300ms",
                  flexShrink: 0,
                }}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isDone ? <Check size={15} strokeWidth={2.5} /> : idx + 1}
              </div>
              <span
                className="font-mono text-[10px] uppercase tracking-[0.10em] whitespace-nowrap"
                style={{
                  color: isFuture
                    ? "hsl(var(--muted-foreground))"
                    : "hsl(var(--foreground))",
                  fontWeight: isCurrent ? 700 : 500,
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector line (not after last) */}
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  height: 2,
                  width: 64,
                  marginBottom: 22,
                  background: completed[idx]
                    ? "hsl(var(--accent))"
                    : "color-mix(in oklab, hsl(var(--foreground)) 10%, transparent)",
                  transition: "background 300ms",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Row status badge ─────────────────────────────────────────────

function RowStatusBadge({ status }: { status: ImportRow["__status"] }) {
  const cfg = {
    OK: {
      icon: <Check size={13} strokeWidth={2.5} />,
      bg: "color-mix(in oklab, hsl(var(--success)) 14%, transparent)",
      color: "hsl(var(--success))",
      label: "OK",
    },
    WARNING: {
      icon: <AlertTriangle size={13} strokeWidth={2} />,
      bg: "color-mix(in oklab, hsl(var(--warning)) 14%, transparent)",
      color: "hsl(var(--warning))",
      label: "Advarsel",
    },
    ERROR: {
      icon: <X size={13} strokeWidth={2.5} />,
      bg: "color-mix(in oklab, hsl(var(--destructive)) 14%, transparent)",
      color: "hsl(var(--destructive))",
      label: "Feil",
    },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.08em]"
      style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px" }}
      aria-label={cfg.label}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── Step 1: Upload ───────────────────────────────────────────────

function StepUpload({
  file,
  templateUrl,
  onFileSelect,
  loading,
}: {
  file: File | null;
  templateUrl?: string;
  onFileSelect: (f: File) => void;
  loading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFileSelect(dropped);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) onFileSelect(f);
    },
    [onFileSelect]
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Drop-zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label="Velg eller slipp fil her"
        className="flex flex-col items-center justify-center gap-4 rounded-[20px] border-2 border-dashed cursor-pointer text-center w-full"
        style={{
          borderColor: dragging
            ? "hsl(var(--accent))"
            : file
              ? "hsl(var(--primary))"
              : "hsl(var(--border))",
          background: dragging
            ? "color-mix(in oklab, hsl(var(--accent)) 5%, transparent)"
            : file
              ? "color-mix(in oklab, hsl(var(--primary)) 4%, transparent)"
              : "color-mix(in oklab, hsl(var(--foreground)) 2%, transparent)",
          padding: "48px 32px",
          transition: "border-color 200ms, background 200ms",
          minHeight: 240,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="sr-only"
          onChange={handleInputChange}
          aria-hidden
          tabIndex={-1}
        />

        {loading ? (
          <Loader2
            size={40}
            className="animate-spin"
            style={{ color: "hsl(var(--primary))" }}
          />
        ) : file ? (
          <FileSpreadsheet
            size={40}
            style={{ color: "hsl(var(--primary))" }}
          />
        ) : (
          <Upload size={40} style={{ color: "hsl(var(--muted-foreground))" }} />
        )}

        {file ? (
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-display text-xl font-bold tracking-[-0.02em] text-foreground"
            >
              {file.name}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.10em]">
              {(file.size / 1024).toFixed(0)} KB · Klikk for å bytte fil
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-display text-xl font-bold tracking-[-0.02em] text-foreground"
            >
              Slipp filen her
            </span>
            <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.10em]">
              eller klikk for å bla
            </span>
          </div>
        )}
      </button>

      {/* File-type info + template */}
      <div className="flex flex-col gap-4">
        <div
          className="rounded-[12px] border flex items-center gap-4 px-4 py-2"
          style={{
            borderColor: "hsl(var(--border))",
            background:
              "color-mix(in oklab, hsl(var(--foreground)) 2%, transparent)",
          }}
        >
          <FileSpreadsheet
            size={18}
            style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }}
          />
          <span className="font-mono text-[12px] text-muted-foreground">
            Aksepterte filtyper: <strong className="text-foreground">CSV</strong>
            ,{" "}
            <strong className="text-foreground">XLSX</strong> — maks 10 MB.
            Første rad skal inneholde kolonnenavn.
          </span>
        </div>

        {templateUrl && (
          <a
            href={templateUrl}
            download
            className="inline-flex items-center gap-2 self-start no-underline rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.10em]"
            style={{
              color: "hsl(var(--primary))",
              padding: "8px 16px",
              background:
                "color-mix(in oklab, hsl(var(--primary)) 8%, transparent)",
            }}
          >
            <Download size={14} />
            Last ned mal-fil
          </a>
        )}
      </div>
    </div>
  );
}

// ── Step 2: Preview / Validation ─────────────────────────────────

function StepPreview({
  columns,
  rows,
}: {
  columns: ImportColumn[];
  rows: ImportRow[];
}) {
  const [onlyErrors, setOnlyErrors] = useState(false);

  const okCount = rows.filter((r) => r.__status === "OK").length;
  const warnCount = rows.filter((r) => r.__status === "WARNING").length;
  const errCount = rows.filter((r) => r.__status === "ERROR").length;

  const visibleRows = onlyErrors
    ? rows.filter((r) => r.__status !== "OK")
    : rows;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <div
        className="flex flex-wrap items-center gap-4 rounded-[12px] border px-4 py-2"
        style={{
          borderColor:
            errCount > 0
              ? "color-mix(in oklab, hsl(var(--destructive)) 30%, transparent)"
              : warnCount > 0
                ? "color-mix(in oklab, hsl(var(--warning)) 30%, transparent)"
                : "color-mix(in oklab, hsl(var(--success)) 30%, transparent)",
          background:
            errCount > 0
              ? "color-mix(in oklab, hsl(var(--destructive)) 5%, transparent)"
              : warnCount > 0
                ? "color-mix(in oklab, hsl(var(--warning)) 5%, transparent)"
                : "color-mix(in oklab, hsl(var(--success)) 5%, transparent)",
        }}
        role="status"
        aria-live="polite"
      >
        <span className="font-mono text-[12px] font-bold text-foreground">
          {okCount} rader OK
        </span>
        {warnCount > 0 && (
          <span
            className="font-mono text-[12px] font-bold"
            style={{ color: "hsl(var(--warning))" }}
          >
            {warnCount} advarsler
          </span>
        )}
        {errCount > 0 && (
          <span
            className="font-mono text-[12px] font-bold"
            style={{ color: "hsl(var(--destructive))" }}
          >
            {errCount} feil
          </span>
        )}

        {/* Spacer */}
        <span className="flex-1" />

        {/* Filter toggle */}
        <button
          type="button"
          onClick={() => setOnlyErrors((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.10em] cursor-pointer border"
          style={{
            background: onlyErrors
              ? "hsl(var(--primary))"
              : "transparent",
            color: onlyErrors
              ? "hsl(var(--primary-foreground))"
              : "hsl(var(--foreground))",
            borderColor: onlyErrors ? "transparent" : "hsl(var(--border))",
            padding: "6px 14px",
            transition: "background 200ms, color 200ms",
          }}
          aria-pressed={onlyErrors}
        >
          <Filter size={12} />
          Vis kun feil
        </button>
      </div>

      {/* Table */}
      <div
        className="overflow-auto rounded-[16px] border"
        style={{ borderColor: "hsl(var(--border))", maxHeight: 400 }}
      >
        <table className="w-full border-collapse text-left">
          <thead>
            <tr
              style={{
                background:
                  "color-mix(in oklab, hsl(var(--foreground)) 4%, transparent)",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <th
                className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
                style={{ padding: "10px 12px", width: 48 }}
              >
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
                  style={{ padding: "10px 12px", whiteSpace: "nowrap" }}
                >
                  {col.label}
                  {col.required && (
                    <span
                      style={{
                        color: "hsl(var(--destructive))",
                        marginLeft: 4,
                      }}
                      aria-label="Obligatorisk"
                    >
                      *
                    </span>
                  )}
                </th>
              ))}
              <th
                className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
                style={{ padding: "10px 12px", whiteSpace: "nowrap" }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="text-center font-mono text-[12px] text-muted-foreground"
                  style={{ padding: "32px 16px" }}
                >
                  Ingen rader matcher filteret
                </td>
              </tr>
            )}
            {visibleRows.map((row, idx) => (
              <tr
                key={row.__row}
                style={{
                  borderTop: "1px solid hsl(var(--border))",
                  background:
                    row.__status === "ERROR"
                      ? "color-mix(in oklab, hsl(var(--destructive)) 4%, transparent)"
                      : row.__status === "WARNING"
                        ? "color-mix(in oklab, hsl(var(--warning)) 4%, transparent)"
                        : idx % 2 === 1
                          ? "color-mix(in oklab, hsl(var(--foreground)) 2%, transparent)"
                          : "transparent",
                }}
              >
                <td
                  className="font-mono text-[11px] text-muted-foreground tabular-nums"
                  style={{ padding: "10px 12px" }}
                >
                  {row.__row}
                </td>
                {columns.map((col) => {
                  const val = row[col.key];
                  return (
                    <td
                      key={col.key}
                      className="font-mono text-[12px] text-foreground"
                      style={{ padding: "10px 12px", whiteSpace: "nowrap" }}
                    >
                      {val === null || val === undefined || val === "" ? (
                        <span className="text-muted-foreground italic">—</span>
                      ) : (
                        String(val)
                      )}
                    </td>
                  );
                })}
                <td style={{ padding: "10px 12px" }}>
                  <div className="flex flex-col gap-1 items-start">
                    <RowStatusBadge status={row.__status} />
                    {row.__errors.length > 0 && (
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: "hsl(var(--destructive))" }}
                      >
                        {row.__errors.join(" · ")}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Step 3: Commit ───────────────────────────────────────────────

function StepCommit({
  rows,
  options,
  onChange,
}: {
  rows: ImportRow[];
  options: CommitOptions;
  onChange: (o: CommitOptions) => void;
}) {
  const okAndWarn = rows.filter((r) => r.__status !== "ERROR").length;
  const errCount = rows.filter((r) => r.__status === "ERROR").length;

  const MODE_OPTIONS: {
    value: CommitOptions["mode"];
    label: string;
    description: string;
  }[] = [
    {
      value: "skip",
      label: "Hopp over duplikater",
      description: "Eksisterende spillere berøres ikke — bare nye opprettes.",
    },
    {
      value: "replace",
      label: "Erstatt eksisterende",
      description:
        "Duplikater overskrives med data fra filen (basert på e-post).",
    },
    {
      value: "create-only",
      label: "Bare nye",
      description: "Importer kun spillere som ikke finnes fra før.",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Summary */}
      <div
        className="rounded-[16px] border flex flex-col gap-2 px-6 py-6"
        style={{
          borderColor:
            "color-mix(in oklab, hsl(var(--primary)) 20%, transparent)",
          background:
            "color-mix(in oklab, hsl(var(--primary)) 4%, transparent)",
        }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Oppsummering
        </span>
        <p
          className="m-0 font-display text-2xl font-bold tracking-[-0.02em] text-foreground"
          role="status"
        >
          {okAndWarn} nye spillere vil bli importert
        </p>
        {errCount > 0 && (
          <p
            className="m-0 font-mono text-[12px]"
            style={{ color: "hsl(var(--destructive))" }}
          >
            {errCount} rad{errCount !== 1 ? "er" : ""} med feil hoppes over
          </p>
        )}
      </div>

      {/* Mode options */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.10em] font-bold text-muted-foreground">
          Handlingsvalg for duplikater
        </span>
        {MODE_OPTIONS.map((opt) => {
          const isSelected = options.mode === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...options, mode: opt.value })}
              className="flex items-start gap-4 rounded-[12px] border text-left cursor-pointer w-full"
              style={{
                padding: "14px 16px",
                borderColor: isSelected
                  ? "hsl(var(--primary))"
                  : "hsl(var(--border))",
                background: isSelected
                  ? "color-mix(in oklab, hsl(var(--primary)) 6%, transparent)"
                  : "transparent",
                transition: "border-color 200ms, background 200ms",
              }}
              role="radio"
              aria-checked={isSelected}
            >
              {/* Radio dot */}
              <div
                className="mt-[2px] flex-shrink-0 rounded-full flex items-center justify-center"
                style={{
                  width: 18,
                  height: 18,
                  border: `2px solid ${isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                  background: isSelected ? "hsl(var(--primary))" : "transparent",
                  transition: "border-color 200ms, background 200ms",
                }}
              >
                {isSelected && (
                  <div
                    className="rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background: "hsl(var(--primary-foreground))",
                    }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="font-mono text-[13px] font-bold text-foreground">
                  {opt.label}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {opt.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Notification settings */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.10em] font-bold text-muted-foreground">
          Varsling
        </span>
        <button
          type="button"
          onClick={() =>
            onChange({ ...options, sendWelcome: !options.sendWelcome })
          }
          className="flex items-center gap-4 rounded-[12px] border text-left cursor-pointer w-full"
          style={{
            padding: "14px 16px",
            borderColor: options.sendWelcome
              ? "hsl(var(--primary))"
              : "hsl(var(--border))",
            background: options.sendWelcome
              ? "color-mix(in oklab, hsl(var(--primary)) 6%, transparent)"
              : "transparent",
            transition: "border-color 200ms, background 200ms",
          }}
          role="checkbox"
          aria-checked={options.sendWelcome}
        >
          {/* Toggle */}
          <div
            className="relative flex-shrink-0 rounded-full"
            style={{
              width: 40,
              height: 22,
              background: options.sendWelcome
                ? "hsl(var(--primary))"
                : "color-mix(in oklab, hsl(var(--foreground)) 15%, transparent)",
              transition: "background 200ms",
            }}
          >
            <div
              className="absolute top-[3px] rounded-full"
              style={{
                width: 16,
                height: 16,
                background: "white",
                left: options.sendWelcome ? 21 : 3,
                transition: "left 200ms",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </div>
          <div className="flex flex-col gap-[2px]">
            <span className="font-mono text-[13px] font-bold text-foreground">
              Send velkomst-e-post
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              Nye spillere får invitasjons-e-post med innloggingslink
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Success state ────────────────────────────────────────────────

function SuccessState({
  count,
  onReset,
}: {
  count: number;
  onReset: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-8 py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 80,
          height: 80,
          background: "color-mix(in oklab, hsl(var(--accent)) 15%, transparent)",
        }}
      >
        <CheckCircle2
          size={44}
          strokeWidth={1.75}
          style={{ color: "hsl(var(--primary))" }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="m-0 font-display text-3xl font-bold tracking-[-0.03em] text-foreground">
          Import fullført
        </h2>
        <p className="m-0 font-mono text-[13px] text-muted-foreground">
          {count} spiller{count !== 1 ? "e" : ""} ble importert
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href="/admin/stall"
          className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] no-underline"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            padding: "12px 24px",
          }}
        >
          <ExternalLink size={14} />
          Se importerte spillere
        </a>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0"
          style={{
            background:
              "color-mix(in oklab, hsl(var(--foreground)) 8%, transparent)",
            color: "hsl(var(--foreground))",
            padding: "12px 24px",
          }}
        >
          Importer flere
        </button>
      </div>
    </div>
  );
}

// ── Sticky CTA bar ───────────────────────────────────────────────

function CtaBar({
  step,
  canAdvance,
  loading,
  hasErrors,
  onBack,
  onNext,
  onCommit,
}: {
  step: StepIndex;
  canAdvance: boolean;
  loading: boolean;
  hasErrors: boolean;
  onBack: () => void;
  onNext: () => void;
  onCommit: () => void;
}) {
  return (
    <div
      className="sticky bottom-0 left-0 right-0 flex items-center justify-between gap-4 px-6 py-4 border-t"
      style={{
        background: "hsl(var(--card))",
        borderColor: "hsl(var(--border))",
        zIndex: 10,
      }}
    >
      {/* Left: Back button */}
      <div>
        {step > 0 && (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] cursor-pointer border"
            style={{
              padding: "10px 20px",
              borderColor: "hsl(var(--border))",
              background: "transparent",
              color: "hsl(var(--foreground))",
              opacity: loading ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={15} />
            Tilbake
          </button>
        )}
      </div>

      {/* Right: primary action */}
      <div className="flex items-center gap-4">
        {step === 1 && hasErrors && (
          <span
            className="font-mono text-[11px]"
            style={{ color: "hsl(var(--destructive))" }}
          >
            Feil-rader hoppes over
          </span>
        )}

        {step < 2 ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!canAdvance || loading}
            className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0"
            style={{
              padding: "10px 24px",
              background:
                canAdvance && !loading
                  ? "hsl(var(--primary))"
                  : "color-mix(in oklab, hsl(var(--foreground)) 10%, transparent)",
              color:
                canAdvance && !loading
                  ? "hsl(var(--primary-foreground))"
                  : "hsl(var(--muted-foreground))",
              cursor: canAdvance && !loading ? "pointer" : "not-allowed",
              transition: "background 200ms, color 200ms",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Analyserer …
              </>
            ) : (
              <>
                Neste
                <ChevronRight size={15} />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onCommit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full font-mono text-[13px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0"
            style={{
              padding: "12px 28px",
              background: loading
                ? "color-mix(in oklab, hsl(var(--primary)) 60%, transparent)"
                : "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              cursor: loading ? "wait" : "pointer",
              transition: "background 200ms",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Importerer …
              </>
            ) : (
              "Importer nå"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

export default function ImportPattern({
  title,
  description,
  columns,
  templateUrl,
  onUpload,
  onCommit,
}: ImportPatternProps) {
  const [step, setStep] = useState<StepIndex>(0);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false]);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [commitOptions, setCommitOptions] = useState<CommitOptions>({
    mode: "skip",
    sendWelcome: true,
  });
  const [importState, setImportState] = useState<ImportState>({
    phase: "idle",
  });

  const isLoading =
    importState.phase === "uploading" || importState.phase === "committing";

  // ── File selected: parse immediately if onUpload provided ──
  const handleFileSelect = useCallback(
    async (f: File) => {
      setFile(f);
      if (!onUpload) return; // wait for "Neste"

      setImportState({ phase: "uploading" });
      try {
        const parsed = await onUpload(f);
        setRows(parsed);
        setImportState({ phase: "idle" });
      } catch {
        setImportState({ phase: "idle" });
      }
    },
    [onUpload]
  );

  // ── Advance step ──────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (step === 0) {
      // If we haven't parsed yet (no onUpload or file just chosen)
      if (onUpload && file && rows.length === 0) {
        setImportState({ phase: "uploading" });
        try {
          const parsed = await onUpload(file);
          setRows(parsed);
        } catch {
          // keep on step 0
          setImportState({ phase: "idle" });
          return;
        }
        setImportState({ phase: "idle" });
      }
      setCompleted((c) => {
        const next = [...c];
        next[0] = true;
        return next;
      });
      setStep(1);
    } else if (step === 1) {
      setCompleted((c) => {
        const next = [...c];
        next[1] = true;
        return next;
      });
      setStep(2);
    }
  }, [step, file, rows, onUpload]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => (s - 1) as StepIndex);
  }, [step]);

  // ── Commit ───────────────────────────────────────────────────
  const handleCommit = useCallback(async () => {
    const importableRows = rows.filter((r) => r.__status !== "ERROR");
    setImportState({ phase: "committing" });
    try {
      if (onCommit) {
        await onCommit(importableRows, commitOptions);
      }
      setCompleted([true, true, true]);
      setImportState({ phase: "done", count: importableRows.length });
    } catch {
      setImportState({ phase: "idle" });
    }
  }, [rows, commitOptions, onCommit]);

  // ── Reset ────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setStep(0);
    setCompleted([false, false, false]);
    setFile(null);
    setRows([]);
    setCommitOptions({ mode: "skip", sendWelcome: true });
    setImportState({ phase: "idle" });
  }, []);

  // ── Derived ──────────────────────────────────────────────────
  const canAdvance =
    step === 0
      ? file !== null
      : step === 1
        ? rows.length > 0
        : false;

  const hasErrors = rows.some((r) => r.__status === "ERROR");
  const isDone = importState.phase === "done";

  return (
    <div
      className="flex flex-col overflow-hidden rounded-[20px] border"
      style={{
        borderColor: "hsl(var(--border))",
        background: "hsl(var(--card))",
        boxShadow: "var(--shadow-card, 0 2px 16px rgba(0,0,0,0.06))",
        minHeight: 520,
      }}
    >
      {/* Header */}
      <div
        className="flex flex-col gap-4 px-6 pt-6 pb-6 border-b"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <div className="flex flex-col gap-[2px]">
          <h1 className="m-0 font-display text-2xl font-bold tracking-[-0.03em] text-foreground">
            {title}
          </h1>
          {description && (
            <p className="m-0 font-mono text-[12px] text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Stepper — hidden when done */}
        {!isDone && (
          <div className="overflow-x-auto pb-1">
            <Stepper current={step} completed={completed} />
          </div>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isDone && importState.phase === "done" ? (
          <SuccessState count={importState.count} onReset={handleReset} />
        ) : step === 0 ? (
          <StepUpload
            file={file}
            templateUrl={templateUrl}
            onFileSelect={handleFileSelect}
            loading={importState.phase === "uploading"}
          />
        ) : step === 1 ? (
          <StepPreview columns={columns} rows={rows} />
        ) : (
          <StepCommit
            rows={rows}
            options={commitOptions}
            onChange={setCommitOptions}
          />
        )}
      </div>

      {/* Sticky CTA bar — hidden when done */}
      {!isDone && (
        <CtaBar
          step={step}
          canAdvance={canAdvance}
          loading={isLoading}
          hasErrors={hasErrors}
          onBack={handleBack}
          onNext={handleNext}
          onCommit={handleCommit}
        />
      )}
    </div>
  );
}
