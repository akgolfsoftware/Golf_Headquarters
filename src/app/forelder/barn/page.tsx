/**
 * Foreldreportal · /forelder/barn — mobil-first 430px.
 *
 * Liste over alle koblede barn som store, klikkbare "fremgang"-kort.
 * Port mot [historisk fasit, fjernet 2026-07-03] _prompts/SKJERMER-RUNDE-8-FORELDRE-MARKETING-MISC.md
 * (foreldre-portal — varm tone, luftig spacing). Hvert kort viser barnets
 * fremgang i kortform: pyramide-snapshot, økter (30 d), neste kommende økt og
 * utestående betaling. Detalj ligger på /forelder/barn/[childId].
 *
 * Ekte data via prisma.parentRelation + barnets user-data. Tall fra DB —
 * aldri hardkodet. Manglende data → "—"/utledet tomtilstand.
 * DS-tokens + athletic-primitiver. Ingen hex, ingen emoji (kun lucide).
 */

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Coins,
  Layers,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { ForelderHero } from "@/components/forelder/forelder-hero";
import { PyramidProgress, type PyramidRow } from "@/components/athletic";
import type { PyramidArea } from "@/generated/prisma/client";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

// Pyramide-akse → label + DS-token-tone (matcher daily-brief sin akse-fargelogikk).
const AKSE: { key: PyramidArea; label: string; tone: PyramidRow["tone"] }[] = [
  { key: "FYS", label: "Fys", tone: "pyr-fys" },
  { key: "TEK", label: "Tek", tone: "pyr-tek" },
  { key: "SLAG", label: "Slag", tone: "pyr-slag" },
  { key: "SPILL", label: "Spill", tone: "pyr-spill" },
  { key: "TURN", label: "Turn", tone: "pyr-turn" },
];

function ore(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(n / 100);
}

// ── Eyebrow (mono-caps seksjons-tittel) ──────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </div>
  );
}

