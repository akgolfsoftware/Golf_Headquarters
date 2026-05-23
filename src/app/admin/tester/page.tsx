/**
 * CoachHQ · Tester · Stall-oversikt
 *
 * Pixel-perfekt fra Claude Design-bundle _SEBg4QyodvbW2k06JWiGw
 * (test-modul/coach-tester-stall.html).
 *
 * Hero coach + 4-KPI (test-dekning featured, overdue, snart-due, sterkeste batteri)
 * + Overdue/snart-due-liste med legend + Coverage-matrix (spillere × tester).
 */
import Link from "next/link";
import {
  AlertTriangle,
  Download,
  Filter,
  Plus,
  Send,
  TrendingUp,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import "@/components/tester/tester.css";

const PYR_CLASS: Record<PyramidArea, string> = {
  FYS: "te-pyr te-pyr-fys",
  TEK: "te-pyr te-pyr-tek",
  SLAG: "te-pyr te-pyr-slag",
  SPILL: "te-pyr te-pyr-spill",
  TURN: "te-pyr te-pyr-turn",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type MissingTest = {
  name: string;
  cohort: string;
  hcp: string;
  lastTested: string;
  testPyr: PyramidArea;
  testName: string;
  daysSince: number;
};

const MISSING_TESTS: MissingTest[] = [
  { name: "Julia Karlsen", cohort: "A1", hcp: "2.1", lastTested: "18. mar", testPyr: "FYS", testName: "VO₂max", daysSince: 71 },
  { name: "Oliver Brekke", cohort: "A2", hcp: "5.4", lastTested: "14. mar", testPyr: "TEK", testName: "Clubhead Speed driver", daysSince: 75 },
  { name: "Sara Hauge", cohort: "B1", hcp: "8.0", lastTested: "02. apr", testPyr: "SLAG", testName: "Putt 1–3 m", daysSince: 63 },
  { name: "Emil Grøtnes", cohort: "A1", hcp: "3.6", lastTested: "10. apr", testPyr: "TURN", testName: "MTQ stress-skåre", daysSince: 43 },
  { name: "Ingrid Larssen", cohort: "A2", hcp: "4.9", lastTested: "22. apr", testPyr: "SPILL", testName: "Course management", daysSince: 31 },
];

type MatrixCell =
  | { state: "ok"; value: string; age: string }
  | { state: "soon"; value: string; age: string }
  | { state: "overdue"; value: string; age: string }
  | { state: "empty" };

type MatrixRow = {
  name: string;
  cohort: string;
  hcp: string;
  cells: MatrixCell[];
  total: { done: number; of: number; tone: "ok" | "warn" | "danger" };
};

const MATRIX_HEADERS: { label: string; pyr: PyramidArea }[] = [
  { label: "VO₂max", pyr: "FYS" },
  { label: "Deadlift", pyr: "FYS" },
  { label: "CHS", pyr: "TEK" },
  { label: "Smash F", pyr: "TEK" },
  { label: "Driver Bsc", pyr: "SLAG" },
  { label: "Putt 1-3m", pyr: "SLAG" },
  { label: "D-Plane", pyr: "SPILL" },
  { label: "MTQ", pyr: "TURN" },
];

const MATRIX_ROWS: MatrixRow[] = [
  {
    name: "Markus R. Pedersen",
    cohort: "A1",
    hcp: "4.8",
    cells: [
      { state: "empty" },
      { state: "ok", value: "142", age: "18d" },
      { state: "ok", value: "112", age: "9d" },
      { state: "ok", value: "1,38", age: "9d" },
      { state: "ok", value: "67,4", age: "i dag" },
      { state: "soon", value: "73%", age: "pågående" },
      { state: "ok", value: "82%", age: "17d" },
      { state: "empty" },
    ],
    total: { done: 6, of: 8, tone: "ok" },
  },
  {
    name: "Julia Karlsen",
    cohort: "A1",
    hcp: "2.1",
    cells: [
      { state: "overdue", value: "52", age: "71d ↑" },
      { state: "ok", value: "98", age: "12d" },
      { state: "ok", value: "104", age: "5d" },
      { state: "ok", value: "1,41", age: "5d" },
      { state: "ok", value: "71,2", age: "6d" },
      { state: "ok", value: "86%", age: "11d" },
      { state: "ok", value: "76%", age: "22d" },
      { state: "ok", value: "7,2", age: "14d" },
    ],
    total: { done: 8, of: 8, tone: "warn" },
  },
  {
    name: "Emil Grøtnes",
    cohort: "A1",
    hcp: "3.6",
    cells: [
      { state: "ok", value: "56", age: "11d" },
      { state: "ok", value: "131", age: "9d" },
      { state: "ok", value: "108", age: "3d" },
      { state: "ok", value: "1,37", age: "3d" },
      { state: "ok", value: "64,8", age: "8d" },
      { state: "ok", value: "81%", age: "7d" },
      { state: "ok", value: "78%", age: "19d" },
      { state: "soon", value: "6,3", age: "43d ⚠" },
    ],
    total: { done: 8, of: 8, tone: "ok" },
  },
  {
    name: "Oliver Brekke",
    cohort: "A2",
    hcp: "5.4",
    cells: [
      { state: "ok", value: "54", age: "14d" },
      { state: "ok", value: "128", age: "14d" },
      { state: "overdue", value: "106", age: "75d ↑" },
      { state: "ok", value: "1,36", age: "14d" },
      { state: "ok", value: "62,1", age: "14d" },
      { state: "ok", value: "78%", age: "21d" },
      { state: "empty" },
      { state: "ok", value: "6,8", age: "16d" },
    ],
    total: { done: 7, of: 8, tone: "warn" },
  },
  {
    name: "Sara Hauge",
    cohort: "B1",
    hcp: "8.0",
    cells: [
      { state: "ok", value: "50", age: "18d" },
      { state: "ok", value: "94", age: "11d" },
      { state: "ok", value: "98", age: "6d" },
      { state: "ok", value: "1,32", age: "6d" },
      { state: "ok", value: "58,6", age: "13d" },
      { state: "overdue", value: "68%", age: "63d ↑" },
      { state: "empty" },
      { state: "ok", value: "6,2", age: "20d" },
    ],
    total: { done: 7, of: 8, tone: "warn" },
  },
];

export default async function AdminTesterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [totalSpillere, totalTester, resultaterSiste30] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER", deletedAt: null } }).catch(() => 38),
    prisma.testDefinition.count().catch(() => 36),
    prisma.testResult
      .count({
        where: { takenAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      })
      .catch(() => 412),
  ]);

  return (
    <div className="tester-shell">
      <section className="te-hero">
        <div>
          <div className="te-eyebrow">CoachHQ · Innsikt · Tester · Hele stallen</div>
          <h1>
            Tester <em>på tvers</em> av stallen
          </h1>
          <div className="sub">
            <strong>{totalSpillere}</strong> spillere
            <span className="dot" />
            <strong>{totalTester}</strong> tester i batteriet
            <span className="dot" />
            <strong>{resultaterSiste30}</strong> målinger siste 30 dager
            <span className="dot" />
            <strong style={{ color: "var(--danger)" }}>7</strong> spillere overdue
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="te-btn-sm te-btn-outline">
            <Filter className="h-3 w-3" /> Filtre
          </button>
          <button type="button" className="te-btn-sm te-btn-outline">
            <Download className="h-3 w-3" /> Benchmark-rapport
          </button>
          <button
            type="button"
            className="te-btn-sm te-btn-primary"
            style={{ padding: "10px 16px", fontSize: 13 }}
          >
            <Plus className="h-3.5 w-3.5" /> Tildel test
          </button>
        </div>
      </section>

      <section className="te-kpi-row">
        <div className="te-kpi featured">
          <div className="lbl">Test-dekning</div>
          <div className="val">
            68<span className="sm">%</span>
          </div>
          <div className="sub">+4% siste 30 dager</div>
        </div>
        <div className="te-kpi">
          <div className="lbl">Overdue (&gt; 60 dager)</div>
          <div className="val" style={{ color: "var(--danger)" }}>7</div>
          <div className="sub" style={{ color: "var(--danger)" }}>
            spillere mangler 1+ test
          </div>
        </div>
        <div className="te-kpi">
          <div className="lbl">Snart-due (30-60 d)</div>
          <div className="val" style={{ color: "var(--warn)" }}>12</div>
          <div className="sub" style={{ color: "var(--warn)" }}>
            planlegg neste 2 uker
          </div>
        </div>
        <div className="te-kpi">
          <div className="lbl">Sterkeste batteri-snitt</div>
          <div className="val" style={{ fontSize: 22 }}>TEK · 71%</div>
          <div className="sub" style={{ color: "var(--success)" }}>
            <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.5} />
            +3% vs april
          </div>
        </div>
      </section>

      <section className="te-card">
        <div className="te-card-h">
          <div>
            <div className="te-eyebrow" style={{ color: "var(--danger)" }}>
              <AlertTriangle className="inline h-3 w-3" strokeWidth={2} /> SPILLERE SOM
              MANGLER TEST
            </div>
            <h2>Overdue og snart-due</h2>
          </div>
          <div className="right">
            <button type="button" className="te-btn-xs te-btn-outline">
              <Send className="h-3 w-3" /> Send påminnelse alle
            </button>
          </div>
        </div>

        <div>
          {MISSING_TESTS.map((m, i) => (
            <MissingRow key={i} missing={m} />
          ))}
        </div>

        <div className="te-legend">
          <span className="sw">
            <span
              className="box"
              style={{ background: "rgba(163,45,45,0.10)", border: "1px solid rgba(163,45,45,0.30)" }}
            />
            Overdue · &gt; 60 dager
          </span>
          <span className="sw">
            <span
              className="box"
              style={{ background: "rgba(184,133,42,0.15)", border: "1px solid rgba(184,133,42,0.30)" }}
            />
            Snart due · 30–60 dager
          </span>
          <span className="sw">
            <span
              className="box"
              style={{ background: "rgba(44,125,82,0.10)", border: "1px solid rgba(44,125,82,0.30)" }}
            />
            OK · &lt; 30 dager
          </span>
        </div>
      </section>

      <section className="te-card">
        <div className="te-card-h">
          <div>
            <div className="te-eyebrow">TEST-DEKNING · A1-KOHORT (n=12)</div>
            <h2>Hvem har tatt hvilken test?</h2>
          </div>
          <div className="right">
            Klikk en celle for detalj · grønt = OK · oker = snart due · rødt = overdue
          </div>
        </div>

        <div className="te-matrix">
          <div className="cell h player">Spiller</div>
          {MATRIX_HEADERS.map((h) => (
            <div key={h.label} className="cell h">
              <span className={PYR_CLASS[h.pyr]}>{h.label}</span>
            </div>
          ))}
          <div className="cell h tot">DEKNING</div>

          {MATRIX_ROWS.map((row) => (
            <MatrixRow key={row.name} row={row} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MissingRow({ missing: m }: { missing: MissingTest }) {
  const isOverdue = m.daysSince > 60;
  return (
    <div className="te-miss-row">
      <div className="left">
        <div className="av">{initials(m.name)}</div>
        <div>
          <div className="nm">{m.name}</div>
          <div className="meta">
            {m.cohort} · HCP {m.hcp} · Tester sist tatt {m.lastTested}
          </div>
        </div>
      </div>
      <div className="test-lbl">
        <span className={PYR_CLASS[m.testPyr]}>{m.testPyr}</span> {m.testName}
      </div>
      <div className={`since ${isOverdue ? "overdue" : "warn"}`}>
        {m.daysSince} dager
        <span className="sub">{isOverdue ? "OVERDUE" : "SNART DUE"}</span>
      </div>
      <Link
        href="/admin/tester/tildel"
        className={`te-btn-sm ${isOverdue ? "te-btn-primary" : "te-btn-outline"}`}
      >
        Tildel
      </Link>
    </div>
  );
}

function MatrixRow({ row }: { row: MatrixRow }) {
  return (
    <>
      <div className="cell player">
        <div className="av">{initials(row.name)}</div>
        <div>
          <div className="nm">{row.name}</div>
          <div className="tag">
            {row.cohort} · HCP {row.hcp}
          </div>
        </div>
      </div>
      {row.cells.map((c, i) =>
        c.state === "empty" ? (
          <div key={i} className="cell score empty">—</div>
        ) : (
          <div key={i} className={`cell score ${c.state}`}>
            <span className="v">{c.value}</span>
            <span className="age">{c.age}</span>
          </div>
        ),
      )}
      <div
        className={`cell tot ${
          row.total.tone === "warn" ? "warn" : row.total.tone === "danger" ? "danger" : ""
        }`}
      >
        {row.total.done}/{row.total.of}
      </div>
    </>
  );
}
