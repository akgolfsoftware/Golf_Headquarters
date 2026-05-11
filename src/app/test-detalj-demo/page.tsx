/**
 * PILOT — PlayerHQ Test-detalj (Sand-test bunker u&d)
 * Bygd direkte fra wireframe/design-files-v2/playerhq-A/04-test-detalj.html
 * URL: /test-detalj-demo
 *
 * Mock-data: Markus Roinås Pedersen, mai 2026.
 * Pro-tier rendres med full visning. Agent-innsikt-seksjonen er Pro-låst —
 * Free-brukere ser Lock-overlay på den.
 */

import { Plus, ArrowRight, Lock } from "lucide-react";

export default function TestDetaljDemo() {
  return (
    <div className="min-h-screen bg-[var(--color-card,#FFFFFF)] text-foreground p-8">
      <Header />
      <ActionStrip />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <Bento />
          <AttemptsTable />
          <AgentInsight />
        </div>
        <Drawer />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="mb-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground mb-2.5">
        Tren → Tester → Pyramide-område SPILL · Korthold
      </div>
      <h1 className="font-display text-[36px] font-bold leading-[1.1] tracking-tight">
        <em className="font-medium italic">Bunker u&d</em> · 10 forsøk
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[13px] text-muted-foreground">
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ background: "rgba(184,133,42,0.16)", color: "#6F4F18" }}
        >
          SPILL · korthold
        </span>
        <Dot />
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{
            background: "rgba(184,133,42,0.16)",
            color: "var(--status-warning,#B8852A)",
          }}
        >
          Pågår — 4 av minimum 6 forsøk
        </span>
        <Dot />
        <span>
          Sand-test: 10 slag fra ulik avstand og lie. Mål{" "}
          <b className="text-primary">8/10 før Sørlandsåpent 31.05</b> — best så
          langt 6/10 (10.05).
        </span>
      </div>
    </div>
  );
}

function ActionStrip() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-md border border-border bg-card px-5 py-3.5">
      <span className="mr-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        Status
      </span>
      <ActionItem tone="success">
        <b>6/10</b> best
      </ActionItem>
      <ActionItem>
        <b>6/10</b> sist · 10.05
      </ActionItem>
      <ActionItem tone="info">
        <b>8/10</b> mål
      </ActionItem>
      <ActionItem tone="warn">
        <b>3d</b> til neste forsøk
      </ActionItem>
      <ActionItem>
        <b>4</b> forsøk siden start
      </ActionItem>
      <button className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
        <Plus className="h-4 w-4" />
        Start nytt forsøk
      </button>
    </div>
  );
}

