/**
 * PILOT — CoachHQ Grupper
 * Bygd fra wireframe/design-files-v2/screens/09-grupper.html
 * URL: /grupper-demo
 *
 * 6 grupper i 3×2 grid: skole, klubb, selektert.
 */
import { Calendar, Plus, Search } from "lucide-react";

type GroupType = "skole" | "klubb" | "selektert";

type Member = { initials: string; bg: string; fg?: string };

type Group = {
  id: string;
  initial: string;
  name: string;
  sub: string;
  tag: { label: string; type: GroupType };
  members: number;
  avgHcp: string;
  coach: { initials: string; name: string; bg: string };
  nextSession: string;
  membersList: Member[];
  membersExtra: number;
  membersFooter: string;
  hero: { from: string; to: string; fg: string };
  active?: boolean;
};

const TYPE_STYLE: Record<GroupType, { bg: string; fg: string }> = {
  skole: { bg: "rgba(0,88,64,0.10)", fg: "#005840" },
  klubb: { bg: "rgba(26,125,86,0.10)", fg: "#1A7D56" },
  selektert: { bg: "rgba(184,133,42,0.15)", fg: "#B8852A" },
};

const GROUPS: Group[] = [
  {
    id: "wang",
    initial: "W",
    name: "WANG Toppidrett Fredrikstad",
    sub: "Førsteårs · 6 elever",
    tag: { label: "Skole · WANG", type: "skole" },
    members: 6,
    avgHcp: "8,2",
    coach: { initials: "AK", name: "Anders Kristiansen", bg: "#005840" },
    nextSession: "Man 11. mai · 08:00 — Mulligan Studio 1",
    membersList: [
      { initials: "MP", bg: "#005840" },
      { initials: "ES", bg: "#1A7D56" },
      { initials: "LH", bg: "#B8852A" },
      { initials: "JK", bg: "#5E5C57" },
      { initials: "AB", bg: "#0A1F18" },
    ],
    membersExtra: 1,
    membersFooter: "6 elever · 5 gutter, 1 jente",
    hero: { from: "#003B2A", to: "#005840", fg: "#F5F4EE" },
    active: true,
  },
  {
    id: "gfgk-junior",
    initial: "J",
    name: "GFGK Junior",
    sub: "U16 · 14 medlemmer",
    tag: { label: "Klubb · GFGK", type: "klubb" },
    members: 14,
    avgHcp: "22,6",
    coach: { initials: "SP", name: "Sara Pedersen", bg: "#1A7D56" },
    nextSession: "Tirs 12. mai · 17:00 — GFGK range",
    membersList: [
      { initials: "EL", bg: "#1A7D56" },
      { initials: "FN", bg: "#005840" },
      { initials: "KW", bg: "#B8852A" },
      { initials: "PT", bg: "#5E5C57" },
      { initials: "RM", bg: "#0A1F18" },
    ],
    membersExtra: 9,
    membersFooter: "14 juniorer",
    hero: { from: "#1A7D56", to: "#005840", fg: "#F5F4EE" },
  },
  {
    id: "gfgk-damer",
    initial: "D",
    name: "GFGK Damer",
    sub: "Senior · 8 medlemmer",
    tag: { label: "Klubb · GFGK", type: "klubb" },
    members: 8,
    avgHcp: "18,4",
    coach: { initials: "TA", name: "Tom Andersen", bg: "#B8852A" },
    nextSession: "Tors 14. mai · 18:00 — GFGK kortspill",
    membersList: [
      { initials: "IH", bg: "#B8852A" },
      { initials: "MO", bg: "#5E5C57" },
      { initials: "BA", bg: "#1A7D56" },
      { initials: "SK", bg: "#005840" },
    ],
    membersExtra: 4,
    membersFooter: "8 medlemmer",
    hero: { from: "#B8852A", to: "#7A5614", fg: "#F5F4EE" },
  },
  {
    id: "talent-a1",
    initial: "★",
    name: "Talent A1",
    sub: "Toppskikt · 4 spillere",
    tag: { label: "Selektert", type: "selektert" },
    members: 4,
    avgHcp: "2,1",
    coach: { initials: "AK", name: "Anders Kristiansen", bg: "#005840" },
    nextSession: "Ons 13. mai · 16:00 — Mulligan Studio 1",
    membersList: [
      { initials: "MP", bg: "#005840" },
      { initials: "ES", bg: "#1A7D56" },
      { initials: "PA", bg: "#B8852A" },
      { initials: "JL", bg: "#0A1F18" },
    ],
    membersExtra: 0,
    membersFooter: "4 spillere",
    hero: { from: "#005840", to: "#003B2A", fg: "#D1F843" },
  },
  {
    id: "talent-a2",
    initial: "2",
    name: "Talent A2",
    sub: "Bredde · 5 spillere",
    tag: { label: "Selektert", type: "selektert" },
    members: 5,
    avgHcp: "7,8",
    coach: { initials: "SP", name: "Sara Pedersen", bg: "#1A7D56" },
    nextSession: "Lør 16. mai · 10:00 — Bossum range",
    membersList: [
      { initials: "NA", bg: "#005840" },
      { initials: "VM", bg: "#1A7D56" },
      { initials: "CO", bg: "#B8852A" },
      { initials: "DR", bg: "#5E5C57" },
    ],
    membersExtra: 1,
    membersFooter: "5 spillere",
    hero: { from: "#1A7D56", to: "#0F4D38", fg: "#F5F4EE" },
  },
  {
    id: "talent-a3",
    initial: "3",
    name: "Talent A3",
    sub: "Utvikling · 5 spillere",
    tag: { label: "Selektert", type: "selektert" },
    members: 5,
    avgHcp: "14,2",
    coach: { initials: "TA", name: "Tom Andersen", bg: "#B8852A" },
    nextSession: "Lør 16. mai · 12:00 — Bossum range",
    membersList: [
      { initials: "HK", bg: "#5E5C57" },
      { initials: "JS", bg: "#1A7D56" },
      { initials: "MN", bg: "#B8852A" },
      { initials: "RW", bg: "#005840" },
      { initials: "TO", bg: "#0A1F18" },
    ],
    membersExtra: 0,
    membersFooter: "5 spillere",
    hero: { from: "#5E5C57", to: "#3F3D38", fg: "#F5F4EE" },
  },
];

