/**
 * Datakontrakten mot databasefunksjonene som eier koblingen mellom en HQ-profil
 * og en spiller i resultathistorikken (repoet ak-golf-pipelines, migrasjon 0012
 * og 0014, schema `dashboard`).
 *
 * Alt fra databasen valideres her. En tabell eller funksjon som endrer form
 * skal gi en tydelig feil, ikke et tall som ser riktig ut.
 */

import { z } from "zod";

export const KoblingsMetodeSchema = z.enum(["member_id", "name_birth"]);
export type KoblingsMetode = z.infer<typeof KoblingsMetodeSchema>;

const EvidensSchema = z.object({
  tournament: z.string(),
  date: z.string().nullable(),
  class: z.string().nullable(),
});

/** Kandidat i «Er dette deg?». Viser aldri score eller medlemsnummer. */
export const KandidatSchema = z.object({
  person_id: z.number().int(),
  name: z.string(),
  birth_year: z.number().int().nullable(),
  club: z.string().nullable(),
  tournaments: z.number().int(),
  evidence: z.array(EvidensSchema),
});
export type Kandidat = z.infer<typeof KandidatSchema>;

export const KandidaterSchema = z.object({
  method: KoblingsMetodeSchema.nullable(),
  candidates: z.array(KandidatSchema),
});
export type Kandidater = z.infer<typeof KandidaterSchema>;

export const KoblingsstatusSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("none") }),
  z.object({
    status: z.enum(["pending", "confirmed"]),
    link_id: z.number().int(),
    method: KoblingsMetodeSchema,
    candidate: KandidatSchema.nullable(),
  }),
]);
export type Koblingsstatus = z.infer<typeof KoblingsstatusSchema>;

const Tall = z.number().nullable();

const SesongSchema = z.object({
  year: z.number().int(),
  runder: z.number().int(),
  turneringer: z.number().int(),
  snitt_score: Tall,
  snitt_til_par: Tall,
  snitt_mot_felt: Tall,
  justert_snitt: Tall,
  segment: z.string().nullable(),
  persentil_kull: z.number().nullable(),
  kull_n: z.number().int().nullable(),
});

const MonsterSchema = z.object({
  year: z.number().int(),
  hull: z.number().int(),
  birdierate: Tall,
  bogeyrate: Tall,
  dobbeltrate: Tall,
  snitt_par3: Tall,
  snitt_par4: Tall,
  snitt_par5: Tall,
});

const HullSchema = z.object({
  hull: z.number().int(),
  par: z.number().int().nullable(),
  score: z.number().int(),
});

const RundeSchema = z.object({
  turnering_id: z.number().int(),
  turnering: z.string(),
  dato: z.string().nullable(),
  klasse: z.string().nullable(),
  runde: z.number().int(),
  score: z.number().int(),
  til_par: Tall,
  felt_snitt: Tall,
  felt_n: z.number().int().nullable(),
  mot_felt: Tall,
  justert_score: Tall,
  feltstyrke: Tall,
  hull: z.array(HullSchema).nullable(),
});
export type ProfilRunde = z.infer<typeof RundeSchema>;

export const ProfilResultaterSchema = z.object({
  person: z.object({ name: z.string(), birth_year: z.number().int().nullable() }),
  sesonger: z.array(SesongSchema),
  monster: z.array(MonsterSchema),
  runder: z.array(RundeSchema),
});
export type ProfilResultater = z.infer<typeof ProfilResultaterSchema>;
export type ProfilSesong = z.infer<typeof SesongSchema>;
export type ProfilMonster = z.infer<typeof MonsterSchema>;
