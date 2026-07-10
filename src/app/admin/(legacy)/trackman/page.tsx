/**
 * AgencyOS — TrackMan-sesjoner på tvers (/admin/trackman)
 *
 * Coach-view over alle TrackMan-sesjoner fra spillere. KPI-strip, filter
 * og data-tett tabell med shot-count, kilde og miljø. Server component —
 * ekte Prisma (TrackManSession), ingen falske tall.
 */
import Link from "next/link";
import {
  ChevronRight,
  Radar,
  Search,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";
import { avatarBg } from "@/lib/avatar-colors";
import { TrackmanFilterChip } from "./trackman-actions";

export const dynamic = "force-dynamic";

// Matcher TrackManEnvironment-enum i prisma/schema.prisma.
const ENV_LABEL: Record<string, string> = {
  SIMULATOR_INDOOR: "Simulator inne",
  NET_INDOOR: "Nett inne",
  RANGE_OUTDOOR_MAT: "Range matte",
  RANGE_OUTDOOR_GRASS: "Range gress",
  COURSE_PRACTICE: "Bane trening",
  COURSE_COMPETITION: "Bane konkurranse",
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
    sessions.length === 0 ? 0 : Math.round(totalShots / sessions.length);

  return (
    <div className="space-y-1">
      {/* header */}
      <div className="mb-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          AGENCYOS · TRACKMAN
        </span>
        <h1 className="mt-2 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
          Hver økt på <em className="font-normal italic text-primary">launch monitor</em>, samlet.
        </h1>
        <p className="mt-1.5 max-w-[780px] text-sm leading-relaxed text-muted-foreground">
          TrackMan-sesjoner fra hele stallen — slag-volum, kilde og miljø per økt.{" "}
          <b className="font-semibold text-foreground">{siste30d.length}</b> sesjoner siste 30 dager ·{" "}
          <b className="font-semibold text-foreground">{shots30d.toLocaleString("nb-NO")}</b> slag ·{" "}
          {totalSessions} totalt.
        </p>
      </div>

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-3 pt-3 lg:grid-cols-4">
        <KpiDark label="SESJONER · 30D" value={String(siste30d.length)} foot="Siste 30 dager" />
        <KpiCard
          label="SLAG · 30D"
          value={shots30d.toLocaleString("nb-NO")}
          foot="Aggregert shot-count"
        />
        <KpiCard
          label="SNITT SLAG/SESJON"
          value={String(snittShots)}
          foot={`Akkumulert siste ${sessions.length}`}
        />
        <KpiCard
          label="AKTIVE SPILLERE"
          value={String(uniquePlayers)}
          foot="Minst én sesjon registrert"
        />
      </div>

      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-2 pt-5">
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-[13px]">
          <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          <input
            type="search"
            placeholder="Søk spiller"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            aria-label="Søk spiller"
          />
        </div>
        <TrackmanFilterChip label="Spiller" />
        <TrackmanFilterChip label="Miljø" />
        <TrackmanFilterChip label="Kilde" />
        <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Sortert · nyeste
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="pt-5">
          <EmptyState
            icon={Radar}
            titleItalic="Ingen"
            titleTrail="TrackMan-sesjoner"
            sub="Når spillere importerer CSV fra TrackMan eller kobler API-en vises sesjonene her."
          />
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 border-b border-border bg-background px-4 py-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
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
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-2 px-4 py-2.5 transition-colors hover:bg-primary/[0.025]"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-[11px] font-bold text-white"
                        style={{ background: avatarBg(s.user.name) }}
                        aria-hidden="true"
                      >
                        {initials(s.user.name)}
                      </div>
                      <div className="min-w-0 leading-tight">
                        <div className="truncate text-[13px] font-bold text-foreground">
                          {s.user.name}
                        </div>
                        {s.user.hcp != null && (
                          <div className="font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
                            HCP {s.user.hcp.toFixed(1).replace(".", ",")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-xs tabular-nums text-muted-foreground">
                      {formatDate(s.recordedAt)}
                    </div>
                    <div className="font-mono text-sm font-bold tabular-nums text-foreground">
                      {s.shotCount}
                    </div>
                    <div>
                      <span className="inline-flex rounded-[3px] bg-secondary px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                        {SOURCE_LABEL[s.source] ?? s.source}
                      </span>
                    </div>
                    <div>
                      {s.environment ? (
                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
                          {ENV_LABEL[s.environment] ?? s.environment}
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-muted-foreground">—</span>
                      )}
                    </div>
                    <Link
                      href={`/admin/spillere/${s.user.id}`}
                      aria-label={`Profil for ${s.user.name}`}
                      className="inline-flex h-[26px] w-[26px] items-center justify-center justify-self-end rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <ChevronRight className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
                    </Link>
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


function KpiDark({ label, value, foot }: { label: string; value: string; foot: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-primary px-[18px] py-4 text-primary-foreground">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
        {label}
      </span>
      <span className="font-mono text-[32px] font-bold leading-none tracking-[-0.02em] tabular-nums">
        {value}
      </span>
      <span className="font-mono text-[11px] font-bold tracking-[0.04em] text-primary-foreground/70">
        {foot}
      </span>
    </div>
  );
}

function KpiCard({ label, value, foot }: { label: string; value: string; foot: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-[18px] py-4">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[32px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value}
      </span>
      <span className="font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
        {foot}
      </span>
    </div>
  );
}
