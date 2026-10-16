import "server-only";
/**
 * Øvelsesbanken sett fra Workbench (beslutning 16.10.2026, punkt 2–4).
 *
 * - `hentVelgerOvelser`: alle øvelser brukeren har tilgang til for spilleren (samme filter som
 *   kildepanelet, `bankOvelseWhere`), med antall ganger hver er lagt inn i spillerens økter.
 *   Ingen `take`: søket skal finne øvelser etter de 60 første. Banken er liten (noen hundre
 *   rader), så søket gjøres i minnet på serveren i stedet for et nytt `contains`-søk mot basen.
 * - `opprettBankOvelse`: «Ny øvelse» lagres i banken. Spiller: PLAYER/PRIVATE (spilleren og
 *   coachen ser den). Coach: COACH/COACH_PLAYERS (alle coachens spillere ser den).
 *
 * Tilgang sjekkes av kalleren (ovelse-bank-actions.ts) før disse kalles.
 */
import { z } from "zod";
import type { Omraade } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { erOmraadeKode } from "@/lib/domain/ak-formel-v2";
import { AkFormelSchema } from "@/lib/domain/workbench/schemas";
import { mengdeTekst, vaskDetaljer } from "@/lib/domain/workbench/ovelse-detaljer";
import type { PyramidArea } from "@/lib/domain/workbench/types";
import { omraadeNavn, skillAreaFor } from "@/lib/portal-drills/ovelser-visning";
import { bankOvelseWhere } from "./bank-referanser";
import { tellBruk, type VelgerOvelse } from "./ovelse-velger";

type Viewer = { id: string; role: string };

/** Alle tilgjengelige øvelser med bruk i spillerens økter. Maler telles ikke som økter. */
export async function hentVelgerOvelser(viewer: Viewer, playerId: string): Promise<VelgerOvelse[]> {
  const [rader, bruk] = await Promise.all([
    prisma.exerciseDefinition.findMany({
      where: await bankOvelseWhere(viewer, playerId),
      select: { id: true, name: true, pyramidArea: true, omraadeKode: true, skillArea: true, source: true, createdBy: true, durationMin: true },
    }),
    prisma.workbenchDrill.findMany({
      where: { exerciseId: { not: null }, session: { playerId, isTemplate: false } },
      select: { exerciseId: true },
    }),
  ]);
  const antall = tellBruk(bruk);
  return rader.map((r) => ({
    id: r.id,
    navn: r.name,
    pyramide: r.pyramidArea as PyramidArea,
    omraade: omraadeNavn(r),
    egen: r.source === "PLAYER" && r.createdBy === playerId,
    brukt: antall.get(r.id) ?? 0,
    min: r.durationMin,
  }));
}

export const NyBankOvelseSchema = z.object({
  title: z.string().trim().min(2, "Skriv et navn på øvelsen.").max(120, "Navnet er for langt."),
  description: z.string().trim().max(2000).optional(),
  durationMinutes: z.number().int().min(1).max(600),
  akFormel: AkFormelSchema,
  videoUrl: z.union([z.literal(""), z.string().trim().max(500).url("Videolenken må være en gyldig adresse.")
    .refine((v) => v.startsWith("https://"), "Videolenken må starte med https://")]).optional(),
});
export type NyBankOvelse = z.infer<typeof NyBankOvelseSchema>;

/** Workbench har to navn på utslag (TEE og TEE_TOTAL); banken har bare TEE_TOTAL. */
function omraadeKodeFra(area: string): Omraade | null {
  const kode = area === "TEE" ? "TEE_TOTAL" : area;
  return erOmraadeKode(kode) ? (kode as Omraade) : null;
}

/**
 * Lagrer øvelsen i banken med alle de åtte trinnene. Aksene med egne kolonner skrives dit;
 * resten ligger som `akFormelV2.detaljer` i `parametersJson`, samme form som Plan-hub (AG-14).
 */
export async function opprettBankOvelse(viewer: Viewer, playerId: string, input: NyBankOvelse): Promise<{ id: string }> {
  const f = input.akFormel;
  const detaljer = vaskDetaljer(f.pyramid, f.area, f.motorikk, f.detaljer);
  const omraadeKode = omraadeKodeFra(f.area);
  const coach = viewer.id !== playerId;
  return prisma.exerciseDefinition.create({
    data: {
      name: input.title,
      description: input.description || null,
      videoUrl: input.videoUrl || null,
      pyramidArea: f.pyramid,
      durationMin: input.durationMinutes,
      omraadeKode,
      skillArea: omraadeKode ? skillAreaFor(omraadeKode) : null,
      motorikk: f.motorikk ?? null,
      press: f.press ?? null,
      utstyr: (detaljer?.utstyr ?? []).map((u) => u.navn),
      defaultRepsSets: mengdeTekst(detaljer?.mengde) ?? null,
      parametersJson: { akFormelV2: { detaljer: detaljer ?? {} } },
      source: coach ? "COACH" : "PLAYER",
      visibility: coach ? "COACH_PLAYERS" : "PRIVATE",
      createdBy: viewer.id,
    },
    select: { id: true },
  });
}
