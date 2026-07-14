/**
 * AgencyOS — Tilgjengelighet (`/admin/availability`), v2. Port av
 * `(legacy)/availability/page.tsx` + `availability-week-grid.tsx` +
 * `availability-year-gantt.tsx` + `slot-form.tsx` (2026-07-14, AgencyOS
 * Bølge 3.31) — samme Prisma-datamodell (`coachAvailability`) og samme
 * `addSlot`/`updateSlot`/`deleteSlot`-kontrakt (bor i `(legacy)/
 * availability/actions.ts`, uendret).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminTilgjengelighetV2,
  type MonthCellV2,
  type WeekWindowV2,
  type YearWindowV2,
  type SlotRadV2,
} from "@/components/admin/v2/AdminTilgjengelighetV2";
import { CalendarSyncSection } from "@/app/admin/(legacy)/settings/calendar/calendar-sync-section";

export const dynamic = "force-dynamic";

const REP_TEKST: Record<number, string> = {
  2: "annenhver uke",
  3: "hver 3. uke",
  4: "hver 4. uke",
};

const MND_NB = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"];
const UKEDAGER_NB = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", year: "numeric" });

type SearchParams = Promise<{ m?: string; v?: string }>;

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

export default async function AvailabilityPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { m: mParam, v: vParam } = await searchParams;
  const visning = vParam === "uke" ? "uke" : vParam === "aar" ? "aar" : "maaned";
  const { y, m } = parseMnd(mParam);

  const [slots, locations] = await Promise.all([
    prisma.coachAvailability.findMany({
      where: { coachId: user.id },
      orderBy: [{ locationId: "asc" }, { weekday: "asc" }, { startTime: "asc" }],
      select: {
        id: true, weekday: true, date: true, startTime: true, endTime: true, active: true,
        locationId: true, validFrom: true, validTo: true, recurrenceInterval: true,
        location: { select: { name: true } },
      },
    }),
    prisma.location.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const perUkedag = new Map<number, string>();
  for (const s of slots) {
    if (!s.active || s.weekday === null) continue;
    const range = `${s.startTime}–${s.endTime}`;
    perUkedag.set(s.weekday, perUkedag.has(s.weekday) ? `${perUkedag.get(s.weekday)} · ${range}` : range);
  }

  const ukeVinduer: WeekWindowV2[] = slots
    .filter((s) => s.active && s.weekday !== null)
    .map((s) => ({ id: s.id, weekday: s.weekday as number, startTime: s.startTime, endTime: s.endTime, locationName: s.location?.name ?? null }));

  const aarsVinduer: YearWindowV2[] = slots
    .filter((s) => s.active && s.weekday !== null)
    .map((s) => {
      const rep = s.recurrenceInterval && s.recurrenceInterval > 1 ? ` · ${REP_TEKST[s.recurrenceInterval] ?? `hver ${s.recurrenceInterval}. uke`}` : "";
      return {
        id: s.id,
        locationName: s.location?.name ?? null,
        label: `${UKEDAGER_NB[s.weekday as number]} · ${s.startTime}–${s.endTime}${rep}`,
        validFromIso: s.validFrom ? s.validFrom.toISOString() : null,
        validToIso: s.validTo ? s.validTo.toISOString() : null,
      };
    });

  const dagerIMnd = new Date(y, m + 1, 0).getDate();
  const innrykk = (new Date(y, m, 1).getDay() + 6) % 7;
  const naa = new Date();
  const cells: MonthCellV2[] = [];
  for (let i = 0; i < innrykk; i++) cells.push({ day: null, range: null, erIdag: false });
  for (let d = 1; d <= dagerIMnd; d++) {
    const range = perUkedag.get((new Date(y, m, d).getDay() + 6) % 7) ?? null;
    const erIdag = y === naa.getFullYear() && m === naa.getMonth() && d === naa.getDate();
    cells.push({ day: d, range, erIdag });
  }
  while (cells.length % 7) cells.push({ day: null, range: null, erIdag: false });

  const forrige = skift(y, m, -1);
  const neste = skift(y, m, 1);

  const slotRader: SlotRadV2[] = slots.map((s) => ({
    id: s.id,
    weekday: s.weekday,
    dateTekst: s.date ? NB_DATE.format(s.date) : null,
    startTime: s.startTime,
    endTime: s.endTime,
    active: s.active,
    locationId: s.locationId,
    locationName: s.location?.name ?? null,
    dateIso: s.date ? s.date.toISOString().slice(0, 10) : null,
    validFromIso: s.validFrom ? s.validFrom.toISOString().slice(0, 10) : null,
    validToIso: s.validTo ? s.validTo.toISOString().slice(0, 10) : null,
    recurrenceInterval: s.recurrenceInterval,
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTilgjengelighetV2
        visning={visning}
        mndNavn={MND_NB[m]}
        y={y}
        cells={cells}
        forrigeHref={`/admin/availability?m=${mndParam(forrige.y, forrige.m)}`}
        nesteHref={`/admin/availability?m=${mndParam(neste.y, neste.m)}`}
        aarForrigeHref={`/admin/availability?v=aar&m=${mndParam(y - 1, m)}`}
        aarNesteHref={`/admin/availability?v=aar&m=${mndParam(y + 1, m)}`}
        maanedHref="/admin/availability?v=maaned"
        ukeHref="/admin/availability?v=uke"
        aarHref={`/admin/availability?v=aar&m=${mndParam(y, m)}`}
        locations={locations}
        ukeVinduer={ukeVinduer}
        aarsVinduer={aarsVinduer}
        slots={slotRader}
        calendarSync={<CalendarSyncSection userId={user.id} />}
      />
    </V2Shell>
  );
}
