/**
 * Drift-panel (/admin/settings) — pixel-port av
 * public/design-handover/agencyos/components-agency-drift.html.
 *
 * Accordion-hub som samler alt operasjonelt (jf. design-prompt Skjerm 4):
 *   TEAM        — coach-rader med presence-dot, rolle-badge (ADMIN lime /
 *                 INSTRUKTØR forest-tint) + capabilities-pills + scope.
 *   PLAN-MALER  — kort-grid med periode-tag + 8 px segmentert pyramide-
 *                 distribusjon (summerer til 100 %) + 5-akse legend.
 * Resten av seksjonene (Innstillinger, Tilgjengelighet, Audit-log, WAGR-
 * import) vises som lukkede accordion-titler — landingens fulle taksonomi.
 *
 * Server component: accordion via native <details>/<summary> (ingen klient-JS).
 * Team + Plan-maler er <details open> som default (design: 2 åpne seksjoner).
 * Ingen hardkodet hex — kun DS-tokens + rå --pyr-*-variabler for axe-fyll.
 * Ingen emoji — kun lucide-react.
 */

import Link from "next/link";
import {
  CalendarClock,
  ChevronRight,
  Clock,
  FileClock,
  Globe,
  LayoutTemplate,
  Plus,
  Settings as SettingsIcon,
  ShieldCheck,
  UserPlus,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DriftAxis,
  DriftData,
  PlanTemplateCard,
  PyramidSeg,
  TeamMember,
} from "@/lib/admin/drift-data";

// ── token-mapper ────────────────────────────────────────────────
const avatarToneClass: Record<TeamMember["avatarTone"], string> = {
  default: "bg-secondary text-foreground",
  primary: "bg-primary text-accent",
  accent: "bg-accent text-primary",
};

const presenceClass: Record<TeamMember["presence"], string> = {
  on: "bg-success",
  busy: "bg-warning",
  off: "bg-muted-foreground",
};

const periodeTagClass: Record<PlanTemplateCard["periode"], string> = {
  grunn: "bg-muted-foreground/10 text-muted-foreground",
  spes: "bg-primary/10 text-success",
  turn: "bg-primary text-accent",
};

const axisSegClass: Record<DriftAxis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const axisDotClass = axisSegClass;

// ── primitiver ──────────────────────────────────────────────────
function MonoEyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Btn({
  children,
  icon: Icon,
  primary,
  href,
}: {
  children: React.ReactNode;
  icon: LucideIcon;
  primary?: boolean;
  href?: string;
}) {
  const inner = (
    <span
      className={cn(
        "inline-flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-full px-[11px] font-mono text-[9px] font-extrabold uppercase tracking-[0.06em]",
        primary
          ? "border border-primary bg-primary text-accent hover:opacity-90"
          : "border border-border bg-card text-foreground hover:bg-secondary",
      )}
    >
      <Icon className="h-2.5 w-2.5 shrink-0" strokeWidth={2} aria-hidden />
      {children}
    </span>
  );
  return href ? (
    <Link href={href}>{inner}</Link>
  ) : (
    <button type="button">{inner}</button>
  );
}

/** Accordion-seksjon som native <details>. */
function Section({
  icon: Icon,
  title,
  sub,
  badge,
  open,
  children,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  badge?: number;
  open?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <details open={open} className="group overflow-hidden rounded-2xl border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-primary/[0.03] [&::-webkit-details-marker]:hidden">
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
          strokeWidth={2}
          aria-hidden
        />
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </span>
        <span className="font-display text-[17px] font-bold leading-tight tracking-[-0.015em] text-foreground">
          {title}
        </span>
        {badge != null && (
          <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-secondary px-[5px] font-mono text-[9px] font-extrabold text-muted-foreground">
            {badge}
          </span>
        )}
        <span className="ml-auto hidden font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground sm:block">
          {sub}
        </span>
      </summary>
      {children && <div className="border-t border-border px-5 pb-5 pt-4">{children}</div>}
    </details>
  );
}

function SubHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      <h3 className="font-display text-base font-bold leading-tight tracking-[-0.015em] text-foreground">
        {title}
      </h3>
      <MonoEyebrow className="font-bold tracking-[0.04em]">{sub}</MonoEyebrow>
      {actions && <div className="ml-auto inline-flex gap-1.5">{actions}</div>}
    </div>
  );
}

