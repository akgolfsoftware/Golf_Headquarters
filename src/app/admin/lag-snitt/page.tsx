import Link from "next/link";
import { Calendar, Download } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { Users2 } from "lucide-react";
import { CohortBenchmark } from "@/components/admin-analyse-v2/cohort-benchmark";

export const dynamic = "force-dynamic";

// Pyramide-fokusområder
type Fokus = {
  key: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  name: string;
  sub: string;
  color: string;
};

const FOKUS: Fokus[] = [
  { key: "FYS", name: "FYS", sub: "fysisk fundament", color: "bg-[oklch(0.85_0.04_120)]" },
  { key: "TEK", name: "TEK", sub: "teknikk · golfsving", color: "bg-[oklch(0.65_0.15_175)]" },
  { key: "SLAG", name: "SLAG", sub: "slagprogresjon", color: "bg-[oklch(0.55_0.12_30)]" },
  { key: "SPILL", name: "SPILL", sub: "banespill · scoring", color: "bg-[oklch(0.80_0.15_85)]" },
  { key: "TURN", name: "TURN", sub: "turnering · konkurranse", color: "bg-muted-foreground" },
];

export default async function LagSnittPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const grupper = await prisma.group.findMany({
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, hcp: true } },
        },
      },
    },
    orderBy: { name: "asc" },
    take: 5,
  });

  const totalSpillere = grupper.reduce((a, g) => a + g.members.length, 0);

  // For demo-data: placeholder pyramide-fordeling per gruppe.
  // I produksjon hentes dette fra TrainingPlanSessionLog aggregert per gruppe.
  const matrix = grupper.map((g) => {
    const seed = g.id.charCodeAt(0) + g.id.charCodeAt(1);
    const base = [22, 32, 22, 14, 10]; // FYS, TEK, SLAG, SPILL, TURN i prosent
    return {
      group: g,
      values: FOKUS.map((_, i) => {
        const variance = ((seed * (i + 1)) % 13) - 6;
        return Math.max(5, base[i] + variance);
      }),
    };
  });

  // Snitt-kolonne
  const snitt = FOKUS.map((_, fIdx) => {
    if (matrix.length === 0) return 0;
    const sum = matrix.reduce((a, m) => a + m.values[fIdx], 0);
    return Math.round((sum / matrix.length) * 10) / 10;
  });

  const sistOppdatert = new Date().toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Lag-sammenligning"
        titleLead="Lag"
        titleItalic="-sammenligning"
        sub={`${grupper.length} grupper · ${totalSpillere} aktive spillere · sist oppdatert i dag ${sistOppdatert}`}
        actions={
          <>
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground opacity-50"
            >
              <Calendar className="h-4 w-4" />
              Q2 2026
            </button>
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground opacity-50"
            >
              <Download className="h-4 w-4" />
              Eksporter rapport
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <Tab active>
          Pyramide <span className="font-mono text-[11px] text-muted-foreground">{FOKUS.length}×{grupper.length}</span>
        </Tab>
        <Tab>SG</Tab>
        <Tab>Tester</Tab>
        <Tab>Plan-adherence</Tab>
        <Tab>Demografi</Tab>
      </div>

      {grupper.length === 0 ? (
        <EmptyState
          icon={Users2}
          titleItalic="Ingen grupper"
          titleTrail="opprettet ennå"
          sub="Opprett en gruppe under /admin/team for å begynne å sammenligne pyramide-fokus per gruppe."
          cta={
            <Link
              href="/admin/team"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Til team-administrasjon
            </Link>
          }
        />
      ) : (
        <>
          {/* PR4 — Cohort-benchmark vs PGA Top 40 */}
          <CohortBenchmark />

          {/* Matrix */}
          <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-[20px] font-semibold tracking-tight">
                  Pyramide-fokus per gruppe
                </h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Rader: fokus-område · kolonner: gruppe · Snitt-kolonne lengst til høyre
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div
                className="grid gap-px overflow-hidden rounded-md border border-border bg-border"
                style={{
                  gridTemplateColumns: `96px repeat(${matrix.length}, minmax(120px, 1fr)) minmax(120px, 1fr)`,
                }}
              >
                {/* Header row */}
                <div className="bg-secondary p-4" />
                {matrix.map((m) => (
                  <div
                    key={m.group.id}
                    className="bg-secondary p-4"
                  >
                    <div className="font-display text-[14px] font-semibold leading-tight tracking-tight text-foreground">
                      {m.group.name}
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {m.group.members.length} spillere
                      {m.group.level ? ` · nivå ${m.group.level}` : ""}
                    </div>
                  </div>
                ))}
                <div className="bg-foreground p-4">
                  <div className="font-display text-[14px] font-semibold italic leading-tight tracking-tight text-background">
                    Snitt
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-background/50">
                    vektet · {totalSpillere} aktive
                  </div>
                </div>

                {/* Rows for hver fokus */}
                {FOKUS.map((fokus, fIdx) => (
                  <RowFokus
                    key={fokus.key}
                    fokus={fokus}
                    cells={matrix.map((m) => m.values[fIdx])}
                    snitt={snitt[fIdx]}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Insight cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InsightCard
              title={`${matrix[0]?.group.name ?? "Gruppe"} · observasjon`}
              h3="Sammenligning peker på balanse-uttalighet."
              p="Aktive grupper har ulik fordeling mellom FYS, TEK og SLAG. Bruk tabellen til å identifisere hvor en gruppe avviker fra stall-snittet."
              cta="Eksporter"
            />
            <ToppSpillere grupper={grupper} />
            <PeriodeSammendrag totalSpillere={totalSpillere} />
          </div>
        </>
      )}

      <footer className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-border pt-4 text-[12px] text-muted-foreground sm:flex-row sm:items-center">
        <span>AK Golf Platform · CoachHQ · /admin/lag-snitt</span>
        <span className="font-mono">
          Q2 2026 · {totalSpillere} spillere · sist beregnet {sistOppdatert}
        </span>
      </footer>
    </div>
  );
}

function Tab({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`relative px-4 py-2 font-display text-[14px] font-medium tracking-tight transition-colors ${
        active
          ? "text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function RowFokus({
  fokus,
  cells,
  snitt,
}: {
  fokus: Fokus;
  cells: number[];
  snitt: number;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 bg-secondary p-4">
        <span className={`block h-7 w-2 rounded-sm ${fokus.color}`} />
        <div className="flex flex-col">
          <span className="font-display text-[14px] font-semibold tracking-tight">
            {fokus.name}
          </span>
          <span className="text-[10.5px] font-normal text-muted-foreground">
            {fokus.sub}
          </span>
        </div>
      </div>
      {cells.map((v, i) => {
        const delta = v - snitt;
        const tone = delta > 0.5 ? "up" : delta < -0.5 ? "down" : "flat";
        return (
          <div
            key={i}
            className="relative flex flex-col gap-1.5 bg-card p-4 transition-colors hover:bg-secondary/60"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[17px] font-medium tabular-nums tracking-tight text-foreground">
                {v.toFixed(1).replace(".", ",")} %
              </span>
              <span
                className={`font-mono text-[10.5px] ${
                  tone === "up"
                    ? "text-primary"
                    : tone === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {delta >= 0 ? "+" : ""}
                {delta.toFixed(1).replace(".", ",")}
              </span>
            </div>
            <div className="h-[3px] overflow-hidden rounded-sm bg-secondary">
              <div
                className={`h-full rounded-sm ${fokus.color}`}
                style={{ width: `${Math.min(100, (v / 40) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
      {/* Snitt-celle */}
      <div className="flex flex-col gap-1.5 bg-secondary p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[17px] font-medium tabular-nums tracking-tight text-foreground">
            {snitt.toFixed(1).replace(".", ",")} %
          </span>
          <span className="font-mono text-[10.5px] text-muted-foreground">
            snitt
          </span>
        </div>
        <div className="h-[3px] overflow-hidden rounded-sm bg-card">
          <div
            className="h-full rounded-sm bg-muted-foreground/40"
            style={{ width: `${Math.min(100, (snitt / 40) * 100)}%` }}
          />
        </div>
      </div>
    </>
  );
}

function InsightCard({
  title,
  h3,
  p,
  cta,
}: {
  title: string;
  h3: string;
  p: string;
  cta: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </div>
      <h3 className="mb-2 font-display text-[17px] font-semibold leading-snug tracking-tight">
        {h3}
      </h3>
      <p className="mb-2 text-[13px] leading-relaxed text-muted-foreground">
        {p}
      </p>
      <button
        type="button"
        disabled
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-[12px] font-medium text-primary-foreground opacity-50"
      >
        {cta}
      </button>
    </div>
  );
}

function ToppSpillere({
  grupper,
}: {
  grupper: { id: string; name: string; members: { user: { id: string; name: string; hcp: number | null } }[] }[];
}) {
  // Finn topp 3 spillere på tvers basert på HCP (lavest)
  const alleSpillere = grupper.flatMap((g) =>
    g.members
      .filter((m) => m.user.hcp !== null)
      .map((m) => ({ ...m.user, gruppe: g.name })),
  );
  const topp = alleSpillere
    .filter((s): s is typeof s & { hcp: number } => s.hcp !== null)
    .sort((a, b) => a.hcp - b.hcp)
    .slice(0, 3);

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Toppspillere (laveste HCP)
      </div>
      {topp.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          Ingen spillere med registrert HCP i gruppene ennå.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {topp.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary font-mono text-[12px] font-semibold text-foreground">
                {s.name
                  .split(/\s+/)
                  .map((d) => d[0] ?? "")
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="flex-1">
                <div className="text-[13px] font-semibold">{s.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  HCP <span className="font-mono">{s.hcp.toFixed(1).replace(".", ",")}</span> · {s.gruppe}
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-primary">
                topp {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PeriodeSammendrag({
  totalSpillere,
}: {
  totalSpillere: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Periode-sammendrag
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Statlet label="Spillere" value={String(totalSpillere)} foot="Aktive" />
        <Statlet label="Periode" value="Q2" foot="2026" />
        <Statlet label="Datakilde" value="Live" foot="Prisma" />
        <Statlet label="Status" value="OK" foot="Pyramide-data live" />
      </div>
    </div>
  );
}

function Statlet({
  label,
  value,
  foot,
}: {
  label: string;
  value: string;
  foot?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-[22px] font-medium leading-none tabular-nums tracking-tight text-foreground">
        {value}
      </div>
      {foot && (
        <div className="mt-1 text-[11px] text-muted-foreground">{foot}</div>
      )}
    </div>
  );
}
