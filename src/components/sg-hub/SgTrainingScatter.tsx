/**
 * SgTrainingScatter — «Trener vi det riktige?»
 *
 * Hero scatter (innspill/APP, x=timer/uke, y=SG-endring 90 d) + 4 mini-scatters
 * per SG-kategori + konklusjon. Alle tall fra ekte TrainingLog + Round-data.
 * Vises kun når det er nok data (≥ 4 datapunkter per kategori).
 */

import {
  computeConfBand,
  type CategoryScatterData,
  type RegressionLine,
  type SgScatterPayload,
} from "@/lib/sg-scatter/compute";

// ── SVG-koordinater ───────────────────────────────────────────────────────────

const H = {
  vw: 800, vh: 500,
  padL: 70, padR: 30, padT: 30, padB: 60,
  get w() { return this.vw - this.padL - this.padR; },
  get h() { return this.vh - this.padT - this.padB; },
  xMin: 0, xMax: 6, yMin: -1, yMax: 1,
  px(hours: number, maxH: number) { return H.padL + (hours / maxH) * H.w; },
  py(sg: number) { return H.padT + H.h - ((sg - H.yMin) / (H.yMax - H.yMin)) * H.h; },
};

const M = {
  vw: 320, vh: 220,
  padL: 30, padR: 20, padT: 20, padB: 40,
  get w() { return this.vw - this.padL - this.padR; },
  get h() { return this.vh - this.padT - this.padB; },
  xMin: 0, xMax: 6, yMin: -0.5, yMax: 0.5,
  px(hours: number, maxH: number) { return M.padL + (hours / maxH) * M.w; },
  py(sg: number) { return M.padT + M.h - ((sg - M.yMin) / (M.yMax - M.yMin)) * M.h; },
};

const miniZeroPy = M.py(0);

// ── Helper: konfidensband-polygon ─────────────────────────────────────────────

function confBandPolygon(
  reg: RegressionLine,
  maxHours: number,
  size: "hero" | "mini",
): string {
  const s = size === "hero" ? H : M;
  const pts = computeConfBand(reg, 0, maxHours);
  const upper = pts.map((p) => `${s.px(p.x, maxHours)},${s.py(Math.min(s.yMax, p.yHigh))}`);
  const lower = [...pts]
    .reverse()
    .map((p) => `${s.px(p.x, maxHours)},${s.py(Math.max(s.yMin, p.yLow))}`);
  return [...upper, ...lower].join(" ");
}

// ── HeroScatter ───────────────────────────────────────────────────────────────

