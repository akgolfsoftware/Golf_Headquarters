/**
 * CoachHQ — Elever (spillerliste)
 * Produksjons-design migrert fra /elever-demo.
 *
 * Datakilde: Prisma. Henter alle PLAYER-brukere med aggregert statistikk
 * (runder, tester, aktive planer, siste innlogging, klubb og tier).
 *
 * Designet matcher demo-fila 1:1 — KPI-strip, filter-bar, tabell, side-rail.
 */

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Download,
  Filter,
  ListFilter,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
// leggTilSpiller importeres når "Ny spiller"-modalen kobles på
// import { leggTilSpiller } from "./actions";

type Search = { tier?: string; q?: string; status?: string; sort?: string };

type Status = "ok" | "warn" | "dan" | "ferie";

type PlayerWithCount = {
  id: string;
  name: string;
  email: string;
  hcp: number | null;
  tier: "GRATIS" | "PRO" | "ELITE";
  homeClub: string | null;
  lastLoginAt: Date | null;
  _count: {
    rounds: number;
    testResults: number;
    trainingPlans: number;
  };
  groupMemberships: { group: { name: string } }[];
};

export default async function ElverListe({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;

  const where: {
    role: "PLAYER";
    tier?: "GRATIS" | "PRO" | "ELITE";
    OR?: {
      name?: { contains: string; mode: "insensitive" };
      email?: { contains: string; mode: "insensitive" };
    }[];
  } = { role: "PLAYER" };

  if (params.tier === "GRATIS" || params.tier === "PRO") where.tier = params.tier;
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

  const players = playersRaw as PlayerWithCount[];

  // Status-beregning per spiller basert på siste innlogging.
  // ok: < 3 dgr, warn: 3–7 dgr, dan: > 7 dgr, ferie: tier=GRATIS uten plan og inaktiv
  const naa = Date.now();
  const dgrSiden = (d: Date | null) =>
    d ? Math.floor((naa - d.getTime()) / (1000 * 60 * 60 * 24)) : 999;

  const beregnStatus = (p: PlayerWithCount): { status: Status; label: string } => {
    const d = dgrSiden(p.lastLoginAt);
    if (d > 10 && p._count.trainingPlans === 0) return { status: "dan", label: "Inaktiv" };
    if (d > 7) return { status: "dan", label: "Inaktiv" };
    if (d >= 3) return { status: "warn", label: "Forsinket" };
    return { status: "ok", label: "På plan" };
  };

  // Filter på status hvis valgt
  const statusFilter = params.status as Status | "alle" | undefined;
  const synlige = players
    .map((p) => ({ ...p, _statusInfo: beregnStatus(p) }))
    .filter((p) => {
      if (!statusFilter || statusFilter === "alle") return true;
      return p._statusInfo.status === statusFilter;
    });

  // KPI-beregninger
  const total = players.length;
  const aktiveDenneUka = players.filter((p) => dgrSiden(p.lastLoginAt) <= 7).length;
  const snittHcp =
    players.filter((p) => p.hcp != null).length > 0
      ? players
          .filter((p) => p.hcp != null)
          .reduce((acc, p) => acc + (p.hcp ?? 0), 0) /
        players.filter((p) => p.hcp != null).length
      : null;
  const paaPlan = players.filter((p) => beregnStatus(p).status === "ok").length;
  const trengerOppfolging = players.filter((p) => {
    const s = beregnStatus(p).status;
    return s === "warn" || s === "dan";
  }).length;
  const proCount = players.filter((p) => p.tier === "PRO").length;
  const gratisCount = players.filter((p) => p.tier === "GRATIS").length;
  const proPct = total > 0 ? Math.round((proCount / total) * 100) : 0;
  const gratisPct = total > 0 ? 100 - proPct : 0;

  // Status-tellinger for chip-pills
  const stOk = players.filter((p) => beregnStatus(p).status === "ok").length;
  const stWarn = players.filter((p) => beregnStatus(p).status === "warn").length;
  const stDan = players.filter((p) => beregnStatus(p).status === "dan").length;
  const stFerie = players.filter((p) => beregnStatus(p).status === "ferie").length;

  // Oppfølging-rail (3-4 spillere som trenger oppmerksomhet)
  const oppfolging = players
    .map((p) => ({ p, info: beregnStatus(p), d: dgrSiden(p.lastLoginAt) }))
    .filter((x) => x.info.status === "warn" || x.info.status === "dan")
    .sort((a, b) => b.d - a.d)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Spillere"
        titleLead="Mine"
        titleItalic="elever"
        sub={`${total} spillere registrert · ${aktiveDenneUka} aktive denne uka`}
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Download size={14} strokeWidth={1.5} />
              Eksport
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <UserPlus size={14} strokeWidth={1.5} />
              Inviter
            </button>
            <NySpillerButton />
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid gap-3.5 grid-cols-[1.4fr_1fr_1fr_1fr]">
        <KpiFeature
          label="Aktive spillere"
          value={String(total)}
          delta={`${aktiveDenneUka} aktive denne uka`}
        />
        <Kpi
          label="Snitt-HCP"
          value={snittHcp != null ? snittHcp.toFixed(1).replace(".", ",") : "—"}
          delta={total > 0 ? `${players.filter((p) => p.hcp != null).length} av ${total} har HCP` : "Ingen data"}
          deltaTone="good"
          deltaDown
        />
        <Kpi
          label="På plan"
          value={String(paaPlan)}
          suffix={`/ ${total}`}
          delta={total > 0 ? `${Math.round((paaPlan / total) * 100)} % compliance` : "—"}
        />
        <Kpi
          label="Trenger oppfølging"
          value={String(trengerOppfolging)}
          valueTone={trengerOppfolging > 0 ? "warning" : undefined}
          delta={trengerOppfolging > 0 ? "Krever handling" : "Alt under kontroll"}
          deltaTone={trengerOppfolging > 0 ? "bad" : undefined}
        />
      </div>

      {/* Filter */}
      <form className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.5} />
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Søk på navn, klubb, e-post…"
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <span className="rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </span>
        </label>
        <StatusChip name="alle" current={statusFilter} count={total} label="Alle" preserveQ={params.q} preserveSort={params.sort} />
        <StatusChip name="ok" current={statusFilter} count={stOk} label="På plan" preserveQ={params.q} preserveSort={params.sort} />
        <StatusChip name="warn" current={statusFilter} count={stWarn} label="Forsinket" preserveQ={params.q} preserveSort={params.sort} />
        <StatusChip name="dan" current={statusFilter} count={stDan} label="Inaktiv" preserveQ={params.q} preserveSort={params.sort} />
        <StatusChip name="ferie" current={statusFilter} count={stFerie} label="Ferie" preserveQ={params.q} preserveSort={params.sort} />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-secondary"
          aria-label="Anvend filter"
        >
          <Filter size={14} strokeWidth={1.5} />
        </button>
      </form>

      {/* Body grid */}
      {total === 0 ? (
        <EmptyState
          icon={Users}
          titleItalic="Ingen spillere"
          titleTrail="registrert ennå"
          sub="Legg til din første spiller for å komme i gang. Du kan invitere via e-post eller opprette manuelt."
          cta={<NySpillerButton variant="cta" />}
        />
      ) : (
        <div className="grid grid-cols-[1fr_340px] items-start gap-5">
          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2.5 text-[12px]">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <span className="inline-block h-3.5 w-3.5 rounded-sm border border-border bg-card" />
                <span>
                  Viser <b className="font-medium text-foreground">{synlige.length} av {total}</b> spillere
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] hover:text-foreground"
                >
                  Sorter:{" "}
                  <span className="font-medium text-foreground">
                    {"name" in orderBy
                      ? "Navn, A–Å"
                      : "hcp" in orderBy && orderBy.hcp === "desc"
                        ? "HCP, høy til lav"
                        : "hcp" in orderBy
                          ? "HCP, lav til høy"
                          : "Sist innlogget"}
                  </span>
                  <ChevronDown size={12} strokeWidth={1.5} />
                </button>
                <span className="h-4 w-px bg-border" />
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] hover:text-foreground"
                >
                  <ListFilter size={13} strokeWidth={1.5} />
                  Kolonner
                </button>
              </div>
            </div>

            {/* Header row */}
            <div className="grid grid-cols-[32px_1.6fr_90px_70px_120px_110px_110px_80px] gap-3 border-b border-border px-4 py-2.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              <span />
              <span>Spiller</span>
              <span className="text-right">HCP</span>
              <span>Tier</span>
              <span>Pyramide-fokus</span>
              <span>Sist økt</span>
              <span>Status</span>
              <span className="text-right">Handling</span>
            </div>

            {synlige.map((p) => (
              <PlayerRow key={p.id} player={p} />
            ))}
          </div>

          {/* Side-rail */}
          <aside className="flex flex-col gap-4">
            <section className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Trenger oppfølging
                </h3>
                <span className="rounded-full bg-[rgba(184,133,42,0.12)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#7d5814]">
                  {trengerOppfolging}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">
                Spillere som har sklidd unna programmet eller mangler kontakt &gt; 5 dager.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {oppfolging.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground">
                    Ingen krever oppfølging akkurat nå.
                  </p>
                ) : (
                  oppfolging.map((x) => (
                    <Link
                      key={x.p.id}
                      href={`/admin/elever/${x.p.id}`}
                      className="grid grid-cols-[28px_1fr_auto] items-start gap-2.5 rounded-md border border-border bg-background p-2.5 transition-colors hover:bg-secondary"
                    >
                      <div
                        className="grid h-7 w-7 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
                        style={{ background: avatarBg(x.p.name) }}
                      >
                        {initials(x.p.name)}
                      </div>
                      <div className="text-[12px] leading-snug">
                        <div className="font-medium text-foreground">{x.p.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {x.info.status === "dan"
                            ? `Inaktiv ${x.d} dgr. ${x.p._count.trainingPlans === 0 ? "Mangler aktiv plan." : ""}`
                            : `Forsinket ${x.d} dgr siden siste innlogging.`}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {x.d}d
                      </span>
                    </Link>
                  ))
                )}
              </div>
              {trengerOppfolging > oppfolging.length && (
                <Link
                  href={`/admin/elever?status=warn`}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary"
                >
                  Se alle {trengerOppfolging}
                  <ArrowUpRight size={13} strokeWidth={1.5} />
                </Link>
              )}
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Tier-fordeling
                </h3>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {total} totalt
                </span>
              </div>
              <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-border">
                <span className="bg-primary" style={{ width: `${proPct}%` }} />
                <span className="bg-muted-foreground" style={{ width: `${gratisPct}%` }} />
              </div>
              <div className="mt-3 flex flex-col gap-1.5 text-[12px]">
                <LegendRow color="var(--color-primary)" name="Pro" count={String(proCount)} pct={`${proPct} %`} />
                <LegendRow
                  color="var(--color-muted-foreground)"
                  name="Gratis"
                  count={String(gratisCount)}
                  pct={`${gratisPct} %`}
                />
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

// ----------------- Komponenter -----------------

function NySpillerButton({ variant = "header" }: { variant?: "header" | "cta" }) {
  const cls =
    variant === "cta"
      ? "inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      : "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90";
  // MVP: knappen er en placeholder for et fremtidig "Ny spiller"-skjema/modal.
  // Server action `leggTilSpiller` i actions.ts er klar for når modalen kobles på.
  return (
    <button type="button" className={cls}>
      <Plus size={variant === "cta" ? 16 : 14} strokeWidth={1.5} />
      Ny spiller
    </button>
  );
}

function StatusChip({
  name,
  current,
  count,
  label,
  preserveQ,
  preserveSort,
}: {
  name: "alle" | "ok" | "warn" | "dan" | "ferie";
  current?: string;
  count: number;
  label: string;
  preserveQ?: string;
  preserveSort?: string;
}) {
  const active = (current ?? "alle") === name;
  const params = new URLSearchParams();
  if (name !== "alle") params.set("status", name);
  if (preserveQ) params.set("q", preserveQ);
  if (preserveSort) params.set("sort", preserveSort);
  const href = `/admin/elever${params.toString() ? `?${params.toString()}` : ""}`;
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <span className="font-mono text-[10px] font-semibold tabular-nums opacity-70">
        {count}
      </span>
    </Link>
  );
}

