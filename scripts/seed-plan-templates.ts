// Seed PlanTemplate med én baseline per (NgfKategori × LPhase).
// Pyramid-% basert på AK Golf-taksonomi, kalibrert per nivå.
// Coach kan overstyre enkeltmaler fra admin-UI.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }) });

// Pyramid % per NgfKategori (FYS/TEK/SLAG/SPILL/TURN, sum = 100).
// A-C = elite, mer spill/turnering, lite teknisk grunnarbeid.
// D-F = sterk amateur, balansert teknisk + spill.
// G-I = god klubbspiller, mer teknikk og nærspill.
// J-K = begynner/junior, mye teknikk og grunnlag.
const PYRAMID: Record<string, { FYS: number; TEK: number; SLAG: number; SPILL: number; TURN: number }> = {
  A: { FYS: 10, TEK: 15, SLAG: 25, SPILL: 30, TURN: 20 },
  B: { FYS: 10, TEK: 18, SLAG: 27, SPILL: 28, TURN: 17 },
  C: { FYS: 12, TEK: 20, SLAG: 28, SPILL: 25, TURN: 15 },
  D: { FYS: 13, TEK: 22, SLAG: 30, SPILL: 25, TURN: 10 },
  E: { FYS: 14, TEK: 24, SLAG: 30, SPILL: 22, TURN: 10 },
  F: { FYS: 15, TEK: 25, SLAG: 30, SPILL: 22, TURN:  8 },
  G: { FYS: 15, TEK: 27, SLAG: 30, SPILL: 20, TURN:  8 },
  H: { FYS: 15, TEK: 28, SLAG: 32, SPILL: 18, TURN:  7 },
  I: { FYS: 15, TEK: 30, SLAG: 33, SPILL: 15, TURN:  7 },
  J: { FYS: 15, TEK: 32, SLAG: 35, SPILL: 13, TURN:  5 },
  K: { FYS: 15, TEK: 33, SLAG: 37, SPILL: 10, TURN:  5 },
  L: { FYS: 15, TEK: 35, SLAG: 38, SPILL:  7, TURN:  5 },
};

// Typiske antall økter per uke og lengde per kategori × LPhase.
const OKT_ANTALL: Record<string, Record<string, number>> = {
  A: { GRUNN: 6, SPESIAL: 6, TURNERING: 5 },
  B: { GRUNN: 6, SPESIAL: 6, TURNERING: 5 },
  C: { GRUNN: 5, SPESIAL: 6, TURNERING: 5 },
  D: { GRUNN: 5, SPESIAL: 5, TURNERING: 4 },
  E: { GRUNN: 5, SPESIAL: 5, TURNERING: 4 },
  F: { GRUNN: 4, SPESIAL: 5, TURNERING: 4 },
  G: { GRUNN: 4, SPESIAL: 4, TURNERING: 3 },
  H: { GRUNN: 4, SPESIAL: 4, TURNERING: 3 },
  I: { GRUNN: 3, SPESIAL: 4, TURNERING: 3 },
  J: { GRUNN: 3, SPESIAL: 3, TURNERING: 2 },
  K: { GRUNN: 3, SPESIAL: 3, TURNERING: 2 },
  L: { GRUNN: 2, SPESIAL: 3, TURNERING: 2 },
};

const KATEGORIER = ["A","B","C","D","E","F","G","H","I","J","K","L"] as const;
const FASER = ["GRUNN","SPESIAL","TURNERING"] as const;

const FASE_BESKRIVELSE: Record<string, string> = {
  GRUNN: "Grunnperiode: fysisk og teknisk fundament, høyt volum, lav intensitet.",
  SPESIAL: "Spesialiseringsperiode: rettet mot spillerens svakeste SG-område, stigende intensitet.",
  TURNERING: "Turneringsperiode: redusert volum, skarp prestasjonsfokus, spill og strategitrening.",
};

async function main() {
  let opprettet = 0;
  let hoppet = 0;

  for (const kat of KATEGORIER) {
    for (const fase of FASER) {
      const navn = `Kategori ${kat} — ${fase}`;
      const finnes = await prisma.planTemplate.findFirst({
        where: { name: navn },
        select: { id: true },
      });
      if (finnes) { hoppet++; continue; }

      const pyr = PYRAMID[kat];
      // Lagre som desimaler (0–1) slik schema-kommentaren sier
      const disciplinFordeling = {
        FYS:   pyr.FYS  / 100,
        TEK:   pyr.TEK  / 100,
        SLAG:  pyr.SLAG / 100,
        SPILL: pyr.SPILL/ 100,
        TURN:  pyr.TURN / 100,
      };

      await prisma.planTemplate.create({
        data: {
          name: navn,
          description: `${FASE_BESKRIVELSE[fase]} Pyramid-standard for kategori ${kat}.`,
          kategori: kat as "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L",
          lPhase: fase as "GRUNN"|"SPESIAL"|"TURNERING",
          varighetUker: 4,
          ukentligOktAntall: OKT_ANTALL[kat][fase],
          disciplinFordeling,
          approved: true,
        },
      });
      opprettet++;
    }
  }

  console.log(`✓ Ferdig: ${opprettet} maler opprettet, ${hoppet} hoppet over (finnes allerede).`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
