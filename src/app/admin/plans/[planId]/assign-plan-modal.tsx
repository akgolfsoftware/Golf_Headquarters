"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronLeft,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import type { Tier } from "@/generated/prisma/client";
import { assignPlanToPlayers } from "./actions";

export type AssignSpiller = {
  id: string;
  name: string;
  hcp: number | null;
  homeClub: string | null;
  tier: Tier;
  /**
   * Aktive planer som overlapper perioden — brukes for konflikt-deteksjon.
   * Tom array hvis ingen konflikter.
   */
  aktivePlaner: { id: string; name: string }[];
};

type Steg = 1 | 2;

type Props = {
  planId: string;
  planNavn: string;
  planVarighetUker: number;
  planTier?: Tier;
  spillere: AssignSpiller[];
  onClose: () => void;
};

function nesteMandag(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = søndag, 1 = mandag
  const offset = ((8 - day) % 7) || 7;
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function leggTilDager(isoDate: string, dager: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + dager);
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const FILTER_CHIPS = [
  { key: "ALLE", label: "Mine spillere" },
  { key: "GFGK", label: "GFGK" },
  { key: "WANG", label: "WANG" },
  { key: "JUNIOR", label: "Junior" },
  { key: "SENIOR", label: "Senior" },
] as const;

type FilterKey = (typeof FILTER_CHIPS)[number]["key"];

export function AssignPlanToPlayerModal({
  planId,
  planNavn,
  planVarighetUker,
  planTier = "PRO",
  spillere,
  onClose,
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sokRef = useRef<HTMLInputElement>(null);

  const [steg, setSteg] = useState<Steg>(1);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [suksess, setSuksess] = useState<string | null>(null);

  const [sok, setSok] = useState("");
  const [filter, setFilter] = useState<FilterKey>("ALLE");
  const [valgte, setValgte] = useState<Set<string>>(new Set());

  const [startDato, setStartDato] = useState<string>(nesteMandag());
  const [velkomst, setVelkomst] = useState<string>(
    `Du har fått en ny treningsplan: ${planNavn}. Si fra om noe må justeres før vi starter.`,
  );
  const [erstattAktive, setErstattAktive] = useState<boolean>(false);
  const [varselEpost, setVarselEpost] = useState<boolean>(true);
  const [varselPush, setVarselPush] = useState<boolean>(true);
  const [varselSms, setVarselSms] = useState<boolean>(false);

  useEffect(() => {
    dialogRef.current?.showModal();
    requestAnimationFrame(() => sokRef.current?.focus());
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        lukk();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrer + søk
  const filtrerteSpillere = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return spillere.filter((s) => {
      // Tier-restriksjon: GRATIS-spillere kan ikke få PRO-plan
      if (planTier === "PRO" && s.tier === "GRATIS") {
        // De vises men er disabled — håndteres i UI
      }
      if (filter === "GFGK") {
        if (!(s.homeClub ?? "").toLowerCase().includes("gfgk")) return false;
      } else if (filter === "WANG") {
        if (!(s.homeClub ?? "").toLowerCase().includes("wang")) return false;
      } else if (filter === "JUNIOR") {
        if (s.hcp == null || s.hcp > 18) return false;
      } else if (filter === "SENIOR") {
        if (s.hcp != null && s.hcp <= 18) return false;
      }
      if (!q) return true;
      const navn = s.name.toLowerCase();
      const klubb = (s.homeClub ?? "").toLowerCase();
      return navn.includes(q) || klubb.includes(q);
    });
  }, [spillere, sok, filter, planTier]);

  const valgteSpillere = useMemo(
    () => spillere.filter((s) => valgte.has(s.id)),
    [spillere, valgte],
  );

  const konflikter = useMemo(
    () => valgteSpillere.filter((s) => s.aktivePlaner.length > 0),
    [valgteSpillere],
  );

  function toggleSpiller(id: string, disabled: boolean) {
    if (disabled) return;
    setValgte((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function lukk() {
    dialogRef.current?.close();
    onClose();
  }

  function tilbake() {
    setFeil(null);
    setSteg(1);
  }

  function videre() {
    if (valgte.size === 0) {
      setFeil("Velg minst én spiller.");
      return;
    }
    setFeil(null);
    setSteg(2);
  }

  function bekreft(e: FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (valgte.size === 0) {
      setFeil("Velg minst én spiller.");
      setSteg(1);
      return;
    }
    if (!startDato) {
      setFeil("Velg startdato.");
      return;
    }
    startTransition(async () => {
      const res = await assignPlanToPlayers({
        planId,
        playerIds: Array.from(valgte),
        startDate: startDato,
        welcomeMessage: velkomst.trim() || undefined,
        replaceActive: erstattAktive,
      });
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      setSuksess(
        `Planen er tildelt til ${res.assignedCount} spiller${
          res.assignedCount === 1 ? "" : "e"
        }.`,
      );
      router.refresh();
      setTimeout(() => {
        lukk();
      }, 1200);
    });
  }

  const sluttDatoLabel = useMemo(() => {
    return leggTilDager(startDato, planVarighetUker * 7);
  }, [startDato, planVarighetUker]);

  const dispoableTierPills: Record<Tier, { label: string; cls: string }> = {
    GRATIS: {
      label: "GRATIS",
      cls: "bg-secondary text-muted-foreground",
    },
    PRO: { label: "PRO", cls: "bg-accent text-accent-foreground" },
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-modal="true"
      aria-labelledby="assign-plan-title"
      className="m-0 h-full max-h-full w-full max-w-full rounded-none border-0 bg-card p-0 shadow-xl backdrop:bg-foreground/40 backdrop:backdrop-blur-sm sm:m-auto sm:h-auto sm:max-h-[90vh] sm:max-w-[720px] sm:rounded-2xl sm:border sm:border-border"
    >
      <form onSubmit={bekreft} className="p-4 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              PLAN-MAL · {planVarighetUker} UKER ·{" "}
              <span className={planTier === "PRO" ? "text-primary" : ""}>
                {planTier}-TIER
              </span>
            </div>
            <h3
              id="assign-plan-title"
              className="mt-1 font-display text-[22px] font-semibold leading-tight tracking-tight"
            >
              Tildel plan:{" "}
              <span className="font-display italic text-primary">
                {planNavn}
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={lukk}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Steg-indikator */}
        <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <span
            className={
              steg === 1 ? "text-foreground" : "text-muted-foreground"
            }
          >
            1 · Velg spillere
          </span>
          <span>›</span>
          <span
            className={
              steg === 2 ? "text-foreground" : "text-muted-foreground"
            }
          >
            2 · Konfigurer & bekreft
          </span>
        </div>

        {steg === 1 && (
          <div className="space-y-4">
            {/* Søkefelt */}
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
              />
              <input
                ref={sokRef}
                type="text"
                value={sok}
                onChange={(e) => setSok(e.target.value)}
                placeholder="Søk på navn eller klubb…"
                className="w-full rounded-md border border-input bg-card py-2 pl-8 pr-4 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
                autoComplete="off"
                aria-label="Søk spillere"
              />
            </div>

            {/* Filter-chips */}
            <div className="flex flex-wrap gap-2">
              {FILTER_CHIPS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setFilter(c.key)}
                  className={`rounded-full border px-4 py-1 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors ${
                    filter === c.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Spiller-liste */}
            <div className="max-h-[50vh] sm:max-h-[360px] overflow-y-auto rounded-md border border-border bg-background">
              {filtrerteSpillere.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Ingen spillere matcher.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filtrerteSpillere.map((s) => {
                    const tierDisabled =
                      planTier === "PRO" && s.tier === "GRATIS";
                    const valgt = valgte.has(s.id);
                    const konflikt = s.aktivePlaner.length > 0;
                    const initialer = s.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <li key={s.id}>
                        <label
                          className={`flex cursor-pointer items-center gap-2 px-4 py-2 transition-colors ${
                            tierDisabled
                              ? "cursor-not-allowed opacity-50"
                              : valgt
                                ? "bg-primary/5"
                                : "hover:bg-secondary"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={valgt}
                            disabled={tierDisabled}
                            onChange={() =>
                              toggleSpiller(s.id, tierDisabled)
                            }
                            className="h-4 w-4 shrink-0 rounded border-input text-primary focus:ring-ring/30"
                            aria-label={`Velg ${s.name}`}
                          />
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[11px] font-semibold text-foreground"
                            aria-hidden="true"
                          >
                            {initialer}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-foreground">
                              {s.name}
                            </span>
                            <span className="block truncate font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                              {s.homeClub ?? "Uten klubb"} · HCP{" "}
                              <span className="tabular-nums">
                                {s.hcp ?? "–"}
                              </span>
                            </span>
                            {konflikt && (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] text-amber-900">
                                <AlertTriangle
                                  className="h-3 w-3"
                                  strokeWidth={1.75}
                                />
                                Har {s.aktivePlaner.length} aktiv
                                {s.aktivePlaner.length === 1 ? "" : "e"} plan
                                {s.aktivePlaner.length === 1 ? "" : "er"}
                              </span>
                            )}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${dispoableTierPills[s.tier].cls}`}
                          >
                            {dispoableTierPills[s.tier].label}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
              <span>
                {valgte.size} av {spillere.length} spillere valgt
              </span>
              {valgte.size > 0 && (
                <button
                  type="button"
                  onClick={() => setValgte(new Set())}
                  className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Fjern alle
                </button>
              )}
            </div>
          </div>
        )}

        {steg === 2 && (
          <div className="space-y-6">
            {/* Sammendrag */}
            <div className="rounded-md border border-border bg-secondary/40 px-4 py-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {valgteSpillere.length} mottakere
              </div>
              <div className="mt-1 text-[13px] text-foreground">
                {valgteSpillere
                  .slice(0, 6)
                  .map((s) => s.name)
                  .join(", ")}
                {valgteSpillere.length > 6 &&
                  ` +${valgteSpillere.length - 6} til`}
              </div>
            </div>

            {/* Start-dato */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <Calendar className="h-3 w-3" strokeWidth={1.75} />
                  Startdato
                </span>
                <input
                  type="date"
                  value={startDato}
                  onChange={(e) => setStartDato(e.target.value)}
                  className="w-full rounded-md border border-input bg-card px-4 py-2 font-mono text-sm tabular-nums text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
                  required
                />
              </label>
              <div className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Sluttdato (auto)
                </span>
                <div className="rounded-md border border-border bg-muted px-4 py-2 font-mono text-sm tabular-nums text-muted-foreground">
                  {sluttDatoLabel}
                </div>
              </div>
            </div>

            {/* Konflikt-varsel */}
            {konflikter.length > 0 && (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                    strokeWidth={1.75}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-amber-900">
                      {konflikter.length} spiller
                      {konflikter.length === 1 ? "" : "e"} har plan
                      {konflikter.length === 1 ? "" : "er"} som overlapper
                    </div>
                    <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-amber-900/90">
                      {konflikter.slice(0, 5).map((k) => (
                        <li key={k.id}>
                          {k.name} — {k.aktivePlaner[0]?.name ?? "aktiv plan"}
                          {k.aktivePlaner.length > 1
                            ? ` (+${k.aktivePlaner.length - 1} til)`
                            : ""}
                        </li>
                      ))}
                      {konflikter.length > 5 && (
                        <li>+{konflikter.length - 5} til</li>
                      )}
                    </ul>
                    <label className="mt-2 flex items-start gap-2 text-[12px] text-amber-900">
                      <input
                        type="checkbox"
                        checked={erstattAktive}
                        onChange={(e) => setErstattAktive(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-700 focus:ring-amber-400/40"
                      />
                      <span>
                        Erstatt eksisterende aktive planer (arkiver dem
                        automatisk). Ulvalgt = kjør parallelt.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Velkomst-melding */}
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Velkomst-melding til spiller
              </span>
              <textarea
                value={velkomst}
                onChange={(e) => setVelkomst(e.target.value)}
                rows={3}
                maxLength={600}
                className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
                placeholder="Kort melding spilleren ser i varselet."
              />
              <span className="mt-1 block text-right font-mono text-[10px] text-muted-foreground">
                {velkomst.length}/600
              </span>
            </label>

            {/* Notifikasjon-kanaler */}
            <div>
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Send varsel via
              </span>
              <div className="flex flex-wrap gap-2">
                <KanalToggle
                  label="In-app"
                  active={varselPush}
                  onToggle={() => setVarselPush((v) => !v)}
                />
                <KanalToggle
                  label="E-post"
                  active={varselEpost}
                  onToggle={() => setVarselEpost((v) => !v)}
                />
                <KanalToggle
                  label="SMS"
                  active={varselSms}
                  onToggle={() => setVarselSms((v) => !v)}
                  disabled
                />
              </div>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                In-app varsel sendes alltid. E-post og SMS er reservert for
                fremtidig integrasjon.
              </p>
            </div>
          </div>
        )}

        {feil && (
          <div
            role="alert"
            className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            {feil}
          </div>
        )}

        {suksess && (
          <div
            role="status"
            className="mt-6 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-foreground"
          >
            {suksess}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
          {steg === 2 ? (
            <button
              type="button"
              onClick={tilbake}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              Tilbake
            </button>
          ) : (
            <button
              type="button"
              onClick={lukk}
              disabled={pending}
              className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              Avbryt
            </button>
          )}

          {steg === 1 ? (
            <button
              type="button"
              onClick={videre}
              disabled={valgte.size === 0}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <UserPlus className="h-4 w-4" strokeWidth={1.75} />
              Videre — konfigurer
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending || valgte.size === 0}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-4 w-4" strokeWidth={1.75} />
              {pending
                ? "Tildeler…"
                : `Tildel til ${valgte.size} spiller${
                    valgte.size === 1 ? "" : "e"
                  }`}
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}

function KanalToggle({
  label,
  active,
  onToggle,
  disabled,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors ${
        disabled
          ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-60"
          : active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
      }`}
      aria-pressed={active}
    >
      {active && !disabled && (
        <Check className="h-3 w-3" strokeWidth={1.75} />
      )}
      {label}
    </button>
  );
}
