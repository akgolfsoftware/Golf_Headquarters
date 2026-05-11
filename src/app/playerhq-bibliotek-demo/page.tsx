/**
 * PlayerHQ — Treningsbibliotek (drills)
 * Bygd fra wireframe/design-files-v2/screens/57-playerhq-treningsbibliotek.html
 * URL: /playerhq-bibliotek-demo
 */

import { Search, Play, Bookmark, Flag } from "lucide-react";

type FilterRow = { label: string; count?: number; active?: boolean };
type Chip = { label: string; on?: boolean };

const omrade: FilterRow[] = [
  { label: "Alle", count: 84, active: true },
  { label: "Driving", count: 12 },
  { label: "Approach", count: 22 },
  { label: "Around green", count: 14 },
  { label: "Putting", count: 18 },
  { label: "Sand", count: 8 },
  { label: "Mental", count: 10 },
];

const niva: Chip[] = [
  { label: "Nybegynner" },
  { label: "Viderekommen", on: true },
  { label: "Avansert", on: true },
];

const varighet: Chip[] = [
  { label: "< 15 min", on: true },
  { label: "15–30", on: true },
  { label: "30–60" },
  { label: "60+" },
];

const utstyr: Chip[] = [
  { label: "Range", on: true },
  { label: "Putting green", on: true },
  { label: "Simulator" },
  { label: "Hjemme" },
  { label: "TrackMan" },
];

const status: FilterRow[] = [
  { label: "Alle", count: 84, active: true },
  { label: "Tildelt av coach", count: 3 },
  { label: "Påbegynt", count: 5 },
  { label: "Fullført siste 30d", count: 12 },
  { label: "Bokmerket", count: 7 },
];

type Drill = {
  cat: string;
  cat_color: string;
  duration: string;
  title: string;
  desc: string;
  level: "beg" | "int" | "adv";
  meta: string;
  assigned?: boolean;
};

const assignedDrills: Drill[] = [
  {
    cat: "Approach",
    cat_color: "from-[#005840] to-[#0A3C2F]",
    duration: "12 min",
    title: "Distanse-blokk · 125 m",
    desc: "Slå 10 baller med 9-iron til 125 m-mål. Måler avvik, snitt og bias. Mål: 70 % innen 4 m.",
    level: "int",
    meta: "27 har fullført",
    assigned: true,
  },
  {
    cat: "Putting",
    cat_color: "from-[#7d5814] to-[#B8852A]",
    duration: "15 min",
    title: "Press-putting · 3-4-5 m",
    desc: "Lag-test mot Sondre. 15 putts per distanse, må gjøre 80 % for å gå videre. Tracker streak.",
    level: "adv",
    meta: "frist 20.05",
    assigned: true,
  },
  {
    cat: "Mental",
    cat_color: "from-[#3a4f5c] to-[#5a7180]",
    duration: "8 min",
    title: "Pre-shot rutine · video-sjekk",
    desc: "Film fra siden — sjekk at 5-stegs rutinen utføres likt for hver tee-shot. Anders kommenterer i appen.",
    level: "int",
    meta: "Coach feedback",
    assigned: true,
  },
];

const recommendedDrills: Drill[] = [
  {
    cat: "Around green",
    cat_color: "from-[#5e2b2b] to-[#B04444]",
    duration: "20 min",
    title: "Chip-test · gress + sand",
    desc: "Svake område: −0,22 SG. Drill med 4 typer lies, 5 chips hver. Mål: alle innen 2 m.",
    level: "int",
    meta: "SG-vekt +0,18",
  },
  {
    cat: "Sand",
    cat_color: "from-[#2D6B4C] to-[#1A7D56]",
    duration: "18 min",
    title: "Bunker-out · 60° wedge",
    desc: "SG sand er lavest (−0,34). Konsistens på splash-shot fra middels bunker. 20 baller, mål 60 % under 3 m.",
    level: "int",
    meta: "SG-vekt +0,21",
  },
  {
    cat: "Driving",
    cat_color: "from-[#005840] to-[#0A3C2F]",
    duration: "25 min",
    title: "Tee-shot under vind",
    desc: "Stinger-spec med 3-wood (du er sterk her: SG +0,82). Avansert øvelse for vind 6+ m/s.",
    level: "adv",
    meta: "Styrke-drill",
  },
];

