/**
 * PlayerHQ · Coach · Notater
 *
 * Endelig design (basert på coaching-detail-demo). Hero med ringed avatar,
 * stat-pills, quote-card og notat-liste. Pro-tier kreves.
 */
import Link from "next/link";
import {
  MessageCircle,
  Play,
  Edit3,
  ChevronRight,
  Quote,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type ChatMelding = { role?: string; content?: string; ts?: string };

export default async function CoachNotes() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="PlayerHQ · Coach"
          titleLead="Krever"
          titleItalic="Pro"
          sub="Notater fra coach er en del av Pro-abonnementet."
        />
      </div>
    );
  }

  const sesjoner = await prisma.coachingSession.findMany({
    where: { userId: user.id, kind: "DIRECT" },
    include: { coach: { select: { name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const notater = sesjoner.flatMap((s) => {
    const meldinger = Array.isArray(s.messages)
      ? (s.messages as ChatMelding[])
      : [];
    return meldinger
      .filter((m) => m.role === "coach" && typeof m.content === "string")
      .map((m) => ({
        sesjonId: s.id,
        coach: s.coach.name,
        coachInitial: (s.coach.name || "?").charAt(0).toUpperCase(),
        content: m.content!,
        ts: m.ts ?? s.updatedAt.toISOString(),
      }));
  });

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const nyeIUken = notater.filter(
    (n) => new Date(n.ts).getTime() > sevenDaysAgo,
  ).length;

  const primaerCoach = sesjoner[0]?.coach.name ?? null;
  const primaerInitial = primaerCoach
    ? primaerCoach
        .split(" ")
        .map((p) => p.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("")
    : "—";

  const sisteNotat = notater[0];

  if (notater.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="PlayerHQ · Coach · Notater"
          titleLead="Ingen"
          titleItalic="notater enda"
          sub="Når coachen sender deg en direkte melding, dukker den opp her."
        />
        <EmptyState
          icon={MessageCircle}
          titleItalic="Ingen notater"
          titleTrail="enda"
          sub="Notater fra coachen din vises her så fort de sendes."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <header>
        <Link
          href="/portal/coach"
          className="mb-4 inline-flex items-center gap-1 font-mono text-[12px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
          Coach
        </Link>

        <div className="flex flex-wrap items-start gap-6">
          <div className="relative shrink-0">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary font-mono text-[22px] font-semibold text-primary-foreground ring-4 ring-accent">
              {primaerInitial}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              PlayerHQ · Coach · Notater
            </span>
            <h1 className="mt-1 font-display text-[36px] italic font-medium leading-[1.05] tracking-tight">
              {notater.length} notater fra coach
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {primaerCoach ? `Hovedcoach: ${primaerCoach}` : "Hovedcoach"} ·
              Sist: {formatTs(sisteNotat.ts)}
              {nyeIUken > 0 ? ` · ${nyeIUken} nye denne uka` : ""}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatPill label="Notater" value={String(notater.length)} />
              <StatPill
                label="Denne uka"
                value={String(nyeIUken)}
                tone={nyeIUken > 0 ? "accent" : "muted"}
              />
              <StatPill label="Sesjoner" value={String(sesjoner.length)} />
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Link
              href="/portal/coach/melding"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              <Play size={16} strokeWidth={1.5} />
              Svar coach
            </Link>
            <Link
              href="/portal/coach/melding?type=vurdering"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Edit3 size={16} strokeWidth={1.5} />
              Be om vurdering
            </Link>
          </div>
        </div>
      </header>

      {/* Insight-banner */}
      {nyeIUken > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-accent/50 bg-accent/15 px-5 py-4">
          <TrendingUp size={18} strokeWidth={1.5} className="text-foreground" />
          <p className="text-[14px] text-foreground">
            Du har <b>{nyeIUken} nye notater</b> denne uka. Les og svar for å
            holde dialogen i gang.
          </p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Notater-feed */}
        <section className="col-span-12 lg:col-span-8">
          <div className="mb-4 flex items-center gap-2">
            <Calendar
              size={16}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Alle notater · nyeste først
            </span>
          </div>

          <ul className="space-y-3">
            {notater.map((n, i) => (
              <article
                key={`${n.sesjonId}-${i}`}
                className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <header className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
                    {n.coachInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-semibold leading-none">
                        {n.coach}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                        · {formatTs(n.ts)}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      Hovedcoach
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                    <MessageSquare size={11} strokeWidth={1.5} />
                    Tilbakemelding
                  </span>
                </header>
                <p className="mt-4 text-sm leading-relaxed text-foreground">
                  {n.content}
                </p>
              </article>
            ))}
          </ul>
        </section>

        {/* Coach-quote (sidebar) */}
        <section className="col-span-12 lg:col-span-4">
          <div className="sticky top-6 rounded-lg border border-border bg-card p-6">
            <Quote size={20} strokeWidth={1.5} className="text-accent" />
            <p className="mt-3 font-display text-[18px] italic leading-snug text-foreground">
              «{truncate(sisteNotat.content, 180)}»
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
                {sisteNotat.coachInitial}
              </div>
              <div>
                <div className="text-[12px] font-semibold leading-none">
                  {sisteNotat.coach}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {formatTs(sisteNotat.ts)}
                </div>
              </div>
            </div>
            <Link
              href={`/portal/coach/notes/${sisteNotat.sesjonId}`}
              className="mt-6 inline-flex items-center gap-1 text-[12px] font-medium text-foreground hover:underline"
            >
              Åpne sesjonen
              <ArrowUpRight size={12} strokeWidth={1.5} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "accent";
}) {
  const styles: Record<NonNullable<typeof tone>, string> = {
    muted: "bg-secondary text-foreground border-border",
    accent: "bg-accent/30 text-foreground border-accent/40",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] ${styles[tone]}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono font-semibold tabular-nums">{value}</span>
    </span>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function formatTs(ts: string): string {
  return new Date(ts).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
