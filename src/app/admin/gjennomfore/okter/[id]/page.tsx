/**
 * /admin/gjennomfore/okter/[id] — Økt-detalj (coach-context)
 *
 * Variant A "Stacked sections" fra Claude Design-bundle Sg2FEKvykU45c4naIgQx6w
 * (s4-okt-detalj.jsx).
 *
 * Status-pill bytter farge basert på tid (OM 2 TIMER / AKTIV NÅ / GJENNOMFØRT).
 * Sticky CTA-bar nederst på mobile.
 */

import { Tag, Button } from "@/components/athletic/golfdata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pause, ChevronsRight, GripVertical, Star } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { calculateAge } from "@/lib/auth/minor";
import { prisma } from "@/lib/prisma";
import { buttonClasses } from "@/components/ui/button";
import { DetailShell } from "@/components/shared/detail-shell";
import { AvlysOktKnapp } from "./avlys-okt-knapp";
import { StartOktKnapp } from "./start-okt-knapp";

export const dynamic = "force-dynamic";

type Status = "OM 2 TIMER" | "AKTIV NÅ" | "GJENNOMFØRT";

const SESSION_DRILLS = [
  { name: "Oppvarming · 5m putts", category: "PUTT", mins: "4 min", reps: "20", done: 20, target: 20 },
  { name: "Gate-putt med start-linje", category: "PUTT", mins: "5 min", reps: "8 av 10", done: 7, target: 10 },
  { name: "Lag-på-lag stige 1m → 3m", category: "PUTT", mins: "6 min", reps: "8 av 10", done: 4, target: 10 },
  { name: "Speed-kontroll 6m", category: "PUTT", mins: "3 min", reps: "70% inn ±0,5m", done: 0, target: 10 },
  { name: "Free-throw · 3 av 5 fra 2,5m", category: "PUTT", mins: "2 min", reps: "3 av 5", done: 0, target: 5 },
];

function deriveStatus(start: Date, durationMin: number): Status {
  const now = Date.now();
  const startMs = start.getTime();
  const endMs = startMs + durationMin * 60 * 1000;
  if (now < startMs) return "OM 2 TIMER";
  if (now >= startMs && now <= endMs) return "AKTIV NÅ";
  return "GJENNOMFØRT";
}

