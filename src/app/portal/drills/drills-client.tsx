"use client";

/**
 * PlayerHQ · Drill-bibliotek · Klient-komponent
 *
 * - Filter-bar (anbefalt-toggle, disiplin-pills, skillArea-pills, MORAD, coach-anbefalt, søk)
 * - Kompakte drill-cards → klikk åpner slide-in modal med full drill-info
 * - Visning-toggle (Grid/Liste)
 * - Sticky footer for samlet "Be om i neste plan"-forespørsel
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  LayoutGrid,
  List,
  Loader2,
  Search,
  Send,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";
import type {
  DrillFasilitet,
  DrillPracticeType,
  NgfKategori,
  PyramidArea,
  SkillArea,
} from "@/generated/prisma/client";
import { requestDrillInPlan } from "./actions";
import { rateDrill } from "./[id]/actions";

/* ─── Typer ─── */

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
  defaultSets: number | null;
  defaultReps: number | null;
  environment: string[];
  fasilitetKrav: DrillFasilitet[];
  minKategori: NgfKategori | null;
  maxKategori: NgfKategori | null;
  videoUrl: string | null;
  coachAnbefalt: boolean;
  ganger: number;
  csForMeg: number | null;
  utstyr: string[];
  intensitet: number | null;
  lPhases: string[];
  tags: string[];
  coachNotes: string | null;
  treningstype: DrillPracticeType | null;
  prerequisites: string[];
};

type RatingType = {
  id: string;
  label: string;
  rating: number;
};

/* ─── Konstanter ─── */

const RATING_TYPER: RatingType[] = [
  { id: "aha", label: "Aha!", rating: 5 },
  { id: "utfordrende", label: "Utfordrende", rating: 4 },
  { id: "passe", label: "Passe", rating: 3 },
  { id: "kjedelig", label: "Kjedelig", rating: 2 },
  { id: "for_vanskelig", label: "For vanskelig", rating: 1 },
];

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

const TRENINGSTYPE_LABEL: Record<DrillPracticeType, string> = {
  BLOKK: "Blokktrening",
  VARIABEL: "Variabel",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spill / test",
};

const LPHASE_LABEL: Record<string, string> = {
  GRUNN: "Grunnfase",
  SPESIAL: "Spesialfase",
  TURNERING: "Turneringsfase",
};

const ENV_LABEL: Record<string, string> = {
  RANGE: "Driving range",
  BANE: "Bane",
  STUDIO: "Studio",
  HJEM: "Hjemme",
  SIMULATOR: "Simulator",
};

const FASILITET_LABEL: Partial<Record<DrillFasilitet, string>> = {
  RADAR: "Radar / Launch monitor",
  MAT_NET: "Matte + nett",
  BUNKER: "Bunker",
  KAMERA: "Kamera",
  PUTTING_GREEN_KORT: "Putting green (kort)",
  PUTTING_GREEN_LANG: "Putting green (lang)",
  SHORT_GAME_AREA: "Short game-areal",
  DRIVING_RANGE: "Driving range",
  BANE: "Bane",
  SIMULATOR: "Simulator",
  VEKTSTANG: "Vektstang",
  TRAPBAR: "Trapbar",
  LOPEBANE: "Løpebane",
  MED_BALL: "Medisinball",
};

const PYR_VALUES: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const SKILL_VALUES: SkillArea[] = [
  "TEE_TOTAL",
  "TILNAERMING",
  "AROUND_GREEN",
  "PUTTING",
  "SPILL",
];

/* ─── Hoved-komponent ─── */

