/**
 * AgencyOS — Tilgjengelighet (GJENNOMFØRE · TILGJENGELIGHET), /admin/availability.
 *
 * Port av fasit `agencyos-app/screens-ops.jsx` → AvailabilityScreen (mørkt
 * tema, desktop 1280): PageHead («Din måned, åpen for booking.» + Synk),
 * måned-kalender man-først med grønne «åpen for booking»-dager (tidsrom i
 * cellen), accent-dot på i dag, måned-navigasjon og tegnforklaring.
 *
 * Datakilde: prisma.coachAvailability (ukentlige vinduer per coach) projisert
 * på datoene i valgt måned — ekte data, ingen per-dato-overstyringer i modellen
 * ennå. Visningen er statisk: fasitens klikk-og-rediger-panel er ikke koblet
 * (CRUD finnes i ./slot-form.tsx + ./actions.ts — uendret). Måned-navigasjon
 * via ?m=YYYY-MM. Synk-knappen er no-op som i fasit-demoen.
 */

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";
import { SynkButton } from "./availability-actions";
import { SlotForm } from "./slot-form";
import { AvailabilityWeekGrid } from "./availability-week-grid";
import { AvailabilityYearGantt, type YearWindow } from "./availability-year-gantt";
import { CalendarSyncSection } from "@/app/admin/(legacy)/settings/calendar/calendar-sync-section";

const REP_TEKST: Record<number, string> = {
  2: "annenhver uke",
  3: "hver 3. uke",
  4: "hver 4. uke",
};

export const dynamic = "force-dynamic";

const MND_NB = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];
const UKEDAGER_NB = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

type SearchParams = Promise<{ m?: string; v?: string }>;

/** ?m=YYYY-MM → {y, m(0-11)}, ellers inneværende måned. */
function parseMnd(param: string | undefined): { y: number; m: number } {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const y = Number(param.slice(0, 4));
    const m = Number(param.slice(5, 7)) - 1;
    if (m >= 0 && m <= 11) return { y, m };
  }
  const naa = new Date();
  return { y: naa.getFullYear(), m: naa.getMonth() };
}

