"use client";

import { useState, useRef, useCallback } from "react";
import {
  Save,
  Send,
  Eye,
  MoreHorizontal,
  Monitor,
  Smartphone,
  ChevronDown,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

export type EmailTemplate = {
  id: string;
  name: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  subject: string;
  from: string;
  toRule: "spiller" | "forelder" | "coach" | "alle";
  body: string;
  variables: { key: string; example: string }[];
  lastEdited: string;
};

export type EmailTemplateEditorPatternProps = {
  template: EmailTemplate;
  onSave?: (template: EmailTemplate) => void;
  onTestSend?: () => void;
};

// ── Constants ────────────────────────────────────────────────────

const ALLOWED_SENDERS: { value: string; label: string }[] = [
  { value: "velkommen@akgolf.no", label: "velkommen@akgolf.no" },
  { value: "coach@akgolf.no", label: "coach@akgolf.no" },
  { value: "admin@akgolf.no", label: "admin@akgolf.no" },
  { value: "no-reply@akgolf.no", label: "no-reply@akgolf.no" },
];

const TO_RULE_OPTIONS: { value: EmailTemplate["toRule"]; label: string }[] = [
  { value: "spiller", label: "Spiller" },
  { value: "forelder", label: "Forelder" },
  { value: "coach", label: "Coach" },
  { value: "alle", label: "Alle" },
];

// ── Status badge ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: EmailTemplate["status"] }) {
  const map: Record<
    EmailTemplate["status"],
    { label: string; bg: string; color: string }
  > = {
    DRAFT: {
      label: "UTKAST",
      bg: "color-mix(in oklab, var(--color-warning) 12%, transparent)",
      color: "var(--color-warning)",
    },
    PUBLISHED: {
      label: "PUBLISERT",
      bg: "color-mix(in oklab, var(--color-success) 12%, transparent)",
      color: "var(--color-success)",
    },
    ARCHIVED: {
      bg: "color-mix(in oklab, hsl(var(--muted-foreground)) 14%, transparent)",
      color: "hsl(var(--muted-foreground))",
      label: "ARKIVERT",
    },
  };

  const cfg = map[status];

  return (
    <span
      className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] rounded-full"
      style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px" }}
    >
      {cfg.label}
    </span>
  );
}

// ── Toolbar button ────────────────────────────────────────────────

type ToolbarButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
};

function ToolbarButton({
  icon,
  label,
  onClick,
  primary = false,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-[6px] rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0 transition-opacity disabled:opacity-40"
      style={{
        background: primary
          ? "hsl(var(--primary))"
          : "hsl(var(--secondary))",
        color: primary
          ? "hsl(var(--primary-foreground))"
          : "hsl(var(--secondary-foreground))",
        padding: "8px 16px",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Variable chips ────────────────────────────────────────────────

type VariableChipsProps = {
  variables: { key: string; example: string }[];
  onInsert: (snippet: string) => void;
};

function VariableChips({ variables, onInsert }: VariableChipsProps) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        Sett inn variabel
      </span>
      <div className="flex flex-wrap gap-2">
        {variables.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => onInsert(`{{${v.key}}}`)}
            title={`Eksempel: ${v.example}`}
            className="rounded-full border cursor-pointer font-mono text-[10px] font-bold transition-colors"
            style={{
              background: "color-mix(in oklab, hsl(var(--primary)) 6%, transparent)",
              borderColor: "color-mix(in oklab, hsl(var(--primary)) 20%, transparent)",
              color: "hsl(var(--primary))",
              padding: "4px 12px",
            }}
          >
            {`{{${v.key}}}`}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Select field ──────────────────────────────────────────────────

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
};

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-md border font-mono text-[13px] pr-8 outline-none transition-colors focus:ring-2"
          style={{
            background: "hsl(var(--card))",
            borderColor: "hsl(var(--input))",
            color: "hsl(var(--foreground))",
            padding: "10px 14px",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: "hsl(var(--muted-foreground))" }}
        />
      </div>
    </div>
  );
}

// ── Text input field ──────────────────────────────────────────────

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border font-sans text-[14px] outline-none transition-colors focus:ring-2"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--input))",
          color: "hsl(var(--foreground))",
          padding: "10px 14px",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
        }}
      />
    </div>
  );
}

// ── Preview HTML builder ──────────────────────────────────────────

