import {
  Bot,
  ChevronDown,
  Download,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CopyButton } from "@/components/shared/copy-button";

type Search = { action?: string; actor?: string };

type EvtType = "create" | "update" | "delete" | "auth" | "agent" | "auth-fail";

type Evt = {
  id: string;
  time: string;
  type: EvtType;
  title: React.ReactNode;
  meta: string[];
};

function actionToType(action: string): EvtType {
  const a = action.toLowerCase();
  if (a.includes("auth.fail") || a.includes("login.fail")) return "auth-fail";
  if (a.includes("auth") || a.includes("login")) return "auth";
  if (a.includes("agent")) return "agent";
  if (a.includes("delete") || a.includes("slett")) return "delete";
  if (a.includes("create") || a.includes("opprett")) return "create";
  return "update";
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  if (user.role !== "ADMIN") {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="CoachHQ · Revisjonslogg"
          titleItalic="Audit"
          titleTrail="-logg"
          sub="Krever ADMIN-tilgang."
        />
        <EmptyState
          icon={ShieldOff}
          titleItalic="Kun for"
          titleTrail="administratorer"
          sub="Audit-logg er kun tilgjengelig for ADMIN-rollen."
        />
      </div>
    );
  }

  const params = await searchParams;
  const where: { action?: { contains: string }; actorId?: string } = {};
  if (params.action) where.action = { contains: params.action };
  if (params.actor) where.actorId = params.actor;

  const sjuDager = new Date();
  sjuDager.setDate(sjuDager.getDate() - 7);

  const [logs, total7d, totalForrigeUke, aktoerer, deletes, authFails] =
    await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.auditLog.count({ where: { createdAt: { gte: sjuDager } } }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(sjuDager.getTime() - 7 * 24 * 60 * 60 * 1000),
            lt: sjuDager,
          },
        },
      }),
      prisma.auditLog.groupBy({
        by: ["actorId"],
        where: { createdAt: { gte: sjuDager } },
        _count: { _all: true },
        orderBy: { _count: { actorId: "desc" } },
        take: 5,
      }),
      prisma.auditLog.count({
        where: {
          action: { contains: "delete" },
          createdAt: { gte: sjuDager },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: { contains: "auth.fail" },
          createdAt: { gte: sjuDager },
        },
      }),
    ]);

  const aktoerNavn = await prisma.user.findMany({
    where: {
      id: {
        in: aktoerer
          .map((a) => a.actorId)
          .filter((id): id is string => id !== null),
      },
    },
    select: { id: true, name: true },
  });

  const navnById = new Map(aktoerNavn.map((u) => [u.id, u.name]));

  const deltaPct =
    totalForrigeUke > 0
      ? ((total7d - totalForrigeUke) / totalForrigeUke) * 100
      : 0;

  // Grupper hendelser per dato
  const grupper = new Map<string, Evt[]>();
  for (const l of logs) {
    const dato = l.createdAt.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const tid = l.createdAt.toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const type = actionToType(l.action);
    const evt: Evt = {
      id: l.id,
      time: tid,
      type,
      title: (
        <>
          <b>{l.actor?.name ?? "System"}</b> · <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">{l.action}</code>
          {l.target ? <> · <span className="font-mono text-xs text-muted-foreground">{l.target}</span></> : null}
        </>
      ),
      meta: [`req: ${l.id.slice(0, 8)}`],
    };
    const arr = grupper.get(dato) ?? [];
    arr.push(evt);
    grupper.set(dato, arr);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* Hero */}
        <header className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              CoachHQ · Sikkerhet · Capability audit.read
            </div>
            <h1 className="mt-2 font-display text-[36px] italic leading-[1.1] tracking-tight">
              <em className="font-normal italic">
                {total7d.toLocaleString("nb-NO")} hendelser siste 7 dager. Alt logget.
              </em>
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Compliance-verktøy · {aktoerer.length} aktive aktører · GDPR-eksport
              tilgjengelig
            </p>
          </div>
          <div className="flex gap-2">
            <CopyButton label="Kopier filter-link" />
            <button
              type="button"
              disabled
              title="Kommer i v2"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground opacity-50"
            >
              <Download className="h-4 w-4" />
              Eksporter
            </button>
          </div>
        </header>

        {/* KPI strip */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <Kpi
            label="Hendelser · 7d"
            value={total7d.toLocaleString("nb-NO")}
            delta={`${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1).replace(".", ",")} %`}
            deltaTone={deltaPct >= 0 ? "up" : "down"}
            foot="vs forrige uke"
          />
          <Kpi
            label="Aktive aktører"
            value={String(aktoerer.length)}
            foot="siste 7 dager"
          />
          <Kpi
            label="Slett-hendelser"
            value={String(deletes)}
            foot="Alle med årsak loggført"
            footTone="success"
          />
          <Kpi
            label="Sikkerhets-events"
            value={String(authFails)}
            valueTone={authFails > 0 ? "warning" : undefined}
            foot="mislyktede login · IP-allowlist"
          />
        </div>

        {/* Filter bar */}
        <form className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            name="action"
            defaultValue={params.action ?? ""}
            placeholder="Søk aktør, entitet eller action"
            className="flex-1 bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90"
          >
            Filtrer
          </button>
          <span className="h-5 w-px bg-border" />
          <Chip active={!params.action}>Alle handlinger</Chip>
          <Chip>Create</Chip>
          <Chip>Update</Chip>
          <Chip>Delete</Chip>
          <Chip>Auth</Chip>
          <Chip>Agent</Chip>
          <span className="h-5 w-px bg-border" />
          <Chip>
            <span className="inline-flex items-center gap-1.5">
              Siste 7 dager
              <ChevronDown className="h-2.5 w-2.5" />
            </span>
          </Chip>
        </form>

        {/* Layout */}
        <div className="grid grid-cols-[1fr_320px] items-start gap-8">
          {/* Timeline */}
          <div>
            {logs.length === 0 ? (
              <EmptyState
                icon={Search}
                titleItalic="Ingen treff"
                sub="Ingen logg-rader matcher filtrene."
              />
            ) : (
              Array.from(grupper.entries()).map(([dato, evts]) => (
                <div key={dato}>
                  <DateHeader date={dato} count={evts.length} />
                  <Timeline events={evts} />
                </div>
              ))
            )}
          </div>

          {/* Rail */}
          <aside className="sticky top-6">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-3.5 font-display text-[14px] font-semibold tracking-tight">
                Filter-oppsummering
              </h3>
              <div className="mb-4 text-[13px] text-muted-foreground">
                Viser{" "}
                <b className="font-mono font-medium text-foreground">
                  {logs.length}
                </b>{" "}
                hendelser
              </div>

              <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.10em] font-medium text-muted-foreground">
                Top aktører
              </div>
              {aktoerer.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">
                  Ingen aktivitet siste 7 dager.
                </p>
              ) : (
                aktoerer.map((a, i) => {
                  const max = aktoerer[0]?._count._all ?? 1;
                  const pct = (a._count._all / max) * 100;
                  const navn = a.actorId
                    ? (navnById.get(a.actorId) ?? "Ukjent")
                    : "System";
                  return (
                    <BarRow
                      key={a.actorId ?? `null-${i}`}
                      label={navn}
                      pct={pct}
                      value={a._count._all}
                    />
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  deltaTone,
  valueTone,
  foot,
  footTone,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down";
  valueTone?: "warning";
  foot: string;
  footTone?: "success";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] font-medium text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-[32px] font-medium leading-none tracking-tight tabular-nums ${
          valueTone === "warning" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12px]">
        {delta && (
          <span
            className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
              deltaTone === "up"
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {delta}
          </span>
        )}
        <span
          className={footTone === "success" ? "text-primary" : "text-muted-foreground"}
        >
          {foot}
        </span>
      </div>
    </div>
  );
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-medium ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function DateHeader({ date, count }: { date: string; count: number }) {
  return (
    <div className="sticky top-0 z-[5] mt-6 mb-2 flex items-center gap-3.5 bg-background py-2">
      <span className="rounded-full bg-foreground px-3 py-1 font-display text-[13px] font-semibold tracking-tight text-background">
        {date}
      </span>
      <span className="text-[12px] text-muted-foreground">
        {count} hendelser
      </span>
      <span className="ml-1 h-px flex-1 bg-border" />
    </div>
  );
}

function Timeline({ events }: { events: Evt[] }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
      {events.map((e) => (
        <EvtCard key={e.id} evt={e} />
      ))}
    </div>
  );
}

function EvtCard({ evt }: { evt: Evt }) {
  const pillStyles: Record<EvtType, string> = {
    create: "bg-accent/30 text-primary",
    update: "bg-primary/10 text-primary",
    delete: "bg-destructive/10 text-destructive",
    auth: "bg-muted text-muted-foreground",
    agent: "bg-muted text-muted-foreground",
    "auth-fail": "bg-destructive/10 text-destructive",
  };
  const iconStyles: Record<EvtType, string> = {
    create: "border-accent bg-accent/30 text-primary",
    update: "border-primary bg-primary/10 text-primary",
    delete: "border-destructive bg-destructive/10 text-destructive",
    auth: "border-border bg-muted text-muted-foreground",
    agent: "border-border bg-muted text-muted-foreground",
    "auth-fail": "border-destructive bg-destructive/10 text-destructive",
  };
  const Icon = ({ type }: { type: EvtType }) => {
    if (type === "create") return <Plus className="h-3.5 w-3.5" />;
    if (type === "update") return <Pencil className="h-3.5 w-3.5" />;
    if (type === "delete") return <Trash2 className="h-3.5 w-3.5" />;
    if (type === "auth") return <ShieldCheck className="h-3.5 w-3.5" />;
    if (type === "auth-fail") return <ShieldOff className="h-3.5 w-3.5" />;
    return <Bot className="h-3.5 w-3.5" />;
  };

  const pillLabel =
    evt.type === "auth-fail"
      ? "Auth · mislyktet"
      : evt.type.charAt(0).toUpperCase() + evt.type.slice(1);

  const failed = evt.type === "auth-fail";

  return (
    <div className="relative mb-3.5">
      <div
        className={`absolute -left-8 top-3.5 z-[1] grid h-6 w-6 place-items-center rounded-full border-2 ${iconStyles[evt.type]}`}
      >
        <Icon type={evt.type} />
      </div>
      <div
        className={`rounded-lg border bg-card px-4 py-3.5 transition-shadow hover:shadow-sm ${
          failed ? "border-destructive/25" : "border-border"
        }`}
      >
        <div className="mb-1 flex items-center gap-3">
          <span className="font-mono text-[12px] font-medium text-muted-foreground tabular-nums">
            {evt.time}
          </span>
          <span
            className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${pillStyles[evt.type]}`}
          >
            {pillLabel}
          </span>
        </div>
        <div className="mb-2 text-[14px] leading-[1.5] text-foreground">
          {evt.title}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-3.5 border-t border-border pt-2.5 font-mono text-[11px] text-muted-foreground">
          {evt.meta.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarRow({
  label,
  pct,
  value,
}: {
  label: string;
  pct: number;
  value: number;
}) {
  return (
    <div className="mb-2 grid grid-cols-[110px_1fr_40px] items-center gap-2.5 text-[12px]">
      <span className="truncate text-foreground">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-right font-mono text-[11px] text-muted-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}
