/**
 * PlayerHQ · Runde detalj · Shot-by-shot
 *
 * Migrert fra public/design/batch3/runde-detalj-shot-by-shot.html.
 * Detaljert visning av en enkelt runde — KPI-strip, hull-tabell, trend-charts og notater.
 */
import Link from "next/link";
import { BarChart3, Check, ChevronRight, Download, MapPin, Minus, MoreVertical, Pencil, Sun, Wind, X } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ShareRoundButton } from "./share-button";

const FRONT_PARS = [4, 5, 3, 4, 4, 4, 5, 3, 4];
const BACK_PARS = [4, 4, 3, 5, 4, 4, 5, 3, 4];
const FRONT_SCORES = [4, 4, 3, 4, 3, 4, 4, 3, 4];
const BACK_SCORES = [4, 4, 3, 5, 7, 4, 5, 3, 2];
const FRONT_FIR = ["y", "y", "—", "y", "n", "y", "y", "—", "y"];
const BACK_FIR = ["y", "n", "—", "y", "n", "y", "n", "—", "y"];
const FRONT_GIR = ["y", "y", "y", "y", "y", "n", "y", "y", "y"];
const BACK_GIR = ["y", "y", "y", "n", "n", "y", "y", "n", "y"];
const FRONT_PUTTS = [2, 1, 2, 2, 1, 2, 1, 2, 2];
const BACK_PUTTS = [2, 1, 2, 2, 3, 2, 1, 1, 1];

