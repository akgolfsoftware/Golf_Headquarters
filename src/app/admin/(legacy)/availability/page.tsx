/**
 * AgencyOS — Tilgjengelighet (GJENNOMFØRE · TILGJENGELIGHET), /admin/availability.
 * v2-port 16. juli 2026.
 *
 * Datakilde: prisma.coachAvailability (ukentlige vinduer per coach) projisert
 * på datoene i valgt måned — ekte data, ingen per-dato-overstyringer i modellen
 * ennå. Visningen er statisk: fasitens klikk-og-rediger-panel er ikke koblet
 * (CRUD finnes i ./slot-form.tsx (nå AdminSlotFormV2) + ./actions.ts —
 * uendret). Måned-navigasjon via ?m=YYYY-MM. Synk-knappen er no-op som i
 * fasit-demoen.
 *
 * Kjent, uendret begrensning (ikke del av denne restylingen, se
 * MASTER-SKJERMPLAN.md Bolk 8): Uke-visningens drag-interaksjon er portet
 * 1:1 (samme logikk, samme addSlot-action) — ingen ny funksjon lagt til.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminAvailabilityV2, type AdminAvailabilityV2Data, type AvailabilitySlotRad, type Visning } from "@/components/admin/v2/AdminAvailabilityV2";
import type { WeekWindow } from "@/components/admin/v2/AdminAvailabilityWeekGridV2";
import type { YearWindow } from "@/components/admin/v2/AdminAvailabilityYearGanttV2";
import { CalendarSyncSection } from "@/app/admin/(legacy)/settings/calendar/calendar-sync-section";
import { Caps, T } from "@/components/v2";

const REP_TEKST: Record<number, string> = { 2: "annenhver uke", 3: "hver 3. uke", 4: "hver 4. uke" };

export const dynamic = "force-dynamic";

const MND_NB = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"];
const UKEDAGER_NB = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

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
  const visning: Visning = vParam === "uke" ? "uke" : vParam === "aar" ? "aar" : "maaned";
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

  const ukeVinduer: WeekWindow[] = slots
    .filter((s) => s.active && s.weekday !== null)
    .map((s) => ({ id: s.id, weekday: s.weekday as number, startTime: s.startTime, endTime: s.endTime, locationName: s.location?.name ?? null }));

  const aarsVinduer: YearWindow[] = slots
    .filter((s) => s.active && s.weekday !== null)
    .map((s) => {
      const rep = s.recurrenceInterval && s.recurrenceInterval > 1 ? ` · ${REP_TEKST[s.recurrenceInterval] ?? `hver ${s.recurrenceInterval}. uke`}` : "";
      return {
        id: s.id,
        locationName: s.location?.name ?? null,
        label: `${UKEDAGER_NB[s.weekday as number]} · ${s.startTime}–${s.endTime}${rep}`,
        validFrom: s.validFrom,
        validTo: s.validTo,
      };
    });

  const dagerIMnd = new Date(y, m + 1, 0).getDate();
  const innrykk = (new Date(y, m, 1).getDay() + 6) % 7;
  const dagNumre: Array<number | null> = [];
  for (let i = 0; i < innrykk; i++) dagNumre.push(null);
  for (let d = 1; d <= dagerIMnd; d++) dagNumre.push(d);
  while (dagNumre.length % 7) dagNumre.push(null);

  const naa = new Date();
  const erIdag = (d: number) => y === naa.getFullYear() && m === naa.getMonth() && d === naa.getDate();

  const celler = dagNumre.map((d) => {
    if (d == null) return { dag: null, range: null, erIdag: false };
    const range = perUkedag.get((new Date(y, m, d).getDay() + 6) % 7) ?? null;
    return { dag: d, range, erIdag: erIdag(d) };
  });

  const forrige = skift(y, m, -1);
  const neste = skift(y, m, 1);

  const data: AdminAvailabilityV2Data = {
    visning,
    y,
    m,
    mndNavn: `${MND_NB[m]} ${y}`,
    forrigeHref: `/admin/availability?m=${mndParam(forrige.y, forrige.m)}`,
    nesteHref: `/admin/availability?m=${mndParam(neste.y, neste.m)}`,
    celler,
    locations,
    ukeVinduer,
    aarsVinduer,
    aarSwitchHref: `/admin/availability?v=aar&m=${mndParam(y, m)}`,
    aarForrigeHref: `/admin/availability?v=aar&m=${mndParam(y - 1, m)}`,
    aarNesteHref: `/admin/availability?v=aar&m=${mndParam(y + 1, m)}`,
    slots: slots.map((s): AvailabilitySlotRad => ({
      id: s.id,
      tidLabel: `${s.startTime}–${s.endTime}`,
      metaLabel:
        `${s.weekday !== null ? UKEDAGER_NB[s.weekday] : s.date ? s.date.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" }) : "—"}` +
        ` · ${s.location?.name ?? "Alle steder"}${!s.active ? " · (av)" : ""}`,
      slukket: !s.active,
      formInitial: {
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
      },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <AdminAvailabilityV2 data={data} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <Caps>Gjennomføre · Tilgjengelighet · Google Calendar</Caps>
          <h2 style={{ margin: "6px 0 0", fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>
            Koble kalender — velg hva som blokkerer booking
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: T.mut }}>
            Familie-, jobb- og møtekalendere du huker av blokkerer automatisk booking-tid. Opptatt-tid kan aldri dobbeltbookes.
          </p>
        </div>
        <CalendarSyncSection userId={user.id} />
      </div>
    </div>
  );
}
