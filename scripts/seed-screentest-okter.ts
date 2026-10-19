/**
 * Økter i Workbench for screentest@akgolf.test, så I dag, Plan og Stats kan sammenlignes med
 * tegningene i docs/design-system/utkast-playerhq/ med ekte data (designkontrollen 19.10.2026).
 *
 * Legger inn, relativt til kjøredato (Oslo):
 *  - fire uker bakover: gjennomførte økter (noen hoppet over), slik at etterlevelsen får et tall
 *  - denne uka: planlagte økter i alle fem akser
 *  - i dag: SLAG kl. 15:30 (75 min, 4 øvelser) og FYS kl. 17:30 (45 min, 4 øvelser), som i PH-01
 *
 * SCOPE: bare WorkbenchSession-rader med playerId = screentest og notes = MERKE. Rører ingen andre
 * brukere og ingen andre økter. Idempotent: sletter egne merkede rader før de lages på nytt.
 *
 * Kjør: npx tsx scripts/seed-screentest-okter.ts
 */
import "./_env";

import { prisma } from "@/lib/prisma";

const SPILLER = "screentest@akgolf.test";
const COACH = "coachtest@akgolf.test";
const MERKE = "seed:designkontroll-2026-10-19";

type Akse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
type Ovelse = { navn: string; min: number; motorikk: "UTEN_BALL" | "LAV_HAST" | "AUTO" };
type Okt = { dag: number; start: string; min: number; akse: Akse; tittel: string; sted: string; ovelser: Ovelse[] };

const O = (navn: string, min: number, motorikk: Ovelse["motorikk"] = "AUTO"): Ovelse => ({ navn, min, motorikk });

/** En vanlig uke: 14 t 5 min fordelt på aksene (SPILL 5 t 50, SLAG 3 t 45, TEK 3 t, FYS 1 t 30). */
const UKE: Okt[] = [
  { dag: 0, start: "15:30", min: 75, akse: "SLAG", tittel: "Innspill og nærspill", sted: "Range 3 · Fredrikstad GK", ovelser: [O("Innspill 100–150 m mot flagg", 25), O("Nærspill 10–20 m, lav bane", 20), O("Bunker til green", 15), O("8-ball fra 30 m", 15)] },
  { dag: 0, start: "17:30", min: 45, akse: "FYS", tittel: "Styrke bein og kjerne", sted: "Styrkerommet", ovelser: [O("Knebøy", 12, "UTEN_BALL"), O("Markløft trapbar", 12, "UTEN_BALL"), O("Utfall med rotasjon", 11, "UTEN_BALL"), O("Planke", 10, "UTEN_BALL")] },
  { dag: 1, start: "16:00", min: 90, akse: "TEK", tittel: "Teknisk blokk · P6–P7", sted: "Range 1 · Fredrikstad GK", ovelser: [O("Speil P6", 20, "UTEN_BALL"), O("Halvsving 50 %", 35, "LAV_HAST"), O("Fullsving 75 %", 35, "LAV_HAST")] },
  { dag: 2, start: "15:00", min: 150, akse: "SPILL", tittel: "Ni hull med strategi", sted: "Fredrikstad GK", ovelser: [O("Ni hull, presisjonsstrategi", 150)] },
  { dag: 3, start: "16:00", min: 75, akse: "SLAG", tittel: "Putting 1–3 m og fart", sted: "Puttinggreen", ovelser: [O("Klokka 1 m", 25), O("Fartstigen 6–12 m", 25), O("Up and down fra fringe", 25)] },
  { dag: 3, start: "18:00", min: 45, akse: "FYS", tittel: "Mobilitet og rotasjon", sted: "Styrkerommet", ovelser: [O("TPI-sjekk", 15, "UTEN_BALL"), O("Rotasjonskast", 15, "UTEN_BALL"), O("Hofterotasjon", 15, "UTEN_BALL")] },
  { dag: 4, start: "16:00", min: 90, akse: "TEK", tittel: "Teknisk blokk · P5–P6", sted: "Range 1 · Fredrikstad GK", ovelser: [O("Speil P5", 30, "UTEN_BALL"), O("Halvsving 50 %", 60, "LAV_HAST")] },
  { dag: 5, start: "10:00", min: 200, akse: "SPILL", tittel: "18 hull med Tiger 5", sted: "Fredrikstad GK", ovelser: [O("18 hull, slag for slag", 200)] },
  { dag: 6, start: "11:00", min: 75, akse: "SLAG", tittel: "Wedge Gate", sted: "Range 3 · Fredrikstad GK", ovelser: [O("Wedge Gate", 40), O("Avstandskontroll 40–80 m", 35)] },
];

function osloIDag(): { y: number; m: number; d: number; ukedag: number } {
  const deler = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(new Date());
  const v = (t: string) => deler.find((p) => p.type === t)?.value ?? "";
  const ukedag = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(v("weekday"));
  return { y: Number(v("year")), m: Number(v("month")), d: Number(v("day")), ukedag };
}

const minutt = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

async function main() {
  const spiller = await prisma.user.findUnique({ where: { email: SPILLER }, select: { id: true } });
  const coach = await prisma.user.findUnique({ where: { email: COACH }, select: { id: true } });
  if (!spiller || !coach) throw new Error("Fant ikke testkontoene. Kjør seed-screentest-coach.ts først.");

  const slettet = await prisma.workbenchSession.deleteMany({ where: { playerId: spiller.id, notes: MERKE } });

  const idag = osloIDag();
  const iDagUtc = Date.UTC(idag.y, idag.m - 1, idag.d);
  // Uka starter på mandag; i dag ligger alltid på dag 0 i UKE, resten av uka fordeles etter i dag.
  const dato = (dagerFraIDag: number) => new Date(iDagUtc + dagerFraIDag * 86_400_000);
  const naaMinutt = (() => { const t = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date()); return minutt(t); })();

  let laget = 0;
  const lag = async (o: Okt, dagerFraIDag: number, status: string, notat = MERKE) => {
    await prisma.workbenchSession.create({
      data: {
        playerId: spiller.id, coachId: coach.id, createdBy: coach.id, origin: "COACH",
        date: dato(dagerFraIDag), startMinute: minutt(o.start), durationMinutes: o.min,
        title: o.tittel, pyramid: o.akse, status, location: o.sted, notes: notat,
        publishedAt: new Date(), publishedBy: coach.id,
        drills: { create: o.ovelser.map((x, i) => ({
          title: x.navn, durationMinutes: x.min, sortOrder: i,
          akFormel: { pyramid: o.akse, area: "TEE", label: x.navn, motorikk: x.motorikk },
        })) },
      },
    });
    laget++;
  };

  // Fire uker bakover: hele UKE-mønsteret, de fleste gjennomført.
  for (let uke = 1; uke <= 4; uke++) {
    for (const [i, o] of UKE.entries()) {
      const hoppet = (uke + i) % 9 === 0; // omtrent én økt hoppet over per uke
      await lag(o, o.dag - uke * 7, hoppet ? "SKIPPED" : "COMPLETED");
    }
  }
  // Denne uka: i dag og dagene etter. Dagens økter som alt er over, står som gjennomført.
  for (const o of UKE) {
    const ferdig = o.dag === 0 && minutt(o.start) + o.min <= naaMinutt;
    await lag(o, o.dag, ferdig ? "COMPLETED" : "PUBLISHED");
  }

  console.log(JSON.stringify({ slettet: slettet.count, laget, uke: idag }));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