export default function GrupperDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Header />
      <Kpis />
      <FilterBar />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {GROUPS.map((g) => (
          <GroupCard key={g.id} g={g} />
        ))}
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
          <span className="mx-2 text-muted-foreground/60">/</span>Grupper
        </div>
        <h1 className="mt-2 font-display text-[30px] font-normal italic leading-[1.1] tracking-tight">
          Seks grupper. Førtito medlemmer.
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-card px-4 text-[13px] font-medium hover:bg-secondary">
          <Calendar size={14} strokeWidth={1.5} />
          Felleskalender
        </button>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          <Plus size={14} strokeWidth={1.5} />
          Ny gruppe
        </button>
      </div>
    </header>
  );
}

function Kpis() {
  return (
    <div className="mb-4 grid grid-cols-4 gap-4">
      <Kpi label="Aktive grupper" value="6" delta="3 typer" />
      <Kpi label="Totale medlemmer" value="42" delta="Noen i flere grupper" />
      <Kpi
        label="Fellesøkter uka"
        value="8"
        delta="+2 vs forrige uke"
        deltaGood
      />
      <Kpi
        label="Snitt-progress"
        value="71 %"
        delta="+3 % siste 30d"
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
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[28px] font-medium leading-none tabular-nums">
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
          placeholder="Søk gruppe eller medlem"
          className="flex-1 bg-transparent text-[14px] text-foreground outline-none"
        />
      </div>
      <Chip>Skole · 1</Chip>
      <Chip>Klubb · 2</Chip>
      <Chip>Selektert · 3</Chip>
      <Chip>Coach: alle</Chip>
      <Chip active>Aktiv · 6</Chip>
      <span className="ml-auto font-mono text-[11px] text-muted-foreground">
        Sort: Neste økt ↑
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

function GroupCard({ g }: { g: Group }) {
  const t = TYPE_STYLE[g.tag.type];
  return (
    <div
      className={`overflow-hidden rounded-lg border bg-card ${g.active ? "border-primary/40 shadow-sm" : "border-border"}`}
    >
      <div
        className="relative px-5 py-5"
        style={{
          background: `linear-gradient(135deg, ${g.hero.from} 0%, ${g.hero.to} 100%)`,
          color: g.hero.fg,
        }}
      >
        <span
          className="absolute right-4 top-4 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em]"
          style={{
            background: "rgba(255,255,255,0.12)",
            color: g.hero.fg,
          }}
        >
          {g.tag.label}
        </span>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 font-display text-[18px] font-semibold">
            {g.initial}
          </span>
          <div>
            <div className="font-display text-[18px] font-semibold leading-tight">
              {g.name}
            </div>
            <div className="mt-0.5 text-[12px] opacity-80">{g.sub}</div>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <Stat l="Medlemmer" v={String(g.members)} />
          <Stat l="Snitt-HCP" v={g.avgHcp} />
          <div className="col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              Primary-coach
            </div>
            <div className="mt-1 inline-flex items-center gap-2">
              <span
                className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold text-white"
                style={{ background: g.coach.bg }}
              >
                {g.coach.initials}
              </span>
              <span className="text-[13px] font-medium">{g.coach.name}</span>
            </div>
          </div>
          <div className="col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              Neste fellesøkt
            </div>
            <div className="mt-1 text-[13px] font-medium">{g.nextSession}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <div className="flex -space-x-2">
            {g.membersList.map((m, i) => (
              <span
                key={i}
                className="grid h-7 w-7 place-items-center rounded-full border-2 border-card text-[10px] font-semibold text-white"
                style={{ background: m.bg }}
              >
                {m.initials}
              </span>
            ))}
            {g.membersExtra > 0 && (
              <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-secondary text-[10px] font-semibold text-muted-foreground">
                +{g.membersExtra}
              </span>
            )}
          </div>
          <span className="ml-2 text-[11px] text-muted-foreground">
            {g.membersFooter}
          </span>
        </div>

        <div className="mt-4 flex gap-2 pt-2">
          <button className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:opacity-90">
            Åpne
          </button>
          <button
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border bg-card px-3 text-[13px] font-medium hover:bg-secondary"
            style={{ borderColor: t.fg, color: t.fg }}
          >
            Planlegg økt
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {l}
      </div>
      <div className="mt-1 font-mono text-[18px] font-semibold leading-none tabular-nums">
        {v}
      </div>
    </div>
  );
}
