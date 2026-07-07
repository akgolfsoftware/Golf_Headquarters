/**
 * AgencyOS — Gruppe-timeplan (PR9 · Skjerm 9.2b)
 *
 * Full ukentlig timeplan for én treningsgruppe — alle GroupSchedule-rader.
 * Ekte data fra prisma.groupSchedule (ingen fabrikering). Viser ukedag, tid,
 * varighet (avledet av startAt/endAt), sted og repetisjon. Ærlig tom-tilstand
 * når gruppen ikke har faste tider satt.
 *
 * `?focus=<scheduleId>` framhever én rad — målet for «Detaljer»/«Åpne» fra
 * gruppe-detaljsiden, som ikke har en egen samling-detaljskjerm i appen.
 *
 * Tokens-only, 8pt-grid, Lucide stroke 1.75.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Clock, MapPin, Repeat } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DetailShell } from "@/components/shared/detail-shell";
import { AthleticBadge } from "@/components/athletic/badge";
import { EmptyState } from "@/components/shared/empty-state";

const NB_WEEKDAY = new Intl.DateTimeFormat("nb-NO", { weekday: "long" });
const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});
const NB_TIME = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
});

function varighet(startAt: Date, endAt: Date): string {
  const min = Math.round((endAt.getTime() - startAt.getTime()) / 60000);
  if (min <= 0) return "—";
  const t = Math.floor(min / 60);
  const m = min % 60;
  if (t === 0) return `${m} min`;
  if (m === 0) return `${t} t`;
  return `${t} t ${m} min`;
}

function storForbokstav(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function GruppeTimeplan({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ focus?: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;
  const { focus } = await searchParams;

  const gruppe = await prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      schedules: {
        orderBy: { startAt: "asc" },
      },
    },
  });

  if (!gruppe) notFound();

  const naa = new Date();
  const faste = gruppe.schedules.filter(
    (s) => s.recurring && s.recurring !== "NONE",
  );
  const kommende = gruppe.schedules.filter(
    (s) => (!s.recurring || s.recurring === "NONE") && s.endAt >= naa,
  );
  const tidligere = gruppe.schedules.filter(
    (s) => (!s.recurring || s.recurring === "NONE") && s.endAt < naa,
  );

  return (
    <DetailShell
      breadcrumb={[
        { label: "Grupper", href: "/admin/grupper" },
        { label: gruppe.name, href: `/admin/grupper/${gruppe.id}` },
        { label: "Timeplan" },
      ]}
      backHref={`/admin/grupper/${gruppe.id}`}
      title={
        <span>
          Timeplan ·{" "}
          <em
            className="not-italic"
            style={{
              fontFamily: "var(--font-familjen-grotesk), sans-serif",
              fontStyle: "italic",
              color: "hsl(var(--primary))",
            }}
          >
            {gruppe.name}
          </em>
        </span>
      }
      subtitle={`${gruppe.schedules.length} tider totalt · ${faste.length} faste · ${kommende.length} kommende`}
    >
      {gruppe.schedules.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          titleItalic="Ingen"
          titleTrail="faste tider satt"
          sub="Denne gruppen har ingen treningstider i timeplanen ennå. Bruk «Planlegg samling» på gruppesiden for å legge inn første økt."
          cta={
            <Link
              href={`/admin/bookinger/ny?groupId=${gruppe.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.75} />
              Planlegg samling
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {faste.length > 0 && (
            <TimeplanSeksjon
              tittel="Faste tider · ukentlig"
              rader={faste}
              focusId={focus}
              fast
            />
          )}
          {kommende.length > 0 && (
            <TimeplanSeksjon
              tittel="Kommende samlinger"
              rader={kommende}
              focusId={focus}
            />
          )}
          {tidligere.length > 0 && (
            <TimeplanSeksjon
              tittel="Tidligere"
              rader={tidligere}
              focusId={focus}
              dempet
            />
          )}
        </div>
      )}
    </DetailShell>
  );
}

type ScheduleRad = {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date;
  location: string | null;
  recurring: string | null;
};

function TimeplanSeksjon({
  tittel,
  rader,
  focusId,
  fast = false,
  dempet = false,
}: {
  tittel: string;
  rader: ScheduleRad[];
  focusId?: string;
  fast?: boolean;
  dempet?: boolean;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock
          className="h-3.5 w-3.5 text-muted-foreground"
          strokeWidth={1.75}
        />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {tittel}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          · {rader.length}
        </span>
      </div>

      <ul className="space-y-2">
        {rader.map((s) => {
          const erFokus = s.id === focusId;
          return (
            <li
              key={s.id}
              id={`s-${s.id}`}
              className={`scroll-mt-24 rounded-xl border bg-card p-4 transition-colors ${
                erFokus ? "border-primary ring-1 ring-primary" : "border-border"
              } ${dempet ? "opacity-70" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold leading-tight text-foreground">
                      {s.title}
                    </h3>
                    {fast && s.recurring && (
                      <AthleticBadge variant="primary">
                        {s.recurring === "WEEKLY" ? "UKENTLIG" : s.recurring}
                      </AthleticBadge>
                    )}
                  </div>

                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    <span className="text-foreground">
                      {storForbokstav(NB_WEEKDAY.format(s.startAt))}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.75} />
                      {NB_TIME.format(s.startAt)}–{NB_TIME.format(s.endAt)}
                    </span>
                    <span>{varighet(s.startAt, s.endAt)}</span>
                    {!fast && <span>{NB_DATE.format(s.startAt)}</span>}
                    {s.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" strokeWidth={1.75} />
                        {s.location}
                      </span>
                    )}
                    {fast && s.recurring && s.recurring !== "NONE" && (
                      <span className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" strokeWidth={1.75} />
                        {s.recurring}
                      </span>
                    )}
                  </p>

                  {s.description && (
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      {s.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
