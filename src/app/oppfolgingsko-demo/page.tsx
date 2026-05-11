/**
 * PILOT — CoachHQ Oppfølgings-kø · kanban
 * Bygd direkte fra wireframe/design-files-v2/05-oppfolgingsko.html
 * URL: /oppfolgingsko-demo
 *
 * Mock-data. Bytt til Prisma-henting senere.
 */

import {
  Settings,
  Sparkles,
  CheckCircle,
  Bell,
  Check,
  TrendingDown,
  AlertCircle,
  Activity,
  Clock,
  Sun,
  ChevronDown,
  MessageSquare,
  Phone,
  Calendar,
  Heart,
  Circle,
} from "lucide-react";

type Status = "risk" | "watch" | "check" | "ok";

type Card = {
  initials: string;
  name: string;
  sub: string;
  signal: React.ReactNode;
  signalIcon: React.ReactNode;
  stats: { k: string; v: string; tone?: "up" | "down" | "warn" | "success" }[];
  tags: { label: string; tone?: "danger" | "warning" | "success" }[];
  since: string;
  actions: ("msg" | "phone" | "book" | "heart" | "puls")[];
  priority?: boolean;
  resolved?: boolean;
  resolvedNote?: string;
  resolvedWhen?: string;
};

const COLS: { status: Status; title: string; desc: string; count: number; cards: Card[] }[] = [
  {
    status: "risk",
    title: "Risiko",
    desc: "Krever en samtale innen 48 timer.",
    count: 3,
    cards: [
      {
        initials: "JT",
        name: "Jakob Tønsberg",
        sub: "junior · 14 · GFGK",
        signalIcon: <TrendingDown className="h-3.5 w-3.5" />,
        signal: (
          <>
            <b className="font-semibold">4 nei-show på rad</b> · siste 14 dager. Mor nådd ikke pr. SMS.
          </>
        ),
        stats: [
          { k: "HCP delta", v: "+2,4", tone: "down" },
          { k: "SG · 30d", v: "−0,8", tone: "down" },
          { k: "Adherence", v: "42 %", tone: "down" },
        ],
        tags: [
          { label: "droppfaresone", tone: "danger" },
          { label: "junior" },
          { label: "foreldre-kontakt" },
        ],
        since: "flagget 3 dager siden",
        actions: ["msg", "phone", "book"],
        priority: true,
      },
      {
        initials: "EK",
        name: "Eline Krogh",
        sub: "WANG · 17 · HCP 5,8",
        signalIcon: <AlertCircle className="h-3.5 w-3.5" />,
        signal: (
          <>
            <b className="font-semibold">SG-putting falt −1,2 på 3 økter.</b> Skrev «føler ingenting i hendene» i dagbok.
          </>
        ),
        stats: [
          { k: "SG · putt", v: "−1,2", tone: "down" },
          { k: "SG · totalt", v: "+0,9" },
          { k: "Adherence", v: "96 %" },
        ],
        tags: [
          { label: "teknisk-knekk", tone: "danger" },
          { label: "KM neste uke" },
        ],
        since: "flagget i dag",
        actions: ["msg", "book"],
        priority: true,
      },
      {
        initials: "MT",
        name: "Maja Tangen",
        sub: "GFGK Jr · 12 · HCP 16,4",
        signalIcon: <Activity className="h-3.5 w-3.5" />,
        signal: (
          <>
            <b className="font-semibold">Mor melder handledd-smerte</b> · pågående tråd i meldinger.
          </>
        ),
        stats: [
          { k: "Skade", v: "aktiv", tone: "warn" },
          { k: "Neste økt", v: "lør" },
          { k: "Adherence", v: "94 %", tone: "up" },
        ],
        tags: [
          { label: "skade", tone: "warning" },
          { label: "junior" },
        ],
        since: "flagget for 2 timer siden",
        actions: ["msg", "heart"],
      },
    ],
  },
  {
    status: "watch",
    title: "Watch",
    desc: "Trender feil retning — følg med.",
    count: 2,
    cards: [
      {
        initials: "MP",
        name: "Mathias Pedersen",
        sub: "A-lag · 19 · HCP 4,1",
        signalIcon: <TrendingDown className="h-3.5 w-3.5" />,
        signal: (
          <>
            3 dager på rad med <b className="font-semibold">−1 SG approach.</b> Sa selv at han er sliten.
          </>
        ),
        stats: [
          { k: "SG · app", v: "−1,1", tone: "down" },
          { k: "Søvn · snitt", v: "5,8 t", tone: "down" },
          { k: "RPE", v: "8,2" },
        ],
        tags: [
          { label: "load", tone: "warning" },
          { label: "A-lag" },
        ],
        since: "flagget 1 dag siden",
        actions: ["msg", "book"],
      },
      {
        initials: "PF",
        name: "Per Fjellstad",
        sub: "Akademi · 52 · HCP 18,2",
        signalIcon: <Clock className="h-3.5 w-3.5" />,
        signal: (
          <>
            Ikke booket noen økt på <b className="font-semibold">3 uker</b> · ingen avmelding heller.
          </>
        ),
        stats: [
          { k: "Siste økt", v: "22 apr" },
          { k: "Adherence", v: "48 %", tone: "down" },
          { k: "Abonnement", v: "aktiv", tone: "success" },
        ],
        tags: [{ label: "senior" }, { label: "stille" }],
        since: "flagget 5 dager siden",
        actions: ["phone", "msg"],
      },
    ],
  },
  {
    status: "check",
    title: "Tjekk inn",
    desc: "Lett oppdatering — kjapp melding holder.",
    count: 2,
    cards: [
      {
        initials: "AK",
        name: "Astrid Kvam",
        sub: "senior · 61 · HCP 22,1",
        signalIcon: <Check className="h-3.5 w-3.5" />,
        signal: (
          <>
            Logget <b className="font-semibold">+0,6 SG</b> forrige helg på Bossum. Send et heia-trykk.
          </>
        ),
        stats: [
          { k: "SG · 7d", v: "+0,6", tone: "up" },
          { k: "Siste prat", v: "10 dgr" },
        ],
        tags: [{ label: "positiv", tone: "success" }],
        since: "flagget i dag",
        actions: ["msg", "heart"],
      },
      {
        initials: "SB",
        name: "Sondre Berg",
        sub: "WANG · 18 · HCP 6,4",
        signalIcon: <Sun className="h-3.5 w-3.5" />,
        signal: (
          <>
            Skrev <b className="font-semibold">«putter føles på plass»</b> i dagbok. Bekreft retning.
          </>
        ),
        stats: [
          { k: "Score", v: "78", tone: "success" },
          { k: "PR?", v: "ja", tone: "success" },
        ],
        tags: [{ label: "milepæl", tone: "success" }],
        since: "flagget for 4 timer siden",
        actions: ["msg"],
      },
    ],
  },
  {
    status: "ok",
    title: "Løst · siste 7d",
    desc: "Tett-tett. Du kan markere «ikke vis» per sak.",
    count: 8,
    cards: [
      {
        initials: "MR",
        name: "Markus Roinås P.",
        sub: "WANG · 16",
        signalIcon: <CheckCircle className="h-3.5 w-3.5" />,
        signal: (
          <>
            Snakket onsdag. <b className="font-semibold">Plan justert</b> — KM-fokus 4 uker.
          </>
        ),
        stats: [],
        tags: [],
        since: "",
        actions: [],
        resolved: true,
        resolvedWhen: "løst 2 dager siden",
      },
      {
        initials: "LS",
        name: "Linn Solem",
        sub: "forelder · Eline",
        signalIcon: <CheckCircle className="h-3.5 w-3.5" />,
        signal: <>Bekreftet plan for KM. Avtalt video etter helg.</>,
        stats: [],
        tags: [],
        since: "",
        actions: [],
        resolved: true,
        resolvedWhen: "løst i går",
      },
      {
        initials: "HN",
        name: "Henrik Norvik",
        sub: "A-lag · 22",
        signalIcon: <CheckCircle className="h-3.5 w-3.5" />,
        signal: <>Shaft-bytte gjennomført. Booket fitting onsdag.</>,
        stats: [],
        tags: [],
        since: "",
        actions: [],
        resolved: true,
        resolvedWhen: "løst 3 dager siden",
      },
    ],
  },
];