export function DrillsLibraryClient({
  drills,
  spillerKategori,
  tier,
  spillerFasiliteter,
  mestretIds,
}: {
  drills: DrillRow[];
  spillerKategori: NgfKategori | null;
  tier: "GRATIS" | "PRO" | "ELITE";
  spillerFasiliteter: DrillFasilitet[];
  mestretIds?: string[];
}) {
  const mestretSet = useMemo(
    () => new Set(mestretIds ?? []),
    [mestretIds],
  );
  const harFasilitetProfil = spillerFasiliteter.length > 0;
  const [anbefaltForMeg, setAnbefaltForMeg] = useState(true);
  const [kunMineAnlegg, setKunMineAnlegg] = useState(harFasilitetProfil);
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
  const [aapentDrill, setAapentDrill] = useState<DrillRow | null>(null);

  const erGratis = tier === "GRATIS";
  const spillerRank =
    spillerKategori !== null ? KATEGORI_RANK[spillerKategori] : null;

  // Body scroll lock når modal er åpen
  useEffect(() => {
    if (aapentDrill) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [aapentDrill]);

  // Escape-tast lukker modal
  useEffect(() => {
    if (!aapentDrill) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAapentDrill(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [aapentDrill]);

  const aapneDrill = useCallback((drill: DrillRow) => {
    setAapentDrill(drill);
  }, []);

  const filtrerte = useMemo(() => {
    const fasilitetSet = new Set(spillerFasiliteter);

    return drills.filter((d) => {
      if (anbefaltForMeg && spillerRank !== null) {
        const minR =
          d.minKategori !== null ? KATEGORI_RANK[d.minKategori] : 0;
        const maxR =
          d.maxKategori !== null ? KATEGORI_RANK[d.maxKategori] : 11;
        if (spillerRank < minR || spillerRank > maxR) return false;
      }
      if (kunMineAnlegg && harFasilitetProfil && d.fasilitetKrav.length > 0) {
        const kanGjennomfores = d.fasilitetKrav.every((k) =>
          fasilitetSet.has(k),
        );
        if (!kanGjennomfores) return false;
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
    kunMineAnlegg,
    harFasilitetProfil,
    spillerFasiliteter,
    valgteDisipliner,
    valgteSkillAreas,
    kunMorad,
    kunCoachAnbefalt,
    sok,
  ]);

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
    setKunMineAnlegg(harFasilitetProfil);
    setValgteDisipliner(new Set());
    setValgteSkillAreas(new Set());
    setKunMorad(false);
    setKunCoachAnbefalt(false);
    setSok("");
  }

  const harAktiveFiltre =
    !anbefaltForMeg ||
    (harFasilitetProfil && !kunMineAnlegg) ||
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
            {harFasilitetProfil && (
              <ToggleChip
                active={kunMineAnlegg}
                onClick={() => setKunMineAnlegg((v) => !v)}
                label="Mine anlegg"
                highlight
              />
            )}
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

        <FilterRad
          label="Disiplin"
          options={PYR_VALUES.map((v) => ({ value: v, label: PYR_LABEL[v] }))}
          valgt={valgteDisipliner}
          onToggle={(v) =>
            setValgteDisipliner((prev) => toggleSet(prev, v as PyramidArea))
          }
        />

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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {synlige.map((d) => (
            <DrillCard
              key={d.id}
              drill={d}
              valgt={valgteDrills.has(d.id)}
              onToggleValgt={() => toggleValgt(d.id)}
              onAapen={() => aapneDrill(d)}
              erGratis={erGratis}
              mestret={mestretSet.has(d.id)}
            />
          ))}
        </div>
      ) : (
        <DrillsListe
          drills={synlige}
          valgte={valgteDrills}
          onToggle={toggleValgt}
          onAapen={aapneDrill}
          erGratis={erGratis}
          mestretSet={mestretSet}
        />
      )}

      {/* Sticky footer — send forespørsel */}
      {valgteDrills.size > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 px-4 md:bottom-6">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-card/95 px-4 py-3 shadow-lg backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
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
          <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={1.75} />
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
          <p className="text-sm text-destructive">Noe gikk galt. Prøv igjen.</p>
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

      {/* Drill-modal */}
      {aapentDrill && (
        <DrillModal
          drill={aapentDrill}
          valgt={valgteDrills.has(aapentDrill.id)}
          onToggleValgt={() => toggleValgt(aapentDrill.id)}
          onLukk={() => setAapentDrill(null)}
          erGratis={erGratis}
        />
      )}
    </div>
  );
}

/* ─── DrillCard (kompakt) ─── */

function DrillCard({
  drill,
  valgt,
  onToggleValgt,
  onAapen,
  erGratis,
  mestret,
}: {
  drill: DrillRow;
  valgt: boolean;
  onToggleValgt: () => void;
  onAapen: () => void;
  erGratis: boolean;
  mestret: boolean;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onAapen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAapen();
        }
      }}
      aria-label={`Åpne detaljer for ${drill.name}`}
      className={`group relative flex cursor-pointer flex-col rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        valgt ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
    >
      {/* Coach-anbefalt badge */}
      {drill.coachAnbefalt && (
        <span className="absolute -right-1 -top-1 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-foreground shadow-sm">
          <Sparkles className="h-3 w-3" strokeWidth={1.75} />
          Anbefalt
        </span>
      )}

      {/* Tittel + mestret */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex-1 font-display text-base font-semibold leading-tight text-foreground">
          {drill.name}
        </h3>
        {mestret && (
          <CheckCircle2
            className="h-5 w-5 shrink-0 text-primary"
            strokeWidth={1.75}
            aria-label="Drill mestret"
          />
        )}
      </div>

      {/* Badges */}
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

      {/* Nøkkelinfo */}
      <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
        {drill.durationMin !== null && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" strokeWidth={1.75} />
            {drill.durationMin} min
          </span>
        )}
        {drill.csForMeg !== null && (
          <span className="text-foreground">CS {drill.csForMeg}</span>
        )}
        {(drill.minKategori ?? drill.maxKategori) && (
          <span>
            {drill.minKategori ?? "A"}–{drill.maxKategori ?? "L"}
          </span>
        )}
        {drill.ganger > 0 && (
          <span className="text-primary">{drill.ganger}x trent</span>
        )}
      </div>

      {/* Handlinger — stopPropagation forhindrer at card-klikk utløses */}
      <div className="mt-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleValgt();
          }}
          onKeyDown={(e) => e.stopPropagation()}
          disabled={erGratis}
          aria-pressed={valgt}
          className={`inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
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
      </div>
    </article>
  );
}

/* ─── DrillModal ─── */

function DrillModal({
  drill,
  valgt,
  onToggleValgt,
  onLukk,
  erGratis,
}: {
  drill: DrillRow;
  valgt: boolean;
  onToggleValgt: () => void;
  onLukk: () => void;
  erGratis: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [rated, setRated] = useState(false);
  const [ratingAapen, setRatingAapen] = useState(false);
  const ratingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ratingAapen) return;
    function handleClick(e: MouseEvent) {
      if (ratingRef.current && !ratingRef.current.contains(e.target as Node)) {
        setRatingAapen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ratingAapen]);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
        onClick={onLukk}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drill-modal-tittel"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4 sm:px-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Drill
          </span>
          <button
            type="button"
            onClick={onLukk}
            aria-label="Lukk"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Scrollbart innhold */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {/* Tittel */}
          <h2
            id="drill-modal-tittel"
            className="font-display text-2xl font-semibold leading-tight text-foreground"
          >
            {drill.name}
          </h2>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${PYR_PILL[drill.pyramidArea]}`}
            >
              {PYR_LABEL[drill.pyramidArea]}
            </span>
            {drill.skillArea && (
              <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-secondary-foreground">
                {SKILL_LABEL[drill.skillArea]}
              </span>
            )}
            {drill.treningstype && (
              <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-secondary-foreground">
                {TRENINGSTYPE_LABEL[drill.treningstype]}
              </span>
            )}
            {drill.morad && (
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                MORAD
              </span>
            )}
            {drill.coachAnbefalt && (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/20 px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
                <Sparkles className="h-3 w-3" strokeWidth={1.75} />
                Coach-anbefalt
              </span>
            )}
          </div>

          {/* CS-target */}
          {drill.csForMeg !== null && (
            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                CS-target for deg
              </p>
              <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-foreground">
                {drill.csForMeg}
              </p>
              {drill.csMin !== null && drill.csMax !== null && (
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  Spenn: {drill.csMin}–{drill.csMax}
                </p>
              )}
            </div>
          )}

          {/* Metadata-grid */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {drill.durationMin !== null && (
              <MetaCell label="Varighet" value={`${drill.durationMin} min`} />
            )}
            {drill.intensitet !== null && (
              <MetaCell label="Intensitet" value={`${drill.intensitet}/10`} />
            )}
            {drill.defaultSets !== null && drill.defaultReps !== null && (
              <MetaCell
                label="Sett × Reps"
                value={`${drill.defaultSets} × ${drill.defaultReps}`}
              />
            )}
            {drill.defaultSets !== null && drill.defaultReps === null && (
              <MetaCell label="Sett" value={`${drill.defaultSets}`} />
            )}
            {(drill.minKategori ?? drill.maxKategori) && (
              <MetaCell
                label="Spillerkategori"
                value={`${drill.minKategori ?? "A"}–${drill.maxKategori ?? "L"}`}
              />
            )}
            {drill.ganger > 0 && (
              <MetaCell
                label="Trent"
                value={`${drill.ganger} gang${drill.ganger === 1 ? "" : "er"}`}
              />
            )}
          </div>

          {/* Miljø */}
          {drill.environment.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Miljø
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {drill.environment.map((e) => (
                  <span
                    key={e}
                    className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-[11px] text-secondary-foreground"
                  >
                    {ENV_LABEL[e] ?? e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Treningsfaser */}
          {drill.lPhases.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Treningsfase
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {drill.lPhases.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-[11px] text-secondary-foreground"
                  >
                    {LPHASE_LABEL[p] ?? p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fasilitetskrav */}
          {drill.fasilitetKrav.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Fasilitetskrav
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {drill.fasilitetKrav.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-[11px] text-secondary-foreground"
                  >
                    {FASILITET_LABEL[f] ?? f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Utstyr */}
          {drill.utstyr.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Utstyr
              </p>
              <p className="mt-1.5 text-sm text-foreground">
                {drill.utstyr.join(", ")}
              </p>
            </div>
          )}

          {/* Beskrivelse */}
          {drill.description && (
            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Beskrivelse
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {drill.description}
              </p>
            </div>
          )}

          {/* Forutsetninger */}
          {drill.prerequisites.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Forutsetninger
              </p>
              <ul className="mt-2 space-y-1">
                {drill.prerequisites.map((p) => (
                  <li key={p} className="text-sm text-muted-foreground">
                    · {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Coach-notater */}
          {drill.coachNotes && (
            <div className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-4">
              <div className="flex items-center gap-1.5">
                <Zap
                  className="h-3.5 w-3.5 text-accent-foreground"
                  strokeWidth={1.75}
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
                  Coach-notater
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {drill.coachNotes}
              </p>
            </div>
          )}

          {/* Tags */}
          {drill.tags.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Tags
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {drill.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rating (kun for drills som er trent) */}
          {drill.ganger > 0 && (
            <div className="mt-6">
              <div className="relative" ref={ratingRef}>
                {rated ? (
                  <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 font-mono text-[11px] text-primary">
                    <Star
                      className="h-3.5 w-3.5 fill-primary"
                      strokeWidth={1.75}
                    />
                    Takk for tilbakemeldingen
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setRatingAapen((v) => !v)}
                      aria-expanded={ratingAapen}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-input bg-background px-4 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Star className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Rate denne drillen
                    </button>
                    {ratingAapen && (
                      <div className="absolute bottom-12 left-0 z-10 min-w-[180px] rounded-xl border border-border bg-card p-2 shadow-lg">
                        <p className="mb-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          Hva synes du?
                        </p>
                        <div className="flex flex-col gap-1">
                          {RATING_TYPER.map((rt) => (
                            <button
                              key={rt.id}
                              type="button"
                              disabled={pending}
                              onClick={() => {
                                startTransition(async () => {
                                  const res = await rateDrill(
                                    drill.id,
                                    rt.rating,
                                    rt.id,
                                    null,
                                  );
                                  if (res.ok) {
                                    setRated(true);
                                    setRatingAapen(false);
                                  }
                                });
                              }}
                              className="rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary disabled:opacity-60"
                            >
                              {rt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onToggleValgt}
            disabled={erGratis}
            aria-pressed={valgt}
            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              valgt
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground hover:opacity-90"
            }`}
          >
            {valgt ? (
              <>
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                Valgt — fjern fra forespørsel
              </>
            ) : (
              <>
                <Send className="h-4 w-4" strokeWidth={1.75} />
                Be om i neste plan
              </>
            )}
          </button>
          <Link
            href={`/portal/drills/${drill.id}`}
            onClick={onLukk}
            className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-border text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Se full side
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </>
  );
}

/* ─── MetaCell ─── */

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

/* ─── DrillsListe ─── */

function DrillsListe({
  drills,
  valgte,
  onToggle,
  onAapen,
  erGratis,
  mestretSet,
}: {
  drills: DrillRow[];
  valgte: Set<string>;
  onToggle: (id: string) => void;
  onAapen: (drill: DrillRow) => void;
  erGratis: boolean;
  mestretSet?: Set<string>;
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onAapen(d)}
                      className="text-left font-medium text-foreground hover:text-primary"
                    >
                      {d.name}
                    </button>
                    {d.coachAnbefalt && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-accent-foreground">
                        Anbefalt
                      </span>
                    )}
                    {mestretSet?.has(d.id) && (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-primary"
                        strokeWidth={1.75}
                        aria-label="Drill mestret"
                      />
                    )}
                  </div>
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

/* ─── ToggleChip ─── */

function ToggleChip({
  active,
  onClick,
  label,
  disabled,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex h-9 items-center rounded-full border px-4 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active && highlight
          ? "border-accent bg-accent text-accent-foreground"
          : active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-background text-foreground hover:border-border hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}

/* ─── FilterRad ─── */

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
