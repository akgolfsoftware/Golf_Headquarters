import Link from "next/link";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";

/**
 * PlanTidslinje — Gantt-view for treningsplaner.
 *
 * Y-akse: spillere (avatar + navn)
 * X-akse: 8 uker fra denne uke
 * Hver plan tegnes som horisontalt bar fra startDate til endDate.
 * "Idag"-vertikal linje markert med accent.
 *
 * Server component — alle datoer beregnes på server.
 */
export type TidslinjePlan = {
  id: string;
  name: string;
  userId: string;
  userName: string;
  startDate: Date;
  endDate: Date | null;
  status: "aktiv" | "pause" | "arkiv";
  pct: number;
};

const STATUS_BG: Record<TidslinjePlan["status"], string> = {
  aktiv: "bg-primary",
  pause: "bg-accent",
  arkiv: "bg-muted-foreground/50",
};

const STATUS_BORDER: Record<TidslinjePlan["status"], string> = {
  aktiv: "border-primary/40",
  pause: "border-accent/60",
  arkiv: "border-border",
};

const WEEKS_AHEAD = 8;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfISOWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - (day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatUkeLabel(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `u${String(week).padStart(2, "0")}`;
}

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export function PlanTidslinje({
  plans,
  now,
}: {
  plans: TidslinjePlan[];
  now: Date;
}) {
  // Tidslinje strekker seg fra start-av-denne-uka til 8 uker frem.
  const timelineStart = startOfISOWeek(now);
  const totalDays = WEEKS_AHEAD * 7;
  const timelineEnd = new Date(
    timelineStart.getTime() + totalDays * MS_PER_DAY,
  );

  // Idag-linje som prosent av total bredde
  const idagPctRaw =
    ((now.getTime() - timelineStart.getTime()) / (totalDays * MS_PER_DAY)) *
    100;
  const idagPct = Math.max(0, Math.min(100, idagPctRaw));

  // Bygg uke-headere
  const ukeHeadere: { label: string; dato: string }[] = [];
  for (let i = 0; i < WEEKS_AHEAD; i++) {
    const d = new Date(timelineStart.getTime() + i * 7 * MS_PER_DAY);
    ukeHeadere.push({ label: formatUkeLabel(d), dato: formatDato(d) });
  }

  // Grupper planer per spiller
  const perSpiller = new Map<
    string,
    { userId: string; userName: string; plans: TidslinjePlan[] }
  >();
  for (const p of plans) {
    if (!perSpiller.has(p.userId)) {
      perSpiller.set(p.userId, {
        userId: p.userId,
        userName: p.userName,
        plans: [],
      });
    }
    perSpiller.get(p.userId)!.plans.push(p);
  }
  const spillere = Array.from(perSpiller.values()).sort((a, b) =>
    a.userName.localeCompare(b.userName, "nb"),
  );

  if (spillere.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/40 px-8 py-16 text-center text-sm text-muted-foreground">
        Ingen planer å vise på tidslinjen.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Uke-header */}
      <div className="grid border-b border-border bg-secondary/40" style={{ gridTemplateColumns: "180px 1fr" }}>
        <div className="border-r border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Spiller
        </div>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${WEEKS_AHEAD}, minmax(0,1fr))` }}>
          {ukeHeadere.map((h, i) => (
            <div
              key={i}
              className="border-l border-border px-2 py-2 first:border-l-0"
            >
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground">
                {h.label}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {h.dato}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rader */}
      <div className="relative">
        {/* Idag-linje */}
        {idagPctRaw >= 0 && idagPctRaw <= 100 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 z-10"
            style={{ left: `calc(180px + (100% - 180px) * ${idagPct / 100})` }}
          >
            <div className="h-full w-px bg-accent" />
            <span className="absolute top-1 left-1 rounded-sm bg-accent px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-accent-foreground">
              Idag
            </span>
          </div>
        )}

        {spillere.map((spiller) => (
          <div
            key={spiller.userId}
            className="grid border-b border-border last:border-b-0"
            style={{ gridTemplateColumns: "180px 1fr" }}
          >
            {/* Spiller-celle */}
            <div className="flex items-center gap-2 border-r border-border px-4 py-2">
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
                style={{ background: avatarBg(spiller.userName) }}
              >
                {initialsFromName(spiller.userName)}
              </span>
              <span className="truncate text-[13px] font-medium text-foreground">
                {spiller.userName}
              </span>
            </div>

            {/* Track */}
            <div
              className="relative grid min-h-[56px]"
              style={{ gridTemplateColumns: `repeat(${WEEKS_AHEAD}, minmax(0,1fr))` }}
            >
              {/* Uke-grid */}
              {Array.from({ length: WEEKS_AHEAD }).map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className="border-l border-border/60 first:border-l-0"
                />
              ))}

              {/* Plan-barer */}
              {spiller.plans.map((plan) => {
                const start = plan.startDate;
                const end =
                  plan.endDate ?? new Date(timelineEnd.getTime());

                // Klipp til synlig vindu
                const visibleStart =
                  start.getTime() < timelineStart.getTime()
                    ? timelineStart
                    : start;
                const visibleEnd =
                  end.getTime() > timelineEnd.getTime() ? timelineEnd : end;

                if (visibleEnd.getTime() <= timelineStart.getTime()) return null;
                if (visibleStart.getTime() >= timelineEnd.getTime()) return null;

                const leftPct =
                  ((visibleStart.getTime() - timelineStart.getTime()) /
                    (totalDays * MS_PER_DAY)) *
                  100;
                const widthPct =
                  ((visibleEnd.getTime() - visibleStart.getTime()) /
                    (totalDays * MS_PER_DAY)) *
                  100;

                return (
                  <Link
                    key={plan.id}
                    href={`/admin/plans/${plan.id}`}
                    title={`${plan.name} · ${formatDato(plan.startDate)} – ${
                      plan.endDate ? formatDato(plan.endDate) : "løpende"
                    } · ${plan.pct} %`}
                    className={`group absolute top-2 col-span-full flex h-10 items-center overflow-hidden rounded-md border ${STATUS_BORDER[plan.status]} bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
                    style={{
                      left: `${leftPct}%`,
                      width: `${Math.max(widthPct, 1.5)}%`,
                    }}
                  >
                    {/* Progress-fill */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-0 left-0 ${STATUS_BG[plan.status]} opacity-25`}
                      style={{ width: `${plan.pct}%` }}
                    />
                    <span className="relative z-10 ml-2 truncate font-display text-[11px] italic font-medium text-foreground">
                      {plan.name}
                    </span>
                    <span className="relative z-10 ml-2 shrink-0 pr-2 font-mono text-[10px] tabular-nums text-muted-foreground">
                      {plan.pct} %
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
