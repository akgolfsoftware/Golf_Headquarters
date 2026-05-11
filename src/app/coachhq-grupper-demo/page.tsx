/**
 * CoachHQ — Grupper (v2 m/ utvidet)
 * Bygd fra wireframe/design-files-v2/screens/26-coachhq-grupper.html
 * URL: /coachhq-grupper-demo
 *
 * Treet til venstre. Spillerne til høyre. Anders organiserer 38 spillere på
 * tvers av klubber, nivåer og under-grupper (turnering, vinter-team,
 * fys-prosjekt).
 */

import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  X,
} from "lucide-react";

type TreeNode = {
  label: string;
  count: number;
  iconLabel: string;
  iconTone: "club" | "elite" | "pro" | "fys" | "amat" | "junior" | "sub";
  indent?: 0 | 1 | 2;
  expanded?: boolean;
  active?: boolean;
  dim?: boolean;
};

const tree: TreeNode[] = [
  { label: "GFGK", count: 24, iconLabel: "GF", iconTone: "club", expanded: true },
  {
    label: "Elite",
    count: 12,
    iconLabel: "EL",
    iconTone: "elite",
    indent: 1,
    expanded: true,
    active: true,
  },
  {
    label: "Turnering S26",
    count: 8,
    iconLabel: "·",
    iconTone: "sub",
    indent: 2,
  },
  {
    label: "Vinter-team",
    count: 4,
    iconLabel: "·",
    iconTone: "sub",
    indent: 2,
  },
  {
    label: "Fys-prosjekt",
    count: 3,
    iconLabel: "·",
    iconTone: "sub",
    indent: 2,
  },
  { label: "Pro", count: 7, iconLabel: "PR", iconTone: "pro", indent: 1 },
  { label: "Amatør", count: 5, iconLabel: "A", iconTone: "amat", indent: 1 },
  { label: "Mulligan Borre", count: 11, iconLabel: "MB", iconTone: "club", expanded: true },
  { label: "Pro", count: 8, iconLabel: "PR", iconTone: "pro", indent: 1 },
  { label: "Junior", count: 3, iconLabel: "J", iconTone: "junior", indent: 1 },
  { label: "Bossum GK", count: 3, iconLabel: "BG", iconTone: "club", expanded: true },
  {
    label: "Fys-rehab",
    count: 3,
    iconLabel: "FY",
    iconTone: "fys",
    indent: 1,
    dim: true,
  },
];

const iconToneClass: Record<TreeNode["iconTone"], string> = {
  club: "bg-[#9C9990] text-white",
  elite: "bg-[#B8852A] text-white",
  pro: "bg-primary text-primary-foreground",
  fys: "bg-[#A32D2D] text-white",
  amat: "bg-primary text-primary-foreground",
  junior: "bg-primary text-primary-foreground",
  sub: "bg-transparent text-muted-foreground border border-dashed border-border",
};

type SubChip = { name: string; count: number; dotColor: string; active?: boolean };

const subChips: SubChip[] = [
  { name: "Alle", count: 12, dotColor: "var(--primary,#005840)", active: true },
  { name: "Turnering S26", count: 8, dotColor: "#B8852A" },
  { name: "Vinter-team", count: 4, dotColor: "#005840" },
  { name: "Fys-prosjekt", count: 3, dotColor: "#A32D2D" },
];

type Player = {
  initials: string;
  avatarColor: string;
  name: string;
  age: number;
  hcp: string;
  hcpDown?: boolean;
  sub: { label: string; tone: "turn" | "vinter" | "fys" };
  coach: { initials: string; name: string; color: string };
  last: string;
  lastWarn?: boolean;
  dragging?: boolean;
};

const players: Player[] = [
  {
    initials: "MR",
    avatarColor: "#A32D2D",
    name: "Markus Roinås Pedersen",
    age: 17,
    hcp: "+0,8",
    hcpDown: true,
    sub: { label: "Turn S26", tone: "turn" },
    coach: { initials: "AK", name: "Anders", color: "var(--primary,#005840)" },
    last: "i dag",
  },
  {
    initials: "SP",
    avatarColor: "#005840",
    name: "Sara Pedersen",
    age: 16,
    hcp: "+1,2",
    sub: { label: "Turn S26", tone: "turn" },
    coach: { initials: "AK", name: "Anders", color: "var(--primary,#005840)" },
    last: "i går",
  },
  {
    initials: "ES",
    avatarColor: "#7a4e0e",
    name: "Emma Solberg",
    age: 15,
    hcp: "+1,6",
    sub: { label: "Turn S26", tone: "turn" },
    coach: { initials: "TA", name: "Tom", color: "#B8852A" },
    last: "2 d",
    dragging: true,
  },
  {
    initials: "LB",
    avatarColor: "#0A1F18",
    name: "Lina Berg",
    age: 17,
    hcp: "+2,1",
    sub: { label: "Vinter", tone: "vinter" },
    coach: { initials: "AK", name: "Anders", color: "var(--primary,#005840)" },
    last: "3 d",
  },
  {
    initials: "JH",
    avatarColor: "#B8852A",
    name: "Jonas Halvorsen",
    age: 18,
    hcp: "+2,4",
    sub: { label: "Fys", tone: "fys" },
    coach: { initials: "TA", name: "Tom", color: "#B8852A" },
    last: "9 d",
    lastWarn: true,
  },
  {
    initials: "SE",
    avatarColor: "#9C9990",
    name: "Sigrid Eide",
    age: 16,
    hcp: "+2,8",
    sub: { label: "Turn S26", tone: "turn" },
    coach: { initials: "AK", name: "Anders", color: "var(--primary,#005840)" },
    last: "4 d",
  },
  {
    initials: "AT",
    avatarColor: "#005840",
    name: "Andreas Tønnessen",
    age: 17,
    hcp: "+3,1",
    sub: { label: "Vinter", tone: "vinter" },
    coach: { initials: "SP", name: "Sara", color: "#005840" },
    last: "i dag",
  },
];

