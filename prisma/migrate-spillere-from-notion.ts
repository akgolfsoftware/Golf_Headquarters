/**
 * Engangs-migrasjon: Notion Spillerprofiler-DB → Postgres User-tabellen.
 *
 * Strategi (1b + 2b + 3a):
 *  - Stub-e-post: <slug>+stub@akgolf.no (oppdateres når spiller registrerer seg)
 *  - Stub authId: crypto.randomUUID() (byttes ut når Supabase-konto opprettes)
 *  - Coaching-data (Mål, Styrker, Utviklingsområder, Mental profil, Fokusområder,
 *    Kalender-navn, notion_page_id) lagres i User.preferences JSON
 *
 * Idempotent: bruker upsert på email.
 *
 * Kjør: npx tsx prisma/migrate-spillere-from-notion.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type NotionPlayer = {
  slug: string;
  name: string;
  notionPageId: string;
  kalenderNavn: string;
  fokusomrader: string[];
  mal: string;
  styrker: string;
  utviklingsomrader: string;
  mentalProfil: string;
};

const PLAYERS: NotionPlayer[] = [
  {
    slug: "mathias-sorby",
    name: "Mathias Sørby",
    notionPageId: "31b35a45-535a-81ff-8b23-dc33585daf9f",
    kalenderNavn: "Mathias Sørby",
    fokusomrader: ["Sving"],
    mal: "Lære grunnleggende svingmekanikk og bygge solid teknisk fundament.",
    styrker:
      "God læringsevne — viser fremgang innen sesjonen. Evne til å se og beskrive forskjeller i video. Motivert og engasjert.",
    utviklingsomrader:
      "[2026-02-24]: Albueposisjon i baksvingen (høyre albue flarer ut for mye). Oppstilling og positur. Svingbane (jobbe mot å komme innenfra).",
    mentalProfil:
      "Nybegynner i god utvikling. Responderer godt på visuelle forklaringer og analogier fra kjente idretter. Tålmodig og motivert til læring.",
  },
  {
    slug: "jorgen-engh",
    name: "Jørgen Engh",
    notionPageId: "31b35a45-535a-815f-b2fd-e860c721433f",
    kalenderNavn: "Jørgen Engh",
    fokusomrader: ["Sving", "Langt spill", "Taktisk"],
    mal: "Forbedre driver-konsistens og release-timing. Redusere spredning ved høy klubbhodefart. Implementere presisjonsstrategi-banemanagement.",
    styrker:
      "Høy klubbhodefart (115-120 mph). God selvbevissthet om eget spill. Analytisk tilnærming og åpen for teknologibasert analyse.",
    utviklingsomrader:
      "Release-timing med driver (scoop-tendens). Akseptere naturlig spredning ved høy fart. Konsistens i finish-posisjon.",
    mentalProfil:
      "Analytisk og resultatorientert. Kan ha vansker med å akseptere 60m spredning på banen kontra rangen. Responderer godt på video og data som bevis.",
  },
  {
    slug: "leander-jahr",
    name: "Leander Jahr",
    notionPageId: "31035a45-535a-8107-8ae8-f1e85b57401c",
    kalenderNavn: "Leander Jahr",
    fokusomrader: ["Sving", "Langt spill"],
    mal: "Forbedre svingmekanikk og treffkvalitet.",
    styrker:
      "God læringsevne — responderer raskt på instruksjoner og viser forbedring innen økten. Beskriver egne følelser presist.",
    utviklingsomrader:
      "[2026-02-23]: Baksvingsposisjon (reversed → stacked), arm-kropp-synkronisering (armer stopper etter kropp), vektoverføring til venstre.",
    mentalProfil: "",
  },
  {
    slug: "erik-rochette",
    name: "Erik Rochette",
    notionPageId: "31035a45-535a-8129-85ca-e136359b3c4a",
    kalenderNavn: "Erik Rochette",
    fokusomrader: [],
    mal: "Forbedre svingmekanikk og ballflukt (kontrollert draw). Bygge konsistent impact-posisjon med hendene foran ballen.",
    styrker:
      "Konkurranseerfaring (bl.a. St. Andrews, 18 par på rad). Analytisk tilnærming — responderer godt på Trackman-data. God svinghastighet og potensiale for lengde.",
    utviklingsomrader:
      "[2026-02-23]: Synkronisering av hofte- og brystrotasjon i nedsving. Eliminere høyre tilt i overkroppen for bedre attack angle og komprimering. Vektforflytning — diagonalt (venstre + ut høyre) i stedet for rett sidelengs. Tendens til å assosiere høy fart med kvalitet — må trene på kontrollerte slag.",
    mentalProfil:
      "Kompetitiv spiller med høyt nivå. Kan ha motstand mot å sakte ned i trening — assosierer lav hastighet med dårlig resultat. Responderer godt på data som bevis.",
  },
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const p of PLAYERS) {
    const email = `${p.slug}+stub@akgolf.no`;
    const preferences = {
      notionPageId: p.notionPageId,
      notionSource: "spillerprofiler-archived-2026-05-11",
      coaching: {
        kalenderNavn: p.kalenderNavn,
        fokusomrader: p.fokusomrader,
        mal: p.mal,
        styrker: p.styrker,
        utviklingsomrader: p.utviklingsomrader,
        mentalProfil: p.mentalProfil,
      },
      migrationStub: {
        emailIsStub: true,
        authIdIsStub: true,
        migratedAt: new Date().toISOString(),
      },
    };

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      await prisma.user.update({
        where: { email },
        data: {
          name: p.name,
          role: "PLAYER",
          tier: "GRATIS",
          preferences,
        },
      });
      updated++;
      console.log(`  oppdatert: ${p.name} (${email})`);
    } else {
      await prisma.user.create({
        data: {
          authId: randomUUID(),
          email,
          name: p.name,
          role: "PLAYER",
          tier: "GRATIS",
          preferences,
        },
      });
      created++;
      console.log(`  opprettet: ${p.name} (${email})`);
    }
  }

  console.log(`\nFerdig. Opprettet: ${created}, oppdatert: ${updated}.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
