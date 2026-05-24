/**
 * Felles Zod-primitives for server-actions.
 * Importer herfra fremfor å definere schemas inline.
 */
import { z } from "zod";

/** CUID v2 — Prisma default-id-format */
export const cuid = z
  .string()
  .min(1)
  .regex(/^c[a-z0-9]{24,}$/i, "Ugyldig ID-format");

/** ISO 8601 dato-streng som kan parses til Date uten NaN */
export const isoDate = z
  .string()
  .refine((s) => !isNaN(new Date(s).getTime()), { message: "Ugyldig dato-format" });

/** Ikke-tom streng (trimmed) med maks lengde */
export const nonEmpty = (max = 500) =>
  z.string().min(1, "Påkrevd").max(max, `Maks ${max} tegn`);

/** E-postadresse — normaliseres til lowercase i transform */
export const email = z.string().email("Ugyldig e-postadresse").max(254);

/** Norsk/internasjonal telefon: 5–20 tegn etter trim */
export const phone = z
  .string()
  .min(5, "Telefonnummer er for kort")
  .max(20, "Telefonnummer er for langt")
  .regex(/^[+\d\s\-()]{5,20}$/, "Ugyldig telefonnummer");

/** Valgfri streng — null/undefined og tom streng → undefined */
export const optStr = (max = 500) =>
  z
    .string()
    .max(max, `Maks ${max} tegn`)
    .nullable()
    .optional()
    .transform((v) => (v === "" || v === null ? undefined : v));
