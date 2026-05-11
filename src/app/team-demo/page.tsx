/**
 * PILOT — CoachHQ Team
 * Bygd fra wireframe/design-files-v2/screens/08-team.html
 * URL: /team-demo
 *
 * 4 coacher i grid med rolle, spillere, tilgjengelighet, sertifiseringer.
 */
import { Award, Download, MoreHorizontal, Search, UserPlus } from "lucide-react";

type Role = "lead" | "coach" | "assist";

type Coach = {
  initials: string;
  name: string;
  role: string;
  roleTag: Role;
  tags: { label: string; tone: Role | "neutral" }[];
  players: number;
  availableHours: number;
  certCount: number;
  certs: string[];
  avatarBg: string;
  avatarFg?: string;
  active?: boolean;
};

const ROLE_STYLE: Record<Role | "neutral" | "pending", { bg: string; fg: string }> = {
  lead: { bg: "rgba(0,88,64,0.10)", fg: "#005840" },
  coach: { bg: "rgba(26,125,86,0.10)", fg: "#1A7D56" },
  assist: { bg: "rgba(94,92,87,0.10)", fg: "#5E5C57" },
  neutral: { bg: "rgba(94,92,87,0.08)", fg: "#5E5C57" },
  pending: { bg: "rgba(184,133,42,0.12)", fg: "#B8852A" },
};

const COACHES: Coach[] = [
  {
    initials: "AK",
    name: "Anders Kristiansen",
    role: "Hovedcoach + CEO",
    roleTag: "lead",
    tags: [
      { label: "Hovedcoach", tone: "lead" },
      { label: "CEO", tone: "neutral" },
    ],
    players: 18,
    availableHours: 22,
    certCount: 4,
    certs: ["PGA Class A", "TPI L2", "NGF Trener 3", "MOG-sertifisert"],
    avatarBg: "#005840",
    active: true,
  },
  {
    initials: "SP",
    name: "Sara Pedersen",
    role: "Coach · Junior & talent",
    roleTag: "coach",
    tags: [{ label: "Coach", tone: "coach" }],
    players: 12,
    availableHours: 28,
    certCount: 2,
    certs: ["NGF Trener 2", "TPI L1"],
    avatarBg: "#1A7D56",
  },
  {
    initials: "TA",
    name: "Tom Andersen",
    role: "Coach · Damer & senior",
    roleTag: "coach",
    tags: [{ label: "Coach", tone: "coach" }],
    players: 8,
    availableHours: 24,
    certCount: 1,
    certs: ["NGF Trener 2"],
    avatarBg: "#B8852A",
    avatarFg: "#FFFFFF",
  },
  {
    initials: "MK",
    name: "Markus K.",
    role: "Assistent · under utdanning",
    roleTag: "assist",
    tags: [{ label: "Assistent", tone: "assist" }],
    players: 0,
    availableHours: 10,
    certCount: 1,
    certs: ["NGF Trener 1 (under utd.)"],
    avatarBg: "#5E5C57",
  },
];

export default function TeamDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Header />
      <Kpis />
      <FilterBar />
      <div className="grid grid-cols-2 gap-4">
        {COACHES.map((c) => (
          <CoachCard key={c.initials} c={c} />
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
          <span className="mx-2 text-muted-foreground/60">/</span>Team
        </div>
        <h1 className="mt-2 font-display text-[30px] font-normal italic leading-[1.1] tracking-tight">
          Fire coacher. Trettiåtte spillere.
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-card px-4 text-[13px] font-medium hover:bg-secondary">
          <Download size={14} strokeWidth={1.5} />
          Eksport vakt-plan
        </button>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          <UserPlus size={14} strokeWidth={1.5} />
          Inviter coach
        </button>
      </div>
    </header>
  );
}

function Kpis() {
  return (
    <div className="mb-4 grid grid-cols-4 gap-4">
      <Kpi
        label="Aktive coacher"
        value="4"
        delta="1 hovedcoach · 2 coacher · 1 assistent"
      />
      <Kpi label="Spillere fordelt" value="38" delta="Snitt 9,5 per coach" />
      <Kpi label="Tilgjengelig uka" value="84 t" delta="+6 t vs sist uke" deltaGood />
      <Kpi
        label="Snitt SG-trend 30d"
        value="+0,8"
        delta="På tvers av spillere"
        valueGood
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  deltaGood = false,
  valueGood = false,
}: {
  label: string;
  value: string;
  delta: string;
  deltaGood?: boolean;
  valueGood?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono text-[28px] font-medium leading-none tabular-nums ${valueGood ? "text-[#1A7D56]" : ""}`}
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
          placeholder="Søk navn eller sertifisering"
          className="flex-1 bg-transparent text-[14px] text-foreground outline-none"
        />
      </div>
      <Chip active>Aktiv · 4</Chip>
      <Chip>Pauset</Chip>
      <Chip>Hovedcoach · 1</Chip>
      <Chip>Coach · 2</Chip>
      <Chip>Assistent · 1</Chip>
      <span className="ml-auto font-mono text-[11px] text-muted-foreground">
        Sort: Spillere ↓
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

function CoachCard({ c }: { c: Coach }) {
  return (
    <div
      className={`relative rounded-lg border bg-card p-6 ${c.active ? "border-primary/40 shadow-sm" : "border-border"}`}
    >
      <button className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground">
        <MoreHorizontal size={16} strokeWidth={1.5} />
      </button>

      <div className="flex items-center gap-4">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full font-display text-[22px] font-semibold"
          style={{
            background: c.avatarBg,
            color: c.avatarFg ?? "#FFFFFF",
          }}
        >
          {c.initials}
        </div>
        <div className="min-w-0">
          <div className="text-[16px] font-semibold leading-tight">{c.name}</div>
          <div className="mt-1 text-[12px] text-muted-foreground">{c.role}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {c.tags.map((t, i) => {
          const s = ROLE_STYLE[t.tone];
          return (
            <span
              key={i}
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              style={{ background: s.bg, color: s.fg }}
            >
              {t.label}
            </span>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-y border-border py-4">
        <DataCell l="Spillere" v={String(c.players)} />
        <DataCell l="Tilgj. uka" v={`${c.availableHours} t`} />
        <DataCell l="Sertifik." v={String(c.certCount)} />
      </div>

      <div className="mt-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          Sertifiseringer
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {c.certs.map((cert, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground"
            >
              <Award size={11} strokeWidth={1.5} />
              {cert}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          Meld
        </button>
        <button className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-[13px] font-medium hover:bg-secondary">
          Profil
        </button>
      </div>
    </div>
  );
}

function DataCell({ l, v }: { l: string; v: string }) {
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
