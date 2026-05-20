"use client";

/**
 * Eksport-modal — gjenbrukbar modal for CoachHQ-eksporter.
 *
 * Tre varianter via `kind`-prop:
 *   - "brief"        Eksporter brief-rapport (/admin/brief)
 *   - "analytics"    Eksporter analytics-rapport (/admin/analytics, /admin/stall)
 *   - "tournaments"  Eksporter turneringer (/admin/tournaments)
 *
 * Hver variant viser kontekst-avhengige felt (format, periode, scope,
 * type, inkluder-toggles, mottakere) men deler den samme shell-strukturen.
 *
 * Server actions returnerer { success, downloadUrl, filename } eller
 * { success: false, error }. Toast-feedback via useToast().
 */

import { useState, useTransition } from "react";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Check,
  Download,
  FileText,
  Loader2,
  Mail,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useToast } from "@/components/shared/toast-provider";
import {
  exportBriefReport,
  type ExportBriefInput,
} from "@/app/admin/brief/actions";
import {
  exportAnalyticsReport,
  type ExportAnalyticsInput,
} from "@/app/admin/analytics/actions";
import {
  exportTournamentsReport,
  type ExportTournamentsInput,
} from "@/app/admin/tournaments/actions";

// ------------------------------------------------------------------
// Typer
// ------------------------------------------------------------------

export type EksportKind = "brief" | "analytics" | "tournaments";

export type SpillerOption = {
  id: string;
  name: string;
  hcp: number | null;
};

export type TurneringOption = {
  id: string;
  name: string;
};

type CommonProps = {
  open: boolean;
  onClose: () => void;
};

type BriefProps = CommonProps & {
  kind: "brief";
};

type AnalyticsProps = CommonProps & {
  kind: "analytics";
  spillere?: SpillerOption[];
};

type TournamentsProps = CommonProps & {
  kind: "tournaments";
  turneringer?: TurneringOption[];
};

export type EksportModalProps = BriefProps | AnalyticsProps | TournamentsProps;

// ------------------------------------------------------------------
// Hovedkomponent
// ------------------------------------------------------------------

