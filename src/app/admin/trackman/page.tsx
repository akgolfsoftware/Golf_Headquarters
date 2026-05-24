/**
 * CoachHQ — TrackMan (Bølge B)
 *
 * Coach-view over alle TrackMan-sesjoner fra spillere. KPI-strip, filter
 * og tabell med shot-count, kilde og miljø. Server component.
 *
 * Design: wireframe/design-package/project/final/14-trackman.html
 */
import {
  ChevronDown,
  ChevronRight,
  Radar,
  Search,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { avatarBg } from "@/lib/avatar-colors";

const ENV_LABEL: Record<string, string> = {
  INDOOR: "Innendørs",
  OUTDOOR: "Utendørs",
  RANGE: "Range",
  COURSE: "Bane",
};

const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "CSV-import",
  api: "API",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function TrackmanPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sessions = await prisma.trackManSession.findMany({
    orderBy: { recordedAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, name: true, hcp: true } },
    },
  });

  const totalSessions = await prisma.trackManSession.count();
  const totalShots = sessions.reduce((s, x) => s + x.shotCount, 0);

  // eslint-disable-next-line react-hooks/purity
  const trettiSiden = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const siste30d = sessions.filter((s) => s.recordedAt.getTime() >= trettiSiden);
  const shots30d = siste30d.reduce((s, x) => s + x.shotCount, 0);

  const uniquePlayers = new Set(sessions.map((s) => s.userId)).size;

  const snittShots =
    sessions.length === 0
      ? 0
      : Math.round(totalShots / sessions.length);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · /admin/trackman"
        titleLead="TrackMan-"
        titleItalic="sesjoner"
        titleTrail={`· ${totalSessions} totalt`}
        sub={`${siste30d.length} sesjoner siste 30 dager · ${shots30d} slag registrert · ${uniquePlayers} aktive spillere`}
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
            Sesjoner · 30d
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
            {siste30d.length}
          </div>
          <div className="font-mono text-[11px] text-background/70">
            Siste 30 dager
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Slag · 30d
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {shots30d.toLocaleString("nb-NO")}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Aggregert shot-count
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Snitt slag/sesjon
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {snittShots}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Akkumulert siste {sessions.length}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Aktive spillere
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {uniquePlayers}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Har minst én sesjon registrert
          </div>
        </div>
      </div>

      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px]">
          <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Søk spiller"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            aria-label="Søk spiller"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Spiller <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Miljø <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Kilde <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          Sortert: nyeste
        </span>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Radar}
          titleItalic="Ingen"
          titleTrail="TrackMan-sesjoner"
          sub="Når spillere importerer CSV fra TrackMan eller kobler API-en vises sesjonene her."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 border-b border-border bg-secondary/40 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <div>Spiller</div>
            <div>Dato</div>
            <div>Slag</div>
            <div>Kilde</div>
            <div>Miljø</div>
            <div className="w-16" />
          </div>

          <ul className="divide-y divide-border">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                    style={{ background: avatarBg(s.user.name) }}
                    aria-hidden="true"
                  >
                    {initials(s.user.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {s.user.name}
                    </div>
                    {s.user.hcp != null && (
                      <div className="font-mono text-[11px] text-muted-foreground">
                        HCP {s.user.hcp.toFixed(1).replace(".", ",")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatDate(s.recordedAt)}
                </div>
                <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {s.shotCount}
                </div>
                <div>
                  <span className="inline-flex rounded-sm bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground">
                    {SOURCE_LABEL[s.source] ?? s.source}
                  </span>
                </div>
                <div>
                  {s.environment ? (
                    <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                      {ENV_LABEL[s.environment] ?? s.environment}
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-muted-foreground">—</span>
                  )}
                </div>
                <div className="text-muted-foreground">
                  <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </li>
            ))}
          </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
