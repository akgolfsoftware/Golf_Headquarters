/**
 * Seed fysiske ExerciseDefinition-er (PyramidArea = FYS)
 * for styrke- og kondisjonsprogrammet.
 *
 * Kjør: npx tsx scripts/seed-physical-exercises.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type ExerciseSeed = {
  id: string;
  name: string;
  description: string;
  defaultRepsSets: string;
  parametersJson: object;
};

const EXERCISES: ExerciseSeed[] = [
  {
    id: "trapbar-deadlift",
    name: "Trapbar Deadlift",
    description: "Hoftedominant trekkøvelse med hex bar. Stå inni baren, grep i sidehåndtakene, hofte bak, rygg nøytral. Press gulvet ned — ikke dra stangen opp. Grunnøvelsen for total-kroppsstyrke og slagkraft.",
    defaultRepsSets: "4×6",
    parametersJson: {
      intensitetssoner: { grunn: "60–70%", spesial: "75–85%", turnering: "85–90%" },
      cueNorsk: ["Hofte bak", "Rygg nøytral", "Press gulvet ned", "Skulder over baren"],
      testKobling: "Trapbar Deadlift (1RM-test)",
    },
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    description: "Enbens knebøy med bakre fot på benk. Tester og bygger bilateral styrkebalanse. Kritisk for rotasjonsstabilitet i golfsvingen.",
    defaultRepsSets: "3×8/ben",
    parametersJson: {
      cueNorsk: ["Fremre fot nok frem", "Kne sporer over tå", "Hofte ned — ikke frem"],
      progressjon: ["Kroppsvekt", "Håndvekter", "Stang på skulder"],
    },
  },
  {
    id: "nordic-hamstring-curl",
    name: "Nordic Hamstring Curl",
    description: "Eksentri hamstringsøvelse. Kne på matte, partner holder ankler. Fall sakte fremover, brems med hamstrings. Skadeforebyggende og kraftutvikling.",
    defaultRepsSets: "3×5 eksentri",
    parametersJson: {
      cueNorsk: ["Sakte fall — 3–4 sek", "Brems med hamstrings — ikke kjernen", "Push opp med hendene fra gulvet"],
      progressjon: ["3 sek fall", "4 sek fall", "Full Nordic", "Vektet Nordic"],
    },
  },
  {
    id: "hip-thrust",
    name: "Hip Thrust",
    description: "Isolert gluteusøvelse. Skuldre på benk, stang over hofter, trykk hoftene opp. Fundamental for rotasjonskraft fra hoftene i svingen.",
    defaultRepsSets: "3×10",
    parametersJson: {
      cueNorsk: ["Hake inn", "Klem setemusklene toppen", "Kne 90° i toppen"],
    },
  },
  {
    id: "box-jump",
    name: "Box Jump",
    description: "Eksplosivt hopp opp på kasse. Myk landing, strak kropp. Trener reaktiv kraft og eksplosivitet i bena — direkte overføring til Standing Long Jump-testen.",
    defaultRepsSets: "4×5",
    parametersJson: {
      kassehoyde: { u15: "40–50cm", u19: "50–60cm", elite: "60–75cm" },
      cueNorsk: ["Rask armsvingstart", "Full hoftestrekk i toppen", "Myk landing — absorber"],
      testKobling: "Standing Long Jump",
    },
  },
  {
    id: "jump-squat",
    name: "Jump Squat",
    description: "Eksplosiv knebøy med hopp. Kroppsvekt eller lett stang (≤20 kg). Trener power-output og rate of force development.",
    defaultRepsSets: "4×5",
    parametersJson: {
      cueNorsk: ["Hurtig ned — eksplosivt opp", "Full hoftestrekk", "Myk landing"],
      progressjon: ["Kroppsvekt", "Vest 5kg", "Stang 20kg"],
    },
  },
  {
    id: "single-leg-rdl",
    name: "Single-leg RDL",
    description: "Enbens Romanian Deadlift. Stå på ett ben, senk overkroppen fremover. Trener posterior kjede, balanse og bilateral stabilitetsasymmetri.",
    defaultRepsSets: "3×8/ben",
    parametersJson: {
      cueNorsk: ["Hoftehengsling — ikke knebøy", "Rygg nøytral", "Støttebenet lett bøyd"],
      progressjon: ["Kroppsvekt", "Håndvekter", "Kettlebell"],
    },
  },
  {
    id: "benkpress",
    name: "Benkpress",
    description: "Flat benkpress. Full ROM, kontrollert nedsenking 2–3 sek, eksplosivt opp. Overkroppsstyrke for gjennomslaget.",
    defaultRepsSets: "4×6",
    parametersJson: {
      intensitetssoner: { grunn: "60–70%", spesial: "75–85%", turnering: "85–90%" },
      cueNorsk: ["Skulderbladene trukket inn", "Føttene i gulvet", "Albuer 45–60° fra kroppen"],
      testKobling: "Benkpress (1RM-test)",
    },
  },
  {
    id: "chin-up",
    name: "Chin-up / Pull-up",
    description: "Overkroppstrekkøvelse. Chin-up (supinert grep) for underarm + biceps. Pull-up (pronert) for bredrygg. Start med strikk-assist ved behov.",
    defaultRepsSets: "3×8",
    parametersJson: {
      cueNorsk: ["Skulderblad ned og inn", "Bryst mot stangen", "Kontrollert ned"],
      progressjon: ["Strikk-assist", "Kroppsvekt", "Vektet +5kg"],
    },
  },
  {
    id: "med-ball-rotasjonskast",
    name: "Medisinball Rotasjonskast",
    description: "Stå 90° mot vegg, roter og kast ballen i veggen med maksimal rotasjonskraft. Identisk med Ball Throw-testen. Bygger direkte køllehodehastighet.",
    defaultRepsSets: "3×8/side",
    parametersJson: {
      ballvekt: { u15: "2 kg", u19: "3 kg", elite: "4 kg" },
      cueNorsk: ["Kraft starter fra gulvet", "Hofte roterer først", "Armer følger — ikke leder"],
      testKobling: "Ball Throw",
    },
  },
  {
    id: "med-ball-overhead-kast",
    name: "Medisinball Overhead Kast",
    description: "Rett bakover-kast over hodet. Stå med rygg mot kastretning, eksplosiv strekk fra hofter til armtopp. Trener bakre kjede-power.",
    defaultRepsSets: "4×5",
    parametersJson: {
      ballvekt: { u15: "2 kg", u19: "3 kg", elite: "4 kg" },
      cueNorsk: ["Dyp knebøy start", "Eksplosiv full hoftestrekk", "Slipp ikke ballen — kast den"],
    },
  },
  {
    id: "landmine-press",
    name: "Landmine Press",
    description: "Stang forankret i hjørne, press diagonalt opp foran kroppen. Kombinerer push og rotasjon. Skuldervennlig alternativ til overhead press.",
    defaultRepsSets: "3×10",
    parametersJson: {
      cueNorsk: ["Kjerne stram", "Press diagonalt opp-frem", "Full armstrekk i toppen"],
    },
  },
  {
    id: "face-pull",
    name: "Face Pull",
    description: "Kabel/strikk til ansiktshøyde, trekk til ørene med utadrotasjon. Skulder-helse og postural korreksjon. Obligatorisk i alle styrkeøkter.",
    defaultRepsSets: "3×15",
    parametersJson: {
      cueNorsk: ["Albuer høyt", "Trekk til ørene — ikke nakken", "Utadroter i toppen"],
    },
  },
  {
    id: "pallof-press",
    name: "Pallof Press",
    description: "Anti-rotasjonsøvelse med strikk/kabel. Stå 90° på ankerpunktet, trykk strikken rett frem og hold. Bygger rotasjonsstabilitet.",
    defaultRepsSets: "3×12/side",
    parametersJson: {
      cueNorsk: ["Kjerne stram, ikke hold pusten", "Hofter kvadrert", "Hold 2 sek i utstrakt posisjon"],
    },
  },
  {
    id: "farmers-carry",
    name: "Farmers Carry",
    description: "Gå med tung vekt i én eller begge hender. Trener grip, skulder-stabilitet og anti-lateral fleksjon.",
    defaultRepsSets: "3×30m",
    parametersJson: {
      cueNorsk: ["Rak nakke", "Skulderblad ned og inn", "Korte, raske steg"],
    },
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    description: "Ryggliggende, arm og motsatt ben senkes mot gulvet uten at korsryggen løftes. Kjerneøvelse som trener anti-ekstensjon og koordinasjon.",
    defaultRepsSets: "3×8/side",
    parametersJson: {
      cueNorsk: ["Korsryggen i gulvet hele veien", "Pust ut ved bevegelse", "Sakte og kontrollert"],
    },
  },
  {
    id: "intervall-600m",
    name: "Intervallørkt 600m",
    description: "Strukturert intervall-løping. 600m drag med pause mellom. Bygger speed-endurance og forbereder 3000m-testen.",
    defaultRepsSets: "5×600m",
    parametersJson: {
      intensitet: { u15: "80% HFmax", u19: "82% HFmax", elite: "85% HFmax" },
      pause: { u15: "2 min", u19: "90 sek", elite: "90 sek" },
      testKobling: "3000m Utholdenhet",
    },
  },
  {
    id: "aerob-base-lop",
    name: "Aerob Base-løp",
    description: "Kontinuerlig løp i sone 2 (65–75% HFmax). Ikke rask — prat-tempo. Grunnlaget for all aerob kapasitet. Kritisk for golf: holder konsentrasjon hull 14–18.",
    defaultRepsSets: "25 min",
    parametersJson: {
      intensitet: "65–75% HFmax (prat-tempo)",
      varighet: { u15: "20 min", u19: "25 min", elite: "30 min" },
      testKobling: "3000m Utholdenhet",
    },
  },
  {
    id: "intervall-400m",
    name: "Intervallørkt 400m",
    description: "Kort, intensiv intervall. 400m drag, høy intensitet. Pre-sesong forberedelse. Konverterer aerob base til speed-kapasitet.",
    defaultRepsSets: "6×400m",
    parametersJson: {
      intensitet: { u15: "85% HFmax", u19: "87% HFmax", elite: "90% HFmax" },
      pause: "2 min",
      testKobling: "3000m Utholdenhet",
    },
  },
  {
    id: "vedlikeholdslop",
    name: "Vedlikeholdsløp sesong",
    description: "Lett aerob vedlikehold under golfsesong. 20–25 min Z2. Formål: bevare aerob kapasitet uten utmattelse foran turneringer.",
    defaultRepsSets: "22 min",
    parametersJson: {
      intensitet: "65% HFmax — veldig lett",
      varighet: "20–25 min",
      notat: "Aldri dagen før eller etter turnering",
    },
  },
];

async function main() {
  console.log(`Seeder ${EXERCISES.length} fysiske øvelser (FYS)...`);

  for (const ex of EXERCISES) {
    await prisma.exerciseDefinition.upsert({
      where: { id: ex.id },
      update: {
        name: ex.name,
        description: ex.description,
        defaultRepsSets: ex.defaultRepsSets,
        pyramidArea: "FYS",
        parametersJson: ex.parametersJson as object,
      },
      create: {
        id: ex.id,
        name: ex.name,
        description: ex.description,
        defaultRepsSets: ex.defaultRepsSets,
        pyramidArea: "FYS",
        parametersJson: ex.parametersJson as object,
      },
    });
    console.log(`  + ${ex.name}`);
  }

  console.log(`\nFerdig! ${EXERCISES.length} øvelser seedet.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
