/**
 * AgencyOS — Tilgjengelighet (KALENDER · TILGJENGELIGHET), /admin/availability, i
 * Precision Athletics. Fane «Tilgjengelighet» i Kalender viser det faste ukemønsteret;
 * denne siden er full fasit for steder, dato-unntak, dra-i-rutenett, årsplan og
 * Google-kalender, og beholder derfor sin egen adresse.
 *
 * Datakilde: prisma.coachAvailability (ukentlige vinduer og dato-unntak per coach)
 * projisert på datoene i valgt måned. CRUD går via ./actions.ts (uendret, i
 * src/app/admin/(legacy)/availability/). Måned-navigasjon via ?m=YYYY-MM, visning via ?v=.
 * Siden ligger utenfor (legacy)-gruppen og pakker seg selv i AgencyOSSkall.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Kort, Side, SideHode } from "@/components/precision/pa-a4";
import { Meta } from "@/components/precision/pa";
import { AG05Tilgjengelighet, type AarVindu, type TilgjengelighetData, type UkeVindu, type Visning, type VinduRad } from "@/components/admin/precision/AG05Tilgjengelighet";
import { CalendarSyncSection } from "@/app/admin/(legacy)/settings/calendar/calendar-sync-section";

const REP_TEKST: Record<number, string> = { 2: "annenhver uke", 3: "hver 3. uke", 4: "hver 4. uke" };

export const dynamic = "force-dynamic";
export const metadata = { title: "Tilgjengelighet · AgencyOS" };

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

/** Andel av året (0–1) for en dato; åpen kant gir 0 (fra) eller 1 (til). */
function aarsAndel(d: Date | null, kant: 0 | 1, year: number): number {
  if (!d) return kant;
  if (d.getFullYear() < year) return 0;
  if (d.getFullYear() > year) return 1;
  const start = new Date(year, 0, 1).getTime();
  const slutt = new Date(year + 1, 0, 1).getTime();
  return Math.min(1, Math.max(0, (d.getTime() - start) / (slutt - start)));
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

  const ukeVinduer: UkeVindu[] = slots
    .filter((s) => s.active && s.weekday !== null)
    .map((s) => ({ id: s.id, weekday: s.weekday as number, startTime: s.startTime, endTime: s.endTime, locationName: s.location?.name ?? null }));

  const aarsVinduer: AarVindu[] = slots
    .filter((s) => s.active && s.weekday !== null)
    .map((s) => {
      const rep = s.recurrenceInterval && s.recurrenceInterval > 1 ? ` · ${REP_TEKST[s.recurrenceInterval] ?? `hver ${s.recurrenceInterval}. uke`}` : "";
      return {
        id: s.id,
        locationName: s.location?.name ?? null,
        label: `${UKEDAGER_NB[s.weekday as number]} · ${s.startTime}–${s.endTime}${rep}`,
        fraAndel: aarsAndel(s.validFrom, 0, y),
        tilAndel: aarsAndel(s.validTo, 1, y),
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
  const mnd = mndParam(y, m);

  const vinduer: VinduRad[] = slots.map((s) => ({
    id: s.id,
    tidLabel: `${s.startTime}–${s.endTime}`,
    metaLabel:
      `${s.weekday !== null ? UKEDAGER_NB[s.weekday] : s.date ? s.date.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" }) : "—"}` +
      ` · ${s.location?.name ?? "Alle steder"}${!s.active ? " · (av)" : ""}`,
    slukket: !s.active,
    skjema: {
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
  }));

  const data: TilgjengelighetData = {
    visning,
    aar: y,
    mndNavn: `${MND_NB[m]} ${y}`,
    forrigeHref: `/admin/availability?m=${mndParam(forrige.y, forrige.m)}`,
    nesteHref: `/admin/availability?m=${mndParam(neste.y, neste.m)}`,
    celler,
    steder: locations,
    ukeVinduer,
    aarsVinduer,
    aarForrigeHref: `/admin/availability?v=aar&m=${mndParam(y - 1, m)}`,
    aarNesteHref: `/admin/availability?v=aar&m=${mndParam(y + 1, m)}`,
    faner: [
      { href: `/admin/availability?v=maaned&m=${mnd}`, navn: "Måned", aktiv: visning === "maaned" },
      { href: `/admin/availability?v=uke&m=${mnd}`, navn: "Uke", aktiv: visning === "uke" },
      { href: `/admin/availability?v=aar&m=${mnd}`, navn: "År", aktiv: visning === "aar" },
    ],
    vinduer,
  };

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <Side max={1200}>
        <SideHode
          kicker="Kalender · Tilgjengelighet"
          title="Tilgjengelighet"
          sub="Sett tidsvinduene du er tilgjengelig, per anlegg. Grønne dager er åpne for booking. Du kan aldri være tilgjengelig to steder samtidig."
        />
        <AG05Tilgjengelighet data={data} />
        <Kort gap={12}>
          <span className="kicker">Google Calendar</span>
          <h2 style={{ margin: 0, font: "600 17px/1.3 var(--font-sans)" }}>Koble kalender og velg hva som blokkerer booking</h2>
          <Meta>FAMILIE-, JOBB- OG MØTEKALENDERE DU HUKER AV BLOKKERER BOOKING-TID · OPPTATT-TID KAN ALDRI DOBBELTBOOKES</Meta>
          <CalendarSyncSection userId={user.id} />
        </Kort>
      </Side>
    </AgencyOSSkall>
  );
}
