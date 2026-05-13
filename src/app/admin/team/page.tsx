/**
 * CoachHQ — Team
 * Design migrert fra wireframe/design-files-v2/final/08-team.html.
 *
 * Card-grid med 2 kolonner (mobile 1), avatar i sirkel, rolle-tags,
 * 3-felts stats (Spillere/Tilgj./Sert.), handlinger nederst.
 */

import Link from "next/link";
import { Search, UserPlus, Users } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

type Role = "COACH" | "ADMIN";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  _count: { coachedGroups: number; coachAvailability: number };
};

export default async function TeamAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const teamRaw = await prisma.user.findMany({
    where: { role: { in: ["COACH", "ADMIN"] } },
    include: {
      _count: { select: { coachedGroups: true, coachAvailability: true } },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  const team = teamRaw as unknown as TeamMember[];

  // Tellinger for KPI
  const totalCount = team.length;
  const adminCount = team.filter((u) => u.role === "ADMIN").length;
  const coachCount = team.filter((u) => u.role === "COACH").length;

  // Spillerfordeling — totalt antall PLAYER-spillere som referanse-tall.
  // I et fremtidig coach-spiller-mapping ville vi delt opp per coach.
  const totalSpillere = await prisma.user.count({ where: { role: "PLAYER" } });
  const snittSpillere =
    totalCount > 0 ? (totalSpillere / totalCount).toFixed(1).replace(".", ",") : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`CoachHQ · /admin/team`}
        titleLead={`${totalCount}`}
        titleItalic="coacher"
        titleTrail={`· ${totalSpillere} spillere fordelt`}
        sub={`AK Golf Group · Snitt ${snittSpillere} spillere per coach.`}
        actions={
          <Link
            href="/admin/team/inviter"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <UserPlus size={14} strokeWidth={1.75} />
            Inviter coach
          </Link>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Kpi
          accent
          label="Aktive coacher"
          value={String(totalCount)}
          sub={`${adminCount} admin · ${coachCount} coach`}
        />
        <Kpi
          label="Spillere fordelt"
          value={String(totalSpillere)}
          sub={`snitt ${snittSpillere} / coach`}
        />
        <Kpi
          label="Roller"
          value={String(adminCount)}
          unit={`/ ${totalCount}`}
          sub="Admin-tilgang"
        />
        <Kpi
          label="Coacher"
          value={String(coachCount)}
          sub="Med spiller-tilgang"
        />
      </div>

      {/* Filter */}
      <form className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 min-w-[260px] items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            name="q"
            placeholder="Søk navn eller sertifisering"
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
        <FilterChip label="Rolle" />
        <FilterChip label="Status" />
      </form>

      {/* Body */}
      {team.length === 0 ? (
        <EmptyState
          icon={Users}
          titleItalic="Bare deg"
          titleTrail="så langt"
          sub="Inviter din første coach — de får en e-post med oppsett-link og kan logge inn umiddelbart."
          cta={
            <Link
              href="/admin/team/inviter"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <UserPlus size={16} strokeWidth={1.75} />
              Inviter coach
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {team.map((u) => (
            <CoachCard key={u.id} member={u} />
          ))}
        </div>
      )}

      <p className="text-[12px] text-muted-foreground">
        Inviterte coacher får en e-post med innloggingslink. Authentisering går
        via Supabase Auth ved første innlogging.
      </p>
    </div>
  );
}

// ----------------- Komponenter -----------------

function CoachCard({ member }: { member: TeamMember }) {
  const isAdmin = member.role === "ADMIN";
  const roleLabel = isAdmin ? "Admin" : "Coach";
  const subRole = isAdmin ? "Administrator" : "Coach";

  return (
    <article className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg">
      <div
        className="grid h-24 w-24 place-items-center rounded-full font-display text-[32px] font-bold text-white"
        style={{ background: avatarBg(member.name) }}
      >
        {initials(member.name)}
      </div>
      <div>
        <div className="font-display text-lg font-semibold leading-tight">
          {member.name}
        </div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">{subRole}</div>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        <span
          className={`rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] ${
            isAdmin
              ? "bg-primary/15 text-primary"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {roleLabel}
        </span>
      </div>
      <div className="grid w-full grid-cols-3 gap-2 border-y border-border py-3.5">
        <Stat label="Grupper" value={String(member._count.coachedGroups)} />
        <Stat
          label="Tidsvinduer"
          value={String(member._count.coachAvailability)}
        />
        <Stat label="E-post" value={shortEmail(member.email)} small />
      </div>
      <div className="flex w-full gap-1.5">
        <a
          href={`mailto:${member.email}`}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Meld →
        </a>
        <Link
          href={`/admin/team`}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary"
        >
          Profil →
        </Link>
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`font-mono font-semibold tabular-nums text-foreground ${small ? "text-[11px]" : "text-lg"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-lg border p-4 ${
        accent
          ? "border-transparent bg-gradient-to-br from-foreground to-foreground/90 text-white"
          : "border-border bg-card"
      }`}
    >
      <div
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${
          accent ? "text-[rgba(209,248,67,0.70)]" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      <div
        className={`font-mono text-[28px] font-semibold leading-none tabular-nums ${
          accent ? "text-white" : "text-foreground"
        }`}
      >
        {value}
        {unit && (
          <span
            className={`ml-1 text-[13px] font-medium ${
              accent ? "text-[rgba(245,244,238,0.5)]" : "text-muted-foreground"
            }`}
          >
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div
          className={`font-mono text-[11px] ${
            accent ? "text-[rgba(245,244,238,0.7)]" : "text-muted-foreground"
          }`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground">
      {label}
    </span>
  );
}

// ----------------- Helpers -----------------

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Bevisst dekorativ palett — deterministisk avatar-gradient per navn-hash.
// TODO: konsolider farge — vurder å flytte til src/lib/avatar-colors.ts som delt utility.
function avatarBg(name: string): string {
  const palette = [
    "linear-gradient(135deg,#005840,#1A7D56)",
    "linear-gradient(135deg,#a14b30,#d2876b)",
    "linear-gradient(135deg,#3b5994,#5b7cb8)",
    "linear-gradient(135deg,#5E5C57,#8a8780)",
    "linear-gradient(135deg,#A6651E,#7A4910)",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palette[h % palette.length];
}

function shortEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.length > 12 ? `${local.slice(0, 11)}…` : local;
}
