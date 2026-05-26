/**
 * Planlegge · Mål-tab — pixel-perfekt fra Claude Design-bundle
 * kgPURcJRyibKHRG8s69wKg (project/planlegge/planlegge-mal.html).
 *
 * Sesong-progresjon hero-ring + 3 mål-cards (priority/ontrack/atrisk) +
 * AI-mål-bygger-CTA + arkiv-card for fullførte mål.
 *
 * Bruker sample-data inntil Goal-modellen har milestones + meta-felter.
 */

import Link from "next/link";
import { ArrowRight, Check, MoreHorizontal, Sparkles, Star, Target, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import "./mal-tab.css";

type GoalSample = {
  type: "resultat" | "prosess" | "atferd";
  status: "ontrack" | "atrisk" | "done";
  priority?: boolean;
  titleLead: string;
  titleEm: string;
  titleTrail?: string;
  from: string;
  now: string;
  to: string;
  trendNote: string;
  trendTone: "success" | "warn";
  pct: number; // 0-100
  markerLabel: string;
  milestones: { date: string; value: string; state: "done" | "current" | "upcoming" }[];
  side: {
    sparkline: "g1" | "g2" | "g3";
    meta: { label: string; value: string; tone?: "ok" | "warn" }[];
    deadline: { days: number; date: string };
    thread?: { author: string; initials: string; text: string; when: string };
    actions: { label: string; variant: "primary" | "outline" | "lime"; href?: string }[];
  };
};

const GOALS: GoalSample[] = [
  {
    type: "resultat",
    status: "ontrack",
    priority: true,
    titleLead: "HCP",
    titleEm: "4,8 → 2,5",
    titleTrail: "innen 30. oktober",
    from: "6,8",
    now: "4,8",
    to: "2,5",
    trendNote: "↑ -2,0 så langt · 47% av løypa",
    trendTone: "success",
    pct: 47,
    markerLabel: "Nå · uke 21",
    milestones: [
      { date: "28. FEB", value: "HCP 6,0", state: "done" },
      { date: "15. APR", value: "HCP 5,2", state: "done" },
      { date: "23. MAI · NÅ", value: "HCP 4,8", state: "current" },
      { date: "14. JUL", value: "HCP 3,8", state: "upcoming" },
      { date: "30. OKT", value: "HCP 2,5", state: "upcoming" },
    ],
    side: {
      sparkline: "g1",
      meta: [
        { label: "Sannsynlighet", value: "68%", tone: "ok" },
        { label: "Behøver/uke", value: "-0,16" },
        { label: "Avhengig av", value: "Mål 2 + 3" },
        { label: "Coach-poeng", value: "+0,42 SG" },
      ],
      deadline: { days: 160, date: "30. okt" },
      thread: {
        author: "Anders K.",
        initials: "AK",
        text: "Du ligger på rute. Hold trykket — Sørlandsåpent kan gi -0,6 alene.",
        when: "21. mai · 11:42",
      },
      actions: [
        { label: "Logg progresjon", variant: "primary" },
        { label: "Detaljert plan →", variant: "outline" },
      ],
    },
  },
  {
    type: "prosess",
    status: "ontrack",
    titleLead: "Driver Basic PEI",
    titleEm: "under 0,055",
    titleTrail: "i 6 av 10 forsøk",
    from: "0/10",
    now: "4/10",
    to: "6/10",
    trendNote: "PR 0,054 satt i dag · +1 til måling",
    trendTone: "success",
    pct: 67,
    markerLabel: "Nå · 4 av 6",
    milestones: [
      { date: "JAN-FEB", value: "0,082 → 0,072", state: "done" },
      { date: "MAR-APR", value: "PR 0,058", state: "done" },
      { date: "23. MAI · NÅ", value: "PR 0,054 · 4/10", state: "current" },
      { date: "14. JUL", value: "5 av 10", state: "upcoming" },
      { date: "31. AUG", value: "6 av 10", state: "upcoming" },
    ],
    side: {
      sparkline: "g2",
      meta: [
        { label: "Sannsynlighet", value: "82%", tone: "ok" },
        { label: "Test-frekvens", value: "2×/mnd" },
        { label: "Siste 5", value: "4 ok" },
        { label: "PGA Top 40", value: "< 0,06" },
      ],
      deadline: { days: 100, date: "31. aug" },
      actions: [
        { label: "Ta Driver Basic", variant: "primary" },
        { label: "Se historikk →", variant: "outline" },
      ],
    },
  },
  {
    type: "atferd",
    status: "atrisk",
    titleLead: "Pre-shot rutine",
    titleEm: "7 sek",
    titleTrail: "· 90% av slag i turnering",
    from: "62%",
    now: "68%",
    to: "90%",
    trendNote: "⚠ Bare +6pp på 8 uker · trenger akselerasjon",
    trendTone: "warn",
    pct: 21,
    markerLabel: "Nå · 68%",
    milestones: [
      { date: "15. MAR · BASELINE", value: "62%", state: "done" },
      { date: "23. MAI · NÅ", value: "68%", state: "current" },
      { date: "22. JUN · OSLO OPEN", value: "75%", state: "upcoming" },
      { date: "14. JUL · NM JR", value: "82%", state: "upcoming" },
      { date: "18. AUG · FINALEN", value: "90%", state: "upcoming" },
    ],
    side: {
      sparkline: "g3",
      meta: [
        { label: "Sannsynlighet", value: "54%", tone: "warn" },
        { label: "Behøver/uke", value: "+1,8pp" },
        { label: "Drill-vol.", value: "2/uke", tone: "warn" },
        { label: "Coach-fokus", value: "Mentaltrener" },
      ],
      deadline: { days: 87, date: "18. aug" },
      thread: {
        author: "Anders K.",
        initials: "AK",
        text: "Vi må øke pre-shot drill til 4×/uke. Book MTQ-test denne uka.",
        when: "19. mai · 09:18",
      },
      actions: [
        { label: "Book MTQ-test", variant: "primary" },
        { label: "Be om revurdering →", variant: "outline" },
      ],
    },
  },
];

export async function MalTab({ userId }: { userId: string }) {
  // Faktisk antall aktive mål fra DB — fall tilbake til sample når 0
  const goalCount = await prisma.goal
    .count({ where: { userId, status: "ACTIVE" } })
    .catch(() => 0);

  // Sesong-progresjon mock (kobles mot SeasonPlan + Goal-progress senere)
  const seasonPct = 55;

  return (
    <div className="mal-tab-shell">
      <GoalHero seasonPct={seasonPct} goalCount={goalCount || GOALS.length} />

      {GOALS.map((g, i) => (
        <GoalCard key={i} goal={g} />
      ))}

      <AIBar />

      <DoneGoalArchive />
    </div>
  );
}

// ──────────────────────────────────────────────────────────── Goal-hero ──

function GoalHero({ seasonPct, goalCount }: { seasonPct: number; goalCount: number }) {
  const ringCircumference = 2 * Math.PI * 42;
  const dashOffset = ringCircumference * (1 - seasonPct / 100);

  return (
    <section className="goal-hero">
      <div className="gh-ring">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#D1F843"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={ringCircumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="center">
          <div className="num">
            {seasonPct}
            <span className="u">%</span>
          </div>
          <div className="lbl">Sesong-progresjon</div>
        </div>
      </div>

      <div className="gh-body">
        <div className="eye">Sammen-vektet sesong-score</div>
        <h2>
          Du er <em>over halvveis</em> til breakthrough-året
        </h2>

        <div className="gh-stats">
          <div className="gh-stat">
            <div className="l">HCP-progresjon</div>
            <div className="v lime">
              4,8 <span className="u">av 2,5</span>
            </div>
          </div>
          <div className="gh-stat">
            <div className="l">Tester gjennomført</div>
            <div className="v">
              12<span className="u">/36</span>
            </div>
          </div>
          <div className="gh-stat">
            <div className="l">Ranking-poeng</div>
            <div className="v">
              128<span className="u">/280p</span>
            </div>
          </div>
          <div className="gh-stat">
            <div className="l">Dager igjen</div>
            <div className="v">
              160 <span className="u">d</span>
            </div>
          </div>
        </div>
      </div>

      <div className="gh-actions">
        <Link href="/portal/coach" className="mt-btn mt-btn-lime">
          <Target className="h-3.5 w-3.5" /> Coach-samtale
        </Link>
        <button type="button" className="mt-btn mt-btn-ghost-lime">
          Reflekter
        </button>
        <span className="font-mono mt-2 text-center text-[9.5px] uppercase tracking-[0.10em] text-white/60">
          {goalCount} aktive mål
        </span>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────── Goal-card ──

function GoalCard({ goal: g }: { goal: GoalSample }) {
  const cardClass = ["goal-card", g.priority ? "priority" : "", g.status === "atrisk" ? "atrisk" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={cardClass}>
      <div>
        <div className="top">
          <span className={`g-type ${g.type}`}>{g.type === "resultat" ? "Resultat" : g.type === "prosess" ? "Prosess" : "Atferd"}</span>
          {g.priority ? (
            <span className="inline-flex items-center gap-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-primary">
              <Star className="h-3 w-3 fill-current" strokeWidth={2} aria-hidden /> HOVED-MÅL
            </span>
          ) : null}
          <span className={`status-pill ${g.status}`}>
            {g.status === "ontrack" ? "På plan" : g.status === "atrisk" ? "Trenger fokus" : "Fullført"}
          </span>
          <button type="button" className="mt-btn mt-btn-ghost mt-btn-xs ml-auto" aria-label="Mer">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="title">
          {g.titleLead} <em>{g.titleEm}</em>
          {g.titleTrail ? ` ${g.titleTrail}` : ""}
        </div>

        <div className="progress-meta">
          <span className="lbl">START</span>
          <span className="from">{g.from}</span>
          <span className="arr">→</span>
          <span className="lbl" style={{ marginLeft: 14 }}>NÅ</span>
          <span className="now" style={g.trendTone === "warn" ? { color: "var(--warn)" } : undefined}>
            {g.now}
          </span>
          <span className="arr">→</span>
          <span className="lbl" style={{ marginLeft: 14 }}>MÅL</span>
          <span className="to">{g.to}</span>
          <span
            className="font-mono ml-auto text-[11px] font-bold"
            style={{ color: g.trendTone === "warn" ? "var(--warn)" : "var(--success)" }}
          >
            {g.trendNote}
          </span>
        </div>

        <div className={`pbar ${g.status === "atrisk" ? "atrisk" : ""}`}>
          <div className="fill" style={{ width: `${g.pct}%` }} />
          <div className="marker" data-label={g.markerLabel} style={{ left: `${g.pct}%` }} />
          <div className="now-dot" style={{ left: `${g.pct}%` }} />
        </div>

        <div className="ms-row">
          {g.milestones.map((m, i) => (
            <div key={i} className={`ms ${m.state === "done" ? "done" : m.state === "current" ? "current" : ""}`}>
              <span className="chk">
                {m.state === "done" || m.state === "current" ? (
                  <Check strokeWidth={3} />
                ) : null}
              </span>
              <div className="body">
                <div className="lbl">{m.date}</div>
                <div className="v">{m.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GoalSide side={g.side} />
    </section>
  );
}

// ──────────────────────────────────────────────────────────── Goal-side ──

function GoalSide({ side }: { side: GoalSample["side"] }) {
  return (
    <aside className="goal-side">
      <Sparkline kind={side.sparkline} />

      <div className="side-meta">
        {side.meta.map((m, i) => (
          <div key={i} className="item">
            <div className="l">{m.label}</div>
            <div className={`v ${m.tone === "ok" ? "ok" : m.tone === "warn" ? "warn" : ""}`}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="deadline">
        <span className="days-pill">{side.deadline.days}d</span>
        <div>
          <span className="dt">DEADLINE</span>
          <span className="v">{side.deadline.date}</span>
        </div>
      </div>

      {side.thread ? (
        <div className="thread">
          <div className="row">
            <div className="av">{side.thread.initials}</div>
            <div>
              <div className="txt">«{side.thread.text}»</div>
              <div className="when">
                {side.thread.author} · {side.thread.when}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="side-actions">
        {side.actions.map((a, i) =>
          a.href ? (
            <Link key={i} href={a.href} className={`mt-btn mt-btn-${a.variant} ${i > 0 ? "mt-btn-sm" : ""}`}>
              {a.label}
            </Link>
          ) : (
            <button key={i} type="button" className={`mt-btn mt-btn-${a.variant} ${i > 0 ? "mt-btn-sm" : ""}`}>
              {a.label}
            </button>
          ),
        )}
      </div>
    </aside>
  );
}

// ──────────────────────────────────────────────────────────── Sparkline ──

function Sparkline({ kind }: { kind: "g1" | "g2" | "g3" }) {
  if (kind === "g1") {
    return (
      <svg className="side-spark" viewBox="0 0 200 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mt-g1-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#D1F843" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D1F843" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 4 12 L 28 18 L 52 24 L 76 34 L 100 44 L 124 50 L 148 56 L 172 62 L 196 68 L 196 80 L 4 80 Z"
          fill="url(#mt-g1-fill)"
        />
        <polyline
          points="4,12 28,18 52,24 76,34 100,44 124,50 148,56 172,62 196,68"
          fill="none"
          stroke="#005840"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="100" cy="44" r="5" fill="#D1F843" stroke="#003A2A" strokeWidth="2" />
        <text x="100" y="36" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" fill="#0A1F17">
          NÅ
        </text>
        <line x1="4" y1="72" x2="196" y2="72" stroke="#B8852A" strokeWidth="1" strokeDasharray="3 3" />
        <text x="196" y="78" textAnchor="end" fontFamily="JetBrains Mono" fontSize="7.5" fill="#B8852A">
          mål 2,5
        </text>
      </svg>
    );
  }
  if (kind === "g2") {
    return (
      <svg className="side-spark" viewBox="0 0 200 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mt-g2-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#D1F843" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D1F843" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 4 60 L 28 56 L 52 50 L 76 48 L 100 38 L 124 36 L 148 28 L 172 24 L 196 18 L 196 80 L 4 80 Z"
          fill="url(#mt-g2-fill)"
        />
        <polyline
          points="4,60 28,56 52,50 76,48 100,38 124,36 148,28 172,24 196,18"
          fill="none"
          stroke="#005840"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="172" cy="24" r="5" fill="#D1F843" stroke="#003A2A" strokeWidth="2" />
        <text x="172" y="16" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" fill="#0A1F17">
          NÅ
        </text>
        <line x1="4" y1="18" x2="196" y2="18" stroke="#005840" strokeWidth="1" strokeDasharray="3 3" />
        <text x="196" y="14" textAnchor="end" fontFamily="JetBrains Mono" fontSize="7.5" fill="#005840">
          mål 6/10
        </text>
      </svg>
    );
  }
  return (
    <svg className="side-spark" viewBox="0 0 200 80" preserveAspectRatio="none">
      <defs>
        <linearGradient id="mt-g3-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#B8852A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#B8852A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 4 60 L 50 58 L 100 56 L 150 54 L 196 52 L 196 80 L 4 80 Z" fill="url(#mt-g3-fill)" />
      <polyline
        points="4,60 50,58 100,56 150,54 196,52"
        fill="none"
        stroke="#B8852A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="196" cy="52" r="5" fill="#fff" stroke="#B8852A" strokeWidth="2" />
      <line x1="4" y1="14" x2="196" y2="14" stroke="#005840" strokeWidth="1" strokeDasharray="3 3" />
      <text x="196" y="11" textAnchor="end" fontFamily="JetBrains Mono" fontSize="7.5" fill="#005840">
        mål 90%
      </text>
      <text x="100" y="78" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="#B8852A">
        Flatt — trenger akselerasjon
      </text>
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────── AI bar ──

function AIBar() {
  return (
    <section className="ai-bar">
      <div className="ic">
        <Sparkles className="h-4 w-4" fill="currentColor" />
      </div>
      <div>
        <div className="ttl">Trenger flere mål? AI bygger SMART-mål basert på din sesong-plan</div>
        <div className="sub">Resultat · Prosess · Atferd · maks 3 anbefalt</div>
      </div>
      <Link href="/portal/ai/mal-bygger" className="mt-btn mt-btn-lime">
        Åpne AI mål-bygger
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </Link>
    </section>
  );
}

// ───────────────────────────────────────────────────────── Done archive ──

function DoneGoalArchive() {
  return (
    <section className="goal-card done">
      <div>
        <div className="top">
          <span className="g-type resultat">Resultat</span>
          <span className="status-pill done">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
            Fullført 04. mai
          </span>
          <button type="button" className="mt-btn mt-btn-ghost mt-btn-xs ml-auto" aria-label="Mer">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="title">
          Vårcup 2026 · <em>topp-10</em> resultat —{" "}
          <strong
            className="font-display"
            style={{ color: "var(--success)", fontWeight: 700, fontStyle: "normal" }}
          >
            T-4 (+3)
          </strong>
        </div>

        <div className="progress-meta">
          <span className="lbl">RESULTAT</span>
          <span className="font-mono text-sm font-bold" style={{ color: "var(--success)" }}>
            T-4 · 28 ranking-poeng
          </span>
          <span className="font-mono ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            Mål: topp-10 <Check className="h-3 w-3 text-primary" strokeWidth={2.5} aria-hidden /> · oversteg med 6 plasseringer
          </span>
        </div>
      </div>

      <aside
        className="goal-side"
        style={{ background: "rgba(44,125,82,0.05)", borderColor: "rgba(44,125,82,0.20)" }}
      >
        <div className="py-4 text-center">
          <Trophy className="mx-auto h-9 w-9" style={{ color: "var(--success)" }} strokeWidth={1.5} />
          <div
            className="font-display mt-2 text-2xl font-bold"
            style={{ color: "var(--success)" }}
          >
            T-4
          </div>
          <div className="font-mono mt-1 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Olyo Vårcup · 4. mai
          </div>
        </div>
        <button type="button" className="mt-btn mt-btn-outline mt-btn-sm">
          Se rapport →
        </button>
      </aside>
    </section>
  );
}