function buildPreviewHtml(
  body: string,
  subject: string,
  variables: { key: string; example: string }[],
): string {
  let resolved = body;
  for (const v of variables) {
    resolved = resolved.replaceAll(`{{${v.key}}}`, v.example);
  }

  // Escape any remaining {{...}} that have no example
  resolved = resolved.replace(/\{\{[^}]+\}\}/g, (m) =>
    `<mark style="background:#fff3cd;color:#7a5000;border-radius:3px;padding:1px 4px;">${m}</mark>`,
  );

  const resolvedSubject = variables.reduce(
    (s, v) => s.replaceAll(`{{${v.key}}}`, v.example),
    subject,
  );

  // Convert newlines to <br> for plain-text bodies
  const htmlBody = resolved.replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F5F5F0;color:#0A1F17;padding:24px}
  .wrapper{max-width:600px;margin:0 auto}
  .header{background:#005840;color:#D1F843;padding:24px 32px;border-radius:12px 12px 0 0;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase}
  .subject{background:#FFFFFF;padding:20px 32px;border-left:1px solid #E5E3DD;border-right:1px solid #E5E3DD;font-size:18px;font-weight:700;color:#0A1F17;line-height:1.3}
  .body{background:#FFFFFF;padding:32px;border:1px solid #E5E3DD;border-top:none;border-radius:0 0 12px 12px;font-size:15px;line-height:1.7;color:#0A1F17}
  .footer{margin-top:16px;text-align:center;font-size:11px;color:#9D9C95;font-family:'Courier New',monospace}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">AK Golf Academy &nbsp;·&nbsp; E-post</div>
  <div class="subject">${resolvedSubject}</div>
  <div class="body">${htmlBody}</div>
  <div class="footer">AK Golf Academy &nbsp;·&nbsp; Fredrikstad, Norge</div>
</div>
</body>
</html>`;
}

// ── Preview pane ──────────────────────────────────────────────────

type PreviewPaneProps = {
  subject: string;
  body: string;
  variables: { key: string; example: string }[];
};

function PreviewPane({ subject, body, variables }: PreviewPaneProps) {
  const [mobile, setMobile] = useState(false);
  const srcDoc = buildPreviewHtml(body, subject, variables);

  return (
    <div className="flex flex-col h-full">
      {/* Pane header */}
      <div
        className="flex items-center justify-between gap-4 px-6 py-4 border-b"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <span
          className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Forhåndsvisning
        </span>
        <div
          className="flex items-center rounded-full p-[3px]"
          style={{ background: "hsl(var(--secondary))" }}
        >
          <button
            type="button"
            onClick={() => setMobile(false)}
            className="rounded-full p-[6px] border-0 cursor-pointer transition-all"
            style={{
              background: !mobile ? "hsl(var(--card))" : "transparent",
              color: !mobile
                ? "hsl(var(--foreground))"
                : "hsl(var(--muted-foreground))",
              boxShadow: !mobile ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
            }}
            title="Desktop"
          >
            <Monitor size={14} />
          </button>
          <button
            type="button"
            onClick={() => setMobile(true)}
            className="rounded-full p-[6px] border-0 cursor-pointer transition-all"
            style={{
              background: mobile ? "hsl(var(--card))" : "transparent",
              color: mobile
                ? "hsl(var(--foreground))"
                : "hsl(var(--muted-foreground))",
              boxShadow: mobile ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
            }}
            title="Mobil"
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>

      {/* iframe wrapper */}
      <div
        className="flex-1 overflow-hidden flex items-start justify-center p-6"
        style={{ background: "hsl(var(--muted))" }}
      >
        <div
          className="relative overflow-hidden rounded-lg transition-all duration-300"
          style={{
            width: mobile ? 375 : "100%",
            maxWidth: mobile ? 375 : "100%",
            height: "100%",
            minHeight: 480,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <iframe
            srcDoc={srcDoc}
            sandbox="allow-same-origin"
            title="E-post forhåndsvisning"
            className="w-full h-full border-0 rounded-lg"
            style={{ minHeight: 480 }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main pattern ─────────────────────────────────────────────────

export default function EmailTemplateEditorPattern({
  template,
  onSave,
  onTestSend,
}: EmailTemplateEditorPatternProps) {
  const [draft, setDraft] = useState<EmailTemplate>({ ...template });
  const [showMore, setShowMore] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const update = useCallback(
    <K extends keyof EmailTemplate>(key: K, value: EmailTemplate[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Insert variable snippet at textarea cursor position
  const handleInsertVariable = useCallback((snippet: string) => {
    const el = bodyRef.current;
    if (!el) {
      setDraft((prev) => ({ ...prev, body: prev.body + snippet }));
      return;
    }
    const start = el.selectionStart ?? draft.body.length;
    const end = el.selectionEnd ?? draft.body.length;
    const next =
      draft.body.slice(0, start) + snippet + draft.body.slice(end);
    setDraft((prev) => ({ ...prev, body: next }));
    // Restore cursor after React re-render
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  }, [draft.body]);

  const handleSave = () => onSave?.(draft);

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: "100vh",
        background: "hsl(var(--background))",
      }}
    >
      {/* ── Sticky toolbar ──────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-4 border-b"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          boxShadow: "0 1px 0 hsl(var(--border))",
        }}
      >
        {/* Left: name + status + last edited */}
        <div className="flex items-center gap-4 min-w-0">
          <h1
            className="m-0 font-display text-[18px] font-bold tracking-[-0.02em] truncate"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {draft.name}
          </h1>
          <StatusBadge status={draft.status} />
          <span
            className="hidden sm:block font-mono text-[10px]"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Sist endret {draft.lastEdited}
          </span>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ToolbarButton
            icon={<Save size={14} />}
            label="Lagre"
            onClick={handleSave}
            primary
          />
          <ToolbarButton
            icon={<Send size={14} />}
            label="Test-send"
            onClick={onTestSend}
          />
          {/* More menu toggle (stub) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="rounded-full border-0 cursor-pointer p-2 transition-colors"
              style={{
                background: showMore
                  ? "hsl(var(--secondary))"
                  : "transparent",
                color: "hsl(var(--foreground))",
              }}
              aria-label="Flere handlinger"
              aria-expanded={showMore}
            >
              <MoreHorizontal size={18} />
            </button>
            {showMore && (
              <div
                className="absolute right-0 top-full mt-2 rounded-lg border z-50 py-2 min-w-[160px]"
                style={{
                  background: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {(
                  [
                    { label: "Publiser", action: () => update("status", "PUBLISHED") },
                    { label: "Arkiver", action: () => update("status", "ARCHIVED") },
                    { label: "Sett som utkast", action: () => update("status", "DRAFT") },
                  ] as { label: string; action: () => void }[]
                ).map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      item.action();
                      setShowMore(false);
                    }}
                    className="w-full text-left border-0 px-4 py-2 font-sans text-[13px] cursor-pointer transition-colors"
                    style={{
                      background: "transparent",
                      color: "hsl(var(--foreground))",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "hsl(var(--secondary))";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Split pane ───────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left: form */}
        <div
          className="flex flex-col gap-6 p-6 lg:w-1/2 lg:border-r overflow-y-auto"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          {/* Eyebrow */}
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Rediger mal
          </span>

          {/* Subject */}
          <TextField
            label="Emne"
            value={draft.subject}
            onChange={(v) => update("subject", v)}
            placeholder="Skriv e-postemne …"
          />

          {/* From */}
          <SelectField
            label="Avsender"
            value={draft.from}
            onChange={(v) => update("from", v)}
            options={ALLOWED_SENDERS}
          />

          {/* To-rule */}
          <SelectField
            label="Mottaker-regel"
            value={draft.toRule}
            onChange={(v) => update("toRule", v as EmailTemplate["toRule"])}
            options={TO_RULE_OPTIONS}
          />

          {/* Variable chips */}
          <VariableChips
            variables={draft.variables}
            onInsert={handleInsertVariable}
          />

          {/* Body */}
          <div className="flex flex-col gap-2">
            <label
              className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Innhold
            </label>
            <textarea
              ref={bodyRef}
              value={draft.body}
              onChange={(e) => update("body", e.target.value)}
              rows={16}
              className="w-full rounded-md border font-mono text-[13px] leading-relaxed resize-y outline-none transition-colors focus:ring-2"
              style={{
                background: "hsl(var(--card))",
                borderColor: "hsl(var(--input))",
                color: "hsl(var(--foreground))",
                padding: "14px",
                minHeight: 240,
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
              }}
              placeholder="Skriv e-postinnhold her …"
              spellCheck
            />
            <p
              className="m-0 font-mono text-[10px]"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Bruk {`{{variabel_navn}}`}-syntax. Klikk chips over for innsetting
              ved cursor.
            </p>
          </div>

          {/* Footer: preview CTA on mobile */}
          <div className="lg:hidden">
            <a
              href="#preview-pane"
              className="inline-flex items-center gap-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.10em] no-underline"
              style={{
                background: "hsl(var(--secondary))",
                color: "hsl(var(--secondary-foreground))",
                padding: "10px 20px",
              }}
            >
              <Eye size={14} />
              Hopp til forhåndsvisning
            </a>
          </div>
        </div>

        {/* Right: preview */}
        <div
          id="preview-pane"
          className="flex flex-col lg:w-1/2"
          style={{ minHeight: 480 }}
        >
          <PreviewPane
            subject={draft.subject}
            body={draft.body}
            variables={draft.variables}
          />
        </div>
      </div>
    </div>
  );
}