export default function CoachhqGrupperDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          CoachHQ · Grupper · mai 2026
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Grupper. <em className="italic text-muted-foreground">Hvem som hører hvor.</em>
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          38 spillere · 9 grupper · 14 sub-grupper. Dra og slipp navn mellom
          grupper i venstre tre.
        </p>
      </header>

      <div className="grid grid-cols-[280px_1fr] items-start gap-6">
        {/* Tree */}
        <aside className="sticky top-6 rounded-lg border border-border bg-card p-3.5">
          <h3 className="mb-2.5 px-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Grupper
          </h3>
          {tree.map((node, i) => (
            <TreeItem key={i} node={node} />
          ))}
          <button className="mt-2 flex w-full items-center gap-2 rounded-md border border-dashed border-border px-2.5 py-2 text-[12px] text-muted-foreground hover:border-primary hover:text-primary">
            <Plus size={14} strokeWidth={1.5} />
            Ny gruppe
          </button>
        </aside>

        {/* Detail */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Head */}
          <div className="flex items-start justify-between gap-6 border-b border-border px-6 py-5">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                GFGK / Elite
              </div>
              <h2 className="mt-1.5 flex items-center gap-2.5 font-display text-[26px] font-medium tracking-tight text-foreground">
                Elite.{" "}
                <em className="text-[18px] italic font-normal text-muted-foreground">
                  12 spillere.
                </em>
              </h2>
              <div className="mt-2 text-[13px] text-muted-foreground">
                Hovedcoach: deg · Co-coach: Tom Andersen · Standard
                plan-template:{" "}
                <code className="rounded-sm bg-[var(--surface-alt,#F1EEE5)] px-1.5 py-0.5 font-mono text-[12px] text-foreground">
                  elite-uke-v2
                </code>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
                Rediger
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
                <Plus size={14} strokeWidth={1.5} />
                Legg til spiller
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3 border-b border-border bg-[var(--surface-alt,#F1EEE5)] px-6 py-4">
            <GroupKpi label="Spillere" value="12" delta="av 15 maks" />
            <GroupKpi
              label="Snitt HCP"
              value="+2,4"
              delta="↓ 0,3 / 30 d"
              tone="up"
            />
            <GroupKpi
              label="Plan-compl. 30d"
              value="78 %"
              delta="+12 % vs forr."
              tone="up"
            />
            <GroupKpi
              label="Aktive nå"
              value="9"
              delta="3 mer enn 7 d siden økt"
              tone="warn"
            />
          </div>

          {/* Sub chips */}
          <div className="flex flex-wrap gap-2 border-b border-border px-6 py-4">
            {subChips.map((s) => (
              <SubChipEl key={s.name} chip={s} />
            ))}
            <button className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:border-primary hover:text-primary">
              <Plus size={11} strokeWidth={1.5} />
              Ny sub-gruppe
            </button>
          </div>

          {/* Roster */}
          <div className="px-6 py-4">
            <div className="mb-3 flex items-center gap-2.5">
              <h3 className="font-display text-[18px] italic font-medium tracking-tight text-foreground">
                Spillerne
              </h3>
              <span className="font-mono text-[11px] text-muted-foreground">
                12 totalt · sortert på HCP ↓
              </span>
              <div className="ml-auto flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                  ↓ HCP
                </span>
                <button className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary">
                  Eksporter CSV
                </button>
              </div>
            </div>

            {/* Table head */}
            <div className="grid grid-cols-[24px_40px_1fr_100px_120px_140px_80px_24px] gap-3.5 border-b border-border bg-[var(--surface-alt,#F1EEE5)] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <div />
              <div />
              <div>Spiller</div>
              <div className="text-right">HCP</div>
              <div>Sub-gr.</div>
              <div>Coach</div>
              <div>Siste økt</div>
              <div />
            </div>

            {players.map((p, i) => (
              <PlayerRow key={i} player={p} />
            ))}

            {/* Drop zone */}
            <div className="mt-3 flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-primary bg-primary/8 px-6 py-5 font-mono text-[12px] tracking-[0.04em] text-primary">
              <ChevronRight size={16} strokeWidth={1.5} />
              Slipp <strong className="font-semibold">Emma Solberg</strong> her
              — flyttes til{" "}
              <strong className="font-semibold">Vinter-team</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-strip */}
      <div className="mt-6 flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-[12px]">
        <div className="text-muted-foreground">
          Coach Anders Kristiansen · GFGK Performance Studio · 14:18
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span>Modaler: NewGroupModal · MoveToGroupModal · DeleteGroupModal</span>
        </div>
      </div>
    </div>
  );
}

