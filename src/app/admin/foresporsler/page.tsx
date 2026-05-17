/**
 * CoachHQ — Økt-forespørsler
 *
 * Viser alle SessionRequest-oppføringer fra spillere (via /portal/onskeligokt).
 * Coach kan kvittere ut som planlagt eller avslå.
 */

import Link from "next/link";
import {
  Calendar,
  Clock,
  MessageSquare,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { avatarBg } from "@/lib/avatar-colors";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ForespørselActions } from "./forespørsel-actions";

const PYR_LABEL: Partial<Record<string, string>> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-accent/30 text-accent-foreground",
  SCHEDULED: "bg-primary/15 text-primary",
  DECLINED: "bg-destructive/15 text-destructive",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Venter",
  SCHEDULED: "Planlagt",
  DECLINED: "Avslått",
};

function formaterDato(d: Date | null): string {
  if (!d) return "Fleksibel";
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dagerSiden(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "i dag";
  if (diff === 1) return "i går";
  return `${diff} dager siden`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function ForespørslerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const requests = await prisma.sessionRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, hcp: true, homeClub: true } },
    },
  });

  const pending = requests.filter((r) => r.status === "PENDING");
  const behandlet = requests.filter((r) => r.status !== "PENDING");

  // KPI-beregninger: siste 7 dager
  // eslint-disable-next-line react-hooks/purity
  const sjuDagerSiden = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const planlagt7d = requests.filter(
    (r) => r.status === "SCHEDULED" && r.createdAt.getTime() >= sjuDagerSiden,
  ).length;
  const avslatt7d = requests.filter(
    (r) => r.status === "DECLINED" && r.createdAt.getTime() >= sjuDagerSiden,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Daglig"
        titleLead="Økt-"
        titleItalic="forespørsler"
        sub="Spillere som har bedt om økt. Kvitter ut ved å booke time eller avslå."
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">
              {pending.length} ubehandlet{pending.length === 1 ? "" : "e"}
            </span>
          </div>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
            Venter
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
            {pending.length}
          </div>
          <div className="font-mono text-[11px] text-background/70">
            {pending.length === 0 ? "Alt kvittert" : "Krever handling"}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Planlagt · 7d
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {planlagt7d}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Forespørsler bekreftet siste uke
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Avslått · 7d
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {avslatt7d}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Ikke booket inn
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Totalt
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {requests.length}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            {behandlet.length} behandlet · {pending.length} venter
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          titleItalic="Ingen"
          titleTrail="forespørsler"
          sub="Ingen spillere har sendt økt-forespørsler ennå."
        />
      ) : (
        <div className="space-y-8">
          {/* Ubehandlede */}
          {pending.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Ubehandlede
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  {pending.length} stk
                </span>
              </div>

              <ul className="flex flex-col gap-3">
                {pending.map((req) => (
                  <li
                    key={req.id}
                    className="rounded-xl border border-border bg-card"
                  >
                    <div className="flex flex-wrap items-start gap-4 p-5">
                      {/* Avatar */}
                      <div
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                        style={{ background: avatarBg(req.user.name) }}
                        aria-hidden="true"
                      >
                        {initials(req.user.name)}
                      </div>

                      {/* Innhold */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {req.user.name}
                          </span>
                          {req.user.hcp != null && (
                            <span className="font-mono text-[11px] text-muted-foreground">
                              HCP {req.user.hcp.toFixed(1).replace(".", ",")}
                            </span>
                          )}
                          {req.user.homeClub && (
                            <span className="font-mono text-[11px] text-muted-foreground">
                              · {req.user.homeClub}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                            {formaterDato(req.preferredAt)}
                          </span>
                          {req.pyramidArea && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                              Fokus: {PYR_LABEL[req.pyramidArea] ?? req.pyramidArea}
                            </span>
                          )}
                        </div>

                        {req.notes && (
                          <p className="text-sm text-foreground/70 italic">
                            &ldquo;{req.notes}&rdquo;
                          </p>
                        )}

                        <p className="font-mono text-[10px] text-muted-foreground/60">
                          Sendt {dagerSiden(req.createdAt)}
                        </p>
                      </div>

                      {/* Handlinger */}
                      <ForespørselActions requestId={req.id} />
                    </div>

                    {/* Book-snarvei */}
                    <div className="border-t border-border px-5 py-3">
                      <Link
                        href={`/admin/bookings/ny?spillerId=${req.user.id}&note=${encodeURIComponent(req.notes ?? "")}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Book time nå
                      </Link>
                      <span className="ml-3 text-xs text-muted-foreground">
                        Merker forespørselen som planlagt
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Behandlede */}
          {behandlet.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-semibold tracking-tight text-muted-foreground">
                Behandlede
              </h2>

              <ul className="flex flex-col gap-2">
                {behandlet.map((req) => (
                  <li
                    key={req.id}
                    className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card/60 px-4 py-3 opacity-70"
                  >
                    <div
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                      style={{ background: avatarBg(req.user.name) }}
                      aria-hidden="true"
                    >
                      {initials(req.user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground">
                        {req.user.name}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        · {formaterDato(req.preferredAt)}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${
                        STATUS_STYLE[req.status] ?? ""
                      }`}
                    >
                      {STATUS_LABEL[req.status] ?? req.status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
