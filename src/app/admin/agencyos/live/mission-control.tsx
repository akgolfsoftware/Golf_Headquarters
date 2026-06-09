"use client";

/**
 * Mission Control — Direction A live-dashboard (visuelt skall).
 * Faithful port av public/design-handover/meg-live-os/src/dir-a.jsx (+ dir-a.css).
 *
 * Mørk skog-cockpit · bento-grid · lime-signaler · «live»-følelse.
 * Wrapper i .dark slik at semantiske tokens flipper til forest/lime.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  Archive,
  ArrowUpRight,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  ChevronDown,
  Circle,
  Clock,
  CornerUpLeft,
  Flag,
  Flame,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  RefreshCw,
  Reply,
  Search,
  Send,
  Shield,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  ANTALL_AVTALER,
  DAGENS_TRE,
  type CalEvent,
  type Email,
  EMAILS,
  EVENTS,
  EVENTS_MORE,
  INCOMING,
  type Message,
  MESSAGES,
  MODULES,
  NOTION,
  type Priority,
  SCENE_DATE,
  type Task,
  TASKS,
} from "./data";
import "./live-cockpit.css";

/* ---------- ikon-oppslag ---------- */
const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  "arrow-up-right": ArrowUpRight,
  "book-open": BookOpen,
  calendar: Calendar,
  "check-check": CheckCheck,
  clock: Clock,
  "corner-up-left": CornerUpLeft,
  flag: Flag,
  globe: Globe,
  mail: Mail,
  "message-square": MessageSquare,
  shield: Shield,
  users: Users,
};

function ModIcon({ name, size = 17 }: { name: string; size?: number }) {
  const C = ICONS[name] ?? Circle;
  return <C size={size} strokeWidth={1.5} />;
}

/* ---------- prioritet ---------- */
const PRIO: Record<
  Priority,
  { label: string; cls: string; icon: LucideIcon }
> = {
  urgent: { label: "Haster", cls: "text-destructive", icon: Flame },
  followup: { label: "Følg opp", cls: "text-warning", icon: Flag },
  open: { label: "Ubesvart", cls: "text-muted-foreground", icon: Circle },
};

/* ---------- klokke / sync / count-up hooks ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const fmtTime = (d: Date) =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // rAF unngår synkron setState i effect-body (react-hooks/set-state-in-effect)
    // og hindrer hydrerings-mismatch (klokke server ≠ klient).
    const raf = requestAnimationFrame(() => setNow(new Date()));
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);
  return now;
}

function useSyncTicker() {
  const [since, setSince] = useState(0);
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setSince((s) => {
        if (s >= 48) {
          setSyncing(true);
          setTimeout(() => setSyncing(false), 1200);
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return { since, syncing };
}

function useCountUp(target: number, dur = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    let done = false;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else done = true;
    };
    raf = requestAnimationFrame(tick);
    const fb = setTimeout(() => {
      if (!done) setV(target);
    }, dur + 250);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fb);
    };
  }, [target, dur]);
  return v;
}

/* ---------- avatar ---------- */
function Avatar({
  initials,
  tone = "neutral",
  size = 34,
}: {
  initials: string;
  tone?: "neutral" | "lime" | "primary";
  size?: number;
}) {
  const tones: Record<string, string> = {
    neutral: "mc-surface-8 text-foreground",
    lime: "bg-accent text-accent-foreground",
    primary: "bg-pyr-fys text-accent",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold leading-none ${tones[tone]}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

/* ---------- svarboks ---------- */
function ReplyBox({
  onSend,
  placeholder,
}: {
  onSend: () => void;
  placeholder?: string;
}) {
  const [v, setV] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="mt-2.5 flex gap-2" onClick={(e) => e.stopPropagation()}>
      <input
        ref={ref}
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder || "Skriv et hurtigsvar…"}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSend();
        }}
        className="h-[34px] flex-1 rounded-[9px] border border-accent bg-accent/5 px-3 font-sans text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        onClick={onSend}
        className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] bg-accent px-[13px] font-display text-[12px] font-bold text-accent-foreground"
      >
        <Send size={14} strokeWidth={1.5} /> Send
      </button>
    </div>
  );
}

