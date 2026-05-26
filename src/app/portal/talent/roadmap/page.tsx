/**
 * PlayerHQ — Talent · Roadmap
 *
 * Design: 06 Talent-modul.html · Skjerm 2 (Min plan)
 * 12-mnd roadmap SVG + phase-cards med mål + AI-strip
 *
 * TODO: koble til DB i runde XX (faser og milepæler fra TalentTracking.milepaeler JSON)
 */
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import "@/components/talent/talent.css";

type Milepael = {
  tittel: string;
  dato: string;
  beskrivelse?: string;
  oppnadd?: boolean;
};

function parseMilepaeler(json: unknown): Milepael[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (m): m is Milepael =>
      typeof m === "object" && m !== null && typeof (m as Milepael).tittel === "string",
  );
}

// Demo-faser for roadmap (TODO: hent fra DB/plan-struktur)
const DEMO_FASER = [
  {
    tittel: "Fase 1 — Grunntrening",
    periode: "mai – juni",
    status: "aktiv" as const,
    fokus: "Volum-bygging og teknisk basis",
    mal: [
      { disiplin: "FYS", tekst: "VO2max løft", pct: 60 },
      { disiplin: "TEK", tekst: "7-jern smash factor", pct: 80 },
      { disiplin: "SLAG", tekst: "Putting 1,5m konsistens", pct: 100, done: true },
      { disiplin: "TURN", tekst: "Pre-shot rutine", pct: 40 },
    ],
  },
  {
    tittel: "Fase 2 — Oppbygging",
    periode: "juli – september",
    status: "kommer" as const,
    fokus: "Spesifikk styrke + turnerings-readiness",
    mal: [
      { disiplin: "FYS", tekst: "Eksplosiv styrke", pct: 0 },
      { disiplin: "TEK", tekst: "Driver carry distanse", pct: 0 },
      { disiplin: "SLAG", tekst: "Chipping landingsone", pct: 0 },
    ],
  },
  {
    tittel: "Fase 3 — Spesialisering",
    periode: "oktober – januar",
    status: "kommer" as const,
    fokus: "Vinter-trening, mental og spillforståelse",
    mal: [
      { disiplin: "TURN", tekst: "MTQ-score økning", pct: 0 },
      { disiplin: "SPILL", tekst: "Course management quiz", pct: 0 },
    ],
  },
  {
    tittel: "Fase 4 — Konkurranse",
    periode: "februar – mai",
    status: "kommer" as const,
    fokus: "Finstilling og sesong-åpning",
    mal: [
      { disiplin: "TEK", tekst: "Bevare alle TEK-metrikker", pct: 0 },
      { disiplin: "SLAG", tekst: "Putting under press", pct: 0 },
    ],
  },
] as const;

const DISC_CLASS_SMALL: Record<string, string> = {
  FYS: "te-badge te-badge-fys",
  TEK: "te-badge te-badge-tek",
  SLAG: "te-badge te-badge-slag",
  SPILL: "te-badge te-badge-spill",
  TURN: "te-badge te-badge-turn",
};

// Måneder for roadmap-header
const MANEDER = ["MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DES", "JAN", "FEB", "MAR", "APR"];

