/**
 * PlayerHQ — Talent · Roadmap (MOBILE-FIRST 430px)
 *
 * 12-måneders utviklings-roadmap. Athletic-editorial re-styl mot DS-tokens:
 *  - Mono-eyebrow m/pulse + italic display-tittel
 *  - KPI-strip (mono tabular-nums)
 *  - Horisontal SVG-roadmap med faser farget per pyramide-akse (DS-CSS-vars)
 *  - Fase-kort med mål-rader (pyramide-badge + progress-bar)
 *  - Milepæler fra TalentTracking.milepaeler (DB) når de finnes
 *  - AI-strip (lime-glød)
 *
 * Fasene er foreløpig demo-scaffold (struktur finnes ikke i DB ennå) — markert
 * med pre-beta-stripe. Milepælene er ekte DB-data.
 */
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Flag,
  Sparkles,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

type Milepael = {
  tittel: string;
  dato: string;
  beskrivelse?: string;
  oppnadd?: boolean;
};

type Axis = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

function parseMilepaeler(json: unknown): Milepael[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (m): m is Milepael =>
      typeof m === "object" &&
      m !== null &&
      typeof (m as Milepael).tittel === "string",
  );
}

// Pyramide-akse → DS-token-klasser (badge + bar). Aldri hardkodet hex.
const AXIS_BADGE: Record<Axis, string> = {
  FYS: "bg-[var(--color-pyr-fys-track)] text-[var(--pyr-fys)]",
  TEK: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  SLAG: "bg-[var(--color-pyr-slag-track)] text-[var(--pyr-slag)]",
  SPILL: "bg-[var(--color-pyr-spill-track)] text-primary",
  TURN: "bg-[var(--color-pyr-turn-track)] text-[var(--pyr-turn)]",
};
const AXIS_BAR: Record<Axis, string> = {
  FYS: "bg-pyr-fys",
  TEK: "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};

type FaseMal = { disiplin: Axis; tekst: string; pct: number; done?: boolean };
type Fase = {
  tittel: string;
  periode: string;
  status: "aktiv" | "kommer";
  fokus: string;
  mal: FaseMal[];
};

// Demo-faser for roadmap (struktur ikke i DB ennå — kobles post-BETA).
const DEMO_FASER: Fase[] = [
  {
    tittel: "Fase 1 — Grunntrening",
    periode: "mai – juni",
    status: "aktiv",
    fokus: "Volum-bygging og teknisk basis",
    mal: [
      { disiplin: "FYS", tekst: "VO2max løft", pct: 60 },
      { disiplin: "TEK", tekst: "7-jern smash factor", pct: 80 },
      { disiplin: "SLAG", tekst: "Putting 1,5m konsistens", pct: 100, done: true },
      { disiplin: "TURN", tekst: "Pre-shot rutine", pct: 40 },
    ],
  },
  {
    tittel: "Fase 2 — Oppbygging",
    periode: "juli – september",
    status: "kommer",
    fokus: "Spesifikk styrke + turnerings-readiness",
    mal: [
      { disiplin: "FYS", tekst: "Eksplosiv styrke", pct: 0 },
      { disiplin: "TEK", tekst: "Driver carry distanse", pct: 0 },
      { disiplin: "SLAG", tekst: "Chipping landingsone", pct: 0 },
    ],
  },
  {
    tittel: "Fase 3 — Spesialisering",
    periode: "oktober – januar",
    status: "kommer",
    fokus: "Vinter-trening, mental og spillforståelse",
    mal: [
      { disiplin: "TURN", tekst: "MTQ-score økning", pct: 0 },
      { disiplin: "SPILL", tekst: "Course management quiz", pct: 0 },
    ],
  },
  {
    tittel: "Fase 4 — Konkurranse",
    periode: "februar – mai",
    status: "kommer",
    fokus: "Finstilling og sesong-åpning",
    mal: [
      { disiplin: "TEK", tekst: "Bevare alle TEK-metrikker", pct: 0 },
      { disiplin: "SLAG", tekst: "Putting under press", pct: 0 },
    ],
  },
];

// Måneder for roadmap-header
const MANEDER = [
  "MAI", "JUN", "JUL", "AUG", "SEP", "OKT",
  "NOV", "DES", "JAN", "FEB", "MAR", "APR",
];

// SVG-faser (x/width i 1200-koordinatsystem) + fill via DS-CSS-var
const SVG_FASER = [
  { x: 20, w: 180, label: "GRUNNTRENING", periode: "mai-jun", fill: "var(--pyr-fys)", text: "hsl(var(--primary-foreground))" },
  { x: 210, w: 290, label: "OPPBYGGING", periode: "jul-sep", fill: "var(--pyr-slag)", text: "hsl(var(--card))" },
  { x: 510, w: 380, label: "SPESIALISERING", periode: "okt-jan", fill: "var(--pyr-tek)", text: "hsl(var(--foreground))" },
  { x: 900, w: 280, label: "KONKURRANSE", periode: "feb-mai", fill: "var(--pyr-spill)", text: "hsl(var(--foreground))" },
];

const SVG_EVAL = [
  { x: 245, label: "JUL: FYS+TEK" },
  { x: 445, label: "SEP: MID" },
  { x: 645, label: "NOV: OFF" },
  { x: 845, label: "JAN: VINTER" },
  { x: 1045, label: "MAR: PRE" },
  { x: 1145, label: "MAI: ÅRS" },
];

const SVG_TURN = [
  { x: 158, name: "SØRLANDS", dato: "16. JUNI" },
  { x: 280, name: "NM SLAG", dato: "22. JULI" },
  { x: 400, name: "KLUBBM", dato: "28. AUG" },
];

export default async function RoadmapPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const tracking = await prisma.talentTracking.findUnique({
    where: { userId: user.id },
    select: { niva: true, milepaeler: true },
  });
  if (!tracking) return null;

  const milepaeler = parseMilepaeler(tracking.milepaeler);

  return (
    <div className="mx-auto flex max-w-[480px] flex-col gap-4">
      {/* Pre-beta-stripe */}
      <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-2 text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-warning">
          PRE-BETA · Roadmap viser demo-faser — kobles til DB post-BETA
        </p>
      </div>

      {/* Tilbake */}
      <Link
        href="/portal/talent"
        className="inline-flex w-fit items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Tilbake til talent
      </Link>

      {/* Header */}
      <header>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.6)]" />
          </span>
          TALENT · ROADMAP · {tracking.niva}
        </span>
        <h1 className="mt-1.5 font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
          Min vei mot{" "}
          <em className="font-normal italic text-primary">neste nivå</em>.
        </h1>
        <p className="mt-1.5 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
          12 måneder · 4 faser · 6 evaluerings-punkter
        </p>
      </header>

      {/* KPI-strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { lbl: "Mål 12 mnd", v: "Nivå-opp", sub: "neste kategori" },
          { lbl: "Faser", v: "4", sub: "grunn → konk." },
          { lbl: "Evaluering", v: "6", sub: "hver 2. mnd" },
        ].map((b) => (
          <div
            key={b.lbl}
            className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5"
          >
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              {b.lbl}
            </span>
            <span className="font-mono text-[18px] font-bold leading-none tabular-nums tracking-[-0.02em] text-foreground">
              {b.v}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
              {b.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Roadmap SVG */}
      <section className="overflow-hidden rounded-xl border border-border bg-card p-4">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          Sesong-tidslinje
        </span>
        <div className="mt-3 w-full overflow-x-auto">
          <svg
            viewBox="0 0 1200 300"
            className="h-auto w-full min-w-[640px]"
            role="img"
            aria-label="12-måneders roadmap med faser, evalueringer og turneringer"
          >
            {/* Måned-headers */}
            {MANEDER.map((m, i) => (
              <text
                key={m}
                x={50 + i * 100}
                y="16"
                textAnchor="middle"
                fontFamily="var(--font-jetbrains-mono, monospace)"
                fontSize="10"
                fill="hsl(var(--muted-foreground))"
                letterSpacing="0.06em"
              >
                {m}
              </text>
            ))}

            {/* I DAG-linje */}
            <line x1="50" y1="26" x2="50" y2="250" stroke="hsl(var(--destructive))" strokeWidth="2" />
            <text
              x="50"
              y="38"
              textAnchor="middle"
              fontFamily="var(--font-jetbrains-mono, monospace)"
              fontSize="9"
              fontWeight="700"
              fill="hsl(var(--destructive))"
            >
              I DAG
            </text>

            {/* Faser */}
            {SVG_FASER.map((f) => (
              <g key={f.label}>
                <rect x={f.x} y="54" width={f.w} height="50" rx="10" fill={f.fill} />
                <text
                  x={f.x + f.w / 2}
                  y="76"
                  textAnchor="middle"
                  fontFamily="var(--font-inter-tight, sans-serif)"
                  fontSize="13"
                  fontWeight="700"
                  fill={f.text}
                >
                  {f.label}
                </text>
                <text
                  x={f.x + f.w / 2}
                  y="94"
                  textAnchor="middle"
                  fontFamily="var(--font-jetbrains-mono, monospace)"
                  fontSize="9"
                  fill={f.text}
                  opacity="0.75"
                >
                  {f.periode}
                </text>
              </g>
            ))}

            {/* Evaluerings-markører */}
            {SVG_EVAL.map((e) => (
              <g key={e.x}>
                <polygon
                  points={`${e.x},132 ${e.x + 7},145 ${e.x - 7},145`}
                  fill="hsl(var(--accent))"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                />
                <text
                  x={e.x}
                  y="162"
                  textAnchor="middle"
                  fontFamily="var(--font-jetbrains-mono, monospace)"
                  fontSize="9"
                  fill="hsl(var(--primary))"
                  fontWeight="700"
                >
                  {e.label}
                </text>
              </g>
            ))}

            {/* Turneringer */}
            <line x1="20" y1="210" x2="1180" y2="210" stroke="hsl(var(--border))" strokeWidth="1" />
            {SVG_TURN.map((t) => (
              <g key={t.x}>
                <circle cx={t.x} cy="210" r="6" fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                <text
                  x={t.x}
                  y="230"
                  textAnchor="middle"
                  fontFamily="var(--font-jetbrains-mono, monospace)"
                  fontSize="9"
                  fill="hsl(var(--foreground))"
                  fontWeight="700"
                >
                  {t.name}
                </text>
                <text
                  x={t.x}
                  y="242"
                  textAnchor="middle"
                  fontFamily="var(--font-jetbrains-mono, monospace)"
                  fontSize="8"
                  fill="hsl(var(--muted-foreground))"
                >
                  {t.dato}
                </text>
              </g>
            ))}
            <text
              x="20"
              y="278"
              fontFamily="var(--font-jetbrains-mono, monospace)"
              fontSize="10"
              fontWeight="700"
              fill="hsl(var(--foreground))"
            >
              TURNERINGS-PLAN
            </text>
          </svg>
        </div>
      </section>

      {/* Fase-kort */}
      <section className="flex flex-col gap-3" aria-label="Faser i roadmap">
        {DEMO_FASER.map((fase) => (
          <article
            key={fase.tittel}
            className={cn(
              "rounded-xl border bg-card p-4",
              fase.status === "aktiv" ? "border-accent shadow-[0_0_0_1px_hsl(var(--accent))]" : "border-border",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold tracking-[-0.01em] text-foreground">
                {fase.tittel}
              </h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
                  fase.status === "aktiv"
                    ? "bg-accent text-accent-foreground"
                    : "border border-border bg-background text-muted-foreground",
                )}
              >
                {fase.status === "aktiv" ? "Aktiv" : "Kommer"}
              </span>
              <span className="ml-auto font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                {fase.periode}
              </span>
            </div>
            <p className="mt-1 font-display text-[13px] italic text-muted-foreground">
              {fase.fokus}
            </p>

            <div className="mt-3 flex flex-col gap-3">
              {fase.mal.map((m) => (
                <div key={m.tekst}>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center rounded-[4px] px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.08em]",
                        AXIS_BADGE[m.disiplin],
                      )}
                    >
                      {m.disiplin}
                    </span>
                    <span
                      className={cn(
                        "text-[13px] font-medium leading-tight",
                        m.done ? "text-muted-foreground line-through" : "text-foreground",
                      )}
                    >
                      {m.tekst}
                    </span>
                    <span
                      className={cn(
                        "ml-auto shrink-0 font-mono text-[11px] font-bold tabular-nums",
                        m.done ? "text-primary" : m.pct === 0 ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {m.done ? "100%" : m.pct === 0 ? "—" : `${m.pct}%`}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full", m.done ? "bg-accent" : AXIS_BAR[m.disiplin])}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      {/* Milepæler fra DB */}
      {milepaeler.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4" aria-label="Personlige milepæler">
          <div className="mb-3 flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" strokeWidth={1.5} aria-hidden />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Personlige milepæler
            </span>
          </div>
          <ul className="flex flex-col gap-3">
            {milepaeler.map((m, i) => (
              <li key={`${m.tittel}-${i}`} className="flex items-start gap-3">
                {m.oppnadd ? (
                  <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
                )}
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold leading-tight text-foreground">
                    {m.tittel}
                  </div>
                  {m.dato && (
                    <div className="mt-0.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                      {m.dato}
                    </div>
                  )}
                  {m.beskrivelse && (
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {m.beskrivelse}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* AI-strip (lime-glød) */}
      <section className="rounded-xl border border-l-[3px] border-accent/55 border-l-accent bg-accent/10 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-relaxed text-foreground">
              <strong className="font-display font-bold">Planen din er godt balansert.</strong>{" "}
              Oktober–januar er kritisk for progresjon. Vil du legge inn ekstra
              treningsøkter i en av fasene?
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Link
                href="/portal/planlegge"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-accent-foreground transition hover:brightness-105"
              >
                Endre plan
                <ArrowRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              </Link>
              <Link
                href="/portal/talent/sammenligning"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-foreground transition hover:bg-secondary"
              >
                Se sammenligning
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
