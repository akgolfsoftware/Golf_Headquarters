/**
 * CoachHQ · Grupper
 *
 * Migrert til endelig design (wireframe/design-files-v2/final/09-grupper.html).
 * Card-grid med fargede hero-gradients per gruppe, KPI-strip, filter-row, italic
 * Instrument Serif i hero. Tokens + 8pt-grid. Lime brukes sparsomt (KPI-acc).
 */
import Link from "next/link";
import { UsersRound, Search, ChevronDown, ArrowDownAZ } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { GroupForm } from "./group-form";

// Faste gradient-paletter — sykler basert på gruppe-indeks så hver
// gruppe får en stabil identitet i grid-en.
const HERO_GRADIENTS = [
  "from-[#005840] via-[#0a4a35] to-[#163027]",
  "from-[#3b5994] via-[#2e4470] to-[#1e2e4a]",
  "from-[#a14b30] via-[#c26442] to-[#7d3a25]",
  "from-[#5a3b8a] via-[#7c52b0] to-[#3a2658]",
  "from-[#2c7d76] via-[#3fa39a] to-[#1b504c]",
  "from-[#7a5a1a] via-[#9a7a30] to-[#4a3608]",
] as const;

function levelTypeLabel(level: string | null): string {
  if (!level) return "Klubb";
  if (level.startsWith("S")) return "Skole";
  if (level.startsWith("A")) return "Selektert";
  return "Klubb";
}

export default async function Grupper() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [groups, coaches] = await Promise.all([
    prisma.group.findMany({
      include: {
        coach: { select: { name: true } },
        _count: { select: { members: true } },
      },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    }),
    prisma.user.findMany({
      where: { role: { in: ["COACH", "ADMIN"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const coachOptions = coaches.map((c) => ({
    id: c.id,
    name: c.name ?? "(uten navn)",
  }));
  const totaltMedlemmer = groups.reduce((sum, g) => sum + g._count.members, 0);
  const antallSkole = groups.filter((g) =>
    levelTypeLabel(g.level) === "Skole",
  ).length;
  const antallKlubb = groups.filter((g) =>
    levelTypeLabel(g.level) === "Klubb",
  ).length;
  const antallSelektert = groups.filter((g) =>
    levelTypeLabel(g.level) === "Selektert",
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · /admin/groups"
        titleLead={`${groups.length}`}
        titleItalic="grupper"
        titleTrail={`· ${totaltMedlemmer} medlemmer`}
        sub="Skole, klubb og selekterte talent-grupper. Klikk på en gruppe for å se medlemmer og planlegge fellesøkter."
        actions={
          <GroupForm coaches={coachOptions} triggerLabel="+ Ny gruppe" />
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#274d41] bg-gradient-to-br from-[#0F2A22] to-[#163027] p-4 text-[#F5F4EE]">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[#D1F843]/70">
            Aktive grupper
          </div>
          <div className="mt-2 font-mono text-3xl font-semibold leading-none">
            {groups.length}
          </div>
          <div className="mt-2 font-mono text-[11px] text-[#F5F4EE]/70">
            {antallSkole} skole · {antallKlubb} klubb · {antallSelektert}{" "}
            selektert
          </div>
        </div>
        <KpiCard
          label="Totale medlemmer"
          value={totaltMedlemmer.toString()}
          sub={`${groups.filter((g) => g._count.members > 0).length} grupper med medlemmer`}
        />
        <KpiCard
          label="Fellesøkter denne uka"
          value="—"
          sub="Genereres fra økt-kalender"
        />
        <KpiCard
          label="Coacher tildelt"
          value={new Set(groups.map((g) => g.coachId).filter(Boolean)).size.toString()}
          sub={`av ${coachOptions.length} totalt`}
        />
      </div>

      {/* Filter-row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm sm:flex-initial">
          <Search size={14} strokeWidth={1.75} className="text-muted-foreground" />
          <input
            placeholder="Søk gruppe eller medlem"
            className="flex-1 border-none bg-transparent outline-none"
            aria-label="Søk i grupper"
          />
        </div>
        <Chip>
          Type <ChevronDown size={11} strokeWidth={1.75} />
        </Chip>
        <Chip>
          Coach <ChevronDown size={11} strokeWidth={1.75} />
        </Chip>
        <Chip>
          Status <ChevronDown size={11} strokeWidth={1.75} />
        </Chip>
        <div className="ml-auto">
          <Chip>
            <ArrowDownAZ size={11} strokeWidth={1.75} /> Sortér: Navn
          </Chip>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          titleItalic="Ingen grupper"
          titleTrail="opprettet ennå"
          sub="Lag din første gruppe for å samle spillere med felles trening — skole-gjenger, klubb-grupper eller selekterte talent-pukker."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, idx) => {
            const gradient = HERO_GRADIENTS[idx % HERO_GRADIENTS.length];
            const initial = g.name.charAt(0).toUpperCase();
            const type = levelTypeLabel(g.level);
            return (
              <li
                key={g.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
              >
                <Link
                  href={`/admin/groups/${g.id}`}
                  className="block"
                  aria-label={`Åpne gruppe ${g.name}`}
                >
                  {/* Hero-image med gradient */}
                  <div
                    className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}
                  >
                    <span
                      className="absolute left-3 top-3 rounded-sm bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-foreground"
                      aria-hidden="true"
                    >
                      {type}
                    </span>
                    <span
                      className="font-display text-7xl font-semibold italic leading-none text-white/90"
                      style={{ textShadow: "0 4px 18px rgba(0,0,0,0.2)" }}
                      aria-hidden="true"
                    >
                      {initial}
                    </span>
                    {g.level && (
                      <span
                        className="absolute bottom-3 right-3 rounded-sm bg-[rgba(10,31,24,0.55)] px-2 py-0.5 font-mono text-[10px] font-medium text-white backdrop-blur"
                        aria-hidden="true"
                      >
                        Nivå {g.level}
                      </span>
                    )}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-black/35"
                    />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div>
                    <h3 className="font-display text-2xl font-normal italic leading-tight tracking-tight text-foreground">
                      {g.name}
                    </h3>
                    {g.coach?.name && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {type}-gruppe · Coach: {g.coach.name}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-y border-border py-4">
                    <Stat
                      label="Medlemmer"
                      value={g._count.members.toString()}
                      big
                    />
                    <Stat label="Nivå" value={g.level ?? "—"} big />
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/admin/groups/${g.id}`}
                      className="flex-1 rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Åpne →
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

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-mono text-3xl font-semibold leading-none text-foreground tabular-nums">
        {value}
      </div>
      <div className="mt-2 font-mono text-[11px] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  big = false,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`font-mono font-semibold text-foreground tabular-nums ${
          big ? "text-xl" : "text-sm"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
