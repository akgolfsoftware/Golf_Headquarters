/**
 * /portal/tren/tester — pixel-perfekt port av
 * docs/design-handoff/test-modul/tester-dashboard.html
 *
 * Bruker delt styles.css fra planlegge-v2 (samme palette + tester-primitives).
 */

import "../planlegge-v2/styles.css";
import Link from "next/link";
import { PlanleggeSprite } from "../planlegge-v2/icons";

type Pyr = "fys" | "tek" | "slag" | "spill" | "turn";

type TestCard = {
  pyr: Pyr;
  status: "done" | "ongoing" | "todo" | "pr";
  statusLabel?: string;
  title: string;
  desc: string;
  value?: string;
  unit?: string;
  trend?: { dir: "up" | "dn" | "flat"; label: string };
  last?: { date: string; attempts: number };
  href?: string;
  highlight?: boolean;
};

const FYS: TestCard[] = [
  {
    pyr: "fys",
    status: "done",
    title: "Trapbar Deadlift 1RM",
    desc: "3 forsøk på maks tung trapbar deadlift. Beste registrert i kg.",
    value: "142",
    unit: " kg",
    trend: { dir: "up", label: "+8" },
    last: { date: "05. mai", attempts: 4 },
  },
  {
    pyr: "fys",
    status: "done",
    title: "CMJ — countermovement jump",
    desc: "3 forsøk på vertikalt hopp uten arm-svikt. Beste i cm.",
    value: "52",
    unit: " cm",
    trend: { dir: "up", label: "+3" },
    last: { date: "02. mai", attempts: 6 },
  },
  {
    pyr: "fys",
    status: "todo",
    title: "VO₂max — Cooper 12 min",
    desc: "Løp så langt som mulig på 12 minutter. Beregnet ml/kg/min.",
  },
];

const TEK: TestCard[] = [
  {
    pyr: "tek",
    status: "done",
    title: "Clubhead Speed — driver",
    desc: "5 fullsving driver på TrackMan. Snitt clubhead speed.",
    value: "112",
    unit: " mph",
    trend: { dir: "up", label: "+2,1" },
    last: { date: "14. mai", attempts: 12 },
  },
  {
    pyr: "tek",
    status: "done",
    title: "7-jern Smash Factor",
    desc: "10 fullsving 7-jern. Snitt av middels-fart 3.",
    value: "1,38",
    trend: { dir: "flat", label: "±0,00" },
    last: { date: "14. mai", attempts: 7 },
  },
  {
    pyr: "tek",
    status: "todo",
    title: "Wedge-konsistens 50m",
    desc: "10 wedges til 50m flagg, måler spredning (laser, m).",
  },
];

const SLAG: TestCard[] = [
  {
    pyr: "slag",
    status: "pr",
    statusLabel: "PR",
    title: "Driver Basic",
    desc: "5 driver-slag. Måler carry-lengde, sideavvik og beregner PEI.",
    value: "67,4",
    trend: { dir: "up", label: "+3,2" },
    last: { date: "12. mai", attempts: 8 },
    highlight: true,
  },
  {
    pyr: "slag",
    status: "ongoing",
    statusLabel: "Pågående",
    title: "Putt 1–3 m",
    desc: "30 putt fordelt 1m, 2m og 3m. Måler % sunket.",
    value: "73",
    unit: " %",
    trend: { dir: "up", label: "+4" },
    last: { date: "i dag", attempts: 5 },
  },
  {
    pyr: "slag",
    status: "done",
    title: "Chip landingsone 15m",
    desc: "10 chip fra 15m til 3m landingsone. % i sone.",
    value: "62",
    unit: " %",
    trend: { dir: "dn", label: "-3" },
    last: { date: "10. mai", attempts: 4 },
  },
];

const SPILL: TestCard[] = [
  {
    pyr: "spill",
    status: "done",
    title: "D-Plane forståelse — quiz",
    desc: "12-spørsmål quiz · TrackMan-data tolkning",
    value: "82",
    unit: " %",
    trend: { dir: "up", label: "+7" },
    last: { date: "06. mai", attempts: 2 },
  },
  {
    pyr: "spill",
    status: "todo",
    title: "Course management — 10 scenarier",
    desc: "Velg riktig kølle og linje for 10 banescenarier.",
  },
];

