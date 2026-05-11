/**
 * PILOT — PlayerHQ Baner
 * Bygd direkte fra wireframe/design-files-v2/playerhq-A/01-baner.html
 * URL: /baner-demo
 *
 * Mock-data: Markus Roinås Pedersen, mai 2026.
 * Pro-tier rendres med full visning. Noen elementer (Globalt-leaderboard,
 * agent-funn) er Pro-låste — Free-brukere ser Lock-overlay.
 */

import {
  Plus,
  Download,
  Search,
  Filter,
  Layers,
  MapPin,
  Star,
  Home,
  Flag,
  TreePine,
  Hotel,
  Waves,
  Circle,
  Grid3x3,
  List,
  ChevronDown,
  ArrowRight,
  Lock,
  ExternalLink,
} from "lucide-react";

export default function BanerDemo() {
  return (
    <div className="min-h-screen bg-[var(--color-card,#FFFFFF)] text-foreground p-8">
      <Hero />
      <Toolbar />
      <Map />
      <TabsRow />
      <FilterBar />
      <SectionHead />
      <CoursesGrid />
      <ProLockedTeaser />
      <FooterNote />
    </div>
  );
}

function Hero() {
  return (
    <div className="mb-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground mb-2.5">
        Mål · Bane-bibliotek · 10. mai 2026
      </div>
      <h1 className="font-display text-[36px] font-bold leading-[1.1] tracking-tight">
        <em className="font-medium italic">8 baner spilt, Markus.</em>
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[13px] text-muted-foreground">
        <span>Hjemmebane: GFGK</span>
        <Dot />
        <span>
          Beste: Borre 74{" "}
          <strong className="text-[var(--status-success,#1A7D56)]">(–1)</strong>
        </span>
        <Dot />
        <span>4 nye baner anbefalt før Sørlandsåpent</span>
      </div>
    </div>
  );
}

function Toolbar() {
  return (
    <div className="mb-6 grid grid-cols-[1fr_auto] items-center gap-6">
      <div className="flex flex-wrap gap-8">
        <ToolbarStat num="8" label="Spilte 2026" />
        <ToolbarStat num="23" label="Runder totalt" />
        <ToolbarStat num="74" label="Beste score" />
        <ToolbarStat num="78,2" label="Snitt 2026" />
        <ToolbarStat num="6" label="Anbefalt" />
      </div>
      <div className="flex gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
          <Plus className="h-4 w-4" />
          Legg til bane
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
          <Download className="h-4 w-4" />
          Importer fra GolfBox
        </button>
      </div>
    </div>
  );
}

function ToolbarStat({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="font-mono text-[22px] font-medium tabular-nums leading-none tracking-tight">
        {num}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground font-medium">
        {label}
      </div>
    </div>
  );
}

