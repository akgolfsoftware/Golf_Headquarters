/**
 * Foreldreportal · /forelder/ukerapport — mobil-first (430px).
 *
 * Ukentlig oppsummering per barn. WeeklyReport-tabell finnes ikke ennå — vi
 * aggregerer ekte øktdata (treningsplan-logger) fra siste 4 uker, gruppert per
 * barn og ISO-uke. Antall økter + snitt-rating per uke.
 *
 * Lese-først. Ekte data: prisma.trainingPlanSessionLog per koblet barn. Tall
 * fra DB — aldri hardkodet. Tom DB → tomtilstand per barn.
 * DS-tokens + athletic-primitiver. Ingen hex, ingen emoji (kun lucide).
 */

import { Activity, CalendarRange, Mail, Star, TrendingUp } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { ForelderHero } from "@/components/forelder/forelder-hero";
import { AthleticBadge, KpiCard, KpiStrip } from "@/components/athletic";

export const dynamic = "force-dynamic";

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

  // Tomtilstand — ingen barn koblet.
  if (childIds.length === 0) {
    return (
      <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-24 pt-6">
        <ForelderHero
          eyebrow="Foreldreportal · Rapport"
          titleLead="Ukerapport"
          titleItalic="hver fredag"
          sub="Sammendrag av treningsuken — sendes på e-post hver fredag."
        />
        <IngenBarn />
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
      rating: true,
      session: { select: { plan: { select: { userId: true } } } },
    },
  });

  // Gruppér per barn + uke.
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

  // Sammendrag på tvers av barn (siste 4 uker).
  const okterTotalt = logger.length;
  const aktiveUker = new Set(
    logger
      .filter((l) => l.completedAt)
      .map((l) => `${l.session.plan.userId}-${ukenummer(l.completedAt!)}`),
  ).size;

  return (
    <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-24 pt-6">
      <ForelderHero
        eyebrow="Foreldreportal · Rapport"
        titleLead="Ukerapport"
        titleItalic="hver fredag"
        sub="Sammendrag av treningsuken — sendes på e-post hver fredag kveld."
      />

      {/* Sammendrag siste 4 uker */}
      <KpiStrip cols={3} className="gap-3">
        <KpiCard label="Økter · 4 uker" value={okterTotalt} unit="økter" size="md" />
        <KpiCard label="Aktive uker" value={aktiveUker} size="md" />
        <KpiCard label="Barn" value={barn.length} size="md" />
      </KpiStrip>

      {/* Abonnement-info */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <PanelHead icon={Mail} label="UKERAPPORT SENDES TIL" />
        <ul className="divide-y divide-border">
          {barn.map((b) => (
            <li
              key={b.child.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold tracking-[-0.005em] text-foreground">
                  {b.child.name}
                </div>
                <div className="mt-0.5 truncate font-mono text-[10px] font-semibold tracking-[0.02em] text-muted-foreground">
                  {b.child.email}
                </div>
              </div>
              <AthleticBadge variant="ok">Aktiv</AthleticBadge>
            </li>
          ))}
        </ul>
      </section>

      {/* Historikk per barn */}
      <section className="space-y-4">
        <div className="flex items-baseline gap-2">
          <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
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
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="truncate text-[14px] font-bold tracking-[-0.005em] text-foreground">
                  {b.child.name}
                </h3>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                  {uker.length} uke{uker.length === 1 ? "" : "r"}
                </span>
              </div>

              {uker.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-8 text-center">
                  <Activity
                    className="h-6 w-6 text-muted-foreground/40"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="mt-2.5 text-[13px] text-muted-foreground">
                    Ingen registrerte økter siste 4 uker.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {uker.map((u) => (
                    <UkeRad key={u.uke} u={u} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </section>

      {/* Lesemodus-notis */}
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-card p-4">
        <TrendingUp
          className="h-4 w-4 shrink-0 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Tallene er hentet fra spillerens fullførte treningsøkter. PDF-arkiv over
          tidligere ukerapporter kommer i en senere versjon.
        </p>
      </div>
    </div>
  );
}

// ── Panel-header (mono-caps) ──────────────────────────────────────
function PanelHead({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      <Icon
        className="h-3.5 w-3.5 text-muted-foreground"
        strokeWidth={2}
        aria-hidden
      />
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
        {label}
      </span>
    </div>
  );
}

// ── Uke-rad — data-tett ───────────────────────────────────────────
function UkeRad({ u }: { u: UkeData }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="font-display text-[15px] font-semibold -tracking-[0.01em] text-foreground">
          Uke {u.uke}
        </div>
        <div className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          <CalendarRange className="h-3 w-3" strokeWidth={1.75} aria-hidden />
          Fra {NB_DATO.format(u.start)}
        </div>
      </div>
      <dl className="flex items-center gap-5">
        <div className="text-right">
          <dt className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            <Activity className="h-3 w-3" strokeWidth={1.75} aria-hidden />
            Økter
          </dt>
          <dd className="mt-1 font-mono text-[15px] font-bold tabular-nums text-foreground">
            {u.okter}
          </dd>
        </div>
        <div className="text-right">
          <dt className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            <Star className="h-3 w-3" strokeWidth={1.75} aria-hidden />
            Rating
          </dt>
          <dd className="mt-1 font-mono text-[15px] font-bold tabular-nums text-foreground">
            {u.rating != null ? `${u.rating}/5` : "—"}
          </dd>
        </div>
      </dl>
    </li>
  );
}

// ── Ingen barn koblet ─────────────────────────────────────────────
function IngenBarn() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Mail className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="mt-4 font-display text-[16px] font-semibold -tracking-[0.01em] text-foreground">
        Ingen barn koblet til kontoen din
      </p>
      <p className="mt-1.5 font-sans text-[13.5px] leading-[1.5] text-muted-foreground">
        Når et barn kobles til, mottar du ukerapport om treningen deres her.
      </p>
    </div>
  );
}