const TURN: TestCard[] = [
  {
    pyr: "turn",
    status: "todo",
    title: "MTQ stress-skåre",
    desc: "Mental Toughness Questionnaire — score 1–10.",
  },
  {
    pyr: "turn",
    status: "todo",
    title: "Pre-shot rutine",
    desc: "Konsistens i rutine over 18 slag. Filmes og analyseres.",
  },
];

function PyrCard({ t, fullWidth }: { t: TestCard; fullWidth?: boolean }) {
  const isTodo = t.status === "todo";
  return (
    <div
      className={`tcard${isTodo ? " todo" : ""}`}
      style={t.highlight ? { borderColor: "var(--lime-deep)", background: "linear-gradient(180deg,#FCFEEC 0%,#FBFBF8 60%)" } : undefined}
    >
      <div className="row1">
        <span className={`pyr pyr-${t.pyr}`}>{t.pyr.toUpperCase()}</span>
        {t.status === "todo" ? (
          <span className="pill pill-todo">Ikke tatt</span>
        ) : t.status === "pr" ? (
          <span className="pill pill-pr">PR</span>
        ) : (
          <span className="pill pill-done">
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-check" /></svg>
            {" "}{t.statusLabel ?? "Gjort"}
          </span>
        )}
      </div>
      <div className="ttl">{t.title}</div>
      <div className="desc">{t.desc}</div>
      {isTodo ? (
        <>
          <div className="placeholder">— Ingen målinger ennå —</div>
          <button className="start">
            <svg fill="none" stroke="currentColor"><use href="#i-play" /></svg>
            Start test
          </button>
        </>
      ) : (
        <>
          <div className="num-row">
            <div className="v">
              {t.value}
              {t.unit && <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>{t.unit}</span>}
            </div>
            {t.trend && (
              <span className={`trend ${t.trend.dir}`}>
                {t.trend.dir !== "flat" && (
                  <svg fill="none" stroke="currentColor">
                    <use href={`#i-trend-${t.trend.dir}`} />
                  </svg>
                )}
                {t.trend.label}
              </span>
            )}
          </div>
          {t.last && (
            <div className="last">
              Sist: <strong>{t.last.date}</strong> · {t.last.attempts} forsøk
            </div>
          )}
          <div className="foot" style={t.status === "ongoing" ? { color: "var(--warn)" } : undefined}>
            {t.status === "ongoing" ? "Fortsett test" : "Se historikk"}{" "}
            <svg fill="none" stroke="currentColor"><use href="#i-arrow-right" /></svg>
          </div>
        </>
      )}
      {fullWidth ? null : null}
    </div>
  );
}

function DiscSection({
  pyr,
  title,
  sub,
  done,
  total,
  cards,
  oneCol,
  progressColor,
}: {
  pyr: Pyr;
  title: string;
  sub: string;
  done: number;
  total: number;
  cards: TestCard[];
  oneCol?: boolean;
  progressColor?: string;
}) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <section className="disc">
      <div className="disc-h">
        <span className={`pyr pyr-${pyr} pyr-lg`}>{pyr.toUpperCase()}</span>
        <div>
          <div className="ttl">{title}</div>
          <div className="sub">{sub}</div>
        </div>
        <div className="right">
          {oneCol ? (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)" }}>
              <strong style={{ color: "var(--ink)", fontWeight: 700 }}>{done}</strong> av {total}
            </div>
          ) : (
            <div className="progress">
              <div className="progress-bar">
                <div style={{ width: `${pct}%`, ...(progressColor ? { background: progressColor } : {}) }} />
              </div>
              <span>
                <strong style={{ color: "var(--ink)", fontWeight: 700 }}>{done}</strong> av {total}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="tgrid" style={oneCol ? { gridTemplateColumns: "1fr" } : undefined}>
        {cards.map((c, i) => (
          <PyrCard key={i} t={c} />
        ))}
      </div>
    </section>
  );
}