export default function OppfolgingskoDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-8 py-8 pb-12 lg:px-10">
        {/* Header */}
        <header className="mb-6 flex items-start justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              /admin/oppfølging
            </span>
            <h1 className="mt-2 max-w-[640px] font-display text-[36px] font-bold leading-[1.1] tracking-tight">
              Hvem trenger en samtale denne uka.
            </h1>
            <p className="mt-2 font-display text-[15px] italic text-muted-foreground">
              Plattformen flagger — du bestemmer.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              <Settings className="h-4 w-4" />
              Justere regler
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Sparkles className="h-4 w-4" />
              Generer AI-aksjoner
            </button>
          </div>
        </header>

        {/* Top stats */}
        <section className="mb-5 grid gap-3" style={{ gridTemplateColumns: "repeat(5, 1fr) 1.4fr" }}>
          <TopStat k="Risiko" v="3" meta="krever samtale < 48 t" tone="danger" />
          <TopStat k="Watch" v="2" meta="trender feil retning" tone="warn" />
          <TopStat k="Tjekk inn" v="2" meta="lett oppdatering" />
          <TopStat k="Løst · 30d" v="18" meta="+4 vs forrige mnd" tone="good" />
          <TopStat k="Snitt respons" v="2,4" unit="d" meta="mål: < 3 dager" />
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-4">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Aktivitet siste 24 t
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Du løste <b className="font-semibold">3</b> saker
              </span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Plattformen flagget <b className="font-semibold">2</b> nye
              </span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <Check className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                <b className="font-semibold">1</b> sak nedgradert
              </span>
            </div>
          </div>
        </section>

        {/* Filter row */}
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Filter
          </span>
          <Chip active>
            Alle elever <span className="ml-1 font-mono text-[10px] text-muted-foreground">142</span>
          </Chip>
          <Chip>
            Mine elever <span className="ml-1 font-mono text-[10px] text-muted-foreground">34</span>
          </Chip>
          <Chip>Foreldre-rapportert</Chip>
          <Chip>Score-fall</Chip>
          <Chip>Adherence &lt; 70 %</Chip>
          <Chip>Skade-historikk</Chip>
          <span className="mx-1 h-6 w-px bg-border" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Sortering
          </span>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
            Risiko + tid siden flagget
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <span className="flex-1" />
          <span className="text-[12px] text-muted-foreground">Visning:</span>
          <div className="inline-flex overflow-hidden rounded-md border border-border">
            <SegBtn active>Kanban</SegBtn>
            <SegBtn>Liste</SegBtn>
            <SegBtn>Tidslinje</SegBtn>
          </div>
        </div>

        {/* Board */}
        <section className="grid grid-cols-4 items-start gap-4">
          {COLS.map((col) => (
            <Column key={col.status} col={col} />
          ))}
        </section>

        <footer className="mt-10 flex items-center justify-between border-t border-border pt-6 text-[12px] text-muted-foreground">
          <span>AK Golf Platform · CoachHQ · /admin/oppfølging</span>
          <span className="font-mono">7 aktive saker · sist beregnet for 12 min siden</span>
        </footer>
      </div>
    </div>
  );
}

