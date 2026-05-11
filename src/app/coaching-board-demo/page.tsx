/**
 * CoachHQ — Coaching Board
 * Bygd fra wireframe/design-files-v2/screens/06-coachhq-coaching-board.html
 * URL: /coaching-board-demo
 *
 * 4-kolonne kanban-tavle. Innkommende -> Vurderer -> I gang -> Ferdig.
 * Hvert kort er en agent-anbefaling eller plan-aksjon. Ferdig-kolonnen
 * er collapsed by default.
 */

import { ArrowRight, Check, ChevronDown, Filter } from "lucide-react";

type BadgeKind = "period" | "deload" | "escal" | "drill";

type BoardCard = {
  player: string;
  initials: string;
  avatarTone: "tek" | "slag" | "fys" | "spill" | "turn";
  title: string;
  badge: BadgeKind;
  ts: string;
};

type ColumnKey = "innkommende" | "vurderer" | "igang" | "ferdig";

type Column = {
  key: ColumnKey;
  name: string;
  dot: string;
  count: number;
  cards: BoardCard[];
};

const columns: Column[] = [
  {
    key: "innkommende",
    name: "Innkommende",
    dot: "#3B82F6",
    count: 7,
    cards: [
      {
        player: "Markus R Pedersen",
        initials: "MR",
        avatarTone: "tek",
        title: "Periodisering: peak uke 28",
        badge: "period",
        ts: "2 t siden",
      },
      {
        player: "Sara Pedersen",
        initials: "SP",
        avatarTone: "slag",
        title: "Pauseuke anbefalt",
        badge: "deload",
        ts: "3 t siden",
      },
      {
        player: "Tom Andersen",
        initials: "TA",
        avatarTone: "fys",
        title: "Drill-forslag: lukket clubface",
        badge: "drill",
        ts: "4 t siden",
      },
      {
        player: "Eira Holm",
        initials: "EH",
        avatarTone: "spill",
        title: "Eskalering: håndledd-smerte",
        badge: "escal",
        ts: "5 t siden",
      },
    ],
  },
  {
    key: "vurderer",
    name: "Vurderer",
    dot: "var(--color-pyr-spill,#B8852A)",
    count: 4,
    cards: [
      {
        player: "Markus R Pedersen",
        initials: "MR",
        avatarTone: "tek",
        title: "Volum +2 t/uke",
        badge: "period",
        ts: "i går",
      },
      {
        player: "Sara Pedersen",
        initials: "SP",
        avatarTone: "slag",
        title: "Endre periodisering",
        badge: "period",
        ts: "i går",
      },
    ],
  },
  {
    key: "igang",
    name: "I gang",
    dot: "var(--accent,#D1F843)",
    count: 8,
    cards: [
      {
        player: "Tom Andersen",
        initials: "TA",
        avatarTone: "fys",
        title: "Sommer-toppform-plan",
        badge: "period",
        ts: "2 d siden",
      },
      {
        player: "Markus R Pedersen",
        initials: "MR",
        avatarTone: "tek",
        title: "Tempo-drill 3:1",
        badge: "drill",
        ts: "3 d siden",
      },
      {
        player: "Eira Holm",
        initials: "EH",
        avatarTone: "spill",
        title: "Fysio-vurdering bestilt",
        badge: "escal",
        ts: "5 d siden",
      },
    ],
  },
  {
    key: "ferdig",
    name: "Ferdig",
    dot: "var(--status-success,#1A7D56)",
    count: 47,
    cards: [],
  },
];

const avatarToneClass: Record<BoardCard["avatarTone"], string> = {
  tek: "bg-[var(--color-pyr-tek,#1A7D56)] text-white",
  slag: "bg-[var(--color-pyr-slag,#D1F843)] text-[#0A1F18]",
  fys: "bg-[var(--color-pyr-fys,#005840)] text-white",
  spill: "bg-[var(--color-pyr-spill,#B8852A)] text-[#0A1F18]",
  turn: "bg-[var(--color-pyr-turn,#5E5C57)] text-white",
};

