/**
 * CoachHQ — Kapasitet (ukes-visning)
 *
 * Viser booking-belegg per dag (man–søn) med progress-bar,
 * og antall slots / booket / ledig per dag.
 * Klikk "Legg til tilgjengelighet" → navigerer til /admin/availability.
 */

import Link from "next/link";
import { CalendarPlus, CalendarDays } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

const DAGSNAVN = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

/** Mandag i gjeldende uke (00:00:00 lokal tid). */
function ukeStart(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  const dag = c.getDay(); // 0 = søndag
  const diff = (dag + 6) % 7; // antall dager tilbake til mandag
  c.setDate(c.getDate() - diff);
  return c;
}

/** Beregn ISO uke-nummer. */
function ukeNummer(d: Date): number {
  const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  iso.setUTCDate(iso.getUTCDate() + 4 - (iso.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(iso.getUTCFullYear(), 0, 1));
  return Math.ceil(((iso.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Max antall slots per dag — brukes som kapasitets-taket i progress-bar. */
const MAX_SLOTS_PER_DAG = 8;

export default async function CapacityPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const idag = new Date();
  const weekStart = ukeStart(idag);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const ukeNr = ukeNummer(idag);

  const bookinger = await prisma.booking.findMany({
    where: {
      startAt: { gte: weekStart, lt: weekEnd },
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    select: {
      id: true,
      startAt: true,
      status: true,
      user: { select: { name: true } },
      serviceType: { select: { name: true, durationMin: true } },
      location: { select: { name: true } },
    },
    orderBy: { startAt: "asc" },
  });

  // Bygg per-dag-data (0 = mandag, 6 = søndag)
  const dager = DAGSNAVN.map((navn, i) => {
    const dato = new Date(weekStart);
    dato.setDate(weekStart.getDate() + i);

    const dagensBokinger = bookinger.filter((b) => {
      const bd = new Date(b.startAt);
      return (
        bd.getFullYear() === dato.getFullYear() &&
        bd.getMonth() === dato.getMonth() &&
        bd.getDate() === dato.getDate()
      );
    });

    const booket = dagensBokinger.length;
    const ledig = Math.max(0, MAX_SLOTS_PER_DAG - booket);
    const pct = Math.min(100, Math.round((booket / MAX_SLOTS_PER_DAG) * 100));
    const erIdag =
      dato.getFullYear() === idag.getFullYear() &&
      dato.getMonth() === idag.getMonth() &&
      dato.getDate() === idag.getDate();

    return { navn, dato, booket, ledig, pct, erIdag, bookinger: dagensBokinger };
  });

  const totalBooket = bookinger.length;
  const totalLedig = dager.reduce((s, d) => s + d.ledig, 0);
  const snittBelegg = Math.round((totalBooket / (MAX_SLOTS_PER_DAG * 7)) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`CoachHQ · Kapasitet · uke ${ukeNr}`}
        titleLead="Kapasitet"
        titleItalic="· denne uka"
        sub={`Mandag–søndag · maks ${MAX_SLOTS_PER_DAG} slots per dag`}
        actions={
          <Link
            href="/admin/availability"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <CalendarPlus className="h-4 w-4" />
            Legg til tilgjengelighet
          </Link>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Bookinger denne uka" value={String(totalBooket)} foot={`av ${MAX_SLOTS_PER_DAG * 7} mulige slots`} />
        <Kpi label="Ledige slots" value={String(totalLedig)} foot="gjenstående denne uka" />
        <Kpi label="Snitt-belegg" value={String(snittBelegg)} unit="%" foot={snittBelegg >= 70 ? "Høy etterspørsel" : "Kapasitet tilgjengelig"} />
      </div>

      {/* Ukes-grid */}
      <section className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-[18px] font-semibold tracking-tight">
              Uke {ukeNr}
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {weekStart.toLocaleDateString("nb-NO", { day: "numeric", month: "long" })}
              {" – "}
              {new Date(weekEnd.getTime() - 1).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{totalBooket} bookinger totalt</span>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-7 sm:divide-x sm:divide-y-0">
          {dager.map((dag) => (
            <DagKolonne key={dag.navn} dag={dag} />
          ))}
        </div>
      </section>

      {/* Booking-liste for dag */}
      <section className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-display text-[18px] font-semibold tracking-tight">
            Alle bookinger denne uka
          </h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Sortert etter tidspunkt
          </p>
        </div>

        {bookinger.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <CalendarDays size={22} strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-medium text-foreground">Ingen bookinger denne uka</p>
            <p className="text-[13px] text-muted-foreground">
              Legg til tilgjengelighet for å åpne slots for booking.
            </p>
            <Link
              href="/admin/availability"
              className="mt-2 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <CalendarPlus className="h-4 w-4" />
              Legg til tilgjengelighet
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden">
            {bookinger.map((b) => (
              <div
                key={b.id}
                className="grid items-center gap-4 border-b border-border px-6 py-3.5 last:border-b-0 hover:bg-secondary/40 sm:grid-cols-[140px_1fr_160px_120px]"
              >
                <div className="font-mono text-[12px] text-foreground tabular-nums">
                  {b.startAt.toLocaleDateString("nb-NO", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  <span className="block text-[11px] text-muted-foreground">
                    {b.startAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-foreground">
                    {b.user.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {b.location.name}
                  </div>
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {b.serviceType.name}
                  <span className="block font-mono text-[11px]">
                    {b.serviceType.durationMin} min
                  </span>
                </div>
                <div className="flex justify-end">
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="flex items-center justify-between border-t border-border pt-4 text-[12px] text-muted-foreground">
        <span>AK Golf Platform · CoachHQ · /admin/capacity</span>
        <span className="font-mono">
          Uke {ukeNr} · {totalBooket} bookinger
        </span>
      </footer>
    </div>
  );
}

// -------------- Komponenter --------------

function DagKolonne({
  dag,
}: {
  dag: {
    navn: string;
    dato: Date;
    booket: number;
    ledig: number;
    pct: number;
    erIdag: boolean;
    bookinger: { id: string; startAt: Date; user: { name: string }; serviceType: { name: string } }[];
  };
}) {
  return (
    <div
      className={`flex flex-col gap-2 p-4 ${
        dag.erIdag ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <div>
          <div
            className={`font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${
              dag.erIdag ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {dag.navn.slice(0, 3)}
          </div>
          <div
            className={`font-mono text-[18px] font-medium leading-none tabular-nums ${
              dag.erIdag ? "text-primary" : "text-foreground"
            }`}
          >
            {dag.dato.getDate()}
          </div>
        </div>
        {dag.erIdag && (
          <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-primary-foreground">
            I dag
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${dag.pct}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>{dag.booket} booket</span>
        <span>{dag.ledig} ledig</span>
      </div>

      {/* Booking-liste (kompakt) */}
      {dag.bookinger.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
          {dag.bookinger.slice(0, 3).map((b) => (
            <div
              key={b.id}
              className="rounded-md bg-secondary px-2 py-1.5 text-[11px]"
            >
              <div className="font-mono text-[10px] text-muted-foreground tabular-nums">
                {b.startAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="truncate font-medium text-foreground">
                {b.user.name}
              </div>
              <div className="truncate text-[10px] text-muted-foreground">
                {b.serviceType.name}
              </div>
            </div>
          ))}
          {dag.bookinger.length > 3 && (
            <div className="text-center font-mono text-[10px] text-muted-foreground">
              +{dag.bookinger.length - 3} til
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-accent/30 text-primary",
    PENDING: "bg-muted text-muted-foreground",
    CANCELLED: "bg-destructive/15 text-destructive",
    NO_SHOW: "bg-destructive/15 text-destructive",
  };
  const labels: Record<string, string> = {
    CONFIRMED: "Bekreftet",
    PENDING: "Venter",
    CANCELLED: "Kansellert",
    NO_SHOW: "Ikke møtt",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${
        styles[status] ?? "bg-secondary text-muted-foreground"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function Kpi({
  label,
  value,
  unit,
  foot,
}: {
  label: string;
  value: string;
  unit?: string;
  foot?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-mono text-[32px] font-medium leading-none tabular-nums text-foreground">
        {value}
        {unit && (
          <span className="text-[14px] font-normal text-muted-foreground">{unit}</span>
        )}
      </div>
      {foot && (
        <div className="mt-4 text-[12px] text-muted-foreground">{foot}</div>
      )}
    </div>
  );
}
