/**
 * DEMO — Notification center
 * Bygd fra wireframe live-states/e5-notification-center-default.html
 * URL: /notification-center-demo
 */

import {
  ArrowRight,
  CalendarCheck,
  CheckSquare,
  CreditCard,
  ListChecks,
  MessageSquare,
  Settings,
  Star,
  Trophy,
  TrendingUp,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NotificationItem = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: React.ReactNode;
  sub: string;
  subMono?: boolean;
  time: string;
  unread?: boolean;
  actions?: { label: string; primary?: boolean }[];
};

type Group = { label: string; items: NotificationItem[] };

const GROUPS: Group[] = [
  {
    label: "I dag",
    items: [
      {
        icon: MessageSquare,
        iconBg: "bg-primary",
        iconColor: "text-primary-foreground",
        title: "Anders Kristiansen sendte deg en melding",
        sub: '"Foreslår plan-justering for uke 19-22 ..."',
        time: "3 min",
        unread: true,
      },
      {
        icon: Trophy,
        iconBg: "bg-accent",
        iconColor: "text-accent-foreground",
        title: (
          <>
            Ny badge: <em className="italic">30-dagers streak</em>
          </>
        ),
        sub: "Du har trent jevnt i 30 dager. Største streaken din.",
        time: "42 min",
        unread: true,
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
        unread: true,
      },
      {
        icon: ListChecks,
        iconBg: "bg-primary",
        iconColor: "text-primary-foreground",
        title: "Plan-justering klar for godkjenning",
        sub: "AI har foreslått 3 endringer på uke 19-22 basert på siste runde.",
        time: "2 t",
        unread: true,
        actions: [
          { label: "Se forslag", primary: true },
          { label: "Senere" },
        ],
      },
      {
        icon: TrendingUp,
        iconBg: "bg-[#16A34A]",
        iconColor: "text-white",
        title: "Runde-rapport klar · Borre",
        sub: "78 (+6) · −1,8 SG approach · 12 GIR",
        subMono: true,
        time: "3 t",
        unread: true,
      },
    ],
  },
  {
    label: "I går",
    items: [
      {
        icon: Star,
        iconBg: "bg-accent",
        iconColor: "text-accent-foreground",
        title: 'Julie S leder challenge "10 m putt-mester"',
        sub: "17 / 20 scored · du er nr 7 · 5 igjen",
        subMono: true,
        time: "i går",
      },
      {
        icon: CreditCard,
        iconBg: "bg-[#5E5C57]",
        iconColor: "text-white",
        title: "Faktura sendt · 1 600 kr",
        sub: "AK Golf Academy · forfall 25. mai",
        subMono: true,
        time: "2 dgr",
      },
    ],
  },
  {
    label: "Tidligere denne uka",
    items: [
      {
        icon: MessageSquare,
        iconBg: "bg-primary",
        iconColor: "text-primary-foreground",
        title: "Anders K kommenterte runden din",
        sub: '"Solid på par 3 i dag — bra rytme."',
        time: "3 dgr",
      },
      {
        icon: CheckSquare,
        iconBg: "bg-primary",
        iconColor: "text-primary-foreground",
        title: "Sesongplan publisert",
        sub: "2026-plan · 5 perioder · synk til kalender",
        subMono: true,
        time: "5 dgr",
      },
    ],
  },
];

const CHIPS = [
  { label: "Alle", count: 12, active: true },
  { label: "Uleste", count: 5 },
  { label: "Achievements" },
  { label: "Plan" },
  { label: "Meldinger" },
];

export default function NotificationCenterDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex justify-end px-4 py-8">
      <aside className="flex w-full max-w-[460px] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="border-b border-border px-6 pt-6 pb-5">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <strong className="text-foreground">5 uleste</strong> · siste 7 dager · 12 totalt
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
          {GROUPS.map((group) => (
            <div key={group.label}>
              <div className="px-6 pt-5 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                {group.label}
              </div>
              {group.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className={`grid grid-cols-[40px_1fr_auto] items-start gap-3 px-6 py-3.5 border-b border-border ${
                      item.unread ? "bg-accent/5" : ""
                    }`}
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-md ${item.iconBg}`}>
                      <Icon size={18} strokeWidth={1.5} className={item.iconColor} />
                    </span>
                    <div>
                      <div className="text-sm font-medium leading-snug">{item.title}</div>
                      <div
                        className={`mt-1 text-xs leading-snug text-muted-foreground ${item.subMono ? "font-mono uppercase tracking-[0.04em]" : ""}`}
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
                      {item.unread && (
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
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
