/**
 * PILOT — CoachHQ Lokasjoner
 * Bygd fra wireframe/design-files-v2/screens/07-lokasjoner.html
 * URL: /lokasjoner-demo
 *
 * Split-view: kart-placeholder + 5 lokasjons-kort.
 * Lokasjon = parent-anlegg, Fasilitet = bookbar barn.
 */
import { Download, MapPin, Plus, Search } from "lucide-react";

type LocType = "indoor" | "hybrid" | "bane" | "range";

type Facility = {
  label: string;
  kind: "ind" | "range" | "bane" | "put";
};

type Location = {
  id: string;
  badge: string;
  name: string;
  address: string;
  type: LocType;
  facilities: Facility[];
  openLabel: string;
  openValue: string;
  occupancyPct: number;
  bookingsMonth: number;
  pin: { x: number; y: number };
  active?: boolean;
};

const TYPE_STYLE: Record<LocType, { bg: string; fg: string; label: string }> = {
  indoor: { bg: "rgba(0,88,64,0.10)", fg: "hsl(var(--primary))", label: "Indoor" },
  hybrid: { bg: "rgba(209,248,67,0.20)", fg: "hsl(var(--foreground))", label: "Hybrid" },
  bane: { bg: "rgba(94,92,87,0.10)", fg: "hsl(var(--muted-foreground))", label: "Bane" },
  range: { bg: "rgba(184,133,42,0.10)", fg: "hsl(var(--warning))", label: "Range" },
};

const FAC_STYLE: Record<Facility["kind"], { bg: string; fg: string }> = {
  ind: { bg: "rgba(0,88,64,0.08)", fg: "hsl(var(--primary))" },
  range: { bg: "rgba(184,133,42,0.10)", fg: "hsl(var(--warning))" },
  bane: { bg: "rgba(26,125,86,0.10)", fg: "hsl(var(--success))" },
  put: { bg: "rgba(94,92,87,0.10)", fg: "hsl(var(--muted-foreground))" },
};

const LOCATIONS: Location[] = [
  {
    id: "mulligan",
    badge: "M",
    name: "Mulligan Indoor Borre",
    address: "Storgata 12, Fredrikstad",
    type: "indoor",
    facilities: [
      { label: "Studio 1", kind: "ind" },
      { label: "Studio 2", kind: "ind" },
      { label: "Studio 3", kind: "ind" },
      { label: "Studio 4", kind: "ind" },
    ],
    openLabel: "Åpningstid",
    openValue: "06–23",
    occupancyPct: 82,
    bookingsMonth: 112,
    pin: { x: 22, y: 48 },
    active: true,
  },
  {
    id: "bossum",
    badge: "B",
    name: "Bossum GK",
    address: "Bossum, Borge",
    type: "hybrid",
    facilities: [
      { label: "Range", kind: "range" },
      { label: "18h bane", kind: "bane" },
      { label: "Putting green", kind: "put" },
    ],
    openLabel: "Sesong",
    openValue: "07–21",
    occupancyPct: 71,
    bookingsMonth: 68,
    pin: { x: 28, y: 68 },
  },
  {
    id: "gfgk",
    badge: "G",
    name: "Gamle Fredrikstad GK",
    address: "Solli, Fredrikstad",
    type: "hybrid",
    facilities: [
      { label: "Range", kind: "range" },
      { label: "18h bane", kind: "bane" },
      { label: "Kortspill-område", kind: "put" },
    ],
    openLabel: "Sesong",
    openValue: "07–22",
    occupancyPct: 62,
    bookingsMonth: 54,
    pin: { x: 18, y: 62 },
  },
  {
    id: "drobak",
    badge: "D",
    name: "Drøbak GK",
    address: "Drøbak",
    type: "bane",
    facilities: [
      { label: "18h bane", kind: "bane" },
      { label: "Range", kind: "range" },
    ],
    openLabel: "Sesong",
    openValue: "07–21",
    occupancyPct: 58,
    bookingsMonth: 31,
    pin: { x: 62, y: 24 },
  },
  {
    id: "wang",
    badge: "W",
    name: "WANG Toppidrett Fredrikstad",
    address: "Fredrikstad",
    type: "range",
    facilities: [
      { label: "Range", kind: "range" },
      { label: "9h bane", kind: "bane" },
    ],
    openLabel: "Sesong",
    openValue: "08–20",
    occupancyPct: 51,
    bookingsMonth: 22,
    pin: { x: 24, y: 38 },
  },
];

export default function LokasjonerDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Header />
      <Kpis />
      <FilterBar />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Map />
        <div className="flex flex-col gap-2">
          {LOCATIONS.map((l) => (
            <LocationCard key={l.id} l={l} />
          ))}
        </div>
      </div>
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
          <span className="mx-2 text-muted-foreground/60">/</span>Lokasjoner
        </div>
        <h1 className="mt-2 font-display text-[30px] font-normal italic leading-[1.1] tracking-tight">
          Fem anlegg. Tolv fasiliteter.
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-card px-4 text-[13px] font-medium hover:bg-secondary">
          <Download size={14} strokeWidth={1.5} />
          Eksport
        </button>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          <Plus size={14} strokeWidth={1.5} />
          Ny lokasjon
        </button>
      </div>
    </header>
  );
}