function Column({ col }: { col: { status: Status; title: string; desc: string; count: number; cards: Card[] } }) {
  const dotColor: Record<Status, string> = {
    risk: "bg-destructive",
    watch: "bg-[var(--color-pyr-spill,#B8852A)]",
    check: "bg-[#006FCF]",
    ok: "bg-[var(--color-pyr-tek,#1A7D56)]",
  };
  const bgTint: Record<Status, string> = {
    risk: "bg-destructive/5",
    watch: "bg-secondary/60",
    check: "bg-secondary/60",
    ok: "bg-secondary/60",
  };
  return (
    <div
      className={`flex min-h-[520px] flex-col gap-3 rounded-lg border border-border p-3.5 ${bgTint[col.status]}`}
    >
      <div className="flex items-center gap-2 px-1.5 pt-1">
        <span className={`h-2 w-2 rounded-full ${dotColor[col.status]}`} />
        <span className="font-display text-[14px] font-semibold tracking-tight">{col.title}</span>
        <span className="ml-auto rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          {col.count}
        </span>
      </div>
      <div className="px-1.5 text-[11px] text-muted-foreground">{col.desc}</div>
      {col.cards.map((c, i) => (
        <CardItem key={i} card={c} />
      ))}
      {col.status === "ok" && (
        <button className="rounded-md border border-dashed border-border bg-transparent p-3 text-center text-[12px] text-muted-foreground transition-colors hover:bg-secondary">
          Vis 5 til
        </button>
      )}
    </div>
  );
}

