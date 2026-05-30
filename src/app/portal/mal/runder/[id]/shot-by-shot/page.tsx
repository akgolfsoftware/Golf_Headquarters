/**
 * PlayerHQ · Runde detalj · Shot-by-shot
 *
 * Ekte data fra Round/Shot — KPI, hull-for-hull-tabell, trend-charts, notat.
 * Per-hull aggregeres fra shots (par, score, FIR, GIR, putter).
 */
import Link from "next/link";
import { BarChart3, Check, ChevronRight, Download, MapPin, Minus, MoreVertical, Pencil, X } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ShareRoundButton } from "./share-button";

type YN = "y" | "n" | "—";
type HoleRow = { par: number | null; score: number | null; fir: YN; gir: YN; putts: number | null };

export default async function RundeShotByShotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;
  const round = await prisma.round.findUnique({
    where: { id },
    include: {
      course: true,
      shots: { orderBy: [{ holeNumber: "asc" }, { shotNumber: "asc" }] },
    },
  });
  if (!round) notFound();
  if (round.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") notFound();

  // Per-hull aggregering
  const byHole = new Map<number, typeof round.shots>();
  for (const s of round.shots) {
    const a = byHole.get(s.holeNumber) ?? [];
    a.push(s);
    byHole.set(s.holeNumber, a);
  }

  function holeRow(h: number): HoleRow {
    const slag = byHole.get(h);
    if (!slag || slag.length === 0) return { par: null, score: null, fir: "—", gir: "—", putts: null };
    const par = slag[0].holePar;
    const score = slag.length;
    const putts = slag.filter((s) => s.shotType === "PUTT").length;
    let fir: YN = "—";
    if (par >= 4) {
      const andre = slag.find((s) => s.shotNumber === 2);
      fir = andre ? (andre.lie === "FAIRWAY" ? "y" : "n") : "n";
    }
    const forstePutt = slag.find((s) => s.shotType === "PUTT");
    const slagTilGreen = forstePutt ? forstePutt.shotNumber - 1 : score;
    const gir: YN = slagTilGreen <= par - 2 ? "y" : "n";
    return { par, score, fir, gir, putts };
  }

  const fronts = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(holeRow);
  const backs = [10, 11, 12, 13, 14, 15, 16, 17, 18].map(holeRow);
  const allRows = [...fronts, ...backs];
  const played = allRows.filter((r) => r.score != null);

  const sum = (a: (number | null)[]) => a.reduce<number>((s, v) => s + (v ?? 0), 0);
  const firLabel = (rows: HoleRow[]) => {
    const mulig = rows.filter((r) => r.fir !== "—").length;
    const hit = rows.filter((r) => r.fir === "y").length;
    return mulig > 0 ? `${hit}/${mulig}` : "—";
  };
  const girLabel = (rows: HoleRow[]) => {
    const mulig = rows.filter((r) => r.gir !== "—").length;
    const hit = rows.filter((r) => r.gir === "y").length;
    return mulig > 0 ? `${hit}/${mulig}` : "—";
  };

  const frontScoreSum = sum(fronts.map((r) => r.score));
  const frontParSum = sum(fronts.map((r) => r.par));
  const backScoreSum = sum(backs.map((r) => r.score));
  const backParSum = sum(backs.map((r) => r.par));

  // KPI
  const firMulig = allRows.filter((r) => r.fir !== "—").length;
  const firHit = allRows.filter((r) => r.fir === "y").length;
  const girMulig = allRows.filter((r) => r.gir !== "—").length;
  const girHit = allRows.filter((r) => r.gir === "y").length;
  const totalPutts = sum(allRows.map((r) => r.putts));
  const hullSpilt = played.length;

  // Hull-fordeling
  const tell = { birdie: 0, par: 0, bogey: 0, doble: 0 };
  for (const r of played) {
    if (r.par == null || r.score == null) continue;
    const d = r.score - r.par;
    if (d < 0) tell.birdie++;
    else if (d === 0) tell.par++;
    else if (d === 1) tell.bogey++;
    else tell.doble++;
  }

  // Chart-data (kun spilte hull)
  const diffs = played.map((r) => (r.score! - r.par!));
  const cum: number[] = [];
  diffs.reduce((acc, d) => {
    const v = acc + d;
    cum.push(v);
    return v;
  }, 0);
  const puttsSerie = played.map((r) => r.putts ?? 0);

  const vsPar = round.score - round.course.par;
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
  const datoLabel = round.playedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });

  const runderPaBane = await prisma.round.count({
    where: { userId: round.userId, courseId: round.courseId },
  });

  const courseMeta = [
    `Par ${round.course.par}`,
    round.course.slope != null ? `Slope ${round.course.slope}` : null,
    round.course.rating != null ? `CR ${round.course.rating.toFixed(1).replace(".", ",")}` : null,
    `${hullSpilt} hull spilt`,
  ].filter(Boolean) as string[];

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
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              {round.playedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span>
              Score <strong className="text-foreground">{round.score}</strong> ({vsPar >= 0 ? "+" : ""}{vsPar})
            </span>
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
      <section aria-label="Hovedstatistikk" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard featured label="Score" value={String(round.score)} delta={`${vsPar >= 0 ? "+" : ""}${vsPar} vs par`} />
        <KpiCard
          label="Fairways"
          value={firMulig > 0 ? `${Math.round((firHit / firMulig) * 100)}%` : "—"}
          delta={firMulig > 0 ? `${firHit} av ${firMulig}` : "ingen data"}
        />
        <KpiCard
          label="Greens"
          value={girMulig > 0 ? `${Math.round((girHit / girMulig) * 100)}%` : "—"}
          delta={girMulig > 0 ? `${girHit} av ${girMulig}` : "ingen data"}
        />
        <KpiCard
          label="Putts"
          value={String(totalPutts)}
          delta={hullSpilt > 0 ? `${(totalPutts / hullSpilt).toFixed(2).replace(".", ",")} snitt` : ""}
        />
      </section>

      {/* Bane meta */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin size={24} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="font-display text-lg font-semibold">{round.course.name}</div>
          <div className="mt-1 text-sm text-muted-foreground">{courseMeta.join(" · ")}</div>
        </div>
      </section>

      {/* Hull-tabell */}
      {hullSpilt > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold tracking-tight">Hull for hull</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Birdies <strong className="text-primary">{tell.birdie}</strong> · pars {tell.par} ·
              bogeys {tell.bogey} · doble+ {tell.doble}
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="min-w-full font-mono text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold uppercase tracking-[0.06em] text-muted-foreground">Hull</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((h) => (
                    <th key={h} className="px-2 py-2 text-center font-semibold text-muted-foreground">{h}</th>
                  ))}
                  <th className="px-4 py-2 text-center font-semibold text-muted-foreground">Ut</th>
                </tr>
              </thead>
              <tbody>
                <RowBasic label="Par" values={fronts.map((r) => r.par)} sum={frontParSum} />
                <RowScore label="Score" pars={fronts.map((r) => r.par)} scores={fronts.map((r) => r.score)} sum={frontScoreSum} />
                <RowYN label="FIR" values={fronts.map((r) => r.fir)} sumLabel={firLabel(fronts)} />
                <RowYN label="GIR" values={fronts.map((r) => r.gir)} sumLabel={girLabel(fronts)} />
                <RowBasic label="Putts" values={fronts.map((r) => r.putts)} sum={sum(fronts.map((r) => r.putts))} />
                <tr className="bg-muted/30">
                  <td colSpan={11} className="px-4 py-2 text-center font-semibold">
                    Front 9 — Score <strong>{frontScoreSum}</strong> · Par {frontParSum} ·{" "}
                    <strong className="text-primary">{frontScoreSum - frontParSum >= 0 ? "+" : ""}{frontScoreSum - frontParSum}</strong>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-left font-semibold uppercase tracking-[0.06em] text-muted-foreground">Hull</td>
                  {[10, 11, 12, 13, 14, 15, 16, 17, 18].map((h) => (
                    <td key={h} className="px-2 py-2 text-center font-semibold text-muted-foreground">{h}</td>
                  ))}
                  <td className="px-4 py-2 text-center font-semibold text-muted-foreground">Inn</td>
                </tr>
                <RowBasic label="Par" values={backs.map((r) => r.par)} sum={backParSum} />
                <RowScore label="Score" pars={backs.map((r) => r.par)} scores={backs.map((r) => r.score)} sum={backScoreSum} />
                <RowYN label="FIR" values={backs.map((r) => r.fir)} sumLabel={firLabel(backs)} />
                <RowYN label="GIR" values={backs.map((r) => r.gir)} sumLabel={girLabel(backs)} />
                <RowBasic label="Putts" values={backs.map((r) => r.putts)} sum={sum(backs.map((r) => r.putts))} />
                <tr className="bg-muted/30">
                  <td colSpan={11} className="px-4 py-2 text-center font-semibold">
                    Total — Score <strong>{round.score}</strong> · Par {round.course.par} ·{" "}
                    <strong className="text-primary">{vsPar >= 0 ? "+" : ""}{vsPar}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Charts */}
      {played.length >= 2 && (
        <section>
          <div className="mb-2">
            <h2 className="font-display text-xl font-semibold tracking-tight">Trend gjennom runden</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Score per hull" sub="vs par">
              <LineChart values={diffs} center />
            </ChartCard>
            <ChartCard title="Akkumulert vs par" sub={`${cum[cum.length - 1] >= 0 ? "+" : ""}${cum[cum.length - 1]} totalt`}>
              <LineChart values={cum} />
            </ChartCard>
            <ChartCard title="Putts per hull" sub={hullSpilt > 0 ? `snitt ${(totalPutts / hullSpilt).toFixed(2).replace(".", ",")}` : ""}>
              <BarChart values={puttsSerie} />
            </ChartCard>
          </div>
        </section>
      )}

      {/* Notat */}
      {round.notes && round.notes.trim().length > 0 && (
        <section>
          <NoteCard initials={initialer} name={user.name} role="Eget notat" body={round.notes} />
        </section>
      )}

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
            Du har spilt <strong className="text-foreground">{runderPaBane} {runderPaBane === 1 ? "runde" : "runder"}</strong> på denne banen
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={2} className="text-muted-foreground" />
      </Link>
    </div>
  );
}

