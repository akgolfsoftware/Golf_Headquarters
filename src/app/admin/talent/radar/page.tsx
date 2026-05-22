/**
 * CoachHQ — Talent · Radar-oversikt
 *
 * Design: 06 Talent-modul.html · Skjerm 3 (Sammenligning) + radar-plot
 * Liste over alle spillere med radar-score + kvartil-plots per akse
 *
 * Roller: COACH, ADMIN.
 */
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { avatarBg } from "@/lib/avatar-colors";
import "@/components/talent/talent.css";

type RadarKey = "fysisk" | "teknikk" | "taktikk" | "mental" | "motivasjon";
const RADAR_AKSER: { key: RadarKey; label: string }[] = [
  { key: "fysisk", label: "Fysisk" },
  { key: "teknikk", label: "Teknikk" },
  { key: "taktikk", label: "Taktikk" },
  { key: "mental", label: "Mental" },
  { key: "motivasjon", label: "Motivasjon" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function snittAxe(
  rows: Array<Partial<Record<RadarKey, number | null>>>,
  key: RadarKey,
): number {
  const vals = rows.map((r) => r[key]).filter((v): v is number => typeof v === "number");
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

// SVG radar polygon for en 5-akse radar (r=80, center=90,90)
function radarPoints(
  values: Array<number | null>,
  max: number,
  r: number,
  cx: number,
  cy: number,
): string {
  const n = values.length;
  return values
    .map((v, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      const pct = (v ?? 0) / max;
      const x = cx + pct * r * Math.cos(angle);
      const y = cy + pct * r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

// Kvartil-box-plot SVG
function BoxPlotSvg({
  scores,
  current,
}: {
  scores: number[];
  current: number | null;
}) {
  if (scores.length < 2 || current === null) {
    return (
      <svg viewBox="0 0 240 40" className="h-10 w-full" aria-hidden="true">
        <text x="120" y="24" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#9D9C95">Ikke nok data</text>
      </svg>
    );
  }
  const sorted = [...scores].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const span = Math.max(max - min, 1);
  const toX = (v: number) => 10 + ((v - min) / span) * 220;

  return (
    <svg viewBox="0 0 240 40" className="h-10 w-full" aria-hidden="true">
      <line x1="10" y1="20" x2="230" y2="20" stroke="#E5E3DD" strokeWidth="1" />
      <line x1={toX(min)} y1="20" x2={toX(q1)} y2="20" stroke="#005840" strokeWidth="2" />
      <line x1={toX(min)} y1="14" x2={toX(min)} y2="26" stroke="#005840" strokeWidth="2" />
      <rect x={toX(q1)} y="10" width={toX(q3) - toX(q1)} height="20" fill="#005840" fillOpacity="0.6" rx="2" />
      <line x1={toX(median)} y1="8" x2={toX(median)} y2="32" stroke="#D1F843" strokeWidth="3" />
      <line x1={toX(q3)} y1="20" x2={toX(max)} y2="20" stroke="#005840" strokeWidth="2" />
      <line x1={toX(max)} y1="14" x2={toX(max)} y2="26" stroke="#005840" strokeWidth="2" />
      <circle cx={toX(current)} cy="20" r="8" fill="#D1F843" stroke="#005840" strokeWidth="2" />
      <text x={toX(current)} y="24" textAnchor="middle" fontFamily="monospace" fontSize="7" fontWeight="700" fill="#0A1F17">
        {current.toFixed(0)}
      </text>
    </svg>
  );
}

export default async function TalentRadarPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const spillere = await prisma.talentTracking.findMany({
    include: { user: { select: { id: true, name: true, hcp: true } } },
    orderBy: { updatedAt: "desc" },
  });

  // Global snitt per akse
  const globalSnitt: Record<RadarKey, number> = {
    fysisk: snittAxe(spillere, "fysisk"),
    teknikk: snittAxe(spillere, "teknikk"),
    taktikk: snittAxe(spillere, "taktikk"),
    mental: snittAxe(spillere, "mental"),
    motivasjon: snittAxe(spillere, "motivasjon"),
  };

  // Alle scores per akse (for box-plot)
  const alleScores: Record<RadarKey, number[]> = {
    fysisk: spillere.map((s) => s.fysisk).filter((v): v is number => v !== null),
    teknikk: spillere.map((s) => s.teknikk).filter((v): v is number => v !== null),
    taktikk: spillere.map((s) => s.taktikk).filter((v): v is number => v !== null),
    mental: spillere.map((s) => s.mental).filter((v): v is number => v !== null),
    motivasjon: spillere.map((s) => s.motivasjon).filter((v): v is number => v !== null),
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · /admin/talent/radar"
        titleLead="Radar-"
        titleItalic="oversikt"
        titleTrail={` — ${spillere.length} spillere`}
        sub="Kvartil-plots per akse · klikk på spiller for detaljert radar"
        actions={
          <Link
            href="/admin/talent"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
          >
            2D-kart
          </Link>
        }
      />

      {/* Kvartil-plots per akse */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-display text-base font-semibold">Distribusjon per akse</h3>
        <div className="space-y-4">
          {RADAR_AKSER.map(({ key, label }) => {
            const s = alleScores[key];
            const snitt = globalSnitt[key];
            const q1 = s.length ? s.sort((a, b) => a - b)[Math.floor(s.length * 0.25)] : 0;
            const q3 = s.length ? s[Math.floor(s.length * 0.75)] : 0;
            return (
              <div key={key} className="ta-boxplot-row">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {label}
                </span>
                <BoxPlotSvg scores={s} current={snitt} />
                <div className="text-right">
                  <div className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                    {snitt.toFixed(1).replace(".", ",")}
                  </div>
                  <div className="font-mono text-[9.5px] text-muted-foreground">
                    IQR: {q1.toFixed(1)}–{q3.toFixed(1)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Spillerliste med mini-radar */}
      <section>
        <h3 className="mb-4 font-display text-base font-semibold">Alle spillere</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {spillere.map((s) => {
            const vals = [s.fysisk, s.teknikk, s.taktikk, s.mental, s.motivasjon];
            const snittVal = (() => {
              const ns = vals.filter((v): v is number => v !== null);
              return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : null;
            })();

            return (
              <Link
                key={s.id}
                href={`/admin/talent/radar/${s.user.id}`}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-secondary/30"
              >
                {/* Mini radar */}
                <svg viewBox="0 0 180 180" className="h-16 w-16 shrink-0" aria-hidden="true">
                  {/* Grids */}
                  {[0.25, 0.5, 0.75, 1].map((f) => (
                    <polygon
                      key={f}
                      points={radarPoints([f*10, f*10, f*10, f*10, f*10], 10, 70, 90, 90)}
                      fill="none" stroke="#E5E3DD" strokeWidth="1"
                    />
                  ))}
                  {/* Kohort snitt */}
                  <polygon
                    points={radarPoints(RADAR_AKSER.map((a) => globalSnitt[a.key]), 10, 70, 90, 90)}
                    fill="none" stroke="#005840" strokeWidth="1.5" strokeDasharray="3 2"
                  />
                  {/* Spiller */}
                  <polygon
                    points={radarPoints(vals, 10, 70, 90, 90)}
                    fill="#D1F843" fillOpacity="0.5" stroke="#005840" strokeWidth="2"
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
                      style={{ background: avatarBg(s.user.name) }}
                      aria-hidden="true"
                    >
                      {initials(s.user.name)}
                    </div>
                    <div className="truncate text-sm font-semibold text-foreground">{s.user.name}</div>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {s.niva} · HCP {s.user.hcp != null ? s.user.hcp.toFixed(1) : "—"}
                  </div>
                  <div className="mt-1 font-mono text-[11px] font-semibold text-primary">
                    Score: {snittVal !== null ? snittVal.toFixed(1).replace(".", ",") : "—"} / 10
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {spillere.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card py-12 text-center">
            <p className="text-sm text-muted-foreground">Ingen spillere i talent-programmet ennå.</p>
          </div>
        )}
      </section>
    </div>
  );
}
