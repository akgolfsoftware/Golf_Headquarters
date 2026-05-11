/**
 * PlayerHQ — Statistikk & sesongtrend
 * Bygd fra wireframe/design-files-v2/screens/53-playerhq-statistikk.html
 * URL: /playerhq-statistikk-demo
 */

import { TrendingDown, TrendingUp } from "lucide-react";

type Round = {
  date: string;
  course: string;
  detail: string;
  score: number;
  par: number;
  sg: number;
};

type SgArea = {
  name: string;
  value: number;
  pct: number;
  trend: number | null;
  warn?: boolean;
};

const rounds: Round[] = [
  { date: "04.05", course: "Bærum GK · R3", detail: "par 71 · gul tee", score: 66, par: -5, sg: 2.8 },
  { date: "02.05", course: "Bærum GK · R2", detail: "par 71 · gul tee", score: 70, par: -1, sg: 1.1 },
  { date: "28.04", course: "Kongsberg · R1", detail: "par 72 · hvit tee · vind 8 m/s", score: 73, par: 1, sg: -0.4 },
  { date: "25.04", course: "Drøbak · friv", detail: "par 70 · rød tee · trening", score: 69, par: -1, sg: 0.9 },
  { date: "21.04", course: "Asker · Q-school", detail: "par 72 · CUT spilte", score: 74, par: 2, sg: -0.8 },
];

const sgAreas: SgArea[] = [
  { name: "Driving", value: 0.82, pct: 78, trend: 0.2 },
  { name: "Approach", value: 0.41, pct: 64, trend: 0.1 },
  { name: "Around green", value: -0.22, pct: 44, trend: null, warn: true },
  { name: "Putting", value: 0.18, pct: 71, trend: 0.3 },
  { name: "Sand", value: -0.34, pct: 38, trend: null, warn: true },
];

const scoringRow = [
  { label: "Eagle", count: 8, pct: "1,6 %", hi: true },
  { label: "Birdie", count: 92, pct: "18,3 %", hi: true },
  { label: "Par", count: 298, pct: "59,1 %" },
  { label: "Bogey", count: 94, pct: "18,7 %" },
  { label: "Dbl+", count: 12, pct: "2,4 %" },
];

const lastRoundHoles: Array<"par" | "bir" | "bog" | "eag" | "dbl"> = [
  "par", "bir", "par", "par", "bir", "par", "bir", "par",
  "bir", "par", "bog", "par", "par", "bir", "par", "par",
  "bir", "par",
];

