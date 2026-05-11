/**
 * PlayerHQ — Talent · Min plan (Markus' egen syn)
 * Bygd fra spec talent-design/uploads/05-min-plan.md
 * URL: /talent-min-plan-demo
 *
 * Perspektiv: spillerens eget syn på treningsplanen coach har laget.
 * Ingen sidebar/rail. Norsk bokmål.
 */

import {
  ArrowLeft,
  CalendarPlus,
  Play,
  RotateCcw,
  Target,
} from "lucide-react";

type PriorityTone = "danger" | "warning" | "info";

type Priority = {
  number: 1 | 2 | 3;
  category: string;
  tone: PriorityTone;
  italicTitle: string;
  lead: string;
  goal: string;
  test: string;
  frequency: string;
};

type KanbanCard = {
  title: string;
  detail: string;
  frequency?: string;
  tag?: string;
};

type KanbanColumn = {
  title: string;
  tone: PriorityTone | "neutral";
  cards: KanbanCard[];
};

type TestDef = {
  code: string;
  label: string;
  category: "Golf" | "Fysisk" | "PEI";
};

type SmartForslag = {
  title: string;
  reason: string;
  duration: string;
};

const PRIORITIES: Priority[] = [
  {
    number: 1,
    category: "Teknisk",
    tone: "danger",
    italicTitle: "Approach 100–125 m",
    lead: "−0,18 SG vs J19-snitt på denne distansen. Min største lekkasje akkurat nå.",
    goal: "Lukke gap til 0,00 SG innen 12 uker",
    test: "PEI 100 m + Inspill 120 m",
    frequency: "3 × per uke",
  },
  {
    number: 2,
    category: "Fysisk",
    tone: "warning",
    italicTitle: "Clubhead speed",
    lead: "+10 km/t på driver utløser mer GIR og kortere innspill. Power & rotasjon.",
    goal: "+4 km/t innen 12 uker · 170 km/t snitt",
    test: "Trackman speed-test + 1RM hip-thrust",
    frequency: "2 × per uke",
  },
  {
    number: 3,
    category: "Mental",
    tone: "info",
    italicTitle: "Konsekvens",
    lead: "Holde rutinen identisk på alle slag — pre-shot, puste-rytme, target-lock.",
    goal: "95 % rutine-adherence i turneringer",
    test: "PEI Consistency-protokoll",
    frequency: "Hver økt",
  },
];

const COLUMNS: KanbanColumn[] = [
  {
    title: "Teknisk",
    tone: "danger",
    cards: [
      {
        title: "Inspill 100–125 m",
        detail: "Range · 60 baller · 5 mål-blokker",
        frequency: "Man · Ons · Fre",
        tag: "P1",
      },
      {
        title: "Putte-rytme 1–2,5 m",
        detail: "Putting-green · 40 putts · spegel + tee",
        frequency: "Tir · Tor",
      },
    ],
  },
  {
    title: "Fysisk",
    tone: "warning",
    cards: [
      {
        title: "Power-blokk · hip + core",
        detail: "Mulligan-gym · 45 min · 1RM-blokk",
        frequency: "Tir · Lør",
        tag: "P2",
      },
      {
        title: "Rotasjons-mobilitet",
        detail: "Vakt opp + cooldown · 15 min",
        frequency: "Daglig",
      },
    ],
  },
  {
    title: "Mental",
    tone: "info",
    cards: [
      {
        title: "Pre-shot rutine logg",
        detail: "Stoppeklokke · 12 slag per økt",
        frequency: "Hver økt",
        tag: "P3",
      },
    ],
  },
  {
    title: "Spill",
    tone: "neutral",
    cards: [
      {
        title: "9-hulls scramble · Mulligan",
        detail: "Score-press · skill-shots fra ru",
        frequency: "Onsdag",
      },
      {
        title: "Hjemmebane-runde · GFGK",
        detail: "Full 18 · gul tee · vind-tilpasning",
        frequency: "Søndag",
      },
    ],
  },
];

const TESTS: TestDef[] = [
  { code: "G1", label: "Driving distance · carry", category: "Golf" },
  { code: "G2", label: "Driving accuracy · fairway", category: "Golf" },
  { code: "G3", label: "GIR · greens i regulation", category: "Golf" },
  { code: "G4", label: "Approach 50 m · PEI", category: "Golf" },
  { code: "G5", label: "Approach 100 m · PEI", category: "Golf" },
  { code: "G6", label: "Approach 150 m · PEI", category: "Golf" },
  { code: "G7", label: "Inspill 30 m · sand", category: "Golf" },
  { code: "G8", label: "Chip 5–15 m · prosesjon", category: "Golf" },
  { code: "G9", label: "Putt 1–2 m · skuldercheck", category: "Golf" },
  { code: "G10", label: "Putt 3–5 m · linjevalg", category: "Golf" },
  { code: "G11", label: "Putt 6 m+ · distanseføling", category: "Golf" },
  { code: "F1", label: "Hip-thrust · 1RM", category: "Fysisk" },
  { code: "F2", label: "Hopptest · CMJ", category: "Fysisk" },
  { code: "F3", label: "Rotasjon · seated med-ball", category: "Fysisk" },
  { code: "F4", label: "Mobilitet · TPI screen", category: "Fysisk" },
  { code: "F5", label: "Yo-Yo Intermittent · L1", category: "Fysisk" },
  { code: "M1", label: "PEI · pre-shot konsekvens", category: "PEI" },
  { code: "M2", label: "PEI · selvprat-kvalitet", category: "PEI" },
  { code: "M3", label: "PEI · stress-puls under press", category: "PEI" },
  { code: "M4", label: "PEI · re-fokus etter feilslag", category: "PEI" },
];

