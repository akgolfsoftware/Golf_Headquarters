/** Zod-skjema for radene Data Golf-komponentene leser fra dashboard.*. Ingen databasekall her. */
import { z } from "zod";

const tall = z.coerce.number().finite().nullable();
const heltall = z.coerce.number().int();

export const sgRundeRadSchema = z.object({
  id: heltall,
  dato: z.coerce.date().nullable(),
  tour: z.string().nullable(),
  arrangement: z.string().nullable(),
  runde: z.coerce.number().int().nullable(),
  total: tall, ott: tall, app: tall, arg: tall, putt: tall,
});

export const tourDekningRadSchema = z.object({
  tour: z.string(),
  antallRunder: heltall,
  medTotal: heltall,
  medKategori: heltall,
  fraAar: z.coerce.number().int().nullable(),
  tilAar: z.coerce.number().int().nullable(),
});

export const approachRadSchema = z.object({
  asOf: z.coerce.date(),
  period: z.string(),
  payload: z.unknown(),
});

export const spillerKortRadSchema = z.object({
  dgId: heltall,
  navn: z.string(),
  land: z.string().nullable(),
  fodselsaar: z.coerce.number().int().nullable(),
  amator: z.boolean().nullable(),
  dgRang: z.coerce.number().int().nullable(),
  owgrRang: z.coerce.number().int().nullable(),
  primaerTour: z.string().nullable(),
  sgTotal: tall,
  kildedato: z.coerce.date().nullable(),
  antallRunder: heltall,
  fraAar: z.coerce.number().int().nullable(),
  tilAar: z.coerce.number().int().nullable(),
});
