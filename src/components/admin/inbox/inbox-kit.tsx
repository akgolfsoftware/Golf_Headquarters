"use client";

import {
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Lightbulb,
  Check,
  X,
  MailOpen,
  Paperclip,
  Pencil,
  User,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { SeverityDot } from "@/components/athletic/agency-tags";

export type InboxType = "appr" | "req" | "msg" | "adv";

const typeMeta: Record<InboxType, { label: string; icon: LucideIcon; tag: string; ic: string }> = {
  appr: { label: "Godkjenn", icon: CheckCircle2, tag: "bg-accent text-primary", ic: "text-primary" },
  req: { label: "Forespørsel", icon: HelpCircle, tag: "bg-info/10 text-info-foreground", ic: "text-info-foreground" },
  msg: { label: "Melding", icon: MessageSquare, tag: "bg-secondary text-muted-foreground", ic: "text-muted-foreground" },
  adv: { label: "Råd", icon: Lightbulb, tag: "bg-warning/15 text-warning-foreground", ic: "text-warning-foreground" },
};

export type InboxItem = {
  id: string;
  type: InboxType;
  name: string;
  initials: string;
  avatarClass?: string;
  subject: string;
  preview: string;
  when: string;
  hasAttachment?: boolean;
  severity: "hi" | "md" | "lo";
  unread?: boolean;
};

export function InboxRow({
  item,
  selected,
  expanded,
  onToggleSelect,
  onClick,
}: {
  item: InboxItem;
  selected?: boolean;
  expanded?: boolean;
  onToggleSelect?: () => void;
  onClick?: () => void;
}) {
  const m = typeMeta[item.type];
  return (
    <div
      onClick={onClick}
      className={cn(
        "grid cursor-pointer grid-cols-[16px_20px_28px_1fr_auto_16px_8px] items-center gap-x-3 border-b border-l-2 border-border px-3 py-3 transition-colors",
        item.unread ? "border-l-accent" : "border-l-transparent",
        selected ? "bg-accent/10" : expanded ? "bg-secondary/50" : "hover:bg-secondary/60",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={!!selected}
        aria-label="Velg melding"
        onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center rounded border-[1.5px]",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-transparent",
        )}
      >
        {selected && <Check className="h-[11px] w-[11px]" strokeWidth={2.5} />}
      </button>
      <span className={cn("inline-flex justify-center", m.ic)}>
        <m.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </span>
      <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full font-display text-[10px] font-bold", item.avatarClass ?? "bg-secondary text-foreground")}>
        {item.initials}
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="flex items-center gap-2 truncate">
          <span className="text-xs font-bold text-foreground">{item.name}</span>
          <span className={cn("rounded-[3px] px-[5px] py-px font-mono text-[8px] font-extrabold uppercase tracking-[0.12em]", m.tag)}>
            {m.label}
          </span>
          <span className="truncate text-[11px] text-muted-foreground">· {item.subject}</span>
        </span>
        <span className={cn("mt-0.5 truncate text-[11px] tracking-[-0.005em]", item.unread ? "font-semibold text-foreground" : "text-muted-foreground")}>
          {item.preview}
        </span>
      </div>
      <span className="font-mono text-[10px] font-semibold tracking-[0.04em] text-muted-foreground">{item.when}</span>
      <span className="flex justify-center text-muted-foreground">
        {item.hasAttachment && <Paperclip className="h-[11px] w-[11px]" strokeWidth={1.5} />}
      </span>
      <SeverityDot level={item.severity} />
    </div>
  );
}

export function BatchActionBar({
  count,
  summary,
  onApprove,
  onReject,
  onMarkRead,
  onClear,
}: {
  count: number;
  summary?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onMarkRead?: () => void;
  onClear: () => void;
}) {
  if (count === 0) return null;
  const btn =
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]";
  return (
    <div className="flex items-center gap-2 border-b border-border bg-accent/15 px-3 py-2">
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary">
        <span className="tabular-nums">{count}</span> valgt
      </span>
      {summary && <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">· {summary}</span>}
      <div className="ml-auto flex items-center gap-1.5">
        <button type="button" onClick={onApprove} className={cn(btn, "bg-primary text-primary-foreground")}>
          <Check className="h-[11px] w-[11px]" strokeWidth={2} />Godkjenn alle
        </button>
        <button type="button" onClick={onReject} className={cn(btn, "bg-card text-foreground hover:bg-secondary")}>
          <X className="h-[11px] w-[11px]" strokeWidth={2} />Avvis
        </button>
        <button type="button" onClick={onMarkRead} className={cn(btn, "bg-card text-foreground hover:bg-secondary")}>
          <MailOpen className="h-[11px] w-[11px]" strokeWidth={1.5} />Marker lest
        </button>
        <button type="button" onClick={onClear} className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground">
          Tøm valg
        </button>
      </div>
    </div>
  );
}

export type ChangeCard = {
  label: string;
  axis: "fys" | "tek" | "slag" | "spill" | "turn";
  when: string;
  desc: string;
};

const axisDot = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
} as const;

export function InboxExpand({
  quoteHead,
  quoteText,
  was,
  next,
  onApprove,
  onEdit,
  onReject,
}: {
  quoteHead: string;
  quoteText: React.ReactNode;
  was?: ChangeCard;
  next?: ChangeCard;
  onApprove?: () => void;
  onEdit?: () => void;
  onReject?: () => void;
}) {
  const btn =
    "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]";
  return (
    <div className="grid grid-cols-[16px_1fr] gap-x-3 border-b border-border bg-secondary/30 px-3 py-4">
      <div className="ml-2 w-px self-stretch border-l border-dashed border-border" />
      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{quoteHead}</div>
          <div className="mt-1.5 text-xs leading-[1.5] text-foreground">{quoteText}</div>
        </div>

        {was && next && (
          <div className="flex items-center gap-3">
            <ChangeBox card={was} tone="was" />
            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <ChangeBox card={next} tone="new" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button type="button" onClick={onApprove} className={cn(btn, "border-primary bg-primary text-primary-foreground")}>
            <Check className="h-[11px] w-[11px]" strokeWidth={2} />Godkjenn
          </button>
          <button type="button" onClick={onEdit} className={cn(btn, "border-border bg-card text-foreground hover:bg-secondary")}>
            <Pencil className="h-[11px] w-[11px]" strokeWidth={1.5} />Foreslå endring
          </button>
          <button type="button" onClick={onReject} className={cn(btn, "border-destructive/30 bg-card text-destructive hover:bg-destructive/5")}>
            <X className="h-[11px] w-[11px]" strokeWidth={2} />Avvis
          </button>
          <span className="flex-1" />
          <button type="button" className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground hover:bg-secondary hover:text-foreground">
            <MessageSquare className="h-[11px] w-[11px]" strokeWidth={1.5} />Svar i tråd
          </button>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground hover:bg-secondary hover:text-foreground">
            <User className="h-[11px] w-[11px]" strokeWidth={1.5} />Åpne profil
          </button>
        </div>
      </div>
    </div>
  );
}

function ChangeBox({ card, tone }: { card: ChangeCard; tone: "was" | "new" }) {
  return (
    <div className={cn("flex-1 rounded-lg border p-2.5", tone === "new" ? "border-primary/30 bg-accent/[0.06]" : "border-border bg-card")}>
      <div className="font-mono text-[8px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{card.label}</div>
      <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] font-bold tabular-nums text-foreground">
        <span className={cn("h-1.5 w-1.5 rounded-full", axisDot[card.axis])} />
        {card.when}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{card.desc}</div>
    </div>
  );
}
