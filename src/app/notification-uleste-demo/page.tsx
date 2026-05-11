/**
 * DEMO — Notification center · uleste
 * Bygd fra wireframe live-states/e5-notification-center-uleste.html
 * URL: /notification-uleste-demo
 */

import {
  ArrowRight,
  Award,
  CalendarCheck,
  ListChecks,
  MessageSquare,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type UnreadItem = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: React.ReactNode;
  sub: string;
  subMono?: boolean;
  time: string;
  actions?: { label: string; primary?: boolean }[];
};

const UNREAD: UnreadItem[] = [
  {
    icon: MessageSquare,
    iconBg: "bg-primary",
    iconColor: "text-primary-foreground",
    title: "Anders Kristiansen sendte deg en melding",
    sub: "“Foreslår plan-justering for uke 19-22 ...”",
    time: "3 min",
  },
  {
    icon: Award,
    iconBg: "bg-accent",
    iconColor: "text-accent-foreground",
    title: (
      <>
        Ny badge: <em className="italic">30-dagers streak</em>
      </>
    ),
    sub: "Du har trent jevnt i 30 dager. Største streaken din.",
    time: "42 min",
    actions: [
      { label: "Se profil", primary: true },
      { label: "Del" },
    ],
  },
  {
    icon: CalendarCheck,
    iconBg: "bg-[#F4C430]",
    iconColor: "text-[#3A2D08]",
    title: "Booking bekreftet · Mulligan Fredrikstad",
    sub: "Onsdag 13. mai · 17:00 · 80 min · Anders K",
    subMono: true,
    time: "1 t",
  },
  {
    icon: ListChecks,
    iconBg: "bg-primary",
    iconColor: "text-primary-foreground",
    title: "Plan-justering klar for godkjenning",
    sub: "AI har foreslått 3 endringer på uke 19-22 basert på siste runde.",
    time: "2 t",
    actions: [
      { label: "Se forslag", primary: true },
      { label: "Senere" },
    ],
  },
  {
    icon: TrendingUp,
    iconBg: "bg-[#16A34A]",
    iconColor: "text-white",
    title: "Runde-rapport klar · Bossum",
    sub: "78 (+6) · −1,8 SG approach · 12 GIR",
    subMono: true,
    time: "3 t",
  },
];

const CHIPS = [
  { label: "Alle", count: 12 },
  { label: "Uleste", count: 5, active: true },
  { label: "Achievements" },
  { label: "Plan" },
  { label: "Meldinger" },
];

export default function NotificationUlesteDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex justify-end px-4 py-8">
      <aside className="flex w-full max-w-[460px] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="border-b border-border px-6 pt-6 pb-5">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <strong className="text-foreground">5 uleste</strong> · filtrert
          </div>
          <div className="mt-1.5 flex items-start justify-between gap-4">
            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
              <em className="italic">Notifikasjoner</em>
            </h1>
            <button
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Lukk"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-6 py-3">
          {CHIPS.map((c) => (
            <button
              key={c.label}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                c.active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {c.label}
              {c.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-px font-mono text-[10px] font-semibold tabular-nums ${
                    c.active ? "bg-background/20 text-background" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {c.count}
                </span>
              )}
            </button>
          ))}
          <button className="ml-auto shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground">
            Marker alle lest
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {UNREAD.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="grid grid-cols-[40px_1fr_auto] items-start gap-3 px-6 py-3.5 border-b border-border bg-accent/5"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-md ${item.iconBg}`}>
                  <Icon size={18} strokeWidth={1.5} className={item.iconColor} />
                </span>
                <div>
                  <div className="text-sm font-medium leading-snug">{item.title}</div>
                  <div
                    className={`mt-1 text-xs leading-snug text-muted-foreground ${
                      item.subMono ? "font-mono uppercase tracking-[0.04em]" : ""
                    }`}
                  >
                    {item.sub}
                  </div>
                  {item.actions && (
                    <div className="mt-2.5 flex items-center gap-2">
                      {item.actions.map((a) => (
                        <button
                          key={a.label}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            a.primary
                              ? "bg-primary text-primary-foreground hover:opacity-90"
                              : "border border-border bg-card text-foreground hover:bg-secondary"
                          }`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    {item.time}
                  </span>
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                </div>
              </div>
            );
          })}

          {/* Empty footer */}
          <div className="px-8 py-12 text-center">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              5 av 5 uleste vist
            </div>
            <div className="mt-2 font-display text-[18px] italic text-muted-foreground">
              Du er fanget opp.
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-border bg-secondary/40 px-6 py-3.5">
          <button className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            <Settings size={14} strokeWidth={1.5} />
            Innstillinger
          </button>
          <button className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Vis arkiv
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </footer>
      </aside>
    </div>
  );
}
