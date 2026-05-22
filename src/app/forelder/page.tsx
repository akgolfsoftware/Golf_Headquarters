// Foreldreportal — Oversikt. Hero + barn-kort + neste-økt-strip + faktura-card.

import Link from "next/link";
import {
  CalendarDays,
  TrendingUp,
  Star,
  AlertTriangle,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { AthleticAvatar, AthleticEyebrow } from "@/components/athletic";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  weekday: "short",
});

const NB_KORT = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

function ore(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(n / 100);
}

export default async function ForelderHjem() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  if (barn.length === 0) {
    return (
      <div className="space-y-6">
        <ForelderHero
          name={user.name}
          avatarUrl={user.avatarUrl ?? null}
          sub="Du er ikke koblet til noen barn ennå."
        />
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Be spilleren sende en ny invitasjon, eller kontakt support.
        </div>
      </div>
    );
  }

  // For hvert barn: neste planlagte økt + siste rating
  const barnMedKontekst = await Promise.all(
    barn.map(async (b) => {
      const [nesteOkt, sisteLogg] = await Promise.all([
        prisma.trainingPlanSession.findFirst({
          where: {
            plan: { userId: b.child.id },
            status: { in: ["PLANNED", "ACTIVE"] },
            scheduledAt: { gte: new Date() },
          },
          orderBy: { scheduledAt: "asc" },
          select: { title: true, scheduledAt: true, pyramidArea: true },
        }),
        prisma.trainingPlanSessionLog.findFirst({
          where: {
            completedAt: { not: null },
            session: { plan: { userId: b.child.id } },
          },
          orderBy: { completedAt: "desc" },
          select: { rating: true, completedAt: true },
        }),
      ]);
      return { ...b, nesteOkt, sisteLogg };
    }),
  );

  const childIds = barn.map((b) => b.child.id);
  const sistePayments = await prisma.payment.findMany({
    where: { userId: { in: childIds } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { user: { select: { id: true, name: true } } },
  });

  const ubetalte = sistePayments.filter(
    (p) => p.status === "PENDING" || p.status === "FAILED",
  );

  // Kommende økter på tvers av alle barn (7 dager)
  const omEnUke = new Date();
  omEnUke.setDate(omEnUke.getDate() + 7);
  const kommendeOkter = await prisma.trainingPlanSession.findMany({
    where: {
      plan: { userId: { in: childIds } },
      status: { in: ["PLANNED", "ACTIVE"] },
      scheduledAt: { gte: new Date(), lte: omEnUke },
    },
    orderBy: { scheduledAt: "asc" },
    take: 5,
    include: {
      plan: {
        select: { user: { select: { id: true, name: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <ForelderHero
        name={user.name}
        avatarUrl={user.avatarUrl ?? null}
        sub={`Du følger ${barn.length === 1 ? "ett barn" : `${barn.length} barn`} i AK Golf.`}
      />

      {/* Krever oppmerksomhet — ubetalte fakturaer */}
      {ubetalte.length > 0 && (
        <section
          aria-labelledby="krever-oppmerksomhet"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle
              className="h-5 w-5 flex-shrink-0 text-destructive"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div className="flex-1">
              <h2
                id="krever-oppmerksomhet"
                className="font-display text-base font-semibold tracking-tight"
              >
                {ubetalte.length} ubetalt
                {ubetalte.length === 1 ? "" : "e"} faktura
                {ubetalte.length === 1 ? "" : "er"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Krever handling. Se{" "}
                <Link
                  href="/forelder/fakturaer"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Fakturaer
                </Link>{" "}
                for detaljer.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Barn-cards */}
      <section
        aria-labelledby="barn-overskrift"
        className={`grid gap-4 ${
          barn.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        <h2 id="barn-overskrift" className="sr-only">
          Dine barn
        </h2>
        {barnMedKontekst.map((b) => (
          <Link
            key={b.child.id}
            href={`/forelder/barn/${b.child.id}`}
            className="block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {b.relationship} · HCP {b.child.hcp ?? "—"}
            </div>
            <h3 className="mt-1 font-display text-2xl">
              <em className="italic">{b.child.name.split(" ")[0]}</em>{" "}
              {b.child.name.split(" ").slice(1).join(" ")}
            </h3>

            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <CalendarDays
                    className="h-3 w-3"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  Neste økt
                </dt>
                <dd className="mt-1 font-semibold">
                  {b.nesteOkt
                    ? `${NB_DATO.format(b.nesteOkt.scheduledAt)} · ${b.nesteOkt.title}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <Star
                    className="h-3 w-3"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  Siste rating
                </dt>
                <dd className="mt-1 font-semibold">
                  {b.sisteLogg?.rating != null
                    ? `${b.sisteLogg.rating}/5`
                    : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <TrendingUp
                className="h-3.5 w-3.5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              Se full profil
              <ChevronRight
                className="h-3.5 w-3.5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
          </Link>
        ))}
      </section>

      {/* Neste-økt-strip + Fakturaer-card */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kommende økter */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Kommende økter
              <span className="ml-2 font-normal italic text-muted-foreground">
                · neste 7 dager
              </span>
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {kommendeOkter.length} planlagt
            </span>
          </div>
          {kommendeOkter.length === 0 ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Ingen planlagte økter de neste 7 dagene.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {kommendeOkter.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{s.title}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {s.plan.user.name.split(" ")[0]} · {s.pyramidArea}
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                    {NB_DATO.format(s.scheduledAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Siste fakturaer */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
            <h2 className="inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight">
              <CreditCard
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              Siste fakturaer
            </h2>
            <Link
              href="/forelder/fakturaer"
              className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
            >
              Se alle
            </Link>
          </div>
          {sistePayments.length === 0 ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Ingen fakturaer registrert.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {sistePayments.slice(0, 4).map((p) => {
                const betalt = p.status === "SUCCEEDED";
                const failed = p.status === "FAILED";
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-4 px-6 py-4 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        {p.description ?? p.type}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        {p.user?.name?.split(" ")[0] ?? "—"} ·{" "}
                        {NB_KORT.format(p.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-semibold tabular-nums">
                        {ore(p.amountOre)}
                      </span>
                      <span
                        className={`rounded-full px-4 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                          betalt
                            ? "bg-primary/10 text-primary"
                            : failed
                              ? "bg-destructive/10 text-destructive"
                              : "bg-accent/30 text-accent-foreground"
                        }`}
                      >
                        {betalt ? "Betalt" : failed ? "Feilet" : "Ubetalt"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function ForelderHero({
  name,
  avatarUrl,
  sub,
}: {
  name: string;
  avatarUrl: string | null;
  sub: string;
}) {
  const initials =
    name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??";
  const firstName = name.split(" ")[0] ?? name;
  const hour = new Date().getHours();
  const greeting =
    hour < 10 ? "God morgen" : hour < 17 ? "God dag" : hour < 22 ? "God kveld" : "God natt";

  return (
    <section>
      <AthleticEyebrow>FORELDREPORTAL · OVERSIKT</AthleticEyebrow>
      <div className="mt-3 flex items-center gap-4">
        <AthleticAvatar
          src={avatarUrl ?? undefined}
          initials={initials}
          size="xl"
          borderColor="white"
          className="shadow-[0_8px_24px_rgba(0,88,64,0.18)]"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {greeting},{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                color: "#005840",
              }}
            >
              {firstName}
            </em>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>
        </div>
      </div>
    </section>
  );
}
