"use client";

/**
 * TrackmanImportModal — gjenbrukbar 4-stegs modal for TrackMan-import.
 *
 * Intern steg-flyt (ingen sidenavigasjon):
 *   1. Velg kilde (CSV-fil / HTML-rapport / TrackMan-konto / API)
 *   2. Velg fil + dato/miljø + parse preview
 *   3. Velg hvilke slag/grupper å importere
 *   4. Bekreft + lagre
 *
 * Brukes fra:
 *   - /portal/mal/runder (sammen med GolfBox-import)
 *   - /portal/mal/trackman (TrackMan-hub)
 *   - /admin/spillere/[id] (coach importerer for spilleren — se onBehalfOfUserId)
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileCode,
  X,
} from "lucide-react";
import {
  importTrackManCsv,
  importTrackManHtml,
  type TrackManEnvironment,
} from "@/app/portal/mal/trackman/actions";
import { ENVIRONMENT_OPTIONS } from "@/lib/sg-hub/environment-labels";
import { parseTrackManCsv, type TrackManShot } from "@/lib/trackman/parse-csv";
import { useToast } from "@/components/shared/toast-provider";

type Steg = 1 | 2 | 3 | 4;
type Kilde = "csv" | "html";

type Props = {
  /**
   * Knapp-variant for trigger.
   * - primary: forest filled, default for hovedaction
   * - secondary: outline-knapp, for sekundære plasseringer
   * - link: ren tekstlenke (samme stil som "Detaljer →" i tabeller)
   */
  variant?: "primary" | "secondary" | "link";
  /** Tekst på trigger-knappen. Defaultes til "Importer TrackMan". */
  label?: string;
  className?: string;
  /**
   * Hvis satt: spillerens userId som import skal lagres mot.
   * Brukes når coach importerer for spilleren via /admin/spillere/[id].
   * Når tom: bruker server-action default (innlogget user).
   */
  onBehalfOfUserId?: string;
};

const KILDER: Array<{
  id: Kilde;
  title: string;
  desc: string;
  icon: typeof FileText;
  ready: boolean;
}> = [
  {
    id: "csv",
    title: "CSV-fil",
    desc: "Eksportert fra TrackMan Sessions. Én rad per slag.",
    icon: FileText,
    ready: true,
  },
  {
    id: "html",
    title: "Multi Group HTML-rapport",
    desc: "Lagret som HTML fra TrackMan-nettleseren. Aggregert per kølle.",
    icon: FileCode,
    ready: true,
  },
];

