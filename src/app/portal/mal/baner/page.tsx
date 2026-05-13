/**
 * PlayerHQ · Mål · Baner
 *
 * Endelig design fra wireframe/design-files-v2/playerhq-A/01-baner.html.
 * Datakilde: CourseDefinition + Round (egne runder). Mock-stats erstatter
 * features som ennå ikke ligger i schema (slope-trend, distanse-fra-hjemme,
 * Pro-låste funn). Plassholdere markert med // TODO.
 */

import {
  ArrowRight,
  ChevronDown,
  Circle,
  Download,
  ExternalLink,
  Filter,
  Flag,
  Grid3x3,
  Home,
  Hotel,
  Layers,
  List,
  Lock,
  MapPin,
  Plus,
  Search,
  Star,
  TreePine,
  Waves,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type CardTag = "Beste score" | "Hjemmebane" | "Park" | "Links" | "Skog" | "Resort";

const CARD_GRADIENTS = [
  "linear-gradient(160deg, #4a7c5c 0%, #2d5a3f 60%, #1a3d2a 100%)",
  "linear-gradient(160deg, #5e8a4e 0%, #3a6234 60%, #213c1f 100%)",
  "linear-gradient(160deg, #3a6b73 0%, #1f4a52 60%, #103035 100%)",
  "linear-gradient(160deg, #6d8a4e 0%, #4a6234 60%, #2a3c1f 100%)",
  "linear-gradient(160deg, #4a7062 0%, #2a4c40 60%, #18302a 100%)",
  "linear-gradient(160deg, #5c7c4e 0%, #3a5934 60%, #213c1f 100%)",
];

export default async function BanerPage() {
  const user = await requirePortalUser();

  const [courses, runder] = await Promise.all([
    prisma.courseDefinition.findMany({ orderBy: { name: "asc" } }),
    prisma.round.findMany({
      where: { userId: user.id },
      select: {
        courseId: true,
        score: true,
        playedAt: true,
        sgTotal: true,
      },
      orderBy: { playedAt: "desc" },
    }),
  ]);

  type Stats = {
    antall: number;
    beste: number | null;
    snitt: number | null;
    sist: Date | null;
  };
  const sgPerBane = new Map<string, Stats>();
  for (const r of runder) {
    const eks =
      sgPerBane.get(r.courseId) ?? {
        antall: 0,
        beste: null,
        snitt: null,
        sist: null,
      };
    eks.antall += 1;
    eks.beste = eks.beste == null ? r.score : Math.min(eks.beste, r.score);
    eks.snitt =
      eks.snitt == null
        ? r.score
        : (eks.snitt * (eks.antall - 1) + r.score) / eks.antall;
    if (!eks.sist || r.playedAt > eks.sist) eks.sist = r.playedAt;
    sgPerBane.set(r.courseId, eks);
  }

  const spilte = courses.filter((c) => sgPerBane.has(c.id));
  const totalRunder = runder.length;
  const beste =
    runder.length > 0 ? Math.min(...runder.map((r) => r.score)) : null;
  const snitt =
    runder.length > 0
      ? runder.reduce((s, r) => s + r.score, 0) / runder.length
      : null;

  const fornavn = user.name.split(" ")[0];
  const dato = new Date().toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <Hero
        fornavn={fornavn}
        dato={dato}
        antallSpilt={spilte.length}
        beste={beste}
        homeClub={user.homeClub ?? null}
      />

      <Toolbar
        spilte={spilte.length}
        runder={totalRunder}
        beste={beste}
        snitt={snitt}
      />

      <MapView />

      <TabsRow antallSpilt={spilte.length} />

      <FilterBar antallVist={spilte.length} totalSpilt={spilte.length} />

      <SectionHead />

      {spilte.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-base font-semibold text-foreground">
            Ingen runder registrert ennå
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Når du har spilt runder vises banene dine her med statistikk.
          </p>
        </div>
      ) : (
        <CoursesGrid
          courses={spilte}
          statsMap={sgPerBane}
          homeClub={user.homeClub ?? null}
        />
      )}

      <ProLockedTeaser />

      <FooterNote />
    </div>
  );
}

