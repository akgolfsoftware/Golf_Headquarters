/**
 * /admin/talent/[playerId] — K4 360-profil
 *
 * Komplett talent-profil: hero med avatar, 5 KPI-kort (radar-akser + total),
 * stor radar-chart, milepæler-timeline, redigerbare notater, hurtigvalg-grid.
 * Designet hentet fra src/app/talent-spiller-360-demo/page.tsx.
 *
 * Roller: COACH, ADMIN.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  GitCompare,
  Plus,
  Radar,
  Save,
  StickyNote,
  TrendingUp,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DetailShell } from "@/components/shared/detail-shell";
import { AthleticBadge } from "@/components/athletic/badge";
import { lagreNotater, loggMilepael } from "./actions";

type RadarKey = "fysisk" | "teknikk" | "taktikk" | "mental" | "motivasjon";
const AKSER: { key: RadarKey; label: string }[] = [
  { key: "fysisk", label: "Fysisk" },
  { key: "teknikk", label: "Teknikk" },
  { key: "taktikk", label: "Taktikk" },
  { key: "mental", label: "Mental" },
  { key: "motivasjon", label: "Motivasjon" },
];

type Milepael = { tittel: string; dato: string; beskrivelse?: string };

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

function formatDato(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function TalentProfil({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const { playerId } = await params;

  const t = await prisma.talentTracking.findUnique({
    where: { id: playerId },
    include: {
      user: { select: { id: true, name: true, hcp: true, email: true } },
    },
  });

  if (!t) notFound();

  const totalSnitt = (() => {
    const vals = AKSER.map((a) => t[a.key]).filter(
      (v): v is number => typeof v === "number",
    );
    if (vals.length === 0) return null;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  })();

  const rawMilepaeler: unknown = t.milepaeler;
  const milepaeler: Milepael[] = Array.isArray(rawMilepaeler)
    ? (rawMilepaeler as Milepael[])
    : [];

  const inkludertFra = formatDato(t.inkludertFra.toISOString());

  return (
    <DetailShell
      breadcrumb={[
        { label: "Talent", href: "/admin/talent" },
        { label: t.user.name ?? "Spiller" },
      ]}
      backHref="/admin/talent"
      title={
        <>
          <em
            className="not-italic"
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontStyle: "italic",
              color: "#005840",
            }}
          >
            {t.user.name?.split(" ")[0] ?? "Talent"}
          </em>
          {t.user.name?.split(" ").slice(1).join(" ") && (
            <> {t.user.name.split(" ").slice(1).join(" ")}</>
          )}
        </>
      }
      subtitle={`I talent-program siden ${inkludertFra}`}
      statusPill={<AthleticBadge variant="primary">{t.niva.toUpperCase()}</AthleticBadge>}
    >

      {/* Hero-card */}
      <section className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="grid h-[120px] w-[120px] shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <span className="font-display text-[44px] font-semibold leading-none">
              {initialer(t.user.name)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.10em] text-primary-foreground">
                {t.niva}
              </span>
              {t.klubb && (
                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-[11px] font-medium">
                  {t.klubb}
                </span>
              )}
              {t.region && (
                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-[11px] font-medium">
                  {t.region}
                </span>
              )}
              {t.user.hcp != null && (
                <span className="inline-flex items-center rounded-full bg-accent/30 px-3 py-1 text-[11px] font-medium">
                  HCP {t.user.hcp.toFixed(1).replace(".", ",")}
                </span>
              )}
            </div>
            <div className="mt-3 font-display text-[32px] font-semibold leading-tight">
              {t.user.name ?? "Uten navn"}
            </div>
            {t.user.email && (
              <div className="mt-1 text-[13px] text-muted-foreground">
                {t.user.email}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5 KPI-kort + total */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {AKSER.map((a) => (
          <div key={a.key} className="rounded-lg border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {a.label}
            </div>
            <div className="mt-2 font-mono text-[28px] font-semibold leading-none tabular-nums">
              {fmt1(t[a.key])}
            </div>
            <div className="mt-2 font-mono text-[10px] text-muted-foreground">
              /10
            </div>
          </div>
        ))}
        <div className="rounded-lg border border-primary/40 bg-primary p-6 text-primary-foreground">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-accent">
            Total-score
          </div>
          <div className="mt-2 font-mono text-[28px] font-semibold leading-none tabular-nums">
            {fmt1(totalSnitt)}
          </div>
          <div className="mt-2 font-mono text-[10px] opacity-80">
            <TrendingUp className="mr-1 inline h-3 w-3" strokeWidth={1.5} />
            snitt 5 akser
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Radar */}
        <section className="rounded-lg border border-border bg-card p-8">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <Radar className="h-3 w-3" strokeWidth={1.5} />
            Radar-profil
          </div>
          <RadarChart
            verdier={AKSER.map((a) => t[a.key] ?? 0)}
          />
        </section>

        {/* Milepæler timeline */}
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <Award className="mr-1 inline h-3 w-3" strokeWidth={1.5} />
              Milepæler ({milepaeler.length})
            </span>
          </div>

          <form action={loggMilepael} className="mb-6 space-y-2 rounded-md border border-input bg-background p-4">
            <input type="hidden" name="playerId" value={t.id} />
            <input
              type="text"
              name="tittel"
              placeholder="Tittel — f.eks. 'Vant Junior Tour Q1'"
              required
              minLength={2}
              maxLength={120}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-[13px] focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
            />
            <input
              type="text"
              name="beskrivelse"
              placeholder="Kort beskrivelse (valgfri)"
              maxLength={500}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-[13px] focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Logg milepæl
            </button>
          </form>

          {milepaeler.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">
              Ingen milepæler registrert ennå.
            </p>
          ) : (
            <ul className="space-y-4">
              {[...milepaeler].reverse().map((m, i) => (
                <li
                  key={i}
                  className="relative border-l-2 border-primary/30 pl-4"
                >
                  <span className="absolute -left-1.5 top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {formatDato(m.dato)}
                  </div>
                  <div className="mt-1 text-[13px] font-semibold leading-tight">
                    {m.tittel}
                  </div>
                  {m.beskrivelse && (
                    <div className="mt-1 text-[12px] text-muted-foreground">
                      {m.beskrivelse}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Notater */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <StickyNote className="h-3 w-3" strokeWidth={1.5} />
          Notater
        </div>
        <form action={lagreNotater} className="space-y-3">
          <input type="hidden" name="playerId" value={t.id} />
          <textarea
            name="notater"
            defaultValue={t.notater ?? ""}
            rows={6}
            maxLength={5000}
            placeholder="Observasjoner, mål, treningsfokus, langsiktige notater …"
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-[13px] leading-relaxed focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Save className="h-4 w-4" strokeWidth={1.5} />
            Lagre notater
          </button>
        </form>
      </section>

      {/* Hurtigvalg-grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href={`/admin/talent/sammenligning?ids=${t.id}`}
          className="group flex items-start gap-3 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40"
        >
          <GitCompare className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
          <div>
            <div className="text-[13px] font-semibold">Åpne i sammenligning</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Side-by-side med andre talent
            </div>
          </div>
          <ArrowRight
            className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1"
            strokeWidth={1.5}
          />
        </Link>
        <Link
          href={`/admin/talent/kohort#${t.niva}`}
          className="group flex items-start gap-3 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40"
        >
          <Radar className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
          <div>
            <div className="text-[13px] font-semibold">Se {t.niva}-kohort</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Snitt-radar for samme nivå
            </div>
          </div>
          <ArrowRight
            className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1"
            strokeWidth={1.5}
          />
        </Link>
        <Link
          href="/admin/talent/ressurser"
          className="group flex items-start gap-3 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40"
        >
          <Award className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
          <div>
            <div className="text-[13px] font-semibold">Ressurs-bibliotek</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Videoer og artikler for {t.niva}
            </div>
          </div>
          <ArrowRight
            className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1"
            strokeWidth={1.5}
          />
        </Link>
      </section>
    </DetailShell>
  );
}

function RadarChart({ verdier }: { verdier: number[] }) {
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 60;
  const n = AKSER.length;
  const angles = Array.from({ length: n }, (_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / n);

  const points = verdier.map((v, i) => {
    const r = (v / 10) * radius;
    return [cx + Math.cos(angles[i]!) * r, cy + Math.sin(angles[i]!) * r] as [number, number];
  });

  const rings = [2, 4, 6, 8, 10];

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[480px]">
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
        <polygon
          points={points.map((p) => p.join(",")).join(" ")}
          fill="var(--color-primary)"
          fillOpacity={0.2}
          stroke="var(--color-primary)"
          strokeWidth={2.5}
        />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5} fill="var(--color-primary)" />
        ))}
      </svg>
    </div>
  );
}
