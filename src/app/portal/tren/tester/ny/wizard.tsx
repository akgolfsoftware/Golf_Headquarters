"use client";

/**
 * NyTestWizard — fire-stegs flyt for å logge ny test.
 *   1. Type (velg testtype fra kortgrid)
 *   2. Detaljer (dato, lokasjon, utstyr, notater)
 *   3. Resultat (metrikker tilpasset valgt testtype)
 *   4. Bekreft (sammendrag + delta + del med coach-toggle)
 *
 * Auto-lagrer draft til localStorage hvert 10. sek. AK Golf-branding:
 * cream/forest/lime, Inter Tight + Mono.
 */
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDot,
  Footprints,
  Plus,
  Share2,
  Target,
  X,
} from "lucide-react";
import type { PyramidArea } from "@/generated/prisma/client";
import { useToast } from "@/components/shared/toast-provider";
import { logTest } from "./actions";

type TestDef = {
  id: string;
  name: string;
  pyramidArea: PyramidArea;
  description: string | null;
};

type Props = {
  tests: TestDef[];
  sistePerTest: Record<string, { score: number; takenAt: string }>;
  spillerNavn: string;
};

// Test-katalog som styrer hvilke metrikker hvert valg krever. Kobles til
// TestDefinition via fuzzy navn-match (case-insensitive contains).
type MetricDef = {
  key: string;
  label: string;
  unit: string;
  step?: number;
  primary?: boolean; // brukes som score-verdi
};

type Katalog = {
  slug: string;
  navn: string;
  beskrivelse: string;
  matchTokens: string[];
  Icon: typeof Target;
  metrics: MetricDef[];
};

