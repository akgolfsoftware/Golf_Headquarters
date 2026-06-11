/**
 * AgencyOS — Spillerprofil 360° (/admin/spillere/[id]).
 *
 * Port av fasit `agencyos-app/screens-stable.jsx` → PlayerProfileScreen
 * (mørkt tema, desktop 1280): tilbake-lenke, hero-kort (avatar 64 pri +
 * eyebrow + navn + mono-meta + Melding/Ny plan/Ny økt), venstre kolonne
 * (coach-flagg, treningspyramide m/ accent-innsikt, siste runder & tester)
 * og høyre kolonne (aktiv plan, hurtighandlinger, meldinger).
 *
 * Datakilder (kun ekte data — tomme felter viser «—»/skjules):
 *   - Ident/HCP/grupper: prisma.user + groupMemberships.
 *   - Pyramide + uke + comms: loadSpillerDetaljOversikt (eksisterende loader).
 *   - Runder/tester: prisma.round + prisma.testResult.
 *   - Aktiv plan: prisma.trainingPlan (isActive) m/ økt-status.
 *   - Coach-flagg: utledet («N økter bak» fra plan-økter, ellers inaktivitet).
 *   - Meldinger-kort: PENDING PlanAction (zod-validert JSON) → fallback comms.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarPlus,
  ChevronRight,
  ClipboardList,
  Clock,
  MessageSquare,
  Plus,
  Trophy,
} from "lucide-react";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadSpillerDetaljOversikt } from "@/lib/admin-spiller/spiller-detalj-data";
import {
  AgAvatar,
  AgChip,
  AgPage,
  AgTable,
  AgTd,
  AgTh,
  agBtnClass,
} from "@/components/admin/agencyos/ui";

export const dynamic = "force-dynamic";

const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

const AXES = [
  { key: "turn", label: "Turnering", color: "var(--pyr-turn)" },
  { key: "spill", label: "Spill", color: "var(--pyr-spill)" },
  { key: "slag", label: "Golfslag", color: "var(--pyr-slag)" },
  { key: "tek", label: "Teknisk", color: "var(--pyr-tek)" },
  { key: "fys", label: "Fysisk", color: "var(--pyr-fys)" },
] as const;

const suggestionSchema = z
  .object({
    title: z.string().optional(),
    tittel: z.string().optional(),
    forklaring: z.string().optional(),
  })
  .nullable();

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtHcp(v: number | null): string {
  if (v == null) return "—";
  if (v <= 0) return `+${Math.abs(v).toFixed(1).replace(".", ",")}`;
  return v.toFixed(1).replace(".", ",");
}

function fmtSg1(v: number): string {
  const abs = Math.abs(v).toFixed(1).replace(".", ",");
  return v < 0 ? `−${abs}` : `+${abs}`;
}

function fmtScore(score: number, par: number): string {
  const diff = score - par;
  const rel = diff === 0 ? "E" : diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
  return `${score} (${rel})`;
}

function fmtTestScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1).replace(".", ",");
}

function hhmm(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function datoKort(d: Date): string {
  return `${d.getDate()}. ${MND[d.getMonth()]}`;
}

function naarLabel(d: Date, now: Date): string {
  if (d.toDateString() === now.toDateString()) return `I dag ${hhmm(d)}`;
  const iGaar = new Date(now);
  iGaar.setDate(iGaar.getDate() - 1);
  if (d.toDateString() === iGaar.toDateString()) return `I går ${hhmm(d)}`;
  return datoKort(d);
}

function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}

function alder(dob: Date | null, now: Date): number | null {
  if (!dob) return null;
  let a = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--;
  return a;
}

function gruppeBucket(groupNames: string[]): string | null {
  for (const n of groupNames) {
    const l = n.toLowerCase();
    if (l.includes("wang")) return "WANG";
    if (l.includes("gfgk")) return "GFGK";
    if (l.includes("junior")) return "Junior";
  }
  return groupNames[0] ?? null;
}

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "font-mono text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Sechead({
  children,
  suffix,
  link,
  className,
}: {
  children: React.ReactNode;
  suffix?: string;
  link?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-[14px] mt-7 flex items-center gap-[10px] font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground",
        className,
      )}
    >
      <span>
        {children}
        {suffix && <span className="font-bold text-muted-foreground"> {suffix}</span>}
      </span>
      <span aria-hidden className="h-px flex-1 bg-border" />
      {link}
    </div>
  );
}


function PyrRow({
  label,
  pct,
  value,
  color,
}: {
  label: string;
  pct: number;
  value: string;
  color: string;
}) {
  return (
    <div className="grid grid-cols-[72px_1fr_48px] items-center gap-3 py-[6px] leading-none">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className="h-[7px] overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }}
        />
      </span>
      <span className="text-right font-mono text-[11px] font-bold text-foreground">{value}</span>
    </div>
  );
}

export default async function SpillerProfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;
  const now = new Date();

  const player = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      hcp: true,
      ambition: true,
      homeClub: true,
      createdAt: true,
      dateOfBirth: true,
      lastLoginAt: true,
      groupMemberships: {
        select: { group: { select: { name: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!player || player.role !== "PLAYER") notFound();

  const ukeStart = new Date(now);
  ukeStart.setHours(0, 0, 0, 0);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));

  const [oversikt, rounds, tests, aktivPlan, pendingAction, entries, ukeOkter] =
    await Promise.all([
      loadSpillerDetaljOversikt(player.id),
      prisma.round.findMany({
        where: { userId: player.id },
        orderBy: { playedAt: "desc" },
        take: 4,
        select: {
          id: true,
          playedAt: true,
          score: true,
          sgTotal: true,
          course: { select: { name: true, par: true } },
        },
      }),
      prisma.testResult.findMany({
        where: { userId: player.id },
        orderBy: { takenAt: "desc" },
        take: 4,
        select: { id: true, takenAt: true, score: true, test: { select: { name: true } } },
      }),
      prisma.trainingPlan.findFirst({
        where: { userId: player.id, isActive: true },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          sessions: { select: { status: true } },
        },
      }),
      prisma.planAction.findFirst({
        where: { userId: player.id, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        select: { suggestion: true, createdAt: true },
      }),
      prisma.tournamentEntry.findMany({
        where: { userId: player.id, entryStatus: { in: ["PLANNED", "CONFIRMED"] } },
        select: {
          manualName: true,
          manualDate: true,
          tournament: { select: { name: true, startDate: true } },
        },
        take: 20,
      }),
      prisma.trainingPlanSession.findMany({
        where: { plan: { userId: player.id }, scheduledAt: { gte: ukeStart, lt: now } },
        select: { status: true },
      }),
    ]);

  const wb = `/admin/spillere/${player.id}/workbench`;

  // ── Hero-tekster ───────────────────────────────────────────────
  const bucket = gruppeBucket(player.groupMemberships.map((m) => m.group.name));
  const eyebrowDeler = [
    bucket,
    player.ambition,
    player.hcp != null ? `HCP ${fmtHcp(player.hcp)}` : null,
  ].filter(Boolean);

  const nesteTurnering =
    entries
      .map((e) => ({
        name: e.tournament?.name ?? e.manualName,
        date: e.tournament?.startDate ?? e.manualDate,
      }))
      .filter((e): e is { name: string; date: Date } =>
        Boolean(e.name && e.date && e.date >= now),
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null;

  const alderAar = alder(player.dateOfBirth, now);
  const metaDeler = [
    alderAar != null ? `${alderAar} år` : null,
    `medlem siden ${player.createdAt.getFullYear()}`,
    nesteTurnering
      ? `${Math.max(0, Math.ceil((nesteTurnering.date.getTime() - now.getTime()) / 86_400_000))} dg til ${nesteTurnering.name}`
      : null,
  ].filter(Boolean);

  // ── Coach-flagg (kun fra ekte data, ellers skjult) ─────────────
  const planlagtPassert = ukeOkter.length;
  const bak = ukeOkter.filter((s) => s.status === "PLANNED").length;
  const gjennomfoert = ukeOkter.filter((s) => s.status === "COMPLETED").length;
  const inaktivDg = player.lastLoginAt
    ? Math.floor((now.getTime() - player.lastLoginAt.getTime()) / 86_400_000)
    : null;

  const flagg =
    bak >= 1
      ? {
          chip: `${bak} ${bak === 1 ? "økt" : "økter"} bak`,
          tekst: (
            <>
              Har gjennomført <b>{gjennomfoert} av {planlagtPassert}</b> planlagte økter så langt
              denne uka — {bak} ligger bak skjema. Vurder å justere planen i Workbench.
            </>
          ),
          href: wb,
          cta: "Åpne i Workbench",
        }
      : inaktivDg != null && inaktivDg >= 5
        ? {
            chip: `${inaktivDg} dg inaktiv`,
            tekst: (
              <>
                Ingen registrert aktivitet på <b>{inaktivDg} dager</b> — siste innlogging{" "}
                {datoKort(player.lastLoginAt as Date)}. Vurder å ta kontakt.
              </>
            ),
            href: "/admin/innboks",
            cta: "Send melding",
          }
        : null;

  // ── Pyramide + innsikt ─────────────────────────────────────────
  const pyrRader = AXES.map((ax) => {
    const d = oversikt.pyramid.find((p) => p.axis === ax.key);
    return { ...ax, pct: d?.pct ?? 0, value: d ? `${d.pct} %` : "—", harData: Boolean(d) };
  });
  const harPyramide = oversikt.pyramid.length > 0;
  const verst =
    pyrRader
      .filter((r) => r.harData && r.pct < 100)
      .sort((a, b) => a.pct - b.pct)[0] ?? null;

  // ── Siste runder & tester ──────────────────────────────────────
  const hendelser = [
    ...rounds.map((r) => ({
      id: r.id,
      d: r.playedAt,
      ev: `Runde · ${r.course.name}`,
      res: fmtScore(r.score, r.course.par),
      sg: r.sgTotal,
    })),
    ...tests.map((t) => ({
      id: t.id,
      d: t.takenAt,
      ev: t.test.name,
      res: fmtTestScore(t.score),
      sg: null as number | null,
    })),
  ]
    .sort((a, b) => b.d.getTime() - a.d.getTime())
    .slice(0, 5);

  // ── Aktiv plan ─────────────────────────────────────────────────
  const planTotal = aktivPlan?.sessions.length ?? 0;
  const planDone = aktivPlan?.sessions.filter((s) => s.status === "COMPLETED").length ?? 0;
  const planPct = planTotal > 0 ? Math.round((planDone / planTotal) * 100) : 0;
  const planMeta = aktivPlan
    ? `Uke ${isoWeek(aktivPlan.startDate)}${aktivPlan.endDate ? `–${isoWeek(aktivPlan.endDate)}` : ""} · ${planTotal} økter · ${planPct} % fullført`
    : null;

  // ── Meldinger-kort: PENDING godkjenning → fallback siste comms ─
  const parsed = pendingAction ? suggestionSchema.safeParse(pendingAction.suggestion) : null;
  const sugg = parsed?.success ? parsed.data : null;
  const melding = pendingAction
    ? {
        when: naarLabel(pendingAction.createdAt, now),
        type: "Godkjenning",
        tekst:
          sugg?.forklaring ?? sugg?.tittel ?? sugg?.title ?? "Forslag venter på godkjenning.",
        href: "/admin/approvals",
        cta: "Svar i godkjenninger →",
      }
    : oversikt.comms[0]
      ? {
          when: oversikt.comms[0].when,
          type: oversikt.comms[0].type ?? "Melding",
          tekst: oversikt.comms[0].preview,
          href: "/admin/innboks",
          cta: "Åpne innboks →",
        }
      : null;

  const handlinger = [
    { label: "Ny økt", icon: CalendarPlus, href: wb },
    { label: "Ny treningsplan", icon: ClipboardList, href: wb },
    { label: "Send melding", icon: MessageSquare, href: "/admin/innboks" },
    { label: "Book Pro-time", icon: Clock, href: "/admin/bookinger" },
    { label: "Meld på turnering", icon: Trophy, href: "/admin/tournaments" },
  ];

  return (
    <AgPage>
      <Link href="/admin/spillere" className={cn(agBtnClass("ghost", "sm"), "mb-[14px]")}>
        <ArrowLeft size={15} strokeWidth={1.5} /> Alle spillere
      </Link>

      {/* Hero-kort */}
      <div className="flex flex-wrap items-center gap-[18px] rounded-xl border border-border bg-card p-[18px]">
        <AgAvatar initials={initialsOf(player.name)} size={64} tone="pri" />
        <div className="min-w-[200px] flex-1">
          <Eyebrow>{eyebrowDeler.length > 0 ? eyebrowDeler.join(" · ") : "—"}</Eyebrow>
          <h2 className="mt-1 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
            {player.name}
          </h2>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            {metaDeler.join(" · ")}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/innboks" className={agBtnClass("secondary")}>
            <MessageSquare size={16} strokeWidth={1.5} /> Melding
          </Link>
          <Link href={wb} className={agBtnClass("secondary")}>
            <ClipboardList size={16} strokeWidth={1.5} /> Ny plan
          </Link>
          <Link href={wb} className={agBtnClass("primary")}>
            <Plus size={16} strokeWidth={1.5} /> Ny økt
          </Link>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 items-start gap-3 lg:grid-cols-[1.3fr_1fr]">
        {/* Venstre kolonne */}
        <div>
          {flagg && (
            <div className="rounded-xl border border-destructive/30 bg-background bg-[linear-gradient(180deg,hsl(var(--destructive)/0.06),transparent_50%)] p-[18px]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-[6px] rounded-full bg-destructive/10 px-[10px] py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-destructive">
                  <AlertTriangle size={11} strokeWidth={1.5} />
                  {flagg.chip}
                </span>
                <Eyebrow className="ml-auto">Coach-flagg</Eyebrow>
              </div>
              <p className="mb-0 mt-3 text-[13px] leading-[1.5] text-foreground">{flagg.tekst}</p>
              <div className="mt-[14px] flex gap-2">
                <Link href={flagg.href} className={agBtnClass("primary", "sm")}>
                  <Plus size={14} strokeWidth={1.5} /> {flagg.cta}
                </Link>
                <Link href="/admin/godkjenninger" className={agBtnClass("ghost", "sm")}>
                  Avvis
                </Link>
              </div>
            </div>
          )}

          <Sechead
            suffix={`· ${oversikt.weekLabel.toLowerCase()}`}
            className={flagg ? undefined : "mt-0"}
          >
            Treningspyramide
          </Sechead>
          <div className="rounded-xl border border-border bg-card p-[18px]">
            {harPyramide ? (
              <>
                <div>
                  {pyrRader.map((r) => (
                    <PyrRow key={r.key} label={r.label} pct={r.pct} value={r.value} color={r.color} />
                  ))}
                </div>
                {verst && (
                  <div className="mt-[14px] rounded-[10px] border border-border border-l-[3px] border-l-accent bg-card px-4 py-[14px] font-mono text-[11px] leading-[1.55] text-muted-foreground">
                    {verst.label} ligger {100 - verst.pct} pp bak planen denne uka — prioriter
                    dette i neste økt.
                  </div>
                )}
              </>
            ) : (
              <div className="py-2 text-[13px] text-muted-foreground">
                Ingen planlagte økter denne uka — pyramiden vises når spilleren har en aktiv plan.
              </div>
            )}
          </div>

          <Sechead

          >
            Siste runder & tester
          </Sechead>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <AgTable>
              <thead>
                <tr>
                  <AgTh>Dato</AgTh>
                  <AgTh>Hendelse</AgTh>
                  <AgTh num>Resultat</AgTh>
                  <AgTh num>SG</AgTh>
                </tr>
              </thead>
              <tbody>
                {hendelser.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-[14px] py-8 text-center text-[13px] text-muted-foreground"
                    >
                      Ingen runder eller tester registrert ennå.
                    </td>
                  </tr>
                )}
                {hendelser.map((h) => (
                  <tr key={h.id} className="leading-[1.2] [&+tr>td]:border-t [&+tr>td]:border-border">
                    <AgTd>
                      <span className="font-mono text-xs text-foreground">{datoKort(h.d)}</span>
                    </AgTd>
                    <AgTd>{h.ev}</AgTd>
                    <AgTd num>{h.res}</AgTd>
                    <AgTd num>
                      {h.sg != null ? (
                        <span className={h.sg < 0 ? "text-destructive" : "text-success"}>
                          {fmtSg1(h.sg)}
                        </span>
                      ) : (
                        <span className="font-normal text-muted-foreground">—</span>
                      )}
                    </AgTd>
                  </tr>
                ))}
              </tbody>
            </AgTable>
          </div>
        </div>

        {/* Høyre kolonne */}
        <div>
          <Sechead className="mt-0">Aktiv plan</Sechead>
          {aktivPlan ? (
            <Link
              href="/admin/plans"
              className="block rounded-xl border border-border border-l-[3px] border-l-accent bg-card p-[18px] transition-colors hover:bg-secondary"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-bold text-foreground">{aktivPlan.name}</span>
                <AgChip tone="lime">Aktiv</AgChip>
              </div>
              <div className="mt-[6px] font-mono text-[11px] text-muted-foreground">{planMeta}</div>
              <span className="mt-[10px] block h-[6px] overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${planPct}%` }}
                />
              </span>
            </Link>
          ) : (
            <div className="rounded-xl border border-border bg-card p-[18px]">
              <div className="text-[13px] text-muted-foreground">Ingen aktiv plan.</div>
              <Link href={wb} className={cn(agBtnClass("ghost", "sm"), "mt-3")}>
                Lag plan i Workbench
              </Link>
            </div>
          )}

          <Sechead>Hurtighandlinger</Sechead>
          <div className="rounded-xl border border-border bg-card px-[14px] py-1">
            {handlinger.map((h, i) => {
              const Ikon = h.icon;
              return (
                <Link
                  key={h.label}
                  href={h.href}
                  className={cn(
                    "flex w-full items-center gap-3 px-1 py-3 text-[13.5px] font-medium text-foreground",
                    i > 0 && "border-t border-border",
                  )}
                >
                  <Ikon size={18} strokeWidth={1.5} className="text-primary" />
                  {h.label}
                  <ChevronRight size={16} strokeWidth={1.5} className="ml-auto text-muted-foreground" />
                </Link>
              );
            })}
          </div>

          <Sechead>Meldinger</Sechead>
          {melding ? (
            <Link
              href={melding.href}
              className="block rounded-xl border border-border bg-card p-[18px] transition-colors hover:bg-secondary"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                {melding.when} · {melding.type}
              </div>
              <p className="mb-0 mt-[6px] text-[13px] leading-[1.45] text-foreground">
                «{melding.tekst}»
              </p>
              <span className="mt-[10px] inline-block font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
                {melding.cta}
              </span>
            </Link>
          ) : (
            <div className="rounded-xl border border-border bg-card p-[18px] text-[13px] text-muted-foreground">
              Ingen meldinger ennå.
            </div>
          )}
        </div>
      </div>
    </AgPage>
  );
}