function Map() {
  return (
    <div
      className="relative mb-6 h-[340px] overflow-hidden rounded-lg border border-border"
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
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 340"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M 0 230 Q 120 200, 240 215 T 480 195 T 720 230 T 980 215 T 1200 240 L 1200 340 L 0 340 Z"
          fill="#C8D6C7"
          opacity="0.5"
        />
        <path
          d="M 0 250 Q 140 230, 280 245 T 560 230 T 820 260 T 1100 245 T 1200 260 L 1200 340 L 0 340 Z"
          fill="#B8CBB7"
          opacity="0.4"
        />
        <text
          x="180"
          y="56"
          fontFamily="monospace"
          fontSize="9.5"
          fill="#9C9990"
          letterSpacing="1.6"
        >
          VESTLANDET
        </text>
        <text
          x="560"
          y="56"
          fontFamily="monospace"
          fontSize="9.5"
          fill="#9C9990"
          letterSpacing="1.6"
        >
          ØSTLANDET
        </text>
        <text
          x="880"
          y="56"
          fontFamily="monospace"
          fontSize="9.5"
          fill="#9C9990"
          letterSpacing="1.6"
        >
          TRØNDELAG
        </text>
        <text
          x="220"
          y="305"
          fontFamily="monospace"
          fontSize="9.5"
          fill="#9C9990"
          letterSpacing="1.6"
        >
          NORDSJØEN
        </text>
        <text
          x="720"
          y="305"
          fontFamily="monospace"
          fontSize="9.5"
          fill="#9C9990"
          letterSpacing="1.6"
        >
          SKAGERRAK
        </text>
        <path
          d="M 590 175 L 720 130"
          stroke="#005840"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          fill="none"
          opacity="0.55"
        />
      </svg>

      {/* TL controls — search */}
      <div className="absolute left-3.5 top-3.5 z-10 flex gap-2">
        <div className="flex min-w-[280px] items-center gap-2 rounded-md border border-border bg-card px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Søk bane eller sted …"
            className="flex-1 bg-transparent text-[13px] outline-none"
          />
          <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* TR controls */}
      <div className="absolute right-3.5 top-3.5 z-10 flex gap-2">
        <button className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-foreground shadow-sm hover:bg-secondary">
          <Filter className="h-4 w-4" />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-foreground shadow-sm hover:bg-secondary">
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* BR zoom */}
      <div className="absolute bottom-3.5 right-3.5 z-10 flex w-9 flex-col">
        <button className="grid h-9 w-9 place-items-center rounded-t-md border border-border bg-card text-[18px] font-medium hover:bg-secondary">
          +
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-b-md border border-t-0 border-border bg-card text-[18px] font-medium hover:bg-secondary">
          −
        </button>
      </div>

      {/* BL legend */}
      <div className="absolute bottom-3.5 left-3.5 z-10 flex items-center gap-4 rounded-full border border-border bg-card px-3.5 py-2 text-[11px] text-muted-foreground shadow-sm">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full bg-accent"
            style={{ border: "2px solid var(--brand-primary, #005840)" }}
          />
          Spilt (8)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full bg-card"
            style={{ border: "2px dashed var(--brand-primary, #005840)" }}
          />
          Anbefalt (6)
        </span>
      </div>

      {/* Home pin */}
      <div
        className="absolute z-20"
        style={{ top: "175px", left: "590px", transform: "translate(-50%,-50%)" }}
      >
        <div className="relative grid h-11 w-11 place-items-center rounded-full bg-accent/25">
          <div
            className="h-[18px] w-[18px] rounded-full bg-primary"
            style={{ border: "3px solid var(--color-accent,#D1F843)" }}
          />
        </div>
      </div>

      {/* Played pins */}
      <Pin top={130} left={720} label="Borre" />
      <Pin top={195} left={660} />
      <Pin top={155} left={540} />
      <Pin top={115} left={600} label="Oslo GK" />
      <Pin top={165} left={470} />
      <Pin top={215} left={760} />
      <Pin top={80} left={940} label="Stiklestad" />

      {/* Recommended pins */}
      <Pin top={145} left={380} label="Bjaavann" recommended />
      <Pin top={100} left={660} recommended />
      <Pin top={195} left={800} recommended />
      <Pin top={130} left={850} label="Tyrifjord" recommended />
      <Pin top={165} left={280} recommended />
      <Pin top={60} left={1020} recommended />
    </div>
  );
}

