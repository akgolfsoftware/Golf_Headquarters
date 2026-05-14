/**
 * /admin/talent/sammenligning — K3 Sammenlign 2-3 spillere
 *
 * URL: ?ids=id1,id2,id3 — henter 2-3 spillere fra TalentTracking
 * og viser dem side-by-side med overlapping radar-chart.
 * Designet hentet fra src/app/talent-sammenlign-to-demo/page.tsx.
 *
 * Roller: COACH, ADMIN.
 */

import Link from "next/link";
import { ArrowLeft, Layers, Users } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

type RadarKey = "fysisk" | "teknikk" | "taktikk" | "mental" | "motivasjon";
const AKSER: { key: RadarKey; label: string }[] = [
  { key: "fysisk", label: "Fysisk" },
  { key: "teknikk", label: "Teknikk" },
  { key: "taktikk", label: "Taktikk" },
  { key: "mental", label: "Mental" },
  { key: "motivasjon", label: "Motivasjon" },
];

// Tre tokens-baserte farger for spillerne (ingen hex).
const COLORS = [
  { stroke: "var(--color-primary)", fill: "var(--color-primary)", opacity: 0.18 },
  { stroke: "var(--color-accent)", fill: "var(--color-accent)", opacity: 0.22 },
  { stroke: "var(--color-destructive)", fill: "var(--color-destructive)", opacity: 0.15 },
];

function initialer(name: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function fmt1(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toFixed(1).replace(".", ",");
}

type Search = Promise<{ ids?: string }>;

export default async function TalentSammenligning({
  searchParams,
}: {
  searchParams: Search;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sp = await searchParams;
  const idsRaw = (sp.ids ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const tracking =
    idsRaw.length > 0
      ? await prisma.talentTracking.findMany({
          where: { id: { in: idsRaw } },
          include: {
            user: { select: { id: true, name: true, hcp: true } },
          },
        })
      : [];

  // Bevar URL-rekkefølge
  const spillere = idsRaw
    .map((id) => tracking.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Talent · Sammenligning"
        titleItalic="Side-by-side"
        titleTrail={spillere.length > 0 ? ` · ${spillere.length} spillere` : ""}
        sub="2–3 talent sammenlignet på radar-akser og total-score. Bruk ?ids=… i URL."
        actions={
          <Link
            href="/admin/talent"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Tilbake
          </Link>
        }
      />

      {spillere.length === 0 ? (
        <EmptyState
          icon={Users}
          titleItalic="Velg spillere"
          titleTrail="å sammenligne"
          sub="Legg til ?ids=id1,id2 i URL — eller åpne fra en talent-profil med 'Åpne i sammenligning'."
        />
      ) : (
        <>
          {/* Hero — navnerad */}
          <section
            className={`grid gap-4 ${spillere.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
          >
            {spillere.map((t, i) => {
              const c = COLORS[i % COLORS.length]!;
              return (
                <div
                  key={t.id}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="grid h-16 w-16 place-items-center rounded-full text-primary-foreground"
                      style={{ background: c.stroke }}
                    >
                      <span className="font-display text-[22px] font-semibold leading-none">
                        {initialer(t.user.name)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        {t.niva}
                      </span>
                      <div className="mt-1 font-display text-[20px] font-semibold leading-tight">
                        {t.user.name ?? "Uten navn"}
                      </div>
                      <div className="mt-1 text-[12px] text-muted-foreground">
                        {t.klubb ?? "—"}
                        {t.region ? ` · ${t.region}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {AKSER.map((a) => (
                      <div key={a.key}>
                        <div className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                          {a.label.slice(0, 4)}
                        </div>
                        <div className="mt-1 font-mono text-[16px] font-semibold tabular-nums leading-none">
                          {fmt1(t[a.key])}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Radar overlay */}
          <section className="rounded-lg border border-border bg-card p-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <Layers className="mr-1 inline h-3 w-3" strokeWidth={1.5} />
                Overlapping radar (1–10)
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {spillere.map((t, i) => {
                  const c = COLORS[i % COLORS.length]!;
                  return (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1.5 text-[12px]"
                    >
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ background: c.stroke }}
                      />
                      {t.user.name ?? "Uten navn"}
                    </span>
                  );
                })}
              </div>
            </div>
            <RadarOverlay
              spillere={spillere.map((t) => ({
                navn: t.user.name ?? "Uten navn",
                verdier: AKSER.map((a) => t[a.key] ?? 0),
              }))}
            />
          </section>
        </>
      )}
    </div>
  );
}

function RadarOverlay({
  spillere,
}: {
  spillere: { navn: string; verdier: number[] }[];
}) {
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 60;
  const n = AKSER.length;
  const angles = Array.from({ length: n }, (_, i) => (-Math.PI / 2) + (i * 2 * Math.PI) / n);

  const point = (i: number, v: number): [number, number] => {
    const r = (v / 10) * radius;
    return [cx + Math.cos(angles[i]!) * r, cy + Math.sin(angles[i]!) * r];
  };

  // Ring-nivåer (2,4,6,8,10)
  const rings = [2, 4, 6, 8, 10];

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[480px]">
        {/* Rings */}
        {rings.map((r) => (
          <polygon
            key={r}
            points={angles
              .map((a) => {
                const rr = (r / 10) * radius;
                return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`;
              })
              .join(" ")}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={1}
            opacity={r === 10 ? 0.8 : 0.4}
          />
        ))}
        {/* Akser */}
        {angles.map((a, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(a) * radius}
            y2={cy + Math.sin(a) * radius}
            stroke="var(--color-border)"
            strokeWidth={1}
            opacity={0.5}
          />
        ))}
        {/* Akse-labels */}
        {angles.map((a, i) => {
          const x = cx + Math.cos(a) * (radius + 24);
          const y = cy + Math.sin(a) * (radius + 24);
          return (
            <text
              key={`l${i}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="var(--font-geist-mono)"
              fontSize="11"
              fontWeight={600}
              fill="var(--color-foreground)"
            >
              {AKSER[i]!.label}
            </text>
          );
        })}
        {/* Spiller-polygoner */}
        {spillere.map((s, idx) => {
          const c = COLORS[idx % COLORS.length]!;
          const pts = s.verdier.map((v, i) => point(i, v));
          const polyPts = pts.map((p) => p.join(",")).join(" ");
          return (
            <g key={idx}>
              <polygon
                points={polyPts}
                fill={c.fill}
                fillOpacity={c.opacity}
                stroke={c.stroke}
                strokeWidth={2}
              />
              {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={4} fill={c.stroke} />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
