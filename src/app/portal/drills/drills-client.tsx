"use client";

/**
 * PlayerHQ · Drill-bibliotek · Klient-komponent
 *
 * - Filter-bar (anbefalt-toggle, disiplin-pills, skillArea-pills, MORAD, coach-anbefalt, søk)
 * - Visning-toggle (Grid/Liste)
 * - Sticky footer for samlet "Be om i neste plan"-forespørsel for valgte drills
 *
 * Bruker server-action `requestDrillInPlan` direkte.
 */
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  LayoutGrid,
  List,
  Loader2,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import type {
  PyramidArea,
  SkillArea,
  NgfKategori,
} from "@/generated/prisma/client";
import { requestDrillInPlan } from "./actions";

type DrillRow = {
  id: string;
  name: string;
  description: string | null;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
  morad: boolean;
  durationMin: number | null;
  csMin: number | null;
  csMax: number | null;
  defaultRepsSets: string | null;
  environment: string[];
  minKategori: NgfKategori | null;
  maxKategori: NgfKategori | null;
  videoUrl: string | null;
  coachAnbefalt: boolean;
  ganger: number;
  csForMeg: number | null;
};

const KATEGORI_RANK: Record<NgfKategori, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
};

const PYR_PILL: Record<PyramidArea, string> = {
  FYS: "bg-secondary text-secondary-foreground border-border",
  TEK: "bg-accent/30 text-accent-foreground border-accent/40",
  SLAG: "bg-primary/10 text-primary border-primary/30",
  SPILL: "bg-primary/10 text-primary border-primary/30",
  TURN: "bg-secondary text-secondary-foreground border-border",
};

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const SKILL_LABEL: Record<SkillArea, string> = {
  TEE_TOTAL: "Tee",
  TILNAERMING: "Tilnærming",
  AROUND_GREEN: "Around Green",
  PUTTING: "Putting",
  SPILL: "Spill",
};

const PYR_VALUES: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const SKILL_VALUES: SkillArea[] = [
  "TEE_TOTAL",
  "TILNAERMING",
  "AROUND_GREEN",
  "PUTTING",
  "SPILL",
];