/* ---------- card-header ---------- */
function CardHeader({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-[9px] border-b border-border px-4 py-3.5 text-foreground">
      <Icon size={15} strokeWidth={1.5} />
      <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.1em]">
        {title}
      </span>
      {children}
    </div>
  );
}

/* ---------- drawer-state ---------- */
type Drawer =
  | { kind: "email"; item: Email }
  | { kind: "event"; item: CalEvent }
  | { kind: "msg"; item: Message };

/* ============================================================ */

export function MissionControl() {
  const now = useClock();
  const { since, syncing } = useSyncTicker();

  const [emails, setEmails] = useState<Email[]>(() =>
    EMAILS.map((e) => ({ ...e })),
  );
  const [messages, setMessages] = useState<Message[]>(() =>
    MESSAGES.map((m) => ({ ...m })),
  );
  const [tasks, setTasks] = useState<Task[]>(() => TASKS.map((t) => ({ ...t })));
  const [toast, setToast] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [pf, setPf] = useState<"alle" | Priority>("alle");
  const [reply, setReply] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<Drawer | null>(null);

  const flash = useCallback((m: string) => setToast(m), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1900);
    return () => clearTimeout(t);
  }, [toast]);

  // skriptet innkommende melding → stream-in + teller-bump + puls
  useEffect(() => {
    const t = setTimeout(() => {
      setMessages((m) =>
        m.some((x) => x.id === INCOMING.id) ? m : [{ ...INCOMING }, ...m],
      );
      flash("Ny melding · Sofie Kvam");
    }, 6500);
    return () => clearTimeout(t);
  }, [flash]);

  const readEmail = useCallback(
    (id: string, verb = "Merket som lest") => {
      setEmails((es) => es.filter((e) => e.id !== id));
      flash(verb);
    },
    [flash],
  );
  const readMessage = useCallback(
    (id: string, verb = "Merket som lest") => {
      setMessages((ms) => ms.filter((m) => m.id !== id));
      flash(verb);
    },
    [flash],
  );
  const toggleTask = useCallback(
    (id: string) =>
      setTasks((ts) =>
        ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      ),
    [],
  );

  const counts = {
    avtaler: ANTALL_AVTALER,
    oppgaver: tasks.filter((t) => !t.done).length,
    ubesvarte: emails.length,
    uleste: messages.reduce((s, m) => s + (m.unread || 1), 0),
  };

  const kAvt = useCountUp(counts.avtaler);
  const kOpp = useCountUp(counts.oppgaver);
  const kUbe = useCountUp(counts.ubesvarte);
  const kUle = useCountUp(counts.uleste);

  const ql = q.trim().toLowerCase();
  const match = (...s: string[]) =>
    !ql || s.join(" ").toLowerCase().includes(ql);
  const fEmails = emails.filter(
    (e) =>
      (pf === "alle" || e.priority === pf) &&
      match(e.subject, e.from, e.name, e.snippet),
  );
  const fMessages = messages.filter((m) => match(m.name, m.source, m.snippet));
  const fEvents = EVENTS.filter((e) => match(e.title, e.who, e.source));
  const beeper = fMessages.filter((m) => m.channel === "beeper");
  const imsg = fMessages.filter((m) => m.channel === "imessage");

  const kpis = [
    { lbl: "Avtaler i dag", v: kAvt, sub: "Google Kalender", icon: Calendar, tone: "" },
    { lbl: "Aktive oppgaver", v: kOpp, sub: "Notion", icon: CheckCheck, tone: "" },
    { lbl: "Ubesvarte e-poster", v: kUbe, sub: "2 haster", icon: Mail, tone: "urgent" },
    { lbl: "Uleste meldinger", v: kUle, sub: "Beeper · iMessage", icon: MessageSquare, tone: "lime" },
  ];

  const axisBorder: Record<string, string> = {
    fys: "border-pyr-fys",
    tek: "border-pyr-tek",
    slag: "border-pyr-slag",
    spill: "border-pyr-spill",
    "": "border-border",
  };

  return (
    <div className="dark relative -mx-4 -mb-24 overflow-hidden rounded-2xl border border-border sm:-mx-8 md:-mb-6">
      <div className="mc-root min-h-[80vh] w-full font-sans text-foreground">
        {/* command bar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-background/55 px-6 py-3.5 backdrop-blur-md">
          <div className="flex shrink-0 items-center gap-3">
            <Image
              src="/logos/ak-golf-logo-white-on-dark.svg"
              alt="AK Golf"
              width={30}
              height={26}
              priority
              className="block h-[26px] w-auto"
            />
            <span className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
              AgencyOS
              <b className="ml-1.5 text-[12px] font-medium text-muted-foreground">
                · AK Golf Academy
              </b>
            </span>
          </div>
          <div className="flex h-10 max-w-[540px] flex-1 items-center gap-2.5 rounded-xl border border-border mc-surface px-3.5 text-muted-foreground">
            <Search size={15} strokeWidth={1.5} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Søk på tvers av Gmail, Notion, kalender, meldinger…"
              className="flex-1 border-0 bg-transparent font-sans text-[13px] text-foreground outline-none placeholder:text-muted-foreground/60"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="inline-flex p-0.5 text-muted-foreground"
                aria-label="Tøm søk"
              >
                <X size={13} strokeWidth={1.5} />
              </button>
            )}
          </div>
          <div className="ml-auto flex flex-col items-end leading-[1.1]">
            <span
              className={`inline-flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] ${
                syncing ? "text-accent" : "text-muted-foreground"
              }`}
            >
              <RefreshCw size={12} strokeWidth={2} />{" "}
              {syncing ? "Synker…" : `for ${since} s siden`}
            </span>
            <span className="font-mono text-[17px] font-bold tracking-[0.02em] text-foreground tabular-nums">
              {now ? fmtTime(now) : "––:––:––"}
            </span>
          </div>
          <button
            type="button"
            aria-label="Varsler"
            disabled
            title="Kommer"
            className="relative inline-flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-[11px] border border-border mc-surface text-muted-foreground opacity-60"
          >
            <Bell size={17} strokeWidth={1.5} />
          </button>
        </header>

        <div className="px-7 pb-9 pt-6">
          {/* greeting */}
          <div className="mb-[22px] flex items-end justify-between gap-5">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {SCENE_DATE} · OPS-OVERSIKT
              </div>
              <h1 className="mt-2 font-display text-[34px] font-bold tracking-[-0.025em] text-foreground">
                God morgen,{" "}
                <em className="font-normal italic text-accent">Anders.</em>
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/[0.06] px-[13px] py-[7px] font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
              <span className="mc-pulse h-2 w-2 rounded-full bg-accent" /> LIVE ·
              alle kilder tilkoblet
            </div>
          </div>

          {/* KPI strip */}
          <div className="mb-4 grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {kpis.map((k) => {
              const KIcon = k.icon;
              return (
                <div
                  key={k.lbl}
                  className={`relative overflow-hidden rounded-2xl border bg-card p-4 ${
                    k.tone === "lime" ? "border-accent/40" : "border-border"
                  }`}
                >
                  {k.tone === "lime" && (
                    <span className="mc-kpi-glow absolute -right-10 -top-10 h-[120px] w-[120px] rounded-full opacity-[0.13]" />
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                      {k.lbl}
                    </span>
                    <span
                      className={
                        k.tone === "urgent"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      <KIcon size={15} strokeWidth={1.5} />
                    </span>
                  </div>
                  <div
                    className={`my-[6px] mt-3 font-mono text-[40px] font-bold leading-none tracking-[-0.03em] tabular-nums ${
                      k.tone === "lime"
                        ? "text-accent"
                        : k.tone === "urgent"
                          ? "text-[#FF8A8A]"
                          : "text-foreground"
                    }`}
                  >
                    {k.v}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
                    {k.sub}
                  </div>
                </div>
              );
            })}
          </div>

          {/* module launcher */}
          <div className="mb-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
            {MODULES.map((m) => {
              const inner = (
                <>
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] ${
                      m.app
                        ? "bg-pyr-fys text-accent"
                        : "mc-surface-2 text-muted-foreground"
                    }`}
                  >
                    <ModIcon name={m.icon} />
                  </span>
                  <span className="font-display text-[13px] font-bold tracking-[-0.01em]">
                    {m.label}
                  </span>
                  <ArrowUpRight
                    size={13}
                    strokeWidth={1.5}
                    className="absolute right-[13px] top-[13px] text-muted-foreground"
                  />
                </>
              );
              const cls =
                "group relative flex flex-col items-start gap-3.5 rounded-[14px] border border-border bg-card p-[13px] text-left text-foreground transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-accent";
              return m.href ? (
                <Link key={m.key} href={m.href} className={cls}>
                  {inner}
                </Link>
              ) : (
                // Eksterne kilder (Notion/Gmail/Kalender) har ingen in-app
                // rute ennå → tydelig disablet med «Kommer», ikke død knapp.
                <button
                  key={m.key}
                  type="button"
                  disabled
                  title="Kommer"
                  className={`${cls} cursor-not-allowed opacity-50 hover:translate-y-0 hover:border-border`}
                >
                  {inner}
                </button>
              );
            })}
          </div>

          {/* dagens tre */}
          <div className="relative mb-[18px] overflow-hidden rounded-[18px] border border-border bg-[linear-gradient(110deg,hsl(var(--primary)),#06352a_70%,hsl(var(--card)))] px-[22px] py-[18px]">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent">
              DAGENS TRE · IKKE-FORHANDLINGSBART
            </span>
            <div className="mt-[13px] flex flex-wrap gap-3">
              {DAGENS_TRE.map((t) => (
                <span
                  key={t.n}
                  className="inline-flex items-center gap-[9px] rounded-full border border-accent/45 bg-background/35 py-[11px] pl-[13px] pr-[18px] font-display text-[16px] font-bold tracking-[-0.01em] text-foreground"
                >
                  <b className="font-mono text-[11px] font-extrabold text-accent">
                    {t.n}
                  </b>
                  <ModIcon name={t.icon} size={14} />
                  {t.label}
                </span>
              ))}
            </div>
            <span className="mc-glow absolute -right-[30px] -top-[50px] h-[180px] w-[180px] rounded-full opacity-[0.16]" />
          </div>

          {/* BENTO */}
          <div className="flex flex-col items-start gap-3.5 lg:flex-row">
            {/* venstre kolonne */}
            <div className="flex w-full min-w-0 flex-col gap-3.5 lg:flex-[1.32]">
              {/* Kalender */}
              <section className="overflow-hidden rounded-2xl border border-border bg-card">
                <CardHeader icon={Calendar} title="Dagens kalender">
                  <span className="ml-1 font-mono text-[10px] font-extrabold text-muted-foreground">
                    {counts.avtaler} AVTALER
                  </span>
                  <span className="ml-auto font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    Google Kalender
                  </span>
                </CardHeader>
                <div className="px-3 pb-3 pt-2">
                  {fEvents.map((ev, i) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setDrawer({ kind: "event", item: ev })}
                      className={`mc-row-hover grid w-full grid-cols-[56px_1fr] gap-3 rounded-[10px] px-2 py-[11px] text-left ${
                        i > 0 ? "rounded-t-none border-t border-border" : ""
                      }`}
                    >
                      <span className="pt-px font-mono text-[12px] font-extrabold tabular-nums text-foreground">
                        {ev.allday ? "Hele dagen" : ev.time}
                      </span>
                      <span
                        className={`min-w-0 border-l-[3px] pl-3 ${
                          ev.next ? "border-accent" : axisBorder[ev.axis]
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-[13.5px] font-semibold tracking-[-0.01em] text-foreground">
                            {ev.title}
                          </span>
                          {ev.next && (
                            <span className="inline-flex items-center rounded-full bg-accent px-[7px] py-0.5 font-mono text-[8px] font-extrabold tracking-[0.1em] text-accent-foreground">
                              <span className="mc-blink mr-[5px] h-[5px] w-[5px] rounded-full bg-accent-foreground" />
                              NESTE
                            </span>
                          )}
                        </span>
                        <span className="mt-[3px] block text-[12px] text-muted-foreground">
                          {ev.who}
                        </span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-2.5">
                          <span className="mc-surface-2 rounded-[5px] px-[7px] py-[3px] font-mono text-[8.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                            {ev.source}
                          </span>
                          {ev.loc && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                              <MapPin size={11} strokeWidth={1.5} />
                              {ev.loc}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  ))}
                  {!ql && (
                    <button
                      type="button"
                      className="mt-1.5 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-border py-[9px] font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown size={13} strokeWidth={1.5} /> +{EVENTS_MORE}{" "}
                      flere avtaler i dag
                    </button>
                  )}
                </div>
              </section>

              {/* Gmail */}
              <section className="overflow-hidden rounded-2xl border border-border bg-card">
                <CardHeader icon={Mail} title="Gmail">
                  <span className="ml-1 font-mono text-[10px] font-extrabold text-destructive">
                    {emails.length} UBESVART
                  </span>
                </CardHeader>
                <div className="flex flex-wrap gap-1.5 px-3 pb-1 pt-2.5">
                  {(
                    [
                      ["alle", "Alle"],
                      ["urgent", "Haster"],
                      ["followup", "Følg opp"],
                      ["open", "Ubesvart"],
                    ] as const
                  ).map(([k, l]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setPf(k)}
                      className={`h-7 rounded-full border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.06em] ${
                        pf === k
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="px-3 pb-3 pt-2">
                  {fEmails.length === 0 && (
                    <div className="flex flex-col items-center gap-2.5 p-8 text-[13px] text-muted-foreground">
                      <CheckCheck
                        size={22}
                        strokeWidth={1.5}
                        className="text-accent"
                      />
                      <span>Innboks tom — godt jobba.</span>
                    </div>
                  )}
                  {fEmails.map((e, i) => {
                    const Pri = PRIO[e.priority];
                    return (
                      <div
                        key={e.id}
                        onClick={() => setDrawer({ kind: "email", item: e })}
                        className={`mc-row-hover grid cursor-pointer grid-cols-[34px_1fr] gap-3 rounded-[10px] px-2 py-[13px] ${
                          i > 0 ? "rounded-t-none border-t border-border" : ""
                        }`}
                      >
                        <Avatar
                          initials={e.initials}
                          tone={e.priority === "urgent" ? "primary" : "neutral"}
                          size={34}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-bold text-foreground">
                              {e.name}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border border-current py-0.5 pl-1.5 pr-[7px] font-mono text-[8.5px] font-extrabold uppercase tracking-[0.08em] ${Pri.cls}`}
                            >
                              <Pri.icon size={10} strokeWidth={2} />
                              {Pri.label}
                            </span>
                            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                              {e.when}
                            </span>
                          </div>
                          <div className="mt-1 text-[13px] font-semibold tracking-[-0.005em] text-foreground">
                            {e.subject}
                          </div>
                          <div className="mc-clamp-2 mt-[3px] text-[12px] leading-[1.45] text-muted-foreground">
                            {e.snippet}
                          </div>
                          {reply === e.id ? (
                            <ReplyBox
                              onSend={() => {
                                setReply(null);
                                readEmail(e.id, `Svar sendt · ${e.name}`);
                              }}
                            />
                          ) : (
                            <div
                              className="mt-2.5 flex gap-1.5"
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              <ActBtn
                                primary
                                icon={Reply}
                                label="Svar"
                                onClick={() => setReply(e.id)}
                              />
                              <ActBtn
                                icon={Check}
                                label="Les"
                                onClick={() => readEmail(e.id)}
                              />
                              <ActBtn
                                icon={Archive}
                                label="Arkiver"
                                onClick={() => readEmail(e.id, "Arkivert")}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Oppgaver */}
              <section className="overflow-hidden rounded-2xl border border-border bg-card">
                <CardHeader icon={CheckCheck} title="Oppgaver">
                  <span className="ml-auto font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    Notion ↗
                  </span>
                </CardHeader>
                <div className="px-3 pb-3 pt-2">
                  <div className="px-1 pb-2 pt-3 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                    FORFALLER I DAG
                  </div>
                  {tasks.map((t, i) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTask(t.id)}
                      className={`mc-row-hover grid w-full grid-cols-[20px_1fr] gap-[11px] rounded-[10px] px-2 py-[11px] text-left ${
                        i > 0 ? "rounded-t-none border-t border-border" : ""
                      }`}
                    >
                      <span
                        className={`mt-px inline-flex h-[18px] w-[18px] items-center justify-center rounded-md border ${
                          t.done
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border"
                        }`}
                      >
                        {t.done && <Check size={12} strokeWidth={2.4} />}
                      </span>
                      <span>
                        <span
                          className={`text-[13px] font-semibold tracking-[-0.005em] ${
                            t.done
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {t.title}
                        </span>
                        <span className="mt-[7px] flex items-center gap-2 font-mono text-[10px] font-bold text-muted-foreground">
                          <span
                            className={`rounded-[5px] px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-[0.04em] ${
                              t.prio === "P1"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-warning/15 text-warning"
                            }`}
                          >
                            {t.prio}
                          </span>
                          <span className="mc-surface-3 rounded-[5px] px-[7px] py-0.5 uppercase tracking-[0.06em]">
                            {t.tag}
                          </span>
                          {t.due}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* høyre kolonne */}
            <div className="flex w-full min-w-0 flex-col gap-3.5 lg:flex-1">
              {/* Meldinger */}
              <section className="overflow-hidden rounded-2xl border border-border bg-card">
                <CardHeader icon={MessageSquare} title="Uleste meldinger">
                  <span className="ml-1 inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-accent px-[7px] font-mono text-[10px] font-extrabold text-accent-foreground">
                    {counts.uleste}
                  </span>
                </CardHeader>
                <div className="px-3 pb-3 pt-2">
                  <div className="px-1 pb-2 pt-3 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                    BEEPER · {beeper.reduce((s, m) => s + m.unread, 0)} ULESTE
                  </div>
                  {beeper.map((m, i) => (
                    <MsgRow
                      key={m.id}
                      m={m}
                      first={i === 0}
                      reply={reply}
                      setReply={setReply}
                      onOpen={() => setDrawer({ kind: "msg", item: m })}
                      onRead={(verb) => readMessage(m.id, verb)}
                    />
                  ))}
                  <div className="mt-1.5 border-t border-border px-1 pb-2 pt-3 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                    IMESSAGE · {imsg.reduce((s, m) => s + m.unread, 0)} ULESTE
                  </div>
                  {imsg.map((m, i) => (
                    <MsgRow
                      key={m.id}
                      m={m}
                      first={i === 0}
                      reply={reply}
                      setReply={setReply}
                      onOpen={() => setDrawer({ kind: "msg", item: m })}
                      onRead={(verb) => readMessage(m.id, verb)}
                    />
                  ))}
                </div>
              </section>

              {/* Notion-prosjekt */}
              <section className="overflow-hidden rounded-2xl border border-border bg-card">
                <CardHeader icon={BookOpen} title="Notion-prosjekt">
                  <span className="ml-auto font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    Notion ↗
                  </span>
                </CardHeader>
                <div className="p-4">
                  <div className="font-display text-[16px] font-bold tracking-[-0.015em] text-foreground">
                    {NOTION.project}
                  </div>
                  <div className="my-2 mb-3.5 flex items-center gap-3 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                    <span className="font-extrabold uppercase text-accent">
                      {NOTION.status}
                    </span>
                    <span>{NOTION.sprint}</span>
                  </div>
                  <div className="mc-surface-8 h-2 overflow-hidden rounded-full">
                    <span
                      className="block h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--accent)))]"
                      style={{ width: `${NOTION.progress}%` }}
                    />
                  </div>
                  <div className="mt-[7px] font-mono text-[10px] font-bold text-muted-foreground">
                    {NOTION.progress}% fullført
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {NOTION.columns.map((c) => (
                      <div
                        key={c.name}
                        className="mc-surface rounded-[10px] border border-border px-2 py-2.5 text-center"
                      >
                        <b className="block font-mono text-[18px] font-bold text-foreground">
                          {c.count}
                        </b>
                        <span className="mt-1 block font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                          {c.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* drawer */}
        <div
          className={`absolute inset-0 z-40 bg-[hsl(157_47%_6%/0.55)] transition-opacity duration-200 ${
            drawer ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setDrawer(null)}
        />
        <aside
          className={`absolute bottom-0 right-0 top-0 z-[45] flex w-[420px] max-w-[86%] flex-col border-l border-border bg-background shadow-[-20px_0_60px_rgba(0,0,0,0.4)] transition-transform duration-300 ${
            drawer ? "translate-x-0" : "translate-x-[103%]"
          }`}
        >
          {drawer && (
            <DrawerBody
              drawer={drawer}
              onClose={() => setDrawer(null)}
              onReadEmail={readEmail}
              onReadMessage={readMessage}
            />
          )}
        </aside>

        {/* toast */}
        {toast && (
          <div className="mc-toast absolute right-6 top-[74px] z-[60] flex items-center gap-2 rounded-xl bg-accent px-4 py-3 font-display text-[13px] font-bold text-accent-foreground shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
            <Check size={15} strokeWidth={2.4} /> {toast}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- handlingsknapp ---------- */
function ActBtn({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[30px] items-center gap-1.5 rounded-lg border px-[11px] font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] transition-colors ${
        primary
          ? "border-accent bg-accent text-accent-foreground hover:brightness-105"
          : "border-border bg-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon size={13} strokeWidth={1.5} /> {label}
    </button>
  );
}

/* ---------- meldings-rad ---------- */
function MsgRow({
  m,
  first,
  reply,
  setReply,
  onOpen,
  onRead,
}: {
  m: Message;
  first: boolean;
  reply: string | null;
  setReply: (id: string | null) => void;
  onOpen: () => void;
  onRead: (verb?: string) => void;
}) {
  return (
    <div
      onClick={onOpen}
      className={`mc-msgrow mc-row-hover grid cursor-pointer grid-cols-[32px_1fr] gap-[11px] rounded-[10px] px-2 py-3 ${
        first ? "" : "rounded-t-none border-t border-border"
      } ${m.fresh ? "mc-slidein" : ""}`}
    >
      <Avatar initials={m.initials} tone={m.fresh ? "lime" : "neutral"} size={32} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-[7px]">
          <span className="text-[13px] font-bold text-foreground">{m.name}</span>
          {m.unread > 1 && (
            <span className="inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-destructive px-[5px] font-mono text-[9px] font-extrabold text-accent-foreground">
              {m.unread}
            </span>
          )}
          <span className="mc-surface-2 rounded-[5px] px-[7px] py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            {m.source}
          </span>
          {m.fresh && (
            <span className="mc-fresh-glow h-[7px] w-[7px] rounded-full bg-accent" />
          )}
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            {m.when}
          </span>
        </div>
        <div className="mc-clamp-1 mt-[3px] text-[12px] leading-[1.45] text-muted-foreground">
          {m.snippet}
        </div>
        {reply === m.id ? (
          <ReplyBox
            onSend={() => {
              setReply(null);
              onRead(`Svar sendt · ${m.name}`);
            }}
          />
        ) : (
          <div className="mc-msg-acts flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <ActBtn
              primary
              icon={Reply}
              label="Svar"
              onClick={() => setReply(m.id)}
            />
            <ActBtn icon={Check} label="Les" onClick={() => onRead()} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- drawer-innhold ---------- */
function DrawerBody({
  drawer,
  onClose,
  onReadEmail,
  onReadMessage,
}: {
  drawer: Drawer;
  onClose: () => void;
  onReadEmail: (id: string, verb?: string) => void;
  onReadMessage: (id: string, verb?: string) => void;
}) {
  const { kind, item } = drawer;
  const title =
    kind === "email"
      ? item.subject
      : kind === "event"
        ? item.title
        : item.name;
  const eyebrow =
    kind === "email"
      ? "GMAIL"
      : kind === "event"
        ? "GOOGLE KALENDER"
        : (item.source || "MELDING").toUpperCase();
  const loc = kind === "event" ? item.loc : undefined;
  const body =
    "snippet" in item ? item.snippet : loc || "Ingen forhåndsvisning.";

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-accent">
          {eyebrow}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Lukk"
          className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-border text-foreground"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex-1 px-5 py-[22px]">
        <h3 className="m-0 font-display text-[19px] font-bold leading-[1.25] tracking-[-0.015em] text-foreground">
          {title}
        </h3>
        {kind === "email" && (
          <div className="mt-2 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
            {item.name} · {item.from} · {item.when}
          </div>
        )}
        {kind === "event" && (
          <div className="mt-2 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
            {item.allday ? "Hele dagen" : item.time} · {item.who}
          </div>
        )}
        {kind === "msg" && (
          <div className="mt-2 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
            {item.source} · {item.when} · {item.unread} uleste
          </div>
        )}
        <p className="mt-[18px] text-[14px] leading-[1.6] text-foreground opacity-90">
          {body}
        </p>
        {loc && (
          <div className="mt-3.5 inline-flex items-center gap-[7px] font-mono text-[11px] text-muted-foreground">
            <MapPin size={14} strokeWidth={1.5} /> {loc}
          </div>
        )}
        {(kind === "email" || kind === "msg") && (
          <ReplyBox
            placeholder={`Svar til ${item.name}…`}
            onSend={() => {
              if (kind === "email") onReadEmail(item.id, "Svar sendt");
              else onReadMessage(item.id, "Svar sendt");
              onClose();
            }}
          />
        )}
      </div>
      <div className="flex gap-2.5 border-t border-border px-5 py-4">
        {(kind === "email" || kind === "msg") && (
          <button
            type="button"
            onClick={() => {
              if (kind === "email") onReadEmail(item.id);
              else onReadMessage(item.id);
              onClose();
            }}
            className="inline-flex h-[42px] items-center gap-2 rounded-[11px] border border-accent bg-accent px-[18px] font-display text-[13px] font-semibold text-accent-foreground"
          >
            <Check size={15} strokeWidth={1.5} /> Merk som lest
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-[42px] items-center gap-2 rounded-[11px] border border-border bg-transparent px-[18px] font-display text-[13px] font-semibold text-foreground"
        >
          Lukk
        </button>
      </div>
    </>
  );
}