export function TrackmanImportModal({
  variant = "primary",
  label = "Importer TrackMan",
  className,
  onBehalfOfUserId,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [steg, setSteg] = useState<Steg>(1);
  const [feil, setFeil] = useState<string | null>(null);

  // Steg 1 — kilde
  const [kilde, setKilde] = useState<Kilde | null>(null);

  // Felles
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [recordedAt, setRecordedAt] = useState(today);
  const [environment, setEnvironment] =
    useState<TrackManEnvironment>("SIMULATOR_INDOOR");
  const [filename, setFilename] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  // Steg 3 — preview shots (kun CSV)
  const [shots, setShots] = useState<TrackManShot[]>([]);
  const [valgt, setValgt] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  function reset() {
    setSteg(1);
    setKilde(null);
    setFilename(null);
    setCsvContent("");
    setHtmlContent("");
    setShots([]);
    setValgt(new Set());
    setEnvironment("SIMULATOR_INDOOR");
    setFeil(null);
  }

  function lukk() {
    setOpen(false);
    setTimeout(reset, 200);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    setFilename(fil.name);
    setFeil(null);
    const tekst = await fil.text();

    if (kilde === "csv") {
      setCsvContent(tekst);
      const parsed = parseTrackManCsv(tekst);
      if (!parsed.ok) {
        setFeil(parsed.error);
        setShots([]);
        return;
      }
      const alleShots = parsed.sessions.flatMap((s) => s.rawJson.shots);
      setShots(alleShots);
      setValgt(new Set(alleShots.map((_, i) => i)));
      if (parsed.sessions[0]?.recordedAt) {
        const d = parsed.sessions[0].recordedAt;
        setRecordedAt(d.toISOString().split("T")[0]);
      }
    } else if (kilde === "html") {
      setHtmlContent(tekst);
    }
  }

  function neste() {
    setFeil(null);
    if (steg === 1) {
      if (!kilde) {
        setFeil("Velg en kilde for å fortsette.");
        return;
      }
      const k = KILDER.find((x) => x.id === kilde);
      if (k && !k.ready) {
        setFeil("Denne kilden er ikke tilgjengelig ennå.");
        return;
      }
      setSteg(2);
      return;
    }
    if (steg === 2) {
      if (kilde === "csv" && shots.length === 0) {
        setFeil("Last opp en CSV-fil først.");
        return;
      }
      if (kilde === "html" && !htmlContent) {
        setFeil("Last opp en HTML-fil først.");
        return;
      }
      setSteg(kilde === "csv" ? 3 : 4);
      return;
    }
    if (steg === 3) {
      if (valgt.size === 0) {
        setFeil("Velg minst ett slag å importere.");
        return;
      }
      setSteg(4);
      return;
    }
  }

  function forrige() {
    setFeil(null);
    if (steg === 4 && kilde !== "csv") setSteg(2);
    else if (steg === 4) setSteg(3);
    else if (steg === 3) setSteg(2);
    else if (steg === 2) setSteg(1);
  }

  function importer() {
    setFeil(null);
    startTransition(async () => {
      try {
        if (kilde === "csv") {
          // Filtrer CSV til kun valgte slag.
          const filtrert = byggCsvFraValgte(csvContent, valgt);
          await importTrackManCsv({
            recordedAt,
            csvContent: filtrert,
            environment,
            ...(onBehalfOfUserId ? { onBehalfOfUserId } : {}),
          });
        } else if (kilde === "html") {
          await importTrackManHtml({
            recordedAt,
            htmlContent,
            environment,
            ...(onBehalfOfUserId ? { onBehalfOfUserId } : {}),
          });
        } else {
          throw new Error("Ikke implementert.");
        }
        toast.success(
          kilde === "csv"
            ? `TrackMan-økt importert · ${valgt.size} slag lagret`
            : "TrackMan-rapport importert",
        );
        lukk();
        router.refresh();
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke importere.");
      }
    });
  }

  function toggleAll() {
    if (valgt.size === shots.length) {
      setValgt(new Set());
    } else {
      setValgt(new Set(shots.map((_, i) => i)));
    }
  }

  function toggleOne(i: number) {
    setValgt((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const triggerClass =
    variant === "primary"
      ? "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      : variant === "secondary"
        ? "rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        : "text-xs font-medium text-primary hover:underline";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[triggerClass, className].filter(Boolean).join(" ")}
      >
        {label}
      </button>

      <dialog
        ref={dialogRef}
        onClose={lukk}
        className="m-0 mt-auto w-full max-h-[95vh] rounded-t-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 sm:m-auto sm:max-w-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Steg {steg} av 4
            </span>
            <h2 className="mt-1 font-display text-xl font-semibold leading-tight tracking-tight">
              <em className="font-normal text-primary md:italic">Importer</em>{" "}
              TrackMan
            </h2>
          </div>
          <button
            type="button"
            onClick={lukk}
            aria-label="Lukk"
            className="-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-9 sm:w-9"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Steg-indikator */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-6 py-2">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`h-1 flex-1 rounded-full ${
                n <= steg ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
          {steg === 1 && <Steg1 valgt={kilde} setValgt={setKilde} />}
          {steg === 2 && (
            <Steg2
              kilde={kilde}
              recordedAt={recordedAt}
              setRecordedAt={setRecordedAt}
              environment={environment}
              setEnvironment={setEnvironment}
              filename={filename}
              onFile={handleFile}
              shotsCount={shots.length}
            />
          )}
          {steg === 3 && (
            <Steg3
              shots={shots}
              valgt={valgt}
              toggleAll={toggleAll}
              toggleOne={toggleOne}
            />
          )}
          {steg === 4 && (
            <Steg4
              kilde={kilde}
              recordedAt={recordedAt}
              environment={environment}
              filename={filename}
              valgtCount={kilde === "csv" ? valgt.size : null}
              totalCount={kilde === "csv" ? shots.length : null}
            />
          )}
        </div>

        {feil && (
          <div
            role="alert"
            className="mx-6 mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            <AlertTriangle size={14} strokeWidth={1.75} className="mt-0.5" />
            <span>{feil}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/30 px-6 py-4">
          <button
            type="button"
            onClick={steg === 1 ? lukk : forrige}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
          >
            <ChevronLeft size={14} strokeWidth={1.75} />
            {steg === 1 ? "Avbryt" : "Tilbake"}
          </button>

          {steg < 4 ? (
            <button
              type="button"
              onClick={neste}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Neste
              <ChevronRight size={14} strokeWidth={1.75} />
            </button>
          ) : (
            <button
              type="button"
              onClick={importer}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Check size={14} strokeWidth={1.75} />
              {pending ? "Importerer…" : "Bekreft og importer"}
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}

/* ─────────────── Steg 1 ─────────────── */

function Steg1({
  valgt,
  setValgt,
}: {
  valgt: Kilde | null;
  setValgt: (k: Kilde) => void;
}) {
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Velg hvor TrackMan-dataene kommer fra.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {KILDER.map((k) => {
          const aktiv = valgt === k.id;
          const Icon = k.icon;
          return (
            <button
              key={k.id}
              type="button"
              onClick={() => k.ready && setValgt(k.id)}
              disabled={!k.ready}
              aria-pressed={aktiv}
              className={`group flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors ${
                aktiv
                  ? "border-primary bg-primary/[0.04]"
                  : k.ready
                    ? "border-border bg-card hover:border-primary/40"
                    : "cursor-not-allowed border-dashed border-border bg-muted/40 opacity-60"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <Icon
                  size={16}
                  strokeWidth={1.75}
                  className={aktiv ? "text-primary" : "text-muted-foreground"}
                />
                {!k.ready && (
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                    Snart
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-foreground">
                {k.title}
              </span>
              <span className="text-xs text-muted-foreground">{k.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── Steg 2 ─────────────── */

function Steg2({
  kilde,
  recordedAt,
  setRecordedAt,
  environment,
  setEnvironment,
  filename,
  onFile,
  shotsCount,
}: {
  kilde: Kilde | null;
  recordedAt: string;
  setRecordedAt: (s: string) => void;
  environment: TrackManEnvironment;
  setEnvironment: (e: TrackManEnvironment) => void;
  filename: string | null;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  shotsCount: number;
}) {
  const accept = kilde === "csv" ? ".csv,text/csv" : ".html,text/html";
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {kilde === "csv"
          ? "Last opp CSV eksportert fra TrackMan-appen. Vi parser hver rad som ett slag."
          : "Last opp HTML-rapporten fra Multi Group Report."}
      </p>

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
          onChange={(e) =>
            setEnvironment(e.target.value as TrackManEnvironment)
          }
          required
          className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          {ENVIRONMENT_OPTIONS.map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Fil
        </span>
        <input
          type="file"
          accept={accept}
          onChange={onFile}
          required
          className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-secondary-foreground"
        />
        {filename && (
          <span className="mt-1 block text-xs text-muted-foreground">
            Valgt: {filename}
            {kilde === "csv" && shotsCount > 0 && (
              <span className="text-foreground">
                {" "}
                · {shotsCount} slag parset
              </span>
            )}
          </span>
        )}
      </label>
    </div>
  );
}

/* ─────────────── Steg 3 ─────────────── */

function Steg3({
  shots,
  valgt,
  toggleAll,
  toggleOne,
}: {
  shots: TrackManShot[];
  valgt: Set<number>;
  toggleAll: () => void;
  toggleOne: (i: number) => void;
}) {
  const allSelected = valgt.size === shots.length && shots.length > 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Velg hvilke slag som skal lagres.
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="font-mono text-[11px] font-medium text-primary hover:underline"
        >
          {allSelected ? "Fjern alle" : "Velg alle"}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[24px_1fr_70px_70px_70px] gap-2 border-b border-border bg-muted/40 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <span />
          <span>Kølle</span>
          <span className="text-right">Carry</span>
          <span className="text-right">Ball</span>
          <span className="text-right">Smash</span>
        </div>
        <ul className="max-h-[300px] overflow-y-auto">
          {shots.map((s, i) => {
            const checked = valgt.has(i);
            return (
              <li
                key={i}
                className="grid grid-cols-[24px_1fr_70px_70px_70px] items-center gap-2 border-b border-border/60 px-4 py-2 text-sm last:border-0 hover:bg-muted/20"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleOne(i)}
                  className="h-4 w-4 rounded border-input accent-primary"
                  aria-label={`Slag ${i + 1}`}
                />
                <span className="truncate font-medium">
                  {s.club ?? "Ukjent"}
                </span>
                <span className="text-right font-mono tabular-nums">
                  {s.carryMeters != null ? `${s.carryMeters} m` : "—"}
                </span>
                <span className="text-right font-mono tabular-nums">
                  {s.ballSpeedMps != null ? s.ballSpeedMps.toFixed(1) : "—"}
                </span>
                <span className="text-right font-mono tabular-nums">
                  {s.smashFactor != null ? s.smashFactor.toFixed(2) : "—"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="font-mono text-[11px] text-muted-foreground">
        {valgt.size} av {shots.length} valgt
      </p>
    </div>
  );
}

/* ─────────────── Steg 4 ─────────────── */

function Steg4({
  kilde,
  recordedAt,
  environment,
  filename,
  valgtCount,
  totalCount,
}: {
  kilde: Kilde | null;
  recordedAt: string;
  environment: TrackManEnvironment;
  filename: string | null;
  valgtCount: number | null;
  totalCount: number | null;
}) {
  const envLabel = ENVIRONMENT_OPTIONS.find(([v]) => v === environment)?.[1];
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Bekreft import-detaljene før lagring.
      </p>
      <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        <Row label="Kilde" value={kildeLabel(kilde)} />
        <Row
          label="Dato"
          value={new Date(recordedAt).toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />
        <Row label="Treningsmiljø" value={envLabel ?? environment} />
        <Row label="Fil" value={filename ?? "—"} />
        {valgtCount != null && totalCount != null && (
          <Row label="Slag" value={`${valgtCount} av ${totalCount} valgt`} />
        )}
      </dl>
    </div>
  );
}

function kildeLabel(k: Kilde | null): string {
  if (!k) return "—";
  const f = KILDER.find((x) => x.id === k);
  return f?.title ?? "—";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-2 text-sm">
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

/* ─────────────── Helpers ─────────────── */

/**
 * Bygger en redusert CSV-streng som kun inneholder header + valgte rader.
 * Brukes for å re-importere kun de slagene brukeren har valgt i steg 3.
 */
function byggCsvFraValgte(csvContent: string, valgt: Set<number>): string {
  const linjer = csvContent
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => l.trim().length > 0);
  if (linjer.length < 2) return csvContent;
  const header = linjer[0];
  const rader = linjer.slice(1);
  const utvalgte = rader.filter((_, i) => valgt.has(i));
  return [header, ...utvalgte].join("\n");
}
