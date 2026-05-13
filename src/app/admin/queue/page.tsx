import Link from "next/link";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  MessageSquare,
  Phone,
  Settings,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type Status = "risk" | "watch" | "check" | "ok";

type Card = {
  id: string;
  initials: string;
  name: string;
  sub: string;
  signal: React.ReactNode;
  signalIcon: React.ReactNode;
  stats: { k: string; v: string; tone?: "up" | "down" | "warn" | "success" }[];
  tags: { label: string; tone?: "danger" | "warning" | "success" }[];
  since: string;
  priority?: boolean;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function dagerSiden(d: Date | null): number | null {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function OppfolgingsKo() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const fjorten = new Date();
  fjorten.setDate(fjorten.getDate() - 14);

  const players = await prisma.user.findMany({
    where: { role: "PLAYER" },
    include: {
      trainingPlans: { where: { isActive: true }, select: { id: true } },
      signals: {
        where: { kind: "SG_TOTAL" },
        orderBy: { computedAt: "desc" },
        take: 1,
      },
    },
  });

  // Klassifiser hver spiller
  const risk: Card[] = [];
  const watch: Card[] = [];
  const check: Card[] = [];

  for (const p of players) {
    const grunner: string[] = [];
    const tags: { label: string; tone?: "danger" | "warning" | "success" }[] = [];
    const stats: Card["stats"] = [];

    if (p.trainingPlans.length === 0) {
      grunner.push("Ingen aktiv plan");
      tags.push({ label: "uten plan", tone: "danger" });
    }
    const dager = dagerSiden(p.lastLoginAt);
    if (!p.lastLoginAt || (dager !== null && dager > 14)) {
      grunner.push(`Ikke aktiv ${dager ?? "∞"}d`);
      tags.push({ label: "stille", tone: "warning" });
    }
    const sg = p.signals[0]?.value;
    if (sg != null) {
      stats.push({
        k: "SG · siste",
        v: `${sg >= 0 ? "+" : ""}${sg.toFixed(1).replace(".", ",")}`,
        tone: sg < 0 ? "down" : "up",
      });
    }
    if (sg != null && sg < -0.5) {
      tags.push({ label: "score-fall", tone: "danger" });
    }
    if (dager != null) {
      stats.push({ k: "Siste innlogg", v: `${dager}d` });
    }

    if (grunner.length === 0) continue;

    const card: Card = {
      id: p.id,
      initials: initials(p.name),
      name: p.name,
      sub: p.email,
      signalIcon:
        sg != null && sg < -0.5 ? (
          <TrendingDown className="h-3.5 w-3.5" />
        ) : grunner.length >= 2 ? (
          <AlertCircle className="h-3.5 w-3.5" />
        ) : (
          <Clock className="h-3.5 w-3.5" />
        ),
      signal: (
        <>
          <b className="font-semibold">{grunner.join(" · ")}</b>
        </>
      ),
      stats,
      tags,
      since: p.lastLoginAt
        ? `flagget ${dagerSiden(p.lastLoginAt) ?? 0} dager siden`
        : "flagget nylig",
      priority: grunner.length >= 3,
    };

    if (grunner.length >= 3) risk.push(card);
    else if (grunner.length === 2) watch.push(card);
    else check.push(card);
  }

  // Løste saker — placeholder inntil vi har en CoachingTask-modell
  // TODO: hent faktisk «løste oppfølgings-saker» fra database
  const ok: Card[] = [];

  const cols: { status: Status; title: string; desc: string; cards: Card[] }[] = [
    {
      status: "risk",
      title: "Risiko",
      desc: "Krever en samtale innen 48 timer.",
      cards: risk,
    },
    {
      status: "watch",
      title: "Watch",
      desc: "Trender feil retning — følg med.",
      cards: watch,
    },
    {
      status: "check",
      title: "Sjekk inn",
      desc: "Lett oppdatering — kjapp melding holder.",
      cards: check,
    },
    {
      status: "ok",
      title: "Løst · siste 7d",
      desc: "Tett-tett. Du kan markere «ikke vis» per sak.",
      cards: ok,
    },
  ];

  const totalAktive = risk.length + watch.length + check.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-8 py-8 pb-12 lg:px-10">
        {/* Header */}
        <header className="mb-6 flex items-start justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              /admin/oppfølging
            </span>
            <h1 className="mt-2 max-w-[640px] font-display text-[36px] font-bold italic leading-[1.1] tracking-tight">
              <em className="font-normal italic">Hvem trenger en samtale denne uka.</em>
            </h1>
            <p className="mt-2 font-display text-[15px] italic text-muted-foreground">
              Plattformen flagger — du bestemmer.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Settings className="h-4 w-4" />
              Justere regler
            </Link>
            <button
              type="button"
              disabled
              title="Kommer i v2"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Generer AI-aksjoner
            </button>
          </div>
        </header>

        {/* Top stats */}
        <section
          className="mb-5 grid gap-3"
          style={{ gridTemplateColumns: "repeat(5, 1fr) 1.4fr" }}
        >
          <TopStat
            k="Risiko"
            v={String(risk.length)}
            meta="krever samtale < 48 t"
            tone="danger"
          />
          <TopStat
            k="Watch"
            v={String(watch.length)}
            meta="trender feil retning"
            tone="warn"
          />
          <TopStat k="Sjekk inn" v={String(check.length)} meta="lett oppdatering" />
          <TopStat k="Løst · 30d" v={String(ok.length)} meta="siste måned" tone="good" />
          <TopStat k="Snitt respons" v="—" unit="d" meta="mål: < 3 dager" />
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-4">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Aktivitet siste 24 t
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Du løste <b className="font-semibold">—</b> saker
              </span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Plattformen flagget <b className="font-semibold">{totalAktive}</b> aktive
              </span>
            </div>
          </div>
        </section>

        {/* Filter row */}
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Filter
          </span>
          <Chip active>
            Alle elever{" "}
            <span className="ml-1 font-mono text-[10px] text-muted-foreground">
              {players.length}
            </span>
          </Chip>
          <Chip>Mine elever</Chip>
          <Chip>Foreldre-rapportert</Chip>
          <Chip>Score-fall</Chip>
          <Chip>Adherence &lt; 70 %</Chip>
          <Chip>Skade-historikk</Chip>
          <span className="mx-1 h-6 w-px bg-border" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Sortering
          </span>
          <button
            type="button"
            disabled
            title="Sortering kommer i v2"
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground opacity-60"
          >
            Risiko + tid siden flagget
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <span className="flex-1" />
          <span className="text-[12px] text-muted-foreground">Visning:</span>
          <div className="inline-flex overflow-hidden rounded-md border border-border">
            <SegBtn active>Kanban</SegBtn>
            <SegBtn>Liste</SegBtn>
            <SegBtn>Tidslinje</SegBtn>
          </div>
        </div>

        {/* Board */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-start gap-4">
          {cols.map((col) => (
            <Column key={col.status} col={col} />
          ))}
        </section>

        <footer className="mt-10 flex items-center justify-between border-t border-border pt-6 text-[12px] text-muted-foreground">
          <span>AK Golf Platform · CoachHQ · /admin/oppfølging</span>
          <span className="font-mono">{totalAktive} aktive saker</span>
        </footer>
      </div>
    </div>
  );
}

function Column({
  col,
}: {
  col: { status: Status; title: string; desc: string; cards: Card[] };
}) {
  const dotColor: Record<Status, string> = {
    risk: "bg-destructive",
    watch: "bg-muted-foreground",
    check: "bg-primary",
    ok: "bg-accent",
  };
  const bgTint: Record<Status, string> = {
    risk: "bg-destructive/5",
    watch: "bg-secondary/60",
    check: "bg-secondary/60",
    ok: "bg-secondary/60",
  };
  return (
    <div
      className={`flex min-h-[520px] flex-col gap-3 rounded-lg border border-border p-3.5 ${bgTint[col.status]}`}
    >
      <div className="flex items-center gap-2 px-1.5 pt-1">
        <span className={`h-2 w-2 rounded-full ${dotColor[col.status]}`} />
        <span className="font-display text-[14px] font-semibold tracking-tight">
          {col.title}
        </span>
        <span className="ml-auto rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          {col.cards.length}
        </span>
      </div>
      <div className="px-1.5 text-[11px] text-muted-foreground">{col.desc}</div>
      {col.cards.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-transparent p-4 text-center text-[12px] text-muted-foreground">
          Ingen saker i denne kategorien.
        </div>
      ) : (
        col.cards.map((c) => <CardItem key={c.id} card={c} />)
      )}
    </div>
  );
}