// ── TEAM-tabell ─────────────────────────────────────────────────
const teamCols = "grid-cols-[40px_1fr] md:grid-cols-[40px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_64px]";

function TeamRow({ m }: { m: TeamMember }) {
  return (
    <Link
      href={m.href}
      className={cn(
        "grid items-center gap-x-3 gap-y-1 border-b border-border px-4 py-3 last:border-b-0 hover:bg-primary/[0.03]",
        teamCols,
      )}
    >
      {/* avatar + presence */}
      <span className="relative inline-flex h-9 w-9">
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full font-display text-xs font-bold",
            avatarToneClass[m.avatarTone],
          )}
        >
          {m.initials}
        </span>
        <span
          className={cn(
            "absolute bottom-0 right-0 h-[9px] w-[9px] rounded-full border-2 border-card",
            presenceClass[m.presence],
          )}
        />
      </span>

      {/* navn + e-post */}
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-bold tracking-[-0.005em] text-foreground">{m.name}</span>
        <span className="mt-0.5 truncate font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
          {m.email}
        </span>
      </div>

      {/* roller */}
      <div className="hidden flex-wrap items-center gap-1 md:flex">
        <span
          className={cn(
            "inline-flex h-5 items-center rounded-md px-[7px] font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
            m.role === "ADMIN"
              ? "bg-accent text-primary"
              : "bg-primary/10 text-success",
          )}
        >
          {m.roleLabel}
        </span>
      </div>

      {/* capabilities + scope */}
      <div className="hidden min-w-0 flex-col gap-1 md:flex">
        <div className="flex flex-wrap gap-1">
          {m.capabilities.slice(0, 3).map((c) => (
            <span
              key={c}
              className="inline-flex h-4 items-center rounded-[3px] bg-secondary px-1.5 font-mono text-[9px] font-semibold tracking-[0.02em] text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
        <span className="font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{m.scopeMain}</span>
      </div>

      {/* sist sett */}
      <span className="hidden justify-self-end font-mono text-[10px] font-semibold tracking-[0.04em] text-muted-foreground md:block">
        {m.lastSeen}
      </span>
    </Link>
  );
}

function TeamBody({ data }: { data: DriftData }) {
  if (data.team.length === 0) {
    return (
      <>
        <SubHead title="Team" sub="0 medlemmer · CBAC-roller" />
        <div className="rounded-xl border border-dashed border-border bg-background px-4 py-12 text-center">
          <Users className="mx-auto h-7 w-7 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-[13px] text-muted-foreground">Ingen coacher ennå.</p>
          <div className="mt-4 inline-flex">
            <Btn icon={UserPlus} primary href="/admin/team/ny">
              Inviter coach
            </Btn>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SubHead
        title="Team"
        sub={`${data.teamActive} aktive · ${data.teamTotalLabel}`}
        actions={
          <>
            <Btn icon={ShieldCheck} href="/admin/settings/tilgang">
              Roll-matriks
            </Btn>
            <Btn icon={UserPlus} primary href="/admin/team/ny">
              Inviter
            </Btn>
          </>
        }
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div
          className={cn(
            "hidden bg-background px-4 py-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground md:grid md:items-center md:gap-x-3",
            teamCols,
          )}
        >
          <div />
          <div>Coach / e-post</div>
          <div>Roller</div>
          <div>Tilgang / scope</div>
          <div className="justify-self-end">Sist sett</div>
        </div>
        {data.team.map((m) => (
          <TeamRow key={m.id} m={m} />
        ))}
      </div>
    </>
  );
}

// ── PLAN-MALER-grid ─────────────────────────────────────────────
function PyramidBar({ segs }: { segs: PyramidSeg[] }) {
  return (
    <div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {segs.map((s) => (
          <span
            key={s.axis}
            className={cn("h-full", axisSegClass[s.axis])}
            style={{ width: `${s.pct}%` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] font-bold tabular-nums tracking-[0.04em] text-muted-foreground">
        {segs.map((s) => (
          <span key={s.axis} className="inline-flex items-center gap-1">
            <span className={cn("h-1.5 w-1.5 rounded-full", axisDotClass[s.axis])} aria-hidden />
            {s.pct} %
          </span>
        ))}
      </div>
    </div>
  );
}

function TemplateCard({ t }: { t: PlanTemplateCard }) {
  return (
    <Link
      href={t.href}
      className="flex cursor-pointer flex-col gap-2.5 rounded-xl border border-border bg-card p-4 transition-[box-shadow,border-color] duration-150 hover:border-input hover:shadow-md"
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "inline-flex h-[18px] shrink-0 items-center rounded px-[7px] font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
            periodeTagClass[t.periode],
          )}
        >
          {t.periodeLabel}
        </span>
        {t.shared && (
          <span className="ml-auto inline-flex h-4 items-center rounded-[3px] bg-accent px-1.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-primary">
            DELT
          </span>
        )}
      </div>

      <div>
        <div className="font-display text-base font-bold leading-tight tracking-[-0.015em] text-foreground">
          {t.name}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
          {t.meta}
        </div>
      </div>

      <PyramidBar segs={t.segs} />

      <div className="mt-0.5 flex items-center justify-between border-t border-border pt-2.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Users className="h-[11px] w-[11px]" strokeWidth={1.5} aria-hidden />
          <b className="font-bold text-foreground">{t.usageCount}</b>&nbsp;bruk
        </span>
        <span className="truncate">
          REDIGERT <b className="font-bold text-foreground">{t.editedBy}</b>
        </span>
      </div>
    </Link>
  );
}

function TemplatesBody({ data }: { data: DriftData }) {
  return (
    <>
      <SubHead
        title="Plan-maler"
        sub={
          data.templates.length === 0
            ? "Ingen maler ennå"
            : `${data.templatesTotal} maler · sortert på bruk`
        }
        actions={
          <Btn icon={Plus} primary href="/admin/plan-maler/ny">
            Ny mal
          </Btn>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.templates.map((t) => (
          <TemplateCard key={t.id} t={t} />
        ))}

        {/* + Ny mal — dashed lime kort */}
        <Link
          href="/admin/plan-maler/ny"
          className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-accent bg-accent/[0.06] p-4 text-center hover:bg-accent/10"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary">
            <Plus className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </span>
          <div className="font-display text-sm font-bold tracking-[-0.005em] text-primary">Ny mal</div>
          <div className="font-mono text-[10px] tracking-[0.04em] text-primary/70">
            START FRA TOM ELLER DUPLISER
          </div>
        </Link>
      </div>
    </>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function DriftPanel({ data }: { data: DriftData }) {
  return (
    <div className="mx-auto max-w-[1000px]">
      {/* header */}
      <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <MonoEyebrow className="text-muted-foreground">DRIFT</MonoEyebrow>
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
          Innstillinger og team
        </h1>
        <span className="ml-auto font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
          EIER <b className="text-foreground">{data.ownerName}</b> · OPPRETTET{" "}
          <b className="text-foreground">{data.createdLabel}</b>
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <Section
          icon={SettingsIcon}
          title="Innstillinger"
          sub="BRANDING · TIDSSONER · BETALING"
        />

        <Section
          icon={UsersRound}
          title="Team"
          sub="COACHER OG ROLLER"
          badge={data.team.length}
          open
        >
          <TeamBody data={data} />
        </Section>

        <Section
          icon={LayoutTemplate}
          title="Plan-maler"
          sub="SESONG-PLANER PER NIVÅ"
          badge={data.templatesTotal}
          open
        >
          <TemplatesBody data={data} />
        </Section>

        <Section
          icon={CalendarClock}
          title="Tilgjengelighet"
          sub="ARBEIDSTIDER · SPESIELLE PERIODER"
        />

        <Section icon={FileClock} title="Audit-log" sub="ALLE HANDLINGER · SISTE 90 D" />

        <Section icon={Globe} title="WAGR-import" sub="RANKING-DATA FRA WAGR.COM" />
      </div>

      {/* footer-note — andre undersider */}
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-secondary px-4 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        <span className="text-foreground">ANDRE UNDERSIDER</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2 py-1">
          <SettingsIcon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          Branding · varsler
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2 py-1">
          <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          Uke-kalender per coach
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2 py-1">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          Audit · siste 30 d
        </span>
      </div>
    </div>
  );
}