export default async function OktDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  // Hent økt via Booking-modellen (closest match til "økt" coach-context).
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          hcp: true,
          dateOfBirth: true,
          wagrSnapshot: { select: { rank: true } },
        },
      },
    },
  });

  if (!booking || !booking.user) notFound();

  // Slå opp fasilitet separat (relasjon ikke definert som connect i Prisma-typen)
  const facility = booking.facilityId
    ? await prisma.facility
        .findUnique({
          where: { id: booking.facilityId },
          select: { id: true, name: true },
        })
        .catch(() => null)
    : null;

  const durationMin = Math.round(
    (booking.endAt.getTime() - booking.startAt.getTime()) / 60000,
  );
  const status = deriveStatus(booking.startAt, durationMin);
  const dateLabel = booking.startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const startTime = booking.startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = booking.endAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const spiller = booking.user;
  const initials = spiller.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  // Tag mangler warn-variant (DS-gap meldt) — outline + warning-tokens til DS får en.
  const statusBadgeVariant: "outline" | "live" | "neutral" =
    status === "OM 2 TIMER" ? "outline" : status === "AKTIV NÅ" ? "live" : "neutral";
  const statusBadgeStyle =
    status === "OM 2 TIMER"
      ? { color: "var(--warning)", borderColor: "var(--warning-border)" }
      : undefined;

  // Spiller-meta fra ekte kilder (dateOfBirth + WagrSnapshot). «—» når mangler.
  const alder = calculateAge(spiller.dateOfBirth);
  const wagrRank = spiller.wagrSnapshot?.rank ?? null;
  const spillerMeta = [
    `HCP ${spiller.hcp != null ? spiller.hcp : "—"}`,
    wagrRank != null ? `WAGR ${wagrRank.toLocaleString("nb-NO")}` : null,
    alder != null ? `${alder} år` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const heroTitle = (
    <>
      {spiller.name.split(" ")[0]}{" "}
      {spiller.name.split(" ").slice(-1)[0][0]}.P. ·{" "}
      <em
        className="font-normal not-italic"
        style={{
          fontFamily: "var(--font-familjen-grotesk), sans-serif",
          fontStyle: "italic",
          color: "hsl(var(--primary))",
        }}
      >
        putt-fokus
      </em>
    </>
  );

  return (
    <div className="pb-24 md:pb-6">
      <DetailShell
        breadcrumb={[
          { label: "Gjennomføre", href: "/admin/gjennomfore" },
          { label: "Økter", href: "/admin/gjennomfore" },
          { label: spiller.name.split(" ")[0] },
        ]}
        backHref="/admin/gjennomfore"
        title={heroTitle}
        subtitle={`${dateLabel} · ${startTime}–${endTime} · ${facility?.name ?? "Studio"} · ${durationMin} min · TrackMan Bridge`}
        statusPill={
          <Tag variant={statusBadgeVariant} style={statusBadgeStyle}>{status}</Tag>
        }
        actions={
          <div className="hidden flex-wrap gap-2 md:flex">
            {status !== "GJENNOMFØRT" ? (
              <>
                {/* Reschedule: ingen dedikert flytt-tid-UI for Booking finnes ennå.
                    Lenker til Bookinger der økten faktisk forvaltes (avlys + ny). */}
                <Link
                  href="/admin/bookinger"
                  className={buttonClasses({ variant: "ghost-light", size: "sm" })}
                >
                  Reschedule
                </Link>
                <AvlysOktKnapp bookingId={booking.id} spillerNavn={spiller.name} />
                {/* Start økt / Åpne live-konsoll: kobler Booking til en
                    TrainingSessionV2 (Booking↔live-konsoll-broen) og navigerer
                    til /admin/live/[sessionId]/brief. */}
                <StartOktKnapp
                  bookingId={booking.id}
                  label={status === "AKTIV NÅ" ? "Åpne live-konsoll" : "Start økt"}
                />
              </>
            ) : (
              <>
                {/* Eksporter: ingen eksport-generator for økt-detalj finnes. */}
                <Button variant="ghost" size="sm" disabled>
                  Eksporter
                </Button>
                {/* Skriv oppfølging: coach-oppsummering/feedback bor i live-
                    konsollens summary. Lenker dit hvis økten er koblet til en
                    TrainingSessionV2 — ellers deaktivert (ingen økt å skrive på). */}
                {booking.trainingSessionV2Id ? (
                  <Link
                    href={`/admin/live/${booking.trainingSessionV2Id}/summary`}
                    className={buttonClasses({ variant: "lime", size: "sm" })}
                  >
                    Skriv oppfølging
                  </Link>
                ) : (
                  <Button variant="signal" size="sm" disabled>
                    Skriv oppfølging
                  </Button>
                )}
              </>
            )}
          </div>
        }
      >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Venstre: live-status + drills + notater */}
        <div className="flex flex-col gap-6">
          {status === "AKTIV NÅ" ? <LiveProgressStrip drills={SESSION_DRILLS} /> : null}

          {/* Planlagt innhold */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <header className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-base font-semibold">Planlagt innhold</h2>
              <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                {SESSION_DRILLS.length} drills · {durationMin} min
              </span>
            </header>
            <ul className="space-y-2">
              {SESSION_DRILLS.map((d, i) => {
                const isActive = status === "AKTIV NÅ" && i === 2;
                return (
                  <li
                    key={d.name}
                    className={`grid grid-cols-[20px_1fr_auto] items-center gap-2 rounded-xl border px-4 py-2 ${
                      isActive
                        ? "border-primary bg-accent/10"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono rounded-full bg-amber-100 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-amber-800">
                          {d.category}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                          {d.mins} · mål {d.reps}
                        </span>
                      </div>
                      <div className="font-display text-sm font-semibold">{d.name}</div>
                    </div>
                    <div className="text-right">
                      {status === "GJENNOMFØRT" ? (
                        <div className="font-mono text-sm font-bold tabular-nums text-emerald-700">
                          {d.done}/{d.target}
                        </div>
                      ) : null}
                      {isActive ? (
                        <span className="font-mono inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> NÅ
                        </span>
                      ) : null}
                      {status === "OM 2 TIMER" ? (
                        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                          VENTER
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Notater */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display mb-4 text-base font-semibold">Notater</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  PREP · DU SKREV
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-familjen-grotesk), sans-serif", fontStyle: "italic" }}
                >
                  «{spiller.name.split(" ")[0]} klagde forrige uke over at start-linja
                  vandret på lange putts. Kjør gate-drill først for å re-kalibrere — så
                  bygge tilbake til speed-kontroll.»
                </p>
              </div>
              <div>
                <div className="font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  {spiller.name.split(" ")[0].toUpperCase()} ØNSKET
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-familjen-grotesk), sans-serif", fontStyle: "italic" }}
                >
                  «Vil ha hjelp med å lese rake-greener — Olyo Tour på Larvik har mye
                  sidefall.»
                </p>
              </div>
            </div>
          </section>

          {/* Etter økt */}
          {status === "GJENNOMFØRT" ? (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display mb-4 text-base font-semibold">Etter økt</h2>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border py-2">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                  RATING
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i <= 4 ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                  {spiller.name.split(" ")[0]} · 4/5
                </div>
              </div>
              <div className="py-2">
                <div className="font-mono mb-1.5 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  COACH-OPPSUMMERING
                </div>
                <p className="text-sm leading-relaxed">
                  Solid økt — start-linje 1,4° SD (mål 1,5°). Speed-drill skummelt på 6m,
                  bør gjentas neste uke.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="signal" size="sm">
                  Bok neste økt → onsdag 04.06
                </Button>
              </div>
            </section>
          ) : null}
        </div>

        {/* Høyre: spiller-info */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                {initials}
              </div>
              <div>
                <div className="font-display text-base font-semibold">{spiller.name}</div>
                <div className="font-mono mt-0.5 text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                  {spillerMeta}
                </div>
              </div>
            </div>
            <div className="font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              SISTE 5 ØKTER
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { l: "P", d: "25.05" },
                { l: "T", d: "22.05" },
                { l: "P", d: "20.05" },
                { l: "F", d: "17.05" },
                { l: "P", d: "15.05" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-md bg-muted/40 p-2 text-center"
                >
                  <div className="font-mono text-[9px] text-muted-foreground">{s.d}</div>
                  <div className="font-mono mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold text-amber-800">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
      </DetailShell>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-4 py-2 md:hidden">
        <div className="flex gap-2">
          {status !== "GJENNOMFØRT" ? (
            <>
              <Link
                href="/admin/bookinger"
                className={buttonClasses({
                  variant: "ghost-light",
                  size: "md",
                  className: "flex-1",
                })}
              >
                Reschedule
              </Link>
              {/* Kobler Booking til en TrainingSessionV2 og åpner live-konsollen. */}
              <StartOktKnapp
                bookingId={booking.id}
                label={status === "AKTIV NÅ" ? "Åpne live" : "Start"}
                size="md"
                fullWidth
              />
            </>
          ) : booking.trainingSessionV2Id ? (
            // Lenker til live-konsollens summary der coach-oppfølgingen bor.
            <Link
              href={`/admin/live/${booking.trainingSessionV2Id}/summary`}
              className={buttonClasses({
                variant: "lime",
                size: "md",
                className: "w-full",
              })}
            >
              Skriv oppfølging
            </Link>
          ) : (
            // Ingen koblet økt — ingenting å skrive oppfølging på ennå.
            <Button variant="signal" size="md" className="w-full" disabled>
              Skriv oppfølging
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function LiveProgressStrip({ drills }: { drills: typeof SESSION_DRILLS }) {
  const done = drills.filter((d) => d.done > 0).length;
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-white"
      style={{
        background: "linear-gradient(135deg, var(--forest-deep) 0%, var(--forest) 100%)",
      }}
    >
      <div className="absolute -right-5 -top-10 h-44 w-44 rounded-full bg-accent/15 blur-2xl" />
      <div className="relative mb-4 flex items-center justify-between">
        <span className="font-mono inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> AKTIV NÅ
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-white/70">
          14:08 · 8 min gått
        </span>
      </div>
      <div className="relative grid grid-cols-[1fr_auto] items-end gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-white/55">
            NÅVÆRENDE DRILL · {done}/{drills.length}
          </div>
          <div className="font-display mt-1 text-lg font-semibold">
            Lag-på-lag stige 1m → 3m
          </div>
          <div className="font-mono mt-1 text-[11px] text-accent/80">
            4 av 10 inn · 40% hit-rate
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Pause"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <Pause className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="font-mono inline-flex h-9 items-center gap-1 rounded-full bg-accent px-4 text-[11px] font-bold uppercase tracking-[0.08em] text-foreground"
          >
            <ChevronsRight className="h-3.5 w-3.5" /> Neste
          </button>
        </div>
      </div>
      <div className="relative mt-4 flex gap-1">
        {drills.map((d, i) => {
          const pct = d.target > 0 ? (d.done / d.target) * 100 : 0;
          return (
            <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