function Hero({
  fornavn,
  dato,
  antallSpilt,
  beste,
  homeClub,
}: {
  fornavn: string;
  dato: string;
  antallSpilt: number;
  beste: number | null;
  homeClub: string | null;
}) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Mål · Bane-bibliotek · {dato}
      </div>
      <h1 className="font-display text-4xl leading-[1.1] tracking-tight">
        <em className="font-medium italic">
          {antallSpilt} {antallSpilt === 1 ? "bane spilt" : "baner spilt"},{" "}
          {fornavn}.
        </em>
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {homeClub && (
          <>
            <span>Hjemmebane: {homeClub}</span>
            <Dot />
          </>
        )}
        {beste != null && (
          <>
            <span>
              Beste:{" "}
              <strong className="text-foreground">{beste}</strong>
            </span>
            <Dot />
          </>
        )}
        {/* TODO: agent-funn (anbefalte baner) — kommer fra Signal/PlanAction senere */}
        <span>Bla videre i banebiblioteket</span>
      </div>
    </div>
  );
}

function Toolbar({
  spilte,
  runder,
  beste,
  snitt,
}: {
  spilte: number;
  runder: number;
  beste: number | null;
  snitt: number | null;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-6">
      <div className="flex flex-wrap gap-8">
        <ToolbarStat num={String(spilte)} label="Spilte" />
        <ToolbarStat num={String(runder)} label="Runder totalt" />
        <ToolbarStat num={beste != null ? String(beste) : "—"} label="Beste score" />
        <ToolbarStat
          num={snitt != null ? snitt.toFixed(1).replace(".", ",") : "—"}
          label="Snitt"
        />
        {/* TODO: anbefalte baner fra agent */}
        <ToolbarStat num="—" label="Anbefalt" />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Plus className="h-4 w-4" />
          Legg til bane
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Importer fra GolfBox
        </button>
      </div>
    </div>
  );
}