export function EksportModal(props: EksportModalProps) {
  const { open, onClose, kind } = props;
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Felles state
  const [format, setFormat] = useState<string>(
    kind === "analytics" ? "pdf" : kind === "tournaments" ? "pdf" : "pdf",
  );
  const [period, setPeriod] = useState<string>(
    kind === "brief"
      ? "i-dag"
      : kind === "analytics"
        ? "30d"
        : "kommende",
  );
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [recipientError, setRecipientError] = useState<string | null>(null);

  // Brief includes
  const [briefIncludes, setBriefIncludes] = useState({
    kpiStrip: true,
    spillerStatus: true,
    foresporsler: true,
    coachNotater: false,
  });

  // Analytics scope + includes
  const [scope, setScope] = useState<"stall" | "kategori" | "spillere">(
    "stall",
  );
  const [kategori, setKategori] = useState<"A1" | "A2" | "B1" | "B2">("A1");
  const [spillerIds, setSpillerIds] = useState<string[]>([]);
  const [analyticsIncludes, setAnalyticsIncludes] = useState({
    sgTrender: true,
    pyramide: true,
    compliance: true,
    rundeData: false,
  });

  // Tournaments
  const [tType, setTType] = useState<
    "startliste" | "resultater" | "pamelding" | "historikk"
  >("startliste");
  const [sortBy, setSortBy] = useState<"dato" | "type" | "resultat">("dato");

  if (!open) return null;

  const title =
    kind === "brief"
      ? "Eksporter brief-rapport"
      : kind === "analytics"
        ? "Eksporter analytics-rapport"
        : "Eksporter turneringer";

  const eyebrow =
    kind === "brief"
      ? "COACH-BRIEF · DAGLIG/UKENTLIG"
      : kind === "analytics"
        ? "COACH ANALYTICS · DETALJ-RAPPORT"
        : "TURNERING · EKSPORT";

  const HeaderIcon: LucideIcon =
    kind === "brief"
      ? FileText
      : kind === "analytics"
        ? BarChart3
        : Trophy;

  // Parse e-poster fra komma-separert input
  function parseRecipients(): string[] {
    if (!recipientsRaw.trim()) return [];
    return recipientsRaw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function validateRecipients(emails: string[]): string | null {
    const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const e of emails) {
      if (!rx.test(e)) return `Ugyldig e-post: ${e}`;
    }
    return null;
  }

  async function handleSubmit() {
    setError(null);
    setRecipientError(null);
    const recipients = parseRecipients();
    const recipErr = validateRecipients(recipients);
    if (recipErr) {
      setRecipientError(recipErr);
      return;
    }

    startTransition(async () => {
      try {
        if (kind === "brief") {
          const input: ExportBriefInput = {
            format: format as "pdf" | "csv",
            period: period as ExportBriefInput["period"],
            from: period === "custom" ? from : undefined,
            to: period === "custom" ? to : undefined,
            includes: briefIncludes,
            recipients,
          };
          const res = await exportBriefReport(input);
          handleResult(res);
        } else if (kind === "analytics") {
          const input: ExportAnalyticsInput = {
            format: format as "pdf" | "csv" | "xlsx",
            period: period as ExportAnalyticsInput["period"],
            from: period === "custom" ? from : undefined,
            to: period === "custom" ? to : undefined,
            scope,
            kategori: scope === "kategori" ? kategori : undefined,
            spillerIds: scope === "spillere" ? spillerIds : [],
            includes: analyticsIncludes,
            recipients,
          };
          const res = await exportAnalyticsReport(input);
          handleResult(res);
        } else {
          const input: ExportTournamentsInput = {
            format: format as "pdf" | "csv",
            type: tType,
            period: period as ExportTournamentsInput["period"],
            from: period === "custom" ? from : undefined,
            to: period === "custom" ? to : undefined,
            sortBy,
            tournamentIds: [],
          };
          const res = await exportTournamentsReport(input);
          handleResult(res);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Kunne ikke eksportere";
        setError(msg);
        toast.error(msg);
      }
    });
  }

  function handleResult(
    res:
      | { success: true; downloadUrl: string; filename: string }
      | { success: false; error: string },
  ) {
    if (!res.success) {
      setError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success(`Eksport klar: ${res.filename}`);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="eksport-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100vh-32px)] w-[640px] max-w-full flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-border px-6 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              {eyebrow}
            </div>
            <h2
              id="eksport-modal-title"
              className="mt-1 inline-flex items-center gap-2 font-display text-[22px] font-semibold tracking-tight text-foreground"
            >
              <HeaderIcon
                size={20}
                strokeWidth={1.75}
                className="text-primary"
              />
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </header>

        {/* Body */}
        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5 sm:px-7">
          {/* Format */}
          <Section label="Format">
            <Chips>
              <Chip
                aktiv={format === "pdf"}
                onClick={() => setFormat("pdf")}
                label="PDF"
              />
              <Chip
                aktiv={format === "csv"}
                onClick={() => setFormat("csv")}
                label="CSV"
              />
              {kind === "analytics" && (
                <Chip
                  aktiv={format === "xlsx"}
                  onClick={() => setFormat("xlsx")}
                  label="Excel"
                />
              )}
            </Chips>
          </Section>

          {/* Tournaments: Type */}
          {kind === "tournaments" && (
            <Section label="Type">
              <Chips>
                <Chip
                  aktiv={tType === "startliste"}
                  onClick={() => setTType("startliste")}
                  label="Startliste"
                />
                <Chip
                  aktiv={tType === "resultater"}
                  onClick={() => setTType("resultater")}
                  label="Resultater"
                />
                <Chip
                  aktiv={tType === "pamelding"}
                  onClick={() => setTType("pamelding")}
                  label="Påmeldinger"
                />
                <Chip
                  aktiv={tType === "historikk"}
                  onClick={() => setTType("historikk")}
                  label="Historikk"
                />
              </Chips>
            </Section>
          )}

          {/* Analytics: Scope */}
          {kind === "analytics" && (
            <Section label="Omfang">
              <Chips>
                <Chip
                  aktiv={scope === "stall"}
                  onClick={() => setScope("stall")}
                  label="All stall"
                />
                <Chip
                  aktiv={scope === "kategori"}
                  onClick={() => setScope("kategori")}
                  label="Per kategori"
                />
                <Chip
                  aktiv={scope === "spillere"}
                  onClick={() => setScope("spillere")}
                  label="Per spiller"
                />
              </Chips>
              {scope === "kategori" && (
                <div className="mt-3">
                  <Chips>
                    {(["A1", "A2", "B1", "B2"] as const).map((k) => (
                      <Chip
                        key={k}
                        aktiv={kategori === k}
                        onClick={() => setKategori(k)}
                        label={k}
                      />
                    ))}
                  </Chips>
                </div>
              )}
              {scope === "spillere" && props.kind === "analytics" && (
                <SpillerMultiSelect
                  spillere={props.spillere ?? []}
                  valgt={spillerIds}
                  onToggle={(id) =>
                    setSpillerIds((cur) =>
                      cur.includes(id)
                        ? cur.filter((x) => x !== id)
                        : [...cur, id],
                    )
                  }
                />
              )}
            </Section>
          )}

          {/* Periode */}
          <Section label="Periode">
            <Chips>
              {periodOptions(kind).map((opt) => (
                <Chip
                  key={opt.value}
                  aktiv={period === opt.value}
                  onClick={() => setPeriod(opt.value)}
                  label={opt.label}
                />
              ))}
            </Chips>
            {period === "custom" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <DateField
                  label="Fra"
                  value={from}
                  onChange={(v) => setFrom(v)}
                />
                <DateField label="Til" value={to} onChange={(v) => setTo(v)} />
              </div>
            )}
          </Section>

          {/* Inkluder */}
          {kind === "brief" && (
            <Section label="Inkluder">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Toggle
                  aktiv={briefIncludes.kpiStrip}
                  onClick={() =>
                    setBriefIncludes((s) => ({
                      ...s,
                      kpiStrip: !s.kpiStrip,
                    }))
                  }
                  label="KPI-strip"
                />
                <Toggle
                  aktiv={briefIncludes.spillerStatus}
                  onClick={() =>
                    setBriefIncludes((s) => ({
                      ...s,
                      spillerStatus: !s.spillerStatus,
                    }))
                  }
                  label="Spiller-status"
                />
                <Toggle
                  aktiv={briefIncludes.foresporsler}
                  onClick={() =>
                    setBriefIncludes((s) => ({
                      ...s,
                      foresporsler: !s.foresporsler,
                    }))
                  }
                  label="Forespørsler"
                />
                <Toggle
                  aktiv={briefIncludes.coachNotater}
                  onClick={() =>
                    setBriefIncludes((s) => ({
                      ...s,
                      coachNotater: !s.coachNotater,
                    }))
                  }
                  label="Coach-notater"
                />
              </div>
            </Section>
          )}

          {kind === "analytics" && (
            <Section label="Inkluder">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Toggle
                  aktiv={analyticsIncludes.sgTrender}
                  onClick={() =>
                    setAnalyticsIncludes((s) => ({
                      ...s,
                      sgTrender: !s.sgTrender,
                    }))
                  }
                  label="SG-trender"
                />
                <Toggle
                  aktiv={analyticsIncludes.pyramide}
                  onClick={() =>
                    setAnalyticsIncludes((s) => ({
                      ...s,
                      pyramide: !s.pyramide,
                    }))
                  }
                  label="Pyramide-balanse"
                />
                <Toggle
                  aktiv={analyticsIncludes.compliance}
                  onClick={() =>
                    setAnalyticsIncludes((s) => ({
                      ...s,
                      compliance: !s.compliance,
                    }))
                  }
                  label="Compliance"
                />
                <Toggle
                  aktiv={analyticsIncludes.rundeData}
                  onClick={() =>
                    setAnalyticsIncludes((s) => ({
                      ...s,
                      rundeData: !s.rundeData,
                    }))
                  }
                  label="Detaljerte runde-data"
                />
              </div>
            </Section>
          )}

          {kind === "tournaments" && (
            <Section label="Sortering">
              <Chips>
                <Chip
                  aktiv={sortBy === "dato"}
                  onClick={() => setSortBy("dato")}
                  label="Etter dato"
                />
                <Chip
                  aktiv={sortBy === "type"}
                  onClick={() => setSortBy("type")}
                  label="Etter type"
                />
                <Chip
                  aktiv={sortBy === "resultat"}
                  onClick={() => setSortBy("resultat")}
                  label="Etter resultat"
                />
              </Chips>
            </Section>
          )}

          {/* Mottakere */}
          {kind !== "tournaments" && (
            <Section label="Mottaker (valgfri)">
              <input
                type="text"
                value={recipientsRaw}
                onChange={(e) => {
                  setRecipientsRaw(e.target.value);
                  setRecipientError(null);
                }}
                placeholder="coach@gfgk.no, foreldre@example.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                La feltet stå tomt for å bare laste ned. Skill flere e-poster
                med komma.
              </p>
              {recipientError && (
                <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-destructive">
                  <AlertCircle size={12} strokeWidth={1.75} />
                  {recipientError}
                </div>
              )}
            </Section>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive">
              <AlertCircle
                size={14}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0"
              />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-secondary/30 px-6 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-[13px] font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2
                  size={14}
                  strokeWidth={1.75}
                  className="animate-spin"
                />
                Genererer…
              </>
            ) : recipientsRawCount(recipientsRaw) > 0 && kind !== "tournaments" ? (
              <>
                <Mail size={14} strokeWidth={1.75} />
                Eksporter & send
              </>
            ) : (
              <>
                <Download size={14} strokeWidth={1.75} />
                Eksporter
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Hjelpere
// ------------------------------------------------------------------

function recipientsRawCount(raw: string): number {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function periodOptions(
  kind: EksportKind,
): { value: string; label: string }[] {
  if (kind === "brief") {
    return [
      { value: "i-dag", label: "I dag" },
      { value: "denne-uka", label: "Denne uka" },
      { value: "forrige-uke", label: "Forrige uke" },
      { value: "custom", label: "Egendefinert" },
    ];
  }
  if (kind === "analytics") {
    return [
      { value: "7d", label: "Siste 7d" },
      { value: "30d", label: "Siste 30d" },
      { value: "90d", label: "Siste 90d" },
      { value: "sesong", label: "Sesong 2026" },
      { value: "custom", label: "Egendefinert" },
    ];
  }
  return [
    { value: "kommende", label: "Kommende" },
    { value: "pagaende", label: "Pågående" },
    { value: "avsluttet", label: "Avsluttet" },
    { value: "custom", label: "Egendefinert" },
  ];
}

// ------------------------------------------------------------------
// Subkomponenter
// ------------------------------------------------------------------

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function Chips({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Chip({
  aktiv,
  onClick,
  label,
}: {
  aktiv: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-colors ${
        aktiv
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function Toggle({
  aktiv,
  onClick,
  label,
}: {
  aktiv: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={aktiv}
      className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-[12.5px] font-medium transition-colors ${
        aktiv
          ? "border-primary/30 bg-primary/5 text-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>{label}</span>
      <span
        className={`grid h-4 w-4 place-items-center rounded-sm border ${
          aktiv
            ? "border-primary bg-primary text-accent"
            : "border-border bg-card"
        }`}
      >
        {aktiv && <Check size={10} strokeWidth={2.5} />}
      </span>
    </button>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
        <Calendar
          size={13}
          strokeWidth={1.75}
          className="text-muted-foreground"
        />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-none bg-transparent text-foreground outline-none"
        />
      </span>
    </label>
  );
}

function SpillerMultiSelect({
  spillere,
  valgt,
  onToggle,
}: {
  spillere: SpillerOption[];
  valgt: string[];
  onToggle: (id: string) => void;
}) {
  if (spillere.length === 0) {
    return (
      <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
        <Users size={12} strokeWidth={1.75} />
        Ingen spillere tilgjengelig
      </p>
    );
  }
  return (
    <div className="mt-3 max-h-[180px] overflow-y-auto rounded-md border border-border bg-background p-2">
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {spillere.map((s) => {
          const aktiv = valgt.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onToggle(s.id)}
              role="checkbox"
              aria-checked={aktiv}
              className={`flex items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-[12.5px] transition-colors ${
                aktiv
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-secondary/40"
              }`}
            >
              <span className="truncate">{s.name}</span>
              <span className="shrink-0 font-mono text-[10px] tabular-nums">
                {s.hcp != null ? `HCP ${s.hcp.toFixed(1).replace(".", ",")}` : "—"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 font-mono text-[10px] text-muted-foreground">
        {valgt.length} av {spillere.length} valgt
      </p>
    </div>
  );
}
