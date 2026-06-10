"use client";

// ============================================================
// Cockpit-interaktivitet + delte client-primitiver for AgencyCockpit.
// Port FRA fersk design-fasit:
//   public/design-handover/AK Golf HQ Design System/agencyos-app/
//   (screens-dashboard.jsx + core.jsx + agency.css) · /tmp/ag-fasit/dashboard.png
//
//   • COCKPIT_ICONS    — string→lucide-registry (data er serialiserbar)
//   • CockpitAvatar    — initial-avatar 22/24/44 px (kontrast-fikset for .dark)
//   • ColShell         — kolonne-skall (header + scroll-body, fasit .col)
//   • InboxColumn      — innboks m/ INLINE handling per type (Godkjenn/Book/Svar),
//                        handled-state + Angre, live ulest-teller + Oppgaver-seksjon
//   • FocusColumn      — «Trenger oppmerksomhet»: pinnet kort + AI-forslag (Caddie),
//                        pin/unpin (localStorage), inline-bekreft + Angre
//
// All interaksjon er optimistisk client-state — ingen server-mutasjon nå.
// Token-only farger, lucide-ikoner, norsk bokmål.
// ============================================================

import { useId, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Banknote,
  CalendarClock,
  CalendarPlus,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Cloud,
  Hand,
  HelpCircle,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Pin,
  Plus,
  Reply,
  Sparkles,
  User,
  Users,
  ZapOff,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  CockpitFocusAction,
  CockpitFocusPlayer,
  CockpitInboxItem,
  CockpitRichSeg,
  CockpitTask,
} from "./agency-cockpit";

// ── Ikon-registry (data sender navn, ikke komponent-refs) ───────
export type CockpitIconName =
  | "activity"
  | "alert-triangle"
  | "banknote"
  | "calendar-clock"
  | "calendar-plus"
  | "check-check"
  | "clipboard-check"
  | "clock"
  | "cloud"
  | "hand"
  | "help-circle"
  | "layers"
  | "mail"
  | "map-pin"
  | "message-square"
  | "phone"
  | "plus"
  | "reply"
  | "user"
  | "users"
  | "zap-off";

export const COCKPIT_ICONS: Record<CockpitIconName, LucideIcon> = {
  activity: Activity,
  "alert-triangle": AlertTriangle,
  banknote: Banknote,
  "calendar-clock": CalendarClock,
  "calendar-plus": CalendarPlus,
  "check-check": CheckCheck,
  "clipboard-check": ClipboardCheck,
  clock: Clock,
  cloud: Cloud,
  hand: Hand,
  "help-circle": HelpCircle,
  layers: Layers,
  mail: Mail,
  "map-pin": MapPin,
  "message-square": MessageSquare,
  phone: Phone,
  plus: Plus,
  reply: Reply,
  user: User,
  users: Users,
  "zap-off": ZapOff,
};

// ── Avatar (fasit core.jsx Avatar + dark-kontrast-fix) ──────────
// I .dark er primary OG accent lime — tekst på lime-fyll MÅ være
// *-foreground (forest), ellers lime-på-lime (fasit agency.css §kontrast).
export type CockpitAvatarTone = "default" | "primary" | "accent";

export const avatarToneClass: Record<CockpitAvatarTone, string> = {
  default: "bg-secondary text-foreground",
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
};

const avatarSizeClass = {
  22: "h-[22px] w-[22px] text-[9px]",
  24: "h-6 w-6 text-[9px]",
  44: "h-11 w-11 text-sm",
} as const;

export function CockpitAvatar({
  initials,
  tone = "default",
  size,
}: {
  initials: string;
  tone?: CockpitAvatarTone;
  size: keyof typeof avatarSizeClass;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold",
        avatarSizeClass[size],
        avatarToneClass[tone],
      )}
    >
      {initials}
    </span>
  );
}

