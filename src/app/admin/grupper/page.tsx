/**
 * CoachHQ — Grupper (Bølge B)
 *
 * Coach-view over alle trenings-grupper. Kort-grid med hero-gradient per
 * gruppe, KPI-strip (4 kort, første med dark accent), filter-chips og
 * empty-state-fallback. Tokens-only, 8pt-grid, Lucide stroke 1.75.
 *
 * Design: wireframe/design-package/project/final/09-grupper.html
 */
import Link from "next/link";
import {
  ChevronDown,
  Plus,
  Search,
  UsersRound,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { avatarBg } from "@/lib/avatar-colors";

// 6 dekorative gradient-paletter for gruppe-identitet. Bruker offisielle
// avatar-gradient-tokens fra globals.css for konsistens med avatar-grafikk.
const HERO_GRADIENTS = [
  "var(--gradient-avatar-1)",
  "var(--gradient-avatar-8)",
  "var(--gradient-avatar-6)",
  "var(--gradient-avatar-8)",
  "var(--gradient-avatar-7)",
  "var(--gradient-avatar-3)",
] as const;

function typeLabel(level: string | null): string {
  if (!level) return "Klubb";
  if (level.startsWith("S")) return "Skole";
  if (level.startsWith("A")) return "Selektert";
  return "Klubb";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function snittHcp(hcps: Array<number | null>): string {
  const valid = hcps.filter((h): h is number => h != null);
  if (valid.length === 0) return "—";
  const avg = valid.reduce((s, n) => s + n, 0) / valid.length;
  return avg >= 0 ? avg.toFixed(1).replace(".", ",") : `+${Math.abs(avg).toFixed(1).replace(".", ",")}`;
}

export default async function GrupperPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const groups = await prisma.group.findMany({
    include: {
      coach: { select: { id: true, name: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, hcp: true } },
        },
      },
      _count: { select: { members: true, schedules: true } },
    },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });

  const totalMembers = groups.reduce((s, g) => s + g._count.members, 0);
  const totalSchedules = groups.reduce((s, g) => s + g._count.schedules, 0);
  const uniqueMembers = new Set(
    groups.flatMap((g) => g.members.map((m) => m.userId)),
  ).size;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · /admin/grupper"
        titleLead={`${groups.length}`}
        titleItalic="grupper"
        titleTrail={`· ${totalMembers} medlemmer · ${totalSchedules} fellesøkter`}
        sub="Coach-view: alle aktive trenings-grupper på tvers av klubber, skoler og selekterte talent-puljer."
        actions={
          <Link
            href="/admin/grupper"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Ny gruppe
          </Link>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
            Aktive grupper
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
            {groups.length}
          </div>
          <div className="font-mono text-[11px] text-background/70">
            På tvers av klubb, skole og talent
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Totale medlemmer
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {totalMembers}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            {uniqueMembers} unike spillere
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Fellesøkter
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {totalSchedules}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Planlagte gruppe-økter
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Coacher
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {new Set(groups.map((g) => g.coach?.id).filter(Boolean)).size}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Primær-coach per gruppe
          </div>
        </div>
      </div>

      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px]">
          <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Søk gruppe eller medlem"
            className="w-full bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
            aria-label="Søk gruppe eller medlem"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Type <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Coach <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Status <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          Sort: navn ↑
        </span>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          titleItalic="Ingen"
          titleTrail="grupper ennå"
          sub="Lag din første gruppe for å samle spillere med felles trening — skole-gjenger, klubb-grupper eller selekterte talent-puljer."
          cta={
            <Link
              href="/admin/grupper"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Ny gruppe
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => {
            const gradient = HERO_GRADIENTS[i % HERO_GRADIENTS.length];
            const initial = g.level ?? g.name.charAt(0).toUpperCase();
            const visibleMembers = g.members.slice(0, 5);
            const overflow = g.members.length - visibleMembers.length;
            const avg = snittHcp(g.members.map((m) => m.user.hcp));

            return (
              <li
                key={g.id}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
              >
                {/* Hero */}
                <div
                  className="relative flex h-[180px] items-center justify-center"
                  style={{ background: gradient }}
                >
                  <span className="absolute top-3 left-3 z-10 rounded-sm bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-foreground">
                    {typeLabel(g.level)}
                  </span>
                  <span className="font-display text-[88px] font-semibold italic leading-none tracking-tighter text-white/90 drop-shadow-md">
                    {initial}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div>
                    <h3 className="font-display text-xl font-normal italic leading-tight tracking-tight">
                      {g.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {typeLabel(g.level)}-gruppe
                      {g._count.members > 0 && ` · ${g._count.members} medl`}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 border-y border-border/60 py-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        Medlemmer
                      </span>
                      <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                        {g._count.members}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        Snitt-HCP
                      </span>
                      <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                        {avg}
                      </span>
                    </div>
                    <div className="col-span-2 flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        Primær-coach
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {g.coach?.name ?? "Ikke satt"}
                      </span>
                    </div>
                  </div>

                  {/* Avatar-stack */}
                  {g.members.length > 0 && (
                    <div className="flex items-center">
                      {visibleMembers.map((m, idx) => (
                        <div
                          key={m.id}
                          className="grid h-7 w-7 place-items-center rounded-full border-2 border-card font-mono text-[10px] font-semibold text-white"
                          style={{
                            background: avatarBg(m.user.name),
                            marginLeft: idx === 0 ? 0 : -8,
                          }}
                          aria-label={m.user.name}
                          title={m.user.name}
                        >
                          {initials(m.user.name)}
                        </div>
                      ))}
                      {overflow > 0 && (
                        <span
                          className="grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-secondary font-mono text-[10px] font-semibold text-foreground"
                          style={{ marginLeft: -8 }}
                        >
                          +{overflow}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto flex gap-2 pt-1">
                    <Link
                      href={`/admin/grupper/${g.id}`}
                      className="flex-1 rounded-md bg-primary px-4 py-2 text-center text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Åpne →
                    </Link>
                    <Link
                      href={`/admin/bookinger/ny?groupId=${g.id}`}
                      className="flex-1 rounded-md border border-border bg-card px-4 py-2 text-center text-[13px] font-medium text-foreground transition-colors hover:border-primary"
                    >
                      Planlegg
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
