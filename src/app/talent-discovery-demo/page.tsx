/**
 * DEMO — Talent · Discovery-feed
 * Spec: docs/spec/talent/09-discovery-feed.md
 * URL: /talent-discovery-demo
 *
 * Scout-tidslinje med agent-foreslåtte spillere på tvers av klubber
 * og regioner. Climbers, breakouts, CI95-outliers, early-movers,
 * akselererende. Watchlist i sticky høyrekolonne.
 */

import {
  Star,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Clock,
  Gauge,
  ArrowLeft,
  Filter,
  UserPlus,
} from "lucide-react";

type SignalTone = "primary" | "accent" | "success" | "warning" | "info";

type FeedItem = {
  id: string;
  type: "climber" | "breakout" | "ci95" | "early" | "accel";
  player: { name: string; club: string; age: number; hcp: string };
  date: string;
  tone: SignalTone;
};

const FEED: FeedItem[] = [
  {
    id: "1",
    type: "climber",
    player: { name: "Markus Roinås Pedersen", club: "GFGK · Region Øst", age: 17, hcp: "+2,4" },
    date: "08. mai 2026",
    tone: "primary",
  },
  {
    id: "2",
    type: "climber",
    player: { name: "Ida Sletten", club: "Bærum GK · Region Øst", age: 16, hcp: "+0,8" },
    date: "07. mai 2026",
    tone: "primary",
  },
  {
    id: "3",
    type: "breakout",
    player: { name: "Sofie Lien", club: "Sola GK · Region Vest", age: 15, hcp: "1,2" },
    date: "06. mai 2026",
    tone: "success",
  },
  {
    id: "4",
    type: "ci95",
    player: { name: "Eirik Lund", club: "Mulligan · Region Øst", age: 18, hcp: "+1,6" },
    date: "05. mai 2026",
    tone: "warning",
  },
  {
    id: "5",
    type: "early",
    player: { name: "Henrik Lassen", club: "Bossum · Region Øst", age: 13, hcp: "4,8" },
    date: "04. mai 2026",
    tone: "info",
  },
  {
    id: "6",
    type: "accel",
    player: { name: "Oskar Vinje", club: "Drammen GK · Region Øst", age: 14, hcp: "2,4" },
    date: "03. mai 2026",
    tone: "accent",
  },
];

const WATCHLIST: { initials: string; name: string; meta: string; tone: SignalTone }[] = [
  { initials: "MR", name: "Markus Roinås", meta: "GFGK · climber", tone: "success" },
  { initials: "AN", name: "Anders Nedrum", meta: "Bossum · akselererende", tone: "accent" },
  { initials: "JV", name: "Joachim Vik", meta: "GFGK · CI95", tone: "warning" },
  { initials: "IS", name: "Ida Sletten", meta: "Bærum · climber", tone: "primary" },
  { initials: "SL", name: "Sofie Lien", meta: "Sola · breakout", tone: "accent" },
];

const FILTERS = [
  "Alle typer",
  "Climbers",
  "Breakouts",
  "CI95-outliers",
  "Early-movers",
  "Akselererende",
];