export default function PlayerHqStatistikkDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Statistikk
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Slik utvikler <em className="italic text-primary">du deg.</em>
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Sammendrag fra 28 runder i 2026. Strokes Gained, scoring og HCP-trend. Klikk en runde for full hull-for-hull.
        </p>
      </header>

      {/* Hero-stat */}
      <section className="mb-6 grid grid-cols-4 gap-4 rounded-2xl bg-gradient-to-br from-[#005840] to-[#0A3C2F] p-6 text-white">
        <HeroKpi label="HCP nå" value="+2,4" delta="↓ 0,8 sesong" det="14. mai · oppdatert daglig 06:00" main />
        <HeroKpi label="Snitt-score · siste 10" value="71,4" delta="−1,2" det="vs sesong 72,6 (28 runder)" />
        <HeroKpi label="Cut-rate · tour" value="82 %" delta="+8 %" det="9 av 11 cuts klart" />
        <HeroKpi label="Beste 18-hulls runde" value="66" delta="−6" det="Bærum · 04.05 · R3" />
      </section>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <Panel title="HCP-trend · 12 mnd" sub="rullerende 8 beste">
          <HcpChart />
          <TrendRow
            text={<><b className="font-semibold">Trend:</b> stabilt nedover siden sept-2025</>}
            value="↓ 1,4 HCP-pts på 8 mnd"
            tone="success"
          />
        </Panel>

        <Panel title="Strokes Gained · vs scratch" sub="siste 10 runder">
          <div className="flex flex-col gap-2.5">
            {sgAreas.map((a) => (
              <div key={a.name} className="grid grid-cols-[100px_1fr_70px] items-center gap-2.5 font-mono text-[11px] text-muted-foreground">
                <span>{a.name}</span>
                <div className="relative h-2 rounded-sm bg-[var(--surface-alt,#F1EEE5)]">
                  <div
                    className={`h-full rounded-sm ${a.warn ? "bg-[#B8852A]" : "bg-primary"}`}
                    style={{ width: `${a.pct}%` }}
                  />
                  <div className="absolute -top-0.5 bottom-[-2px] w-0.5 bg-foreground" style={{ left: "60%" }} />
                </div>
                <span className={`text-right font-semibold ${a.warn ? "text-[#B8852A]" : "text-foreground"}`}>
                  {a.value > 0 ? `+${a.value.toFixed(2).replace(".", ",")}` : a.value.toFixed(2).replace(".", ",")}
                  {a.trend !== null && (
                    <small className="ml-1 text-[9px] font-medium text-[#1A7D56]">↑ {a.trend.toFixed(1).replace(".", ",")}</small>
                  )}
                </span>
              </div>
            ))}
          </div>
          <TrendRow
            text={<><b className="font-semibold">Fokus:</b> around-green og bunker</>}
            value="−0,56 SG totalt"
            tone="danger"
          />
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Scoring-fordeling · sesong" sub="504 hull · 28 runder">
          <div className="grid grid-cols-5 overflow-hidden rounded-sm border border-border bg-[var(--surface-alt,#F1EEE5)]">
            {scoringRow.map((c) => (
              <div key={c.label} className={`border-r border-b border-border p-3 text-center last:border-r-0 ${c.hi ? "bg-primary/5" : "bg-card"}`}>
                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {c.label}
                </div>
                <div className={`mt-2 font-display text-[22px] font-medium leading-none ${c.hi ? "text-primary" : "text-foreground"}`}>
                  {c.count}
                </div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">{c.pct}</div>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
              Siste runde · Bærum R3 · 18 hull
            </div>
            <div className="grid grid-cols-8 gap-1">
              {lastRoundHoles.map((h, i) => (
                <div
                  key={i}
                  className={`grid aspect-square place-items-center rounded-sm font-mono text-[10px] font-semibold text-white ${holeBg(h)}`}
                >
                  {holeLetter(h)}
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Siste runder" sub="klikk for detalj">
          <div className="flex flex-col gap-2">
            {rounds.map((r) => (
              <div
                key={r.date + r.course}
                className="grid grid-cols-[auto_1fr_60px_60px_80px] items-center gap-3 rounded-sm bg-[var(--surface-alt,#F1EEE5)] px-4 py-3"
              >
                <span className="font-mono text-[10px] text-muted-foreground">{r.date}</span>
                <span>
                  <b className="text-[13px] font-semibold">{r.course}</b>
                  <small className="block font-mono text-[10px] text-muted-foreground">{r.detail}</small>
                </span>
                <span className={`font-display text-[18px] font-semibold ${r.par <= 0 ? "text-[#1A7D56]" : ""}`}>
                  {r.score}
                </span>
                <span className={`font-mono text-[12px] font-semibold ${r.par <= 0 ? "text-[#1A7D56]" : "text-[#B8852A]"}`}>
                  {r.par > 0 ? `+${r.par}` : r.par === 0 ? "E" : r.par}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  SG {r.sg > 0 ? `+${r.sg.toFixed(1).replace(".", ",")}` : r.sg.toFixed(1).replace(".", ",")}
                </span>
              </div>
            ))}
            <button className="mt-2 self-center rounded-md border border-border bg-transparent px-4 py-2 text-[12px] font-medium hover:bg-secondary">
              Vis alle 28 runder
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function HeroKpi({
  label,
  value,
  delta,
  det,
  main = false,
}: {
  label: string;
  value: string;
  delta: string;
  det: string;
  main?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-white/55">
        {label}
      </div>
      <div className={`mt-2 font-display font-medium leading-none tracking-tight ${main ? "text-[52px]" : "text-[36px]"}`}>
        {value}
        <small className="ml-1.5 font-mono text-[12px] font-medium text-accent">{delta}</small>
      </div>
      <div className="mt-1.5 font-mono text-[10px] text-white/55">{det}</div>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <h3 className="flex items-baseline justify-between font-display text-[16px] font-semibold tracking-tight">
        {title}
        <small className="font-mono text-[10px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
          {sub}
        </small>
      </h3>
      {children}
    </section>
  );
}

function TrendRow({ text, value, tone }: { text: React.ReactNode; value: string; tone: "success" | "danger" }) {
  const color = tone === "success" ? "text-[#1A7D56]" : "text-[#A32D2D]";
  const Icon = tone === "success" ? TrendingDown : TrendingUp;
  return (
    <div className="flex items-center justify-between rounded-sm bg-[var(--surface-alt,#F1EEE5)] px-4 py-3 text-[13px]">
      <span>{text}</span>
      <span className={`inline-flex items-center gap-1.5 font-mono font-semibold ${color}`}>
        <Icon size={14} strokeWidth={1.5} />
        {value}
      </span>
    </div>
  );
}

function HcpChart() {
  return (
    <div className="rounded-sm bg-[var(--surface-alt,#F1EEE5)] p-3" style={{ height: 160 }}>
      <svg viewBox="0 0 360 130" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <line x1="0" y1="30" x2="360" y2="30" stroke="#E5E3DD" strokeWidth="1" />
        <line x1="0" y1="65" x2="360" y2="65" stroke="#E5E3DD" strokeWidth="1" />
        <line x1="0" y1="100" x2="360" y2="100" stroke="#E5E3DD" strokeWidth="1" />
        <text x="2" y="34" className="fill-muted-foreground font-mono text-[9px]">0</text>
        <text x="2" y="69" className="fill-muted-foreground font-mono text-[9px]">+2</text>
        <text x="2" y="104" className="fill-muted-foreground font-mono text-[9px]">+4</text>
        <path
          d="M20,90 L50,85 L80,75 L110,80 L140,70 L170,72 L200,60 L230,55 L260,52 L290,45 L320,38 L350,30 L350,130 L20,130 Z"
          fill="rgba(0,88,64,0.10)"
        />
        <path
          d="M20,90 L50,85 L80,75 L110,80 L140,70 L170,72 L200,60 L230,55 L260,52 L290,45 L320,38 L350,30"
          fill="none"
          stroke="#005840"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="350" cy="30" r="5" fill="#FFFFFF" stroke="#005840" strokeWidth="2.5" />
        <text x="20" y="125" className="fill-muted-foreground font-mono text-[9px]">jun</text>
        <text x="80" y="125" className="fill-muted-foreground font-mono text-[9px]">aug</text>
        <text x="140" y="125" className="fill-muted-foreground font-mono text-[9px]">okt</text>
        <text x="200" y="125" className="fill-muted-foreground font-mono text-[9px]">des</text>
        <text x="260" y="125" className="fill-muted-foreground font-mono text-[9px]">feb</text>
        <text x="320" y="125" className="fill-muted-foreground font-mono text-[9px]">apr</text>
      </svg>
    </div>
  );
}

function holeBg(h: "par" | "bir" | "bog" | "eag" | "dbl"): string {
  return {
    eag: "bg-[#1A7D56]",
    bir: "bg-[#2D6B4C]",
    par: "bg-[#A8B4A6] !text-foreground",
    bog: "bg-[#E9C36B] !text-[#5A4514]",
    dbl: "bg-[#A32D2D]",
  }[h];
}
function holeLetter(h: "par" | "bir" | "bog" | "eag" | "dbl"): string {
  return { eag: "E", bir: "B", par: "P", bog: "b", dbl: "D" }[h];
}
