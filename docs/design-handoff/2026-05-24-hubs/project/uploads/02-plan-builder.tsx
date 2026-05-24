/**
 * Teknisk Utviklingsplan — Plan-builder
 *
 * Klar til å limes inn i Claude.ai → Artifacts → React.
 * Single-file, ingen lokale imports utover react og lucide-react.
 *
 * Inneholder:
 * - 10 P-posisjoner med 2-nivå drag-and-drop (markert visuelt, ikke implementert)
 * - Hver oppgave: tag-rad med pyramide / område (SG-bucket) / kølle / L-fase / CS / M / PR
 * - 3-delt rep-progress (Dry / Lav / Full)
 * - NY: TrackMan-mål per kølle i sidebar
 */

import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  GripVertical,
  Image as ImageIcon,
  Info,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Save,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";

// ─── Demo-data ──────────────────────────────────────────────────────────────

const PYRAMIDE = {
  TEK: { color: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-600" },
  SLAG: { color: "bg-lime-200 text-emerald-900", dot: "bg-lime-400" },
  FYS: { color: "bg-emerald-100 text-emerald-900", dot: "bg-emerald-700" },
  SPILL: { color: "bg-amber-100 text-amber-800", dot: "bg-amber-600" },
  TURN: { color: "bg-stone-200 text-stone-700", dot: "bg-stone-500" },
};

type Task = {
  prio: number;
  navn: string;
  pyramide: keyof typeof PYRAMIDE;
  omraade: string;
  kolle: string;
  lFase: string;
  cs: string;
  m: string;
  pr: string;
  reps: { dry: [number, number]; lav: [number, number]; full: [number, number] };
  sistTrent?: string;
  ny?: boolean;
};

type Pos = {
  prio: number;
  p: string;
  navn: string;
  pyramide: keyof typeof PYRAMIDE | null;
  apen?: boolean;
  hovedfokus?: boolean;
  tasks?: Task[];
  totalReps?: [number, number];
};

const POSISJONER: Pos[] = [
  {
    prio: 1,
    p: "P4.0",
    navn: "Topp-posisjon",
    pyramide: "TEK",
    apen: true,
    hovedfokus: true,
    totalReps: [540, 2200],
    tasks: [
      {
        prio: 1,
        navn: "Venstre håndledd flat",
        pyramide: "TEK",
        omraade: "App 150-200",
        kolle: "7-jern",
        lFase: "L_ARM",
        cs: "CS70",
        m: "M2",
        pr: "PR2",
        reps: { dry: [750, 1000], lav: [260, 500], full: [70, 200] },
        sistTrent: "fre 16. mai",
      },
      {
        prio: 2,
        navn: "Skuldre 90° rotert",
        pyramide: "TEK",
        omraade: "Tee Total",
        kolle: "Alle køller",
        lFase: "L_KROPP",
        cs: "CS50",
        m: "M1",
        pr: "PR1",
        reps: { dry: [270, 600], lav: [60, 300], full: [0, 100] },
        sistTrent: "ons 14. mai",
      },
      {
        prio: 3,
        navn: "Vekt 70/30 høyre",
        pyramide: "TEK",
        omraade: "Tee Total",
        kolle: "Driver",
        lFase: "L_KROPP",
        cs: "CS50",
        m: "M0",
        pr: "PR1",
        reps: { dry: [80, 400], lav: [0, 200], full: [0, 80] },
        sistTrent: "ny denne uka",
        ny: true,
      },
    ],
  },
  { prio: 2, p: "P7.0", navn: "Impact", pyramide: "SLAG", hovedfokus: true, totalReps: [180, 1100] },
  { prio: 3, p: "P2.0", navn: "Kølleskaft parallelt (baksving)", pyramide: "TEK", hovedfokus: true, totalReps: [420, 1600] },
  { prio: 4, p: "P1.0", navn: "Oppstilling", pyramide: "TEK", totalReps: [200, 500] },
  { prio: 5, p: "P10.0", navn: "Finish", pyramide: "TEK", totalReps: [0, 300] },
  { prio: 6, p: "P3.0", navn: "Venstre arm parallell (baksving)", pyramide: null },
  { prio: 7, p: "P5.0", navn: "Venstre arm parallell (nedsving)", pyramide: null },
  { prio: 8, p: "P6.0", navn: "Kølleskaft parallelt (nedsving)", pyramide: null },
  { prio: 9, p: "P8.0", navn: "Kølleskaft parallelt (etter impact)", pyramide: null },
  { prio: 10, p: "P9.0", navn: "Høyre arm parallell", pyramide: null },
];

// ─── TrackMan-mål per kølle ────────────────────────────────────────────────

type ClubTarget = {
  kolle: string;
  status: "oppnaadd" | "paa-vei" | "ikke-begynt";
  primaerMaaling: { navn: string; verdi: string; mal: string; pct: number };
  sekundaerMaalinger: { navn: string; verdi: string; mal: string }[];
};

const TRACKMAN_MAL: ClubTarget[] = [
  {
    kolle: "Driver",
    status: "paa-vei",
    primaerMaaling: { navn: "Ball Speed", verdi: "163.4", mal: "≥165 mph", pct: 76 },
    sekundaerMaalinger: [
      { navn: "Spin Rate", verdi: "2 480", mal: "2 200-2 700 rpm" },
      { navn: "Smash Factor", verdi: "1.46", mal: "≥1.45" },
      { navn: "Launch Angle", verdi: "11.2°", mal: "10-12°" },
    ],
  },
  {
    kolle: "7-jern",
    status: "oppnaadd",
    primaerMaaling: { navn: "Smash Factor", verdi: "1.43", mal: "≥1.42", pct: 100 },
    sekundaerMaalinger: [
      { navn: "Spin Rate", verdi: "7 100", mal: "6 500-7 500 rpm" },
      { navn: "Carry", verdi: "152 m", mal: "145-155 m" },
      { navn: "Disp. (std)", verdi: "6.8 m", mal: "< 8 m" },
    ],
  },
  {
    kolle: "PW",
    status: "ikke-begynt",
    primaerMaaling: { navn: "Spin Rate", verdi: "—", mal: "9 000-10 500", pct: 0 },
    sekundaerMaalinger: [
      { navn: "Carry", verdi: "—", mal: "95-105 m" },
      { navn: "Land Angle", verdi: "—", mal: "48-52°" },
    ],
  },
];

// ─── Komponent ──────────────────────────────────────────────────────────────

export default function PlanBuilder() {
  return (
    <div className="min-h-screen bg-stone-100 px-6 py-8 font-sans text-stone-900">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone-500">
            PlayerHQ <span className="text-stone-900">›</span> Markus R.P.{" "}
            <span className="text-stone-900">›</span> Teknisk plan
          </p>
          <h1 className="font-serif mt-2 text-5xl italic tracking-tight">
            Teknisk utviklingsplan · vår{" "}
            <em className="font-medium not-italic text-emerald-800">2026</em>
          </h1>
          <div className="mt-3 flex flex-wrap gap-5 font-mono text-[11px] uppercase tracking-wider text-stone-500">
            <span>
              <b className="text-stone-900">Spiller</b> Markus R.P.
            </span>
            <span>
              <b className="text-stone-900">Coach</b> Anders K.
            </span>
            <span>
              <b className="text-stone-900">Periode</b> Spesialisering · 15. apr → 30. juni
            </span>
            <span>
              <b className="text-stone-900">Status</b> Aktiv · Begge redigerer
            </span>
          </div>
          <div className="mt-5 flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-900">
              <Save className="h-4 w-4" /> Lagre endringer
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-stone-50">
              <Send className="h-4 w-4" /> Send til Markus for godkjenning
            </button>
            <button className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-200">
              <Eye className="h-4 w-4" /> Forhåndsvis som spiller
            </button>
          </div>
        </header>

        {/* HINT */}
        <div className="mb-6 flex gap-3 rounded-xl border border-emerald-300 bg-lime-100/60 px-4 py-3 text-sm">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-300 font-mono text-xs font-bold">
            i
          </span>
          <p>
            <b className="text-emerald-900">To nivåer av drag-and-drop:</b> Dra hele P-rader (
            <GripVertical className="inline h-3 w-3" /> på venstre) for å endre{" "}
            <b>prioritets-rekkefølge</b>. Inne i hver P kan du dra oppgaver for å sette{" "}
            <b>prio 1, 2, 3</b>. P-er med <span className="font-semibold text-lime-700">lime venstre-stripe</span> er
            hovedfokus i denne perioden.
          </p>
        </div>

        {/* LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* VENSTRE: P-listen */}
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex items-baseline justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="font-serif text-lg font-medium">10 svingposisjoner · prioritert</h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                <GripVertical className="inline h-3 w-3" /> Dra for å endre rekkefølge
              </span>
            </div>

            <div className="flex flex-col gap-2 p-3">
              {POSISJONER.map((pos) => (
                <PosRow key={pos.p} pos={pos} />
              ))}
            </div>
          </div>

          {/* HØYRE: Sidebar */}
          <aside className="flex flex-col gap-4">
            <SidebarCard h="Plan-sammendrag">
              <SideStat lbl="Aktive oppgaver" val="9 stk" />
              <SideStat lbl="Totalt rep-mål" val="8 200" />
              <SideStat lbl="Gjort så langt" val="1 340 (16 %)" />
              <SideStat lbl="Snitt-tempo/uke" val="~280 reps" />
              <SideStat lbl="Estimert ferdig" val="12. juli" />
            </SidebarCard>

            {/* TRACKMAN-MÅL — NY SEKSJON */}
            <SidebarCard
              h="TrackMan-mål per kølle"
              icon={<Activity className="h-3.5 w-3.5" />}
              action="Se alle →"
            >
              {TRACKMAN_MAL.map((t) => (
                <ClubTargetRow key={t.kolle} target={t} />
              ))}
            </SidebarCard>

            <SidebarCard h="Pyramide-fordeling">
              <PyrRow farge="bg-emerald-700" navn="FYS" cnt="0 oppg" />
              <PyrRow farge="bg-emerald-500" navn="TEK" cnt="7 oppg" />
              <PyrRow farge="bg-lime-400" navn="SLAG" cnt="2 oppg" />
              <PyrRow farge="bg-amber-500" navn="SPILL" cnt="0 oppg" />
              <PyrRow farge="bg-stone-500" navn="TURN" cnt="0 oppg" />
            </SidebarCard>

            <SidebarCard h="Coach">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white">
                  AK
                </div>
                <div className="text-sm">
                  <b className="block">Anders Kristiansen</b>
                  <span className="text-xs text-stone-500">Sist redigert · for 2 timer siden</span>
                </div>
              </div>
            </SidebarCard>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-komponenter ───────────────────────────────────────────────────────

function PosRow({ pos }: { pos: Pos }) {
  const apen = pos.apen;
  return (
    <div
      className={[
        "rounded-xl border-2 transition",
        apen ? "border-emerald-800 shadow-sm shadow-emerald-100" : "border-stone-200",
        pos.hovedfokus ? "border-l-4 border-l-lime-400" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical className="h-4 w-4 cursor-grab text-stone-400" />
        <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-900">
          P{pos.prio}
        </span>
        <span className="rounded bg-emerald-100 px-2 py-1 font-mono text-xs font-semibold text-emerald-800">
          {pos.p}
        </span>
        <span className="font-serif flex-1 text-base font-medium">{pos.navn}</span>
        {pos.pyramide && (
          <span
            className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${PYRAMIDE[pos.pyramide].color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${PYRAMIDE[pos.pyramide].dot}`} />
            {pos.pyramide}
          </span>
        )}
        {!pos.pyramide && <span className="text-xs text-stone-400">Ingen oppg</span>}
        {pos.totalReps ? (
          <>
            <span className="font-mono text-[11px] text-stone-500">
              {pos.tasks?.length ?? 0} oppg · {pos.totalReps[0]} / {pos.totalReps[1]} reps
            </span>
            <div className="h-1 w-16 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full bg-emerald-700"
                style={{ width: `${(pos.totalReps[0] / pos.totalReps[1]) * 100}%` }}
              />
            </div>
          </>
        ) : null}
        {apen ? <ChevronDown className="h-4 w-4 text-stone-400" /> : <ChevronRight className="h-4 w-4 text-stone-400" />}
      </div>

      {apen && pos.tasks ? (
        <div className="flex flex-col gap-2 border-l-2 border-emerald-100 px-4 pb-4 pl-14">
          {pos.tasks.map((t) => (
            <TaskRow key={t.prio} task={t} />
          ))}
          <button className="rounded-lg border-2 border-dashed border-stone-300 px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-wider text-stone-500 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
            + Legg til oppgave på {pos.p}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-stone-100 bg-stone-50 p-3">
      <GripVertical className="mt-1 h-4 w-4 cursor-grab text-stone-400" />
      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded border border-emerald-200 bg-white font-mono text-xs font-bold text-emerald-800">
        {task.prio}
      </span>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
        <Play className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {task.navn}{" "}
          {task.ny && (
            <span className="ml-2 rounded bg-lime-300 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-900">
              Ny
            </span>
          )}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <Tag color={PYRAMIDE[task.pyramide].color} dot={PYRAMIDE[task.pyramide].dot}>
            {task.pyramide}
          </Tag>
          <Tag color="bg-stone-100 text-stone-700 border border-stone-200">{task.omraade}</Tag>
          <Tag color="bg-stone-200 text-stone-800">{task.kolle}</Tag>
          <Tag color="bg-purple-100 text-purple-800">{task.lFase}</Tag>
          <Tag color="bg-emerald-200 text-emerald-900">{task.cs}</Tag>
          <Tag color="bg-sky-100 text-sky-800">{task.m}</Tag>
          <Tag color="bg-red-100 text-red-700">{task.pr}</Tag>
        </div>
        <p className="mt-1.5 font-mono text-[10px] text-stone-500">
          Mål: {task.reps.dry[1]} dry · {task.reps.lav[1]} lav · {task.reps.full[1]} full · Sist trent {task.sistTrent}
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <RepBar lbl="Dry" reps={task.reps.dry} farge="bg-stone-500" />
          <RepBar lbl="Lav (CS50-70)" reps={task.reps.lav} farge="bg-emerald-500" />
          <RepBar lbl="Full (CS80-100)" reps={task.reps.full} farge="bg-emerald-800" />
        </div>
      </div>
      <div className="flex gap-1">
        <IconBtn icon={<Pencil />} />
        <IconBtn icon={<Video />} />
        <IconBtn icon={<MoreHorizontal />} />
      </div>
    </div>
  );
}

function Tag({
  children,
  color,
  dot,
}: {
  children: React.ReactNode;
  color: string;
  dot?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${color}`}
    >
      {dot && <span className={`h-1 w-1 rounded-full ${dot}`} />}
      {children}
    </span>
  );
}

function RepBar({
  lbl,
  reps,
  farge,
}: {
  lbl: string;
  reps: [number, number];
  farge: string;
}) {
  const pct = (reps[0] / reps[1]) * 100 || 0;
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-wider text-stone-500">{lbl}</p>
      <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full ${farge}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-0.5 font-mono text-[10px] font-medium">
        {reps[0]} / {reps[1]}
      </p>
    </div>
  );
}

function IconBtn({ icon }: { icon: React.ReactElement }) {
  return (
    <button className="flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 hover:border-emerald-700 hover:text-emerald-800">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(icon as React.ReactElement<any>) &&
        // @ts-expect-error — clone with className
        React.cloneElement(icon, { className: "h-3.5 w-3.5" })}
    </button>
  );
}

function SidebarCard({
  h,
  icon,
  action,
  children,
}: {
  h: string;
  icon?: React.ReactNode;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
          {icon}
          {h}
        </h3>
        {action && <span className="font-mono text-[10px] uppercase text-emerald-800">{action}</span>}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SideStat({ lbl, val }: { lbl: string; val: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-dashed border-stone-100 py-1.5 text-sm last:border-0">
      <span className="text-stone-500">{lbl}</span>
      <span className="font-mono font-medium">{val}</span>
    </div>
  );
}

function PyrRow({ farge, navn, cnt }: { farge: string; navn: string; cnt: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`h-2 w-2 shrink-0 rounded-full ${farge}`} />
      <span className="flex-1 font-mono text-[10px] uppercase tracking-wider text-stone-500">{navn}</span>
      <span className="font-mono font-medium">{cnt}</span>
    </div>
  );
}

function ClubTargetRow({ target }: { target: ClubTarget }) {
  const statusFarger = {
    oppnaadd: "bg-emerald-100 text-emerald-800",
    "paa-vei": "bg-amber-100 text-amber-800",
    "ikke-begynt": "bg-stone-100 text-stone-500",
  };
  const statusIkon = {
    oppnaadd: <Check className="h-3 w-3" />,
    "paa-vei": <TrendingUp className="h-3 w-3" />,
    "ikke-begynt": <Clock className="h-3 w-3" />,
  };
  const statusTekst = {
    oppnaadd: "Oppnådd",
    "paa-vei": "På vei",
    "ikke-begynt": "Ikke begynt",
  };

  return (
    <div className="rounded-lg border border-stone-100 bg-stone-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-semibold text-sm">{target.kolle}</p>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${statusFarger[target.status]}`}
        >
          {statusIkon[target.status]}
          {statusTekst[target.status]}
        </span>
      </div>

      {/* Primær måling */}
      <div className="rounded-md bg-white p-2">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-stone-500">{target.primaerMaaling.navn}</span>
          <span className="font-mono font-medium">{target.primaerMaaling.mal}</span>
        </div>
        <div className="mt-1 flex items-end justify-between">
          <span className="font-mono text-lg font-bold text-emerald-800">{target.primaerMaaling.verdi}</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full bg-emerald-700" style={{ width: `${target.primaerMaaling.pct}%` }} />
        </div>
      </div>

      {/* Sekundære målinger */}
      <div className="mt-2 space-y-1">
        {target.sekundaerMaalinger.map((m) => (
          <div key={m.navn} className="flex items-baseline justify-between text-[11px]">
            <span className="text-stone-500">{m.navn}</span>
            <span>
              <span className="font-mono font-medium">{m.verdi}</span>
              <span className="ml-1.5 font-mono text-stone-400">/ {m.mal}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