// ── Kolonne-skall (fasit .col / .col-head / .col-body) ──────────
export function ColShell({
  label,
  count,
  countAlert,
  filter,
  children,
}: {
  label: string;
  count: string;
  countAlert?: boolean;
  filter: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card lg:h-[620px]">
      <div className="flex items-center gap-2 border-b border-border px-3.5 py-3">
        <span className="font-mono text-[10px] font-extrabold uppercase leading-[1.25] tracking-[0.12em] text-foreground">
          {label}
        </span>
        <span
          className={cn(
            "font-mono text-[10px] font-bold uppercase leading-[1.25] tracking-[0.04em]",
            countAlert ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {count}
        </span>
        <FilterChip label={filter} />
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

// ── Kolonne-filter: disablet «Kommer» (ikke meningsfullt ennå) ──
export function FilterChip({ label }: { label: string }) {
  const tipId = useId();
  return (
    <span className="relative ml-auto inline-flex">
      <button
        type="button"
        disabled
        aria-describedby={tipId}
        className="peer inline-flex h-[22px] cursor-not-allowed items-center gap-1 rounded-full bg-secondary px-2 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
      >
        {label}
        <ChevronDown className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
      </button>
      <span
        id={tipId}
        role="tooltip"
        className="pointer-events-none absolute right-0 top-[26px] z-10 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground opacity-0 shadow-md transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100"
      >
        Kommer
      </span>
    </span>
  );
}

// ── COL 2 — INNBOKS (inline handling per type) + OPPGAVER ──────
// Fasit-flyt: innboks behandles I RADEN — kontekstuell knapp per type,
// handled-state med Angre, og ulest-telleren i kolonne-headeren synker live.
const IX_ACTION: Record<
  CockpitInboxItem["type"],
  { label: string; icon: LucideIcon; done: string }
> = {
  appr: { label: "Godkjenn", icon: Check, done: "Godkjent" },
  req: { label: "Book", icon: CalendarPlus, done: "Booket" },
  msg: { label: "Svar", icon: Reply, done: "Svart" },
  advice: { label: "Svar", icon: Reply, done: "Svart" },
};

const inboxTypeClass: Record<CockpitInboxItem["type"], string> = {
  appr: "bg-accent/30 text-primary",
  req: "bg-info/10 text-info",
  msg: "bg-secondary text-muted-foreground",
  advice: "bg-warning/15 text-warning",
};

export function InboxColumn({
  items,
  totalCount,
  tasks,
  tasksDoneToday,
  tasksTotalToday,
}: {
  items: CockpitInboxItem[];
  totalCount: number;
  tasks: CockpitTask[];
  tasksDoneToday: number;
  tasksTotalToday: number;
}) {
  // inbox-id -> ferdig-label («Godkjent»/«Booket»/«Svart»)
  const [handled, setHandled] = useState<Record<string, string>>({});
  const unread = items.filter((it) => it.unread && !handled[it.id]).length;

  function undo(id: string) {
    setHandled((h) => {
      const next = { ...h };
      delete next[id];
      return next;
    });
  }

  return (
    <ColShell
      label="Innboks"
      count={unread > 0 ? `${unread} uleste` : "Alle lest"}
      countAlert={unread > 0}
      filter="Alle"
    >
      {/* SISTE 24 T */}
      <div className="px-3.5 pb-3.5 pt-1">
        <div className="flex items-center gap-2 px-2 pb-2.5 pt-1.5">
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
            Siste 24 t
          </span>
          <span className="font-mono text-[10px] font-bold text-muted-foreground">
            {totalCount}
          </span>
          <Link
            href="/admin/foresporsler"
            className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
          >
            Se alle
          </Link>
        </div>

        {items.length === 0 && (
          <p className="px-2 py-6 text-center text-[13px] text-muted-foreground">
            Ingen meldinger siste døgn.
          </p>
        )}

        {items.map((it, idx) => {
          const doneLabel = handled[it.id];
          const action = IX_ACTION[it.type];
          const ActionIcon = action.icon;
          const body = (
            <>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-semibold tracking-[-0.005em]",
                  it.unread && !doneLabel ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {it.name}
                <span
                  className={cn(
                    "rounded-[3px] px-[5px] py-px font-mono text-[8px] font-extrabold uppercase tracking-[0.12em]",
                    inboxTypeClass[it.type],
                  )}
                >
                  {it.typeLabel}
                </span>
              </span>
              <span
                className={cn(
                  "mt-0.5 truncate text-[11px] tracking-[-0.005em]",
                  doneLabel
                    ? "text-muted-foreground line-through"
                    : it.unread
                      ? "font-semibold text-foreground"
                      : "text-foreground",
                )}
              >
                {it.preview}
              </span>
            </>
          );

          return (
            <div
              key={it.id}
              className={cn(
                "relative grid grid-cols-[24px_1fr_auto] items-center gap-x-2.5 px-2 py-[9px]",
                idx === 0 ? "rounded-lg" : "border-t border-border",
                doneLabel ? "opacity-65" : "hover:bg-secondary",
              )}
            >
              {it.unread && !doneLabel && (
                <span
                  className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-destructive"
                  aria-hidden
                />
              )}
              <CockpitAvatar initials={it.initials} tone={it.avatarTone} size={24} />
              {it.href ? (
                <Link
                  href={it.href}
                  className="flex min-w-0 flex-col leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {body}
                </Link>
              ) : (
                <span className="flex min-w-0 flex-col leading-tight">{body}</span>
              )}
              {doneLabel ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-success">
                  <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  {doneLabel}
                  <button
                    type="button"
                    onClick={() => undo(it.id)}
                    className="ml-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Angre
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setHandled((h) => ({ ...h, [it.id]: action.done }))
                  }
                  className="inline-flex h-[26px] shrink-0 items-center gap-[5px] whitespace-nowrap rounded-[7px] border border-border bg-card px-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-foreground hover:border-primary hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ActionIcon className="h-3 w-3" strokeWidth={2} aria-hidden />
                  {action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* OPPGAVER */}
      <TasksSection
        initialTasks={tasks}
        doneToday={tasksDoneToday}
        totalToday={tasksTotalToday}
      />
    </ColShell>
  );
}

// ── Oppgaver: lokal toggle + «+ NY»-modal ───────────────────────
function TasksSection({
  initialTasks,
  doneToday,
  totalToday,
}: {
  initialTasks: CockpitTask[];
  doneToday: number;
  totalToday: number;
}) {
  const [tasks, setTasks] = useState<CockpitTask[]>(initialTasks);
  const [adding, setAdding] = useState(false);

  // Live-teller fra lokal state, men aldri under server-tallet (de
  // server-talte ferdige oppgavene er sann historikk for dagen).
  const localDone = tasks.filter((t) => t.done).length;
  const done = Math.max(doneToday, localDone);
  const total = Math.max(totalToday, tasks.length);

  function toggle(id: string) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function addTask(label: string) {
    setTasks((ts) => [
      ...ts,
      { id: `local-${Date.now()}`, label, tag: "NY", done: false },
    ]);
  }

  return (
    <div className="border-t border-border px-3.5 pb-3.5 pt-3">
      <div className="flex items-center gap-2 px-2 pb-2.5 pt-1.5">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
          Oppgaver
        </span>
        <span className="font-mono text-[10px] font-bold text-muted-foreground">
          {done} av {total} i dag
        </span>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
        >
          <Plus className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
          Ny
        </button>
      </div>

      {tasks.length === 0 && (
        <p className="px-2 py-4 text-center text-[13px] text-muted-foreground">
          Ingen oppgaver i dag.
        </p>
      )}

      {tasks.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => toggle(t.id)}
          aria-pressed={t.done}
          className="grid w-full grid-cols-[18px_1fr_auto] items-center gap-x-2.5 rounded-md px-2 py-[7px] text-left hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
        >
          <span
            className={cn(
              "inline-flex h-4 w-4 items-center justify-center rounded border-[1.5px]",
              t.done
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-card text-transparent",
            )}
          >
            {t.done && (
              <Check className="h-[11px] w-[11px]" strokeWidth={3} aria-hidden />
            )}
          </span>
          <span
            className={cn(
              "text-xs leading-snug tracking-[-0.005em]",
              t.done ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            {t.label}
          </span>
          <span
            className={cn(
              "font-mono text-[9px] font-bold uppercase tracking-[0.10em]",
              t.due && !t.done ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {t.tag}
          </span>
        </button>
      ))}

      <NewTaskModal open={adding} onClose={() => setAdding(false)} onAdd={addTask} />
    </div>
  );
}

function NewTaskModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (label: string) => void;
}) {
  const [value, setValue] = useState("");

  function close() {
    setValue("");
    onClose();
  }

  function submit() {
    const label = value.trim();
    if (label.length === 0) return;
    onAdd(label);
    close();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : close())}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Ny oppgave</DialogTitle>
          <DialogDescription>
            Legges i dagens liste her i oversikten.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <label className="block space-y-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Oppgave
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Hva skal gjøres …"
              autoFocus
            />
          </label>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost-light" onClick={close}>
            Avbryt
          </Button>
          <Button onClick={submit} disabled={value.trim().length === 0}>
            Legg til
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── COL 3 — TRENGER OPPMERKSOMHET (pin + AI-forslag) ────────────
const PIN_STORAGE_KEY = "agencyos-cockpit-pin";
const PIN_CHANGE_EVENT = "agencyos-cockpit-pin-change";

// localStorage som external store (useSyncExternalStore — riktig mønster
// for hydrering: server-snapshot null → client-snapshot etter mount).
function subscribePin(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PIN_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PIN_CHANGE_EVENT, onChange);
  };
}

function getPinSnapshot(): string | null {
  try {
    return window.localStorage.getItem(PIN_STORAGE_KEY);
  } catch {
    return null; // localStorage utilgjengelig — bruk server-default
  }
}

function getPinServerSnapshot(): string | null {
  return null;
}

const signalToneClass: Record<CockpitFocusPlayer["signal"]["tone"], string> = {
  alert: "bg-destructive/10 text-destructive",
  warn: "bg-warning/15 text-warning",
  info: "bg-info/10 text-info",
  lime: "bg-accent text-accent-foreground",
};

/** Rik tekst fra serialiserbare segmenter (fasit <b>/<em> i reason/why). */
function RichText({
  segs,
  variant,
}: {
  segs: CockpitRichSeg[];
  variant: "why" | "reason";
}) {
  return (
    <>
      {segs.map((s, i) => {
        if (s.style === "b") {
          return (
            <b
              key={i}
              className={cn("font-bold", variant === "why" && "text-primary")}
            >
              {s.text}
            </b>
          );
        }
        if (s.style === "em") {
          return variant === "reason" ? (
            <em
              key={i}
              className="mx-0.5 rounded-[3px] bg-secondary px-1.5 py-px font-mono text-[10px] font-bold not-italic text-muted-foreground"
            >
              {s.text}
            </em>
          ) : (
            <em key={i} className="italic">
              {s.text}
            </em>
          );
        }
        return <span key={i}>{s.text}</span>;
      })}
    </>
  );
}

function PinButton({
  active,
  onClick,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Pin className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
    </button>
  );
}

function SectionLabel({ kind }: { kind: "pin" | "ai" }) {
  const Icon = kind === "pin" ? Pin : Sparkles;
  return (
    <div className="flex items-center gap-2.5 px-0.5 pt-0.5">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
          kind === "pin" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
        {kind === "pin" ? "Pinnet av deg" : "AI-forslag · Caddie"}
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

export function FocusColumn({
  players,
  totalCount,
}: {
  players: CockpitFocusPlayer[];
  totalCount?: number;
}) {
  const serverDefault = players.find((p) => p.pinned)?.id ?? null;
  // fokus-id -> bekreftelses-label («Ringer … »)
  const [resolved, setResolved] = useState<Record<string, string>>({});

  // localStorage overstyrer server-default ("" = eksplisitt løsnet).
  const stored = useSyncExternalStore(subscribePin, getPinSnapshot, getPinServerSnapshot);
  const pinnedId =
    stored === null
      ? serverDefault
      : stored === ""
        ? null
        : players.some((p) => p.id === stored)
          ? stored
          : serverDefault;

  function setPin(id: string | null) {
    try {
      window.localStorage.setItem(PIN_STORAGE_KEY, id ?? "");
      window.dispatchEvent(new Event(PIN_CHANGE_EVENT));
    } catch {
      // localStorage utilgjengelig — pin kan ikke persisteres
    }
  }

  function undoResolved(id: string) {
    setResolved((r) => {
      const next = { ...r };
      delete next[id];
      return next;
    });
  }

  const pinned = players.find((p) => p.id === pinnedId) ?? null;
  const suggestions = players.filter((p) => p.id !== pinnedId);
  const count = totalCount ?? players.length;

  function renderActions(f: CockpitFocusPlayer, isPinned: boolean) {
    const confirmLabel = resolved[f.id];
    if (confirmLabel) {
      return (
        <div className="flex items-center gap-1.5 px-3 pb-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-success">
            <CheckCircle2 className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
            {confirmLabel}
          </span>
          <span className="flex-1" aria-hidden />
          <button
            type="button"
            onClick={() => undoResolved(f.id)}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Angre
          </button>
          {!isPinned && (
            <PinButton title="Pin øverst" onClick={() => setPin(f.id)} />
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 pb-3">
        {f.actions.map((a: CockpitFocusAction, i: number) => {
          const ActionIcon = COCKPIT_ICONS[a.icon];
          const cls = cn(
            "inline-flex h-[30px] items-center gap-1.5 rounded-lg border px-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            a.primary
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              : "border-border bg-card text-foreground hover:bg-secondary",
          );
          const inner = (
            <>
              <ActionIcon className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
              {a.label}
            </>
          );
          if (a.href) {
            return (
              <Link key={i} href={a.href} className={cls}>
                {inner}
              </Link>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={
                a.confirm
                  ? () => setResolved((r) => ({ ...r, [f.id]: a.confirm as string }))
                  : undefined
              }
              className={cls}
            >
              {inner}
            </button>
          );
        })}
        {!isPinned && (
          <>
            <span className="flex-1" aria-hidden />
            <PinButton title="Pin øverst" onClick={() => setPin(f.id)} />
          </>
        )}
      </div>
    );
  }

  function renderCard(f: CockpitFocusPlayer, isPinned: boolean) {
    const SignalIcon = COCKPIT_ICONS[f.signal.icon];
    return (
      <div
        key={f.id}
        className={cn(
          "overflow-hidden rounded-xl border bg-card",
          isPinned
            ? "bg-gradient-to-b from-accent/[0.07] to-transparent to-45%"
            : f.alert
              ? "bg-gradient-to-b from-destructive/[0.04] to-transparent to-40%"
              : "border-border",
        )}
        style={
          isPinned
            ? { borderColor: "color-mix(in oklab, hsl(var(--accent)) 45%, transparent)" }
            : f.alert
              ? { borderColor: "color-mix(in oklab, hsl(var(--destructive)) 30%, transparent)" }
              : undefined
        }
      >
        <div className="grid grid-cols-[44px_1fr_auto] items-center gap-x-3 p-3">
          <CockpitAvatar initials={f.initials} tone={f.avatarTone} size={44} />
          <div className="min-w-0">
            <div className="font-display text-[15px] font-bold leading-[1.1] tracking-[-0.015em] text-foreground">
              {f.name}
            </div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              {f.meta}
            </div>
          </div>
          {isPinned ? (
            <PinButton active title="Løsne fra topp" onClick={() => setPin(null)} />
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
                signalToneClass[f.signal.tone],
              )}
            >
              <SignalIcon className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
              {f.signal.label}
            </span>
          )}
        </div>

        {isPinned ? (
          <div className="px-3 pb-2.5 text-xs leading-[1.45] text-foreground">
            <RichText segs={f.reason} variant="reason" />
          </div>
        ) : (
          <div className="flex items-start gap-2 px-3 pb-2.5 text-xs leading-[1.45] text-foreground">
            <Sparkles
              className="mt-0.5 h-3 w-3 shrink-0 text-primary"
              strokeWidth={2}
              aria-hidden
            />
            <span>
              <b className="font-bold text-primary">Caddie:</b>{" "}
              <RichText segs={f.reason} variant="why" />
            </span>
          </div>
        )}

        {renderActions(f, isPinned)}
      </div>
    );
  }

  return (
    <ColShell
      label="Trenger oppmerksomhet"
      count={`${count} spillere`}
      filter="Auto"
    >
      <div className="flex flex-col gap-2.5 p-3.5">
        <SectionLabel kind="pin" />
        {pinned ? (
          renderCard(pinned, true)
        ) : (
          <div className="flex items-center gap-[11px] rounded-xl border border-dashed border-border p-3.5">
            <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-secondary text-muted-foreground">
              <Pin className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <div className="font-display text-sm font-bold text-foreground">
                Ingen pinnet
              </div>
              <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
                Trykk{" "}
                <Pin
                  className="inline h-2.5 w-2.5 align-[-1px]"
                  strokeWidth={2}
                  aria-hidden
                />{" "}
                på et forslag for å feste det øverst.
              </div>
            </div>
          </div>
        )}

        <SectionLabel kind="ai" />
        {suggestions.length === 0 && (
          <p className="px-2 py-6 text-center text-[13px] text-muted-foreground">
            Ingen forslag akkurat nå — alle spillere er på sporet.
          </p>
        )}
        {suggestions.map((f) => renderCard(f, false))}
      </div>
    </ColShell>
  );
}
