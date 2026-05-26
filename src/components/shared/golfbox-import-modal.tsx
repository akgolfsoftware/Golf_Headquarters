"use client";

/**
 * GolfBoxImportModal — gjenbrukbar modal for å importere runder fra GolfBox.
 *
 * 3-stegs intern flyt (ingen sidenavigasjon — animasjon mellom stegene):
 *   1. Autentisering — vis status eller knapp for å koble til (stub)
 *   2. Velg dato-range — to date inputs + quick-chips
 *   3. Preview & velg — tabell med checkbox per rad
 *
 * Server actions previewGolfBoxRounds + importFromGolfBox kalles fra modalen.
 * Duplikater detekteres på server og rendres som disabled rader.
 */
import {
  useCallback,
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
  Download,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import {
  importFromGolfBox,
  previewGolfBoxRounds,
  type GolfBoxPreviewRound,
} from "@/app/portal/mal/runder/actions";
import { useToast } from "@/components/shared/toast-provider";

type Steg = 1 | 2 | 3;

type Props = {
  /**
   * Variant for trigger-knappen. "primary" rendres som forest filled,
   * "secondary" som outline. "ghost" brukes når modalen åpnes uten knapp
   * (legg `open` selv).
   */
  variant?: "primary" | "secondary";
  className?: string;
};

const QUICK_RANGES: Array<{ label: string; days: number | "alt" | "sesong" }> = [
  { label: "Siste 30 dager", days: 30 },
  { label: "Siste 90 dager", days: 90 },
  { label: "Sesong 2025", days: "sesong" },
  { label: "Alt (2 år)", days: "alt" },
];

function isoDato(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDato(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function defaultFra(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return isoDato(d);
}

export function GolfBoxImportModal({
  variant = "secondary",
  className,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [steg, setSteg] = useState<Steg>(1);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  // Steg 1 — autentisering (stub: "tilkoblet")
  const [tilkoblet, setTilkoblet] = useState(true);
  const [koblerTil, setKoblerTil] = useState(false);

  // Steg 2 — dato-range
  const [fromDate, setFromDate] = useState<string>(defaultFra);
  const [toDate, setToDate] = useState<string>(() => isoDato(new Date()));

  // Steg 3 — preview
  const [previewLoading, setPreviewLoading] = useState(false);
  const [rounds, setRounds] = useState<GolfBoxPreviewRound[]>([]);
  const [valgte, setValgte] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  function lukk() {
    setOpen(false);
    // Reset state slik at modalen er ren neste gang.
    setTimeout(() => {
      setSteg(1);
      setFeil(null);
      setRounds([]);
      setValgte(new Set());
    }, 150);
  }

  const settQuickRange = (days: number | "alt" | "sesong") => {
    const til = new Date();
    let fra: Date;
    if (days === "alt") {
      fra = new Date();
      fra.setFullYear(fra.getFullYear() - 2);
    } else if (days === "sesong") {
      fra = new Date(2025, 3, 1); // april 2025
      const slutt = new Date(2025, 9, 31);
      setFromDate(isoDato(fra));
      setToDate(isoDato(slutt));
      return;
    } else {
      fra = new Date();
      fra.setDate(fra.getDate() - days);
    }
    setFromDate(isoDato(fra));
    setToDate(isoDato(til));
  };

  const hentPreview = useCallback(() => {
    setFeil(null);
    setPreviewLoading(true);
    startTransition(async () => {
      try {
        const res = await previewGolfBoxRounds({ fromDate, toDate });
        setRounds(res.rounds);
        // Default: velg alle ikke-duplikater.
        const auto = new Set(
          res.rounds.filter((r) => !r.duplicate).map((r) => r.externalId),
        );
        setValgte(auto);
        setSteg(3);
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "GolfBox svarer ikke — prøv igjen om litt";
        setFeil(msg);
      } finally {
        setPreviewLoading(false);
      }
    });
  }, [fromDate, toDate]);

  const toggleRad = (id: string) => {
    setValgte((prev) => {
      const neste = new Set(prev);
      if (neste.has(id)) neste.delete(id);
      else neste.add(id);
      return neste;
    });
  };

  const ikkeDup = rounds.filter((r) => !r.duplicate);
  const alleValgt =
    ikkeDup.length > 0 && ikkeDup.every((r) => valgte.has(r.externalId));

  const toggleAlle = () => {
    if (alleValgt) {
      setValgte(new Set());
    } else {
      setValgte(new Set(ikkeDup.map((r) => r.externalId)));
    }
  };

  const importer = () => {
    if (valgte.size === 0) {
      setFeil("Velg minst én runde for å importere.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      try {
        const res = await importFromGolfBox({
          fromDate,
          toDate,
          roundIds: Array.from(valgte),
        });
        const tekst =
          res.imported === 1
            ? "1 runde importert"
            : `${res.imported} runder importert`;
        toast.success(tekst);
        if (res.skipped > 0) {
          toast.info(
            res.skipped === 1
              ? "1 duplikat hoppet over"
              : `${res.skipped} duplikater hoppet over`,
          );
        }
        lukk();
        router.refresh();
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Kunne ikke importere — prøv igjen om litt";
        setFeil(msg);
      }
    });
  };

  const antallFunne = rounds.length;
  const antallDup = rounds.filter((r) => r.duplicate).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          (variant === "primary"
            ? "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            : "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary")
        }
      >
        <Download size={12} strokeWidth={1.75} aria-hidden /> Importer fra GolfBox
      </button>

      <dialog
        ref={dialogRef}
        onClose={lukk}
        aria-label="Importer runder fra GolfBox"
        className="m-0 mt-auto w-full max-h-[95vh] rounded-t-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 sm:m-auto sm:w-[760px] sm:max-w-[95vw] sm:rounded-2xl"
      >
        <div className="p-5 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div
                aria-hidden="true"
                className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
              >
                INTEGRASJON · NGF GOLFBOX
              </div>
              <h2 className="mt-1 font-display text-[22px] font-semibold leading-tight tracking-tight text-foreground">
                Importer fra <em className="font-normal text-primary md:italic">GolfBox</em>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <GolfBoxLogo />
              <button
                type="button"
                onClick={lukk}
                aria-label="Lukk modal"
                className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-foreground hover:text-foreground sm:h-9 sm:w-9"
              >
                <X size={18} strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          </div>

          {/* Steg-prikker */}
          <ol
            aria-label="Import-steg"
            className="mt-6 flex items-center gap-2"
          >
            {[1, 2, 3].map((n) => {
              const aktiv = n === steg;
              const ferdig = n < steg;
              return (
                <li key={n} className="flex flex-1 items-center gap-2">
                  <span
                    aria-current={aktiv ? "step" : undefined}
                    className={[
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-[10px] font-semibold tabular-nums",
                      ferdig
                        ? "border-primary bg-primary text-primary-foreground"
                        : aktiv
                          ? "border-primary bg-card text-primary"
                          : "border-border bg-card text-muted-foreground",
                    ].join(" ")}
                  >
                    {ferdig ? <Check size={12} strokeWidth={1.75} /> : n}
                  </span>
                  {n < 3 && (
                    <span
                      aria-hidden="true"
                      className={[
                        "h-px flex-1",
                        ferdig ? "bg-primary/60" : "bg-border",
                      ].join(" ")}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Innhold */}
          <div className="mt-6 min-h-[260px]">
            {steg === 1 && (
              <Steg1
                tilkoblet={tilkoblet}
                koblerTil={koblerTil}
                onKobleTil={() => {
                  setKoblerTil(true);
                  // Stub: simuler OAuth-popup.
                  window.setTimeout(() => {
                    setTilkoblet(true);
                    setKoblerTil(false);
                  }, 900);
                }}
                onKobleFra={() => setTilkoblet(false)}
              />
            )}

            {steg === 2 && (
              <Steg2
                fromDate={fromDate}
                toDate={toDate}
                onFromDate={setFromDate}
                onToDate={setToDate}
                onQuickRange={settQuickRange}
                loading={previewLoading}
              />
            )}

            {steg === 3 && (
              <Steg3
                rounds={rounds}
                valgte={valgte}
                alleValgt={alleValgt}
                onToggleRad={toggleRad}
                onToggleAlle={toggleAlle}
                antallFunne={antallFunne}
                antallDup={antallDup}
              />
            )}
          </div>

          {feil && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertTriangle
                size={16}
                strokeWidth={1.75}
                aria-hidden
                className="mt-0.5 shrink-0"
              />
              <span>{feil}</span>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => {
                setFeil(null);
                if (steg === 1) lukk();
                else setSteg((s) => (s - 1) as Steg);
              }}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border disabled:opacity-40"
            >
              <ChevronLeft size={14} strokeWidth={1.75} aria-hidden />
              {steg === 1 ? "Avbryt" : "Tilbake"}
            </button>

            {steg === 1 && (
              <button
                type="button"
                onClick={() => setSteg(2)}
                disabled={!tilkoblet || pending}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Velg dato-range <ChevronRight size={14} strokeWidth={1.75} />
              </button>
            )}

            {steg === 2 && (
              <button
                type="button"
                onClick={hentPreview}
                disabled={!fromDate || !toDate || pending || previewLoading}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {previewLoading ? (
                  <>
                    <Loader2
                      size={14}
                      strokeWidth={1.75}
                      className="animate-spin"
                      aria-hidden
                    />
                    Henter…
                  </>
                ) : (
                  <>
                    Forhåndsvis runder
                    <ChevronRight size={14} strokeWidth={1.75} aria-hidden />
                  </>
                )}
              </button>
            )}

            {steg === 3 && (
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {valgte.size} av {ikkeDup.length} valgt
                </span>
                <button
                  type="button"
                  onClick={importer}
                  disabled={pending || valgte.size === 0}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {pending ? (
                    <>
                      <Loader2
                        size={14}
                        strokeWidth={1.75}
                        className="animate-spin"
                        aria-hidden
                      />
                      Importerer…
                    </>
                  ) : (
                    <>
                      <Download size={14} strokeWidth={1.75} aria-hidden />
                      {valgte.size === 1
                        ? "Importer 1 runde"
                        : `Importer ${valgte.size} runder`}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

function Steg1({
  tilkoblet,
  koblerTil,
  onKobleTil,
  onKobleFra,
}: {
  tilkoblet: boolean;
  koblerTil: boolean;
  onKobleTil: () => void;
  onKobleFra: () => void;
}) {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold leading-tight text-foreground">
        Autentiser med GolfBox
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Vi henter runder via NIF GolfBox sin offisielle API. Tilkoblingen kan
        kobles fra når som helst.
      </p>

      <div className="mt-5">
        {tilkoblet ? (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check size={16} strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Tilkoblet som markus.r.pedersen@gfgk.no
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  Sist synket · I dag
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onKobleFra}
              className="text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
            >
              Koble fra
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={onKobleTil}
              disabled={koblerTil}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {koblerTil ? (
                <>
                  <Loader2
                    size={14}
                    strokeWidth={1.75}
                    className="animate-spin"
                    aria-hidden
                  />
                  Åpner GolfBox…
                </>
              ) : (
                <>
                  <RefreshCw size={14} strokeWidth={1.75} aria-hidden /> Koble til GolfBox
                </>
              )}
            </button>

            <details className="rounded-md border border-input bg-muted/30 px-4 py-3">
              <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Eller bruk NIF-ID + passord
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    NIF-ID / e-post
                  </span>
                  <input
                    type="text"
                    placeholder="medlemsnummer eller e-post"
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Passord
                  </span>
                  <input
                    type="password"
                    placeholder="GolfBox-passord"
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary"
                  />
                </label>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

function Steg2({
  fromDate,
  toDate,
  onFromDate,
  onToDate,
  onQuickRange,
  loading,
}: {
  fromDate: string;
  toDate: string;
  onFromDate: (v: string) => void;
  onToDate: (v: string) => void;
  onQuickRange: (days: number | "alt" | "sesong") => void;
  loading: boolean;
}) {
  // Estimat — vi vet ikke antall før vi henter, så vis "ukjent"-stub før preview.
  const dager = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const a = new Date(fromDate).getTime();
    const b = new Date(toDate).getTime();
    return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
  }, [fromDate, toDate]);

  return (
    <div>
      <h3 className="font-display text-lg font-semibold leading-tight text-foreground">
        Hvilken periode skal vi hente?
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Vi henter alle registrerte runder mellom valgte datoer. Max 2 år
        tilbake.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Fra
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDate(e.target.value)}
            max={toDate}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Til
          </span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            max={isoDato(new Date())}
            onChange={(e) => onToDate(e.target.value)}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_RANGES.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => onQuickRange(q.days)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary"
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-secondary/40 px-5 py-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Periode
        </div>
        <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
          {dager} dager
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {formatDato(fromDate)} – {formatDato(toDate)}
        </div>
        {loading && (
          <div className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <Loader2
              size={12}
              strokeWidth={1.75}
              className="animate-spin"
              aria-hidden
            />
            Henter fra GolfBox …
          </div>
        )}
      </div>
    </div>
  );
}

function Steg3({
  rounds,
  valgte,
  alleValgt,
  onToggleRad,
  onToggleAlle,
  antallFunne,
  antallDup,
}: {
  rounds: GolfBoxPreviewRound[];
  valgte: Set<string>;
  alleValgt: boolean;
  onToggleRad: (id: string) => void;
  onToggleAlle: () => void;
  antallFunne: number;
  antallDup: number;
}) {
  if (rounds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Fant ingen runder i valgt periode. Prøv en lengre dato-range.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display text-lg font-semibold leading-tight text-foreground">
        Velg runder å importere
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Fant <span className="font-mono tabular-nums text-foreground">{antallFunne}</span>{" "}
        runder · {antallDup > 0 ? (
          <span>
            <span className="font-mono tabular-nums text-foreground">{antallDup}</span>{" "}
            allerede importert (gråes ut).
          </span>
        ) : (
          "Ingen duplikater."
        )}
      </p>

      {/* Tabell — stack på mobil */}
      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
        <div
          className="hidden border-b border-border bg-muted/40 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:grid sm:items-center"
          style={{
            gridTemplateColumns: "32px 100px 1.4fr 70px 70px 70px",
            gap: "12px",
          }}
        >
          <label className="flex cursor-pointer items-center justify-center">
            <input
              type="checkbox"
              aria-label="Velg alle"
              checked={alleValgt}
              onChange={onToggleAlle}
              className="h-4 w-4 cursor-pointer accent-[color:var(--color-primary)]"
            />
          </label>
          <div>Dato</div>
          <div>Bane</div>
          <div>Score</div>
          <div>Slope</div>
          <div>Tee</div>
        </div>

        <ul>
          {rounds.map((r) => {
            const erValgt = valgte.has(r.externalId);
            const diff = r.score - r.par;
            return (
              <li
                key={r.externalId}
                className={[
                  "border-b border-border/60 last:border-0",
                  r.duplicate ? "bg-muted/40" : "bg-card",
                ].join(" ")}
              >
                <label
                  className={[
                    "grid grid-cols-1 items-center gap-2 px-4 py-3 transition-colors sm:gap-3 sm:py-2.5",
                    r.duplicate
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-muted/30",
                  ].join(" ")}
                  style={{
                    gridTemplateColumns:
                      "32px 100px 1.4fr 70px 70px 70px",
                  }}
                >
                  <span className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      aria-label={`Velg runde ${r.externalId}`}
                      checked={erValgt && !r.duplicate}
                      disabled={r.duplicate}
                      onChange={() => onToggleRad(r.externalId)}
                      className="h-4 w-4 cursor-pointer accent-[color:var(--color-primary)] disabled:cursor-not-allowed"
                    />
                  </span>
                  <span className="font-mono text-xs text-foreground tabular-nums">
                    {formatDato(r.playedAt)}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {r.courseName}
                    {r.duplicate && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                        <AlertTriangle
                          size={10}
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        Duplikat
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {r.score}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      ({diff > 0 ? "+" : ""}
                      {diff})
                    </span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {r.slope}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {r.tee}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * GolfBox-logo som SVG-mark. Rendres i grå tone (ikke selskapets blå-farge)
 * per AK Golf-branding-regler.
 */
function GolfBoxLogo() {
  return (
    <svg
      width="80"
      height="20"
      viewBox="0 0 80 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GolfBox"
      role="img"
      className="text-muted-foreground"
    >
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2" fill="currentColor" />
      <text
        x="22"
        y="14"
        fill="currentColor"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="600"
        fontSize="12"
        letterSpacing="0.02em"
      >
        GolfBox
      </text>
    </svg>
  );
}
