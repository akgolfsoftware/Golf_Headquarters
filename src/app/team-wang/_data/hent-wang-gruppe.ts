// Server-only: henter ekte gruppedata for WANG Toppidrett Fredrikstad fra basen
// (AgencyOS-gruppa Anders la inn 19.7 via seed-wang-aarsplan-2026). Brukes av de
// auth-gatede /team-wang-sidene til å vise ekte elevliste, perioder og
// samlinger/hendelser oppå den rike skjermtekst-demoen (der basen mangler felt
// — drill-nivå, KM-matrise, timeplan — beholdes demo).
//
// Ingen kall ved build: /team-wang-sidene er dynamiske (auth via cookies), og
// alt her er pakket i try/catch → null slik at en manglende gruppe/DB gir ren
// fallback til demo (samme mønster som /gfgk-junior/kalender).

import "server-only";

import { prisma } from "@/lib/prisma";

// Gruppa fra seed-scriptet. Slår opp på navn (robust på tvers av miljøer);
// id-en er kun en kommentar for sporbarhet. (seed: cmp28uk1b000l99e5m764g2wx)
const GRUPPE_NAVN = "WANG Toppidrett Fredrikstad";

export type WangFase =
  | "GRUNN"
  | "SPESIAL"
  | "TURNERING"
  | "TESTUKE"
  | "FERIE"
  | "TRENINGSSAMLING"
  | "HELDAGSSAMLING";

export interface WangElev {
  navn: string;
  rolle: string; // PLAYER | ASSISTANT
}

export interface WangPeriodeDb {
  fase: WangFase;
  startIso: string; // yyyy-mm-dd (Oslo)
  endIso: string;
  fokus: string | null;
  ukevolMin: number | null;
  ukevolMax: number | null;
}

export interface WangHendelseDb {
  tittel: string;
  startIso: string; // yyyy-mm-dd (Oslo)
  startTid: string; // HH:mm (Oslo)
  sluttIso: string;
  kind: string | null; // SAMLING | HELDAGSSAMLING | null
  recurring: string | null; // WEEKLY | NONE | null
  sted: string | null;
  beskrivelse: string | null;
}

export interface WangFastOkt {
  ukedag: number; // 0=man..6=søn (Oslo)
  startTid: string;
  sluttTid: string;
  sted: string | null;
  tittel: string;
}

export interface WangSkoleDagDb {
  dato: string; // yyyy-mm-dd
  tittel: string;
  kategori: string | null;
  notat: string | null;
}

export interface WangLiveData {
  gruppeNavn: string;
  antallElever: number;
  elever: WangElev[];
  perioder: WangPeriodeDb[];
  hendelser: WangHendelseDb[]; // ikke-ukentlige enkelthendelser (samlinger, tester, sosialt …)
  fasteOkter: WangFastOkt[]; // ukentlig rullerende treningstider
  skoleDager: WangSkoleDagDb[]; // ferier/planleggingsdager/siste skoledag
  oppdatertIso: string; // sist synket (Oslo-dato)
}

// ---- Oslo-korrekte formatterere (server kjører UTC på Vercel) -------------
function osloDato(d: Date): string {
  // en-CA gir yyyy-mm-dd
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(d);
}
function osloTid(d: Date): string {
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Oslo",
  });
}
const NB_UKEDAG: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};
function osloUkedag(d: Date): number {
  const engelsk = d.toLocaleDateString("en-US", { weekday: "long", timeZone: "Europe/Oslo" }).toLowerCase();
  return NB_UKEDAG[engelsk] ?? 0;
}
// "2026/2027" fra periodenes datospenn — matcher SchoolScheduleEntry.schoolYear.
function skoleAr(perioder: { startIso: string; endIso: string }[]): string | null {
  if (perioder.length === 0) return null;
  const startAar = Math.min(...perioder.map((p) => Number(p.startIso.slice(0, 4))));
  const sluttAar = Math.max(...perioder.map((p) => Number(p.endIso.slice(0, 4))));
  return `${startAar}/${sluttAar}`;
}

/**
 * Henter ekte WANG-gruppedata. Returnerer null hvis gruppa ikke finnes eller DB
 * feiler — kalleren faller da tilbake til ren demo. Kun elevnavn (PII om
 * mindreårige) — kall dette KUN fra auth-gatede sider.
 */
export async function hentWangGruppe(): Promise<WangLiveData | null> {
  try {
    const gruppe = await prisma.group.findFirst({
      where: { name: GRUPPE_NAVN },
      select: {
        id: true,
        name: true,
        members: {
          orderBy: { joinedAt: "asc" },
          select: { role: true, user: { select: { name: true, email: true } } },
        },
        schedules: {
          orderBy: { startAt: "asc" },
          select: {
            title: true,
            description: true,
            startAt: true,
            endAt: true,
            location: true,
            recurring: true,
            kind: true,
          },
        },
      },
    });
    if (!gruppe) return null;

    const perioderRader = await prisma.groupPeriodBlock.findMany({
      where: { groupId: gruppe.id },
      orderBy: { startDate: "asc" },
      select: {
        lPhase: true,
        startDate: true,
        endDate: true,
        focus: true,
        weeklyVolMin: true,
        weeklyVolMax: true,
      },
    });

    const elever: WangElev[] = gruppe.members
      .map((m) => ({
        navn: m.user.name?.trim() || m.user.email,
        rolle: m.role,
      }))
      .filter((e) => e.navn)
      .sort((a, b) => a.navn.localeCompare(b.navn, "nb"));

    const perioder: WangPeriodeDb[] = perioderRader.map((p) => ({
      fase: p.lPhase as WangFase,
      startIso: osloDato(p.startDate),
      endIso: osloDato(p.endDate),
      fokus: p.focus,
      ukevolMin: p.weeklyVolMin,
      ukevolMax: p.weeklyVolMax,
    }));

    // Enkelthendelser (ikke faste ukentlige økter) — samlinger, tester, sosialt.
    const hendelser: WangHendelseDb[] = gruppe.schedules
      .filter((s) => s.recurring !== "WEEKLY")
      .map((s) => ({
        tittel: s.title,
        startIso: osloDato(s.startAt),
        startTid: osloTid(s.startAt),
        sluttIso: osloDato(s.endAt),
        kind: s.kind,
        recurring: s.recurring,
        sted: s.location,
        beskrivelse: s.description,
      }));

    const fasteOkter: WangFastOkt[] = gruppe.schedules
      .filter((s) => s.recurring === "WEEKLY")
      .map((s) => ({
        ukedag: osloUkedag(s.startAt),
        startTid: osloTid(s.startAt),
        sluttTid: osloTid(s.endAt),
        sted: s.location,
        tittel: s.title,
      }));

    const ar = skoleAr(perioder);
    const skoleRader = ar
      ? await prisma.schoolScheduleEntry.findMany({
          where: { schoolYear: ar },
          orderBy: { date: "asc" },
          select: { date: true, title: true, category: true, note: true },
        })
      : [];
    const skoleDager: WangSkoleDagDb[] = skoleRader.map((s) => ({
      dato: osloDato(s.date),
      tittel: s.title,
      kategori: s.category,
      notat: s.note,
    }));

    return {
      gruppeNavn: gruppe.name,
      antallElever: elever.length,
      elever,
      perioder,
      hendelser,
      fasteOkter,
      skoleDager,
      oppdatertIso: osloDato(new Date()),
    };
  } catch {
    // DB utilgjengelig / build uten database → ren demo-fallback.
    return null;
  }
}