/* ---------- helpers ---------- */
function IconBtn({ Icon, label }: { Icon: typeof Pencil; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted/40"
    >
      <Icon size={15} strokeWidth={1.75} />
    </button>
  );
}

function KpiCard({ label, value, delta, featured }: { label: string; value: string; delta: string; featured?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${featured ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
      <div className={`font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        {label}
      </div>
      <div className="mt-2 font-mono text-3xl font-semibold tabular-nums">{value}</div>
      <div className={`mt-1 font-mono text-[11px] ${featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{delta}</div>
    </div>
  );
}

function RowBasic({ label, values, sum }: { label: string; values: (number | null)[]; sum: number }) {
  return (
    <tr>
      <td className="px-4 py-2 text-left font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-2 py-2 text-center tabular-nums">{v ?? "—"}</td>
      ))}
      <td className="px-4 py-2 text-center font-bold tabular-nums">{sum}</td>
    </tr>
  );
}

function RowScore({ label, pars, scores, sum }: { label: string; pars: (number | null)[]; scores: (number | null)[]; sum: number }) {
  return (
    <tr>
      <td className="px-4 py-2 text-left font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</td>
      {scores.map((s, i) => {
        const par = pars[i];
        if (s == null || par == null) {
          return <td key={i} className="px-1 py-1 text-center text-muted-foreground">—</td>;
        }
        const diff = s - par;
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
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-sm font-semibold tabular-nums ${cls}`}>{s}</span>
          </td>
        );
      })}
      <td className="px-4 py-2 text-center font-bold tabular-nums">{sum}</td>
    </tr>
  );
}

function RowYN({ label, values, sumLabel }: { label: string; values: YN[]; sumLabel: string }) {
  return (
    <tr>
      <td className="px-4 py-2 text-left font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</td>
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

function ChartCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-display text-sm font-semibold">{title}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{sub}</span>
      </div>
      {children}
    </div>
  );
}

// Enkel linje-chart fra verdier (0-linje sentrert hvis center).
function LineChart({ values, center }: { values: number[]; center?: boolean }) {
  const W = 360;
  const H = 120;
  const n = values.length;
  const maxAbs = Math.max(1, ...values.map((v) => Math.abs(v)));
  const span = center ? maxAbs : Math.max(1, Math.max(...values) - Math.min(...values));
  const minV = center ? -maxAbs : Math.min(...values);
  const x = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const y = (v: number) => H - ((v - minV) / (span * (center ? 2 : 1))) * (H - 10) - 5;
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-32 w-full">
      <line x1="0" y1={center ? H / 2 : H - 5} x2={W} y2={center ? H / 2 : H - 5} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="2 3" />
      <polyline points={pts} fill="none" stroke="#005840" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function BarChart({ values }: { values: number[] }) {
  const W = 360;
  const H = 120;
  const n = values.length;
  const bw = Math.max(4, W / n - 4);
  const maxV = Math.max(1, ...values);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-32 w-full">
      {values.map((v, i) => {
        const h = (v / maxV) * (H - 8);
        const xPos = (i / n) * W + 2;
        return (
          <rect
            key={i}
            x={xPos}
            y={H - h}
            width={bw}
            height={h}
            rx="2"
            fill={v >= 3 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
          />
        );
      })}
    </svg>
  );
}

function NoteCard({ initials, name, role, body }: { initials: string; name: string; role: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold text-foreground">
          {initials}
        </div>
        <div>
          <div className="font-display text-sm font-semibold">{name}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{role}</div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{body}</p>
    </div>
  );
}