export default function TalentDiscoveryDemo() {
  return (
    <div className="min-h-screen bg-[var(--color-card,#FFFFFF)] text-foreground">
      {/* Header */}
      <header className="grid grid-cols-[1fr_auto] items-end gap-6 border-b border-border pb-5 pt-1 mb-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Scout · Discovery
          </span>
          <h1 className="mt-1 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
            <em className="font-medium italic">Hvem</em> skjer det noe med?
          </h1>
          <p className="mt-1.5 max-w-[520px] text-[13px] leading-[1.5] text-muted-foreground">
            Agent-foreslåtte spillere fra klubber over hele landet, sortert på
            velocity siste 7 dager.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Tilbake
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Min watchlist
            <span className="ml-1 rounded-full bg-primary-foreground/15 px-1.5 text-[11px] tabular-nums">
              12
            </span>
          </button>
        </div>
      </header>

      {/* Action-strip */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Signaler siste 7 dager
        </span>
        <ActionItem tone="info">
          <b>12</b> nye signaler
        </ActionItem>
        <ActionItem tone="success">
          <b>4</b> climbers
        </ActionItem>
        <ActionItem tone="accent">
          <b>3</b> breakouts
        </ActionItem>
        <ActionItem tone="warn">
          <b>5</b> over CI95
        </ActionItem>
        <ActionItem tone="info">
          <b>2</b> early-movers
        </ActionItem>
        <button className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
          <Filter className="h-4 w-4" strokeWidth={1.5} />
          Filtrer signaler
        </button>
      </div>

      {/* Filter-row */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f, i) => (
          <button
            key={f}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              i === 0
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          Siste 7 dager · sortert: Velocity
        </span>
      </div>

      {/* Two-pane: feed + watchlist */}
      <div className="grid grid-cols-[1fr_380px] gap-5">
        {/* Timeline feed */}
        <section className="relative">
          <div className="absolute left-[14px] top-2 bottom-2 w-px bg-border" aria-hidden />
          <div className="flex flex-col gap-3">
            {FEED.map((item) => (
              <TimelineCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Watchlist */}
        <aside className="sticky top-4 self-start">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Watchlist
                </div>
                <div className="mt-1 font-display text-[18px] font-semibold">
                  <em className="font-medium italic">12 spillere</em>
                </div>
              </div>
              <Star className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} />
            </div>
            <ul className="flex flex-col gap-2">
              {WATCHLIST.map((w) => (
                <WatchRow key={w.name} {...w} />
              ))}
            </ul>
            <button className="mt-3 w-full rounded-md border border-border bg-transparent py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
              + 7 til
            </button>

            <div className="mt-5 border-t border-[var(--line-soft,#EFEDE6)] pt-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Foreslått for deg
              </div>
              <ul className="mt-2.5 flex flex-col gap-2">
                <WatchRow initials="AK" name="Anders Kristiansen" meta="GFGK · ny i pool" tone="info" />
                <WatchRow initials="OV" name="Oskar Vinje" meta="Drammen · akselererende" tone="accent" />
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TimelineCard({ item }: { item: FeedItem }) {
  const meta = SIGNAL_META[item.type];
  return (
    <article className="relative grid grid-cols-[32px_1fr] gap-3">
      {/* Dot */}
      <div className="relative pt-5">
        <div
          className="absolute left-[6px] top-5 h-4 w-4 rounded-full ring-4 ring-[var(--color-card,#FFFFFF)]"
          style={{ background: dotColor(item.tone) }}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar initials={initialsOf(item.player.name)} primary={item.tone === "primary"} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[18px] font-semibold leading-tight">
                  {item.player.name}
                </span>
                <Pill tone={item.tone}>{meta.label}</Pill>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                <span>{item.player.club}</span>
                <span className="text-[var(--ink-disabled,#C4C0B8)]">·</span>
                <span>{item.player.age} år</span>
                <span className="text-[var(--ink-disabled,#C4C0B8)]">·</span>
                <span>HCP {item.player.hcp}</span>
                <span className="text-[var(--ink-disabled,#C4C0B8)]">·</span>
                <span className="font-mono">{item.date}</span>
              </div>
            </div>
          </div>
          <button
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Pin"
          >
            <Star className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body — varies by type */}
        {item.type === "climber" && (
          <div className="grid grid-cols-[1fr_180px] items-center gap-5">
            <div>
              <div className="font-display text-[28px] font-medium italic leading-none text-primary">
                ↑ 47 plasser
              </div>
              <p className="mt-2 text-[13px] leading-[1.5] text-muted-foreground">
                {item.player.name.split(" ")[0]} har klatret <b className="text-foreground">47 plasser</b>{" "}
                på national-rangeringen siste 60 dager. Steady gevinst, ingen volatilitet.
              </p>
            </div>
            <Sparkline tone={item.tone} />
          </div>
        )}
        {item.type === "breakout" && (
          <>
            <p className="text-[13px] leading-[1.5] text-muted-foreground">
              {item.player.name.split(" ")[0]} hadde sitt{" "}
              <b className="text-foreground">beste event noensinne</b> i Sørlandsåpningen — 3,8σ over
              rolling-snittet på siste 8 events.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill tone="success">Score 67</Pill>
              <Pill tone="info">T-1 av 78</Pill>
              <Pill tone="info">02. mai 2026</Pill>
            </div>
          </>
        )}
        {item.type === "ci95" && (
          <p className="text-[13px] leading-[1.5] text-muted-foreground">
            {item.player.name.split(" ")[0]} ligger nå <b className="text-foreground">over CI95</b>{" "}
            på kohort-density-modellen — outlier mot Region Øst-snittet for klasse A.
          </p>
        )}
        {item.type === "early" && (
          <p className="text-[13px] leading-[1.5] text-muted-foreground">
            Debuterte i Junior Tour ved <b className="text-foreground">13 år</b> — 1,8 år tidligere
            enn medianen. Tidlig eksponering, lavt volum, høyt potensiale.
          </p>
        )}
        {item.type === "accel" && (
          <p className="text-[13px] leading-[1.5] text-muted-foreground">
            HCP-akselerasjon på <b className="text-foreground">−2,8 slag/år</b> — i topp 5 % av
            kullet. Trenden er rein, ingen plateau-signaler i SG-data.
          </p>
        )}

        {/* CTA */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
            Åpne profil
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Inviter til coaching
          </button>
        </div>
      </div>
    </article>
  );
}

const SIGNAL_META: Record<FeedItem["type"], { label: string; icon: React.ReactNode }> = {
  climber: { label: "Climber", icon: <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  breakout: { label: "Breakout", icon: <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  ci95: { label: "CI95-outlier", icon: <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  early: { label: "Early-mover", icon: <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  accel: { label: "Akselererende", icon: <Gauge className="h-3.5 w-3.5" strokeWidth={1.5} /> },
};

function dotColor(tone: SignalTone): string {
  switch (tone) {
    case "primary":
      return "var(--color-pyr-fys, #005840)";
    case "accent":
      return "var(--color-pyr-slag, #D1F843)";
    case "success":
      return "#1A7D56";
    case "warning":
      return "#B8852A";
    case "info":
      return "#005840";
  }
}

function initialsOf(name: string): string {
  const parts = name.split(" ");
  return (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
}

function Avatar({ initials, primary }: { initials: string; primary?: boolean }) {
  return (
    <div
      className={`grid h-11 w-11 place-items-center rounded-full font-display text-[16px] font-semibold ${
        primary ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
      }`}
    >
      {initials}
    </div>
  );
}

function Pill({ tone, children }: { tone: SignalTone; children: React.ReactNode }) {
  const styles: Record<SignalTone, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent text-accent-foreground",
    success: "bg-[#E5F1EA] text-[#1A7D56]",
    warning: "bg-[#FFF0D6] text-[#B8852A]",
    info: "bg-primary/8 text-primary",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function ActionItem({
  tone,
  children,
}: {
  tone?: "info" | "warn" | "success" | "accent";
  children: React.ReactNode;
}) {
  const bg =
    tone === "info"
      ? "bg-primary/8 text-primary"
      : tone === "warn"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : tone === "success"
          ? "bg-[#E5F1EA] text-[#1A7D56]"
          : tone === "accent"
            ? "bg-accent/30 text-foreground"
            : "bg-secondary text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium ${bg}`}
    >
      {children}
    </span>
  );
}

function WatchRow({
  initials,
  name,
  meta,
  tone,
}: {
  initials: string;
  name: string;
  meta: string;
  tone: SignalTone;
}) {
  return (
    <li className="grid grid-cols-[32px_1fr_auto] items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-secondary">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary font-display text-[12px] font-semibold">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold leading-tight">{name}</div>
        <div className="truncate text-[11px] leading-tight text-muted-foreground">{meta}</div>
      </div>
      <Pill tone={tone}>·</Pill>
    </li>
  );
}

function Sparkline({ tone }: { tone: SignalTone }) {
  const stroke = tone === "primary" ? "var(--color-pyr-fys, #005840)" : "#1A7D56";
  return (
    <svg viewBox="0 0 180 56" className="h-14 w-full" aria-hidden>
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        points="2,48 22,44 42,40 62,38 82,30 102,28 122,20 142,16 162,10 178,6"
      />
      <circle cx="178" cy="6" r="2.5" fill={stroke} />
    </svg>
  );
}