const popularDrills: Drill[] = [
  {
    cat: "Putting",
    cat_color: "from-[#7d5814] to-[#B8852A]",
    duration: "10 min",
    title: "Lim-putting · 1 m streak",
    desc: "Klassiker. 50 putts på rad fra 1 m. Hvis du bommer, starter du på 0. Maks tid: 10 min.",
    level: "beg",
    meta: "62 medlemmer",
  },
  {
    cat: "Approach",
    cat_color: "from-[#7d5814] to-[#B8852A]",
    duration: "30 min",
    title: "9-til-3 swing · kontroll",
    desc: "Halv-svinger med PW for tempo og kontaktpunkt. Glimrende for varm-opp.",
    level: "beg",
    meta: "54 medlemmer",
  },
  {
    cat: "Mental",
    cat_color: "from-[#2D6B4C] to-[#1A7D56]",
    duration: "14 min",
    title: "Visualiseringsøkt før runde",
    desc: "Mental-coach Solveig leder gjennom 4-stegs visualisering. Audio-only · pre-runde.",
    level: "beg",
    meta: "38 medlemmer",
  },
];

export default function PlayerHqBibliotekDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Bibliotek
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Drills, økter <em className="italic text-primary">og blokker.</em>
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Trening tilpasset deg — coach Anders har tildelt 3 nye denne uken.
        </p>
      </header>

      <div className="mb-4 flex items-center gap-2.5 rounded-sm border border-border bg-card px-4 py-3">
        <Search size={16} strokeWidth={1.5} className="text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">Søk</span>
        <input
          className="flex-1 border-none bg-transparent text-[13px] outline-none"
          placeholder="approach-distanse, putting under press, vinter-spec…"
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
          filter: bag-spec · pro-tier · vis 84 drills
        </span>
      </div>

      <div className="grid grid-cols-[240px_1fr] items-start gap-5">
        <aside className="sticky top-0 flex flex-col gap-4 rounded-sm border border-border bg-card p-4">
          <FilterSection title="Område" items={omrade} />
          <ChipSection title="Nivå" chips={niva} />
          <ChipSection title="Varighet" chips={varighet} />
          <ChipSection title="Utstyr / lokasjon" chips={utstyr} />
          <FilterSection title="Status" items={status} />
        </aside>

        <div>
          {/* Featured */}
          <section className="mb-5 grid grid-cols-[1fr_280px] gap-6 overflow-hidden rounded-sm bg-gradient-to-br from-[#005840] to-[#0A3C2F] p-6 text-white">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
                Ukens fokus · av Anders K.
              </div>
              <h3 className="mt-1.5 font-display text-[22px] font-medium leading-tight tracking-tight">
                Approach-distanse <em className="italic text-accent">under press.</em>
              </h3>
              <p className="mt-2 max-w-[520px] text-[13px] leading-[1.5] text-white/65">
                5-stegs blokk for distanse-kontroll på 100–175 m. Inkluderer TrackMan-validering, hjemmeøkt med
                bag-spec, og &quot;park&quot;-test mot mål på range. Kobles direkte mot SG approach-målet ditt.
              </p>
              <div className="mt-3.5 flex gap-4 font-mono text-[11px] tracking-[0.04em] text-white/55">
                <span><b className="font-medium text-white">5 økter</b> · 18 dgr</span>
                <span>Mål: <b className="font-medium text-white">+0,40 SG</b></span>
                <span>Krever: <b className="font-medium text-white">range + TrackMan</b></span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="rounded-md bg-accent px-3.5 py-2 text-[12px] font-medium text-[#0A1F18]">
                  Start blokken
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/8 px-3.5 py-2 text-[12px] font-medium text-white">
                  <Bookmark size={14} strokeWidth={1.5} />
                  Bokmerk
                </button>
              </div>
            </div>
            <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-sm bg-gradient-to-br from-[#3a3935] to-[#1A1916]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(225,206,123,0.30),transparent_70%)]" />
              <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-white/95 text-primary">
                <Play size={18} strokeWidth={1.5} fill="currentColor" />
              </div>
              <div className="absolute bottom-3 left-3 z-10 rounded-sm bg-white/12 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-white backdrop-blur">
                Intro · 2:14
              </div>
            </div>
          </section>

          <SectionTitle title="Tildelt av coach" sub="3 nye denne uka" />
          <DrillGrid drills={assignedDrills} />

          <SectionTitle title="Anbefalt for deg" sub="basert på SG-data" />
          <DrillGrid drills={recommendedDrills} />

          <SectionTitle title="Populært · klubb GFGK" sub="denne uka" />
          <DrillGrid drills={popularDrills} />
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, items }: { title: string; items: FilterRow[] }) {
  return (
    <div>
      <h4 className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {title}
      </h4>
      <div className="flex flex-col gap-0.5">
        {items.map((i) => (
          <div
            key={i.label}
            className={`flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-1.5 text-[13px] ${i.active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"}`}
          >
            <span>{i.label}</span>
            {i.count !== undefined && (
              <small className="font-mono text-[10px] tracking-[0.04em]">{i.count}</small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChipSection({ title, chips }: { title: string; chips: Chip[] }) {
  return (
    <div>
      <h4 className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <div
            key={c.label}
            className={`cursor-pointer rounded-sm border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${c.on ? "border-foreground bg-foreground text-background" : "border-border bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground"}`}
          >
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <h3 className="mb-3 mt-5 flex items-baseline justify-between font-display text-[18px] font-medium tracking-tight">
      {title}
      <small className="font-mono text-[10px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        {sub}
      </small>
    </h3>
  );
}

function DrillGrid({ drills }: { drills: Drill[] }) {
  return (
    <div className="grid grid-cols-3 gap-3.5">
      {drills.map((d) => (
        <DrillCard key={d.title} drill={d} />
      ))}
    </div>
  );
}

function DrillCard({ drill }: { drill: Drill }) {
  const levelStyle: Record<Drill["level"], string> = {
    beg: "bg-[rgba(45,107,76,0.12)] text-[#1A7D56]",
    int: "bg-[rgba(184,133,42,0.12)] text-[#7d5814]",
    adv: "bg-[rgba(176,68,68,0.10)] text-[#7a3232]",
  };
  const levelLabel: Record<Drill["level"], string> = {
    beg: "nybegynner",
    int: "viderekommen",
    adv: "avansert",
  };
  return (
    <div
      className={`flex cursor-pointer flex-col overflow-hidden rounded-sm border bg-card transition-colors hover:border-primary ${drill.assigned ? "border-primary bg-primary/3" : "border-border"}`}
    >
      <div className={`relative grid aspect-[16/10] place-items-center overflow-hidden bg-gradient-to-br ${drill.cat_color}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(225,206,123,0.22),transparent_70%)]" />
        <div className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-foreground">
          <Play size={14} strokeWidth={1.5} fill="currentColor" />
        </div>
        <div className="absolute left-2.5 top-2 z-10 rounded-sm bg-white/95 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em]">
          {drill.cat}
        </div>
        <div className="absolute bottom-2 right-2.5 z-10 rounded-sm bg-black/55 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.06em] text-white backdrop-blur">
          {drill.duration}
        </div>
      </div>
      <div className="flex flex-col gap-2 p-3.5">
        {drill.assigned && (
          <div className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-primary">
            <Flag size={10} strokeWidth={1.5} />
            Tildelt av coach
          </div>
        )}
        <h4 className="font-display text-[14px] font-semibold leading-tight tracking-tight">{drill.title}</h4>
        <div className="text-[12px] leading-relaxed text-muted-foreground">{drill.desc}</div>
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
          <span className={`rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em] ${levelStyle[drill.level]}`}>
            {levelLabel[drill.level]}
          </span>
          <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{drill.meta}</span>
        </div>
      </div>
    </div>
  );
}
