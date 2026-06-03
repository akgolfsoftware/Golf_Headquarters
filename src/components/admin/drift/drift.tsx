/**
 * AgencyOS · Drift (Innstillinger og team) — presentasjonell, props-drevet.
 *
 * Bygget FRA fasit public/design-handover/_screens/ag-drift.png
 * (kilde-markup: public/design-handover/agencyos/components-agency-drift.html,
 * men fasit-skjermen bruker akkordion-seksjoner i stedet for fane-bar og ekte
 * AK Golf-data). Element-liste, top → bunn:
 *   - Header: eyebrow "DRIFT" + h1 "Innstillinger og team" + meta
 *     "EIER <b>Anders K.</b> · OPPRETTET <b>01.06.2026</b>"
 *   - Akkordion-seksjon "Innstillinger" (gear) — kollapset, meta
 *     "BRANDING · TIDSSONER · BETALING"
 *   - Akkordion-seksjon "Team" [4] (users) — utvidet, meta "COACHER OG ROLLER"
 *       sub-head "Team · 0 aktive · 2 coacher · 2 admin" + Roll-matriks / Inviter
 *       tabell: COACH/E-POST · ROLLER · TILGANG/SCOPE · SIST SETT
 *   - Akkordion-seksjon "Plan-maler" [11] (layout-template) — utvidet, meta
 *     "SESONG-PLANER PER NIVÅ"; sub-head "11 maler · sortert på nivå" + Ny mal
 *       3-kolonne grid av mal-kort + "Ny mal"-kort
 *   - Akkordion-seksjon "Tilgjengelighet" (calendar-clock) — kollapset
 *   - Akkordion-seksjon "Audit-log" (file-clock) — kollapset
 *   - Akkordion-seksjon "WAGR-import" (globe) — kollapset, "RANKING-DATA FRA WAGR.COM"
 *   - Footer "ANDRE UNDERSIDER" med pills
 *
 * INGEN Prisma/DB/auth — kun presentasjon. Farger fra globals.css-tokens
 * (pyramide = --pyr-*-aliaser, badges = accent/primary/success/secondary).
 */

import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  FileClock,
  Globe,
  LayoutTemplate,
  type LucideIcon,
  Plus,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  UsersRound,
} from "lucide-react";

/* ── Typer ─────────────────────────────────────────────────────────────── */

type AvatarTone = "primary" | "lime" | "neutral";
type RolePill = "admin" | "instruktor";
type Presence = "on" | "busy" | "off";

export type TeamMember = {
  id: string;
  initials: string;
  avatarTone: AvatarTone;
  presence: Presence;
  name: string;
  email: string;
  role: { label: string; kind: RolePill };
  /** Tilgangs-/scope-chips, f.eks. coach.* / admin.team / admin.billing. */
  scopes: string[];
  /** Linje under chips, f.eks. "Full tilgang · alle grupper" eller "2 grupper". */
  scopeNote: string;
  seen: string;
  href?: string;
};

/** Pyramide-distribusjon i fast 5-akse-rekkefølge (sum = 100). */
export type PyramidDist = {
  fys: number;
  tek: number;
  slag: number;
  spill: number;
  turn: number;
};

type PeriodeTag = "grunn" | "spes" | "turn" | "skade" | "test";

export type PlanTemplate = {
  id: string;
  periode: { label: string; kind: PeriodeTag };
  shared?: boolean;
  name: string;
  /** Mono meta-linje, f.eks. "4 UKER · 3 ØKTER/UKE · KAT. L". */
  meta: string;
  dist: PyramidDist;
  uses: number;
  editedBy: string;
  href?: string;
};

export type DriftData = {
  eyebrow: string;
  title: string;
  ownerName: string;
  createdAt: string;

  team: {
    memberCount: number;
    summary: string;
    members: TeamMember[];
    rollMatrixHref?: string;
    inviteHref?: string;
  };

  templates: {
    count: number;
    summary: string;
    items: PlanTemplate[];
    importHref?: string;
    newHref?: string;
  };

  settingsHref?: string;
  availabilityHref?: string;
  auditHref?: string;
  wagrHref?: string;
};

/* ── Små presentasjons-primitiver ──────────────────────────────────────── */