function CardItem({ card }: { card: Card }) {
  return (
    <Link
      href={`/admin/elever/${card.id}`}
      className={`flex flex-col gap-2.5 rounded-md border border-border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md ${
        card.priority ? "border-l-[3px] border-l-destructive" : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-muted font-display text-[12px] font-semibold">
          {card.initials}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-display text-[14px] font-semibold tracking-tight">
            {card.name}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">{card.sub}</div>
        </div>
      </div>
      <div className="flex items-start gap-1.5 rounded-md bg-secondary px-2.5 py-2 text-[12px] leading-snug">
        <span className="mt-0.5 text-muted-foreground">{card.signalIcon}</span>
        <span>{card.signal}</span>
      </div>
      {card.stats.length > 0 && (
        <div className="flex gap-3.5 px-0.5">
          {card.stats.map((s, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {s.k}
              </span>
              <span
                className={`font-mono text-[13px] font-medium ${
                  s.tone === "down"
                    ? "text-destructive"
                    : s.tone === "up" || s.tone === "success"
                      ? "text-primary"
                      : s.tone === "warn"
                        ? "text-muted-foreground"
                        : "text-foreground"
                }`}
              >
                {s.v}
              </span>
            </div>
          ))}
        </div>
      )}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.map((t, i) => (
            <span
              key={i}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                t.tone === "danger"
                  ? "bg-destructive/15 text-destructive"
                  : t.tone === "warning"
                    ? "bg-muted text-muted-foreground"
                    : t.tone === "success"
                      ? "bg-accent/30 text-primary"
                      : "bg-secondary text-muted-foreground"
              }`}
            >
              {t.label}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {card.since}
        </span>
        <div className="flex gap-1">
          <ActionIcon>
            <MessageSquare className="h-3.5 w-3.5" />
          </ActionIcon>
          <ActionIcon>
            <Phone className="h-3.5 w-3.5" />
          </ActionIcon>
          <ActionIcon>
            <Calendar className="h-3.5 w-3.5" />
          </ActionIcon>
        </div>
      </div>
    </Link>
  );
}

function ActionIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card text-muted-foreground">
      {children}
    </span>
  );
}

function TopStat({
  k,
  v,
  unit,
  meta,
  tone,
}: {
  k: string;
  v: string;
  unit?: string;
  meta: string;
  tone?: "danger" | "warn" | "good";
}) {
  const valueColor =
    tone === "danger"
      ? "text-destructive"
      : tone === "warn"
        ? "text-muted-foreground"
        : tone === "good"
          ? "text-primary"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {k}
      </div>
      <div
        className={`mt-2 font-mono text-[30px] font-medium leading-none tabular-nums tracking-tight ${valueColor}`}
      >
        {v}
        {unit && (
          <small className="text-[14px] font-normal text-muted-foreground">{unit}</small>
        )}
      </div>
      <div className="mt-1.5 text-[11px] text-muted-foreground">{meta}</div>
    </div>
  );
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${
        active
          ? "bg-foreground text-background"
          : "border border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function SegBtn({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={!active}
      title={active ? undefined : "Visning kommer i v2"}
      className={`px-3 py-1 text-[12px] font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "cursor-not-allowed text-muted-foreground opacity-60"
      }`}
    >
      {children}
    </button>
  );
}