function CardItem({ card }: { card: Card }) {
  if (card.resolved) {
    return (
      <div className="flex flex-col gap-2.5 rounded-md border border-border bg-card p-3.5 opacity-75">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-muted font-display text-[12px] font-semibold">
            {card.initials}
          </span>
          <div className="flex-1">
            <div className="font-display text-[14px] font-semibold tracking-tight">{card.name}</div>
            <div className="text-[11px] text-muted-foreground">{card.sub}</div>
          </div>
        </div>
        <div className="flex items-start gap-1.5 rounded-md bg-primary/5 px-2.5 py-2 text-[12px] leading-snug">
          <span className="mt-0.5 text-[var(--color-pyr-tek,#1A7D56)]">{card.signalIcon}</span>
          <span>{card.signal}</span>
        </div>
        <div className="font-mono text-[10.5px] text-muted-foreground">{card.resolvedWhen}</div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-2.5 rounded-md border border-border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md ${
        card.priority ? "border-l-[3px] border-l-destructive" : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-muted font-display text-[12px] font-semibold">
          {card.initials}
        </span>
        <div className="flex-1">
          <div className="font-display text-[14px] font-semibold tracking-tight">
            {card.priority && <span className="mr-1">●</span>}
            {card.name}
          </div>
          <div className="text-[11px] text-muted-foreground">{card.sub}</div>
        </div>
      </div>
      <div className="flex items-start gap-1.5 rounded-md bg-secondary px-2.5 py-2 text-[12px] leading-snug">
        <span className="mt-0.5 text-muted-foreground">{card.signalIcon}</span>
        <span>{card.signal}</span>
      </div>
      {card.stats.length > 0 && (
        <div className="flex gap-3.5 px-0.5">
          {card.stats.map((s, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                {s.k}
              </span>
              <span
                className={`font-mono text-[13px] font-medium ${
                  s.tone === "down"
                    ? "text-destructive"
                    : s.tone === "up" || s.tone === "success"
                      ? "text-[var(--color-pyr-tek,#1A7D56)]"
                      : s.tone === "warn"
                        ? "text-[var(--color-pyr-spill,#B8852A)]"
                        : "text-foreground"
                }`}
              >
                {s.v}
              </span>
            </div>
          ))}
        </div>
      )}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.map((t, i) => (
            <span
              key={i}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                t.tone === "danger"
                  ? "bg-destructive/15 text-destructive"
                  : t.tone === "warning"
                    ? "bg-[#FFF0D6] text-[var(--color-pyr-spill,#B8852A)]"
                    : t.tone === "success"
                      ? "bg-[#E5F1EA] text-[var(--color-pyr-tek,#1A7D56)]"
                      : "bg-secondary text-muted-foreground"
              }`}
            >
              {t.label}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="font-mono text-[10.5px] text-muted-foreground">{card.since}</span>
        <div className="flex gap-1">
          {card.actions.map((a, i) => (
            <ActionBtn key={i} action={a} primary={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ action, primary }: { action: Card["actions"][number]; primary?: boolean }) {
  const icon: Record<Card["actions"][number], React.ReactNode> = {
    msg: <MessageSquare className="h-3.5 w-3.5" />,
    phone: <Phone className="h-3.5 w-3.5" />,
    book: <Calendar className="h-3.5 w-3.5" />,
    heart: <Heart className="h-3.5 w-3.5" />,
    puls: <Circle className="h-3.5 w-3.5" />,
  };
  return (
    <button
      className={`grid h-7 w-7 place-items-center rounded-md border ${
        primary
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-foreground hover:text-background"
      }`}
    >
      {icon[action]}
    </button>
  );
}

function TopStat({
  k,
  v,
  unit,
  meta,
  tone,
}: {
  k: string;
  v: string;
  unit?: string;
  meta: string;
  tone?: "danger" | "warn" | "good";
}) {
  const valueColor =
    tone === "danger"
      ? "text-destructive"
      : tone === "warn"
        ? "text-[var(--color-pyr-spill,#B8852A)]"
        : tone === "good"
          ? "text-[var(--color-pyr-tek,#1A7D56)]"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {k}
      </div>
      <div className={`mt-2 font-mono text-[30px] font-medium leading-none tabular-nums -tracking-tight ${valueColor}`}>
        {v}
        {unit && <small className="text-[14px] font-normal text-muted-foreground">{unit}</small>}
      </div>
      <div className="mt-1.5 text-[11px] text-muted-foreground">{meta}</div>
    </div>
  );
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${
        active
          ? "bg-foreground text-background"
          : "border border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function SegBtn({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      className={`px-3 py-1 text-[12px] font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