/** Seksjon-skille med mono-label og hårlinje (matcher .sec i kilde-markup). */
function MicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      <span>{children}</span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

function presenceClass(p: Presence): string {
  if (p === "on") return "bg-success";
  if (p === "busy") return "bg-warning";
  return "bg-muted-foreground";
}

function avatarClass(tone: AvatarTone): string {
  if (tone === "primary") return "bg-primary text-accent";
  if (tone === "lime") return "bg-accent text-primary";
  return "bg-secondary text-foreground";
}

function Avatar({
  initials,
  tone,
  presence,
}: {
  initials: string;
  tone: AvatarTone;
  presence: Presence;
}) {
  return (
    <span
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full font-display text-xs font-bold ${avatarClass(
        tone,
      )}`}
    >
      {initials}
      <span
        aria-hidden
        className={`absolute bottom-0 right-0 h-[9px] w-[9px] rounded-full ring-2 ring-card ${presenceClass(
          presence,
        )}`}
      />
    </span>
  );
}

/** Akkordion-pille-knapp (utvid/kollaps). I preview er state statisk. */
function btnClass(primary?: boolean): string {
  return [
    "inline-flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-full px-2.5",
    "font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] transition-colors",
    primary
      ? "border border-primary bg-primary text-accent hover:bg-[var(--color-brand-primary-hover)]"
      : "border border-border bg-card text-foreground hover:bg-secondary",
  ].join(" ");
}

/* ── Akkordion-seksjon ─────────────────────────────────────────────────── */

function AccordionHeader({
  icon: Icon,
  title,
  count,
  meta,
  open,
}: {
  icon: LucideIcon;
  title: string;
  count?: number;
  meta: string;
  open: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
      {open ? (
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
      )}
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="font-display text-lg font-bold tracking-[-0.015em] text-foreground">
        {title}
      </span>
      {typeof count === "number" && (
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-secondary px-1.5 font-mono text-[10px] font-bold text-muted-foreground">
          {count}
        </span>
      )}
      <span className="ml-auto hidden font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground sm:inline">
        {meta}
      </span>
    </div>
  );
}

function CollapsedSection({
  icon,
  title,
  meta,
  href,
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
  href?: string;
}) {
  const body = (
    <AccordionHeader icon={icon} title={title} meta={meta} open={false} />
  );
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-card">
      {href ? (
        <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

/* ── Team-tabell ───────────────────────────────────────────────────────── */

function RolePillBadge({ label, kind }: { label: string; kind: RolePill }) {
  const cls =
    kind === "admin"
      ? "bg-accent text-primary"
      : "bg-success/12 text-success";
  return (
    <span
      className={`inline-flex h-[22px] items-center rounded-full px-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${cls}`}
    >
      {label}
    </span>
  );
}

function ScopeChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[22px] items-center rounded-md bg-secondary px-2 font-mono text-[10px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function TeamRow({ m }: { m: TeamMember }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-3 border-b border-border px-4 py-4 last:border-b-0 hover:bg-[rgba(0,88,64,0.03)] md:grid-cols-[44px_minmax(0,1fr)_140px_minmax(0,1fr)_64px] md:items-center sm:px-5">
      {/* Avatar */}
      <div className="row-span-2 md:row-span-1">
        <Avatar initials={m.initials} tone={m.avatarTone} presence={m.presence} />
      </div>

      {/* Navn + e-post */}
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-bold tracking-[-0.005em] text-foreground">
          {m.name}
        </span>
        <span className="mt-0.5 truncate font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
          {m.email}
        </span>
      </div>

      {/* Roller */}
      <div className="col-start-2 md:col-start-auto">
        <RolePillBadge label={m.role.label} kind={m.role.kind} />
      </div>

      {/* Tilgang / scope */}
      <div className="col-start-2 min-w-0 md:col-start-auto">
        <div className="flex flex-wrap gap-1.5">
          {m.scopes.map((s) => (
            <ScopeChip key={s}>{s}</ScopeChip>
          ))}
        </div>
        <div className="mt-2 font-mono text-[10px] leading-snug tracking-[0.02em] text-muted-foreground">
          {m.scopeNote}
        </div>
      </div>

      {/* Sist sett */}
      <div className="col-start-2 font-mono text-[10px] tracking-[0.04em] text-muted-foreground md:col-start-auto md:text-right">
        {m.seen}
      </div>
    </div>
  );
}

function TeamSection({ team }: { team: DriftData["team"] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <AccordionHeader
        icon={UsersRound}
        title="Team"
        count={team.memberCount}
        meta="COACHER OG ROLLER"
        open
      />
      <div className="border-t border-border bg-[var(--color-surface-alt)] px-4 py-4 sm:px-5 sm:py-5">
        {/* Sub-head */}
        <div className="mb-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-2">
          <h3 className="font-display text-base font-bold tracking-[-0.015em] text-foreground">
            Team
          </h3>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {team.summary}
          </span>
          <div className="ml-auto inline-flex gap-1.5">
            <Link href={team.rollMatrixHref ?? "#"} className={btnClass()}>
              <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2.25} aria-hidden />
              Roll-matriks
            </Link>
            <Link href={team.inviteHref ?? "#"} className={btnClass(true)}>
              <Plus className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
              Inviter
            </Link>
          </div>
        </div>

        {/* Tabell */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Kolonne-header (kun desktop) */}
          <div className="hidden grid-cols-[44px_minmax(0,1fr)_140px_minmax(0,1fr)_64px] gap-x-4 border-b border-border bg-[var(--color-surface-alt)] px-5 py-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground md:grid">
            <div />
            <div>Coach / e-post</div>
            <div>Roller</div>
            <div>Tilgang / scope</div>
            <div className="text-right">Sist sett</div>
          </div>
          {team.members.map((m) => (
            <TeamRow key={m.id} m={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Plan-mal-kort ─────────────────────────────────────────────────────── */

function periodeTagClass(kind: PeriodeTag): string {
  switch (kind) {
    case "grunn":
      return "bg-secondary text-muted-foreground";
    case "spes":
      return "bg-success/10 text-success";
    case "turn":
      return "bg-primary text-accent";
    case "skade":
      return "bg-destructive/10 text-destructive";
    case "test":
      return "bg-info/10 text-info";
  }
}

const PYR_AXES: { key: keyof PyramidDist; bar: string; dot: string }[] = [
  { key: "fys", bar: "bg-pyr-fys", dot: "bg-pyr-fys" },
  { key: "tek", bar: "bg-pyr-tek", dot: "bg-pyr-tek" },
  { key: "slag", bar: "bg-pyr-slag", dot: "bg-pyr-slag" },
  { key: "spill", bar: "bg-pyr-spill", dot: "bg-pyr-spill" },
  { key: "turn", bar: "bg-pyr-turn", dot: "bg-pyr-turn" },
];

function PyramidRow({ dist }: { dist: PyramidDist }) {
  return (
    <div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {PYR_AXES.map(({ key, bar }) =>
          dist[key] > 0 ? (
            <span key={key} className={`${bar} rounded-sm`} style={{ width: `${dist[key]}%` }} />
          ) : null,
        )}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] font-bold tracking-[0.04em] tabular-nums text-muted-foreground">
        {PYR_AXES.map(({ key, dot }) => (
          <span key={key} className="inline-flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
            {dist[key]} %
          </span>
        ))}
      </div>
    </div>
  );
}

function PlanTemplateCard({ t }: { t: PlanTemplate }) {
  return (
    <Link
      href={t.href ?? "#"}
      className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 transition-[box-shadow,border-color] duration-150 hover:border-muted-foreground/25 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Top: periode-tag + valgfri DELT */}
      <div className="flex items-start gap-2.5">
        <span
          className={`inline-flex h-[18px] items-center rounded px-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${periodeTagClass(
            t.periode.kind,
          )}`}
        >
          {t.periode.label}
        </span>
        {t.shared && (
          <span className="ml-auto inline-flex h-[18px] items-center rounded bg-accent px-1.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-primary">
            Delt
          </span>
        )}
      </div>

      {/* Navn + meta */}
      <div>
        <div className="font-display text-base font-bold leading-tight tracking-[-0.015em] text-foreground">
          {t.name}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
          {t.meta}
        </div>
      </div>

      {/* Pyramide */}
      <PyramidRow dist={t.dist} />

      {/* Footer */}
      <div className="mt-0.5 flex items-center justify-between border-t border-border pt-2.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Users className="h-[11px] w-[11px]" strokeWidth={1.75} aria-hidden />
          <b className="font-bold text-foreground">{t.uses}</b> bruk
        </span>
        <span>
          REDIGERT <b className="font-bold text-foreground">{t.editedBy}</b>
        </span>
      </div>
    </Link>
  );
}

function NewTemplateCard({ href }: { href?: string }) {
  return (
    <Link
      href={href ?? "#"}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-accent bg-accent/[0.06] p-4 text-center transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary">
        <Plus className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
      </span>
      <span className="font-display text-sm font-bold tracking-[-0.005em] text-primary">
        Ny mal
      </span>
      <span className="font-mono text-[10px] tracking-[0.04em] text-primary/70">
        START FRA TOM ELLER DUPLISER
      </span>
    </Link>
  );
}

function TemplatesSection({ templates }: { templates: DriftData["templates"] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <AccordionHeader
        icon={LayoutTemplate}
        title="Plan-maler"
        count={templates.count}
        meta="SESONG-PLANER PER NIVÅ"
        open
      />
      <div className="border-t border-border bg-[var(--color-surface-alt)] px-4 py-4 sm:px-5 sm:py-5">
        {/* Sub-head */}
        <div className="mb-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-2">
          <h3 className="font-display text-base font-bold tracking-[-0.015em] text-foreground">
            Plan-maler
          </h3>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {templates.summary}
          </span>
          <div className="ml-auto inline-flex gap-1.5">
            <Link href={templates.importHref ?? "#"} className={btnClass()}>
              <Upload className="h-2.5 w-2.5" strokeWidth={2.25} aria-hidden />
              Importer
            </Link>
            <Link href={templates.newHref ?? "#"} className={btnClass(true)}>
              <Plus className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
              Ny mal
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.items.map((t) => (
            <PlanTemplateCard key={t.id} t={t} />
          ))}
          <NewTemplateCard href={templates.newHref} />
        </div>
      </div>
    </div>
  );
}

/* ── Footer "Andre undersider" ─────────────────────────────────────────── */

function OtherTabs() {
  const items: { icon: LucideIcon; label: string }[] = [
    { icon: Settings, label: "Branding · varsler" },
    { icon: Clock, label: "Uke-kalender per coach" },
    { icon: FileClock, label: "Audit · siste 30 d" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3.5 rounded-[10px] bg-secondary px-4 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
      <span className="font-extrabold text-foreground">Andre undersider</span>
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full bg-card px-2 py-1"
        >
          <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

/* ── Hoved-komponent ───────────────────────────────────────────────────── */

export function Drift({ data }: { data: DriftData }) {
  return (
    <div className="mx-auto w-full max-w-[1240px]">
      <MicroLabel>AgencyOS · drift</MicroLabel>

      {/* Header */}
      <header className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {data.eyebrow}
        </span>
        <h1 className="font-display text-[22px] font-bold tracking-[-0.02em] text-foreground sm:text-2xl">
          {data.title}
        </h1>
        <span className="ml-auto font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
          EIER <b className="font-bold text-foreground">{data.ownerName}</b> · OPPRETTET{" "}
          <b className="font-bold text-foreground">{data.createdAt}</b>
        </span>
      </header>

      <div className="space-y-3">
        <CollapsedSection
          icon={Settings}
          title="Innstillinger"
          meta="BRANDING · TIDSSONER · BETALING"
          href={data.settingsHref}
        />

        <TeamSection team={data.team} />

        <TemplatesSection templates={data.templates} />

        <CollapsedSection
          icon={Clock}
          title="Tilgjengelighet"
          meta="ARBEIDSTIDER · SPESIELLE PERIODER"
          href={data.availabilityHref}
        />
        <CollapsedSection
          icon={FileClock}
          title="Audit-log"
          meta="ALLE HANDLINGER · SISTE 90 D"
          href={data.auditHref}
        />
        <CollapsedSection
          icon={Globe}
          title="WAGR-import"
          meta="RANKING-DATA FRA WAGR.COM"
          href={data.wagrHref}
        />
      </div>

      <div className="mt-5">
        <OtherTabs />
      </div>
    </div>
  );
}
