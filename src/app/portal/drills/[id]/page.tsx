/**
 * PlayerHQ · Drill-detalj
 *
 * Detalj-side for én drill — beskrivelse, video, parametere og statistikk.
 * Inkluderer:
 * - Hero med discipline-pill og kobling til coach
 * - Video-thumbnail (placeholder SVG hvis ingen video)
 * - Parametere-grid (reps, series, rest, område, fase, belastning, type)
 * - Italic beskrivelse (Instrument Serif look via font-display + italic)
 * - Coach-tips/notater
 * - Min historikk (siste 5 ganger)
 * - Actions: Start økt · Legg til kalender
 *
 * Param-segment `[id]`. URL: `/portal/drills/<id>`.
 */

import Link from "next/link";
import {
  ArrowLeft,
  PlayCircle,
  Zap,
  Layers,
  Activity,
  Target as TargetIcon,
  Hash,
  Timer,
  Gauge,
  MapPin,
  Repeat,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { DrillDetailClient } from "./drill-client";

type Discipline = "SLAG" | "TEK" | "TURN" | "SPILL" | "FYS";

type DummyDrill = {
  id: string;
  title: string;
  discipline: Discipline;
  disciplineLabel: string;
  assignedBy: string;
  videoUrl: string | null;
  description: string;
  coachTips: string;
  parameters: {
    reps: string;
    series: string;
    rest: string;
    area: string;
    phase: string;
    load: string;
    practiceType: string;
  };
  history: Array<{
    date: string;
    duration: number; // min
    completion: number; // 0–100
    notes: string;
  }>;
};

const DUMMY_DRILL: DummyDrill = {
  id: "dummy-pitch",
  title: "Pitch 50—100m, lav trajectory",
  discipline: "SLAG",
  disciplineLabel: "Slag",
  assignedBy: "Anders Kristiansen · AK Golf Academy",
  videoUrl: null,
  description:
    "Trener landingssone-kontroll på de korte iron-skuddene. Fokus er lav trajectory som ruller forutsigbart inn på greenen. Du holder ballen lavt ved å spille den bakover i stancen, ha hendene foran på treff, og holde skuldrene rolige gjennom finishen.",
  coachTips:
    "Ikke jag distansen — la kølla gjøre jobben. Hvis du går over ±3m landingssone i siste serie, ta 30 sek pause ekstra og fokuser på tempo. Bedre 8 av 10 enn 10 av 10 med dårlig kontroll.",
  parameters: {
    reps: "50 totalt",
    series: "5 serier á 10",
    rest: "90 sek mellom serier",
    area: "Range matte 4",
    phase: "CS70",
    load: "Medium",
    practiceType: "Blokk",
  },
  history: [
    {
      date: "2026-05-14",
      duration: 45,
      completion: 92,
      notes: "Best så langt — 46/50 innenfor ±3m",
    },
    {
      date: "2026-05-08",
      duration: 50,
      completion: 84,
      notes: "Spinn for høy på serie 3",
    },
    {
      date: "2026-05-02",
      duration: 40,
      completion: 78,
      notes: "Vind tok flere skudd",
    },
    {
      date: "2026-04-26",
      duration: 45,
      completion: 72,
      notes: "Første gang — bygger feel",
    },
    {
      date: "2026-04-18",
      duration: 30,
      completion: 64,
      notes: "Intro · coach demonstrerte teknikk",
    },
  ],
};

const DISCIPLINE_STYLE: Record<Discipline, string> = {
  SLAG: "bg-primary/10 text-primary border-primary/30",
  TEK: "bg-accent/30 text-accent-foreground border-accent/50",
  TURN: "bg-secondary text-secondary-foreground border-border",
  SPILL: "bg-primary/10 text-primary border-primary/30",
  FYS: "bg-muted text-muted-foreground border-border",
};

export default async function DrillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  // Forsøk å hente fra Prisma (ExerciseDefinition), fall tilbake til dummy.
  let data: DummyDrill = DUMMY_DRILL;

  try {
    const exercise = await prisma.exerciseDefinition.findUnique({
      where: { id },
    });
    if (exercise) {
      const pyramidToDiscipline: Record<string, Discipline> = {
        SLAG: "SLAG",
        SPILL: "SPILL",
        TEK: "TEK",
        FYS: "FYS",
        TURN: "TURN",
      };
      data = {
        ...DUMMY_DRILL,
        id: exercise.id,
        title: exercise.name,
        discipline:
          pyramidToDiscipline[exercise.pyramidArea] ?? "SLAG",
        disciplineLabel:
          exercise.pyramidArea.charAt(0) +
          exercise.pyramidArea.slice(1).toLowerCase(),
        videoUrl: exercise.videoUrl ?? null,
        description: exercise.description ?? DUMMY_DRILL.description,
        parameters: {
          ...DUMMY_DRILL.parameters,
          reps: exercise.defaultRepsSets ?? DUMMY_DRILL.parameters.reps,
          phase: exercise.lPhase ?? DUMMY_DRILL.parameters.phase,
        },
      };
    }
  } catch {
    // DB nede eller ingen tilgang — bruk dummy.
  }

  // user er garantert non-null pga requirePortalUser, men vi referer ikke
  // direkte for å unngå ubrukt-variabel-warning fra tooling.
  void user;

  const paramRows: Array<{ icon: typeof Hash; label: string; value: string }> =
    [
      { icon: Hash, label: "Reps", value: data.parameters.reps },
      { icon: Layers, label: "Series", value: data.parameters.series },
      { icon: Timer, label: "Rest", value: data.parameters.rest },
      { icon: MapPin, label: "Område", value: data.parameters.area },
      { icon: Activity, label: "Fase", value: data.parameters.phase },
      { icon: Gauge, label: "Belastning", value: data.parameters.load },
      { icon: Repeat, label: "Praksistype", value: data.parameters.practiceType },
    ];

  return (
    <div className="space-y-10">
      <Link
        href="/portal/tren"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Tilbake til treningsplan
      </Link>

      <PageHeader
        eyebrow="DRILL · TILDELT AV COACH"
        titleLead="Drill:"
        titleItalic={data.title}
        sub={data.assignedBy}
        actions={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] ${DISCIPLINE_STYLE[data.discipline]}`}
          >
            <Zap className="h-3 w-3" strokeWidth={1.75} />
            {data.disciplineLabel}
          </span>
        }
      />

      {/* Video + parametere */}
      <section className="grid gap-6 lg:grid-cols-5">
        {/* Video-thumbnail */}
        <div className="lg:col-span-3">
          <div className="group relative aspect-video overflow-hidden rounded-2xl border border-border bg-card">
            {data.videoUrl ? (
              <video
                src={data.videoUrl}
                controls
                className="h-full w-full object-cover"
              />
            ) : (
              <VideoPlaceholder title={data.title} />
            )}
          </div>
        </div>

        {/* Parametere */}
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Parametere
          </h2>
          <dl className="mt-6 divide-y divide-border">
            {paramRows.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 py-3"
              >
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {label}
                </dt>
                <dd className="font-mono text-sm tabular-nums text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Beskrivelse */}
      <section
        aria-labelledby="desc-heading"
        className="rounded-2xl border border-border bg-card p-8"
      >
        <h2
          id="desc-heading"
          className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
        >
          Hva skal jeg trene på?
        </h2>
        <p className="mt-4 font-display text-2xl italic leading-relaxed text-foreground">
          {data.description}
        </p>
      </section>

      {/* Coach-tips */}
      <section
        aria-labelledby="tips-heading"
        className="rounded-2xl border border-primary/30 bg-primary/5 p-8"
      >
        <div className="flex items-center gap-2">
          <TargetIcon className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2
            id="tips-heading"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary"
          >
            Tips fra coach
          </h2>
        </div>
        <p className="mt-4 text-base leading-relaxed text-foreground">
          {data.coachTips}
        </p>
      </section>

      {/* Min historikk */}
      <section
        aria-labelledby="history-heading"
        className="rounded-2xl border border-border bg-card p-8"
      >
        <div className="flex items-baseline justify-between">
          <h2
            id="history-heading"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Min historikk · siste 5 ganger
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Snitt completion: 78%
          </span>
        </div>

        <ul className="mt-6 divide-y divide-border">
          {data.history.map((row) => (
            <li
              key={row.date}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {new Date(row.date).toLocaleDateString("nb-NO", {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {row.notes}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Varighet
                  </span>
                  <p className="font-display text-lg font-semibold tabular-nums">
                    {row.duration} min
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Completion
                  </span>
                  <p
                    className={`font-display text-lg font-semibold tabular-nums ${row.completion >= 85 ? "text-primary" : "text-foreground"}`}
                  >
                    {row.completion}%
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Actions */}
      <DrillDetailClient drillId={data.id} drillTitle={data.title} />
    </div>
  );
}

/* --- Sub-komponenter --- */

function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-card to-accent/20">
      {/* Dekorativ "frame" */}
      <svg
        viewBox="0 0 320 180"
        className="absolute inset-0 h-full w-full opacity-20"
        aria-hidden="true"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1={40 * i}
            y1="0"
            x2={40 * i}
            y2="180"
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={36 * i}
            x2="320"
            y2={36 * i}
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <button
          type="button"
          aria-label={`Spill av video for ${title}`}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <PlayCircle className="h-10 w-10" strokeWidth={1.5} />
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Video kommer · coach laster opp
        </span>
      </div>

      <div className="absolute bottom-4 left-4">
        <span className="rounded-full bg-card/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-foreground backdrop-blur">
          Demo · {title}
        </span>
      </div>
    </div>
  );
}
