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

import { Tag } from "@/components/athletic/golfdata";
import { notFound } from "next/navigation";
import { CalendarClock, Clock, MapPin, Repeat, Plus } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DetailShell } from "@/components/shared/detail-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { opprettGruppeTrening, dupliserGruppeTime } from "../actions";

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
      {/* Opprett gruppe trening form - støtter tidspunkt, antall deltagere, dato, tid, varighet */}
      <form action={async (formData: FormData) => {
        "use server";
        const title = formData.get("title") as string;
        const description = formData.get("description") as string | null;
        const dato = formData.get("dato") as string;
        const tid = formData.get("tid") as string;
        const varighetMin = parseInt(formData.get("varighetMin") as string);
        const location = formData.get("location") as string | null;
        const recurring = formData.get("recurring") as string;
        const maxParticipants = formData.get("maxParticipants") ? parseInt(formData.get("maxParticipants") as string) : null;

        const startAt = new Date(`${dato}T${tid}`);
        const endAt = new Date(startAt.getTime() + varighetMin * 60000);

        await opprettGruppeTrening(gruppe.id, {
          title,
          description: description || undefined,
          startAt,
          endAt,
          location: location || undefined,
          recurring,
          maxParticipants: maxParticipants || undefined,
        });
      }} className="mb-6 p-4 border border-border rounded-xl bg-card space-y-3">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="font-semibold">Opprett gruppe trening</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <input name="title" placeholder="Tittel (f.eks. Gruppe trening)" required className="border p-2 rounded" />
          <input name="description" placeholder="Beskrivelse" className="border p-2 rounded" />
          <input type="date" name="dato" required className="border p-2 rounded" />
          <input type="time" name="tid" required className="border p-2 rounded" />
          <input type="number" name="varighetMin" placeholder="Varighet min" defaultValue="60" required className="border p-2 rounded" />
          <input name="location" placeholder="Sted" className="border p-2 rounded" />
          <select name="recurring" className="border p-2 rounded">
            <option value="NONE">Engang (spesifikt tidspunkt)</option>
            <option value="WEEKLY">Ukentlig</option>
          </select>
          <input type="number" name="maxParticipants" placeholder="Antall deltagere (max)" className="border p-2 rounded" />
        </div>
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">Opprett</button>
      </form>

      {gruppe.schedules.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          titleItalic="Ingen"
          titleTrail="faste tider satt"
          sub="Bruk skjemaet over for å legge inn første økt (støtter tidspunkt, antall deltagere, duplisering via knapp under)."
        />
      ) : (
        <div className="space-y-8">
          {faste.length > 0 && (
            <TimeplanSeksjon
              tittel="Faste tider · ukentlig"
              rader={faste}
              focusId={focus}
              fast
              groupId={gruppe.id}
            />
          )}
          {kommende.length > 0 && (
            <TimeplanSeksjon
              tittel="Kommende samlinger"
              rader={kommende}
              focusId={focus}
              groupId={gruppe.id}
            />
          )}
          {tidligere.length > 0 && (
            <TimeplanSeksjon
              tittel="Tidligere"
              rader={tidligere}
              focusId={focus}
              dempet
              groupId={gruppe.id}
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
  maxParticipants: number | null;
};

function TimeplanSeksjon({
  tittel,
  rader,
  focusId,
  fast = false,
  dempet = false,
  groupId,
}: {
  tittel: string;
  rader: ScheduleRad[];
  focusId?: string;
  fast?: boolean;
  dempet?: boolean;
  groupId: string;
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
                      <Tag variant="signal">
                        {s.recurring === "WEEKLY" ? "UKENTLIG" : s.recurring}
                      </Tag>
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
                    {s.maxParticipants && (
                      <span>Max {s.maxParticipants} deltagere</span>
                    )}
                  </p>

                  {s.description && (
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      {s.description}
                    </p>
                  )}
                </div>
                {/* Dupliser knapp - støtter duplisere gruppe time med ny dato/tid */}
                <form action={async (formData: FormData) => {
                  "use server";
                  const newStart = formData.get("newStart") as string;
                  await dupliserGruppeTime(groupId, s.id, newStart);
                }} className="flex gap-1 items-end text-xs">
                  <input type="datetime-local" name="newStart" required className="border p-1 text-xs" defaultValue={new Date(s.startAt.getTime() + 7*24*60*60*1000).toISOString().slice(0,16)} />
                  <button type="submit" className="px-2 py-1 bg-secondary rounded hover:bg-muted">Dupliser</button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
