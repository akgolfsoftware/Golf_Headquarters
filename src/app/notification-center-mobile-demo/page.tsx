/**
 * DEMO — Notification Center (mobile)
 * Bygd fra wireframe/_extracted/live-states/e5-notification-center-mobile.html
 * URL: /notification-center-mobile-demo
 */

import {
  ArrowRight,
  Calendar,
  CreditCard,
  LineChart,
  MessageSquare,
  Trophy,
  Activity,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Filter = { key: string; label: string; count?: number; active: boolean };

const FILTERS: Filter[] = [
  { key: "alle", label: "Alle", count: 12, active: true },
  { key: "uleste", label: "Uleste", count: 5, active: false },
  { key: "achievements", label: "Achievements", active: false },
  { key: "plan", label: "Plan", active: false },
  { key: "meldinger", label: "Meldinger", active: false },
];

type Item = {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  sub: string;
  subMono?: boolean;
  time: string;
  unread: boolean;
};

const ITEMS: Item[] = [
  {
    id: "1",
    icon: MessageSquare,
    iconBg: "var(--color-primary, #005840)",
    iconColor: "#fff",
    title: "Anders K sendte deg en melding",
    sub: "“Foreslår plan-justering for uke 19 …”",
    time: "3 min",
    unread: true,
  },
  {
    id: "2",
    icon: Trophy,
    iconBg: "#D1F843",
    iconColor: "#005840",
    title: "Ny badge: 30-dagers streak",
    sub: "Lengste streaken din til nå.",
    time: "42 min",
    unread: true,
  },
  {
    id: "3",
    icon: Calendar,
    iconBg: "#F4C430",
    iconColor: "#3A2D08",
    title: "Booking bekreftet",
    sub: "ONS 13. MAI · 17:00 · 80 MIN",
    subMono: true,
    time: "1 t",
    unread: true,
  },
  {
    id: "4",
    icon: Activity,
    iconBg: "#005840",
    iconColor: "#fff",
    title: "Plan-justering klar",
    sub: "3 endringer på uke 19–22.",
    time: "2 t",
    unread: true,
  },
  {
    id: "5",
    icon: LineChart,
    iconBg: "#16A34A",
    iconColor: "#fff",
    title: "Runde-rapport klar · Bossum",
    sub: "78 (+6) · -1,8 SG APPROACH",
    subMono: true,
    time: "3 t",
    unread: true,
  },
  {
    id: "6",
    icon: CreditCard,
    iconBg: "#5E5C57",
    iconColor: "#fff",
    title: "Faktura sendt · 1 600 kr",
    sub: "FORFALL 25. MAI",
    subMono: true,
    time: "2 d",
    unread: false,
  },
];

export default function NotificationCenterMobileDemo() {
  return (
    <div className="min-h-screen w-full bg-foreground/85 flex justify-center">
      <div className="relative w-full max-w-[420px] min-h-screen bg-card flex flex-col">
        {/* Header */}
        <header className="border-b border-border px-4 pt-4 pb-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <strong className="text-foreground">5 uleste</strong> · siste 7 dager
          </div>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h1 className="font-display text-[22px] font-semibold leading-tight tracking-tight text-foreground">
              Notifikasjoner
            </h1>
            <button
              className="grid h-11 w-11 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Lukk"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Filter chips */}
        <div className="border-b border-border px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={
                  f.active
                    ? "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 font-sans text-[12px] font-medium text-primary-foreground"
                    : "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-sans text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {f.label}
                {typeof f.count === "number" ? (
                  <span
                    className={
                      f.active
                        ? "rounded-full bg-primary-foreground/15 px-1.5 py-0.5 font-mono text-[10px] tabular-nums"
                        : "rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[10px] tabular-nums"
                    }
                  >
                    {f.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 divide-y divide-border">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.id}
                className={
                  it.unread
                    ? "flex gap-3 px-4 py-3 bg-accent/[0.04]"
                    : "flex gap-3 px-4 py-3"
                }
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-md"
                  style={{ background: it.iconBg, color: it.iconColor }}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-sans text-[13px] font-semibold text-foreground">
                    {it.title}
                  </div>
                  <div
                    className={
                      it.subMono
                        ? "mt-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground"
                        : "mt-0.5 font-sans text-[12px] text-muted-foreground"
                    }
                  >
                    {it.sub}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground tabular-nums">
                    {it.time}
                  </div>
                  {it.unread ? (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-border px-4 py-3">
          <button className="inline-flex h-11 items-center rounded-md px-3 font-sans text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            Innstillinger
          </button>
          <button className="inline-flex h-11 items-center gap-2 rounded-md px-3 font-sans text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
            Arkiv
            <ArrowRight size={13} strokeWidth={1.75} />
          </button>
        </footer>
      </div>
    </div>
  );
}
