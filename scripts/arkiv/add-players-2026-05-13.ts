import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const SPILLERE = [
  { navn: "Fredrik Kjølberg Hovland", epost: "fkjolberg@icloud.com" },
  { navn: "Aksel Lind", epost: "aksellind10@gmail.com" },
];

async function main() {
  for (const s of SPILLERE) {
    const eksisterende = await prisma.user.findUnique({ where: { email: s.epost } });
    if (eksisterende) {
      console.log(`SKIP ${s.epost} — finnes allerede (${eksisterende.id})`);
      continue;
    }
    const placeholderAuthId = `pending:${crypto.randomUUID()}`;
    const ny = await prisma.user.create({
      data: {
        authId: placeholderAuthId,
        email: s.epost,
        name: s.navn,
        role: "PLAYER",
        tier: "GRATIS",
      },
    });
    console.log(`OK ${s.navn} (${s.epost}) → ${ny.id}`);
  }
}

main().finally(() => prisma.$disconnect());
