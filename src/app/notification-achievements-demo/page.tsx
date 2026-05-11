/**
 * DEMO — Notification center · achievements
 * Bygd fra wireframe live-states/e5-notification-center-achievements.html
 * URL: /notification-achievements-demo
 */

import { ArrowRight, Award, Compass, Globe, Settings, Star, Trophy, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Rarity = "SJELDEN" | "VANLIG" | "PERSONLIG";

type AchievementItem = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: React.ReactNode;
  sub: string;
  rarity: Rarity;
  rarityNote: string;
  time: string;
  unread?: boolean;
};

const ITEMS: AchievementItem[] = [
  {
    icon: Award,
    iconBg: "bg-accent",
    iconColor: "text-accent-foreground",
    title: (
      <>
        Ny badge: <em className="italic">30-dagers streak</em>
      </>
    ),
    sub: "Trent jevnt 30 dager — lengste streaken din til nå.",
    rarity: "SJELDEN",
    rarityNote: "11 % av brukere",
    time: "42 min",
    unread: true,
  },
  {
    icon: Star,
    iconBg: "bg-[#F4C430]",
    iconColor: "text-[#3A2D08]",
    title: (
      <>
        Personlig rekord: <em className="italic">14 reps streak</em>
      </>
    ),
    sub: "Beste streak på 7-iron i putte-økt onsdag.",
    rarity: "SJELDEN",
    rarityNote: "Forrige rekord 11",
    time: "i går",
    unread: true,
  },
  {
    icon: Trophy,
    iconBg: "bg-[#16A34A]",
    iconColor: "text-white",
    title: (
      <>
        Badge: <em className="italic">Første challenge fullført</em>
      </>
    ),
    sub: "“10 m putt-mester” — du landet på 7. plass.",
    rarity: "VANLIG",
    rarityNote: "62 % av brukere",
    time: "3 dgr",
  },
  {
    icon: Globe,
    iconBg: "bg-primary",
    iconColor: "text-primary-foreground",
    title: (
      <>
        Badge: <em className="italic">Bossum bedre enn forrige</em>
      </>
    ),
    sub: "78 (+6) — 4 slag bedre enn samme kurs i april.",
    rarity: "PERSONLIG",
    rarityNote: "Utleest automatisk",
    time: "5 dgr",
  },
];

const CHIPS = [
  { label: "Alle", count: 12 },
  { label: "Uleste", count: 5 },
  { label: "Achievements", count: 4, active: true },
  { label: "Plan" },
  { label: "Meldinger" },
];

function rarityPill(r: Rarity): string {
  if (r === "SJELDEN") return "bg-accent/30 text-foreground";
  if (r === "VANLIG") return "bg-secondary text-muted-foreground";
  return "bg-primary/10 text-primary";
}

export default function NotificationAchievementsDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex justify-end px-4 py-8">
      <aside className="flex w-full max-w-[460px] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="border-b border-border px-6 pt-6 pb-5">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <strong className="text-foreground">3 nye badges</strong> · achievements i mai
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
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {ITEMS.map((item, i) => {
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
                  <div className="mt-1 text-xs leading-snug text-muted-foreground">{item.sub}</div>
                  <div className="mt-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    <span className={`rounded-full px-2 py-0.5 ${rarityPill(item.rarity)}`}>
                      {item.rarity}
                    </span>
                    <span className="uppercase">{item.rarityNote}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    {item.time}
                  </span>
                  {item.unread && <span className="inline-block h-2 w-2 rounded-full bg-primary" />}
                </div>
              </div>
            );
          })}

          {/* Progresjon */}
          <div className="border-t border-border px-8 py-8 text-center">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Progresjon
            </div>
            <div className="mt-2 font-display text-[20px] italic leading-tight text-foreground">
              3 badges igjen til <em>“Måneds-master”</em>.
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">
              Trenger 6 økter til denne måneden.
            </div>
            <div className="mt-3.5 h-2 overflow-hidden rounded-sm bg-border">
              <div
                className="h-full rounded-sm bg-accent"
                style={{ width: "62%" }}
              />
            </div>
            <div className="mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground tabular-nums">
              8 / 13 økter · 62 %
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
            <Compass size={14} strokeWidth={1.5} />
            Vis alle badges
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </footer>
      </aside>
    </div>
  );
}
