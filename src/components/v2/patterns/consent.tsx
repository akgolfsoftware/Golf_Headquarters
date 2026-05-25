"use client";

import { useState } from "react";
import { CheckCircle, Square, CheckSquare } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

export type ConsentItem = {
  id: string;
  title: string;
  body: string;
  subItems?: string[];
  required: boolean;
  accepted: boolean;
};

export type ConsentPatternProps = {
  eyebrow: string;
  title: string;
  lead: string;
  items: ConsentItem[];
  signatureLabel?: string;
  onItemChange?: (id: string, accepted: boolean) => void;
  onSubmit?: (signature: string, items: ConsentItem[]) => void;
  submitLabel?: string;
};

// ── Required badge ───────────────────────────────────────────────

function RequiredPill() {
  return (
    <span
      className="inline-flex items-center rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.1em]"
      style={{
        padding: "3px 10px",
        background: "color-mix(in oklab, hsl(var(--destructive)) 10%, transparent)",
        color: "hsl(var(--destructive))",
      }}
      aria-hidden="true"
    >
      Obligatorisk
    </span>
  );
}

// ── Single consent item card ─────────────────────────────────────

type ConsentItemCardProps = {
  item: ConsentItem;
  onChange: (id: string, accepted: boolean) => void;
  showHint: boolean;
};

function ConsentItemCard({ item, onChange, showHint }: ConsentItemCardProps) {
  const CheckIcon = item.accepted ? CheckSquare : Square;
  const missingRequired = showHint && item.required && !item.accepted;

  return (
    <div
      className="rounded-[20px] border"
      style={{
        background: "hsl(var(--card))",
        borderColor: missingRequired
          ? "hsl(var(--destructive))"
          : item.accepted
            ? "color-mix(in oklab, hsl(var(--accent)) 40%, transparent)"
            : "hsl(var(--border))",
        padding: 24,
        transition: "border-color 200ms ease",
      }}
    >
      <label
        className="flex cursor-pointer items-start gap-4"
        htmlFor={`consent-${item.id}`}
      >
        {/* Checkbox */}
        <div className="mt-[2px] flex-shrink-0">
          <input
            type="checkbox"
            id={`consent-${item.id}`}
            checked={item.accepted}
            onChange={(e) => onChange(item.id, e.target.checked)}
            className="sr-only"
            aria-required={item.required}
            aria-label={`${item.title}${item.required ? " — obligatorisk" : ""}`}
          />
          <CheckIcon
            size={24}
            aria-hidden="true"
            style={{
              color: item.accepted
                ? "hsl(var(--accent-foreground))"
                : "hsl(var(--muted-foreground))",
              transition: "color 150ms ease",
            }}
          />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Title row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-semibold leading-snug text-foreground">
              {item.title}
            </span>
            {item.required && <RequiredPill />}
          </div>

          {/* Body */}
          <p className="m-0 text-sm leading-relaxed text-muted-foreground">
            {item.body}
          </p>

          {/* Sub-items */}
          {item.subItems && item.subItems.length > 0 && (
            <ul
              className="m-0 flex flex-col gap-1 pl-4"
              style={{ listStyle: "disc", paddingLeft: 20 }}
            >
              {item.subItems.map((sub, idx) => (
                <li
                  key={idx}
                  className="text-sm text-muted-foreground"
                >
                  {sub}
                </li>
              ))}
            </ul>
          )}
        </div>
      </label>

      {/* Validation hint */}
      {missingRequired && (
        <p
          className="mt-3 font-mono text-[11px] font-medium"
          style={{ color: "hsl(var(--destructive))", paddingLeft: 40 }}
          role="alert"
          aria-live="polite"
        >
          Dette samtykket er obligatorisk for a bruke tjenesten.
        </p>
      )}
    </div>
  );
}

// ── Confirmation state ───────────────────────────────────────────

type ConfirmationProps = {
  signature: string;
  date: string;
};