function ToolbarStat({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-mono text-2xl font-medium tabular-nums leading-none tracking-tight text-foreground">
        {num}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function MapView() {
  // TODO: ekte kartlag (Mapbox/Maplibre) når CourseDefinition har lat/lng.
  return (
    <div
      className="relative h-[340px] overflow-hidden rounded-lg border border-border"
      style={{
        background:
          "radial-gradient(ellipse at 30% 40%, #E6EEE5 0%, #DDE7DD 35%, #D2DED2 100%)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,88,64,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,88,64,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="absolute left-4 top-4 z-10 flex gap-2">
        <div className="flex min-w-[280px] items-center gap-2 rounded-md border border-border bg-card px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Søk bane eller sted …"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-foreground shadow-sm hover:bg-secondary"
        >
          <Filter className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-foreground shadow-sm hover:bg-secondary"
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-4 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-sm">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent ring-2 ring-primary" />
          Spilt
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-card ring-2 ring-primary/40" />
          Anbefalt
        </span>
      </div>
    </div>
  );
}

function TabsRow({ antallSpilt }: { antallSpilt: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div className="flex gap-1 border-b border-border">
        {[
          { name: "Spilte", count: antallSpilt, active: true },
          { name: "Anbefalt" },
          { name: "Søk" },
        ].map((tab) => (
          <button
            key={tab.name}
            type="button"
            className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab.active
                ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.name}
            {tab.count !== undefined && (
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">Vis</span>
        <div className="inline-flex rounded-md border border-border bg-card p-0.5">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-sm bg-card text-foreground shadow-sm"
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-sm text-muted-foreground hover:text-foreground"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <span>Sist spilt</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function FilterBar({
  antallVist,
  totalSpilt,
}: {
  antallVist: number;
  totalSpilt: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-4 py-4">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Filter
      </span>
      <div className="h-4 w-px bg-border" />
      <div className="flex flex-wrap gap-2">
        {["Avstand", "Type", "Par", "Slope"].map((c) => (
          <button
            key={c}
            type="button"
            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary"
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex-1" />
      <span className="text-xs text-muted-foreground">
        Viser {antallVist} av {totalSpilt} baner
      </span>
    </div>
  );
}

function SectionHead() {
  return (
    <div className="flex items-end justify-between">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        Mine baner
      </h2>
      <span className="font-mono text-xs text-muted-foreground">
        Sortert etter sist spilt
      </span>
    </div>
  );
}

function CoursesGrid({
  courses,
  statsMap,
  homeClub,
}: {
  courses: { id: string; name: string; par: number; slope: number | null }[];
  statsMap: Map<
    string,
    { antall: number; beste: number | null; snitt: number | null; sist: Date | null }
  >;
  homeClub: string | null;
}) {
  const sorted = [...courses].sort((a, b) => {
    const sa = statsMap.get(a.id)?.sist?.getTime() ?? 0;
    const sb = statsMap.get(b.id)?.sist?.getTime() ?? 0;
    return sb - sa;
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sorted.map((c, i) => {
        const stats = statsMap.get(c.id) ?? {
          antall: 0,
          beste: null,
          snitt: null,
          sist: null,
        };
        const erHjemme = homeClub != null && c.name === homeClub;
        const erBeste =
          stats.beste != null &&
          stats.beste === Math.min(...[...statsMap.values()].map((s) => s.beste ?? Infinity));
        const tag: CardTag = erHjemme
          ? "Hjemmebane"
          : erBeste
            ? "Beste score"
            : "Park"; // TODO: tagging fra CourseDefinition (type)
        return (
          <CourseCardEl
            key={c.id}
            name={c.name}
            par={c.par}
            slope={c.slope}
            stats={stats}
            tag={tag}
            featured={erBeste}
            highlightBest={erBeste}
            gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
          />
        );
      })}
    </div>
  );
}

function CourseCardEl({
  name,
  par,
  slope,
  stats,
  tag,
  featured,
  highlightBest,
  gradient,
}: {
  name: string;
  par: number;
  slope: number | null;
  stats: { antall: number; beste: number | null; snitt: number | null; sist: Date | null };
  tag: CardTag;
  featured?: boolean;
  highlightBest?: boolean;
  gradient: string;
}) {
  const tagIcons: Record<CardTag, React.ReactNode> = {
    "Beste score": <Star className="h-3 w-3" />,
    Hjemmebane: <Home className="h-3 w-3" />,
    Park: <Circle className="h-3 w-3" />,
    Links: <Waves className="h-3 w-3" />,
    Skog: <TreePine className="h-3 w-3" />,
    Resort: <Hotel className="h-3 w-3" />,
  };

  return (
    <div
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md ${
        featured ? "border-primary" : "border-border"
      }`}
    >
      <div className="relative h-32 overflow-hidden" style={{ background: gradient }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(10,31,24,0.4) 100%)",
          }}
        />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
            tag === "Hjemmebane"
              ? "bg-accent text-accent-foreground"
              : "bg-card text-foreground"
          }`}
        >
          {tagIcons[tag]}
          {tag}
        </span>
        <span className="absolute bottom-3 right-3 text-card/85">
          <Flag className="h-5 w-5" strokeWidth={1.5} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <div className="font-display text-base font-semibold tracking-tight">
            {name}
          </div>
          <div className="mt-1 flex gap-2 font-mono text-xs tabular-nums text-muted-foreground">
            <span>Par {par}</span>
            {slope != null && (
              <>
                <Dot />
                <span>Slope {slope}</span>
              </>
            )}
          </div>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {/* TODO: lokasjon + distanse fra hjemme */}
          Lokasjon ukjent
        </div>
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-2">
          <CourseStat label="Runder" val={String(stats.antall)} />
          <CourseStat
            label="Beste"
            val={stats.beste != null ? String(stats.beste) : "—"}
            highlight={highlightBest}
          />
          <CourseStat
            label="Snitt"
            val={stats.snitt != null ? stats.snitt.toFixed(1).replace(".", ",") : "—"}
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="font-mono text-xs text-muted-foreground">
            {stats.sist
              ? `Sist ${stats.sist.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "2-digit" })}`
              : "Ikke spilt"}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Detaljer
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  );
}

function CourseStat({
  label,
  val,
  highlight,
}: {
  label: string;
  val: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-sm font-medium tabular-nums ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {val}
      </div>
    </div>
  );
}

function ProLockedTeaser() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6">
        <div className="absolute inset-0 z-10 grid place-items-center bg-card/85 backdrop-blur-sm">
          <div className="grid place-items-center gap-2 p-6 text-center">
            <Lock className="h-12 w-12 text-primary" />
            <div className="font-display text-base font-semibold">
              Globalt leaderboard
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>Se hvor du står mot 1 200+ spillere</li>
              <li>Sammenlikn med jevnaldrende</li>
              <li>Ukentlig peer-rapport på e-post</li>
            </ul>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Oppgrader til Pro
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Pro · Globalt
        </div>
        <div className="mt-2 font-display text-lg font-semibold">
          Du ligger #—
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Pro · agent-funn
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold">
          Anbefalte baner
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Når agenten kjenner spillemønsteret ditt, foreslår den nye baner som
          passer formtoppen din.
        </p>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          Vis anbefalinger
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function FooterNote() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-6 py-4">
      <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
        <ExternalLink className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="font-display text-sm font-semibold">
          Baner manglende fra GolfBox?
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          Synkronisering kan ta opp til 24 timer etter siste runde.
        </div>
      </div>
      <button
        type="button"
        className="rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
      >
        Synk nå
      </button>
    </div>
  );
}

function Dot() {
  return (
    <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
  );
}
