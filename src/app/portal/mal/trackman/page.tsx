/**
 * PlayerHQ · Mål · TrackMan
 *
 * Endelig design — basert på wireframe playerhq-A/05-trackman.html.
 * Action-strip, klubb-rail, trajectory-graf, KPI-strip og bento med
 * dispersion + sammenlikning. Per-slag-data er TODO; KPI-paneler viser
 * placeholder inntil schema utvides.
 */
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Lock,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CsvImportModal } from "./csv-import-modal";

export default async function TrackManPage() {
  const user = await requirePortalUser();

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
    take: 50,
  });

  const total = sessions.length;
  const totalSlag = sessions.reduce((s, x) => s + x.shotCount, 0);
  const sisteOkt = sessions[0];

  // 30-dagers vindu for trend-banner
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const okter30d = sessions.filter(
    (s) => s.recordedAt.getTime() > thirtyDaysAgo,
  );
  const slag30d = okter30d.reduce((s, x) => s + x.shotCount, 0);

  if (total === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="PlayerHQ · /portal/mal/trackman"
          titleLead="0 økter"
          titleItalic="med radar"
          titleTrail={user.name ? `, ${user.name.split(" ")[0]}.` : "."}
          sub="Eksporter CSV fra TrackMan og last opp for å se trender."
          actions={<CsvImportModal />}
        />
        <EmptyState
          icon={Activity}
          titleItalic="Ingen TrackMan-økter"
          titleTrail="importert ennå"
          sub="Importer din første økt for å se carry-trend, smash-utvikling og klubb-sammenligning over tid."
          cta={
            <div className="space-y-3">
              <div className="rounded-md bg-secondary p-3 text-left font-mono text-[11px] leading-relaxed text-muted-foreground">
                <strong className="text-foreground">
                  Hvordan eksportere fra TrackMan:
                </strong>
                <br />
                Åpne TrackMan-appen → Sessions → velg økten → Export → CSV.
                Eller ta screenshot fra Performance-skjermen — vi bruker OCR.
              </div>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card text-foreground">
      <div className="mx-auto max-w-[1280px] space-y-4 px-2 py-2">
        {/* Hero */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              TrackMan · sesong {new Date().getFullYear()} · trendvisning
            </div>
            <h1 className="font-display text-[22px] sm:text-[28px] md:text-[36px] font-medium italic leading-[1.1] tracking-tight">
              <em className="italic">Min sving</em> over tid
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                <Lock className="h-2.5 w-2.5" />
                Pro
              </span>
              <Dot />
              <span>Trendvisning på tvers av økter</span>
              <Dot />
              <span>
                <b className="text-primary">{okter30d.length} økter</b> siste 30
                d ·{" "}
                <b className="text-primary">
                  {slag30d.toLocaleString("nb-NO")} slag
                </b>{" "}
                totalt
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <CsvImportModal />
            <button
              type="button"
              disabled
              title="Kommer i v2"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground opacity-60"
            >
              Eksporter til Strokes Gained
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Action-strip */}
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-4 py-3">
          <span className="mr-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Sving-status
          </span>
          <StatusChip
            tone="success"
            body={
              <>
                <b>{okter30d.length}</b> økter / 30d
              </>
            }
          />
          <StatusChip
            body={
              <>
                <b>{slag30d.toLocaleString("nb-NO")}</b> slag
              </>
            }
          />
          <StatusChip
            body={
              <>
                Snitt <b>{okter30d.length > 0 ? Math.round(slag30d / okter30d.length) : 0}</b> slag/økt
              </>
            }
          />
          {/* TODO: Per-slag-data for driver carry, launch, target-% */}
          <StatusChip tone="muted" body={<>Per-slag-trender krever utvidet import</>} />
        </div>

        {/* Klubb-rail — TODO: per-slag per klubb */}
        <div className="flex items-center gap-2 overflow-x-auto rounded-md border border-border bg-card px-4 py-3">
          <span className="mr-1 shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Per kølle
          </span>
          {/* TODO: Aggreger fra rawJson per slag */}
          {["Driver", "3W", "5-jern", "7-jern", "9-jern", "PW", "SW", "Putter"].map(
            (c) => (
              <button
                key={c}
                type="button"
                disabled
                title="Per-klubb-data kommer i v2"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-[13px] font-medium text-muted-foreground opacity-60"
              >
                {c}
                <span className="font-mono text-[11px] tabular-nums opacity-70">
                  —
                </span>
              </button>
            ),
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {/* Trajectory-card — TODO: bygg fra rawJson */}
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    7-jern · trajectory over tid
                  </div>
                  <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                    Hvordan slaget endrer seg
                  </h3>
                </div>
              </div>
              <div className="grid h-80 place-items-center rounded-md border border-dashed border-border bg-secondary/40 text-center">
                <div className="px-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Trajectory-graf
                  </div>
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    Vises når per-slag-data er importert. {total} økt
                    {total === 1 ? "" : "er"} har metadata, men ingen per-slag
                    detaljer ennå.
                  </p>
                </div>
              </div>
            </section>

            {/* KPI-strip — viser det vi har, resten er TODO */}
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <KpiCard
                label="Slag totalt"
                value={totalSlag.toLocaleString("nb-NO")}
                sub={`${total} økter`}
              />
              <KpiCard
                label="Snitt/økt"
                value={
                  total > 0 ? Math.round(totalSlag / total).toString() : "—"
                }
                sub="basert på loggede økter"
              />
              <KpiCard
                label="Snitt carry"
                value="—"
                unit=" m"
                sub="krever per-slag-data"
                muted
              />
              <KpiCard
                label="Launch"
                value="—"
                unit="°"
                sub="krever per-slag-data"
                muted
              />
              <KpiCard
                label="Smash"
                value="—"
                sub="krever per-slag-data"
                muted
              />
            </section>

            {/* Bento bottom — Dispersion + Compare (TODO: ekte data) */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_1fr]">
              <article className="rounded-lg border border-border bg-card px-6 py-5">
                <div className="mb-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Dispersion-pattern · 7-jern
                  </div>
                  <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                    Hvor lander ballen?
                  </h3>
                </div>
                <div className="grid min-h-[280px] place-items-center rounded-md border border-dashed border-border bg-secondary/40 px-6 text-center">
                  <p className="text-[13px] text-muted-foreground">
                    Dispersion-pattern vises når per-slag landingspunkt er
                    tilgjengelig fra TrackMan-eksporten.
                  </p>
                </div>
              </article>
              <article className="rounded-lg border border-border bg-card px-6 py-5">
                <div className="mb-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Sammenlikning · 7-jern
                  </div>
                  <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                    Hvor står du?
                  </h3>
                </div>
                <div className="grid h-[200px] place-items-center rounded-md border border-dashed border-border bg-secondary/40 px-6 text-center">
                  <p className="text-[13px] text-muted-foreground">
                    Benchmark mot baseline, HCP-jevngamle og pro vises når data
                    er klar.
                  </p>
                </div>
              </article>
            </section>

            {/* Sesjons-tabell — den virkelige dataen vi har nå */}
            <section className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="border-b border-border bg-secondary/60 px-6 py-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Alle økter · nyeste først
                </div>
                <h3 className="mt-1 font-display text-[16px] font-semibold leading-snug">
                  {total} importerte økter
                </h3>
              </div>
              <ul className="divide-y divide-border">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`/portal/mal/trackman/${s.id}`}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/40"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-sm font-medium text-foreground tabular-nums">
                          {s.recordedAt.toLocaleDateString("nb-NO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                          {s.recordedAt.toLocaleTimeString("nb-NO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {sourceLabel(s.source)}
                        </span>
                      </div>
                      <span className="font-mono text-[18px] font-semibold tabular-nums text-foreground">
                        {s.shotCount}
                      </span>
                      <span className="text-[12px] font-medium text-primary">
                        Detaljer →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Drawer — agent-funn (TODO: ekte agent) */}
          <aside className="sticky top-5 self-start overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border px-6 py-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Agent-funn
                {sisteOkt
                  ? ` · oppdatert ${sisteOkt.recordedAt.toLocaleDateString(
                      "nb-NO",
                      { day: "2-digit", month: "2-digit" },
                    )}`
                  : ""}
              </div>
              <h3 className="mt-1.5 font-display text-[18px] font-semibold leading-snug">
                Hva sier dataen?
              </h3>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {total} økter analysert
              </div>
            </div>

            <div className="border-b border-border px-6 py-4">
              <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Volum
              </div>
              <div className="rounded-md border-l-[3px] border-l-primary bg-secondary px-4 py-3 text-[12px] leading-relaxed">
                Du har logget{" "}
                <b className="font-semibold text-primary">
                  {slag30d.toLocaleString("nb-NO")} slag
                </b>{" "}
                fordelt på {okter30d.length} økter siste 30 dager.
              </div>
            </div>

            {/* TODO: Per-klubb agent-funn (launch, smash, spin-variasjon) */}
            <div className="border-b border-border px-6 py-4">
              <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Per-klubb funn
              </div>
              <div className="rounded-md border-l-[3px] border-l-border bg-secondary/40 px-4 py-3 text-[12px] italic leading-relaxed text-muted-foreground">
                Agent-funn per klubb vises når per-slag-data er importert.
              </div>
            </div>

            <div className="flex flex-col gap-2 px-6 py-4">
              <CsvImportModal />
              <Link
                href="/portal/coach/melding?type=trackman-vurdering"
                className="rounded-md border border-border bg-card px-4 py-2 text-center text-[13px] font-medium hover:bg-secondary"
              >
                Be om coach-vurdering
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    "csv-import": "CSV",
    api: "API",
    manual: "Manuell",
  };
  return map[source] ?? source;
}

function StatusChip({
  tone = "default",
  body,
}: {
  tone?: "default" | "success" | "info" | "muted";
  body: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    default:
      "border-border bg-card text-muted-foreground [&_b]:text-foreground",
    success:
      "border-primary/30 bg-primary/10 text-primary [&_b]:text-primary",
    info: "border-accent/40 bg-accent/20 text-accent-foreground [&_b]:text-foreground",
    muted:
      "border-border bg-secondary/40 text-muted-foreground [&_b]:text-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-[12px] font-medium [&_b]:font-mono [&_b]:font-medium [&_b]:tabular-nums ${styles[tone]}`}
    >
      {body}
    </span>
  );
}

function KpiCard({
  label,
  value,
  unit,
  sub,
  muted = false,
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  muted?: boolean;
}) {
  return (
    <article className="rounded-md border border-border bg-card p-4">
      <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mb-1 font-mono text-[26px] font-medium leading-tight tabular-nums ${
          muted ? "text-muted-foreground/60" : "text-foreground"
        }`}
      >
        {value}
        {unit && (
          <small className="text-[13px] font-normal text-muted-foreground">
            {unit}
          </small>
        )}
      </div>
      <div
        className={`font-mono text-[10px] ${
          muted ? "text-muted-foreground/60" : "text-primary"
        }`}
      >
        {sub}
      </div>
    </article>
  );
}

function Dot() {
  return <span className="inline-block h-1 w-1 rounded-full bg-border" />;
}