function TreeItem({ node }: { node: TreeNode }) {
  const indentClass =
    node.indent === 2 ? "pl-14" : node.indent === 1 ? "pl-8" : "";
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] ${indentClass} ${
        node.active
          ? "bg-primary/8 font-medium text-primary"
          : "text-foreground hover:bg-[var(--surface-alt,#F1EEE5)]"
      } ${node.dim ? "opacity-55" : ""} ${node.indent === 2 ? "text-[12px] text-muted-foreground" : ""}`}
    >
      <span className="w-3 shrink-0 font-mono text-[10px] text-muted-foreground">
        {node.indent === 2 ? "" : node.expanded ? (
          <ChevronDown size={11} strokeWidth={1.5} />
        ) : (
          <ChevronRight size={11} strokeWidth={1.5} />
        )}
      </span>
      <div
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-sm font-display text-[9px] font-bold ${iconToneClass[node.iconTone]}`}
      >
        {node.iconLabel}
      </div>
      <span className="flex-1 truncate">{node.label}</span>
      <span className="font-mono text-[10px] font-normal text-muted-foreground">
        {node.count}
      </span>
    </div>
  );
}

function SubChipEl({ chip }: { chip: SubChip }) {
  return (
    <span
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] ${
        chip.active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground"
      }`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: chip.active ? "var(--accent,#D1F843)" : chip.dotColor }}
      />
      {chip.name}
      <span
        className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] ${
          chip.active
            ? "bg-white/15 text-primary-foreground"
            : "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground"
        }`}
      >
        {chip.count}
      </span>
      <X
        size={12}
        strokeWidth={1.5}
        className={chip.active ? "text-primary-foreground/70" : "text-muted-foreground"}
      />
    </span>
  );
}

function GroupKpi({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "up" | "warn";
}) {
  const deltaClass =
    tone === "up"
      ? "text-[var(--status-success,#1A7D56)]"
      : tone === "warn"
        ? "text-[var(--status-warning,#B8852A)]"
        : "text-muted-foreground";
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[22px] font-medium tabular-nums tracking-tight text-foreground">
        {value}
      </span>
      <span className={`font-mono text-[11px] ${deltaClass}`}>{delta}</span>
    </div>
  );
}

function PlayerRow({ player }: { player: Player }) {
  const subToneClass = {
    turn: "bg-[var(--color-pyr-spill,#B8852A)]/10 text-[#7a4e0e]",
    vinter: "bg-primary/10 text-primary",
    fys: "bg-[#A32D2D]/8 text-[#A32D2D]",
  };
  return (
    <div
      className={`grid grid-cols-[24px_40px_1fr_100px_120px_140px_80px_24px] cursor-grab items-center gap-3.5 border-b border-[var(--line-soft,#EFEDE6)] px-4 py-3 text-[13px] last:border-b-0 hover:bg-[var(--surface-alt,#F1EEE5)]/60 ${
        player.dragging
          ? "rounded-md border border-dashed border-primary bg-primary/8"
          : ""
      }`}
    >
      <div
        className={`flex justify-center ${player.dragging ? "text-primary" : "text-[var(--ink-disabled,#C4C0B8)]"}`}
      >
        <GripVertical size={14} strokeWidth={1.5} />
      </div>
      <div
        className="grid h-8 w-8 place-items-center rounded-full font-mono text-[11px] font-semibold text-white"
        style={{ background: player.avatarColor }}
      >
        {player.initials}
      </div>
      <div className="font-medium text-foreground">
        {player.name}
        <span className="ml-1.5 font-mono text-[11px] font-normal text-muted-foreground">
          · {player.age}
        </span>
        {player.dragging && (
          <span className="ml-2 font-mono text-[10px] font-medium uppercase tracking-[0.04em] text-primary">
            Dragging
          </span>
        )}
      </div>
      <div
        className={`text-right font-mono text-[13px] tabular-nums ${player.hcpDown ? "text-[var(--status-success,#1A7D56)]" : "text-foreground"}`}
      >
        {player.hcp}
      </div>
      <div>
        <span
          className={`inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold ${subToneClass[player.sub.tone]}`}
        >
          {player.sub.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="grid h-5.5 w-5.5 place-items-center rounded-full font-mono text-[9px] font-semibold text-white"
          style={{ background: player.coach.color, width: 22, height: 22 }}
        >
          {player.coach.initials}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {player.coach.name}
        </span>
      </div>
      <div
        className={`font-mono text-[11px] ${player.lastWarn ? "text-[var(--status-warning,#B8852A)]" : "text-muted-foreground"}`}
      >
        {player.last}
      </div>
      <div className="text-center text-muted-foreground">›</div>
    </div>
  );
}
