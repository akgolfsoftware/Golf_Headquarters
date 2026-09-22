/**
 * AK-stigen — legger CANONs fire juniortrinn (Mini → Basis → Utvikling →
 * Elite) oppå de faktiske gruppene i basen.
 *
 * Knøtt (11–12 år) er IKKE et trinn i stigen (Anders 22.09.2026). Aldersgruppen
 * skal ha sin egen gruppe, og den gruppen vises ved siden av stigen — sammen med
 * WANG — ikke som et hull i den.
 *
 * Paper-fasit: fase1/agencyos-ak-stigen.html. Fasitens egen kommentar sier
 * hvorfor flata finnes: «Ligger de hver for seg, ser stigen komplett ut selv
 * når et trinn ikke har noen gruppe — og en gruppe kan stå tom i månedsvis
 * uten at noen ser det mot trinnet den skal fylle.»
 *
 * Trinn↔gruppe kobles på EKSAKT navn (de fire kanoniske GFGK-navnene satt
 * opp for stigen), ikke fuzzy-matching — «GFGK Elite» og «GFGK Utvikling»
 * (uten «Junior») er andre, reelle grupper i basen og skal ikke gjettes inn
 * i et trinn.
 */

import { prisma } from "@/lib/prisma";

export type AkStigenTrinn = {
  kode: string;
  navn: string;
  alder: string;
  beskrivelse: string;
  gruppeNavn: string;
};

export const AK_STIGEN_TRINN: AkStigenTrinn[] = [
  { kode: "A1", navn: "Mini", alder: "til og med 10 år", beskrivelse: "Første møte med golf. Lek, grunnleggende grep og balanse.", gruppeNavn: "GFGK Junior Mini U10" },
  { kode: "A2", navn: "Basis", alder: "til og med 13 år", beskrivelse: "Fast teknisk fundament. Ballkontroll og rutine.", gruppeNavn: "GFGK Junior Basis U13" },
  { kode: "A3", navn: "Utvikling", alder: "til og med 15 år", beskrivelse: "Egen plan, egne tester. Konkurranse begynner å telle.", gruppeNavn: "GFGK Junior Utvikling U15" },
  { kode: "A4", navn: "Elite", alder: "til og med 19 år", beskrivelse: "Turneringsspill, periodisering og måling mot mål.", gruppeNavn: "GFGK Junior Elite U19" },
];

/**
 * Grupper som ikke hører til et trinn i stigen, men som skal vises ved siden av den.
 * WANG er neste steg etter Elite; Knøtt-gruppen er en aldersgruppe uten eget trinn
 * (Anders 22.09.2026). Uten denne lista ville Knøtt-gruppen havnet under «ukartlagt»
 * med varsel — som om noen hadde skrevet feil navn.
 */
const VED_SIDEN_AV_STIGEN = ["WANG Toppidrett Fredrikstad", "GFGK Junior Knøtt U12"];

export type AkStigenGruppeData = {
  id: string;
  navn: string;
  level: string | null;
  coachNavn: string | null;
  medlemmer: number;
  tider: string[];
};

export type AkStigenRestGruppe = {
  id: string;
  navn: string;
  level: string | null;
  maks: number | null;
};

export type AkStigenUklarGruppe = {
  id: string;
  navn: string;
  level: string | null;
  medlemmer: number;
};

export type AkStigenData = {
  trinn: AkStigenTrinn[];
  /** Nøkkel = trinnets gruppeNavn. Objekt, ikke Map — må krysse server→klient-grensen som JSON. */
  grupper: Record<string, AkStigenGruppeData>;
  /** Grupper uten eget trinn som likevel hører hjemme her: WANG og Knøtt. */
  vedSidenAv: AkStigenGruppeData[];
  /** Grupper uten medlemmer OG uten timeplan — trolig oppsettsrester. */
  rester: AkStigenRestGruppe[];
  /** Grupper med reelle medlemmer som verken er et kanonisk trinn eller "over stigen" — ukartlagt kollisjon. */
  ukartlagt: AkStigenUklarGruppe[];
};

// Ukedag og klokkeslett leses i Europe/Oslo, ikke UTC. Vercel kjører UTC, og rå
// getUTCDay()/getUTCHours() viste en trening kl. 18:00 som 16:00 om sommeren — og
// bommet på ukedagen for sene økter. Samme lesing som /admin/grupper gjør.
const osloDagKort = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short" });
const osloKlokke = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function tidsstreng(startAt: Date, endAt: Date): string {
  const dag = osloDagKort.format(startAt).replace(".", "");
  return `${dag} ${osloKlokke.format(startAt)}–${osloKlokke.format(endAt)}`;
}

export async function lastAkStigenData(): Promise<AkStigenData> {
  const alleGrupper = await prisma.group.findMany({
    select: {
      id: true,
      name: true,
      level: true,
      maxParticipants: true,
      coach: { select: { name: true } },
      _count: { select: { members: { where: { endedAt: null } }, schedules: true } },
      schedules: {
        where: { recurring: "WEEKLY" },
        orderBy: { startAt: "asc" },
        take: 2,
        select: { startAt: true, endAt: true },
      },
    },
  });

  const kanoniskeNavn = new Set(AK_STIGEN_TRINN.filter((t) => t.gruppeNavn).map((t) => t.gruppeNavn));

  const grupper: Record<string, AkStigenGruppeData> = {};
  const vedSidenAv: AkStigenGruppeData[] = [];
  const rester: AkStigenRestGruppe[] = [];
  const ukartlagt: AkStigenUklarGruppe[] = [];

  for (const g of alleGrupper) {
    const data: AkStigenGruppeData = {
      id: g.id,
      navn: g.name,
      level: g.level,
      coachNavn: g.coach?.name ?? null,
      medlemmer: g._count.members,
      tider: g.schedules.map((s) => tidsstreng(s.startAt, s.endAt)),
    };
    if (kanoniskeNavn.has(g.name)) {
      grupper[g.name] = data;
    } else if (VED_SIDEN_AV_STIGEN.includes(g.name)) {
      vedSidenAv.push(data);
    } else if (g._count.members === 0 && g._count.schedules === 0) {
      rester.push({ id: g.id, navn: g.name, level: g.level, maks: g.maxParticipants });
    } else if (g._count.members > 0) {
      // Reell gruppe med spillere som verken er koblet til et trinn eller står
      // ved siden av stigen — nettopp den typen kollisjon flata skal avdekke.
      ukartlagt.push({ id: g.id, navn: g.name, level: g.level, medlemmer: g._count.members });
    }
  }

  return { trinn: AK_STIGEN_TRINN, grupper, vedSidenAv, rester, ukartlagt };
}