function KpiFeature({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-[#1A1916] to-[#2a2823] p-4 text-white">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-white/55">
        {label}
      </div>
      <div className="font-display text-[32px] font-medium leading-none tracking-tight">
        {value}
      </div>
      <div className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.02em] text-[#D1F843]">
        <ArrowUpRight size={11} strokeWidth={1.5} />
        {delta}
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  suffix,
  delta,
  deltaTone,
  deltaDown,
  valueTone,
}: {
  label: string;
  value: string;
  suffix?: string;
  delta: string;
  deltaTone?: "good" | "bad";
  deltaDown?: boolean;
  valueTone?: "warning";
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-display text-[32px] font-medium leading-none tracking-tight ${
          valueTone === "warning" ? "text-[#B8852A]" : "text-foreground"
        }`}
      >
        {value}
        {suffix && (
          <span className="ml-1.5 font-sans text-[14px] font-normal text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      <div
        className={`inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.02em] ${
          deltaTone === "good"
            ? "text-[#1A7D56]"
            : deltaTone === "bad"
              ? "text-[#A32D2D]"
              : "text-muted-foreground"
        }`}
      >
        {deltaTone === "good" && deltaDown ? (
          <ArrowDownRight size={11} strokeWidth={1.5} />
        ) : deltaTone === "bad" ? (
          <ArrowUpRight size={11} strokeWidth={1.5} />
        ) : null}
        {delta}
      </div>
    </div>
  );
}

function PlayerRow({
  player,
}: {
  player: PlayerWithCount & { _statusInfo: { status: Status; label: string } };
}) {
  const p = player;
  const tierStyle: Record<"PRO" | "GRATIS" | "ELITE", string> = {
    PRO: "bg-primary/10 text-primary",
    GRATIS: "bg-secondary text-muted-foreground",
    ELITE: "bg-accent/30 text-accent-foreground",
  };
  const pillStyle: Record<Status, string> = {
    ok: "bg-[rgba(45,107,76,0.12)] text-[#1A7D56]",
    warn: "bg-[rgba(184,133,42,0.12)] text-[#7d5814]",
    dan: "bg-[rgba(176,68,68,0.10)] text-[#A32D2D]",
    ferie: "bg-secondary text-muted-foreground",
  };
  const dotColor: Record<Status, string> = {
    ok: "bg-[#1A7D56]",
    warn: "bg-[#B8852A]",
    dan: "bg-[#A32D2D]",
    ferie: "bg-muted-foreground",
  };
  const pyrColors = ["#005840", "#1A7D56", "#D1F843", "#B8852A", "#5E5C57"];

  // Pyramide-fokus: deriveres fra antall runder/tester/planer som proxy.
  // Liten visualisering med 5 bars (FYS/TEK/SLAG/SPILL/TURN).
  const pyr = derivePyr(p);

  // Klubb og gruppe-meta
  const gruppe = p.groupMemberships[0]?.group.name;
  const meta = [
    p.homeClub ?? null,
    gruppe ?? null,
    `${p._count.rounds + p._count.testResults} aktiviteter`,
  ]
    .filter(Boolean)
    .join(" · ");

  // HCP-delta — vi har ikke historikk i denne foundation-fasen, så vis "—"
  const hcpDisplay = p.hcp != null ? p.hcp.toFixed(1).replace(".", ",") : "—";

  // Sist innlogget — relativ formattering
  const sistInn = formatSidenDato(p.lastLoginAt);

  const tierLabel = p.tier === "PRO" ? "Pro" : p.tier === "ELITE" ? "Elite" : "Gratis";
  const tierDot =
    p.tier === "PRO"
      ? "bg-primary"
      : p.tier === "ELITE"
        ? "bg-accent"
        : "bg-muted-foreground";

  return (
    <Link
      href={`/admin/elever/${p.id}`}
      className="grid cursor-pointer grid-cols-[32px_1.6fr_90px_70px_120px_110px_110px_80px] items-center gap-3 border-b border-border px-4 py-3 text-[12px] last:border-b-0 hover:bg-secondary/40"
    >
      <span className="inline-block h-3.5 w-3.5 rounded-sm border border-border bg-card" />
      <div className="flex items-center gap-2.5">
        <div
          className="grid h-8 w-8 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
          style={{ background: avatarBg(p.name) }}
        >
          {initials(p.name)}
        </div>
        <div className="leading-tight">
          <div className="font-medium text-foreground">{p.name}</div>
          <div className="font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
            {meta || p.email}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[13px] font-semibold tabular-nums">{hcpDisplay}</div>
        <div className="font-mono text-[10px] font-medium text-muted-foreground">—</div>
      </div>
      <div>
        <span
          className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em] ${tierStyle[p.tier]}`}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${tierDot}`} />
          {tierLabel}
        </span>
      </div>
      <div className="flex items-end gap-1">
        {pyr.map((h, i) => (
          <span
            key={i}
            className="block w-2.5 rounded-[2px]"
            style={{ background: pyrColors[i], height: `${h}px` }}
          />
        ))}
      </div>
      <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
        {sistInn}
      </div>
      <div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${pillStyle[p._statusInfo.status]}`}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor[p._statusInfo.status]}`} />
          {p._statusInfo.label}
        </span>
      </div>
      <div className="flex justify-end gap-1">
        <span
          className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card text-muted-foreground"
          aria-label="Send melding"
        >
          <MessageCircle size={13} strokeWidth={1.5} />
        </span>
        <span
          className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card text-muted-foreground"
          aria-label="Mer"
        >
          <MoreHorizontal size={13} strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}

function LegendRow({
  color,
  name,
  count,
  pct,
}: {
  color: string;
  name: string;
  count: string;
  pct: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      <span className="flex-1 text-foreground">{name}</span>
      <span className="font-mono text-[11px] tabular-nums text-foreground">{count}</span>
      <span className="w-12 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
        {pct}
      </span>
    </div>
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
  // Deterministisk farge basert på navn-hash
  const palette = [
    "#005840",
    "#1A7D56",
    "#B8852A",
    "#A32D2D",
    "#5E5C57",
    "#3a5d8a",
    "#7d4f9a",
    "#2c4a6b",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palette[h % palette.length];
}

function derivePyr(p: PlayerWithCount): number[] {
  // Lite visuelt — bruker antall planer/runder/tester som proxy for "aktivitet"
  // og fyller 5 bars med stigende verdier basert på data.
  const a = Math.min(20, 6 + p._count.trainingPlans * 4);
  const b = Math.min(20, 4 + p._count.rounds);
  const c = Math.min(20, 2 + p._count.testResults * 3);
  const d = Math.max(2, Math.min(20, a - 4));
  const e = Math.max(2, Math.min(20, b - 4));
  return [a, b, c, d, e];
}

function formatSidenDato(d: Date | null): string {
  if (!d) return "aldri";
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) return `${t} t siden`;
  const dgr = Math.floor(t / 24);
  if (dgr === 1) return "i går";
  if (dgr < 7) return `${dgr} dgr`;
  const uker = Math.floor(dgr / 7);
  if (uker < 4) return `${uker} uker`;
  const mnd = Math.floor(dgr / 30);
  return `${mnd} mnd`;
}