function ActionItem({
  tone,
  children,
}: {
  tone?: "success" | "info" | "warn";
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    default:
      "border-border bg-card text-muted-foreground [&_b]:text-foreground",
    success:
      "border-[rgba(34,184,103,0.25)] bg-[rgba(34,184,103,0.10)] text-[var(--status-success,#1A7D56)] [&_b]:text-[var(--status-success,#1A7D56)]",
    info: "border-[rgba(0,88,64,0.18)] bg-primary/10 text-primary [&_b]:text-primary",
    warn: "border-[rgba(184,133,42,0.25)] bg-[rgba(184,133,42,0.10)] text-[var(--status-warning,#B8852A)] [&_b]:text-[var(--status-warning,#B8852A)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-[12px] font-medium [&_b]:font-mono [&_b]:font-medium [&_b]:tabular-nums ${
        styles[tone ?? "default"]
      }`}
    >
      {children}
    </span>
  );
}

function Bento() {
  return (
    <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
      <TrendCard />
      <StatRail />
    </section>
  );
}

function TrendCard() {
  return (
    <article className="rounded-lg border border-border bg-card px-6 py-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Forsøkshistorikk · siste 90 dager
          </div>
          <h3 className="mt-1 font-display text-[18px] font-bold leading-snug">
            Trend mot mål 8/10
          </h3>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            ● Du
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: "rgba(59,130,246,0.10)", color: "#1D4ED8" }}
          >
            A2-snitt
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Mål
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 720 280"
        preserveAspectRatio="none"
        className="block h-[280px] w-full"
      >
        <line x1="50" y1="30" x2="700" y2="30" stroke="#EBE9E2" />
        <line x1="50" y1="90" x2="700" y2="90" stroke="#EBE9E2" />
        <line x1="50" y1="150" x2="700" y2="150" stroke="#EBE9E2" />
        <line x1="50" y1="210" x2="700" y2="210" stroke="#EBE9E2" />

        <text x="42" y="34" textAnchor="end" fill="#7A7666" fontFamily="monospace" fontSize="10">10</text>
        <text x="42" y="94" textAnchor="end" fill="#7A7666" fontFamily="monospace" fontSize="10">8</text>
        <text x="42" y="154" textAnchor="end" fill="#7A7666" fontFamily="monospace" fontSize="10">6</text>
        <text x="42" y="214" textAnchor="end" fill="#7A7666" fontFamily="monospace" fontSize="10">4</text>

        <line x1="50" y1="90" x2="700" y2="90" stroke="#005840" strokeWidth="2" strokeDasharray="6,4" opacity="0.7" />
        <rect x="630" y="74" width="70" height="14" fill="#005840" rx="3" />
        <text x="665" y="84" textAnchor="middle" fill="#D1F843" fontFamily="monospace" fontSize="9" fontWeight="700">
          MÅL 8/10
        </text>

        <line x1="50" y1="165" x2="700" y2="165" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
        <text x="700" y="161" textAnchor="end" fill="#1D4ED8" fontFamily="monospace" fontSize="9">
          A2-SNITT 5,5
        </text>

        <path d="M 120 195 L 270 165 L 420 135 L 570 135 L 570 240 L 120 240 Z" fill="rgba(0,88,64,0.07)" />
        <polyline points="120,195 270,165 420,135 570,135" fill="none" stroke="#005840" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="570,135 670,108" fill="none" stroke="#005840" strokeWidth="2" strokeDasharray="5,4" opacity="0.55" />
        <circle cx="670" cy="108" r="6" fill="#FAF8F3" stroke="#005840" strokeWidth="2" strokeDasharray="2,2" />
        <text x="670" y="98" textAnchor="middle" fill="#005840" fontFamily="monospace" fontSize="10" fontWeight="700">~7</text>

        <circle cx="120" cy="195" r="5" fill="#005840" />
        <text x="120" y="183" textAnchor="middle" fill="#0A1F18" fontFamily="monospace" fontSize="10" fontWeight="600">3</text>
        <circle cx="270" cy="165" r="5" fill="#005840" />
        <text x="270" y="153" textAnchor="middle" fill="#0A1F18" fontFamily="monospace" fontSize="10" fontWeight="600">4</text>
        <circle cx="420" cy="135" r="5" fill="#005840" />
        <text x="420" y="123" textAnchor="middle" fill="#0A1F18" fontFamily="monospace" fontSize="10" fontWeight="600">5</text>
        <circle cx="570" cy="135" r="7" fill="#D1F843" stroke="#005840" strokeWidth="2.5" />
        <text x="570" y="121" textAnchor="middle" fill="#0A1F18" fontFamily="monospace" fontSize="10" fontWeight="700">6 ★</text>

        <text x="120" y="262" textAnchor="middle" fill="#7A7666" fontFamily="monospace" fontSize="9">12.02</text>
        <text x="270" y="262" textAnchor="middle" fill="#7A7666" fontFamily="monospace" fontSize="9">18.03</text>
        <text x="420" y="262" textAnchor="middle" fill="#7A7666" fontFamily="monospace" fontSize="9">14.04</text>
        <text x="570" y="262" textAnchor="middle" fill="#005840" fontFamily="monospace" fontSize="9" fontWeight="700">10.05 · NÅ</text>
        <text x="670" y="262" textAnchor="middle" fill="#7A7666" fontFamily="monospace" fontSize="9">31.05</text>
      </svg>

      <p className="mt-3.5 text-[12px] leading-relaxed text-muted-foreground">
        Du har klatret jevnt fra 3/10 til 6/10. Fortsetter du i samme tempo,
        treffer du <b className="text-primary">~7/10 på testen 31.05</b> — 1
        unna mål.
      </p>
    </article>
  );
}

function StatRail() {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-card px-6 py-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Sist · Best · Mål
        </div>
        <h3 className="mt-1 font-display text-[18px] font-bold leading-snug">
          Hvor er du nå?
        </h3>
      </div>

      <StatBar label="Sist · 10.05" value="6" denom="/ 10" pct={60} tone="now" />
      <StatBar label="Best · 10.05" value="6" denom="/ 10" pct={60} tone="best" pr />
      <StatBar
        label="Mål · 31.05"
        value="8"
        denom="/ 10"
        pct={80}
        tone="goal"
        marker={60}
        note={
          <>
            Gap til mål: <b className="text-foreground">2 forsøk</b> · 3 uker
            igjen
          </>
        }
        active
      />

      <div className="mt-auto rounded-md border-l-[3px] border-accent bg-accent/20 px-3.5 py-3">
        <p className="text-[12px] leading-relaxed">
          <b>Peer-A2:</b> 5,5/10 · <b>Pro-snitt:</b> 8,2/10. Du leder feltet i
          klassen din.
        </p>
      </div>
    </article>
  );
}

function StatBar({
  label,
  value,
  denom,
  pct,
  tone,
  marker,
  note,
  pr,
  active,
}: {
  label: string;
  value: string;
  denom: string;
  pct: number;
  tone: "now" | "best" | "goal";
  marker?: number;
  note?: React.ReactNode;
  pr?: boolean;
  active?: boolean;
}) {
  const fillCls =
    tone === "now"
      ? "bg-[var(--status-warning,#B8852A)]"
      : tone === "best"
        ? "bg-primary"
        : "border border-primary bg-accent/30";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${
            active ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
        <span
          className={`font-mono text-[22px] font-medium tabular-nums leading-none -tracking-tight ${
            tone === "best" || tone === "goal" ? "text-primary" : "text-foreground"
          }`}
        >
          {value}
          <small className="ml-0.5 text-[12px] text-muted-foreground">
            {denom}
          </small>
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-border">
        <div className={`h-full rounded-full ${fillCls}`} style={{ width: `${pct}%` }} />
        {marker !== undefined && (
          <span
            className="absolute bottom-[-3px] top-[-3px] w-0.5 bg-accent"
            style={{ left: `${marker}%` }}
          />
        )}
      </div>
      {pr && (
        <p className="mt-1 text-[11px] text-[var(--status-success,#1A7D56)]">
          ★ Personlig rekord
        </p>
      )}
      {note && <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}

type Attempt = {
  date: string;
  weekday: string;
  place: string;
  score: number;
  best?: boolean;
  baseline?: boolean;
  lies: { type: "L" | "M" | "V"; hit: boolean }[];
  sand: string;
  diff: string;
  coachNote: string;
};

const attempts: Attempt[] = [
  {
    date: "10. mai 2026",
    weekday: "Søndag",
    place: "Mulligan",
    score: 6,
    best: true,
    lies: [
      { type: "L", hit: true },
      { type: "L", hit: true },
      { type: "L", hit: true },
      { type: "L", hit: false },
      { type: "M", hit: true },
      { type: "M", hit: true },
      { type: "M", hit: false },
      { type: "M", hit: false },
      { type: "V", hit: true },
      { type: "V", hit: false },
    ],
    sand: "Mulligan-sand",
    diff: "Medium · 8 m",
    coachNote:
      "«Bedre kontakt — fortsett med åpen kølleblad. Aksellerasjon gjennom slaget løste det.»",
  },
  {
    date: "14. apr 2026",
    weekday: "Tirsdag",
    place: "GFGK",
    score: 5,
    lies: [
      { type: "L", hit: true },
      { type: "L", hit: true },
      { type: "L", hit: true },
      { type: "L", hit: true },
      { type: "M", hit: false },
      { type: "M", hit: true },
      { type: "M", hit: false },
      { type: "M", hit: false },
      { type: "V", hit: false },
      { type: "V", hit: false },
    ],
    sand: "Bossum-sand grov",
    diff: "Vanskelig · 12 m",
    coachNote:
      "«Hardere sand — ta mer sand bak ballen. Litt for forsiktig på vanskelig lie.»",
  },
  {
    date: "18. mar 2026",
    weekday: "Torsdag",
    place: "Mulligan",
    score: 4,
    lies: [
      { type: "L", hit: true },
      { type: "L", hit: true },
      { type: "L", hit: true },
      { type: "L", hit: false },
      { type: "M", hit: false },
      { type: "M", hit: true },
      { type: "M", hit: false },
      { type: "M", hit: false },
      { type: "V", hit: false },
      { type: "V", hit: false },
    ],
    sand: "Mulligan-sand",
    diff: "Lett · 5 m",
    coachNote:
      "«Setup ok. Akselerasjon manglet i 4 av 10 — du stoppet slaget.»",
  },
  {
    date: "12. feb 2026",
    weekday: "Torsdag",
    place: "Mulligan",
    score: 3,
    baseline: true,
    lies: [
      { type: "L", hit: true },
      { type: "L", hit: true },
      { type: "L", hit: false },
      { type: "L", hit: false },
      { type: "M", hit: true },
      { type: "M", hit: false },
      { type: "M", hit: false },
      { type: "M", hit: false },
      { type: "V", hit: false },
      { type: "V", hit: false },
    ],
    sand: "Mulligan-sand",
    diff: "Medium · 8 m",
    coachNote:
      "«Baseline — nå vet vi hva vi skal jobbe med. Fokus: akselerasjon + åpen kølleblad.»",
  },
];

function AttemptsTable() {
  return (
    <section className="mb-4 rounded-lg border border-border bg-card px-6 py-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Alle forsøk · 4 stk
          </div>
          <h3 className="mt-1 font-display text-[18px] font-bold leading-snug">
            Hva du har gjort så langt
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <LieTabs />
          <button className="rounded-md px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">
            Eksporter CSV
          </button>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {[
              ["Dato · sted", "22%"],
              ["Resultat", "18%"],
              ["Lie-fordeling", "20%"],
              ["Sand · avstand", "16%"],
              ["Coach-notat", ""],
            ].map(([h, w]) => (
              <th
                key={h}
                style={{ width: w || undefined }}
                className="border-b border-border px-3 py-2.5 text-left font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attempts.map((a, i) => (
            <tr
              key={i}
              className={`border-b border-border last:border-b-0 ${a.best ? "bg-accent/20" : ""}`}
            >
              <td className={`px-3 py-3.5 align-top text-[13px] ${a.best ? "border-l-[3px] border-l-primary" : ""}`}>
                <b className="font-semibold">{a.date}</b>
                <small className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                  {a.weekday} · {a.place}
                </small>
              </td>
              <td className="px-3 py-3.5 align-top">
                <span
                  className={`font-mono text-[22px] font-medium tabular-nums -tracking-tight ${
                    a.best
                      ? "text-primary"
                      : a.baseline
                        ? "text-muted-foreground"
                        : "text-foreground"
                  }`}
                >
                  {a.score}
                  <small className="text-[12px] text-muted-foreground font-normal">
                    /10
                  </small>
                </span>
                {a.best && (
                  <span
                    className="ml-1.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                    style={{
                      background: "rgba(26,125,86,0.10)",
                      color: "var(--status-success,#1A7D56)",
                    }}
                  >
                    ★ BEST
                  </span>
                )}
                {a.baseline && (
                  <span className="ml-1.5 inline-block rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                    BASELINE
                  </span>
                )}
              </td>
              <td className="px-3 py-3.5 align-top">
                <div className="flex gap-0.5">
                  {a.lies.map((l, j) => (
                    <span
                      key={j}
                      className={`grid h-3.5 w-3.5 place-items-center rounded-sm text-[8px] font-semibold ${
                        l.hit
                          ? "bg-primary text-accent"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {l.type}
                    </span>
                  ))}
                </div>
                <small className="mt-1.5 block font-mono text-[10px] text-muted-foreground">
                  4L · 4M · 2V
                </small>
              </td>
              <td className="px-3 py-3.5 align-top text-[12px]">
                <b className="font-semibold">{a.sand}</b>
                <br />
                <small className="font-mono text-[11px] text-muted-foreground">
                  {a.diff}
                </small>
              </td>
              <td className="px-3 py-3.5 align-top text-[12px] italic leading-relaxed text-muted-foreground">
                {a.coachNote}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function LieTabs() {
  const tabs = ["Alle lies", "Lett", "Medium", "Vanskelig"];
  return (
    <div className="flex gap-1.5">
      {tabs.map((t, i) => (
        <button
          key={t}
          className={`rounded-sm px-3 py-1.5 text-[11px] ${
            i === 0
              ? "bg-primary text-accent"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function AgentInsight() {
  return (
    <section
      className="relative overflow-hidden rounded-lg border px-6 py-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,88,64,0.04) 0%, rgba(209,248,67,0.08) 100%)",
        borderColor: "rgba(0,88,64,0.16)",
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-[15px] font-bold text-accent">
          A
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Agent-innsikt · oppdatert i dag 07:42
          </div>
          <h3 className="mt-0.5 font-display text-[18px] font-bold leading-snug">
            3 funn for testen 31.05
          </h3>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <Lock className="h-2.5 w-2.5" />
            Pro
          </span>
          <button className="rounded-md px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">
            Send til Anders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Finding label="Forventning" tone="primary">
          Forventet <b>7/10</b> ved test 31.05 — basert på 4 forsøk og 30-dagers
          framgang.
        </Finding>
        <Finding label="Anbefaling" tone="accent">
          2 økter på <b>Chip-område 2</b> før testen hever forventet til{" "}
          <b>8/10</b>. Book onsdag eller fredag.
        </Finding>
        <Finding label="Varsel" tone="warn">
          Sandbase i <b>Bjaavann</b> ligner Bossum chip-område — ikke Mulligan.
          Vurder en GFGK-økt for å trene tyngre sand.
        </Finding>
      </div>
    </section>
  );
}

function Finding({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "primary" | "accent" | "warn";
  children: React.ReactNode;
}) {
  const borderCls =
    tone === "primary"
      ? "border-l-primary [&_b]:text-primary"
      : tone === "accent"
        ? "border-l-accent [&_b]:text-primary"
        : "border-l-[var(--status-warning,#B8852A)] [&_b]:text-primary";
  return (
    <div className={`rounded-md border-l-[3px] bg-card p-4 ${borderCls}`}>
      <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <p className="text-[13px] leading-relaxed text-foreground">{children}</p>
    </div>
  );
}

function Drawer() {
  return (
    <aside className="sticky top-5 self-start overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Test-protokoll
        </div>
        <h3 className="mt-1.5 font-display text-[18px] font-bold leading-snug">
          Hvordan utføre testen
        </h3>
        <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">
          10 forsøk · ca 30 min · 56°/60° wedge
        </div>
        <div className="mt-2.5 flex gap-1.5">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: "rgba(59,130,246,0.10)", color: "#1D4ED8" }}
          >
            Standard NGF
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            A2-tilpasset
          </span>
        </div>
      </div>

      <div className="border-b border-border px-6 py-4">
        <div className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Oppsett
        </div>
        <ul className="space-y-1.5 text-[12px] leading-relaxed text-foreground">
          <li>
            <b className="font-semibold">Sand:</b> hvilken type er tilgjengelig
          </li>
          <li>
            <b className="font-semibold">Avstand:</b> 5–12 m carry til flagg
          </li>
          <li>
            <b className="font-semibold">Fordeling:</b> 4 lett · 4 medium · 2
            vanskelig
          </li>
          <li>
            <b className="font-semibold">Suksess:</b> på green innenfor 1,5 m
          </li>
          <li>
            <b className="font-semibold">Kølle:</b> primært 56°/60° wedge
          </li>
        </ul>
      </div>

      <div className="border-b border-border px-6 py-4">
        <div className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Steg-for-steg
        </div>
        <ol className="flex flex-col">
          {[
            "Varm opp 5 min med 3 prøveslag.",
            <>
              4 forsøk fra <b className="font-semibold">lett lie</b> — ballen
              på sand, god kontakt.
            </>,
            <>
              4 forsøk fra <b className="font-semibold">medium lie</b> — delvis
              nedgravd.
            </>,
            <>
              2 forsøk fra <b className="font-semibold">vanskelig lie</b> —
              nedgravd / oppoverbakke.
            </>,
            "Logg antall innenfor 1,5 m av flagg.",
          ].map((step, i) => (
            <li
              key={i}
              className="flex gap-3 border-b border-border py-2.5 text-[12px] leading-relaxed last:border-b-0"
            >
              <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-accent">
                {i + 1}
              </span>
              <div>{step}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="border-b border-border px-6 py-4">
        <div className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Tips fra Anders
        </div>
        <div className="rounded-md border-l-[3px] border-primary bg-secondary px-3.5 py-3 text-[12px] italic leading-relaxed text-muted-foreground">
          «Ta sanden, ikke ballen. Aksellerer gjennom — ikke stopp slaget. På
          vanskelige lies: kølleblad mer åpent og knus mer sand.»
        </div>
      </div>

      <div className="flex flex-col gap-2 px-6 py-4">
        <button className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" />
          Start nytt forsøk
        </button>
        <button className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium hover:bg-secondary">
          Book sand-tid GFGK
        </button>
        <button className="inline-flex items-center justify-center gap-1 px-3.5 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground">
          Se video-protokoll
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}

function Dot() {
  return (
    <span
      className="inline-block h-1 w-1 rounded-full"
      style={{ background: "var(--ink-disabled, #C4C0B8)" }}
    />
  );
}
