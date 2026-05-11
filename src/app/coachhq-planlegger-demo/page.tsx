/**
 * CoachHQ — Sesjon-planlegger · uke 20
 * Bygd fra wireframe/design-files-v2/screens/59-coachhq-sesjon-planlegger.html
 * URL: /coachhq-planlegger-demo
 */

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

type EventType = "range" | "video" | "put" | "live" | "book";

type CalEvent = {
  who: string;
  what: string;
  time: string;
  top: number;
  height: number;
  type: EventType;
  now?: boolean;
};

const days: { label: string; date: string; today?: boolean; events: CalEvent[] }[] = [
  {
    label: "Ma", date: "12",
    events: [
      { who: "Linnea H.", what: "Drill · putting", time: "09:00–10:00", top: 50, height: 60, type: "range" },
      { who: "Markus P.", what: "Video-review", time: "12:00–13:00", top: 200, height: 50, type: "video" },
      { who: "Sofie R.", what: "Range · 100 m", time: "16:00–17:00", top: 400, height: 60, type: "range" },
    ],
  },
  {
    label: "Ti", date: "13",
    events: [
      { who: "Klubb-møte", what: "GFGK styre", time: "10:00–12:00", top: 100, height: 100, type: "book" },
      { who: "Tobias F.", what: "Range", time: "14:00–15:00", top: 300, height: 50, type: "range" },
      { who: "Daniel M.", what: "Range", time: "17:00–18:00", top: 450, height: 50, type: "range" },
    ],
  },
  {
    label: "On", date: "14", today: true,
    events: [
      { who: "Eira H.", what: "Video · approach", time: "09:00–10:00", top: 50, height: 50, type: "video" },
      { who: "Mathilde B.", what: "Putting", time: "11:00–12:00", top: 150, height: 50, type: "put" },
      { who: "Markus P.", what: "Range · 125 m blokk", time: "14:00–15:00", top: 300, height: 60, type: "range", now: true },
      { who: "Mathilde B.", what: "Putting · 4 m", time: "16:00–17:00", top: 400, height: 50, type: "put" },
      { who: "Sondre K.", what: "Video R2-review", time: "18:00–19:00", top: 500, height: 50, type: "video" },
    ],
  },
  {
    label: "To", date: "15",
    events: [
      { who: "Tobias F.", what: "Range", time: "10:00–11:00", top: 100, height: 60, type: "range" },
      { who: "Sondre K.", what: "Tee-shots", time: "12:00–13:00", top: 200, height: 50, type: "video" },
      { who: "Lunsj + adm", what: "privat", time: "15:00–17:00", top: 350, height: 100, type: "book" },
    ],
  },
  {
    label: "Fr", date: "16",
    events: [
      { who: "Sofie R.", what: "Range", time: "09:00–10:00", top: 50, height: 60, type: "range" },
      { who: "Eira H.", what: "Video · putt", time: "14:00–15:00", top: 300, height: 50, type: "video" },
    ],
  },
  {
    label: "Lø", date: "17",
    events: [
      { who: "Live · Kongsberg", what: "U18 turn · Sondre + Tobias", time: "08:00–17:00 (on-course)", top: 0, height: 480, type: "live" },
    ],
  },
];

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function CoachHqPlanleggerDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          CoachHQ · Planlegger
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Slik ser <em className="italic text-primary">uka di</em> ut.
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          22 av 28 mulige timer booket. Agent har funnet 4 nye åpninger der spillere venter på oppfølging.
        </p>
      </header>

      {/* Toolbar */}
      <div className="mb-3.5 flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button className="grid h-7 w-7 place-items-center rounded-sm border border-border text-muted-foreground">
            <ChevronLeft size={14} strokeWidth={1.5} />
          </button>
          <button className="rounded-sm border border-border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            I dag
          </button>
          <button className="grid h-7 w-7 place-items-center rounded-sm border border-border text-muted-foreground">
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>
        <div className="font-display text-[18px] font-medium tracking-tight">Uke 20 · 12.–18. mai 2026</div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-border bg-card">
            {["Dag", "Uke", "Mnd"].map((s, i) => (
              <div
                key={s}
                className={`cursor-pointer border-r border-border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] last:border-r-0 ${i === 1 ? "bg-foreground text-background" : "text-muted-foreground"}`}
              >
                {s}
              </div>
            ))}
          </div>
          <button className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground">
            <Plus size={14} strokeWidth={1.5} />
            Ny sesjon
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] items-start gap-5">
        {/* Calendar */}
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-border bg-[var(--surface-alt,#F1EEE5)]">
            <div className="border-r border-border" />
            {days.map((d) => (
              <div
                key={d.label}
                className={`border-r border-border p-2.5 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.06em] last:border-r-0 ${d.today ? "bg-primary/6 text-primary" : "text-muted-foreground"}`}
              >
                {d.label}
                <span className={`mt-0.5 block font-display text-[18px] font-medium tracking-tight ${d.today ? "text-primary" : "text-foreground"}`}>
                  {d.date}
                </span>
              </div>
            ))}
          </div>
          <div className="relative grid min-h-[560px] grid-cols-[60px_repeat(6,1fr)]">
            <div className="flex flex-col border-r border-border bg-[var(--surface-alt,#F1EEE5)]">
              {timeSlots.map((t, i) => (
                <div
                  key={t}
                  className={`min-h-[50px] flex-1 px-2 text-right font-mono text-[9px] tracking-[0.04em] text-muted-foreground ${i !== 0 ? "border-t border-border" : ""}`}
                >
                  {t}
                </div>
              ))}
            </div>
            {days.map((d) => (
              <div
                key={d.label + d.date}
                className={`relative min-h-[560px] border-r border-border last:border-r-0 ${d.today ? "bg-primary/2" : ""}`}
              >
                {timeSlots.map((_, i) => (
                  <div key={i} className={`h-[50px] ${i !== 0 ? "border-t border-border" : ""}`} />
                ))}
                {d.events.map((ev, i) => (
                  <CalEventBox key={i} event={ev} />
                ))}
                {d.today && <NowLine top={368} />}
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <SideCard title="Agent-forslag" sub="4 nye">
            <AgentSug
              title="Jonas N. trenger sesjon"
              text="10 dgr siden sist. Foreslår on 14.05 · 17:00 (range, GFGK) — Jonas sin foretrukne tid."
              when="Sesjons-agent · 14.05"
            />
            <AgentSug
              title="Markus + Eira · gruppe-økt"
              text="Begge har approach 100 m blokk denne uka. Foreslår å samkjøre to 14.05 · 11:00."
              when="Sesjons-agent · 14.05"
              cta="Se"
            />
            <AgentSug
              title="Erik L. — comeback-økt"
              text="Fysio Mia signaliserer retur 24.05. Foreslår intro-økt fr 23.05 · 12:00."
              when="Auto · 13.05"
            />
          </SideCard>

          <SideCard title="Uken i tall">
            <Stat label="Bookede timer" value="22 / 28" />
            <Stat label="Range" value="11 (50 %)" />
            <Stat label="Video-review" value="5 (23 %)" />
            <Stat label="Putting" value="2 (9 %)" />
            <Stat label="On-course" value="9 t (lø)" />
            <Stat label="Frie luker" value="6 ledige" />
          </SideCard>

          <SideCard title="Sesjons-typer">
            <Legend color="bg-primary/30 border-l-primary" label="Range" count="11" />
            <Legend color="bg-[rgba(184,133,42,0.30)] border-l-[#B8852A]" label="Video-review" count="5" />
            <Legend color="bg-[rgba(45,107,76,0.30)] border-l-[#2D6B4C]" label="Putting" count="2" />
            <Legend color="bg-[rgba(176,68,68,0.30)] border-l-[#A32D2D]" label="On-course / Live" count="1" />
            <Legend color="bg-[rgba(58,79,92,0.30)] border-l-[#3a4f5c]" label="Møte / adm" count="2" />
          </SideCard>
        </aside>
      </div>
    </div>
  );
}

function CalEventBox({ event }: { event: CalEvent }) {
  const styles: Record<EventType, string> = {
    range: "bg-primary/10 border-l-primary",
    video: "bg-[rgba(184,133,42,0.10)] border-l-[#B8852A]",
    put: "bg-[rgba(45,107,76,0.10)] border-l-[#2D6B4C]",
    live: "bg-[rgba(176,68,68,0.10)] border-l-[#A32D2D]",
    book: "bg-[rgba(58,79,92,0.10)] border-l-[#3a4f5c]",
  };
  return (
    <div
      className={`absolute left-1 right-1 flex flex-col gap-px overflow-hidden rounded-sm border-l-[3px] px-2 py-1.5 leading-tight ${styles[event.type]} ${event.now ? "shadow-[0_0_0_2px_var(--brand-primary,#005840)]" : ""}`}
      style={{ top: event.top, height: event.height }}
    >
      <span className="text-[11px] font-semibold text-foreground">{event.who}</span>
      <span className="font-mono text-[9px] tracking-[0.02em] text-muted-foreground">{event.what}</span>
      <span className="mt-0.5 font-mono text-[9px] tracking-[0.04em] text-muted-foreground">{event.time}</span>
    </div>
  );
}

function NowLine({ top }: { top: number }) {
  return (
    <div className="pointer-events-none absolute left-0 right-0 z-10 h-0.5 bg-[#A32D2D]" style={{ top }}>
      <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#A32D2D]" />
      <span className="absolute -left-12 -top-1.5 font-mono text-[9px] font-bold tracking-[0.04em] text-[#A32D2D]">
        NÅ 14:18
      </span>
    </div>
  );
}

function SideCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-card p-4">
      <h4 className="mb-3 flex items-baseline justify-between font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {title}
        {sub && <small className="font-mono text-[10px] font-medium normal-case tracking-[0.02em] text-muted-foreground">{sub}</small>}
      </h4>
      {children}
    </section>
  );
}

function AgentSug({ title, text, when, cta = "Aksepter" }: { title: string; text: string; when: string; cta?: string }) {
  return (
    <div className="mb-2.5 rounded-sm border-l-[3px] border-accent bg-[rgba(225,206,123,0.16)] px-3 py-2.5 text-[12px] leading-relaxed last:mb-0">
      <b className="mb-0.5 block font-semibold text-foreground">{title}</b>
      {text}
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] font-semibold tracking-[0.02em] text-[#7d5814]">
        <span>{when}</span>
        <span className="cursor-pointer rounded-sm bg-foreground px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-background">
          {cta}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border py-1.5 text-[12px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <b className="font-mono font-semibold tracking-[0.02em]">{value}</b>
    </div>
  );
}

function Legend({ color, label, count }: { color: string; label: string; count: string }) {
  return (
    <div className="flex items-center gap-2 py-1 text-[12px] text-muted-foreground">
      <div className={`h-3 w-3 rounded-r-sm border-l-[3px] ${color}`} />
      {label}
      <b className="ml-auto font-mono text-[10px] font-semibold tracking-[0.04em] text-muted-foreground">{count}</b>
    </div>
  );
}