const badgeClass: Record<BadgeKind, string> = {
  period: "text-primary border-primary/30 bg-primary/8",
  deload:
    "text-[#7a4e0e] border-[var(--color-pyr-spill,#B8852A)]/35 bg-[var(--color-pyr-spill,#B8852A)]/10",
  escal:
    "text-[#A32D2D] border-[#A32D2D]/35 bg-[#A32D2D]/8",
  drill:
    "text-[#1A7D56] border-[#1A7D56]/35 bg-[#1A7D56]/8",
};

const badgeLabel: Record<BadgeKind, string> = {
  period: "period.",
  deload: "deload",
  escal: "escal.",
  drill: "drill",
};

export default function CoachingBoardDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          CoachHQ · Coaching Board · onsdag 13. mai 2026
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Hva som <em className="italic text-primary">krever en avgjørelse</em>{" "}
          akkurat nå.
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          23 aktive kort fra agentene. Dra mellom kolonner for å flytte status.
          Ferdig-kolonnen viser kun siste 47 fullførte denne uka.
        </p>
      </header>

      {/* Filter bar */}
      <div className="mb-4 flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter
            size={14}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            Filter
          </span>
          <Chip active>Alle spillere</Chip>
          <Chip>Alle agenter</Chip>
          <Chip>Eskaleringer</Chip>
          <Chip>GFGK</Chip>
          <Chip>Mulligan</Chip>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
          Send agent-feedback
          <ArrowRight size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => (
          <BoardColumn key={col.key} column={col} />
        ))}
      </div>

      {/* Footer-strip */}
      <div className="mt-6 flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-[12px]">
        <div className="text-muted-foreground">
          47 ferdige denne uka · 8 trenger en avgjørelse i dag · agenter jobber
          i bakgrunnen
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
          <span>Coach: Anders Kristiansen</span>
          <span>Lokasjon: GFGK Performance Studio</span>
        </div>
      </div>
    </div>
  );
}

function BoardColumn({ column }: { column: Column }) {
  const isFerdig = column.key === "ferdig";
  return (
    <section
      className={`flex flex-col gap-2.5 rounded-lg border p-3.5 ${
        isFerdig
          ? "border-transparent bg-transparent"
          : "border-border bg-[var(--surface-alt,#F1EEE5)]/40"
      }`}
    >
      <div className="flex items-baseline justify-between px-1 pb-2">
        <div className="flex items-center gap-2.5 text-[13px] font-semibold text-foreground">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: column.dot }}
          />
          {column.name}
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {column.count}
        </span>
      </div>

      {isFerdig ? (
        <button className="flex items-center justify-between rounded-md border border-border bg-card px-3.5 py-2.5 text-[12px] text-muted-foreground hover:bg-secondary">
          <span className="inline-flex items-center gap-2">
            <Check
              size={14}
              strokeWidth={1.5}
              className="text-[var(--status-success,#1A7D56)]"
            />
            collapsed · 47 fullførte kort
          </span>
          <ChevronDown size={14} strokeWidth={1.5} />
        </button>
      ) : (
        column.cards.map((card, i) => <Card key={i} card={card} />)
      )}
    </section>
  );
}

function Card({ card }: { card: BoardCard }) {
  return (
    <article className="flex cursor-grab flex-col gap-2.5 rounded-md border border-border bg-card p-3.5 hover:border-primary/30">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <span
          className={`grid h-5.5 w-5.5 place-items-center rounded-full font-mono text-[9px] font-semibold ${avatarToneClass[card.avatarTone]}`}
          style={{ width: 22, height: 22 }}
        >
          {card.initials}
        </span>
        {card.player}
      </div>
      <div className="font-display text-[17px] italic leading-tight text-foreground">
        {card.title}
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${badgeClass[card.badge]}`}
        >
          {badgeLabel[card.badge]}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {card.ts}
        </span>
      </div>
    </article>
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
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}
