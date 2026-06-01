/**
 * Data-loader for Drift-panelet (/admin/settings).
 * Henter ekte Prisma-data og mapper til DriftData for accordion-hubben:
 *   TEAM        — prisma.user (role ADMIN/COACH) + scope (grupper, coachede spillere)
 *   PLAN-MALER  — prisma.planTemplate med pyramide-fordeling (disciplinFordeling JSON)
 *
 * JSON-blobben disciplinFordeling valideres med zod (CLAUDE.md-regel: aldri
 * `as unknown as` på forretningskritisk JSON fra Prisma).
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ── Pyramide-fordeling (disciplinFordeling JSON) ────────────────
// Lagret som fraksjoner 0–1, f.eks. {FYS:0.15, TEK:0.25, SLAG:0.25, SPILL:0.2, TURN:0.15}.
const fordelingSchema = z.object({
  FYS: z.number(),
  TEK: z.number(),
  SLAG: z.number(),
  SPILL: z.number(),
  TURN: z.number(),
});

export type DriftAxis = "fys" | "tek" | "slag" | "spill" | "turn";

export type PyramidSeg = { axis: DriftAxis; pct: number };

export type TeamMember = {
  id: string;
  initials: string;
  name: string;
  email: string;
  avatarTone: "default" | "primary" | "accent";
  presence: "on" | "busy" | "off";
  /** ADMIN = lime, COACH = forest-tint (jf. design rolle-badge) */
  role: "ADMIN" | "COACH";
  roleLabel: string;
  /** Capabilities-pills — utledet fra rolle + scope. */
  capabilities: string[];
  scopeMain: string;
  lastSeen: string;
  href: string;
};

export type PlanTemplateCard = {
  id: string;
  name: string;
  /** Periode-tag utledet fra LPhase. */
  periode: "grunn" | "spes" | "turn";
  periodeLabel: string;
  meta: string;
  segs: PyramidSeg[];
  usageCount: number;
  shared: boolean;
  editedBy: string;
  href: string;
};