export default async function RundeShotByShotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;
  const round = await prisma.round.findUnique({
    where: { id },
    include: { course: true },
  });
  if (!round) notFound();

  // Bygg metadata for Del-modal
  const navnDeler = user.name.trim().split(/\s+/);
  const initialer =
    navnDeler.length === 1
      ? navnDeler[0].slice(0, 2).toUpperCase()
      : (navnDeler[0][0] + navnDeler[navnDeler.length - 1][0]).toUpperCase();
  const hcpLabel =
    user.hcp == null
      ? "—"
      : user.hcp <= 0
        ? `+${Math.abs(user.hcp).toFixed(1).replace(".", ",")}`
        : user.hcp.toFixed(1).replace(".", ",");
  const datoLabel = round.playedAt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
  const vsPar = round.score - round.course.par;

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-8 md:pb-16">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            PlayerHQ · Runde · R_{round.id.slice(0, 4).toUpperCase()}
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            {round.course.name.split(" ")[0]}{" "}
            <em className="italic text-primary">
              {round.course.name.split(" ").slice(1).join(" ") || "GK"}
            </em>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>
              {round.playedAt.toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              · <strong className="text-foreground">kl 09:24</strong>
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span>
              Tee <strong className="text-foreground">Hvit</strong>
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span>
              Slope <strong className="text-foreground">134</strong> · CR{" "}
              <strong className="text-foreground">71,5</strong>
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span>Trening</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <IconBtn label="Rediger" Icon={Pencil} />
          <IconBtn label="Eksporter" Icon={Download} />
          <ShareRoundButton
            roundId={round.id}
            spillerNavn={user.name}
            hcpLabel={hcpLabel}
            initialer={initialer}
            bane={round.course.name}
            dato={datoLabel}
            score={round.score}
            vsPar={vsPar}
          />
          <IconBtn label="Mer" Icon={MoreVertical} />
        </div>
      </header>

      {/* KPI strip */}
      <section
        aria-label="Hovedstatistikk"
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <KpiCard featured label="Score" value={String(round.score)} delta={`+${round.score - round.course.par} vs par`} />
        <KpiCard label="Fairways" value="78%" delta="11 av 14" />
        <KpiCard label="Greens" value="72%" delta="13 av 18" />
        <KpiCard label="Putts" value="30" delta="1,67 snitt" />
      </section>

      {/* Bane meta */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin size={24} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="font-display text-lg font-semibold">
            {round.course.name}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Par <strong className="text-foreground">{round.course.par}</strong> ·
            Slope <strong className="text-foreground">134</strong> · CR{" "}
            <strong className="text-foreground">71,5</strong> · Lengde{" "}
            <strong className="text-foreground">6 184 m</strong> · Tee Hvit
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex gap-2">
            <WeatherPill Icon={Sun} label="Sol" />
            <WeatherPill Icon={Wind} label="Vind 4 m/s" />
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-secondary px-4 py-1 text-xs font-medium">
              Tim
            </span>
            <span className="rounded-full bg-secondary px-4 py-1 text-xs font-medium">
              Espen
            </span>
          </div>
        </div>
      </section>

      {/* Hull-tabell */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Hull for hull
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Birdies <strong className="text-primary">3</strong> · pars 13 ·
            bogeys 1 · doble+ 1
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="min-w-full font-mono text-xs">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-2 text-left font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Hull
                </th>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((h) => (
                  <th key={h} className="px-2 py-2 text-center font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
                <th className="px-4 py-2 text-center font-semibold text-muted-foreground">
                  Ut
                </th>
              </tr>
            </thead>
            <tbody>
              <RowBasic label="Par" values={FRONT_PARS} sum={36} />
              <RowScore label="Score" pars={FRONT_PARS} scores={FRONT_SCORES} sum={33} />
              <RowYN label="FIR" values={FRONT_FIR} sumLabel="6/7" />
              <RowYN label="GIR" values={FRONT_GIR} sumLabel="8/9" />
              <RowBasic label="Putts" values={FRONT_PUTTS} sum={15} />
              <tr className="bg-muted/30">
                <td colSpan={11} className="px-4 py-2 text-center font-semibold">
                  Front 9 — Score <strong>33</strong> · Par 36 ·{" "}
                  <strong className="text-primary">−3</strong>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-left font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Hull
                </td>
                {[10, 11, 12, 13, 14, 15, 16, 17, 18].map((h) => (
                  <td key={h} className="px-2 py-2 text-center font-semibold text-muted-foreground">
                    {h}
                  </td>
                ))}
                <td className="px-4 py-2 text-center font-semibold text-muted-foreground">
                  Inn
                </td>
              </tr>
              <RowBasic label="Par" values={BACK_PARS} sum={36} />
              <RowScore label="Score" pars={BACK_PARS} scores={BACK_SCORES} sum={40} />
              <RowYN label="FIR" values={BACK_FIR} sumLabel="5/7" />
              <RowYN label="GIR" values={BACK_GIR} sumLabel="6/9" />
              <RowBasic label="Putts" values={BACK_PUTTS} sum={15} />
              <tr className="bg-muted/30">
                <td colSpan={11} className="px-4 py-2 text-center font-semibold">
                  Total — Score <strong>{round.score}</strong> · Par{" "}
                  {round.course.par} ·{" "}
                  <strong className="text-primary">
                    +{round.score - round.course.par}
                  </strong>{" "}
                  · Front 33 · Back 40
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Charts */}
      <section>
        <div className="mb-2">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Trend gjennom runden
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Inline SVG · ingen biblioteker
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title="Score per hull" sub="vs par">
            <svg
              viewBox="0 0 360 120"
              preserveAspectRatio="none"
              className="h-32 w-full"
            >
              <line
                x1="0"
                y1="60"
                x2="360"
                y2="60"
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <path
                d="M0,60 L20,60 L40,40 L60,60 L80,60 L100,40 L120,60 L140,40 L160,60 L180,60 L200,60 L220,60 L240,60 L260,60 L280,100 L300,60 L320,60 L340,60 L360,20 L360,120 L0,120 Z"
                fill="rgba(0,88,64,0.06)"
              />
              <polyline
                points="0,60 20,60 40,40 60,60 80,60 100,40 120,60 140,40 160,60 180,60 200,60 220,60 240,60 260,60 280,100 300,60 320,60 340,60 360,20"
                fill="none"
                stroke="#005840"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </ChartCard>
          <ChartCard title="Akkumulert vs par" sub="+1 totalt">
            <svg
              viewBox="0 0 360 120"
              preserveAspectRatio="none"
              className="h-32 w-full"
            >
              <line
                x1="0"
                y1="60"
                x2="360"
                y2="60"
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <path
                d="M0,60 L20,60 L40,50 L60,50 L80,50 L100,40 L120,40 L140,30 L160,30 L180,30 L200,30 L220,30 L240,30 L260,30 L280,60 L300,60 L320,60 L340,60 L360,70 L360,120 L0,120 Z"
                fill="rgba(209,248,67,0.30)"
              />
              <polyline
                points="0,60 20,60 40,50 60,50 80,50 100,40 120,40 140,30 160,30 180,30 200,30 220,30 240,30 260,30 280,60 300,60 320,60 340,60 360,70"
                fill="none"
                stroke="#005840"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </ChartCard>
          <ChartCard title="Putts per hull" sub="snitt 1,67">
            <svg
              viewBox="0 0 360 120"
              preserveAspectRatio="none"
              className="h-32 w-full"
            >
              <g fill="#005840">
                {[2, 1, 2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 2, 3, 2, 1, 1, 1].map(
                  (v, i) => {
                    const x = 2 + i * 20;
                    const y = v === 3 ? 0 : v === 2 ? 40 : 80;
                    const h = 120 - y;
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={y}
                        width="16"
                        height={h}
                        rx="2"
                        fill={v === 3 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                      />
                    );
                  },
                )}
              </g>
            </svg>
          </ChartCard>
        </div>
      </section>

      {/* Notes */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <NoteCard
          initials="MR"
          name="Markus R.P."
          role="Eget notat · 18.05"
          body="God runde, kun ett trippel-bogey på 14. Driver fungerte fra start til slutt — særlig de myke pull-fadene jeg jobbet med på range i forrige uke kom igjen."
        />
        <NoteCard
          initials="AK"
          name="Anders Kristiansen"
          role="Coach-kommentar · 19.05"
          coach
          body="Sterk FIR — bygger videre på driver-jobben fra forrige uke. Hull 14: ikke straff deg selv, putts-snittet er fortsatt under 1,7. Vi tar greens-i-regulering på neste økt."
        />
      </section>

      {/* Compare link */}
      <Link
        href={`/portal/mal/runder?bane=${round.courseId}`}
        className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted/30"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
          <BarChart3 size={18} strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <div className="font-display text-sm font-semibold">
            Sammenlign med tidligere runder på {round.course.name}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Du har spilt <strong className="text-foreground">4 runder</strong> på
            denne banen · snitt 75,3
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={2} className="text-muted-foreground" />
      </Link>
    </div>
  );
}

/* ---------- helpers ---------- */
function IconBtn({
  Icon,
  label,
  accent,
}: {
  Icon: typeof Pencil;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-border ${
        accent ? "bg-accent text-accent-foreground" : "bg-card text-foreground"
      } hover:bg-muted/40`}
    >
      <Icon size={15} strokeWidth={1.75} />
    </button>
  );
}

function KpiCard({
  label,
  value,
  delta,
  featured,
}: {
  label: string;
  value: string;
  delta: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        featured
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card"
      }`}
    >
      <div
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${
          featured ? "text-primary-foreground/70" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      <div className="mt-2 font-mono text-3xl font-semibold tabular-nums">
        {value}
      </div>
      <div
        className={`mt-1 font-mono text-[11px] ${
          featured ? "text-primary-foreground/80" : "text-muted-foreground"
        }`}
      >
        {delta}
      </div>
    </div>
  );
}

function WeatherPill({
  Icon,
  label,
}: {
  Icon: typeof Sun;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1 text-xs text-muted-foreground">
      <Icon size={11} strokeWidth={1.75} />
      {label}
    </span>
  );
}

function RowBasic({
  label,
  values,
  sum,
}: {
  label: string;
  values: number[];
  sum: number;
}) {
  return (
    <tr>
      <td className="px-4 py-2 text-left font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="px-2 py-2 text-center tabular-nums">
          {v}
        </td>
      ))}
      <td className="px-4 py-2 text-center font-bold tabular-nums">{sum}</td>
    </tr>
  );
}