const SMART_FORSLAG: SmartForslag[] = [
  {
    title: "Inspill 120 m · 40 baller",
    reason: "Lukker SG approach-gapet — anbefalt 3× denne uka",
    duration: "45 min",
  },
  {
    title: "Trackman speed-blokk",
    reason: "Bygger clubhead speed — første måling i registrert serie",
    duration: "30 min",
  },
  {
    title: "PEI · pre-shot under press",
    reason: "Forberedelse til NM-uttaket 14.06",
    duration: "20 min",
  },
];

const WEEKS = [
  { num: 19, active: true },
  { num: 20, active: false },
  { num: 21, active: false },
  { num: 22, active: false },
  { num: 23, active: false },
  { num: 24, active: false },
  { num: 25, active: false },
  { num: 26, active: false },
  { num: 27, active: false },
  { num: 28, active: false },
  { num: 29, active: false },
  { num: 30, active: false },
];

export default function TalentMinPlanDemo() {
  const totalCards = COLUMNS.reduce((s, c) => s + c.cards.length, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        {/* PageHeader */}
        <header className="mb-5 flex items-start justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Trening · testing · mål
            </span>
            <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
              <em className="italic text-primary">Min</em> plan
            </h1>
            <p className="mt-1.5 max-w-[560px] text-[13px] leading-[1.5] text-muted-foreground">
              Plan og periodisering Anders har bygget. Tre 90-dagers prioriteter, 12-ukers
              program og 20 tester som måler progresjonen min.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium hover:bg-secondary">
              <ArrowLeft size={14} strokeWidth={1.5} />
              Tilbake
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
              <CalendarPlus size={14} strokeWidth={1.5} />
              Logg økt
            </button>
          </div>
        </header>

        {/* Action-strip */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Denne uken
          </span>
          <span className="rounded-md bg-secondary px-2.5 py-1 text-[12px] font-medium">
            <b className="font-semibold">3</b> tester planlagt
          </span>
          <span className="rounded-md bg-[#E5F1EA] px-2.5 py-1 text-[12px] font-medium text-[#1A7D56]">
            <b className="font-semibold">2</b> økter loggført
          </span>
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-[12px] font-medium text-primary">
            fokus <em className="italic">approach 100–125 m</em>
          </span>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-[13px] font-semibold text-accent-foreground hover:opacity-90">
            <Play size={14} strokeWidth={1.5} />
            Start dagens økt
          </button>
        </div>

        {/* Datapåfyll-banner */}
        <div className="mb-6 rounded-md border border-[#E9C36B] bg-[#FFF0D6] px-4 py-3 text-[12px] leading-[1.5] text-[#5A4514]">
          <b className="font-semibold">Datapåfyll kommer Q4:</b> Test-resultater registreres
          ikke ennå i database. Plan og benchmarks vises, men progresjons-grafer er tomme
          inntil målinger logges.
        </div>

        {/* 90-dagers fokusplan */}
        <section className="mb-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                90-dagers fokusplan · til 08.08.2026
              </div>
              <h3 className="mt-1.5 font-display text-[20px] font-medium leading-snug">
                Tre prioriteter jeg jobber mot
              </h3>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              periode 2 · spesifikk-fase
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {PRIORITIES.map((p) => (
              <PriorityCard key={p.number} priority={p} />
            ))}
          </div>
        </section>

        {/* 12-ukers program */}
        <section className="mb-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                12-ukers program · uke 19–30
              </div>
              <h3 className="mt-1.5 font-display text-[20px] font-medium leading-snug">
                Hva jeg trener på, fordelt på fire spor
              </h3>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {totalCards} kort · 4 spor
            </span>
          </div>

          {/* Uke-pills */}
          <div className="mb-5 flex flex-wrap gap-1.5">
            {WEEKS.map((w) => (
              <button
                key={w.num}
                className={`rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
                  w.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                Uke {w.num}
              </button>
            ))}
          </div>

          {/* Kanban */}
          <div className="grid grid-cols-4 gap-3">
            {COLUMNS.map((col) => (
              <KanbanColumnView key={col.title} column={col} />
            ))}
          </div>
        </section>

        {/* Test-batteri */}
        <section className="mb-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Test-batteri · 20 tester · 11 golf · 5 fysisk · 4 PEI
              </div>
              <h3 className="mt-1.5 font-display text-[20px] font-medium leading-snug">
                Mine måle-punkter
              </h3>
            </div>
            <span className="rounded-full bg-[#FFF0D6] px-3 py-1 font-mono text-[11px] font-semibold text-[#B8852A]">
              0 / 20 målinger
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {TESTS.map((t) => (
              <div
                key={t.code}
                className="rounded-md border border-dashed border-border bg-[var(--surface-alt,#F1EEE5)] p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {t.code} · {t.category}
                  </span>
                </div>
                <div className="mt-1.5 text-[12px] font-semibold leading-tight">
                  {t.label}
                </div>
                <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                  Aldri målt
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Smart-forslag · mørk */}
        <section className="rounded-lg bg-[#0F2A22] p-6 text-white">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-white/55">
                Smart-forslag · agent · 11.05.2026 06:14
              </div>
              <h3 className="mt-1.5 font-display text-[20px] font-medium leading-snug">
                <em className="italic">3 anbefalte tester</em> denne uken
              </h3>
              <p className="mt-1.5 text-[12px] leading-[1.5] text-white/65">
                Basert på min SG-svakhet (<em className="italic">approach 100–125 m</em>) og
                klubbhast-mål mot NM-uttaket 14.06.
              </p>
            </div>
            <Target size={28} strokeWidth={1.5} className="text-accent" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {SMART_FORSLAG.map((s) => (
              <div
                key={s.title}
                className="flex flex-col gap-3 rounded-md bg-[#163027] p-4"
              >
                <div>
                  <div className="font-mono text-[10px] text-white/55">
                    {s.duration}
                  </div>
                  <div className="mt-1.5 text-[13px] font-semibold leading-tight">
                    {s.title}
                  </div>
                  <div className="mt-2 text-[11px] leading-[1.5] text-white/70">
                    {s.reason}
                  </div>
                </div>
                <button className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-3 py-2 text-[12px] font-semibold text-accent-foreground transition-opacity hover:opacity-90">
                  Planlegg
                  <RotateCcw size={12} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function PriorityCard({ priority }: { priority: Priority }) {
  const toneStyle =
    priority.tone === "danger"
      ? { eyebrow: "text-[#A32D2D]", bar: "bg-[#A32D2D]" }
      : priority.tone === "warning"
        ? { eyebrow: "text-[#B8852A]", bar: "bg-[#B8852A]" }
        : { eyebrow: "text-primary", bar: "bg-primary" };

  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-card p-5">
      <div className={`absolute left-0 top-0 h-full w-1 ${toneStyle.bar}`} />
      <div
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${toneStyle.eyebrow}`}
      >
        Prioritet {priority.number} · {priority.category}
      </div>
      <h4 className="mt-2 font-display text-[20px] font-medium leading-snug">
        <em className="italic">{priority.italicTitle}</em>
      </h4>
      <p className="mt-1.5 text-[12px] leading-[1.5] text-muted-foreground">
        {priority.lead}
      </p>

      <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3">
        <Row label="Mål" value={priority.goal} />
        <Row label="Test" value={priority.test} />
        <Row
          label="Frekvens"
          value={priority.frequency}
          recurring
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  recurring,
}: {
  label: string;
  value: string;
  recurring?: boolean;
}) {
  return (
    <div className="grid grid-cols-[70px_1fr] items-baseline gap-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium leading-snug">
        {value}
        {recurring && (
          <RotateCcw
            size={11}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
        )}
      </span>
    </div>
  );
}

function KanbanColumnView({ column }: { column: KanbanColumn }) {
  const tone =
    column.tone === "danger"
      ? "text-[#A32D2D]"
      : column.tone === "warning"
        ? "text-[#B8852A]"
        : column.tone === "info"
          ? "text-primary"
          : "text-muted-foreground";
  return (
    <div className="flex flex-col gap-2 rounded-md bg-[var(--surface-alt,#F1EEE5)] p-3">
      <div className="flex items-center justify-between px-1 pb-1">
        <span
          className={`font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${tone}`}
        >
          {column.title}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {column.cards.length}
        </span>
      </div>
      {column.cards.map((c) => (
        <div
          key={c.title}
          className="rounded-sm border border-border bg-card p-3 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-[12px] font-semibold leading-tight">
              {c.title}
            </div>
            {c.tag && (
              <span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[9px] font-semibold text-muted-foreground">
                {c.tag}
              </span>
            )}
          </div>
          <div className="mt-1.5 font-mono text-[10px] text-muted-foreground">
            {c.detail}
          </div>
          {c.frequency && (
            <div className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] font-medium text-foreground">
              <RotateCcw size={10} strokeWidth={1.5} />
              {c.frequency}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
