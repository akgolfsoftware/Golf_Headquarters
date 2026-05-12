/**
 * CoachHQ — Elever (spillerliste)
 * Design migrert fra wireframe/design-files-v2/final/02-elever.html.
 *
 * Tabell med Spiller / Kat / Tier / HCP / Status / Siste økt. KPI-strip
 * øverst med Aktive / Pro+Elite / Inaktive / Skadet.
 */

import Link from "next/link";
import { Search, UserPlus, Users } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

type SearchParams = { tier?: string; q?: string; status?: string; sort?: string };

type Status = "ok" | "warn" | "dan" | "ferie";

type Tier = "GRATIS" | "PRO" | "ELITE";

type PlayerRow = {
  id: string;
  name: string;
  email: string;
  hcp: number | null;
  tier: Tier;
  homeClub: string | null;
  lastLoginAt: Date | null;
  _count: {
    rounds: number;
    testResults: number;
    trainingPlans: number;
  };
  groupMemberships: { group: { name: string } }[];
};

type Category = "A" | "B" | "C" | "D";

// Deriverer HCP-kategori. A=elite, B=lavt, C=medium, D=høyt.
function deriveCategory(hcp: number | null): Category {
  if (hcp === null) return "D";
  if (hcp <= 4) return "A";
  if (hcp <= 10) return "B";
  if (hcp <= 18) return "C";
  return "D";
}

const CAT_STYLE: Record<Category, string> = {
  A: "bg-[rgba(209,248,67,0.30)] text-[#3d4d0f]",
  B: "bg-[rgba(166,101,30,0.16)] text-[#7a4910]",
  C: "bg-[rgba(122,153,140,0.20)] text-[#3d5048]",
  D: "bg-[rgba(156,153,144,0.20)] text-[#5a5852]",
};

const TIER_STYLE: Record<Tier, string> = {
  GRATIS: "bg-secondary text-muted-foreground",
  PRO: "bg-[rgba(0,88,64,0.14)] text-primary",
  ELITE: "bg-[#0F2A22] text-accent",
};

const TIER_LABEL: Record<Tier, string> = {
  GRATIS: "Free",
  PRO: "Pro",
  ELITE: "Elite",
};

