"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Check,
  Copy,
  Save,
  Star,
  Trash2,
} from "lucide-react";

import {
  archiveTemplate,
  deleteTemplate,
  duplicateTemplate,
  saveTemplate,
  setAsDefault,
  unarchiveTemplate,
  type SaveTemplateInput,
} from "./actions";

type AllokeringVekter = {
  FYS: number;
  TEK: number;
  SLAG: number;
  SPILL: number;
  TURN: number;
};

type UkeSkjema = {
  okterPerUke: number;
  varighetMin: number;
};

export type EditorInitialData = {
  id: string;
  navn: string;
  beskrivelse: string;
  weeks: number;
  active: boolean;
  isDefault: boolean;
  notater: string;
  allokering: AllokeringVekter;
  ukeSkjema: UkeSkjema;
  sessionsCount: number;
  createdAt: string;
  updatedAt: string;
  payloadValid: boolean;
};

const PYR_OMRADER: {
  key: keyof AllokeringVekter;
  navn: string;
  beskrivelse: string;
}[] = [
  { key: "FYS", navn: "FYS", beskrivelse: "fysisk fundament" },
  { key: "TEK", navn: "TEK", beskrivelse: "teknikk" },
  { key: "SLAG", navn: "SLAG", beskrivelse: "slagprogresjon" },
  { key: "SPILL", navn: "SPILL", beskrivelse: "banespill" },
  { key: "TURN", navn: "TURN", beskrivelse: "turnering" },
];

const PLAN_FASER = [
  { key: "BASE", navn: "Base" },
  { key: "GENERELL", navn: "Generell" },
  { key: "SPESIFIKK", navn: "Spesifikk" },
  { key: "TAPER", navn: "Taper" },
  { key: "TOPPFORM", navn: "Toppform" },
] as const;

