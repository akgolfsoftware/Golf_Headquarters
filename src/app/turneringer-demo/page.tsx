/**
 * PILOT — CoachHQ Turneringer
 * Bygd fra wireframe/design-files-v2/screens/10-turneringer.html
 * URL: /turneringer-demo
 *
 * 8 kommende turneringer i liste-view med viktighet (stars),
 * påmeldte og status. Kobles mot peak-readiness i treningsplan.
 */
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  Search,
  Star,
} from "lucide-react";

type Status = "open" | "locked";

type Participant = { initials: string; bg: string };

type Tournament = {
  id: string;
  date: string;
  year: string;
  name: string;
  organizer: string;
  location: string;
  region: string;
  participants: Participant[];
  participantsExtra: number;
  participantsTotal: number;
  importance: 1 | 2 | 3 | 4 | 5;
  status: Status;
  peakRelevant?: boolean;
};

const TOURNAMENTS: Tournament[] = [
  {
    id: "sorland",
    date: "22.–24. mai",
    year: "'26",
    name: "Sørlandsåpent",
    organizer: "Sørlandet GK · Norges Golfforbund",
    location: "Sørlandet GK",
    region: "Kristiansand",
    participants: [
      { initials: "MP", bg: "#005840" },
      { initials: "ES", bg: "#1A7D56" },
      { initials: "LH", bg: "#B8852A" },
    ],
    participantsExtra: 3,
    participantsTotal: 6,
    importance: 5,
    status: "open",
    peakRelevant: true,
  },
  {
    id: "gfgk-km",
    date: "30. mai",
    year: "'26",
    name: "GFGK Klubbmesterskap",
    organizer: "Gamle Fredrikstad GK",
    location: "Gamle Fredrikstad GK",
    region: "Solli",
    participants: [
      { initials: "PA", bg: "#5E5C57" },
      { initials: "JK", bg: "#1A7D56" },
      { initials: "RM", bg: "#005840" },
      { initials: "EL", bg: "#B8852A" },
    ],
    participantsExtra: 0,
    participantsTotal: 4,
    importance: 3,
    status: "open",
  },
  {
    id: "nm-mid",
    date: "6.–7. jun",
    year: "'26",
    name: "NM Mid-amatør",
    organizer: "Bærum GK · NGF Tour",
    location: "Bærum GK",
    region: "Bærum",
    participants: [
      { initials: "MP", bg: "#005840" },
      { initials: "ES", bg: "#1A7D56" },
    ],
    participantsExtra: 0,
    participantsTotal: 2,
    importance: 5,
    status: "locked",
    peakRelevant: true,
  },
  {
    id: "wang-sommer",
    date: "14. jun",
    year: "'26",
    name: "WANG Sommer-cup",
    organizer: "WANG Toppidrett Fredrikstad",
    location: "Bossum GK",
    region: "Borge",
    participants: [
      { initials: "MP", bg: "#005840" },
      { initials: "ES", bg: "#1A7D56" },
      { initials: "LH", bg: "#B8852A" },
    ],
    participantsExtra: 3,
    participantsTotal: 6,
    importance: 3,
    status: "open",
  },
  {
    id: "bossum-open",
    date: "21. jun",
    year: "'26",
    name: "Bossum Sommer Open",
    organizer: "Bossum GK",
    location: "Bossum GK",
    region: "Borge",
    participants: [
      { initials: "JL", bg: "#5E5C57" },
      { initials: "FN", bg: "#005840" },
    ],
    participantsExtra: 0,
    participantsTotal: 2,
    importance: 2,
    status: "open",
  },
  {
    id: "drobak-dame",
    date: "28.–29. jun",
    year: "'26",
    name: "Drøbak Damecup",
    organizer: "Drøbak GK",
    location: "Drøbak GK",
    region: "Drøbak",
    participants: [
      { initials: "IH", bg: "#B8852A" },
      { initials: "MO", bg: "#5E5C57" },
      { initials: "BA", bg: "#1A7D56" },
    ],
    participantsExtra: 0,
    participantsTotal: 3,
    importance: 3,
    status: "open",
  },
  {
    id: "junior-stage",
    date: "5. jul",
    year: "'26",
    name: "Junior Tour Stage 4",
    organizer: "NGF Junior Tour",
    location: "Asker GK",
    region: "Asker",
    participants: [
      { initials: "EL", bg: "#005840" },
      { initials: "FN", bg: "#1A7D56" },
    ],
    participantsExtra: 1,
    participantsTotal: 3,
    importance: 4,
    status: "open",
  },
  {
    id: "nm-senior",
    date: "19.–21. jul",
    year: "'26",
    name: "NM Senior",
    organizer: "Stavanger GK · NGF Tour",
    location: "Stavanger GK",
    region: "Stavanger",
    participants: [
      { initials: "MP", bg: "#005840" },
      { initials: "PA", bg: "#1A7D56" },
    ],
    participantsExtra: 0,
    participantsTotal: 2,
    importance: 5,
    status: "locked",
    peakRelevant: true,
  },
];