function Kpis() {
  return (
    <div className="mb-4 grid grid-cols-3 gap-4">
      <Kpi label="Aktive lokasjoner" value="5" delta="3 indoor · 2 bane" />
      <Kpi
        label="Totale fasiliteter"
        value="12"
        delta="4 studio · 3 range · 5 bane"
      />
      <Kpi
        label="Snitt-belegg uka"
        value="67 %"
        delta="+5 % vs forrige uke"
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
}: {
  label: string;
  value: string;
  delta: string;
  deltaGood?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[28px] font-medium leading-none tabular-nums">
        {value}
      </div>
      <div
        className={`mt-2 font-mono text-[12px] ${deltaGood ? "text-success" : "text-muted-foreground"}`}
      >
        {delta}
      </div>
    </div>
  );
}

function FilterBar() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-2">
      <div className="flex h-10 min-w-[280px] flex-1 items-center gap-2.5 rounded-md border border-border bg-background px-4 text-muted-foreground">
        <Search size={16} strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Søk lokasjon eller adresse"
          className="flex-1 bg-transparent text-[14px] text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
      </div>
      <Chip>Type</Chip>
      <Chip>Indoor · 1</Chip>
      <Chip>Bane · 3</Chip>
      <Chip>Range · 4</Chip>
      <Chip>Hybrid · 1</Chip>
      <Chip>Region: Fredrikstad</Chip>
      <span className="ml-auto font-mono text-[11px] text-muted-foreground">
        Sort: Belegg ↓
      </span>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-[13px] text-muted-foreground hover:bg-secondary">
      {children}
    </span>
  );
}

function Map() {
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,88,64,0.06) 0%, rgba(168,204,35,0.04) 100%)",
        minHeight: 520,
      }}
    >
      {/* Grid-mønster */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,88,64,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,88,64,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Vann */}
      <div
        className="absolute opacity-50"
        style={{
          left: "45%",
          top: "20%",
          width: "55%",
          height: "55%",
          background:
            "radial-gradient(ellipse at center, rgba(122,154,163,0.20) 0%, transparent 70%)",
        }}
      />
      <span
        className="absolute font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
        style={{ left: "6%", top: "24%" }}
      >
        Fredrikstad
      </span>
      <span
        className="absolute font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
        style={{ left: "55%", top: "14%" }}
      >
        Drøbak
      </span>
      <span
        className="absolute font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
        style={{ left: "18%", top: "78%" }}
      >
        Borge
      </span>

      {LOCATIONS.map((l) => (
        <div
          key={l.id}
          className="absolute -translate-x-1/2"
          style={{ left: `${l.pin.x}%`, top: `${l.pin.y}%` }}
        >
          <div
            className={`relative grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold ${
              l.active
                ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30"
                : "bg-card text-foreground ring-1 ring-border"
            }`}
          >
            {l.badge}
          </div>
        </div>
      ))}

      {/* Popover for aktiv pin */}
      <div
        className="absolute w-[260px] rounded-lg border border-border bg-card p-4 shadow-lg"
        style={{ left: "26%", top: "30%" }}
      >
        <h4 className="font-display text-[15px] font-semibold">
          Mulligan Indoor Borre
        </h4>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
          Storgata 12 · 06–23 alle dager
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 border-t border-border pt-2">
          <PopStat v="4" l="Fasilit." />
          <PopStat v="82 %" l="Belegg" />
          <PopStat v="112" l="Bookin. mnd" />
        </div>
      </div>

      <div className="absolute right-3 bottom-3 flex flex-col gap-1">
        <button className="grid h-7 w-7 place-items-center rounded border border-border bg-card text-foreground hover:bg-secondary">
          +
        </button>
        <button className="grid h-7 w-7 place-items-center rounded border border-border bg-card text-foreground hover:bg-secondary">
          −
        </button>
      </div>
      <div className="absolute right-3 top-3 rounded-md bg-background/80 px-2 py-1 font-mono text-[10px] text-muted-foreground">
        Kart-placeholder · Mapbox kommer
      </div>
    </div>
  );
}

function PopStat({ v, l }: { v: string; l: string }) {
  return (
    <div className="text-center">
      <div className="font-mono text-[14px] font-semibold tabular-nums">{v}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {l}
      </div>
    </div>
  );
}

function LocationCard({ l }: { l: Location }) {
  const t = TYPE_STYLE[l.type];
  return (
    <div
      className={`rounded-lg border bg-card p-4 ${l.active ? "border-primary/40 shadow-sm" : "border-border"}`}
    >
      <div className="mb-2 flex items-start gap-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-[14px] font-semibold text-primary-foreground">
          {l.badge}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold leading-tight">{l.name}</div>
          <div className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <MapPin size={11} strokeWidth={1.5} />
            {l.address}
          </div>
        </div>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={{ background: t.bg, color: t.fg }}
        >
          {t.label}
        </span>
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {l.facilities.map((f, i) => {
          const fs = FAC_STYLE[f.kind];
          return (
            <span
              key={i}
              className="inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium"
              style={{ background: fs.bg, color: fs.fg }}
            >
              {f.label}
            </span>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-border pt-2">
        <Stat l={l.openLabel} v={l.openValue} small />
        <Stat l="Belegg uke" v={`${l.occupancyPct} %`} />
        <Stat l="Bookinger mnd" v={String(l.bookingsMonth)} />
      </div>
    </div>
  );
}

function Stat({
  l,
  v,
  small = false,
}: {
  l: string;
  v: string;
  small?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {l}
      </div>
      <div
        className={`mt-1 font-mono font-semibold leading-none tabular-nums ${small ? "text-[13px]" : "text-[16px]"}`}
      >
        {v}
      </div>
    </div>
  );
}
