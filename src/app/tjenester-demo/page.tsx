/**
 * PILOT — CoachHQ Tjenester
 * Bygd fra wireframe/design-files-v2/screens/06-tjenester.html
 * URL: /tjenester-demo
 *
 * Bookbar katalog med 12 tjenester. Mock-data — endringer her
 * skal speile booking.akgolf.no.
 */
import {
  Download,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";

type Category = "coaching" | "studio" | "greenfee" | "gruppe" | "event";

type Service = {
  id: string;
  name: string;
  desc: string;
  duration: string;
  priceOre: number | null; // null = ikke priset i kroner per minutt (pakke)
  priceLabel: string;
  category: Category;
  bookingsMonth: number;
  spark: number[];
  active: boolean;
};

const CATEGORY_LABEL: Record<Category, string> = {
  coaching: "Coaching",
  studio: "Studio",
  greenfee: "Greenfee",
  gruppe: "Gruppe",
  event: "Event",
};

const CATEGORY_STYLE: Record<Category, { bg: string; fg: string; spark: string }> = {
  coaching: { bg: "rgba(0,88,64,0.10)", fg: "#005840", spark: "#005840" },
  studio: { bg: "rgba(26,125,86,0.10)", fg: "#1A7D56", spark: "#1A7D56" },
  greenfee: { bg: "rgba(184,133,42,0.15)", fg: "#B8852A", spark: "#B8852A" },
  gruppe: { bg: "rgba(94,92,87,0.10)", fg: "#5E5C57", spark: "#5E5C57" },
  event: { bg: "rgba(94,92,87,0.10)", fg: "#5E5C57", spark: "#5E5C57" },
};

const SERVICES: Service[] = [
  {
    id: "coach-60",
    name: "1:1 Coaching 60 min",
    desc: "Hovedøkt med video-analyse og oppgaver",
    duration: "60 min",
    priceOre: 160_000,
    priceLabel: "1 600 kr",
    category: "coaching",
    bookingsMonth: 28,
    spark: [18, 16, 14, 12, 9, 11, 4],
    active: true,
  },
  {
    id: "coach-30",
    name: "1:1 Coaching 30 min",
    desc: "Kort oppfølgingsøkt, ingen video",
    duration: "30 min",
    priceOre: 90_000,
    priceLabel: "900 kr",
    category: "coaching",
    bookingsMonth: 18,
    spark: [16, 18, 12, 15, 10, 12, 8],
    active: true,
  },
  {
    id: "studio-1",
    name: "Mulligan Studio 1 — leie",
    desc: "Selvstendig studio-leie, TrackMan inkludert",
    duration: "60 min",
    priceOre: 65_000,
    priceLabel: "650 kr",
    category: "studio",
    bookingsMonth: 47,
    spark: [20, 18, 16, 12, 8, 5, 3],
    active: true,
  },
  {
    id: "studio-2",
    name: "Mulligan Studio 2 — leie",
    desc: "Inkluderer video-rig og slow-mo opptak",
    duration: "60 min",
    priceOre: 75_000,
    priceLabel: "750 kr",
    category: "studio",
    bookingsMonth: 38,
    spark: [18, 16, 12, 14, 10, 8, 6],
    active: true,
  },
  {
    id: "greenfee-bossum",
    name: "Greenfee Bossum GK 18h",
    desc: "Avtalepris for AK-medlemmer",
    duration: "4 t",
    priceOre: 72_000,
    priceLabel: "720 kr",
    category: "greenfee",
    bookingsMonth: 12,
    spark: [22, 22, 18, 14, 12, 8, 4],
    active: true,
  },
  {
    id: "wang-gruppe",
    name: "WANG gruppeøkt",
    desc: "Avtale med skole — gratis for elever",
    duration: "90 min",
    priceOre: 0,
    priceLabel: "0 kr",
    category: "gruppe",
    bookingsMonth: 24,
    spark: [8, 10, 12, 8, 10, 8, 6],
    active: true,
  },
  {
    id: "junior-dropin",
    name: "Junior gruppe — drop-in",
    desc: "Tirsdager kl 17 · maks 8 stk",
    duration: "60 min",
    priceOre: 35_000,
    priceLabel: "350 kr",
    category: "gruppe",
    bookingsMonth: 19,
    spark: [18, 14, 16, 12, 14, 10, 8],
    active: true,
  },
  {
    id: "studio-3",
    name: "Mulligan Studio 3 — leie",
    desc: "Mest brukte studio for putting-arbeid",
    duration: "60 min",
    priceOre: 65_000,
    priceLabel: "650 kr",
    category: "studio",
    bookingsMonth: 31,
    spark: [16, 14, 15, 12, 10, 12, 9],
    active: true,
  },
  {
    id: "greenfee-gfgk",
    name: "Greenfee GFGK 18h",
    desc: "Sesong april–oktober",
    duration: "4 t",
    priceOre: 68_000,
    priceLabel: "680 kr",
    category: "greenfee",
    bookingsMonth: 9,
    spark: [22, 22, 20, 16, 14, 10, 6],
    active: true,
  },
  {
    id: "studio-4",
    name: "Mulligan Studio 4 — leie",
    desc: "FYS + putting kombi-rom",
    duration: "60 min",
    priceOre: 65_000,
    priceLabel: "650 kr",
    category: "studio",
    bookingsMonth: 22,
    spark: [18, 16, 14, 16, 12, 11, 10],
    active: true,
  },
  {
    id: "sommerleir",
    name: "Sommerleir junior",
    desc: "Uke 26 · 5 dager · alle fasiliteter",
    duration: "5 dgr",
    priceOre: 420_000,
    priceLabel: "4 200 kr",
    category: "event",
    bookingsMonth: 14,
    spark: [22, 22, 22, 18, 12, 8, 6],
    active: true,
  },
  {
    id: "pro-pakke-10",
    name: "Pro-pakke 10 økter",
    desc: "Forhåndskjøp · 10×60 min · 3 mnd gyldighet",
    duration: "—",
    priceOre: 1_440_000,
    priceLabel: "14 400 kr",
    category: "coaching",
    bookingsMonth: 7,
    spark: [18, 16, 14, 12, 10, 8, 6],
    active: true,
  },
];

export default function TjenesterDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Header />
      <Kpis />
      <FilterBar />
      <Table />
    </div>
  );
}

