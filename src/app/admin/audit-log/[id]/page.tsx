/**
 * CoachHQ — Audit-log detalj.
 *
 * Viser én audit-event i full detalj:
 *   - Hero: action + tidsstempel + aktør
 *   - Diff: før/etter (hvis metadata.before/after finnes) eller pretty-print JSON
 *   - Relaterte events: samme aktør, ±15 min
 *   - Actions: "Rull tilbake" (placeholder), "Eksporter JSON"
 *
 * Krever ADMIN-rolle (samme som /admin/audit-log).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Clock,
  Download,
  Pencil,
  Plus,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Undo2,
  User,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CopyButton } from "@/components/shared/copy-button";

const ICON_STROKE = 1.75;

type EvtType = "create" | "update" | "delete" | "auth" | "agent" | "auth-fail";

function actionToType(action: string): EvtType {
  const a = action.toLowerCase();
  if (a.includes("auth.fail") || a.includes("login.fail")) return "auth-fail";
  if (a.includes("auth") || a.includes("login")) return "auth";
  if (a.includes("agent")) return "agent";
  if (a.includes("delete") || a.includes("slett")) return "delete";
  if (a.includes("create") || a.includes("opprett")) return "create";
  return "update";
}

const TYPE_LABEL: Record<EvtType, string> = {
  create: "Opprettet",
  update: "Oppdatert",
  delete: "Slettet",
  auth: "Pålogging",
  agent: "Agent",
  "auth-fail": "Mislyktet pålogging",
};

const TYPE_PILL: Record<EvtType, string> = {
  create: "bg-accent/30 text-primary",
  update: "bg-primary/10 text-primary",
  delete: "bg-destructive/10 text-destructive",
  auth: "bg-muted text-muted-foreground",
  agent: "bg-muted text-muted-foreground",
  "auth-fail": "bg-destructive/10 text-destructive",
};

function TypeIcon({ type }: { type: EvtType }) {
  if (type === "create")
    return <Plus className="h-4 w-4" strokeWidth={ICON_STROKE} />;
  if (type === "update")
    return <Pencil className="h-4 w-4" strokeWidth={ICON_STROKE} />;
  if (type === "delete")
    return <Trash2 className="h-4 w-4" strokeWidth={ICON_STROKE} />;
  if (type === "auth")
    return <ShieldCheck className="h-4 w-4" strokeWidth={ICON_STROKE} />;
  if (type === "auth-fail")
    return <ShieldOff className="h-4 w-4" strokeWidth={ICON_STROKE} />;
  return <Bot className="h-4 w-4" strokeWidth={ICON_STROKE} />;
}

function harDiff(meta: unknown): meta is { before: unknown; after: unknown } {
  return (
    !!meta &&
    typeof meta === "object" &&
    !Array.isArray(meta) &&
    "before" in meta &&
    "after" in meta
  );
}

function prettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formaterTidspunkt(dato: Date): string {
  return dato.toLocaleString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formaterTidKort(dato: Date): string {
  return dato.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function AuditLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  if (user.role !== "ADMIN") {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="CoachHQ · Audit-log · Detalj"
          titleItalic="Kun"
          titleTrail="for administratorer"
          sub="Audit-detaljer er kun tilgjengelig for ADMIN-rollen."
        />
        <EmptyState
          icon={ShieldOff}
          titleItalic="Manglende"
          titleTrail="tilgang"
          sub="Be Anders om å gi deg ADMIN-rolle for å se denne siden."
        />
      </div>
    );
  }

  const event = await prisma.auditLog.findUnique({
    where: { id },
    include: { actor: { select: { id: true, name: true, email: true } } },
  });
  if (!event) notFound();

  const type = actionToType(event.action);

  // Relaterte events: samme aktør, ±15 minutter (eller alle events i 15 min hvis aktørId mangler).
  const vindu = 15 * 60 * 1000;
  const relaterteAlle = await prisma.auditLog.findMany({
    where: {
      id: { not: event.id },
      createdAt: {
        gte: new Date(event.createdAt.getTime() - vindu),
        lte: new Date(event.createdAt.getTime() + vindu),
      },
      ...(event.actorId ? { actorId: event.actorId } : {}),
    },
    include: { actor: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const metaJson = prettyJson(event.metadata);
  const eksportPayload = prettyJson({
    id: event.id,
    action: event.action,
    target: event.target,
    actor: event.actor,
    createdAt: event.createdAt.toISOString(),
    metadata: event.metadata,
  });

  const kanRulleTilbake = type === "update" || type === "delete";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/audit-log"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
        Audit-logg
      </Link>

      {/* Hero */}
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            CoachHQ · Audit · Detalj
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${TYPE_PILL[type]}`}
            >
              <TypeIcon type={type} />
              {TYPE_LABEL[type]}
            </span>
            <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs">
              {event.action}
            </code>
            {event.target && (
              <span className="font-mono text-xs text-muted-foreground">
                {event.target}
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
            <em className="font-normal italic">{event.action}</em>
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              {formaterTidspunkt(event.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              {event.actor ? (
                <>
                  <span className="font-medium text-foreground">
                    {event.actor.name}
                  </span>
                  <span className="text-muted-foreground">
                    · {event.actor.email}
                  </span>
                </>
              ) : (
                <span>System</span>
              )}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton label="Kopier ID" text={event.id} />
          <CopyButton label="Kopier JSON" text={eksportPayload} />
          <button
            type="button"
            disabled={!kanRulleTilbake}
            title={
              kanRulleTilbake
                ? "Rull tilbake — kommer i v2"
                : "Kan ikke rulles tilbake"
            }
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground opacity-60 transition-colors"
          >
            <Undo2 className="h-4 w-4" strokeWidth={ICON_STROKE} />
            Rull tilbake
          </button>
        </div>
      </header>

      {/* Innhold-grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Hovedinnhold */}
        <div className="min-w-0 space-y-6">
          {harDiff(event.metadata) ? (
            <DiffPanel
              before={(event.metadata as { before: unknown }).before}
              after={(event.metadata as { after: unknown }).after}
            />
          ) : (
            <Panel tittel="Metadata">
              {event.metadata == null ? (
                <p className="text-sm text-muted-foreground">
                  Ingen metadata lagret for denne hendelsen.
                </p>
              ) : (
                <pre className="max-h-[480px] overflow-auto rounded-md border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
                  {metaJson}
                </pre>
              )}
            </Panel>
          )}
        </div>

        {/* Rail — relaterte events */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-3 font-display text-sm font-semibold tracking-tight">
              Relaterte hendelser
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              {event.actor
                ? `Samme aktør innenfor ±15 minutter.`
                : "Alle hendelser innenfor ±15 minutter."}
            </p>
            {relaterteAlle.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-background px-4 py-3 text-center text-xs text-muted-foreground">
                Ingen relaterte hendelser.
              </p>
            ) : (
              <ul className="space-y-2">
                {relaterteAlle.map((r) => {
                  const t = actionToType(r.action);
                  return (
                    <li key={r.id}>
                      <Link
                        href={`/admin/audit-log/${r.id}`}
                        className="flex items-start gap-3 rounded-md border border-border bg-background p-3 transition-colors hover:border-primary hover:bg-secondary"
                      >
                        <span
                          className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${TYPE_PILL[t]}`}
                        >
                          <TypeIcon type={t} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-mono text-xs font-semibold text-foreground">
                            {r.action}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground tabular-nums">
                            <Clock
                              className="h-3 w-3"
                              strokeWidth={ICON_STROKE}
                            />
                            {formaterTidKort(r.createdAt)}
                          </div>
                          {r.target && (
                            <div className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                              {r.target}
                            </div>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-3 font-display text-sm font-semibold tracking-tight">
              Eksport
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Last ned hele hendelsen som JSON. Brukes ved GDPR-eksport eller
              tvistehåndtering.
            </p>
            <a
              href={`data:application/json;charset=utf-8,${encodeURIComponent(eksportPayload)}`}
              download={`audit-${event.id}.json`}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              Last ned JSON
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* =========================================================
   Diff-panel — side-by-side før/etter
   ========================================================= */

function DiffPanel({ before, after }: { before: unknown; after: unknown }) {
  const beforeText = prettyJson(before);
  const afterText = prettyJson(after);
  return (
    <Panel tittel="Endring — før og etter">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-destructive">
            Før
          </div>
          <pre className="max-h-[480px] overflow-auto rounded-md border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
            {beforeText}
          </pre>
        </div>
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
            Etter
          </div>
          <pre className="max-h-[480px] overflow-auto rounded-md border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
            {afterText}
          </pre>
        </div>
      </div>
    </Panel>
  );
}

function Panel({
  tittel,
  children,
}: {
  tittel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-4 font-display text-base font-semibold tracking-tight">
        {tittel}
      </h2>
      {children}
    </section>
  );
}