export function TemplateEditor({ initial }: { initial: EditorInitialData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverFeil, setServerFeil] = useState<string | null>(null);
  const [serverOk, setServerOk] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showSlett, setShowSlett] = useState(false);

  const [navn, setNavn] = useState(initial.navn);
  const [beskrivelse, setBeskrivelse] = useState(initial.beskrivelse);
  const [weeks, setWeeks] = useState<number>(initial.weeks);
  const [allokering, setAllokering] = useState<AllokeringVekter>(
    initial.allokering,
  );
  const [ukeSkjema, setUkeSkjema] = useState<UkeSkjema>(initial.ukeSkjema);
  const [notater, setNotater] = useState(initial.notater);
  const [isDefault, setIsDefault] = useState(initial.isDefault);

  const sum =
    allokering.FYS +
    allokering.TEK +
    allokering.SLAG +
    allokering.SPILL +
    allokering.TURN;

  const status = useMemo<{ label: string; pill: string }>(() => {
    if (!initial.active)
      return {
        label: "Arkivert",
        pill: "bg-muted text-muted-foreground",
      };
    if (isDefault)
      return {
        label: "Standard",
        pill: "bg-accent text-accent-foreground",
      };
    return { label: "Aktiv", pill: "bg-primary/15 text-primary" };
  }, [initial.active, isDefault]);

  function resetMeldinger() {
    setServerFeil(null);
    setServerOk(null);
    setFieldErrors({});
  }

  function handleLagre() {
    resetMeldinger();
    const input: SaveTemplateInput = {
      navn: navn.trim(),
      beskrivelse: beskrivelse.trim(),
      weeks,
      allokering,
      ukeSkjema,
      notater: notater.trim(),
      isDefault,
    };
    startTransition(async () => {
      const res = await saveTemplate(initial.id, input);
      if (res.ok) {
        setServerOk("Endringer lagret.");
        router.refresh();
      } else {
        setServerFeil(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  function handleSetDefault() {
    resetMeldinger();
    startTransition(async () => {
      const res = await setAsDefault(initial.id);
      if (res.ok) {
        setIsDefault(true);
        setServerOk("Satt som standard-mal.");
        router.refresh();
      } else {
        setServerFeil(res.error);
      }
    });
  }

  function handleArkiver() {
    resetMeldinger();
    startTransition(async () => {
      const res = initial.active
        ? await archiveTemplate(initial.id)
        : await unarchiveTemplate(initial.id);
      if (res.ok) {
        router.refresh();
      } else {
        setServerFeil(res.error);
      }
    });
  }

  function handleDupliser() {
    resetMeldinger();
    startTransition(async () => {
      const res = await duplicateTemplate(initial.id);
      if (res.ok) {
        router.push(`/admin/plans/templates/${res.templateId}/rediger`);
      } else {
        setServerFeil(res.error);
      }
    });
  }

  function handleSlett() {
    resetMeldinger();
    startTransition(async () => {
      const res = await deleteTemplate(initial.id);
      if (res.ok) {
        router.push("/admin/plans/templates");
      } else {
        setServerFeil(res.error);
        setShowSlett(false);
      }
    });
  }

  function settVekt(omrade: keyof AllokeringVekter, value: number) {
    setAllokering((prev) => ({ ...prev, [omrade]: value }));
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            AgencyOS · Treningsplaner · Mal-editor
          </div>
          <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
            Rediger{" "}
            <em className="font-normal italic text-primary">{initial.navn}</em>
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${status.pill}`}
            >
              {status.label === "Standard" && (
                <Star className="h-3 w-3" strokeWidth={1.75} />
              )}
              {status.label}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {weeks} {weeks === 1 ? "uke" : "uker"} ·{" "}
              {initial.sessionsCount} forhåndsdefinerte økter
            </span>
            {!initial.payloadValid && (
              <span className="inline-flex items-center rounded-full bg-destructive/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-destructive">
                Ugyldig payload — lagring rebuildes
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSetDefault}
            disabled={pending || isDefault}
            title={isDefault ? "Allerede satt som standard" : "Sett som standard-mal"}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Star className="h-3.5 w-3.5" strokeWidth={1.75} />
            Sett som standard
          </button>
          <button
            type="button"
            onClick={handleDupliser}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
            Dupliser
          </button>
          <button
            type="button"
            onClick={handleArkiver}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {initial.active ? (
              <>
                <Archive className="h-3.5 w-3.5" strokeWidth={1.75} />
                Arkiver
              </>
            ) : (
              <>
                <ArchiveRestore className="h-3.5 w-3.5" strokeWidth={1.75} />
                Gjenopprett
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleLagre}
            disabled={pending || sum !== 100}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
            {pending ? "Lagrer…" : "Lagre"}
          </button>
        </div>
      </header>

      {(serverFeil || serverOk) && (
        <div
          role="alert"
          className={`rounded-md border px-4 py-2 text-sm ${
            serverFeil
              ? "border-destructive/40 bg-destructive/5 text-destructive"
              : "border-primary/40 bg-primary/5 text-primary"
          }`}
        >
          {serverFeil ?? serverOk}
        </div>
      )}

      {/* Seksjon 1 — Periode + meta */}
      <Seksjon
        nr={1}
        tittel="Periode og identitet"
        sub="Navn, beskrivelse og varighet styrer hvordan malen vises i bibliotek."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeltTekst
            label="Mal-navn"
            value={navn}
            onChange={setNavn}
            paakrevd
            error={fieldErrors.navn}
          />
          <FeltTall
            label="Antall uker"
            value={weeks}
            onChange={setWeeks}
            min={1}
            max={104}
            paakrevd
            error={fieldErrors.weeks}
          />
        </div>
        <div className="mt-4">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Beskrivelse
            </span>
            <textarea
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              rows={3}
              maxLength={2000}
              className="resize-y rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
              placeholder="Hva passer denne malen for?"
            />
          </label>
        </div>
      </Seksjon>

      {/* Seksjon 2 — Faser (visning) */}
      <Seksjon
        nr={2}
        tittel="Faser"
        sub="Fase-flyten er forhåndsdefinert. Plan-bygger-wizard velger hvilke faser som brukes på en konkret plan."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {PLAN_FASER.map((f, i) => (
            <div
              key={f.key}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Fase {i + 1}
              </div>
              <div className="mt-1 font-display text-sm font-semibold leading-tight">
                {f.navn}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                {f.key}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Selve fase-utvalget gjøres av coach i plan-bygger-wizard når malen
          brukes — malen styrer kun allokering og uke-skjema.
        </p>
      </Seksjon>

      {/* Seksjon 3 — Allokering */}
      <Seksjon
        nr={3}
        tittel="Pyramide-allokering"
        sub="Fordel 100 % mellom fokusområdene. Hver økt får et område proporsjonalt."
      >
        <div className="space-y-0">
          {PYR_OMRADER.map(({ key, navn: omrNavn, beskrivelse }) => {
            const v = allokering[key];
            return (
              <div
                key={key}
                className="border-b border-border py-2 last:border-b-0"
              >
                <div className="grid grid-cols-[100px_1fr_60px] items-center gap-4">
                  <div>
                    <div className="text-sm font-semibold leading-none">
                      {omrNavn}
                    </div>
                    <div className="mt-1 text-xs leading-none text-muted-foreground">
                      {beskrivelse}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={v}
                    onChange={(e) => settVekt(key, Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="text-right font-mono text-base font-semibold tabular-nums">
                    {v} %
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <div className="font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sum
            </div>
            <div
              className={`mt-1 font-mono text-2xl font-semibold tabular-nums leading-none ${
                sum === 100 ? "text-primary" : "text-destructive"
              }`}
            >
              {sum} %
            </div>
          </div>
          {sum === 100 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              Klar
            </div>
          )}
        </div>
      </Seksjon>

      {/* Seksjon 4 — Ukentlig skjema */}
      <Seksjon
        nr={4}
        tittel="Ukentlig template"
        sub="Hvor mange økter per uke og hvor lange? Brukes som standard for planer som lages fra malen."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeltTall
            label="Økter per uke"
            value={ukeSkjema.okterPerUke}
            onChange={(n) =>
              setUkeSkjema({ ...ukeSkjema, okterPerUke: n })
            }
            min={1}
            max={7}
          />
          <FeltTall
            label="Varighet per økt (min)"
            value={ukeSkjema.varighetMin}
            onChange={(n) =>
              setUkeSkjema({ ...ukeSkjema, varighetMin: n })
            }
            min={15}
            max={360}
            step={15}
          />
        </div>
        <div className="mt-4 rounded-md border border-border bg-secondary/40 px-4 py-2 text-sm">
          Estimert volum:{" "}
          <span className="font-mono font-semibold tabular-nums">
            {ukeSkjema.okterPerUke * weeks}
          </span>{" "}
          økter ·{" "}
          <span className="font-mono font-semibold tabular-nums">
            {ukeSkjema.okterPerUke * weeks * ukeSkjema.varighetMin}
          </span>{" "}
          min totalt
        </div>
      </Seksjon>

      {/* Seksjon 5 — Drill-bibliotek (read-only stub) */}
      <Seksjon
        nr={5}
        tittel="Drill-bibliotek"
        sub="Forhåndsdefinerte økter i malen. Detaljredigering av enkelt-økter gjøres i plan-vis etter at en plan er opprettet."
      >
        <div className="rounded-md border border-dashed border-border bg-secondary/30 px-4 py-6 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Innhold
          </div>
          <div className="mt-2 font-display text-lg font-semibold">
            {initial.sessionsCount} forhåndsdefinerte økter
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Drill-redigering på mal-nivå kommer i v2. Bruk «Bruk mal» fra
            bibliotek-grid, så kan du justere drills på den konkrete planen.
          </p>
        </div>
      </Seksjon>

      {/* Seksjon 6 — Notater + standard-flag */}
      <Seksjon
        nr={6}
        tittel="Notater og standard"
        sub="Notater er coach-interne kommentarer. «Sett som standard» påvirker hvilken mal som blir forhåndsvalgt i plan-bygger-wizarden."
      >
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Interne notater
          </span>
          <textarea
            value={notater}
            onChange={(e) => setNotater(e.target.value)}
            rows={4}
            maxLength={4000}
            className="resize-y rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
            placeholder="F.eks. fungerer best for B1-spillere i tapering-fase…"
          />
        </label>
        <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/40">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          <span className="flex-1">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Star className="h-3.5 w-3.5" strokeWidth={1.75} />
              Sett som standard-mal
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Standard-malen brukes som default i plan-bygger-wizarden. Bare
              én mal kan være standard om gangen.
            </span>
          </span>
        </label>
      </Seksjon>

      {/* Versjon + slett */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Opprettet{" "}
          {new Date(initial.createdAt).toLocaleDateString("nb-NO")} · Sist
          oppdatert{" "}
          {new Date(initial.updatedAt).toLocaleDateString("nb-NO")}
        </div>
        <button
          type="button"
          onClick={() => setShowSlett(true)}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-card px-4 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          Slett permanent
        </button>
      </div>

      {showSlett && (
        <SlettDialog
          navn={initial.navn}
          pending={pending}
          onAvbryt={() => setShowSlett(false)}
          onBekreft={handleSlett}
        />
      )}
    </div>
  );
}

/* =========================================================
   Felles småkomponenter
   ========================================================= */

function Seksjon({
  nr,
  tittel,
  sub,
  children,
}: {
  nr: number;
  tittel: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <header className="mb-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Seksjon {nr}
        </div>
        <h2 className="mt-1 font-display text-lg font-semibold leading-tight tracking-tight">
          {tittel}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      </header>
      {children}
    </section>
  );
}

function FeltTekst({
  label,
  value,
  onChange,
  paakrevd,
  error,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  paakrevd?: boolean;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {paakrevd && <span className="ml-1 text-destructive">*</span>}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={`h-11 rounded-md border bg-card px-4 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}

function FeltTall({
  label,
  value,
  onChange,
  min,
  max,
  step,
  paakrevd,
  error,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  paakrevd?: boolean;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {paakrevd && <span className="ml-1 text-destructive">*</span>}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        aria-invalid={error ? true : undefined}
        className={`h-11 rounded-md border bg-card px-4 text-base sm:text-sm font-mono tabular-nums text-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}

function SlettDialog({
  navn,
  pending,
  onAvbryt,
  onBekreft,
}: {
  navn: string;
  pending: boolean;
  onAvbryt: () => void;
  onBekreft: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onAvbryt}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Bekreft permanent sletting
        </div>
        <h3 className="mt-1 font-display text-xl leading-tight tracking-tight">
          Slett{" "}
          <span className="font-display italic text-destructive">{navn}</span>?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Malen fjernes for godt. Du kan i stedet arkivere malen — da skjules
          den fra bibliotek, men kan gjenopprettes senere.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onAvbryt}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={onBekreft}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            {pending ? "Sletter…" : "Slett permanent"}
          </button>
        </div>
      </div>
    </div>
  );
}