export function TesterDashboardScreen({
  playerName,
  playerInitials,
  hcp,
  isPro,
}: {
  playerName: string;
  playerInitials: string;
  hcp: number | null;
  isPro: boolean;
}) {
  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      <main className="main">
        <header className="topbar">
          <Link className="back" href="/portal">
            <svg fill="none" stroke="currentColor"><use href="#i-arrow-left" /></svg>
            PlayerHQ
          </Link>
          <div className="player">
            <div className="avatar">{playerInitials}</div>
            <div>
              <div className="nm">{playerName}</div>
              <div className="sub">
                A1 · HCP {hcp != null ? hcp.toFixed(1).replace(".", ",") : "—"}
                {isPro && (
                  <span className="pill pill-pro" style={{ fontSize: "8.5px", padding: "1px 7px", marginLeft: "4px" }}>
                    PRO
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="page">
          {/* HERO */}
          <section className="hero">
            <div>
              <div className="eyebrow">PlayerHQ · Trening · Tester</div>
              <h1>
                Tester <em>og</em> benchmarks
              </h1>
              <div className="sub">
                <strong style={{ color: "var(--ink)", fontWeight: 700 }}>12</strong> av{" "}
                <strong style={{ color: "var(--ink)", fontWeight: 700 }}>36</strong> tester gjennomført
                <span className="dot" />
                <strong style={{ color: "var(--ink)", fontWeight: 700 }}>87</strong> resultater logget
                <span className="dot" />
                Sist: <strong style={{ color: "var(--ink)", fontWeight: 700 }}>18. mai 2026</strong>
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-outline btn-sm">Last ned PDF</button>
              <button className="btn btn-primary">
                <svg fill="none" stroke="currentColor"><use href="#i-plus" /></svg>
                Ta ny test
                <svg fill="none" stroke="currentColor"><use href="#i-arrow-right" /></svg>
              </button>
            </div>
          </section>

          {/* KPI ROW */}
          <section className="kpi-row">
            <div className="kpi featured">
              <div className="lbl">Gjennomført</div>
              <div className="val">
                12<span className="sm">/36</span>
              </div>
              <div className="sub">33% av batteriet</div>
            </div>
            <div className="kpi">
              <div className="lbl">Totale forsøk</div>
              <div className="val">87</div>
              <div className="sub">+9 siste måned</div>
            </div>
            <div className="kpi">
              <div className="lbl">Beste kategori</div>
              <div className="val" style={{ fontSize: "22px" }}>TEK · Teknisk</div>
              <div className="sub">
                <span className="dot" style={{ background: "var(--pyr-tek)" }} />
                +12% mot stall
              </div>
            </div>
            <div className="kpi">
              <div className="lbl">Snitt-score</div>
              <div className="val">67,3</div>
              <div className="sub" style={{ color: "var(--success)" }}>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-trend-up" /></svg>{" "}
                +3,2 mnd
              </div>
            </div>
          </section>

          {/* ACTIVE TEST BANNER */}
          <section className="active-banner">
            <div className="ic">
              <svg fill="none" stroke="currentColor" strokeWidth="2"><use href="#i-activity" /></svg>
            </div>
            <div className="body">
              <div className="ttl">
                Du har en pågående test: <strong>Putt 1–3m</strong>
              </div>
              <div className="meta">Steg 3 av 5 · pauset for 12 min siden · 47 av 90 putt registrert</div>
            </div>
            <button className="btn btn-primary btn-sm">
              Fortsett
              <svg fill="none" stroke="currentColor"><use href="#i-arrow-right" /></svg>
            </button>
          </section>

          {/* FYS */}
          <DiscSection
            pyr="fys"
            title="Fysisk"
            sub="Styrke · utholdenhet · spenst"
            done={5}
            total={8}
            cards={FYS}
          />

          {/* TEK */}
          <DiscSection
            pyr="tek"
            title="Teknisk"
            sub="Sving-mekanikk · clubhead speed · konsistens"
            done={3}
            total={6}
            cards={TEK}
            progressColor="var(--pyr-tek)"
          />

          {/* SLAG */}
          <DiscSection
            pyr="slag"
            title="Slagteknikk"
            sub="Driver · jern · putting · innspill"
            done={3}
            total={9}
            cards={SLAG}
            progressColor="var(--lime-deep)"
          />

          {/* SPILL + TURN side-by-side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <DiscSection
              pyr="spill"
              title="Spillforståelse"
              sub="Course management · TrackMan"
              done={1}
              total={5}
              cards={SPILL}
              oneCol
            />
            <DiscSection
              pyr="turn"
              title="Turneringsmodus"
              sub="Mental tøffhet · pre-shot · fokus"
              done={0}
              total={4}
              cards={TURN}
              oneCol
            />
          </div>
        </div>
      </main>
    </div>
  );
}
