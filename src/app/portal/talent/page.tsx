/**
 * PlayerHQ — Talent — Mitt nivå
 *
 * Design: 06 Talent-modul.html · Skjerm 1 (Mitt nivå)
 * Nivå-meter SVG (B3→A1) + 5 sub-ring-vurderinger + milepæl + historikk-bar
 */
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import "@/components/talent/talent.css";

// Konverter 0-10 radar-akse til ring-dashoffset (r=42, omfang ≈ 263.9)
function ringOffset(val: number | null): number {
  const pct = val !== null ? Math.max(0, Math.min(10, val)) / 10 : 0;
  return 263.9 * (1 - pct);
}

// Normalisert % for nivå-meter
const NIVA_LIST = [
  { id: "B3", label: "B3", sub: "HCP 19+",     fill: "#FFFFFF", stroke: "#E5E3DD",  textFill: "#908D86" },
  { id: "B2", label: "B2", sub: "HCP 11–18",   fill: "rgba(94,92,87,0.10)", stroke: "#E5E3DD", textFill: "#5E5C57" },
  { id: "B1", label: "B1", sub: "HCP 5–10",    fill: "#FAFAF7", stroke: "#E5E3DD",  textFill: "#0A1F17" },
  { id: "A2", label: "A2", sub: "HCP 0 til +4",fill: "#005840", stroke: "#005840",  textFill: "#D1F843" },
  { id: "A1", label: "A1", sub: "HCP +5 til +1",fill: "#D1F843", stroke: "#005840", textFill: "#0A1F17" },
] as const;

const AKSE_LABEL: Record<string, string> = {
  fysisk: "Fysisk",
  teknikk: "Teknikk",
  taktikk: "Spillforst.",
  mental: "Mental",
  motivasjon: "Motivasjon",
};

const DISC_CLASS: Record<string, string> = {
  fysisk: "te-badge te-badge-fys",
  teknikk: "te-badge te-badge-tek",
  taktikk: "te-badge te-badge-spill",
  mental: "te-badge te-badge-turn",
  motivasjon: "te-badge te-badge-slag",
};