function RowScore({
  label,
  pars,
  scores,
  sum,
}: {
  label: string;
  pars: number[];
  scores: number[];
  sum: number;
}) {
  return (
    <tr>
      <td className="px-4 py-2 text-left font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </td>
      {scores.map((s, i) => {
        const diff = s - pars[i];
        const cls =
          diff < 0
            ? "bg-primary/10 text-primary"
            : diff === 0
              ? "text-foreground"
              : diff === 1
                ? "bg-accent/30 text-accent-foreground"
                : "bg-destructive/15 text-destructive";
        return (
          <td key={i} className="px-1 py-1 text-center">
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-sm font-semibold tabular-nums ${cls}`}
            >
              {s}
            </span>
          </td>
        );
      })}
      <td className="px-4 py-2 text-center font-bold tabular-nums">{sum}</td>
    </tr>
  );
}

function RowYN({
  label,
  values,
  sumLabel,
}: {
  label: string;
  values: string[];
  sumLabel: string;
}) {
  return (
    <tr>
      <td className="px-4 py-2 text-left font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="px-2 py-2 text-center">
          {v === "y" && <Check className="mx-auto h-4 w-4 text-primary" strokeWidth={2.5} aria-hidden />}
          {v === "n" && <X className="mx-auto h-4 w-4 text-destructive" strokeWidth={2.5} aria-hidden />}
          {v === "—" && <Minus className="mx-auto h-4 w-4 text-muted-foreground" strokeWidth={2} aria-hidden />}
        </td>
      ))}
      <td className="px-4 py-2 text-center font-bold tabular-nums">{sumLabel}</td>
    </tr>
  );
}

function ChartCard({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-display text-sm font-semibold">{title}</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {sub}
        </span>
      </div>
      {children}
    </div>
  );
}

function NoteCard({
  initials,
  name,
  role,
  body,
  coach,
}: {
  initials: string;
  name: string;
  role: string;
  body: string;
  coach?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        coach ? "border-primary/30 bg-primary/[0.04]" : "border-border bg-card"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs font-bold ${
            coach
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground"
          }`}
        >
          {initials}
        </div>
        <div>
          <div className="font-display text-sm font-semibold">{name}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            {role}
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{body}</p>
    </div>
  );
}
