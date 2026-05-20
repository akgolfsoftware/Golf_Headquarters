"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  Save,
  Send,
  Star,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  archiveTemplate,
  saveTemplate,
  sendTestEmail,
  setAsDefault,
} from "./actions";

export type TemplateForEditor = {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body: string;
  active: boolean;
};

type Props = {
  template: TemplateForEditor;
  /** Brukerens egen e-post — vises som mottaker av test-mail */
  testRecipient: string;
};

// Eksempel-data for live preview. Matcher template-tokens vi typisk
// bruker på tvers av AK Golf-maler.
const PREVIEW_DATA: Record<string, string> = {
  spillerNavn: "Markus Roinås Pedersen",
  spillerFornavn: "Markus",
  coachNavn: "Anders Kristiansen",
  klubbNavn: "Gamle Fredrikstad Golfklubb",
  okt_navn: "Performance · sving-økt",
  okt_dato: "torsdag 22. mai",
  okt_tid: "16:30",
  okt_lokasjon: "Performance Studio · GFGK",
  plan_navn: "Vår-blokk · uke 21",
  plan_lengde: "4 uker",
  hcp: "12.4",
  pris: "1 500 kr",
  link: "https://akgolf.no/portal",
};

function renderTokens(text: string): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return PREVIEW_DATA[key] ?? `{{${key}}}`;
  });
}

export function EditorClient({ template, testRecipient }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{
    type: "ok" | "error";
    msg: string;
  } | null>(null);

  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [active, setActive] = useState(template.active);

  const dirty =
    name !== template.name ||
    subject !== template.subject ||
    body !== template.body ||
    active !== template.active;

  const previewSubject = useMemo(() => renderTokens(subject), [subject]);
  const previewBody = useMemo(() => renderTokens(body), [body]);

  const tokensIBruk = useMemo(() => {
    const set = new Set<string>();
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    let match;
    while ((match = regex.exec(`${subject}\n${body}`)) !== null) {
      set.add(match[1]);
    }
    return Array.from(set);
  }, [subject, body]);

  function flash(type: "ok" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  function lagre() {
    startTransition(async () => {
      try {
        await saveTemplate(template.id, { name, subject, body, active });
        flash("ok", "Mal lagret");
        router.refresh();
      } catch (err) {
        flash("error", err instanceof Error ? err.message : "Kunne ikke lagre");
      }
    });
  }

  function sendTest() {
    startTransition(async () => {
      try {
        const res = await sendTestEmail(template.id);
        flash("ok", `Test-mail sendt til ${res.recipient}`);
      } catch (err) {
        flash(
          "error",
          err instanceof Error ? err.message : "Kunne ikke sende",
        );
      }
    });
  }

  function settStandard() {
    startTransition(async () => {
      try {
        await setAsDefault(template.id);
        setActive(true);
        flash("ok", "Satt som standard");
        router.refresh();
      } catch (err) {
        flash(
          "error",
          err instanceof Error ? err.message : "Kunne ikke sette standard",
        );
      }
    });
  }

  function arkiver() {
    if (!confirm(`Arkivere malen «${template.name}»?`)) return;
    startTransition(async () => {
      try {
        await archiveTemplate(template.id);
        setActive(false);
        flash("ok", "Mal arkivert");
        router.refresh();
      } catch (err) {
        flash(
          "error",
          err instanceof Error ? err.message : "Kunne ikke arkivere",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <a
            href="/admin/email-templates"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={11} strokeWidth={1.75} />
            Tilbake til maler
          </a>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">
            {name || "Ny mal"}.{" "}
            <em className="font-normal text-primary md:italic">
              {active ? "Aktiv" : "Utkast"}.
            </em>
          </h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            Slug: {template.slug}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={sendTest}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:border-primary hover:text-primary disabled:opacity-60"
          >
            <Send size={12} strokeWidth={1.75} />
            Send test
          </button>
          <button
            type="button"
            onClick={settStandard}
            disabled={pending || active}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:border-primary hover:text-primary disabled:opacity-60"
          >
            <Star size={12} strokeWidth={1.75} />
            Sett som standard
          </button>
          <button
            type="button"
            onClick={arkiver}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs font-medium text-destructive hover:border-destructive/50 disabled:opacity-60"
          >
            <Archive size={12} strokeWidth={1.75} />
            Arkiver
          </button>
          <button
            type="button"
            onClick={lagre}
            disabled={pending || !dirty}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Save size={12} strokeWidth={1.75} />
            {pending ? "Lagrer…" : dirty ? "Lagre" : "Lagret"}
          </button>
        </div>
      </header>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm ${
            toast.type === "ok"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {toast.type === "ok" ? (
            <CheckCircle2 size={14} strokeWidth={1.75} />
          ) : (
            <AlertTriangle size={14} strokeWidth={1.75} />
          )}
          {toast.msg}
        </div>
      )}

      {/* 2-pane editor */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Editor */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border bg-secondary/40 px-6 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Editor
            </span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] ${
                active
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {active ? "Aktiv" : "Utkast"}
            </span>
          </header>

          <div className="space-y-4 p-4 sm:p-6">
            <Felt label="Mal-navn">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Velkommen til AK Golf Academy"
                className={inputClass}
              />
            </Felt>

            <Felt label="Emne (kan inneholde tokens)">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Velkommen til AK Golf, {{spillerFornavn}}"
                className={inputClass}
              />
            </Felt>

            <Felt label="Innhold (markdown · tokens som {{spillerNavn}})">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={16}
                placeholder="Hei {{spillerNavn}},&#10;&#10;Velkommen til AK Golf Academy…"
                className={`${inputClass} font-mono text-[12px] leading-relaxed`}
              />
            </Felt>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-foreground">Aktiv (kan brukes av agenter)</span>
            </label>

            {tokensIBruk.length > 0 && (
              <div className="rounded-md border border-border bg-background/60 p-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  Tokens i bruk · {tokensIBruk.length}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tokensIBruk.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-sm bg-secondary px-2 py-0.5 font-mono text-[10px] text-foreground"
                    >
                      {`{{${t}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Live preview */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border bg-secondary/40 px-6 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Forhåndsvisning
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              Eksempel-data
            </span>
          </header>

          <div className="space-y-4 p-4 sm:p-6">
            <div className="rounded-md border border-border bg-background/60 px-4 py-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Fra
              </div>
              <div className="text-[13px] text-foreground">
                AK Golf Academy &lt;post@akgolf.no&gt;
              </div>
            </div>

            <div className="rounded-md border border-border bg-background/60 px-4 py-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Til
              </div>
              <div className="text-[13px] text-foreground">
                {PREVIEW_DATA.spillerNavn} &lt;markus@eksempel.no&gt;
              </div>
            </div>

            <div className="rounded-md border border-border bg-background/60 px-4 py-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Emne
              </div>
              <div className="font-display text-[15px] font-semibold text-foreground">
                {previewSubject || "—"}
              </div>
            </div>

            <div className="rounded-md border border-border bg-white p-4 sm:p-6 text-foreground dark:bg-background/60">
              <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed">
                {previewBody || "—"}
              </pre>
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              Test sendes til: {testRecipient}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-card px-4 py-3 text-base sm:text-sm sm:py-2.5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Felt({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
