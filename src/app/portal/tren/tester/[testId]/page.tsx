import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Info, Table2, BarChart3 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Scorekort } from "./scorekort";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_PILL: Record<PyramidArea, string> = {
  FYS: "bg-primary/10 text-primary",
  TEK: "bg-primary/12 text-primary",
  SLAG: "bg-accent/40 text-accent-foreground",
  SPILL: "bg-accent/20 text-accent-foreground",
  TURN: "bg-secondary text-muted-foreground",
};

type Protocol = {
  totalShots: number;
  shots: Array<{
    nr: number;
    label: string;
    target?: number;
    category?: string;
  }>;
  inputFields: Array<{
    key: string;
    label: string;
    unit: string;
  }>;
  scoring: string;
  scoringDescription: string;
};

export default async function TestDetalj({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const user = await requirePortalUser();
  const { testId } = await params;

  const test = await prisma.testDefinition.findUnique({
    where: { id: testId },
  });
  if (!test) notFound();

  const resultater = await prisma.testResult.findMany({
    where: { userId: user.id, testId: test.id },
    orderBy: { takenAt: "asc" },
  });

  const protocol = test.protocol as Protocol | null;

  const minScore = resultater.length
    ? Math.min(...resultater.map((r) => r.score))
    : 0;
  const maxScore = resultater.length
    ? Math.max(...resultater.map((r) => r.score))
    : 100;
  const span = Math.max(maxScore - minScore, 1);

  const snitt =
    resultater.length > 0
      ? resultater.reduce((s, r) => s + r.score, 0) / resultater.length
      : 0;
  const best = resultater.length > 0 ? maxScore : 0;
  const siste =
    resultater.length > 0 ? resultater[resultater.length - 1] : null;

  const navnOrd = test.name.trim().split(" ");
  const titleItalic =
    navnOrd.length > 1 ? navnOrd[navnOrd.length - 1] : test.name;
  const titleLead =
    navnOrd.length > 1 ? navnOrd.slice(0, -1).join(" ") : undefined;

  return (
    <div className="space-y-8">
      <Link
        href="/portal/tren/tester"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Alle tester
      </Link>

      <div className="flex items-start justify-between gap-4">
        <PageHeader
          eyebrow={`PlayerHQ · Trening · ${PYR_LABEL[test.pyramidArea]}`}
          titleLead={titleLead}
          titleItalic={titleItalic}
        />
        <span
          className={`mt-2 shrink-0 rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${PYR_PILL[test.pyramidArea]}`}
        >
          {PYR_LABEL[test.pyramidArea]}
        </span>
      </div>

      {/* Stat-kort (kun hvis resultater finnes) */}
      {resultater.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Siste"
            value={siste!.score.toFixed(1).replace(".", ",")}
            sub={siste!.takenAt.toLocaleDateString("nb-NO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          />
          <StatCard
            label="Best"
            value={best.toFixed(1).replace(".", ",")}
            sub={`${resultater.length} forsøk`}
            highlight
          />
          <StatCard
            label="Snitt"
            value={snitt.toFixed(1).replace(".", ",")}
            sub="Over alle forsøk"
          />
        </div>
      )}

      {/* Seksjon 1: Forklaring */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Info size={16} strokeWidth={1.5} className="text-muted-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Forklaring
          </span>
        </div>
        {test.description && (
          <p className="mt-3 text-sm leading-relaxed text-foreground">
            {test.description}
          </p>
        )}
        <div className="mt-4 rounded-md bg-muted/30 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Scoring
          </span>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {test.scoringRule}
          </p>
        </div>
        {protocol && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>
              <strong className="text-foreground">{protocol.totalShots}</strong>{" "}
              slag totalt
            </span>
            <span>
              <strong className="text-foreground">
                {protocol.inputFields.length}
              </strong>{" "}
              verdier per slag
            </span>
            {protocol.inputFields.map((f) => (
              <span key={f.key}>
                {f.label} ({f.unit})
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Seksjon 2: Scorekort */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Table2
            size={16}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Scorekort — Ta testen
          </span>
        </div>
        {protocol ? (
          <Scorekort testId={test.id} protocol={protocol} />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Denne testen har ikke et digitalt scorekort enda. Kontakt coach for
              å registrere resultat manuelt.
            </p>
          </div>
        )}
      </section>

      {/* Seksjon 3: Historikk */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <BarChart3
            size={16}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Min historikk
          </span>
          {resultater.length > 0 && (
            <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
              {resultater.length} forsøk
            </span>
          )}
        </div>

        {resultater.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={ClipboardList}
              titleItalic="Ingen forsøk"
              titleTrail="enda"
              sub="Fyll inn scorekortet over for å registrere ditt første forsøk."
            />
          </div>
        ) : (
          <>
            {/* Progresjonsgraf */}
            <div className="mt-4 h-32 w-full">
              <svg viewBox="0 0 400 100" className="h-full w-full">
                {resultater.map((r, i) => {
                  if (i === 0) return null;
                  const prev = resultater[i - 1];
                  const x1 =
                    ((i - 1) / Math.max(resultater.length - 1, 1)) * 400;
                  const x2 = (i / Math.max(resultater.length - 1, 1)) * 400;
                  const y1 =
                    100 - ((prev.score - minScore) / span) * 80 - 10;
                  const y2 = 100 - ((r.score - minScore) / span) * 80 - 10;
                  return (
                    <line
                      key={r.id}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  );
                })}
                {resultater.map((r, i) => {
                  const x = (i / Math.max(resultater.length - 1, 1)) * 400;
                  const y = 100 - ((r.score - minScore) / span) * 80 - 10;
                  return (
                    <circle
                      key={r.id}
                      cx={x}
                      cy={y}
                      r={3}
                      fill="hsl(var(--primary))"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Resultatliste */}
            <ul className="mt-4 divide-y divide-border">
              {[...resultater].reverse().map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {r.takenAt.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    {r.notes && (
                      <div className="mt-1 text-xs italic text-muted-foreground">
                        {r.notes}
                      </div>
                    )}
                  </div>
                  <div className="font-display text-lg font-semibold tabular-nums text-foreground">
                    {r.score.toFixed(1).replace(".", ",")}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-3xl font-semibold tabular-nums leading-none ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