function Header() {
  return (
    <header className="mb-6 flex items-end justify-between gap-6">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Coach HQ
          <span className="mx-2 text-muted-foreground/60">/</span>Drift
          <span className="mx-2 text-muted-foreground/60">/</span>Tjenester
        </div>
        <h1 className="mt-2 font-display text-[30px] font-normal italic leading-[1.1] tracking-tight">
          Tolv tjenester. Alle aktive.
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-card px-4 text-[13px] font-medium hover:bg-secondary">
          <Download size={14} strokeWidth={1.5} />
          Eksport
        </button>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          <Plus size={14} strokeWidth={1.5} />
          Ny tjeneste
        </button>
      </div>
    </header>
  );
}

function Kpis() {
  return (
    <div className="mb-4 grid grid-cols-4 gap-4">
      <Kpi label="Aktive tjenester" value="12 av 12" delta="Alt synlig på booking" />
      <Kpi label="Snitt-pris" value="1 240 kr" delta="+4 % siste 30d" deltaGood />
      <Kpi
        label="Mest bookede"
        value="Studio 1 — leie"
        valueSmall
        delta="47 bookinger MTD"
      />
      <Kpi
        label="Inntekt MTD"
        value="142 800 kr"
        delta="+12 % vs forrige mnd"
        deltaGood
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  deltaGood = false,
  valueSmall = false,
}: {
  label: string;
  value: string;
  delta: string;
  deltaGood?: boolean;
  valueSmall?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono font-medium leading-none tabular-nums ${valueSmall ? "text-[18px]" : "text-[28px]"}`}
      >
        {value}
      </div>
      <div
        className={`mt-2 font-mono text-[12px] ${deltaGood ? "text-[#1A7D56]" : "text-muted-foreground"}`}
      >
        {delta}
      </div>
    </div>
  );
}

function FilterBar() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-3">
      <div className="flex h-10 min-w-[280px] flex-1 items-center gap-2.5 rounded-md border border-border bg-background px-3.5 text-muted-foreground">
        <Search size={16} strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Søk tjeneste"
          className="flex-1 bg-transparent text-[14px] text-foreground outline-none"
        />
        <span className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          ⌘K
        </span>
      </div>
      <Chip>Kategori</Chip>
      <Chip>Coaching · 3</Chip>
      <Chip>Studio · 4</Chip>
      <Chip>Greenfee · 2</Chip>
      <Chip>Gruppe · 2</Chip>
      <Chip>Event · 1</Chip>
      <Chip active>Aktiv · 12</Chip>
      <Chip>Pris</Chip>
      <span className="ml-auto font-mono text-[11px] text-muted-foreground">
        Sort: Bookinger ↓
      </span>
    </div>
  );
}

function Chip({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </span>
  );
}

function Table() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-background">
            <th className="w-10 py-3 pl-4" />
            <th className="px-3 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Navn
            </th>
            <th className="w-[100px] px-3 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Varighet
            </th>
            <th className="w-[120px] px-3 py-3 text-right font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Pris
            </th>
            <th className="w-[120px] px-3 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Kategori
            </th>
            <th className="w-[180px] px-3 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Bookinger mnd
            </th>
            <th className="w-[80px] px-3 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Aktiv
            </th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {SERVICES.map((s) => (
            <Row key={s.id} s={s} />
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-border bg-background px-4 py-3 text-[12px] text-muted-foreground">
        <span>
          Viser{" "}
          <span className="font-semibold text-foreground">{SERVICES.length}</span>{" "}
          av {SERVICES.length} tjenester
        </span>
        <div className="flex items-center gap-1">
          <button className="grid h-7 w-7 place-items-center rounded border border-border bg-card text-foreground hover:bg-secondary">
            ‹
          </button>
          <button className="grid h-7 w-7 place-items-center rounded border border-border bg-foreground font-mono text-[12px] text-background">
            1
          </button>
          <button className="grid h-7 w-7 place-items-center rounded border border-border bg-card text-foreground hover:bg-secondary">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ s }: { s: Service }) {
  const cat = CATEGORY_STYLE[s.category];
  return (
    <tr className="border-b border-border last:border-0 hover:bg-secondary/40">
      <td className="py-3 pl-4">
        <span className="block h-4 w-4 rounded border border-border bg-background" />
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] font-medium leading-tight">{s.name}</span>
          <span className="text-[12px] text-muted-foreground">{s.desc}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-left font-mono text-[13px] tabular-nums text-muted-foreground">
        {s.duration}
      </td>
      <td
        className={`px-3 py-3 text-right font-mono text-[13px] tabular-nums ${s.priceOre === 0 ? "text-muted-foreground" : ""}`}
      >
        {s.priceLabel}
      </td>
      <td className="px-3 py-3">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={{ background: cat.bg, color: cat.fg }}
        >
          {CATEGORY_LABEL[s.category]}
        </span>
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-2">
          <Sparkline points={s.spark} color={cat.spark} />
          <span className="font-mono text-[13px] font-medium tabular-nums">
            {s.bookingsMonth}
          </span>
        </span>
      </td>
      <td className="px-3 py-3">
        <span className="inline-block h-5 w-9 rounded-full bg-primary p-0.5">
          <span className="block h-4 w-4 translate-x-4 rounded-full bg-white" />
        </span>
      </td>
      <td className="px-3 py-3 text-right">
        <button className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground">
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </button>
      </td>
    </tr>
  );
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const pts = points
    .map((p, i) => `${(i * 64) / (points.length - 1)},${p}`)
    .join(" ");
  return (
    <svg viewBox="0 0 64 24" width="64" height="24" className="shrink-0">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

