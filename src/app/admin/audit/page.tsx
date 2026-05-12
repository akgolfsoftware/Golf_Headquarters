import Link from "next/link";
import { ArrowLeft, FileSearch, ShieldOff } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

type Search = { action?: string; actor?: string };

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

  const logs = await prisma.auditLog.findMany({
    where,
    include: { actor: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Innstillinger
      </Link>

      <PageHeader
        eyebrow="CoachHQ · Revisjonslogg"
        titleItalic="Audit"
        titleTrail="-logg"
        sub={`${logs.length} siste hendelser${
          params.action ? ` (filtrert på "${params.action}")` : ""
        }.`}
      />

      <form className="flex flex-wrap items-end gap-4">
        <label className="min-w-[240px] flex-1">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Action contains
          </span>
          <input
            type="search"
            name="action"
            defaultValue={params.action ?? ""}
            placeholder="api_key, plan, user.role.changed…"
            className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Filtrer
        </button>
      </form>

      {logs.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          titleItalic="Ingen treff"
          sub="Ingen logg-rader matcher filtrene."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left">
              <tr>
                <Th>Tid</Th>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Target</Th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-border/60 last:border-0 hover:bg-secondary/30"
                >
                  <Td className="font-mono text-[10px] text-muted-foreground">
                    {l.createdAt.toLocaleString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Td>
                  <Td>{l.actor?.name ?? "—"}</Td>
                  <Td>
                    <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs">
                      {l.action}
                    </code>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs text-muted-foreground">
                      {l.target ?? "—"}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