const KATALOG: Katalog[] = [
  {
    slug: "cmj",
    navn: "CMJ (Countermovement Jump)",
    beskrivelse: "Eksplosiv kraft i underkropp — standard fys-test.",
    matchTokens: ["cmj", "countermovement"],
    Icon: ChevronUp,
    metrics: [
      { key: "hoydeCm", label: "Hopp-høyde", unit: "cm", step: 0.1, primary: true },
      { key: "kraftN", label: "Kraft-toppunkt", unit: "N", step: 1 },
      { key: "reaksjonMs", label: "Kontakt-tid", unit: "ms", step: 1 },
    ],
  },
  {
    slug: "vertikalt-hopp",
    navn: "Vertikalt hopp",
    beskrivelse: "Maks hopp uten armsving.",
    matchTokens: ["vertikalt", "vertical"],
    Icon: ArrowUp,
    metrics: [
      { key: "hoydeCm", label: "Max hopp", unit: "cm", step: 0.1, primary: true },
    ],
  },
  {
    slug: "60m-sprint",
    navn: "60m sprint",
    beskrivelse: "Akselerasjon og toppfart over 60 meter.",
    matchTokens: ["sprint", "60m"],
    Icon: Footprints,
    metrics: [
      { key: "tidSek", label: "Total tid", unit: "s", step: 0.01, primary: true },
      { key: "split30", label: "Split 30m", unit: "s", step: 0.01 },
    ],
  },
  {
    slug: "putting-konsistens",
    navn: "Putting-konsistens",
    beskrivelse: "10 putts à 3 meter — registrer distanse-feil i cm.",
    matchTokens: ["putt", "putting"],
    Icon: Target,
    metrics: Array.from({ length: 10 }, (_, i) => ({
      key: `putt${i + 1}`,
      label: `Putt ${i + 1}`,
      unit: "cm",
      step: 1,
    })),
  },
  {
    slug: "putting-prosent",
    navn: "Putting-prosent (1–5 m)",
    beskrivelse: "Andel innslag fra fem forskjellige distanser.",
    matchTokens: ["putt-prosent", "innslag"],
    Icon: Activity,
    metrics: [
      { key: "p1m", label: "1 meter", unit: "%", step: 1, primary: true },
      { key: "p2m", label: "2 meter", unit: "%", step: 1 },
      { key: "p3m", label: "3 meter", unit: "%", step: 1 },
      { key: "p4m", label: "4 meter", unit: "%", step: 1 },
      { key: "p5m", label: "5 meter", unit: "%", step: 1 },
    ],
  },
  {
    slug: "sg-putt",
    navn: "SG Putt-test",
    beskrivelse: "10 putts — oppgi oppdrag- og resultat-distanse.",
    matchTokens: ["sg putt", "sg-putt", "strokes gained"],
    Icon: Activity,
    metrics: Array.from({ length: 10 }, (_, i) => ({
      key: `putt${i + 1}Dist`,
      label: `Putt ${i + 1} resultat`,
      unit: "cm",
      step: 1,
    })),
  },
  {
    slug: "wedge-matrix",
    navn: "Wedge Matrix",
    beskrivelse: "Snitt-treff fra 30/50/70/90 m.",
    matchTokens: ["wedge", "matrix"],
    Icon: CircleDot,
    metrics: [
      { key: "w30", label: "30m snitt-feil", unit: "m", step: 0.1, primary: true },
      { key: "w50", label: "50m snitt-feil", unit: "m", step: 0.1 },
      { key: "w70", label: "70m snitt-feil", unit: "m", step: 0.1 },
      { key: "w90", label: "90m snitt-feil", unit: "m", step: 0.1 },
    ],
  },
  {
    slug: "trackman-combine",
    navn: "TrackMan Combine",
    beskrivelse: "Standard 60-slag combine-score.",
    matchTokens: ["combine", "trackman"],
    Icon: Activity,
    metrics: [
      { key: "score", label: "Combine-score", unit: "/100", step: 0.1, primary: true },
    ],
  },
  {
    slug: "t-test",
    navn: "T-test (agility)",
    beskrivelse: "Klassisk agility-test i T-bane.",
    matchTokens: ["t-test", "agility"],
    Icon: Footprints,
    metrics: [
      { key: "tidSek", label: "Tid", unit: "s", step: 0.01, primary: true },
    ],
  },
  {
    slug: "y-balance",
    navn: "Y-balance",
    beskrivelse: "Balanse-rekkevidde i tre retninger.",
    matchTokens: ["y-balance", "y balance"],
    Icon: CircleDot,
    metrics: [
      { key: "anterior", label: "Anterior", unit: "cm", step: 0.1, primary: true },
      { key: "posteromedial", label: "Posteromedial", unit: "cm", step: 0.1 },
      { key: "posterolateral", label: "Posterolateral", unit: "cm", step: 0.1 },
    ],
  },
  {
    slug: "egen",
    navn: "Egen test",
    beskrivelse: "Custom test med ett enkelt resultat-felt.",
    matchTokens: [],
    Icon: Plus,
    metrics: [
      { key: "verdi", label: "Resultat", unit: "verdi", step: 0.1, primary: true },
    ],
  },
];

const LS_KEY = "akgolf:nytest:draft:v1";

type State = {
  steg: 1 | 2 | 3 | 4;
  valgtSlug: string | null;
  matchedTestId: string | null;
  takenAt: string;
  location: string;
  equipment: string[];
  preNotes: string;
  postNotes: string;
  shareWithCoach: boolean;
  results: Record<string, string>;
};

const LOKASJONER = ["Performance Studio", "Bossum", "Annet"] as const;

function todayIso(): string {
  const d = new Date();
  // Lokal dato uten tidssone-drift.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDato(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function nb(n: number, decimals = 1): string {
  return n.toFixed(decimals).replace(".", ",");
}

function matchTestId(slug: string, tests: TestDef[]): string | null {
  const valg = KATALOG.find((k) => k.slug === slug);
  if (!valg) return null;
  for (const tok of valg.matchTokens) {
    const found = tests.find((t) => t.name.toLowerCase().includes(tok));
    if (found) return found.id;
  }
  return tests[0]?.id ?? null;
}