export default async function TalentPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const tracking = await prisma.talentTracking.findUnique({
    where: { userId: user.id },
  });

  if (!tracking) return null;

  const akser = [
    { key: "fysisk",    val: tracking.fysisk },
    { key: "teknikk",   val: tracking.teknikk },
    { key: "taktikk",   val: tracking.taktikk },
    { key: "mental",    val: tracking.mental },
    { key: "motivasjon",val: tracking.motivasjon },
  ] as const;

  // Kohort-snitt for sammenligning
  const kohort = await prisma.talentTracking.findMany({
    where: { niva: tracking.niva, NOT: { userId: user.id } },
    select: { fysisk: true, teknikk: true, taktikk: true, mental: true, motivasjon: true },
  });

  function kohortSnitt(key: "fysisk" | "teknikk" | "taktikk" | "mental" | "motivasjon"): number | null {
    const vals = kohort.map((r) => r[key]).filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  const niva = tracking.niva ?? "B1";
  const nivaIdx = NIVA_LIST.findIndex((n) => n.id === niva);

  // Nivå-meter SVG x-posisjon per nivå
  const nivaMeterX = [80, 300, 520, 740, 960] as const;
  const nivaMeterW = [160, 160, 160, 160, 200] as const;
  const nivaBaseY = [220, 210, 200, 190, 180] as const;
  const nivaH = [80, 90, 100, 110, 120] as const;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Talent · Mitt nivå
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          Mitt <em className="font-serif italic font-normal text-primary">nivå</em>
        </h1>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          Kategori {niva} · {kohort.length > 0 ? `${kohort.length} andre spillere på samme nivå` : "du er eneste på dette nivå"}
        </p>
      </div>

      {/* Nivå-meter SVG */}
      <div className="overflow-hidden rounded-xl border border-border bg-card p-5">
        <div className="w-full overflow-x-auto">
          <svg viewBox="0 0 1200 360" className="h-auto w-full min-w-[640px]" preserveAspectRatio="xMidYMid meet" aria-label={`Nivå-meter — du er i ${niva}`}>
            {NIVA_LIST.map((n, i) => {
              const isActive = n.id === niva;
              const x = nivaMeterX[i];
              const y = nivaBaseY[i];
              const w = nivaMeterW[i];
              const h = nivaH[i];
              return (
                <g key={n.id}>
                  <rect
                    x={x} y={y} width={w} height={h} rx="14"
                    fill={n.fill} stroke={n.stroke}
                    strokeWidth={isActive ? "2.5" : "2"}
                  />
                  <text x={x + w / 2} y={y + h / 2 - 8} textAnchor="middle" fontFamily="var(--font-inter-tight,sans-serif)" fontSize="22" fontWeight="700" fill={n.textFill}>
                    {n.label}
                  </text>
                  <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="11" fill={n.textFill}>
                    {n.sub}
                  </text>
                  {isActive && (
                    <text x={x + w / 2} y={y + h / 2 + 28} textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="11" fontWeight="700" fill="#005840">
                      ELITE JUNIOR
                    </text>
                  )}
                </g>
              );
            })}
            {/* Bruker-markør */}
            {nivaIdx >= 0 && (
              <g>
                <circle
                  cx={nivaMeterX[nivaIdx] + 40} cy={nivaBaseY[nivaIdx] + nivaH[nivaIdx] / 2}
                  r="22" fill="#005840" stroke="#FFFFFF" strokeWidth="3"
                />
                <text
                  x={nivaMeterX[nivaIdx] + 40} y={nivaBaseY[nivaIdx] + nivaH[nivaIdx] / 2 + 5}
                  textAnchor="middle" fontFamily="var(--font-inter-tight,sans-serif)" fontSize="13" fontWeight="700" fill="#D1F843"
                >
                  {user.name ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "DU"}
                </text>
                <text
                  x={nivaMeterX[nivaIdx] + 40} y={nivaBaseY[nivaIdx] - 10}
                  textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="10" fontWeight="700" fill="#0A1F17"
                >
                  DU ER HER
                </text>
              </g>
            )}
            {/* Bunntekst */}
            <text x="600" y="320" textAnchor="middle" fontFamily="var(--font-inter-tight,sans-serif)" fontSize="20" fontWeight="700" fill="#0A1F17">
              KATEGORI {niva} · <tspan fontFamily="Instrument Serif, serif" fontStyle="italic" fontWeight="400" fill="#005840">talent-spiller</tspan>
            </text>
            <text x="600" y="345" textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="11" fill="#5E5C57">
              {kohort.length + 1} spillere på dette nivået · Se sammenligning for kohort-detalj
            </text>
          </svg>
        </div>
      </div>

      {/* 5 sub-ring-vurderinger */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {akser.map(({ key, val }) => {
          const snittVal = kohortSnitt(key as "fysisk" | "teknikk" | "taktikk" | "mental" | "motivasjon");
          const pct = val !== null ? Math.round((val / 10) * 100) : 0;
          const snittPct = snittVal !== null ? Math.round((snittVal / 10) * 100) : null;
          const diff = val !== null && snittVal !== null ? val - snittVal : null;

          return (
            <div key={key} className="ta-sub-card">
              <div className="flex items-center gap-1.5 self-start">
                <span className={`${DISC_CLASS[key]} text-[9px]`}>{DISC_CLASS[key].includes("fys") ? "FYS" : DISC_CLASS[key].includes("tek") ? "TEK" : DISC_CLASS[key].includes("spill") ? "SPILL" : DISC_CLASS[key].includes("turn") ? "TURN" : "SLAG"}</span>
              </div>
              {/* Ring */}
              <svg viewBox="0 0 100 100" className="w-28 h-28" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--accent))" strokeWidth="8"
                  strokeDasharray="263.9"
                  strokeDashoffset={ringOffset(val)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                {snittPct !== null && (
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="hsl(var(--primary))" strokeWidth="2"
                    strokeDasharray="2 4"
                    transform="rotate(-90 50 50)"
                  />
                )}
                <text x="50" y="56" textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="22" fontWeight="700" fill="hsl(var(--foreground))">
                  {val !== null ? `${Math.round(pct)}%` : "—"}
                </text>
              </svg>
              <div className="font-display text-sm font-semibold">{AKSE_LABEL[key]}</div>
              {diff !== null && snittVal !== null && (
                <div className="font-mono text-[10px] leading-snug text-muted-foreground text-center">
                  {diff > 0 ? "+" : ""}{diff.toFixed(1).replace(".", ",")} vs snitt
                </div>
              )}
              <div className={`font-mono text-[10.5px] font-semibold ${diff !== null ? (diff > 0 ? "text-primary" : diff < 0 ? "text-destructive" : "text-muted-foreground") : "text-muted-foreground"}`}>
                {diff === null ? "—" : diff > 0 ? `+${diff.toFixed(1).replace(".", ",")} over snitt` : diff < 0 ? `${diff.toFixed(1).replace(".", ",")} under snitt` : "Lik kohort-snitt"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Milepæl-historikk (ta-step-bar) */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-display text-base font-semibold">Progresjon</h3>
        <div className="ta-step-bar">
          {NIVA_LIST.map((n, i) => {
            const isDone = i < nivaIdx;
            const isCurrent = i === nivaIdx;
            return (
              <div key={n.id} className={`ta-step${isDone ? " done" : ""}${isCurrent ? " current" : ""}`}>
                <div className="ta-step-dot">{n.label}</div>
                <div className="mt-2 font-mono text-[9.5px] text-muted-foreground">
                  {isCurrent ? "NÅ" : isDone ? "Oppnådd" : "Fremtid"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigasjon til detalj-sider */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/portal/talent/mitt-niva"
          className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-secondary/30"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Radar mot kohort</div>
          <div className="mt-2 font-display text-base font-semibold">Mitt nivå — detalj</div>
          <div className="mt-1 font-mono text-[10px] text-primary">Se radar-sammenligning →</div>
        </Link>
        <Link
          href="/portal/talent/roadmap"
          className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-secondary/30"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">12 måneder</div>
          <div className="mt-2 font-display text-base font-semibold">Min talent-plan</div>
          <div className="mt-1 font-mono text-[10px] text-primary">Se roadmap →</div>
        </Link>
        <Link
          href="/portal/talent/sammenligning"
          className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-secondary/30"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">Kvartil-plot</div>
          <div className="mt-2 font-display text-base font-semibold">Sammenligning</div>
          <div className="mt-1 font-mono text-[10px] text-primary">Se mot kohort →</div>
        </Link>
      </div>
    </div>
  );
}