function Confirmation({ signature, date }: ConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-12 text-center">
      {/* Large check */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 80,
          height: 80,
          background: "color-mix(in oklab, hsl(var(--accent)) 20%, transparent)",
        }}
        aria-hidden="true"
      >
        <CheckCircle
          size={48}
          style={{ color: "hsl(var(--accent-foreground))" }}
          strokeWidth={1.5}
        />
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h2 className="m-0 font-display text-3xl font-bold tracking-[-0.02em] text-foreground">
          Samtykke registrert
        </h2>
        <p className="m-0 text-sm text-muted-foreground">
          Signert av{" "}
          <span className="font-semibold text-foreground">{signature}</span>
          {" · "}
          {date}
        </p>
      </div>

      {/* Note */}
      <p
        className="m-0 max-w-prose text-sm text-muted-foreground"
        style={{ textWrap: "balance" } as React.CSSProperties}
      >
        Du kan trekke tilbake samtykket fra{" "}
        <span className="font-medium text-foreground">Innstillinger</span>.
      </p>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function todayFormatted(): string {
  return new Date().toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function signatureIsValid(sig: string): boolean {
  return sig.trim().split(/\s+/).filter(Boolean).length >= 2;
}

// ── Main component ───────────────────────────────────────────────

export function ConsentPattern({
  eyebrow,
  title,
  lead,
  items: initialItems,
  signatureLabel = "Navn",
  onItemChange,
  onSubmit,
  submitLabel = "Bekreft samtykke",
}: ConsentPatternProps) {
  const [items, setItems] = useState<ConsentItem[]>(initialItems);
  const [signature, setSignature] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [confirmedDate] = useState(todayFormatted);

  const allRequiredAccepted = items
    .filter((i) => i.required)
    .every((i) => i.accepted);

  const canSubmit = allRequiredAccepted && signatureIsValid(signature);

  function handleItemChange(id: string, accepted: boolean) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, accepted } : item))
    );
    onItemChange?.(id, accepted);
  }

  function handleSubmit() {
    if (!canSubmit) {
      setShowHints(true);
      return;
    }
    setSubmitted(true);
    onSubmit?.(signature.trim(), items);
  }

  const today = todayFormatted();
  const signatureValid = signatureIsValid(signature);
  const showSignatureHint = showHints && !signatureValid;

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <Confirmation signature={signature.trim()} date={confirmedDate} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      {/* Header */}
      <header className="mb-12 flex flex-col gap-6">
        {/* Eyebrow with lime accent line */}
        <div className="flex items-center gap-4">
          <div
            className="flex-shrink-0 rounded-full"
            style={{
              width: 3,
              height: 20,
              background: "hsl(var(--accent))",
            }}
            aria-hidden="true"
          />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </span>
        </div>

        {/* Hero title */}
        <h1
          className="m-0 font-display text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-foreground"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          {title}
        </h1>

        {/* Lead */}
        <p
          className="m-0 max-w-prose text-base leading-relaxed text-muted-foreground"
          style={{ textWrap: "pretty" } as React.CSSProperties}
        >
          {lead}
        </p>
      </header>

      {/* Consent items */}
      <div
        className="flex flex-col gap-4"
        role="group"
        aria-label="Samtykkepunkter"
      >
        {items.map((item) => (
          <ConsentItemCard
            key={item.id}
            item={item}
            onChange={handleItemChange}
            showHint={showHints}
          />
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="mt-8 flex flex-col gap-6 rounded-[20px] border"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          padding: 24,
        }}
      >
        {/* Signature input row */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="consent-signature"
            className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground"
          >
            {signatureLabel}
          </label>
          <div className="flex flex-col gap-1">
            <input
              id="consent-signature"
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Fornavn Etternavn"
              autoComplete="name"
              aria-required="true"
              aria-invalid={showSignatureHint ? "true" : "false"}
              aria-describedby={
                showSignatureHint ? "signature-hint" : undefined
              }
              className="w-full rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              style={{
                paddingTop: 12,
                paddingBottom: 12,
                borderColor: showSignatureHint
                  ? "hsl(var(--destructive))"
                  : "hsl(var(--input))",
                transition: "border-color 150ms ease",
              }}
            />
            {showSignatureHint && (
              <p
                id="signature-hint"
                className="font-mono text-[11px]"
                style={{ color: "hsl(var(--destructive))" }}
                role="alert"
                aria-live="polite"
              >
                Skriv inn fullt navn (fornavn og etternavn).
              </p>
            )}
          </div>
        </div>

        {/* Date row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Dato
            </span>
            <span className="text-sm text-foreground">{today}</span>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={false}
            aria-disabled={!canSubmit}
            aria-label={
              !allRequiredAccepted
                ? `${submitLabel} — godta alle obligatoriske punkter forst`
                : !signatureValid
                  ? `${submitLabel} — fyll inn fullt navn forst`
                  : submitLabel
            }
            className="flex-shrink-0 rounded-full px-8 font-display text-sm font-bold tracking-[-0.01em] transition-all duration-150"
            style={{
              paddingTop: 12,
              paddingBottom: 12,
              background: canSubmit
                ? "hsl(var(--primary))"
                : "hsl(var(--muted))",
              color: canSubmit
                ? "hsl(var(--primary-foreground))"
                : "hsl(var(--muted-foreground))",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {submitLabel}
          </button>
        </div>

        {/* Global hint when tried to submit */}
        {showHints && !canSubmit && (
          <p
            className="m-0 font-mono text-[11px]"
            style={{ color: "hsl(var(--destructive))" }}
            role="alert"
            aria-live="polite"
          >
            {!allRequiredAccepted
              ? "Godta alle obligatoriske punkter for a fortsette."
              : "Skriv inn fullt navn for a signere."}
          </p>
        )}
      </div>
    </div>
  );
}