export default async function ElverListe({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;

  const where: {
    role: "PLAYER";
    tier?: Tier;
    OR?: {
      name?: { contains: string; mode: "insensitive" };
      email?: { contains: string; mode: "insensitive" };
    }[];
  } = { role: "PLAYER" };

  if (params.tier === "GRATIS" || params.tier === "PRO" || params.tier === "ELITE") {
    where.tier = params.tier;
  }
  if (params.q) {
    const q = params.q;
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy =
    params.sort === "hcp-desc"
      ? ({ hcp: "desc" } as const)
      : params.sort === "hcp-asc"
        ? ({ hcp: "asc" } as const)
        : params.sort === "last-login"
          ? ({ lastLoginAt: "desc" } as const)
          : ({ name: "asc" } as const);

  const playersRaw = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          rounds: true,
          testResults: true,
          trainingPlans: { where: { isActive: true } },
        },
      },
      groupMemberships: {
        include: { group: { select: { name: true } } },
        take: 1,
      },
    },
    orderBy,
    take: 200,
  });

  const players = playersRaw as PlayerRow[];

  // Status-beregning per spiller
  const naa = Date.now();
  const dgrSiden = (d: Date | null) =>
    d ? Math.floor((naa - d.getTime()) / (1000 * 60 * 60 * 24)) : 999;

  const beregnStatus = (p: PlayerRow): { status: Status; label: string } => {
    const d = dgrSiden(p.lastLoginAt);
    if (d > 30) return { status: "dan", label: "Inaktiv" };
    if (d > 7) return { status: "warn", label: "Forsinket" };
    return { status: "ok", label: "Aktiv" };
  };

  const synlige = players.map((p) => ({
    ...p,
    _statusInfo: beregnStatus(p),
    _category: deriveCategory(p.hcp),
  }));

  // KPI-beregninger
  const total = players.length;
  const aktive = synlige.filter((p) => p._statusInfo.status === "ok").length;
  const inaktiveOver30 = players.filter(
    (p) => dgrSiden(p.lastLoginAt) > 30,
  ).length;
  const proEliteCount = players.filter(
    (p) => p.tier === "PRO" || p.tier === "ELITE",
  ).length;
  const proEliteAndel =
    total > 0 ? Math.round((proEliteCount / total) * 100) : 0;
  // Skadet — krever explicit felt; bruker dan-status som proxy
  const skadet = synlige.filter((p) => p._statusInfo.status === "dan").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · /admin/elever"
        titleLead={String(total)}
        titleItalic="spillere"
        sub={`AK Golf · ${proEliteCount} Pro/Elite · ${aktive} aktive denne uka`}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <UserPlus size={14} strokeWidth={1.75} />
            Ny spiller
          </button>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <KpiAccent
          label="Aktive"
          value={String(total)}
          sub={total > 0 ? `${aktive} aktive denne uka` : "Ingen spillere"}
        />
        <Kpi
          label="Pro + Elite"
          value={String(proEliteCount)}
          unit={`/ ${total}`}
          sub={`${proEliteAndel} % betalende`}
        />
        <Kpi
          label="Inaktive > 30 d"
          value={String(inaktiveOver30)}
          sub={inaktiveOver30 > 0 ? "Krever oppfølging" : "Alt under kontroll"}
          tone={inaktiveOver30 > 0 ? "warn" : undefined}
        />
        <Kpi
          label="Forsinket"
          value={String(skadet)}
          sub={skadet > 0 ? "Trenger oppmerksomhet" : "Ingen"}
          tone={skadet > 0 ? "bad" : undefined}
        />
      </div>

      {/* Filter */}
      <form className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 min-w-[280px] items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Søk spiller, e-post eller HCP"
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
        <FilterChip label="Kategori" />
        <FilterChip label="Tier" />
        <FilterChip label="Status" />
        <FilterChip label="Coach" />
        <FilterChip label="Sort: HCP" />
      </form>

      {/* Body */}
      {total === 0 ? (
        <EmptyState
          icon={Users}
          titleItalic="Ingen spillere"
          titleTrail="registrert ennå"
          sub="Legg til din første spiller for å komme i gang. Du kan invitere via e-post eller opprette manuelt."
          cta={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <UserPlus size={16} strokeWidth={1.75} />
              Ny spiller
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
            <span>
              Viser <b className="font-semibold text-foreground">{synlige.length}</b> av {total} spillere
            </span>
            <span className="text-foreground">
              Sortert: {"name" in orderBy
                ? "Navn ↑"
                : "hcp" in orderBy && orderBy.hcp === "desc"
                  ? "HCP høy → lav"
                  : "hcp" in orderBy
                    ? "HCP lav → høy"
                    : "Sist innlogget"}
            </span>
          </div>
          <table className="w-full text-[13px]">
            <thead className="border-b border-border bg-secondary/30 text-left">
              <tr>
                <Th className="w-10"></Th>
                <Th>Spiller</Th>
                <Th>Kat</Th>
                <Th>Tier</Th>
                <Th className="text-right">HCP</Th>
                <Th>Status</Th>
                <Th>Siste økt</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {synlige.map((p) => (
                <PlayerTableRow key={p.id} player={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ----------------- Komponenter -----------------

function PlayerTableRow({
  player,
}: {
  player: PlayerRow & {
    _statusInfo: { status: Status; label: string };
    _category: Category;
  };
}) {
  const p = player;
  const statusStyle: Record<Status, { bg: string; dot: string }> = {
    ok: {
      bg: "bg-[rgba(0,88,64,0.12)] text-primary",
      dot: "bg-primary",
    },
    warn: {
      bg: "bg-[rgba(166,101,30,0.16)] text-[#7a4910]",
      dot: "bg-[#A6651E]",
    },
    dan: {
      bg: "bg-[rgba(239,68,68,0.14)] text-[#b73838]",
      dot: "bg-[#EF4444]",
    },
    ferie: {
      bg: "bg-secondary text-muted-foreground",
      dot: "bg-muted-foreground",
    },
  };

  const hcpDisplay =
    p.hcp !== null ? (p.hcp <= 0 ? `+${Math.abs(p.hcp).toFixed(1).replace(".", ",")}` : p.hcp.toFixed(1).replace(".", ",")) : "—";
  const sistInn = formatSidenDato(p.lastLoginAt);
  const erOver = p._statusInfo.status === "dan";

  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-secondary/30">
      <td className="px-4 py-3">
        <span className="inline-block h-3.5 w-3.5 rounded-sm border border-border bg-card" />
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/admin/elever/${p.id}`}
          className="flex items-center gap-2.5 hover:text-primary"
        >
          <div
            className="grid h-8 w-8 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
            style={{ background: avatarBg(p.name) }}
          >
            {initials(p.name)}
          </div>
          <div className="leading-tight">
            <div className="font-medium text-foreground">{p.name}</div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {p.email}
            </div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${CAT_STYLE[p._category]}`}
        >
          {p._category}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${TIER_STYLE[p.tier]}`}
        >
          {TIER_LABEL[p.tier]}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-mono text-[13px] font-semibold tabular-nums">
        {hcpDisplay}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${statusStyle[p._statusInfo.status].bg}`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${statusStyle[p._statusInfo.status].dot}`}
          />
          {p._statusInfo.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`font-mono text-[12px] ${erOver ? "font-medium text-[#b73838]" : "text-muted-foreground"}`}
        >
          {sistInn}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-muted-foreground">⋯</td>
    </tr>
  );
}

function KpiAccent({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-[#0F2A22] to-[#163027] p-4 text-white">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(209,248,67,0.70)]">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-[rgba(245,244,238,0.7)]">
          {sub}
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  tone?: "warn" | "bad";
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono text-[28px] font-semibold leading-none tabular-nums ${
          tone === "warn"
            ? "text-[#a16808]"
            : tone === "bad"
              ? "text-[#b73838]"
              : "text-foreground"
        }`}
      >
        {value}
        {unit && (
          <span className="ml-1 text-[13px] font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
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

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

// ----------------- Helpers -----------------

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarBg(name: string): string {
  const palette = [
    "linear-gradient(135deg,#005840,#1A7D56)",
    "linear-gradient(135deg,#A6651E,#7A4910)",
    "linear-gradient(135deg,#7A998C,#56796D)",
    "linear-gradient(135deg,#A32D2D,#7C2020)",
    "linear-gradient(135deg,#1A7D56,#005840)",
    "linear-gradient(135deg,#3b5994,#5b7cb8)",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palette[h % palette.length];
}

function formatSidenDato(d: Date | null): string {
  if (!d) return "aldri";
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) {
    if (t < 6) return "i dag";
    return `for ${t} t siden`;
  }
  const dgr = Math.floor(t / 24);
  if (dgr === 1) return "i går";
  if (dgr < 7) return `for ${dgr} d siden`;
  const uker = Math.floor(dgr / 7);
  if (uker < 4) return `for ${uker} uker siden`;
  const mnd = Math.floor(dgr / 30);
  return `for ${mnd} mnd siden`;
}