export default async function RoadmapPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const tracking = await prisma.talentTracking.findUnique({
    where: { userId: user.id },
    select: { niva: true, milepaeler: true },
  });
  if (!tracking) return null;

  const milepaeler = parseMilepaeler(tracking.milepaeler);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/portal/talent"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Tilbake til talent
        </Link>
      </div>

      <div>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Talent · Min plan
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          Min <em className="font-serif italic font-normal text-primary">talent-plan</em> — 12 måneder
        </h1>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          Kategori {tracking.niva} · 4 faser · 6 evaluerings-punkter
        </p>
      </div>

      {/* KPI-bobler */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { lbl: "Mål neste 12 mnd", v: "Nivå-opp", sub: "Neste kategori" },
          { lbl: "Faser", v: "4", sub: "Grunntrening → Konkurranse" },
          { lbl: "Evaluering", v: "6 punkter", sub: "Hver 2. måned" },
        ].map((b) => (
          <div key={b.lbl} className="rounded-lg border border-border bg-card p-4">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.10em] text-muted-foreground">{b.lbl}</div>
            <div className="mt-1 font-mono text-[22px] font-semibold leading-none tabular-nums text-foreground">{b.v}</div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">{b.sub}</div>
          </div>
        ))}
      </div>

      {/* Roadmap SVG */}
      <div className="overflow-hidden rounded-xl border border-border bg-card p-6">
        <div className="w-full overflow-x-auto">
          <svg viewBox="0 0 1200 360" className="h-auto w-full min-w-[640px]" preserveAspectRatio="none" aria-label="12-måneders roadmap">
            {/* Måned-headers */}
            {MANEDER.map((m, i) => (
              <text
                key={m}
                x={50 + i * 100} y="20"
                textAnchor="middle"
                fontFamily="var(--font-jetbrains-mono,monospace)"
                fontSize="10" fill="#5E5C57" letterSpacing="0.06em"
              >
                {m}
              </text>
            ))}

            {/* I DAG-linje */}
            <line x1="50" y1="30" x2="50" y2="280" stroke="#A32D2D" strokeWidth="2" />
            <text x="50" y="42" textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="9" fontWeight="700" fill="#A32D2D">I DAG</text>

            {/* Faser */}
            <rect x="20" y="60" width="180" height="50" rx="10" fill="#88B45A" opacity="0.55" />
            <text x="110" y="82" textAnchor="middle" fontFamily="var(--font-inter-tight,sans-serif)" fontSize="13" fontWeight="700" fill="#0A1F17">GRUNNTRENING</text>
            <text x="110" y="100" textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="9" fill="#0A1F17">mai-jun</text>

            <rect x="210" y="60" width="290" height="50" rx="10" fill="#2C7D52" />
            <text x="355" y="82" textAnchor="middle" fontFamily="var(--font-inter-tight,sans-serif)" fontSize="13" fontWeight="700" fill="#FFFFFF">OPPBYGGING</text>
            <text x="355" y="100" textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="9" fill="rgba(255,255,255,0.7)">jul-sep</text>

            <rect x="510" y="60" width="380" height="50" rx="10" fill="#005840" />
            <text x="700" y="82" textAnchor="middle" fontFamily="var(--font-inter-tight,sans-serif)" fontSize="13" fontWeight="700" fill="#D1F843">SPESIALISERING</text>
            <text x="700" y="100" textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="9" fill="rgba(209,248,67,0.7)">okt-jan</text>

            <rect x="900" y="60" width="280" height="50" rx="10" fill="#D1F843" />
            <text x="1040" y="82" textAnchor="middle" fontFamily="var(--font-inter-tight,sans-serif)" fontSize="13" fontWeight="700" fill="#0A1F17">KONKURRANSE</text>
            <text x="1040" y="100" textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="9" fill="#0A1F17">feb-mai</text>

            {/* Evaluerings-markører */}
            {[
              { x: 245, label: "JUL: FYS+TEK" },
              { x: 445, label: "SEP: MID" },
              { x: 645, label: "NOV: OFF" },
              { x: 845, label: "JAN: VINTER" },
              { x: 1045, label: "MAR: PRE" },
              { x: 1145, label: "MAI: ÅRS" },
            ].map((e) => (
              <g key={e.x}>
                <polygon points={`${e.x},140 ${e.x + 7},153 ${e.x - 7},153`} fill="#D1F843" stroke="#005840" strokeWidth="1.5" />
                <text x={e.x} y="170" textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="9" fill="#005840" fontWeight="700">{e.label}</text>
              </g>
            ))}

            {/* Turneringer */}
            <line x1="20" y1="240" x2="1180" y2="240" stroke="#E5E3DD" strokeWidth="1" />
            {[
              { x: 158, name: "SØRLANDS", dato: "16. JUNI" },
              { x: 280, name: "NM SLAG", dato: "22. JULI" },
              { x: 400, name: "KLUBBM", dato: "28. AUG" },
            ].map((t) => (
              <g key={t.x}>
                <circle cx={t.x} cy="240" r="6" fill="#D1F843" stroke="#005840" strokeWidth="1.5" />
                <text x={t.x} y="262" textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="9" fill="#0A1F17" fontWeight="700">{t.name}</text>
                <text x={t.x} y="275" textAnchor="middle" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="8" fill="#5E5C57">{t.dato}</text>
              </g>
            ))}
            <text x="20" y="330" fontFamily="var(--font-jetbrains-mono,monospace)" fontSize="10" fontWeight="700" fill="#0A1F17">TURNERINGS-PLAN</text>
          </svg>
        </div>
      </div>

      {/* Phase-cards */}
      {DEMO_FASER.map((fase, i) => (
        <div key={i} className={`ta-phase-card${fase.status === "aktiv" ? " active" : ""}`}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="font-display text-base font-semibold">{fase.tittel}</div>
            <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
              fase.status === "aktiv"
                ? "bg-accent text-accent-foreground"
                : "border border-border bg-background text-muted-foreground"
            }`}>
              {fase.status === "aktiv" ? "Aktiv" : "Kommer"}
            </span>
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">{fase.periode}</span>
          </div>
          <p className="mb-2 font-serif italic text-sm text-muted-foreground">{fase.fokus}</p>
          {fase.mal.map((m, j) => (
            <div key={j} className="ta-goal-row">
              <span className={`${DISC_CLASS_SMALL[m.disiplin] ?? "te-badge"} text-[9px]`}>
                {m.disiplin}
              </span>
              <span className={`text-sm font-medium ${"done" in m && m.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {m.tekst}
              </span>
              <div className="ta-pbar">
                <div className={"done" in m && m.done ? "done" : ""} style={{ width: `${m.pct}%` }} />
              </div>
              <span className={`text-right font-mono text-[11px] font-semibold tabular-nums ${"done" in m && m.done ? "text-primary" : m.pct === 0 ? "text-muted-foreground" : "text-foreground"}`}>
                {"done" in m && m.done ? "100%" : m.pct === 0 ? "—" : `${m.pct}%`}
              </span>
            </div>
          ))}
        </div>
      ))}

      {/* Milepæler fra DB */}
      {milepaeler.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-base font-semibold">Personlige milepæler</h3>
          <ul className="space-y-2">
            {milepaeler.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {m.oppnadd ? (
                  <CheckCircle2 size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-primary" />
                ) : (
                  <Circle size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <div className="font-semibold">{m.tittel}</div>
                  {m.dato && <div className="font-mono text-[10px] text-muted-foreground">{m.dato}</div>}
                  {m.beskrivelse && <div className="mt-1 text-xs text-muted-foreground">{m.beskrivelse}</div>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* AI-strip */}
      <div className="rounded-xl border border-l-4 border-accent/55 border-l-accent bg-accent/10 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-[13.5px] leading-relaxed">
              <strong className="font-display font-bold">Planen din er godt balansert.</strong>{" "}
              Oktober–januar er kritisk for progresjon. Vil du legge inn ekstra treningsøkter i en av fasene?
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
                Endre plan
              </button>
              <Link
                href="/portal/talent/sammenligning"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground"
              >
                Se sammenligning
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