export function NyTestWizard({ tests, sistePerTest, spillerNavn }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const [state, setState] = useState<State>(() => {
    const initial: State = {
      steg: 1,
      valgtSlug: null,
      matchedTestId: null,
      takenAt: todayIso(),
      location: LOKASJONER[0],
      equipment: [],
      preNotes: "",
      postNotes: "",
      shareWithCoach: true,
      results: {},
    };
    // SSR-safe: les draft kun på klient. useState initializer kjører én gang
    // per komponent-mount; på server returnerer den `initial`.
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return initial;
      const parsed = JSON.parse(raw) as Partial<State>;
      return {
        ...initial,
        ...parsed,
        steg: 1, // alltid start på steg 1 — ikke hopp inn midt i flyten
      };
    } catch {
      return initial;
    }
  });

  // Auto-save draft hvert 10. sek.
  useEffect(() => {
    const timer = window.setInterval(() => {
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(state));
      } catch {
        /* quota — ignore */
      }
    }, 10000);
    return () => window.clearInterval(timer);
  }, [state]);

  const valgtKatalog = useMemo(
    () => KATALOG.find((k) => k.slug === state.valgtSlug) ?? null,
    [state.valgtSlug],
  );

  const kanGaTilNeste = useMemo(() => {
    if (state.steg === 1) return state.valgtSlug !== null;
    if (state.steg === 2) {
      if (!state.takenAt) return false;
      if (new Date(state.takenAt) > new Date()) return false;
      return state.location.trim().length > 0;
    }
    if (state.steg === 3) {
      if (!valgtKatalog) return false;
      // Krev minst primary-metrikk fylt ut (eller første metrikk).
      const primary = valgtKatalog.metrics.find((m) => m.primary) ?? valgtKatalog.metrics[0];
      const v = state.results[primary.key];
      if (!v) return false;
      const n = Number(v.replace(",", "."));
      return !isNaN(n) && n >= 0;
    }
    return true;
  }, [state, valgtKatalog]);

  const velgType = useCallback(
    (slug: string) => {
      setState((prev) => ({
        ...prev,
        valgtSlug: slug,
        matchedTestId: matchTestId(slug, tests),
        results: {},
      }));
    },
    [tests],
  );

  const setResultat = (key: string, value: string) => {
    setState((prev) => ({
      ...prev,
      results: { ...prev.results, [key]: value },
    }));
  };

  const leggTilUtstyr = (tag: string) => {
    const ren = tag.trim();
    if (!ren) return;
    if (state.equipment.includes(ren)) return;
    if (state.equipment.length >= 20) return;
    setState((prev) => ({ ...prev, equipment: [...prev.equipment, ren] }));
  };

  const fjernUtstyr = (tag: string) => {
    setState((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((t) => t !== tag),
    }));
  };

  const neste = () => {
    if (!kanGaTilNeste) return;
    setFeil(null);
    setState((prev) => ({
      ...prev,
      steg: Math.min(4, prev.steg + 1) as State["steg"],
    }));
  };

  const tilbake = () => {
    setFeil(null);
    setState((prev) => ({
      ...prev,
      steg: Math.max(1, prev.steg - 1) as State["steg"],
    }));
  };

  const lagre = () => {
    if (!valgtKatalog || !state.matchedTestId) {
      setFeil("Velg en testtype før du lagrer.");
      return;
    }

    const numerics: Record<string, number> = {};
    for (const m of valgtKatalog.metrics) {
      const raw = state.results[m.key];
      if (!raw) continue;
      const n = Number(raw.replace(",", "."));
      if (!isNaN(n) && n >= 0) numerics[m.key] = n;
    }

    const primary = valgtKatalog.metrics.find((m) => m.primary) ?? valgtKatalog.metrics[0];
    if (numerics[primary.key] === undefined) {
      setFeil(`Fyll ut ${primary.label} før du kan lagre.`);
      return;
    }
    numerics._score = numerics[primary.key];

    startTransition(async () => {
      try {
        const res = await logTest({
          testId: state.matchedTestId,
          takenAt: state.takenAt,
          location: state.location,
          equipment: state.equipment,
          preNotes: state.preNotes,
          postNotes: state.postNotes,
          shareWithCoach: state.shareWithCoach,
          results: numerics,
        });
        try {
          window.localStorage.removeItem(LS_KEY);
        } catch {
          /* ignore */
        }
        toast.success("Test lagret");
        router.push(`/portal/tren/tester/${res.testId}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Kunne ikke lagre test";
        setFeil(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <Stegbar steg={state.steg} />

      <div className="mt-8 rounded-lg border border-border bg-card p-6 sm:p-8">
        {state.steg === 1 && (
          <Steg1
            valgtSlug={state.valgtSlug}
            onVelg={velgType}
          />
        )}

        {state.steg === 2 && (
          <Steg2
            takenAt={state.takenAt}
            location={state.location}
            equipment={state.equipment}
            preNotes={state.preNotes}
            onTakenAt={(v) => setState((p) => ({ ...p, takenAt: v }))}
            onLocation={(v) => setState((p) => ({ ...p, location: v }))}
            onLeggTilUtstyr={leggTilUtstyr}
            onFjernUtstyr={fjernUtstyr}
            onPreNotes={(v) => setState((p) => ({ ...p, preNotes: v }))}
          />
        )}

        {state.steg === 3 && valgtKatalog && (
          <Steg3
            katalog={valgtKatalog}
            results={state.results}
            onResultat={setResultat}
          />
        )}

        {state.steg === 4 && valgtKatalog && (
          <Steg4
            katalog={valgtKatalog}
            state={state}
            spillerNavn={spillerNavn}
            siste={
              state.matchedTestId
                ? sistePerTest[state.matchedTestId] ?? null
                : null
            }
            onPostNotes={(v) => setState((p) => ({ ...p, postNotes: v }))}
            onShareToggle={(v) =>
              setState((p) => ({ ...p, shareWithCoach: v }))
            }
          />
        )}

        {feil && (
          <div
            role="alert"
            className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {feil}
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 z-10 mt-4 flex items-center justify-between gap-2 rounded-lg border border-border bg-card/95 px-4 py-4 backdrop-blur">
        <button
          type="button"
          onClick={tilbake}
          disabled={state.steg === 1 || pending}
          className="inline-flex h-11 items-center gap-1.5 rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border disabled:opacity-40"
        >
          <ChevronLeft size={14} strokeWidth={1.75} /> Tilbake
        </button>

        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Steg {state.steg} av 4
        </span>

        {state.steg < 4 ? (
          <button
            type="button"
            onClick={neste}
            disabled={!kanGaTilNeste || pending}
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Neste <ChevronRight size={14} strokeWidth={1.75} />
          </button>
        ) : (
          <button
            type="button"
            onClick={lagre}
            disabled={pending}
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Check size={14} strokeWidth={1.75} />
            {pending ? "Lagrer…" : "Lagre test"}
          </button>
        )}
      </div>
    </div>
  );
}

function Stegbar({ steg }: { steg: 1 | 2 | 3 | 4 }) {
  const labels = ["Type", "Detaljer", "Resultat", "Bekreft"];
  return (
    <ol
      aria-label="Steg-progresjon"
      className="flex items-center justify-between gap-2"
    >
      {labels.map((lab, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4;
        const aktiv = n === steg;
        const ferdig = n < steg;
        return (
          <li key={lab} className="flex flex-1 items-center gap-2">
            <span
              aria-current={aktiv ? "step" : undefined}
              className={[
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-xs font-semibold tabular-nums transition-colors",
                ferdig
                  ? "border-primary bg-primary text-primary-foreground"
                  : aktiv
                    ? "border-primary bg-card text-primary"
                    : "border-border bg-card text-muted-foreground",
              ].join(" ")}
            >
              {ferdig ? (
                <Check size={14} strokeWidth={1.75} />
              ) : (
                <span>{n}</span>
              )}
            </span>
            <span
              className={[
                "hidden text-xs font-medium sm:inline",
                aktiv
                  ? "text-foreground"
                  : ferdig
                    ? "text-foreground"
                    : "text-muted-foreground",
              ].join(" ")}
            >
              {lab}
            </span>
            {i < labels.length - 1 && (
              <span
                aria-hidden="true"
                className={[
                  "ml-2 h-px flex-1",
                  ferdig ? "bg-primary/60" : "bg-border",
                ].join(" ")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Steg1({
  valgtSlug,
  onVelg,
}: {
  valgtSlug: string | null;
  onVelg: (slug: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
        Hvilken <em className="font-normal text-primary md:italic">test</em>{" "}
        skal du logge?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Velg én av de elleve testtypene under. Resultat-felter tilpasser seg
        valget.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {KATALOG.map((k) => {
          const aktiv = valgtSlug === k.slug;
          const Icon = k.Icon;
          return (
            <button
              key={k.slug}
              type="button"
              onClick={() => onVelg(k.slug)}
              aria-pressed={aktiv}
              className={[
                "group flex h-[140px] flex-col items-start justify-between rounded-lg border bg-card p-4 text-left transition-all hover:border-primary/60",
                aktiv
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-9 w-9 place-items-center rounded-full",
                  aktiv
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground",
                ].join(" ")}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <div className="text-sm font-semibold leading-tight text-foreground">
                  {k.navn}
                </div>
                <div className="mt-1 text-xs leading-snug text-muted-foreground">
                  {k.beskrivelse}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Steg2({
  takenAt,
  location,
  equipment,
  preNotes,
  onTakenAt,
  onLocation,
  onLeggTilUtstyr,
  onFjernUtstyr,
  onPreNotes,
}: {
  takenAt: string;
  location: string;
  equipment: string[];
  preNotes: string;
  onTakenAt: (v: string) => void;
  onLocation: (v: string) => void;
  onLeggTilUtstyr: (v: string) => void;
  onFjernUtstyr: (v: string) => void;
  onPreNotes: (v: string) => void;
}) {
  const [utstyrInput, setUtstyrInput] = useState("");
  const today = todayIso();

  const handleUtstyrKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onLeggTilUtstyr(utstyrInput);
      setUtstyrInput("");
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
        <em className="font-normal text-primary md:italic">Detaljer</em> om
        gjennomføringen
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Dato, sted og utstyr — slik at coachen kan tolke resultatet riktig.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Felt label="Dato">
          <input
            type="date"
            value={takenAt}
            max={today}
            onChange={(e) => onTakenAt(e.target.value)}
            className={inputCls}
          />
        </Felt>
        <Felt label="Lokasjon">
          <select
            value={location}
            onChange={(e) => onLocation(e.target.value)}
            className={inputCls}
          >
            {LOKASJONER.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Felt>
      </div>

      <div className="mt-4">
        <Felt label="Utstyr brukt (tags)">
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-card px-3 py-2">
            {equipment.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onFjernUtstyr(tag)}
                  aria-label={`Fjern ${tag}`}
                  className="opacity-60 hover:opacity-100"
                >
                  <X size={12} strokeWidth={1.75} aria-hidden />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={utstyrInput}
              onChange={(e) => setUtstyrInput(e.target.value)}
              onKeyDown={handleUtstyrKey}
              onBlur={() => {
                if (utstyrInput.trim()) {
                  onLeggTilUtstyr(utstyrInput);
                  setUtstyrInput("");
                }
              }}
              placeholder="Trykk Enter for å legge til…"
              className="min-w-[140px] flex-1 bg-transparent text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
            />
          </div>
        </Felt>
      </div>

      <div className="mt-4">
        <Felt label="Notater før test (valgfritt)">
          <textarea
            value={preNotes}
            onChange={(e) => onPreNotes(e.target.value.slice(0, 1000))}
            rows={3}
            placeholder="Hvordan føltes oppvarmingen? Skader å være obs på?"
            className={inputCls}
          />
        </Felt>
      </div>
    </div>
  );
}

function Steg3({
  katalog,
  results,
  onResultat,
}: {
  katalog: Katalog;
  results: Record<string, string>;
  onResultat: (key: string, v: string) => void;
}) {
  const erPutting = katalog.metrics.length >= 10;

  // Auto-snitt for putting-tester.
  const snitt = useMemo(() => {
    if (!erPutting) return null;
    const verdier = katalog.metrics
      .map((m) => Number((results[m.key] ?? "").replace(",", ".")))
      .filter((n) => !isNaN(n) && n >= 0);
    if (verdier.length === 0) return null;
    return verdier.reduce((s, n) => s + n, 0) / verdier.length;
  }, [erPutting, katalog.metrics, results]);

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
        <em className="font-normal text-primary md:italic">Resultater</em> for{" "}
        {katalog.navn.toLowerCase()}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Fyll inn det du har målt. Påkrevd: minst hovedmetrikken under.
      </p>

      <div
        className={
          erPutting
            ? "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5"
            : "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
        }
      >
        {katalog.metrics.map((m) => (
          <Felt key={m.key} label={`${m.label}${m.primary ? " *" : ""}`}>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step={m.step ?? 0.1}
                min={0}
                value={results[m.key] ?? ""}
                onChange={(e) => onResultat(m.key, e.target.value)}
                className={`${inputCls} pr-12 tabular-nums`}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-muted-foreground"
              >
                {m.unit}
              </span>
            </div>
          </Felt>
        ))}
      </div>

      {erPutting && snitt != null && (
        <div className="mt-6 rounded-md border border-border bg-secondary/50 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Auto-snitt
          </div>
          <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
            {nb(snitt)} cm
          </div>
        </div>
      )}
    </div>
  );
}

function Steg4({
  katalog,
  state,
  spillerNavn,
  siste,
  onPostNotes,
  onShareToggle,
}: {
  katalog: Katalog;
  state: State;
  spillerNavn: string;
  siste: { score: number; takenAt: string } | null;
  onPostNotes: (v: string) => void;
  onShareToggle: (v: boolean) => void;
}) {
  const primary = katalog.metrics.find((m) => m.primary) ?? katalog.metrics[0];
  const nyVerdi = Number((state.results[primary.key] ?? "").replace(",", "."));
  const delta = siste ? nyVerdi - siste.score : null;
  const deltaSign = delta == null ? "" : delta > 0 ? "+" : delta < 0 ? "−" : "";
  const deltaTekst =
    delta == null
      ? null
      : `${deltaSign}${nb(Math.abs(delta), 1)} ${primary.unit}`;

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
        Klar til å{" "}
        <em className="font-normal text-primary md:italic">bekrefte</em>?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Sjekk at sammendraget under stemmer før du lagrer.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Sammendrag · {spillerNavn}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Type
            </div>
            <div className="mt-1 font-medium text-foreground">
              {katalog.navn}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Dato
            </div>
            <div className="mt-1 font-medium text-foreground">
              {formatDato(state.takenAt)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Lokasjon
            </div>
            <div className="mt-1 font-medium text-foreground">
              {state.location}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Utstyr
            </div>
            <div className="mt-1 text-foreground">
              {state.equipment.length > 0 ? state.equipment.join(", ") : "—"}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Resultater
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {katalog.metrics.map((m) => {
              const raw = state.results[m.key];
              if (!raw) return null;
              const n = Number(raw.replace(",", "."));
              if (isNaN(n)) return null;
              return (
                <li
                  key={m.key}
                  className="rounded-md border border-border bg-card px-3 py-2"
                >
                  <div className="font-mono text-[10px] uppercase text-muted-foreground">
                    {m.label}
                  </div>
                  <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-foreground">
                    {nb(n, m.step && m.step >= 1 ? 0 : 1)} {m.unit}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {siste && !isNaN(nyVerdi) && (
          <div className="mt-5 flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Sammenlignet med forrige
              </div>
              <div className="mt-1 text-sm text-foreground">
                Forrige: {nb(siste.score, primary.step && primary.step >= 1 ? 0 : 1)} {primary.unit} ·{" "}
                {formatDato(siste.takenAt)}
              </div>
            </div>
            {deltaTekst && delta != null && (
              <div
                className={[
                  "flex items-center gap-1 font-mono text-base font-semibold tabular-nums",
                  delta > 0
                    ? "text-primary"
                    : delta < 0
                      ? "text-destructive"
                      : "text-muted-foreground",
                ].join(" ")}
              >
                <ArrowUp
                  size={14}
                  strokeWidth={1.75}
                  className={delta < 0 ? "rotate-180" : ""}
                  aria-hidden
                />
                {deltaTekst}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <Felt label="Notater etter test (valgfritt)">
          <textarea
            value={state.postNotes}
            onChange={(e) => onPostNotes(e.target.value.slice(0, 1000))}
            rows={3}
            placeholder="Hva fungerte? Hva ble du overrasket over?"
            className={inputCls}
          />
        </Felt>

        <label className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-sm">
          <span className="flex items-center gap-2">
            <Share2 size={16} strokeWidth={1.75} aria-hidden />
            <span className="font-medium text-foreground">Del med coach</span>
          </span>
          <input
            type="checkbox"
            checked={state.shareWithCoach}
            onChange={(e) => onShareToggle(e.target.checked)}
            className="h-5 w-5 cursor-pointer accent-[color:var(--color-primary)]"
          />
        </label>
      </div>
    </div>
  );
}

const inputCls =
  "w-full min-h-11 rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

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