function Pin({
  top,
  left,
  label,
  recommended = false,
}: {
  top: number;
  left: number;
  label?: string;
  recommended?: boolean;
}) {
  return (
    <div
      className="absolute z-10"
      style={{ top: `${top}px`, left: `${left}px`, transform: "translate(-50%,-50%)" }}
    >
      <div
        className={`h-3.5 w-3.5 rounded-full ${
          recommended ? "bg-card" : "bg-accent"
        }`}
        style={{
          border: recommended
            ? "2.5px dashed var(--brand-primary,#005840)"
            : "3px solid var(--brand-primary,#005840)",
          boxShadow: "0 4px 10px rgba(0,88,64,0.3)",
        }}
      />
      {label && (
        <div
          className="absolute -top-1.5 rounded-md border border-border bg-card px-2 py-1 font-semibold whitespace-nowrap text-[11px] shadow-sm"
          style={{ left: "calc(100% + 8px)", color: recommended ? "#005840" : undefined }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

function TabsRow() {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-6">
      <div className="flex gap-1 border-b border-border">
        {[
          { name: "Spilte", count: 8, active: true },
          { name: "Anbefalt", count: 6 },
          { name: "Søk" },
        ].map((tab) => (
          <button
            key={tab.name}
            className={`relative inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
              tab.active
                ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.name}
            {tab.count !== undefined && (
              <span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[12px] text-muted-foreground">Vis</span>
        <div className="inline-flex rounded-md border border-border bg-card p-0.5">
          <button className="grid h-7 w-8 place-items-center rounded-sm bg-card text-foreground shadow-sm">
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button className="grid h-7 w-8 place-items-center rounded-sm text-muted-foreground hover:text-foreground">
            <List className="h-4 w-4" />
          </button>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium">
          <span className="text-[11px] text-muted-foreground">Sort:</span>
          <span>Sist spilt</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}

function FilterBar() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-4 py-4">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">
        Filter
      </span>
      <div className="h-5 w-px bg-border" />
      <div className="flex flex-wrap gap-2">
        {["Avstand", "Type", "Par", "Slope"].map((c) => (
          <button
            key={c}
            className="rounded-full border border-border bg-card px-3 py-1 text-[12px] font-medium text-muted-foreground hover:bg-secondary"
          >
            {c}
          </button>
        ))}
        <button className="rounded-full bg-primary px-3 py-1 text-[12px] font-medium text-primary-foreground">
          ≤ 150 km
        </button>
      </div>
      <div className="flex-1" />
      <span className="text-[12px] text-muted-foreground">Viser 8 av 8 baner</span>
    </div>
  );
}

function SectionHead() {
  return (
    <div className="mb-4 flex items-end justify-between">
      <h2 className="font-display text-[20px] font-bold tracking-tight">Mine baner</h2>
      <span className="font-mono text-[12px] text-muted-foreground">
        Sortert etter sist spilt
      </span>
    </div>
  );
}

type CourseCard = {
  name: string;
  par: number;
  meters: string;
  slope: number;
  location: string;
  rounds: number;
  best: number;
  avg: string;
  lastPlayed: string;
  tag: "Beste score" | "Hjemmebane" | "Park" | "Links" | "Skog" | "Resort";
  gradient: string;
  featured?: boolean;
  highlightBest?: boolean;
};

const courses: CourseCard[] = [
  {
    name: "Borre Golfklubb",
    par: 71,
    meters: "6 124 m",
    slope: 132,
    location: "Horten · 142 km hjemmefra",
    rounds: 3,
    best: 74,
    avg: "76,7",
    lastPlayed: "Sist 04.05.26",
    tag: "Beste score",
    gradient: "linear-gradient(160deg, #4a7c5c 0%, #2d5a3f 60%, #1a3d2a 100%)",
    featured: true,
    highlightBest: true,
  },
  {
    name: "Gamle Fredrikstad GK",
    par: 70,
    meters: "5 842 m",
    slope: 128,
    location: "Fredrikstad · hjemme",
    rounds: 12,
    best: 76,
    avg: "79,4",
    lastPlayed: "Sist 09.05.26",
    tag: "Hjemmebane",
    gradient: "linear-gradient(160deg, #5e8a4e 0%, #3a6234 60%, #213c1f 100%)",
  },
  {
    name: "Oslo Golfklubb",
    par: 72,
    meters: "6 348 m",
    slope: 136,
    location: "Bogstad · 95 km hjemmefra",
    rounds: 2,
    best: 79,
    avg: "81,5",
    lastPlayed: "Sist 28.04.26",
    tag: "Park",
    gradient: "linear-gradient(160deg, #3a6b73 0%, #1f4a52 60%, #103035 100%)",
  },
  {
    name: "Larvik Golfklubb",
    par: 70,
    meters: "5 968 m",
    slope: 124,
    location: "Larvik · 124 km hjemmefra",
    rounds: 2,
    best: 78,
    avg: "79,5",
    lastPlayed: "Sist 22.04.26",
    tag: "Links",
    gradient: "linear-gradient(160deg, #6d8a4e 0%, #4a6234 60%, #2a3c1f 100%)",
  },
  {
    name: "Hauger Golfklubb",
    par: 72,
    meters: "6 280 m",
    slope: 138,
    location: "Sandvika · 110 km hjemmefra",
    rounds: 1,
    best: 82,
    avg: "82,0",
    lastPlayed: "Sist 15.04.26",
    tag: "Skog",
    gradient: "linear-gradient(160deg, #4a7062 0%, #2a4c40 60%, #18302a 100%)",
  },
  {
    name: "Stiklestad Golfklubb",
    par: 72,
    meters: "6 412 m",
    slope: 134,
    location: "Verdal · 645 km hjemmefra",
    rounds: 1,
    best: 84,
    avg: "84,0",
    lastPlayed: "Sist 08.04.26",
    tag: "Resort",
    gradient: "linear-gradient(160deg, #5c7c4e 0%, #3a5934 60%, #213c1f 100%)",
  },
];

function CoursesGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <CourseCardEl key={c.name} c={c} />
      ))}
    </div>
  );
}

function CourseCardEl({ c }: { c: CourseCard }) {
  const tagIcons: Record<CourseCard["tag"], React.ReactNode> = {
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
        c.featured ? "border-primary" : "border-border"
      }`}
    >
      <div
        className="relative h-32 overflow-hidden"
        style={{ background: c.gradient }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(10,31,24,0.4) 100%)",
          }}
        />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
            c.tag === "Hjemmebane"
              ? "bg-accent text-accent-foreground"
              : "bg-white/95 text-foreground"
          }`}
        >
          {tagIcons[c.tag]}
          {c.tag}
        </span>
        <span className="absolute bottom-3 right-3 text-white/85">
          <Flag className="h-5 w-5" strokeWidth={1.5} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4 pb-4">
        <div>
          <div className="font-display text-[16px] font-semibold tracking-tight">
            {c.name}
          </div>
          <div className="mt-1 flex gap-2.5 font-mono text-[11.5px] tabular-nums text-muted-foreground">
            <span>Par {c.par}</span>
            <Dot />
            <span>{c.meters}</span>
            <Dot />
            <span>Slope {c.slope}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {c.location}
        </div>
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3">
          <CourseStat label="Runder" val={String(c.rounds)} />
          <CourseStat
            label="Beste"
            val={String(c.best)}
            highlight={c.highlightBest}
          />
          <CourseStat label="Snitt" val={c.avg} />
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="font-mono text-[11px] text-muted-foreground">
            {c.lastPlayed}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
            Detaljer
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-0.5 font-mono text-[14px] font-medium tabular-nums ${
          highlight ? "text-[var(--status-success,#1A7D56)]" : "text-foreground"
        }`}
      >
        {val}
      </div>
    </div>
  );
}

function ProLockedTeaser() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6">
        <div className="absolute inset-0 z-10 grid place-items-center bg-card/85 backdrop-blur-sm">
          <div className="grid place-items-center gap-3 p-6 text-center">
            <Lock className="h-12 w-12 text-primary" />
            <div className="font-display text-[16px] font-semibold">
              Globalt leaderboard
            </div>
            <ul className="text-[13px] text-muted-foreground space-y-1">
              <li>Se hvor du står mot 1 200+ spillere</li>
              <li>Sammenlikn med jevnaldrende (A2)</li>
              <li>Ukentlig peer-rapport på e-post</li>
            </ul>
            <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground">
              Oppgrader til Pro
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Pro · Globalt
        </div>
        <div className="mt-1 font-display text-[18px] font-semibold">
          Du ligger #142 av 1 247
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Pro · agent-funn
        </div>
        <h3 className="mt-1 font-display text-[18px] font-semibold">
          3 nye baner anbefalt
        </h3>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Bjaavann, Tyrifjord og en til — innen 150 km — er beste forberedelse
          før Sørlandsåpent 31.05.
        </p>
        <button className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          Vis anbefalinger
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function FooterNote() {
  return (
    <div className="mt-8 flex items-center gap-4 rounded-lg border border-border bg-card px-6 py-5">
      <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
        <ExternalLink className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="font-display text-[14px] font-semibold">
          2 baner manglende fra GolfBox?
        </div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">
          Synkronisering kan ta opp til 24 timer etter siste runde. Sist hentet:
          09.05.26 kl. 21:14.
        </div>
      </div>
      <button className="rounded-md px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
        Synk nå
      </button>
    </div>
  );
}

function Dot() {
  return (
    <span
      className="inline-block h-1 w-1 rounded-full"
      style={{ background: "var(--ink-disabled, #C4C0B8)" }}
    />
  );
}
