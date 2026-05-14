// Ukerapport — historiske oppsummeringer per barn.
// WeeklyReport-tabell finnes ikke ennå — derfor placeholder med aggregert øktdata
// fra siste 4 uker, gruppert per barn.

import { Mail, Calendar, Activity, Star } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

function ukenummer(dato: Date): number {
  const d = new Date(
    Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

type UkeData = {
  uke: number;
  start: Date;
  okter: number;
  rating: number | null;
};

export default async function Ukerapport() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);

  const fireUkerSiden = new Date();
  fireUkerSiden.setDate(fireUkerSiden.getDate() - 28);

  const logger = childIds.length
    ? await prisma.trainingPlanSessionLog.findMany({
        where: {
          completedAt: { gte: fireUkerSiden, not: null },
          session: { plan: { userId: { in: childIds } } },
        },
        select: {
          completedAt: true,
          rating: true,
          session: { select: { plan: { select: { userId: true } } } },
        },
      })
    : [];

  // Gruppér per barn + uke
  const perBarn = new Map<string, Map<number, UkeData>>();
  for (const b of barn) perBarn.set(b.child.id, new Map());

  for (const l of logger) {
    if (!l.completedAt) continue;
    const uid = l.session.plan.userId;
    const ukeNr = ukenummer(l.completedAt);
    const ukeMap = perBarn.get(uid);
    if (!ukeMap) continue;
    const ukeStart = new Date(l.completedAt);
    ukeStart.setDate(ukeStart.getDate() - ukeStart.getDay() + 1);
    const eks = ukeMap.get(ukeNr) ?? {
      uke: ukeNr,
      start: ukeStart,
      okter: 0,
      rating: null as number | null,
    };
    eks.okter += 1;
    if (l.rating != null) {
      eks.rating =
        eks.rating == null
          ? l.rating
          : Math.round(((eks.rating + l.rating) / 2) * 10) / 10;
    }
    ukeMap.set(ukeNr, eks);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Foreldreportal · Rapport"
        titleLead="Ukerapport"
        titleItalic="hver fredag"
        sub="Sammendrag av treningsuken sendes på e-post hver fredag kveld."
      />

      {/* Abonnement-info */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <Mail className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
          Abonnement
        </div>
        <p className="mt-4 text-sm">Du mottar ukerapport for:</p>
        {barn.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Ingen barn koblet ennå.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {barn.map((b) => (
              <li
                key={b.child.id}
                className="flex items-center justify-between rounded-md bg-muted px-4 py-2 text-sm"
              >
                <span>
                  <span className="font-semibold">{b.child.name}</span>{" "}
                  <span className="text-muted-foreground">
                    — {b.child.email}
                  </span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                  Aktiv
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Historikk per barn */}
      {barn.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Siste 4 uker{" "}
            <em className="font-normal italic text-muted-foreground">
              · historikk
            </em>
          </h2>

          {barn.map((b) => {
            const uker = Array.from(perBarn.get(b.child.id)?.values() ?? [])
              .sort((a, b) => b.uke - a.uke)
              .slice(0, 4);
            return (
              <div
                key={b.child.id}
                className="rounded-xl border border-border bg-card"
              >
                <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {b.child.name}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {uker.length} uke{uker.length === 1 ? "" : "r"}
                  </span>
                </div>

                {uker.length === 0 ? (
                  <div className="px-6 py-6 text-sm text-muted-foreground">
                    Ingen registrerte økter siste 4 uker.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {uker.map((u) => (
                      <li
                        key={u.uke}
                        className="flex items-center justify-between gap-4 px-6 py-4 text-sm"
                      >
                        <div>
                          <div className="font-display text-base font-semibold">
                            Uke {u.uke}
                          </div>
                          <div className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                            <Calendar
                              className="h-3 w-3"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                            Starter {NB_DATO.format(u.start)}
                          </div>
                        </div>
                        <dl className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <dt className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                              <Activity
                                className="h-3 w-3"
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                              Økter
                            </dt>
                            <dd className="mt-1 font-mono text-base font-semibold tabular-nums">
                              {u.okter}
                            </dd>
                          </div>
                          <div className="text-right">
                            <dt className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                              <Star
                                className="h-3 w-3"
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                              Rating
                            </dt>
                            <dd className="mt-1 font-mono text-base font-semibold tabular-nums">
                              {u.rating != null ? `${u.rating}/5` : "—"}
                            </dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          <p className="text-xs text-muted-foreground">
            PDF-arkiv over tidligere ukerapporter kommer i en senere versjon.
          </p>
        </section>
      )}
    </div>
  );
}
