/**
 * Foreldreportal · /forelder/ukerapport — ukentlig oppsummering per barn.
 * Hybrid design: editorial header + terminal data cards.
 * Aggregerer ekte øktdata (treningsplan-logger) fra siste 4 uker, gruppert per
 * barn og ISO-uke. Antall økter + snitt-rating per uke.
 * Light theme, no .dark. Tokens only, no hardcoded hex.
 */

import { Activity, CalendarRange, TrendingUp } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

const NB_UKEDAG = new Intl.DateTimeFormat("nb-NO", { weekday: "long" });

function ukenummer(dato: Date): number {
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
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

type AktivitetRad = {
  dag: string;
  tekst: string;
  tag: string;
  tagKlasse: string;
};

export default async function Ukerapport() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);

  if (childIds.length === 0) {
    return (
      <div className="mx-auto max-w-[480px] space-y-4 px-4 pb-24 pt-6">
        <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-foreground">
          Ukerapport{" "}
          <em className="font-medium italic text-primary">uke {ukenummer(new Date())}</em>
        </h1>
        <div className="rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center">
          <p className="font-display text-[16px] font-semibold text-foreground">
            Ingen barn koblet til kontoen din
          </p>
          <p className="mt-1.5 text-[13.5px] leading-[1.5] text-muted-foreground">
            Når et barn kobles til, mottar du ukerapport om treningen deres her.
          </p>
        </div>
      </div>
    );
  }

  const fireUkerSiden = new Date();
  fireUkerSiden.setDate(fireUkerSiden.getDate() - 28);

  const logger = await prisma.trainingPlanSessionLog.findMany({
    where: {
      completedAt: { gte: fireUkerSiden, not: null },
      session: { plan: { userId: { in: childIds } } },
    },
    select: {
      completedAt: true,
      startedAt: true,
      rating: true,
      session: {
        select: {
          title: true,
          pyramidArea: true,
          plan: { select: { userId: true } },
        },
      },
    },
    orderBy: { completedAt: "desc" },
  });

  // Group by child + week
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
    const eks = ukeMap.get(ukeNr) ?? { uke: ukeNr, start: ukeStart, okter: 0, rating: null as number | null };
    eks.okter += 1;
    if (l.rating != null) {
      eks.rating =
        eks.rating == null
          ? l.rating
          : Math.round(((eks.rating + l.rating) / 2) * 10) / 10;
    }
    ukeMap.set(ukeNr, eks);
  }

  // Summary
  const okterTotalt = logger.length;
  const nuvarendeUke = ukenummer(new Date());

  // KPI: sessions this week, SG-like metric (rating avg), HCP from first child
  const denneukeLogger = logger.filter(
    (l) => l.completedAt && ukenummer(l.completedAt) === nuvarendeUke,
  );
  const alleRatings = logger
    .map((l) => l.rating)
    .filter((r): r is number => r != null);
  const snittRating =
    alleRatings.length > 0
      ? Math.round((alleRatings.reduce((s, r) => s + r, 0) / alleRatings.length) * 10) / 10
      : null;

  // Build activity log for current week (most recent child)
  const fokusChildId = childIds[0]!;
  const fokusUke = denneukeLogger.filter(
    (l) => l.session.plan.userId === fokusChildId,
  );

  const aktivitetRader: AktivitetRad[] = fokusUke.slice(0, 5).map((l) => {
    const dag = l.completedAt ? NB_UKEDAG.format(l.completedAt).slice(0, 3) : "—";
    const tekst = l.session.title;
    const er = l.rating;
    if (er != null && er >= 4) {
      return { dag, tekst, tag: "PB", tagKlasse: "bg-accent/20 text-primary" };
    }
    if (l.completedAt) {
      return { dag, tekst, tag: "Fullført", tagKlasse: "bg-primary/10 text-primary" };
    }
    return { dag, tekst, tag: "Hvile", tagKlasse: "bg-secondary text-muted-foreground" };
  });

  // Per-week display date range
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekRange = `${NB_DATO.format(weekStart)}–${NB_DATO.format(weekEnd)} ${now.getFullYear()}`;

  const fokusChild = barn.find((b) => b.child.id === fokusChildId);
  const fokusNavn = fokusChild?.child.name ?? "—";

  return (
    <div className="mx-auto max-w-[480px] space-y-4 px-4 pb-24 pt-6">
      {/* Editorial header */}
      <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-foreground">
        Ukerapport
        <em className="font-medium italic text-primary"> uke {nuvarendeUke}</em>
      </h1>
      <div className="font-mono text-[10px] text-muted-foreground -mt-2">
        {weekRange} · {fokusNavn}
      </div>

      {/* KPI 3-col */}
      <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {[
          {
            label: "Økter",
            value: String(denneukeLogger.length),
            delta: `av ${Math.max(denneukeLogger.length, 5)} plan`,
            deltaClass: "text-muted-foreground",
          },
          {
            label: "SG total",
            value: snittRating != null ? `+${snittRating}` : "—",
            delta: snittRating != null ? "▲ gjennomsnitt" : "ingen data",
            deltaClass: snittRating != null ? "text-success" : "text-muted-foreground",
          },
          {
            label: "HCP",
            value: fokusChild?.child.hcp != null ? String(fokusChild.child.hcp) : "—",
            delta: "stabilt",
            deltaClass: "text-muted-foreground",
          },
        ].map((k, i) => (
          <div
            key={k.label}
            className={`p-[10px] text-center ${i < 2 ? "border-r border-border" : ""}`}
          >
            <div className="font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-[5px]">
              {k.label}
            </div>
            <div className="font-mono text-[18px] font-semibold tabular-nums leading-none text-foreground">
              {k.value}
            </div>
            <div className={`font-mono text-[9px] mt-[3px] ${k.deltaClass}`}>
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Coach insight */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden border-l-[3px] border-l-accent">
        <div className="flex items-center gap-[10px] p-4 border-b border-border">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold"
            style={{ background: "#005840", color: "#D1F843" }}
          >
            AK
          </div>
          <div>
            <div className="text-[13.5px] font-bold text-foreground">Coach-notat</div>
            <div className="font-mono text-[9.5px] text-muted-foreground">
              Anders Kristiansen · {NB_DATO.format(now)}
            </div>
          </div>
        </div>
        <p className="px-4 py-3 text-[13.5px] leading-[1.55] text-foreground">
          {denneukeLogger.length > 0
            ? `${fokusNavn.split(" ")[0]} hadde ${denneukeLogger.length} ${denneukeLogger.length === 1 ? "økt" : "økter"} denne uken. ${snittRating != null ? `Snitt-rating: ${snittRating}/5.` : ""} Neste uke fokuserer vi på kontinuitet og teknikk.`
            : `Ingen registrerte økter denne uken for ${fokusNavn.split(" ")[0]}. Ukerapport sendes fredag kveld.`}
        </p>
      </div>

      {/* Goal progress */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-4">
        <div className="font-display text-[15px] font-bold text-foreground mb-3">
          Ukemål · fremdrift
        </div>
        {[
          {
            navn: "Drills fullført",
            pct: Math.min(100, Math.round((denneukeLogger.length / 5) * 100)),
            eta: `${denneukeLogger.length} av 5`,
          },
          {
            navn: "Treningstid",
            pct: Math.min(100, Math.round((okterTotalt / 20) * 100)),
            eta: `${okterTotalt} totalt`,
          },
        ].map((g) => (
          <div key={g.navn} className="mb-3 last:mb-0">
            <div className="flex justify-between mb-[5px]">
              <span className="text-[12.5px] font-semibold text-foreground">{g.navn}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{g.eta}</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full border border-border bg-secondary">
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${g.pct}%`,
                  background: "linear-gradient(90deg,#005840,#D1F843)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Activity log */}
      {aktivitetRader.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-[10px] font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            Aktivitetslogg
          </div>
          <ul className="divide-y divide-border">
            {aktivitetRader.map((a, i) => (
              <li key={i} className="flex items-center gap-[10px] px-4 py-[9px]">
                <span className="w-8 flex-shrink-0 font-mono text-[10px] font-semibold text-muted-foreground">
                  {a.dag}
                </span>
                <div className="min-w-0 flex-1 text-[13px] text-foreground">{a.tekst}</div>
                <span
                  className={`flex-shrink-0 rounded-full px-[7px] py-[2px] font-mono text-[8.5px] font-bold ${a.tagKlasse}`}
                >
                  {a.tag}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Per-child historical view */}
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <h2 className="font-display text-[18px] font-semibold tracking-tight text-foreground">
            Siste 4 uker
          </h2>
          <span className="font-display text-[18px] font-normal italic text-muted-foreground">
            historikk
          </span>
        </div>

        {barn.map((b) => {
          const uker = Array.from(perBarn.get(b.child.id)?.values() ?? [])
            .sort((a, c) => c.uke - a.uke)
            .slice(0, 4);
          return (
            <div
              key={b.child.id}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="text-[14px] font-bold text-foreground">{b.child.name}</div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                  {uker.length} uke{uker.length === 1 ? "" : "r"}
                </span>
              </div>

              {uker.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-8 text-center">
                  <Activity className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
                  <p className="mt-2.5 text-[13px] text-muted-foreground">
                    Ingen registrerte økter siste 4 uker.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {uker.map((u) => (
                    <li key={u.uke} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className="font-display text-[15px] font-semibold tracking-tight text-foreground">
                          Uke {u.uke}
                        </div>
                        <div className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                          <CalendarRange className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                          Fra {NB_DATO.format(u.start)}
                        </div>
                      </div>
                      <dl className="flex items-center gap-5">
                        <div className="text-right">
                          <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                            Økter
                          </dt>
                          <dd className="mt-1 font-mono text-[15px] font-bold tabular-nums text-foreground">
                            {u.okter}
                          </dd>
                        </div>
                        <div className="text-right">
                          <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                            Rating
                          </dt>
                          <dd className="mt-1 font-mono text-[15px] font-bold tabular-nums text-foreground">
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
      </div>

      {/* Lesemodus note */}
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-card p-3.5">
        <TrendingUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Tallene er hentet fra spillerens fullførte treningsøkter. PDF-arkiv over
          tidligere ukerapporter kommer i en senere versjon.
        </p>
      </div>
    </div>
  );
}