function HeroScatter({
  catData,
  maxHours,
}: {
  catData: CategoryScatterData;
  maxHours: number;
}) {
  const { points, regression } = catData;
  const xSteps = Math.min(8, maxHours);

  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-card" style={{ aspectRatio: "16/10" }}>
      <svg viewBox={`0 0 ${H.vw} ${H.vh}`} preserveAspectRatio="xMidYMid meet" className="block h-full w-full">
        {/* Y gridlines */}
        {[-1, -0.5, 0, 0.5, 1].map((v) => (
          <line
            key={v}
            x1={H.padL} y1={H.py(v)} x2={H.vw - H.padR} y2={H.py(v)}
            className={v === 0 ? undefined : undefined}
            stroke={v === 0 ? "var(--foreground)" : "var(--border)"}
            strokeWidth={v === 0 ? 1.5 : 1}
            strokeDasharray={v === 0 ? undefined : "3 3"}
          />
        ))}
        {/* X gridlines */}
        {Array.from({ length: xSteps + 1 }, (_, i) => (i * maxHours) / xSteps).map((v) => (
          <line key={v} x1={H.px(v, maxHours)} y1={H.padT} x2={H.px(v, maxHours)} y2={H.padT + H.h}
            stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
        ))}

        {/* Y labels */}
        {[-1, -0.5, 0, 0.5, 1].map((v) => (
          <text key={v} x={H.padL - 8} y={H.py(v) + 4} textAnchor="end"
            fontFamily="var(--font-mono)" fontSize={9} fontWeight={v === 0 ? 800 : 700}
            fill={v === 0 ? "var(--foreground)" : "var(--muted-foreground)"}>
            {v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}
          </text>
        ))}
        {/* X labels */}
        {Array.from({ length: xSteps + 1 }, (_, i) => Math.round((i * maxHours) / xSteps)).map((v, i) => (
          <text key={i} x={H.px((i * maxHours) / xSteps, maxHours)} y={H.padT + H.h + 18}
            textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fontWeight={700}
            fill="var(--muted-foreground)">
            {i === xSteps ? `${v} t` : v}
          </text>
        ))}
        {/* Axis titles */}
        <text x={(H.padL + H.vw - H.padR) / 2} y={H.vh - 6} textAnchor="middle"
          fontFamily="var(--font-mono)" fontSize={10} fontWeight={800}
          fill="var(--foreground)" letterSpacing="0.10em">
          TIMER TRENT · PER UKE
        </text>
        <text x={-((H.padT + H.h) / 2 + H.padT)} y={16} transform="rotate(-90)" textAnchor="middle"
          fontFamily="var(--font-mono)" fontSize={10} fontWeight={800}
          fill="var(--foreground)" letterSpacing="0.10em">
          SG-ENDRING · 90 D
        </text>

        {/* Threshold divider */}
        {regression && regression.slope !== 0 && (
          (() => {
            const thresh = Math.max(0, -regression.intercept / regression.slope);
            const tx = H.px(thresh, maxHours);
            if (tx > H.padL && tx < H.vw - H.padR) {
              return (
                <>
                  <line x1={tx} y1={H.padT} x2={tx} y2={H.padT + H.h}
                    stroke="var(--muted-foreground)" strokeWidth={1} strokeDasharray="2 4" opacity={0.5} />
                  <text x={tx + 4} y={H.padT + 14} fontFamily="var(--font-mono)" fontSize={8.5}
                    fontWeight={800} fill="var(--muted-foreground)" letterSpacing="0.10em" opacity={0.75}>
                    {thresh.toFixed(1)} T · TERSKEL
                  </text>
                </>
              );
            }
            return null;
          })()
        )}

        {/* Confidence band */}
        {regression && (
          <polygon
            points={confBandPolygon(regression, maxHours, "hero")}
            fill="rgba(0,88,64,0.12)"
          />
        )}

        {/* Regression line */}
        {regression && (
          <line
            x1={H.px(0, maxHours)} y1={H.py(regression.intercept)}
            x2={H.px(maxHours, maxHours)} y2={H.py(regression.slope * maxHours + regression.intercept)}
            stroke="#003A2A" strokeWidth={2.4} fill="none"
          />
        )}

        {/* Dots */}
        {points.map((p, i) => {
          const cx = H.px(p.hoursPerWeek, maxHours);
          const cy = H.py(Math.max(H.yMin, Math.min(H.yMax, p.sgChangeFwd90)));
          const isNow = i === points.length - 1;
          return (
            <g key={i}>
              {isNow && <circle cx={cx} cy={cy} r={14} fill="none" stroke="var(--accent)" strokeWidth={2.5} />}
              <circle
                cx={cx} cy={cy} r={isNow ? 10 : 7}
                fill={p.isRecent ? "var(--accent)" : "var(--primary)"}
                stroke={p.isRecent ? "var(--primary)" : "var(--card)"}
                strokeWidth={1.5}
              >
                <title>{p.weekLabel} · {p.hoursPerWeek.toFixed(1)} t · SG {p.sgChangeFwd90 >= 0 ? "+" : ""}{p.sgChangeFwd90.toFixed(2)}</title>
              </circle>
              {isNow && (
                <text x={cx + 13} y={cy + 4} fontFamily="var(--font-mono)" fontSize={9}
                  fontWeight={800} fill="var(--primary)">
                  NÅ
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── MiniScatter ───────────────────────────────────────────────────────────────

function MiniScatter({ catData, maxHours }: { catData: CategoryScatterData; maxHours: number }) {
  const { points, regression, colorHex } = catData;

  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-secondary p-2" style={{ aspectRatio: "16/11" }}>
      <svg viewBox={`0 0 ${M.vw} ${M.vh}`} preserveAspectRatio="xMidYMid meet" className="block h-full w-full">
        {/* Gridlines */}
        <line x1={M.padL} y1={M.padT} x2={M.vw - M.padR} y2={M.padT} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={M.padL} y1={M.padT + M.h} x2={M.vw - M.padR} y2={M.padT + M.h} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={M.padL} y1={miniZeroPy} x2={M.vw - M.padR} y2={miniZeroPy} stroke="var(--foreground)" strokeWidth={1.5} />
        <line x1={M.padL} y1={M.padT} x2={M.padL} y2={M.padT + M.h} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={M.vw - M.padR} y1={M.padT} x2={M.vw - M.padR} y2={M.padT + M.h} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />

        {/* Y labels */}
        {[-0.5, 0, 0.5].map((v) => (
          <text key={v} x={M.padL - 4} y={M.py(v) + 4} textAnchor="end"
            fontFamily="var(--font-mono)" fontSize={9} fontWeight={700}
            fill="var(--muted-foreground)">
            {v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}
          </text>
        ))}
        <text x={(M.padL + M.vw - M.padR) / 2} y={M.vh - 4} textAnchor="middle"
          fontFamily="var(--font-mono)" fontSize={8} fontWeight={700}
          fill="var(--muted-foreground)" letterSpacing="0.04em">
          TIMER PER UKE
        </text>

        {/* Confidence band */}
        {regression && (
          <polygon
            points={confBandPolygon(regression, maxHours, "mini")}
            fill="rgba(0,88,64,0.10)"
          />
        )}
        {/* Regression line */}
        {regression && (
          <line
            x1={M.px(0, maxHours)} y1={M.py(Math.max(M.yMin, Math.min(M.yMax, regression.intercept)))}
            x2={M.px(maxHours, maxHours)} y2={M.py(Math.max(M.yMin, Math.min(M.yMax, regression.slope * maxHours + regression.intercept)))}
            stroke={colorHex} strokeWidth={1.5} fill="none"
          />
        )}

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={M.px(p.hoursPerWeek, maxHours)}
            cy={M.py(Math.max(M.yMin, Math.min(M.yMax, p.sgChangeFwd90)))}
            r={p.isRecent ? 4.5 : 4}
            fill={p.isRecent ? "var(--accent)" : colorHex}
            stroke={p.isRecent ? colorHex : "var(--card)"}
            strokeWidth={1.5}
          >
            <title>{p.weekLabel} · {p.hoursPerWeek.toFixed(1)} t · {p.sgChangeFwd90 >= 0 ? "+" : ""}{p.sgChangeFwd90.toFixed(2)}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

// ── Hoved-komponent ───────────────────────────────────────────────────────────

export function SgTrainingScatter({ data }: { data: SgScatterPayload }) {
  if (!data.hasData) return null;

  const primaryCat = data.categories.find((c) => c.category === data.primaryCategory) ?? data.categories[0];
  const categoriesWithData = data.categories.filter((c) => c.points.length >= 4);

  const heroReg = primaryCat?.regression;
  const corrLabel = heroReg
    ? `${heroReg.r >= 0 ? "+" : ""}${heroReg.r.toFixed(2)}`
    : "—";
  const r2Label = heroReg ? `${Math.round(heroReg.rSquared * 100)} %` : "—";

  return (
    <section className="space-y-4">
      {/* Seksjonstittel */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-foreground">
          SG ↔ TRENING
        </span>
        <span className="text-xs font-bold text-muted-foreground">
          {primaryCat?.label}
        </span>
        <div className="h-px flex-1 bg-border" />
        <span className="rounded-full bg-secondary px-3 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          {primaryCat?.points.length ?? 0} UKER
        </span>
      </div>

      {/* Hero panel */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Panel-header */}
        <div className="flex items-center gap-4 border-b border-border px-6 py-4">
          <div className="flex-1">
            <h3 className="font-display text-[22px] font-bold leading-tight tracking-tight">
              Trener vi det{" "}
              <em className="font-normal italic text-primary">riktige</em>?
            </h3>
            <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
              {primaryCat?.label.toUpperCase()} · TIMER TRENT VS SG-ENDRING 90 D
            </p>
          </div>
          <div className="flex divide-x divide-border border-l border-border">
            <div className="flex flex-col gap-0.5 px-4">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">KORRELASJON</span>
              <span className={`font-mono text-xl font-bold tabular-nums leading-none ${heroReg && heroReg.r > 0 ? "text-success" : "text-foreground"}`}>
                {corrLabel}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 px-4">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">R²</span>
              <span className="font-mono text-xl font-bold tabular-nums leading-none text-foreground">
                {r2Label}
              </span>
            </div>
          </div>
        </div>

        {/* Scatter + høyre-rail */}
        <div className="grid grid-cols-[1fr_300px]">
          <div className="border-r border-border p-6">
            {primaryCat && <HeroScatter catData={primaryCat} maxHours={data.maxHours} />}

            {/* Forklarende noter */}
            <div className="mt-3 space-y-1.5">
              <div className="grid grid-cols-[12px_1fr] items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                <p className="font-mono text-[11px] italic text-muted-foreground">
                  <strong className="not-italic font-bold text-foreground">Siste 4 uker:</strong> Lime-prikker — nåværende treningssyklus.
                </p>
              </div>
              <div className="grid grid-cols-[12px_1fr] items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <p className="font-mono text-[11px] italic text-muted-foreground">
                  <strong className="not-italic font-bold text-foreground">Tidligere uker:</strong> Mørkegrønne prikker — historisk data.
                </p>
              </div>
            </div>
          </div>

          {/* Høyre-rail: statistikk */}
          <div className="flex flex-col gap-4 bg-secondary p-6">
            <div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                REGRESJON · {primaryCat?.label.toUpperCase()}
              </span>
              <h4 className="mt-1 font-display text-[17px] font-bold leading-snug tracking-tight">
                {heroReg?.verdict === "STERK"
                  ? <>Sammenhengen er <em className="font-normal italic text-primary">reell</em>.</>
                  : heroReg?.verdict === "SVAK"
                  ? <>Svakt signal — <em className="font-normal italic text-primary">mer data</em>.</>
                  : <>Ingen tydelig <em className="font-normal italic text-primary">sammenheng</em>.</>}
              </h4>
            </div>

            {heroReg && (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3">
                  <span className={`font-mono text-2xl font-bold tabular-nums leading-none ${heroReg.r > 0 ? "text-success" : "text-foreground"}`}>
                    {heroReg.r >= 0 ? "+" : ""}{heroReg.r.toFixed(2)}
                  </span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground leading-snug">
                    Korrelasjon timer ↔ SG
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3">
                  <span className="font-mono text-2xl font-bold tabular-nums leading-none text-foreground">
                    {Math.round(heroReg.rSquared * 100)}<small className="text-sm text-muted-foreground font-bold ml-0.5">%</small>
                  </span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground leading-snug">
                    R² · forklart varians
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3">
                  <span className={`font-mono text-2xl font-bold tabular-nums leading-none ${heroReg.slope > 0 ? "text-success" : "text-foreground"}`}>
                    {heroReg.slope >= 0 ? "+" : ""}{heroReg.slope.toFixed(2)}
                  </span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground leading-snug">
                    Hellning per +1 t/uke
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3">
                  <span className="font-mono text-2xl font-bold tabular-nums leading-none text-foreground">
                    {heroReg.slope > 0 && heroReg.intercept <= 0
                      ? `${(-heroReg.intercept / heroReg.slope).toFixed(1)}`
                      : "—"}
                    <small className="text-sm text-muted-foreground font-bold ml-0.5">t</small>
                  </span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground leading-snug">
                    Terskel · minst per uke
                  </span>
                </div>
              </div>
            )}

            {/* Forklaring */}
            <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3">
              {[
                { dot: "bg-primary border-card border-[1.5px]", label: "Tidlig periode" },
                { dot: "bg-accent border-primary border-[1.5px]", label: "Siste 4 uker" },
                { dot: "bg-[#003A2A]", label: "Regresjon (OLS)", isLine: true },
                { dot: "bg-[rgba(0,88,64,0.20)]", label: "Konfidens-bånd (95 %)", isRect: true },
              ].map(({ dot, label, isLine, isRect }) => (
                <div key={label} className="grid grid-cols-[14px_1fr] items-center gap-2 font-mono text-[10px] font-bold text-foreground tracking-[0.04em]">
                  {isLine ? (
                    <span className="block h-0.5 w-3 rounded-full" style={{ background: "#003A2A" }} />
                  ) : isRect ? (
                    <span className="block h-2 w-3 rounded-sm bg-[rgba(0,88,64,0.20)]" />
                  ) : (
                    <span className={`block h-3 w-3 rounded-full ${dot}`} />
                  )}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-secondary px-5 py-3 font-mono text-[11px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Prinsipp.</strong> Tre lag synlig: <strong className="text-foreground">regresjons-linje</strong> (tendens), <strong className="text-foreground">konfidens-bånd</strong> (usikkerhet), <strong className="text-foreground">punkter</strong> (faktiske uker). R² over 30 % = sterkt nok til å informere plan-bygging.
        </div>
      </div>

      {/* Mini-multiples */}
      {categoriesWithData.length > 1 && (
        <>
          <div className="flex items-center gap-3 pt-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-foreground">
              PER PYRAMIDE-AKSE
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className={`grid grid-cols-${Math.min(3, categoriesWithData.length)} divide-x divide-border`}>
              {categoriesWithData.map((cat) => {
                const r = cat.regression;
                return (
                  <div key={cat.category} className="p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="h-4 w-1 rounded-sm" style={{ background: cat.colorHex }} />
                      <span className="font-display text-[15px] font-bold tracking-tight leading-none">
                        {cat.label}
                      </span>
                      {r && (
                        <span className={`ml-auto rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.06em] ${
                          r.verdict === "STERK" ? "bg-success/10 text-success" :
                          r.verdict === "SVAK" ? "bg-warning/10 text-warning" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {r.verdict}
                        </span>
                      )}
                    </div>
                    {r && (
                      <p className="mb-2 font-mono text-[10px] font-bold text-muted-foreground">
                        R² <strong className="text-foreground">{Math.round(r.rSquared * 100)} %</strong>
                        {" · "}hellning <strong className="text-foreground">{r.slope >= 0 ? "+" : ""}{r.slope.toFixed(2)}</strong>
                        {" · "}{cat.points.length} uker
                      </p>
                    )}
                    <MiniScatter catData={cat} maxHours={data.maxHours} />
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border bg-secondary px-5 py-3 font-mono text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Prinsipp.</strong> Akser med sterk regresjon = der trening faktisk flytter SG. Ingen sammenheng = færre timer dit, mer til det som virker.
            </div>
          </div>
        </>
      )}
    </section>
  );
}
