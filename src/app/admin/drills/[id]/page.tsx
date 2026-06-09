/**
 * AgencyOS — Drill-detalj
 * Viser én ExerciseDefinition i full bredde.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type {
  PyramidArea,
  SkillArea,
  NgfKategori,
} from "@/generated/prisma/enums";
import { DrillDetailActions } from "./drill-detail-actions";
import { safeUrl } from "@/lib/security/safe-url";

const NGF_ORDER: readonly NgfKategori[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
] as const;

const DISCIPLIN_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slagkvalitet",
  SPILL: "Spill",
  TURN: "Turnering",
};

const SKILL_LABEL: Record<SkillArea, string> = {
  TEE_TOTAL: "Tee total",
  TILNAERMING: "Tilnaerming",
  AROUND_GREEN: "Rundt green",
  PUTTING: "Putting",
  SPILL: "Spill",
};

export default async function DrillDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const drill = await prisma.exerciseDefinition.findUnique({
    where: { id },
    include: {
      _count: { select: { sessionDrills: true } },
    },
  });
  if (!drill) notFound();

  // Hent prerequisites-navn fra ID-listen
  const prereqDrills =
    drill.prerequisites.length > 0
      ? await prisma.exerciseDefinition.findMany({
          where: { id: { in: drill.prerequisites } },
          select: { id: true, name: true },
        })
      : [];

  const csTarget = drill.csTargetByKategori as
    | Partial<Record<NgfKategori, number>>
    | null;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Link
        href="/admin/drills"
        className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={12} strokeWidth={1.75} />
        Tilbake til biblioteket
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {DISCIPLIN_LABEL[drill.pyramidArea]}
            {drill.skillArea && ` · ${SKILL_LABEL[drill.skillArea]}`}
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">{drill.name}</em>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {drill.morad && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-accent/30 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-accent-foreground">
                <Star size={11} strokeWidth={1.75} />
                MORAD
              </span>
            )}
            {drill.kilde && (
              <span className="rounded-sm bg-secondary px-2 py-1 font-mono text-[10px] text-muted-foreground">
                {drill.kilde}
              </span>
            )}
            <span className="rounded-sm bg-secondary px-2 py-1 font-mono text-[10px] text-muted-foreground">
              Brukt i {drill._count.sessionDrills} oekt(er)
            </span>
          </div>
        </div>
        <DrillDetailActions
          drillId={drill.id}
          drillName={drill.name}
          hasSessions={drill._count.sessionDrills > 0}
        />
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <Card title="Beskrivelse">
            {drill.description ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {drill.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ingen beskrivelse lagret.
              </p>
            )}
          </Card>

          {drill.coachNotes && (
            <Card title="Coach-notater">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground italic">
                {drill.coachNotes}
              </p>
            </Card>
          )}

          <Card title="Nivaa-range">
            <NgfRangePlot
              min={drill.minKategori}
              max={drill.maxKategori}
            />
            <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px] text-muted-foreground sm:grid-cols-4">
              <Stat label="Min kategori" value={drill.minKategori ?? "-"} />
              <Stat label="Max kategori" value={drill.maxKategori ?? "-"} />
              <Stat
                label="HCP min"
                value={drill.minHcp !== null ? String(drill.minHcp) : "-"}
              />
              <Stat
                label="HCP max"
                value={drill.maxHcp !== null ? String(drill.maxHcp) : "-"}
              />
            </div>
          </Card>

          {csTarget && Object.keys(csTarget).length > 0 && (
            <Card title="csTarget per NGF-kategori">
              <table className="w-full font-mono text-[12px]">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                      Kategori
                    </th>
                    <th className="py-2 text-right text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                      csTarget
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {NGF_ORDER.filter((k) => csTarget[k] !== undefined).map(
                    (k) => (
                      <tr key={k} className="border-b border-border/40">
                        <td className="py-2 font-semibold text-foreground">
                          {k}
                        </td>
                        <td className="py-2 text-right tabular-nums text-foreground">
                          {csTarget[k]}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </Card>
          )}
        </section>

        <aside className="space-y-4">
          <Card title="Default oppsett">
            <dl className="space-y-2 font-mono text-[12px]">
              <Row
                label="Varighet"
                value={drill.durationMin ? `${drill.durationMin} min` : "-"}
              />
              <Row
                label="Intensitet"
                value={
                  typeof drill.intensitet === "number"
                    ? `${drill.intensitet}/10`
                    : "-"
                }
              />
              <Row
                label="Sets"
                value={drill.defaultSets ? String(drill.defaultSets) : "-"}
              />
              <Row
                label="Reps"
                value={drill.defaultReps ? String(drill.defaultReps) : "-"}
              />
              <Row label="repsSets-tekst" value={drill.defaultRepsSets ?? "-"} />
              <Row
                label="csMin/Max"
                value={
                  drill.csMin !== null || drill.csMax !== null
                    ? `${drill.csMin ?? "-"} / ${drill.csMax ?? "-"}`
                    : "-"
                }
              />
              <Row label="lPhase (primary)" value={drill.lPhase ?? "-"} />
            </dl>
          </Card>

          <Card title="Environment">
            {drill.environment.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {drill.environment.map((e) => (
                  <span
                    key={e}
                    className="rounded-sm bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em]"
                  >
                    {e}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ingen.</p>
            )}
          </Card>

          <Card title="Utstyr">
            {drill.utstyr.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {drill.utstyr.map((u) => (
                  <li key={u} className="text-foreground">
                    · {u}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Intet utstyr.</p>
            )}
          </Card>

          <Card title="L-faser">
            {drill.lPhases.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {drill.lPhases.map((p) => (
                  <span
                    key={p}
                    className="rounded-sm bg-primary/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-primary"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ingen.</p>
            )}
          </Card>

          {prereqDrills.length > 0 && (
            <Card title="Prerequisites">
              <ul className="space-y-1 text-sm">
                {prereqDrills.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/drills/${p.id}`}
                      className="text-primary hover:underline"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {drill.tags.length > 0 && (
            <Card title="Tags">
              <div className="flex flex-wrap gap-1.5">
                {drill.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-foreground/5 px-2 py-1 font-mono text-[10px] text-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {safeUrl(drill.videoUrl) && (
            <Card title="Video">
              <a
                href={safeUrl(drill.videoUrl)!}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-sm text-primary hover:underline"
              >
                {drill.videoUrl}
              </a>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span className="text-[13px] font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </dt>
      <dd className="tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function NgfRangePlot({
  min,
  max,
}: {
  min: NgfKategori | null;
  max: NgfKategori | null;
}) {
  const minIdx = min ? NGF_ORDER.indexOf(min) : 0;
  const maxIdx = max ? NGF_ORDER.indexOf(max) : NGF_ORDER.length - 1;
  return (
    <div className="space-y-2">
      <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
        {NGF_ORDER.map((_, i) => {
          const inRange = i >= minIdx && i <= maxIdx;
          return (
            <div
              key={i}
              className={`flex-1 ${
                inRange ? "bg-gradient-to-r from-primary to-accent" : ""
              }`}
            />
          );
        })}
      </div>
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        {NGF_ORDER.map((k, i) => (
          <span
            key={k}
            className={
              i >= minIdx && i <= maxIdx
                ? "font-semibold text-foreground"
                : ""
            }
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