function mndParam(y: number, m: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

function skift(y: number, m: number, delta: number): { y: number; m: number } {
  let nm = m + delta;
  let ny = y;
  if (nm < 0) { nm = 11; ny--; }
  if (nm > 11) { nm = 0; ny++; }
  return { y: ny, m: nm };
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { m: mParam, v: vParam } = await searchParams;
  const visning = vParam === "uke" ? "uke" : vParam === "aar" ? "aar" : "maaned";
  const { y, m } = parseMnd(mParam);

  // Egne tidsvinduer (alle, for liste/rediger) + anleggene for sted-velgeren.
  const [slots, locations] = await Promise.all([
    prisma.coachAvailability.findMany({
      where: { coachId: user.id },
      orderBy: [{ locationId: "asc" }, { weekday: "asc" }, { startTime: "asc" }],
      select: {
        id: true,
        weekday: true,
        date: true,
        startTime: true,
        endTime: true,
        active: true,
        locationId: true,
        validFrom: true,
        validTo: true,
        recurrenceInterval: true,
        location: { select: { name: true } },
      },
    }),
    prisma.location.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  // Måned-visning projiserer kun aktive UKENTLIGE vinduer på ukedag.
  const perUkedag = new Map<number, string>();
  for (const s of slots) {
    if (!s.active || s.weekday === null) continue;
    const range = `${s.startTime}–${s.endTime}`;
    perUkedag.set(s.weekday, perUkedag.has(s.weekday) ? `${perUkedag.get(s.weekday)} · ${range}` : range);
  }
  // Aktive ukentlige vinduer for uke-rutenettet.
  const ukeVinduer = slots
    .filter((s) => s.active && s.weekday !== null)
    .map((s) => ({
      id: s.id,
      weekday: s.weekday as number,
      startTime: s.startTime,
      endTime: s.endTime,
      locationName: s.location?.name ?? null,
    }));

  // Aktive ukentlige vinduer for år-Gantt (periode-bjelker).
  const aarsVinduer: YearWindow[] = slots
    .filter((s) => s.active && s.weekday !== null)
    .map((s) => {
      const rep = s.recurrenceInterval && s.recurrenceInterval > 1
        ? ` · ${REP_TEKST[s.recurrenceInterval] ?? `hver ${s.recurrenceInterval}. uke`}`
        : "";
      return {
        id: s.id,
        locationName: s.location?.name ?? null,
        label: `${UKEDAGER_NB[s.weekday as number]} · ${s.startTime}–${s.endTime}${rep}`,
        validFrom: s.validFrom,
        validTo: s.validTo,
      };
    });

  // Måned-grid, mandag først.
  const dagerIMnd = new Date(y, m + 1, 0).getDate();
  const innrykk = (new Date(y, m, 1).getDay() + 6) % 7;
  const celler: Array<number | null> = [];
  for (let i = 0; i < innrykk; i++) celler.push(null);
  for (let d = 1; d <= dagerIMnd; d++) celler.push(d);
  while (celler.length % 7) celler.push(null);

  const naa = new Date();
  const erIdag = (d: number) =>
    y === naa.getFullYear() && m === naa.getMonth() && d === naa.getDate();

  const forrige = skift(y, m, -1);
  const neste = skift(y, m, 1);

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Gjennomføre · Tilgjengelighet"
        title="Din måned,"
        italic="åpen for booking."
        lead="Sett tidsvinduer du er tilgjengelig, per anlegg. Grønne dager er åpne for spiller-booking. Du kan aldri være tilgjengelig to steder samtidig."
        actions={
          <div className="flex items-center gap-2">
            <SlotForm locations={locations} triggerLabel="+ Nytt tidsvindu" />
            <SynkButton />
          </div>
        }
      />

      {/* Visnings-bytter: Måned / Uke (drag) */}
      <div className="mb-4 flex gap-2">
        <Link
          href="/admin/availability?v=maaned"
          className={agBtnClass(visning === "maaned" ? "primary" : "ghost", "sm")}
        >
          Måned
        </Link>
        <Link
          href="/admin/availability?v=uke"
          className={agBtnClass(visning === "uke" ? "primary" : "ghost", "sm")}
        >
          Uke (drag)
        </Link>
        <Link
          href={`/admin/availability?v=aar&m=${mndParam(y, m)}`}
          className={agBtnClass(visning === "aar" ? "primary" : "ghost", "sm")}
        >
          År
        </Link>
      </div>

      {visning === "uke" ? (
        <AvailabilityWeekGrid locations={locations} windows={ukeVinduer} />
      ) : visning === "aar" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-end gap-[6px]">
            <Link
              href={`/admin/availability?v=aar&m=${mndParam(y - 1, m)}`}
              className={agBtnClass("ghost", "sm")}
              aria-label="Forrige år"
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </Link>
            <Link
              href={`/admin/availability?v=aar&m=${mndParam(y + 1, m)}`}
              className={agBtnClass("ghost", "sm")}
              aria-label="Neste år"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
          <AvailabilityYearGantt year={y} windows={aarsVinduer} />
        </div>
      ) : (
      <div className="rounded-xl border border-border bg-card p-[18px]">
        {/* Måned-navigasjon */}
        <div className="mb-[14px] flex items-center justify-between">
          <div className="font-display text-lg font-bold tracking-[-0.015em] text-foreground">
            {MND_NB[m]} {y}
          </div>
          <div className="flex gap-[6px]">
            <Link
              href={`/admin/availability?m=${mndParam(forrige.y, forrige.m)}`}
              className={agBtnClass("ghost", "sm")}
              aria-label="Forrige måned"
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </Link>
            <Link
              href={`/admin/availability?m=${mndParam(neste.y, neste.m)}`}
              className={agBtnClass("ghost", "sm")}
              aria-label="Neste måned"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Ukedager */}
        <div className="mb-[6px] grid grid-cols-7 gap-[6px]">
          {UKEDAGER_NB.map((w) => (
            <span
              key={w}
              className="text-center font-mono text-[9px] font-extrabold tracking-[0.08em] text-muted-foreground"
            >
              {w}
            </span>
          ))}
        </div>

        {/* Dato-ruter */}
        <div className="grid grid-cols-7 gap-[6px]">
          {celler.map((d, i) => {
            if (d == null) return <span key={`tom-${i}`} />;
            const range = perUkedag.get((new Date(y, m, d).getDay() + 6) % 7);
            return (
              <div
                key={d}
                className={cn(
                  "flex min-h-[72px] flex-col gap-1 rounded-[10px] border px-[9px] py-2 text-left",
                  range ? "border-success/25 bg-success/[0.08]" : "border-border bg-background",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="font-mono text-[13px] font-bold text-foreground">{d}</span>
                  {erIdag(d) && (
                    <span className="h-[6px] w-[6px] rounded-full bg-accent shadow-[0_0_6px_color-mix(in srgb, var(--v2-lime) 70%, transparent)]" />
                  )}
                </span>
                {range ? (
                  <span className="font-mono text-[10px] font-bold tracking-[0.01em] text-success">
                    {range}
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground">—</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Tegnforklaring */}
        <div className="mt-[14px] flex flex-wrap gap-[18px]">
          <span className="inline-flex items-center gap-[7px] font-mono text-[9px] font-bold tracking-[0.06em] text-muted-foreground">
            <span className="h-3 w-3 rounded-[4px] border border-success/25 bg-success/[0.08]" />{" "}
            ÅPEN FOR BOOKING
          </span>
          <span className="inline-flex items-center gap-[7px] font-mono text-[9px] font-bold tracking-[0.06em] text-muted-foreground">
            <span className="h-3 w-3 rounded-[4px] border border-border bg-background" /> INGEN TID
            SATT
          </span>
          <span className="inline-flex items-center gap-[7px] font-mono text-[9px] font-bold tracking-[0.06em] text-muted-foreground">
            <span className="h-[6px] w-[6px] rounded-full bg-accent" /> I DAG
          </span>
        </div>
      </div>
      )}

      {/* Tidsvinduer — rediger/slett per vindu */}
      <div className="mt-8 space-y-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Gjennomføre · Tilgjengelighet · Tidsvinduer
          </div>
          <h2 className="mt-1 font-display text-lg font-bold tracking-[-0.015em] text-foreground">
            Dine tidsvinduer
          </h2>
        </div>
        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ingen tidsvinduer satt ennå. Klikk «Nytt tidsvindu» for å legge til.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {slots.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <span className="font-mono text-[13px] font-bold text-foreground">
                    {s.startTime}–{s.endTime}
                  </span>{" "}
                  <span className="text-sm text-muted-foreground">
                    {s.weekday !== null
                      ? UKEDAGER_NB[s.weekday]
                      : s.date
                        ? s.date.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    {" · "}
                    {s.location?.name ?? "Alle steder"}
                    {!s.active && " · (av)"}
                  </span>
                </div>
                <SlotForm
                  locations={locations}
                  triggerLabel="Endre"
                  initial={{
                    id: s.id,
                    weekday: s.weekday,
                    date: s.date ? s.date.toISOString().slice(0, 10) : null,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    active: s.active,
                    locationId: s.locationId,
                    validFrom: s.validFrom ? s.validFrom.toISOString().slice(0, 10) : null,
                    validTo: s.validTo ? s.validTo.toISOString().slice(0, 10) : null,
                    recurrenceInterval: s.recurrenceInterval,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Google Calendar-kobling — samme skjerm som arbeidstidene. */}
      <div className="mt-8 space-y-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Gjennomføre · Tilgjengelighet · Google Calendar
          </div>
          <h2 className="mt-1 font-display text-lg font-bold tracking-[-0.015em] text-foreground">
            Koble kalender — velg hva som blokkerer booking
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Familie-, jobb- og møtekalendere du huker av blokkerer automatisk
            booking-tid. Opptatt-tid kan aldri dobbeltbookes.
          </p>
        </div>
        <CalendarSyncSection userId={user.id} />
      </div>
    </AgPage>
  );
}