export default function TurneringerDemo() {
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
          <span className="mx-2 text-muted-foreground/60">/</span>Turneringer
        </div>
        <h1 className="mt-2 font-display text-[30px] font-normal italic leading-[1.1] tracking-tight">
          Åtte turneringer. To frister forfaller.
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-flex h-10 items-center gap-0.5 rounded-md border border-border bg-card p-1">
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-secondary px-3 text-[13px] font-medium text-foreground">
            <List size={14} strokeWidth={1.5} />
            Liste
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-muted-foreground hover:text-foreground">
            <CalendarIcon size={14} strokeWidth={1.5} />
            Kalender
          </button>
        </div>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          <Plus size={14} strokeWidth={1.5} />
          Ny turnering
        </button>
      </div>
    </header>
  );
}

function Kpis() {
  return (
    <div className="mb-4 grid grid-cols-4 gap-4">
      <Kpi label="Kommende" value="8" delta="Neste 90 dager" />
      <Kpi
        label="Påmeldte totalt"
        value="24"
        delta="På tvers av turneringer"
      />
      <Kpi
        label="Neste"
        value="Sørlandsåpent"
        valueSmall
        delta="Om 12 dager"
        deltaGood
      />
      <Kpi
        label="Frister forfaller"
        value="2"
        valueWarn
        delta="Denne uka"
        deltaWarn
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  valueSmall = false,
  valueWarn = false,
  deltaGood = false,
  deltaWarn = false,
}: {
  label: string;
  value: string;
  delta: string;
  valueSmall?: boolean;
  valueWarn?: boolean;
  deltaGood?: boolean;
  deltaWarn?: boolean;
}) {
  const valueColor = valueWarn ? "text-[#B8852A]" : "";
  const deltaColor = deltaWarn
    ? "text-[#B8852A]"
    : deltaGood
      ? "text-[#1A7D56]"
      : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono font-medium leading-none tabular-nums ${valueSmall ? "text-[18px]" : "text-[28px]"} ${valueColor}`}
      >
        {value}
      </div>
      <div className={`mt-2 font-mono text-[12px] ${deltaColor}`}>{delta}</div>
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
          placeholder="Søk turnering eller arrangør"
          className="flex-1 bg-transparent text-[14px] text-foreground outline-none"
        />
      </div>
      <Chip>★★★★★ · 2</Chip>
      <Chip>★★★★ · 1</Chip>
      <Chip>★★★ · 3</Chip>
      <Chip active>Åpen · 5</Chip>
      <Chip>Lukket · 2</Chip>
      <Chip>Region: alle</Chip>
      <span className="ml-auto font-mono text-[11px] text-muted-foreground">
        Sort: Dato ↑
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
            <Th width={140}>Dato</Th>
            <Th>Turnering</Th>
            <Th width={160}>Lokasjon</Th>
            <Th width={180}>Påmeldte</Th>
            <Th width={120}>Viktighet</Th>
            <Th width={110}>Status</Th>
            <Th width={100} right />
          </tr>
        </thead>
        <tbody>
          {TOURNAMENTS.map((t) => (
            <Row key={t.id} t={t} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  width,
  right = false,
}: {
  children?: React.ReactNode;
  width?: number;
  right?: boolean;
}) {
  return (
    <th
      style={{ width }}
      className={`px-3 py-3 ${right ? "text-right" : "text-left"} font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground`}
    >
      {children}
    </th>
  );
}

function Row({ t }: { t: Tournament }) {
  return (
    <tr
      className={`border-b border-border last:border-0 hover:bg-secondary/40 ${t.peakRelevant ? "" : ""}`}
    >
      <td className="px-3 py-3">
        <span className="font-mono text-[13px] font-semibold tabular-nums">
          {t.date}{" "}
          <span className="text-muted-foreground">{t.year}</span>
        </span>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] font-semibold leading-tight">
            {t.name}
          </span>
          <span className="text-[12px] text-muted-foreground">
            {t.organizer}
          </span>
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="leading-tight">
          <div className="text-[13px]">{t.location}</div>
          <div className="font-mono text-[11px] text-muted-foreground">
            {t.region}
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {t.participants.map((p, i) => (
              <span
                key={i}
                className="grid h-6 w-6 place-items-center rounded-full border-2 border-card text-[9px] font-semibold text-white"
                style={{ background: p.bg }}
              >
                {p.initials}
              </span>
            ))}
            {t.participantsExtra > 0 && (
              <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-secondary text-[9px] font-semibold text-muted-foreground">
                +{t.participantsExtra}
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            {t.participantsTotal} spillere
          </span>
        </div>
      </td>
      <td className="px-3 py-3">
        <Stars n={t.importance} />
      </td>
      <td className="px-3 py-3">
        <StatusPill status={t.status} />
      </td>
      <td className="px-3 py-3 text-right">
        <button className="font-mono text-[12px] font-medium text-primary hover:underline">
          Detaljer →
        </button>
      </td>
    </tr>
  );
}

function Stars({ n }: { n: number }) {
  const filled = n >= 5 ? "#005840" : "#B8852A";
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          strokeWidth={1.5}
          fill={i <= n ? filled : "transparent"}
          color={i <= n ? filled : "#C4C0B8"}
        />
      ))}
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1A7D56]/30 bg-[#1A7D56]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#1A7D56]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1A7D56]" />
        Åpen
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      Lukket
    </span>
  );
}