export type DriftData = {
  ownerName: string;
  createdLabel: string;
  team: TeamMember[];
  teamActive: number;
  teamTotalLabel: string;
  templates: PlanTemplateCard[];
  templatesTotal: number;
};

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function firstLast(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

/** "NÅ" / "12 m" / "2 t" / "i går" / "3. mai" / "—" fra lastLoginAt. */
function lastSeenLabel(d: Date | null, now: Date): string {
  if (!d) return "—";
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 2) return "NÅ";
  if (diffMin < 60) return `${diffMin} m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 12) return `${diffH} t`;
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "i går";
  if (d.toDateString() === now.toDateString()) return `${diffH} t`;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

/** on (<15 m) / busy (<2 t) / off — enkel presence-heuristikk fra siste innlogging. */
function presenceFrom(d: Date | null, now: Date): "on" | "busy" | "off" {
  if (!d) return "off";
  const diffMin = (now.getTime() - d.getTime()) / 60000;
  if (diffMin < 15) return "on";
  if (diffMin < 120) return "busy";
  return "off";
}

const lPhaseToPeriode: Record<
  string,
  { periode: PlanTemplateCard["periode"]; label: string }
> = {
  GRUNN: { periode: "grunn", label: "GRUNN" },
  SPESIAL: { periode: "spes", label: "SPES" },
  TURNERING: { periode: "turn", label: "TURN" },
};

/** Fraksjoner → hele prosent som summerer til 100 (largest-remainder). */
function toPct(fr: z.infer<typeof fordelingSchema>): PyramidSeg[] {
  const raw: { axis: DriftAxis; val: number }[] = [
    { axis: "fys", val: fr.FYS },
    { axis: "tek", val: fr.TEK },
    { axis: "slag", val: fr.SLAG },
    { axis: "spill", val: fr.SPILL },
    { axis: "turn", val: fr.TURN },
  ];
  const sum = raw.reduce((s, x) => s + x.val, 0) || 1;
  const scaled = raw.map((x) => ({ axis: x.axis, exact: (x.val / sum) * 100 }));
  const floored = scaled.map((x) => ({ axis: x.axis, pct: Math.floor(x.exact), rem: x.exact - Math.floor(x.exact) }));
  let rest = 100 - floored.reduce((s, x) => s + x.pct, 0);
  floored
    .slice()
    .sort((a, b) => b.rem - a.rem)
    .forEach((x) => {
      if (rest > 0) {
        x.pct += 1;
        rest -= 1;
      }
    });
  return floored.map((x) => ({ axis: x.axis, pct: x.pct }));
}

export async function loadDriftData(coach: {
  id: string;
  name: string | null;
}): Promise<DriftData> {
  const now = new Date();

  const [teamUsers, templates] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "COACH"] }, deletedAt: null },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLoginAt: true,
        _count: {
          select: {
            coachedGroups: true,
            coachedBookings: true,
          },
        },
      },
    }),
    prisma.planTemplate.findMany({
      orderBy: [{ usageCount: "desc" }, { updatedAt: "desc" }],
      take: 11,
      select: {
        id: true,
        name: true,
        lPhase: true,
        kategori: true,
        varighetUker: true,
        ukentligOktAntall: true,
        disciplinFordeling: true,
        usageCount: true,
        approved: true,
        updatedAt: true,
        byCoach: { select: { name: true } },
      },
    }),
  ]);

  // ── TEAM ───────────────────────────────────────────────
  const team: TeamMember[] = teamUsers.map((u, i) => {
    const isAdmin = u.role === "ADMIN";
    const groups = u._count.coachedGroups;
    const players = u._count.coachedBookings;
    const capabilities: string[] = isAdmin
      ? ["coach.*", "admin.team", "admin.billing"]
      : [
          "coach.bookings",
          "coach.players.read",
          ...(players > 0 ? ["coach.plans.edit"] : []),
        ];
    const scopeMain = isAdmin
      ? "Full tilgang · alle grupper"
      : groups > 0
        ? `${groups} ${groups === 1 ? "gruppe" : "grupper"}`
        : "Ingen grupper tildelt";
    return {
      id: u.id,
      initials: initials(u.name),
      name: u.name,
      email: u.email,
      avatarTone: isAdmin ? "primary" : i % 3 === 2 ? "accent" : "default",
      presence: presenceFrom(u.lastLoginAt, now),
      role: u.role as "ADMIN" | "COACH",
      roleLabel: isAdmin ? "ADMIN" : "INSTRUKTØR",
      capabilities,
      scopeMain,
      lastSeen: lastSeenLabel(u.lastLoginAt, now),
      href: `/admin/spillere/${u.id}`,
    };
  });

  const adminCount = team.filter((t) => t.role === "ADMIN").length;
  const coachCount = team.length - adminCount;
  const teamTotalLabel =
    `${coachCount} ${coachCount === 1 ? "coach" : "coacher"} · ${adminCount} admin`;

  // ── PLAN-MALER ─────────────────────────────────────────
  const cards: PlanTemplateCard[] = templates.map((t) => {
    const parsed = fordelingSchema.safeParse(t.disciplinFordeling);
    const segs = parsed.success
      ? toPct(parsed.data)
      : [
          { axis: "fys" as const, pct: 20 },
          { axis: "tek" as const, pct: 20 },
          { axis: "slag" as const, pct: 20 },
          { axis: "spill" as const, pct: 20 },
          { axis: "turn" as const, pct: 20 },
        ];
    const per = lPhaseToPeriode[t.lPhase] ?? { periode: "grunn" as const, label: "GRUNN" };
    return {
      id: t.id,
      name: t.name,
      periode: per.periode,
      periodeLabel: per.label,
      meta: `${t.varighetUker} uker · ${t.ukentligOktAntall} økter/uke · kat. ${t.kategori}`,
      segs,
      usageCount: t.usageCount,
      shared: t.approved,
      editedBy: firstLast(t.byCoach?.name) === "—" ? "AK Golf" : firstLast(t.byCoach?.name),
      href: `/admin/plan-maler/${t.id}`,
    };
  });

  return {
    ownerName: firstLast(coach.name),
    createdLabel: now.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" }),
    team,
    teamActive: team.filter((t) => t.presence !== "off").length,
    teamTotalLabel,
    templates: cards,
    templatesTotal: cards.length,
  };
}