export function DrillsLibraryClient({
  drills,
  spillerKategori,
  tier,
}: {
  drills: DrillRow[];
  spillerKategori: NgfKategori | null;
  tier: "GRATIS" | "PRO" | "ELITE";
}) {
  const [anbefaltForMeg, setAnbefaltForMeg] = useState(true);
  const [valgteDisipliner, setValgteDisipliner] = useState<Set<PyramidArea>>(
    new Set(),
  );
  const [valgteSkillAreas, setValgteSkillAreas] = useState<Set<SkillArea>>(
    new Set(),
  );
  const [kunMorad, setKunMorad] = useState(false);
  const [kunCoachAnbefalt, setKunCoachAnbefalt] = useState(false);
  const [sok, setSok] = useState("");
  const [visning, setVisning] = useState<"grid" | "liste">("grid");
  const [valgteDrills, setValgteDrills] = useState<Set<string>>(new Set());
  const [sendStatus, setSendStatus] = useState<"idle" | "ok" | "feil">("idle");
  const [pending, startTransition] = useTransition();

  const erGratis = tier === "GRATIS";
  const spillerRank =
    spillerKategori !== null ? KATEGORI_RANK[spillerKategori] : null;

  const filtrerte = useMemo(() => {
    return drills.filter((d) => {
      if (anbefaltForMeg && spillerRank !== null) {
        const minR =
          d.minKategori !== null ? KATEGORI_RANK[d.minKategori] : 0;
        const maxR =
          d.maxKategori !== null ? KATEGORI_RANK[d.maxKategori] : 11;
        if (spillerRank < minR || spillerRank > maxR) return false;
      }
      if (valgteDisipliner.size > 0 && !valgteDisipliner.has(d.pyramidArea))
        return false;
      if (
        valgteSkillAreas.size > 0 &&
        (!d.skillArea || !valgteSkillAreas.has(d.skillArea))
      )
        return false;
      if (kunMorad && !d.morad) return false;
      if (kunCoachAnbefalt && !d.coachAnbefalt) return false;
      if (sok.trim()) {
        const q = sok.trim().toLowerCase();
        if (
          !d.name.toLowerCase().includes(q) &&
          !(d.description?.toLowerCase().includes(q) ?? false)
        )
          return false;
      }
      return true;
    });
  }, [
    drills,
    anbefaltForMeg,
    spillerRank,
    valgteDisipliner,
    valgteSkillAreas,
    kunMorad,
    kunCoachAnbefalt,
    sok,
  ]);

  // GRATIS-tier-grense: max 20 synlige, kun anbefalt-for-meg.
  const synlige = useMemo(() => {
    if (erGratis) return filtrerte.slice(0, 20);
    return filtrerte;
  }, [filtrerte, erGratis]);

  function toggleSet<T>(set: Set<T>, value: T): Set<T> {
    const ny = new Set(set);
    if (ny.has(value)) ny.delete(value);
    else ny.add(value);
    return ny;
  }

  function toggleValgt(id: string) {
    setValgteDrills((prev) => toggleSet(prev, id));
  }

  async function handleSendForespørsel() {
    if (valgteDrills.size === 0) return;
    setSendStatus("idle");
    startTransition(async () => {
      const ids = Array.from(valgteDrills);
      let alleOk = true;
      for (const id of ids) {
        const res = await requestDrillInPlan(id);
        if (!res.ok) alleOk = false;
      }
      if (alleOk) {
        setSendStatus("ok");
        setValgteDrills(new Set());
      } else {
        setSendStatus("feil");
      }
    });
  }

  function resetFiltre() {
    setAnbefaltForMeg(true);
    setValgteDisipliner(new Set());
    setValgteSkillAreas(new Set());
    setKunMorad(false);
    setKunCoachAnbefalt(false);
    setSok("");
  }

  const harAktiveFiltre =
    !anbefaltForMeg ||
    valgteDisipliner.size > 0 ||
    valgteSkillAreas.size > 0 ||
    kunMorad ||
    kunCoachAnbefalt ||
    sok.trim().length > 0;

  return (
    <div className="space-y-6 pb-32 md:pb-24">
      {/* Filter-bar */}
      <section
        aria-label="Filtre"
        className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6"
      >
        {/* Søk + toggles */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label
            htmlFor="drill-sok"
            className="relative flex h-11 w-full items-center rounded-md border border-input bg-background pl-10 pr-3 focus-within:ring-2 focus-within:ring-ring md:max-w-sm"
          >
            <Search
              className="absolute left-3 h-4 w-4 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              id="drill-sok"
              type="search"
              placeholder="Søk i drills..."
              value={sok}
              onChange={(e) => setSok(e.target.value)}
              className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip
              active={anbefaltForMeg}
              onClick={() => setAnbefaltForMeg((v) => !v)}
              label="Anbefalt for meg"
              disabled={erGratis}
            />
            <ToggleChip
              active={kunMorad}
              onClick={() => setKunMorad((v) => !v)}
              label="Kun MORAD"
            />
            <ToggleChip
              active={kunCoachAnbefalt}
              onClick={() => setKunCoachAnbefalt((v) => !v)}
              label="Coach-anbefalt"
            />

            <div
              role="group"
              aria-label="Visning"
              className="ml-1 inline-flex h-11 items-center overflow-hidden rounded-md border border-input bg-background"
            >
              <button
                type="button"
                onClick={() => setVisning("grid")}
                className={`flex h-full items-center gap-1.5 px-3 text-sm ${
                  visning === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={visning === "grid"}
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setVisning("liste")}
                className={`flex h-full items-center gap-1.5 px-3 text-sm ${
                  visning === "liste"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={visning === "liste"}
              >
                <List className="h-4 w-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">Liste</span>
              </button>
            </div>
          </div>
        </div>

        {/* Disiplin-pills */}
        <FilterRad
          label="Disiplin"
          options={PYR_VALUES.map((v) => ({ value: v, label: PYR_LABEL[v] }))}
          valgt={valgteDisipliner}
          onToggle={(v) =>
            setValgteDisipliner((prev) => toggleSet(prev, v as PyramidArea))
          }
        />

        {/* SkillArea-pills */}
        <FilterRad
          label="Område"
          options={SKILL_VALUES.map((v) => ({
            value: v,
            label: SKILL_LABEL[v],
          }))}
          valgt={valgteSkillAreas}
          onToggle={(v) =>
            setValgteSkillAreas((prev) => toggleSet(prev, v as SkillArea))
          }
        />

        {harAktiveFiltre && (
          <button
            type="button"
            onClick={resetFiltre}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-input bg-background px-4 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            Nullstill filtre
          </button>
        )}
      </section>

      {/* Resultat-teller */}
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {synlige.length} drill{synlige.length === 1 ? "" : "s"}
          {erGratis && filtrerte.length > synlige.length && (
            <> · {filtrerte.length - synlige.length} skjult i gratis</>
          )}
        </span>
        {valgteDrills.size > 0 && (
          <button
            type="button"
            onClick={() => setValgteDrills(new Set())}
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
          >
            Fjern valg ({valgteDrills.size})
          </button>
        )}
      </div>

      {/* Resultat */}
      {synlige.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="font-display text-xl italic text-muted-foreground">
            Ingen drills matcher filtrene.
          </p>
          <button
            type="button"
            onClick={resetFiltre}
            className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Nullstill filtre
          </button>
        </div>
      ) : visning === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {synlige.map((d) => (
            <DrillCard
              key={d.id}
              drill={d}
              valgt={valgteDrills.has(d.id)}
              onToggleValgt={() => toggleValgt(d.id)}
              erGratis={erGratis}
            />
          ))}
        </div>
      ) : (
        <DrillsListe
          drills={synlige}
          valgte={valgteDrills}
          onToggle={toggleValgt}
          erGratis={erGratis}
        />
      )}

      {/* Sticky footer — send forespørsel */}
      {valgteDrills.size > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 px-4 md:bottom-6">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-card/95 px-4 py-3 shadow-lg backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <Sparkles
                className="h-4 w-4 text-primary"
                strokeWidth={1.75}
              />
              <p className="text-sm">
                <span className="font-display text-base font-semibold">
                  {valgteDrills.size}
                </span>{" "}
                drill{valgteDrills.size === 1 ? "" : "s"} valgt
                <span className="hidden text-muted-foreground sm:inline">
                  {" "}
                  · sendes til Anders
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleSendForespørsel}
              disabled={pending}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              ) : (
                <Send className="h-4 w-4" strokeWidth={1.75} />
              )}
              Send forespørsel
            </button>
          </div>
        </div>
      )}

      {sendStatus === "ok" && (
        <div className="fixed inset-x-0 bottom-32 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-primary/30 bg-card px-4 py-3 shadow-lg">
          <CheckCircle2
            className="h-5 w-5 text-primary"
            strokeWidth={1.75}
          />
          <p className="text-sm">
            Forespørselen er sendt til Anders. Du får svar i varsler.
          </p>
          <button
            type="button"
            onClick={() => setSendStatus("idle")}
            className="ml-auto text-muted-foreground hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      )}
      {sendStatus === "feil" && (
        <div className="fixed inset-x-0 bottom-32 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-destructive/40 bg-card px-4 py-3 shadow-lg">
          <p className="text-sm text-destructive">
            Noe gikk galt. Prøv igjen.
          </p>
          <button
            type="button"
            onClick={() => setSendStatus("idle")}
            className="ml-auto text-muted-foreground hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex h-9 items-center rounded-full border px-4 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background text-foreground hover:border-border hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}

function FilterRad({
  label,
  options,
  valgt,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  valgt: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}:
      </span>
      {options.map((o) => {
        const aktiv = valgt.has(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            aria-pressed={aktiv}
            className={`inline-flex h-9 items-center rounded-full border px-4 text-xs font-medium transition-colors ${
              aktiv
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-foreground hover:border-border hover:bg-secondary"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function DrillCard({
  drill,
  valgt,
  onToggleValgt,
  erGratis,
}: {
  drill: DrillRow;
  valgt: boolean;
  onToggleValgt: () => void;
  erGratis: boolean;
}) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        valgt ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
    >
      {drill.coachAnbefalt && (
        <span className="absolute -right-1 -top-1 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-foreground shadow-sm">
          <Sparkles className="h-3 w-3" strokeWidth={1.75} />
          Anbefalt
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/portal/drills/${drill.id}`}
          className="flex-1 font-display text-base font-semibold leading-tight text-foreground hover:text-primary"
        >
          {drill.name}
        </Link>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${PYR_PILL[drill.pyramidArea]}`}
        >
          {PYR_LABEL[drill.pyramidArea]}
        </span>
        {drill.skillArea && (
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-secondary-foreground">
            {SKILL_LABEL[drill.skillArea]}
          </span>
        )}
        {drill.morad && (
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
            MORAD
          </span>
        )}
      </div>

      {drill.description && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {drill.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
        {drill.durationMin !== null && <span>{drill.durationMin} min</span>}
        {drill.csForMeg !== null && (
          <span className="text-foreground">CS-target {drill.csForMeg}</span>
        )}
        {drill.environment.length > 0 && (
          <span>{drill.environment[0]}</span>
        )}
      </div>

      {drill.ganger > 0 && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Trent {drill.ganger} gang{drill.ganger === 1 ? "" : "er"}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleValgt}
          disabled={erGratis}
          aria-pressed={valgt}
          className={`inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            valgt
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground hover:opacity-90"
          }`}
        >
          {valgt ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Valgt
            </>
          ) : (
            "Be om i neste plan"
          )}
        </button>
        <Link
          href={`/portal/drills/${drill.id}`}
          className="inline-flex h-9 items-center justify-center rounded-full border border-input bg-background px-3 text-xs font-medium text-foreground hover:bg-secondary"
        >
          Vis detaljer
        </Link>
      </div>
    </article>
  );
}

function DrillsListe({
  drills,
  valgte,
  onToggle,
  erGratis,
}: {
  drills: DrillRow[];
  valgte: Set<string>;
  onToggle: (id: string) => void;
  erGratis: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Drill
            </th>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Disiplin
            </th>
            <th className="hidden px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground sm:table-cell">
              Varighet
            </th>
            <th className="hidden px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground sm:table-cell">
              CS
            </th>
            <th className="hidden px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground md:table-cell">
              Trent
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {drills.map((d) => {
            const valgt = valgte.has(d.id);
            return (
              <tr key={d.id} className={valgt ? "bg-primary/5" : ""}>
                <td className="px-4 py-3">
                  <Link
                    href={`/portal/drills/${d.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {d.name}
                  </Link>
                  {d.coachAnbefalt && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-accent-foreground">
                      Anbefalt
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${PYR_PILL[d.pyramidArea]}`}
                  >
                    {PYR_LABEL[d.pyramidArea]}
                  </span>
                </td>
                <td className="hidden px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground sm:table-cell">
                  {d.durationMin !== null ? `${d.durationMin} min` : "—"}
                </td>
                <td className="hidden px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground sm:table-cell">
                  {d.csForMeg !== null ? d.csForMeg : "—"}
                </td>
                <td className="hidden px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground md:table-cell">
                  {d.ganger > 0 ? `${d.ganger}x` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onToggle(d.id)}
                    disabled={erGratis}
                    aria-pressed={valgt}
                    className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      valgt
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground hover:opacity-90"
                    }`}
                  >
                    {valgt ? "Valgt" : "Be om"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