export default async function MineBarn() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  if (barn.length === 0) {
    return (
      <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-24 pt-6">
        <ForelderHero
          eyebrow="Foreldreportal · Barn"
          titleLead="Mine"
          titleItalic="barn"
          sub="Velg et barn for å følge treningen."
        />
        <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <UserRound className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </span>
          <p className="mt-4 font-display text-[16px] font-semibold -tracking-[0.01em] text-foreground">
            Ingen barn koblet til kontoen din
          </p>
          <p className="mt-1.5 font-sans text-[13.5px] leading-[1.5] text-muted-foreground">
            Be spilleren sende en invitasjon, eller kontakt coachen din.
          </p>
        </div>
      </div>
    );
  }

  const childIds = barn.map((b) => b.child.id);
  const now = new Date();
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);

  const [nesteOkter, sisteLogger, betalingerRad] = await Promise.all([
    // Neste planlagte/aktive økt per barn.
    prisma.trainingPlanSession.findMany({
      where: {
        plan: { userId: { in: childIds } },
        status: { in: ["PLANNED", "ACTIVE"] },
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        scheduledAt: true,
        title: true,
        plan: { select: { userId: true } },
      },
    }),
    // Gjennomførte økter siste 30 dager — gir antall + pyramide-fordeling.
    prisma.trainingPlanSessionLog.findMany({
      where: {
        completedAt: { gte: tretti, not: null },
        session: { plan: { userId: { in: childIds } } },
      },
      select: {
        session: {
          select: {
            pyramidArea: true,
            plan: { select: { userId: true } },
          },
        },
      },
    }),
    // Utestående betalinger (PENDING/FAILED) per barn.
    prisma.payment.findMany({
      where: { userId: { in: childIds }, status: { in: ["PENDING", "FAILED"] } },
      select: { userId: true, amountOre: true },
    }),
  ]);

  // Neste økt per barn.
  const nesteOktPerBarn = new Map<
    string,
    { scheduledAt: Date; title: string } | null
  >();
  for (const id of childIds) nesteOktPerBarn.set(id, null);
  for (const s of nesteOkter) {
    if (!nesteOktPerBarn.get(s.plan.userId)) {
      nesteOktPerBarn.set(s.plan.userId, {
        scheduledAt: s.scheduledAt,
        title: s.title,
      });
    }
  }

  // Økt-antall + pyramide-fordeling per barn (siste 30 d).
  const okterPerBarn = new Map<string, number>();
  const aksePerBarn = new Map<string, Record<PyramidArea, number>>();
  for (const id of childIds) {
    okterPerBarn.set(id, 0);
    aksePerBarn.set(id, { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });
  }
  for (const l of sisteLogger) {
    const uid = l.session.plan.userId;
    okterPerBarn.set(uid, (okterPerBarn.get(uid) ?? 0) + 1);
    const fordeling = aksePerBarn.get(uid);
    if (fordeling) fordeling[l.session.pyramidArea] += 1;
  }

  // Utestående betaling per barn.
  const utestaaendePerBarn = new Map<string, { antall: number; ore: number }>();
  for (const id of childIds) utestaaendePerBarn.set(id, { antall: 0, ore: 0 });
  for (const p of betalingerRad) {
    if (!p.userId) continue;
    const agg = utestaaendePerBarn.get(p.userId);
    if (agg) {
      agg.antall += 1;
      agg.ore += p.amountOre;
    }
  }

  return (
    <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-24 pt-6">
      <ForelderHero
        eyebrow="Foreldreportal · Barn"
        titleLead="Mine"
        titleItalic="barn"
        sub={`${barn.length} barn koblet til kontoen din. Trykk for å se hele treningsprofilen.`}
      />

      <ul className="flex flex-col gap-4">
        {barn.map((b) => {
          const id = b.child.id;
          const neste = nesteOktPerBarn.get(id);
          const okter = okterPerBarn.get(id) ?? 0;
          const fordeling =
            aksePerBarn.get(id) ??
            ({ FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 } as Record<
              PyramidArea,
              number
            >);
          const utestaaende = utestaaendePerBarn.get(id) ?? {
            antall: 0,
            ore: 0,
          };
          const initial = b.child.name.trim().charAt(0).toUpperCase() || "?";
          const fornavn = b.child.name.split(" ")[0];
          const etternavn = b.child.name.split(" ").slice(1).join(" ");

          // Pyramide-rader: prosent av totale økter per akse (fra ekte logger).
          const pyramidRows: PyramidRow[] = AKSE.map((a) => {
            const antall = fordeling[a.key];
            const pct = okter > 0 ? Math.round((antall / okter) * 100) : 0;
            return {
              label: a.label,
              fillPercent: pct,
              value: String(antall),
              tone: a.tone,
            };
          });

          return (
            <li key={id}>
              <Link
                href={`/forelder/barn/${id}`}
                className="block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Topp: avatar + navn + HCP */}
                <div className="flex items-center gap-3.5 p-5">
                  <span
                    aria-hidden
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary font-display text-[20px] font-semibold text-primary-foreground"
                  >
                    {initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      {b.relationship} · HCP {b.child.hcp ?? "—"}
                    </div>
                    <h2 className="mt-0.5 truncate font-display text-[19px] font-semibold -tracking-[0.01em] text-foreground">
                      <em className="font-normal italic text-primary">
                        {fornavn}
                      </em>
                      {etternavn ? ` ${etternavn}` : ""}
                    </h2>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                    aria-hidden
                  />
                </div>

                {/* Pyramide-snapshot (siste 30 d) */}
                <div className="border-t border-border px-5 py-4">
                  <SectionLabel>
                    <Layers className="h-3 w-3" strokeWidth={2} aria-hidden />
                    Pyramide · siste 30 dager
                  </SectionLabel>
                  {okter > 0 ? (
                    <PyramidProgress rows={pyramidRows} />
                  ) : (
                    <p className="font-sans text-[12.5px] text-muted-foreground">
                      Ingen fullførte økter ennå.
                    </p>
                  )}
                </div>

                {/* Nøkkeltall: økter · neste · betaling */}
                <dl className="grid grid-cols-3 border-t border-border">
                  <Stat
                    icon={TrendingUp}
                    label="Økter"
                    value={String(okter)}
                    border
                  />
                  <Stat
                    icon={CalendarClock}
                    label="Neste"
                    value={neste ? NB_DATO.format(neste.scheduledAt) : "—"}
                    border
                  />
                  <Stat
                    icon={Coins}
                    label="Utestående"
                    value={
                      utestaaende.antall > 0 ? ore(utestaaende.ore) : "0 kr"
                    }
                    alert={utestaaende.antall > 0}
                  />
                </dl>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Nøkkeltall-celle ─────────────────────────────────────────────
function Stat({
  icon: Icon,
  label,
  value,
  border,
  alert,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  border?: boolean;
  alert?: boolean;
}) {
  return (
    <div className={`px-3 py-3.5 ${border ? "border-r border-border" : ""}`}>
      <dt className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        <Icon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
        {label}
      </dt>
      <dd
        className={`mt-1 font-mono text-[13px] font-bold tabular-nums ${
          alert ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
