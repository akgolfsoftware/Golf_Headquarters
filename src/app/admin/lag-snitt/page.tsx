/**
 * AgencyOS — Lag-snitt-analyse (/admin/lag-snitt)
 *
 * Sammenligner pyramide-fordeling per gruppe på tvers av stallen. Rader =
 * fokusområde (FYS/TEK/SLAG/SPILL/TURN), kolonner = gruppe, siste kolonne =
 * vektet stall-snitt.
 *
 * EKTE DATA: fordelingen beregnes fra fullførte treningsøkter
 * (TrainingPlanSession med status=COMPLETED) per gruppemedlem, gruppert på
 * pyramidArea. Ingen falske tall — grupper uten loggede økter vises som tomme.
 *
 * Server component.
 */
import Link from "next/link";
import { Users2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type FokusKey = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

type Fokus = {
  key: FokusKey;
  name: string;
  sub: string;
  swatch: string;
};

const FOKUS: Fokus[] = [
  { key: "FYS", name: "FYS", sub: "fysisk fundament", swatch: "bg-pyr-fys" },
  { key: "TEK", name: "TEK", sub: "teknikk · golfsving", swatch: "bg-pyr-tek" },
  { key: "SLAG", name: "SLAG", sub: "slagprogresjon", swatch: "bg-pyr-slag" },
  { key: "SPILL", name: "SPILL", sub: "banespill · scoring", swatch: "bg-pyr-spill" },
  { key: "TURN", name: "TURN", sub: "turnering · konkurranse", swatch: "bg-pyr-turn" },
];

const fmtPct = (n: number) => `${n.toFixed(1).replace(".", ",")} %`;

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
    take: 8,
  });

  const totalSpillere = grupper.reduce((a, g) => a + g.members.length, 0);

  // ── EKTE pyramide-fordeling per gruppe ─────────────────────────
  // Tell fullførte økter per pyramidArea for hver gruppes medlemmer.
  const matrix = await Promise.all(
    grupper.map(async (g) => {
      const memberIds = g.members.map((m) => m.userId);
      const counts: Record<FokusKey, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };

      if (memberIds.length > 0) {
        const grouped = await prisma.trainingPlanSession.groupBy({
          by: ["pyramidArea"],
          where: {
            status: "COMPLETED",
            plan: { userId: { in: memberIds } },
          },
          _count: { _all: true },
        });
        for (const row of grouped) {
          counts[row.pyramidArea as FokusKey] = row._count._all;
        }
      }

      const total = FOKUS.reduce((a, f) => a + counts[f.key], 0);
      const values = FOKUS.map((f) => (total === 0 ? 0 : (counts[f.key] / total) * 100));
      return { group: g, counts, total, values };
    }),
  );

  const totalOkter = matrix.reduce((a, m) => a + m.total, 0);
  const harData = totalOkter > 0;

  // Vektet stall-snitt per fokus (vektet på antall økter per gruppe).
  const snitt = FOKUS.map((_, fIdx) => {
    if (!harData) return 0;
    const sumOkter = matrix.reduce((a, m) => a + m.counts[FOKUS[fIdx].key], 0);
    return (sumOkter / totalOkter) * 100;
  });

  const sistOppdatert = new Date().toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-1">
      {/* header */}
      <div className="mb-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          AGENCYOS · LAG-SNITT
        </span>
        <h1 className="mt-2 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
          Hvor legger <em className="font-normal italic text-primary">hver gruppe</em> treningstida?
        </h1>
        <p className="mt-1.5 max-w-[820px] text-sm leading-relaxed text-muted-foreground">
          Pyramide-fordeling per gruppe basert på fullførte økter — rader er fokusområde, kolonner er
          gruppe, siste kolonne er vektet stall-snitt.{" "}
          <b className="font-semibold text-foreground">{grupper.length}</b> grupper ·{" "}
          <b className="font-semibold text-foreground">{totalSpillere}</b> spillere ·{" "}
          {totalOkter} loggede økter.
        </p>
      </div>

      {grupper.length === 0 ? (
        <div className="pt-5">
          <EmptyState
            icon={Users2}
            titleItalic="Ingen grupper"
            titleTrail="opprettet ennå"
            sub="Opprett en gruppe under team-administrasjon for å begynne å sammenligne pyramide-fokus per gruppe."
            cta={
              <Link
                href="/admin/team"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Til team-administrasjon
              </Link>
            }
          />
        </div>
      ) : (
        <>
          {/* Matrix */}
          <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-wrap items-baseline gap-3 border-b border-border px-5 py-4">
              <h2 className="font-display text-[19px] font-bold tracking-[-0.02em] text-foreground">
                Pyramide-fokus per gruppe
              </h2>
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                {FOKUS.length}×{grupper.length} · FULLFØRTE ØKTER
              </span>
              <span className="ml-auto font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
                Vektet snitt · {totalSpillere} aktive
              </span>
            </div>

            {!harData ? (
              <div className="px-5 py-16 text-center">
                <p className="text-[13px] text-muted-foreground">
                  Ingen fullførte treningsøkter logget i gruppene ennå. Fordelingen beregnes så snart
                  spillerne begynner å fullføre planlagte økter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto p-5">
                <div
                  className="grid gap-px overflow-hidden rounded-lg border border-border bg-border"
                  style={{
                    gridTemplateColumns: `120px repeat(${matrix.length}, minmax(120px, 1fr)) minmax(120px, 1fr)`,
                  }}
                >
                  {/* Header row */}
                  <div className="bg-background p-4" />
                  {matrix.map((m) => (
                    <div key={m.group.id} className="bg-background p-4">
                      <div className="font-display text-[14px] font-bold leading-tight tracking-[-0.01em] text-foreground">
                        {m.group.name}
                      </div>
                      <div className="mt-1 font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                        {m.group.members.length} SPILLERE
                        {m.group.level ? ` · NIVÅ ${m.group.level}` : ""} · {m.total} ØKTER
                      </div>
                    </div>
                  ))}
                  <div className="bg-primary p-4">
                    <div className="font-display text-[14px] font-bold italic leading-tight tracking-[-0.01em] text-primary-foreground">
                      Snitt
                    </div>
                    <div className="mt-1 font-mono text-[9px] font-bold tracking-[0.04em] text-accent">
                      VEKTET · {totalOkter} ØKTER
                    </div>
                  </div>

                  {/* Rader for hver fokus */}
                  {FOKUS.map((fokus, fIdx) => (
                    <RowFokus
                      key={fokus.key}
                      fokus={fokus}
                      cells={matrix.map((m) => ({ value: m.values[fIdx], total: m.total }))}
                      snitt={snitt[fIdx]}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Insight-rad */}
          <div className="grid grid-cols-1 gap-3 pt-5 md:grid-cols-3">
            <ToppSpillere grupper={grupper} />
            <PeriodeSammendrag totalSpillere={totalSpillere} totalOkter={totalOkter} />
            <PrinsippKort />
          </div>
        </>
      )}

      <footer className="mt-5 flex flex-col items-start justify-between gap-2 border-t border-border pt-4 font-mono text-[10px] tracking-[0.04em] text-muted-foreground sm:flex-row sm:items-center">
        <span>AGENCYOS · /ADMIN/LAG-SNITT</span>
        <span>
          {totalSpillere} SPILLERE · {totalOkter} ØKTER · SIST BEREGNET {sistOppdatert}
        </span>
      </footer>
    </div>
  );
}

function RowFokus({
  fokus,
  cells,
  snitt,
}: {
  fokus: Fokus;
  cells: { value: number; total: number }[];
  snitt: number;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 bg-background p-4">
        <span className={cn("block h-7 w-2 rounded-sm", fokus.swatch)} aria-hidden />
        <div className="flex flex-col leading-tight">
          <span className="font-display text-[14px] font-bold tracking-[-0.01em] text-foreground">
            {fokus.name}
          </span>
          <span className="text-[10.5px] text-muted-foreground">{fokus.sub}</span>
        </div>
      </div>
      {cells.map((c, i) => {
        const delta = c.value - snitt;
        const tone = delta > 0.5 ? "up" : delta < -0.5 ? "down" : "flat";
        return (
          <div
            key={i}
            className="relative flex flex-col gap-1.5 bg-card p-4 transition-colors hover:bg-primary/[0.025]"
          >
            {c.total === 0 ? (
              <span className="font-mono text-[12px] text-muted-foreground">—</span>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[17px] font-bold tabular-nums tracking-[-0.01em] text-foreground">
                    {fmtPct(c.value)}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10.5px] font-bold",
                      tone === "up" ? "text-primary" : tone === "down" ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {delta >= 0 ? "+" : ""}
                    {delta.toFixed(1).replace(".", ",")}
                  </span>
                </div>
                <div className="h-[3px] overflow-hidden rounded-sm bg-secondary">
                  <div
                    className={cn("h-full rounded-sm", fokus.swatch)}
                    style={{ width: `${Math.min(100, (c.value / 40) * 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
      {/* Snitt-celle */}
      <div className="flex flex-col gap-1.5 bg-background p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[17px] font-bold tabular-nums tracking-[-0.01em] text-foreground">
            {fmtPct(snitt)}
          </span>
          <span className="font-mono text-[10.5px] font-bold text-muted-foreground">snitt</span>
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

function ToppSpillere({
  grupper,
}: {
  grupper: { id: string; name: string; members: { user: { id: string; name: string; hcp: number | null } }[] }[];
}) {
  const alleSpillere = grupper.flatMap((g) =>
    g.members.filter((m) => m.user.hcp !== null).map((m) => ({ ...m.user, gruppe: g.name })),
  );
  const topp = alleSpillere
    .filter((s): s is typeof s & { hcp: number } => s.hcp !== null)
    .sort((a, b) => a.hcp - b.hcp)
    .slice(0, 3);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        Toppspillere · laveste HCP
      </div>
      {topp.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          Ingen spillere med registrert HCP i gruppene ennå.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {topp.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary font-display text-[12px] font-bold text-foreground">
                {s.name
                  .split(/\s+/)
                  .map((d) => d[0] ?? "")
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[13px] font-bold text-foreground">{s.name}</div>
                <div className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                  HCP {s.hcp.toFixed(1).replace(".", ",")} · {s.gruppe}
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-primary">
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
  totalOkter,
}: {
  totalSpillere: number;
  totalOkter: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        Datagrunnlag
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Statlet label="Spillere" value={String(totalSpillere)} foot="aktive i grupper" />
        <Statlet label="Økter" value={String(totalOkter)} foot="fullført, logget" />
        <Statlet label="Kilde" value="Live" foot="TrainingPlanSession" />
        <Statlet label="Type" value="COMPLETED" foot="kun fullførte" />
      </div>
    </div>
  );
}

function PrinsippKort() {
  return (
    <div className="rounded-xl bg-primary p-5 text-primary-foreground">
      <div className="mb-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
        Hvordan lese tabellen
      </div>
      <p className="text-[13px] leading-relaxed text-primary-foreground/90">
        Fordelingen viser <b className="font-semibold text-accent">hvor tida faktisk gikk</b> — ikke
        plan, men logg. Avvik fra stall-snittet er ikke feil i seg selv: en konkurransegruppe skal ligge
        høyt på TURN, en utviklingsgruppe på TEK.
      </p>
    </div>
  );
}

function Statlet({ label, value, foot }: { label: string; value: string; foot?: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-[20px] font-bold leading-none tabular-nums tracking-[-0.01em] text-foreground">
        {value}
      </div>
      {foot && <div className="mt-1 text-[11px] text-muted-foreground">{foot}</div>}
    </div>
  );
}
