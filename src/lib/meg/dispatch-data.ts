// src/lib/meg/dispatch-data.ts — leser pause-kort.json / morgenbrief-data.json
// skrevet av de planlagte vaktene (sla-vakt-pause, kveldsjekk-dispatch,
// morgenbrief-dispatch) til ~/ak-brain/claude-code/. Filene finnes KUN på
// maskiner som har ak-brain montert (Mac Mini) — på Vercel er banen
// utilgjengelig, og funksjonene returnerer da null (tom-tilstand i UI),
// aldri påfunnet data. JSON valideres med zod (ekstern kilde, ikke Prisma,
// men samme regel: aldri "as unknown as T" på data vi ikke kontrollerer).
import "server-only";
import { readFile } from "fs/promises";
import { join } from "path";
import { z } from "zod";

const AK_BRAIN_DIR = join(process.env.HOME ?? "", "ak-brain", "claude-code");

const segSchema = z.union([
  z.object({ t: z.string() }),
  z.object({ b: z.string() }),
]);

const kildeSchema = z.object({
  id: z.enum(["gmail", "imessage", "beeper"]),
  navn: z.string(),
  status: z.enum(["ok", "nede", "av"]),
});

const meldingSchema = z.object({
  id: z.string(),
  navn: z.string(),
  kanal: z.enum(["gmail", "imessage", "beeper"]),
  nett: z.string().nullable().optional(),
  emne: z.string().nullable().optional(),
  siste: z.string(),
  mottatt: z.string(),
  alder: z.string(),
  tier: z.enum(["brudd", "haster", "ok"]),
  virk: z.string(),
  utkast: z.array(segSchema),
  gmailUtkast: z.boolean(),
});

const kanVenteSchema = z.object({
  id: z.string(),
  navn: z.string(),
  kanal: z.enum(["gmail", "imessage", "beeper"]),
  siste: z.string(),
  alder: z.string(),
});

const vaktSchema = z.object({ sist: z.string(), neste: z.string() });

const pauseKortSchema = z.object({
  generertVed: z.string(),
  vakt: vaktSchema,
  kilder: z.array(kildeSchema),
  notis: z.string().nullable(),
  meldinger: z.array(meldingSchema),
  kanVente: z.array(kanVenteSchema),
});
export type PauseKort = z.infer<typeof pauseKortSchema>;
export type Melding = z.infer<typeof meldingSchema>;
export type Kilde = z.infer<typeof kildeSchema>;

const oppgaveSchema = z.object({
  id: z.string(),
  t: z.string(),
  virk: z.string(),
  frist: z.string(),
});

const KATEGORI_KEYS = ["kjoring", "wang", "moete", "akademi", "familie"] as const;
const kalenderHendelseSchema = z.object({
  id: z.string(),
  kl: z.string(),
  til: z.string(),
  varighet: z.string(),
  tittel: z.string(),
  kat: z.enum(KATEGORI_KEYS),
  sted: z.string(),
  konflikt: z.string().nullable().optional(),
});

const nesteStegSchema = z.object({
  id: z.string(),
  seg: z.array(segSchema),
  kilde: z.string(),
});

const morgenbriefSchema = z.object({
  generertVed: z.string(),
  vakt: vaktSchema.extend({ generert: z.string() }),
  kilder: z.array(kildeSchema),
  notis: z.string().nullable(),
  meldinger: z.array(meldingSchema),
  oppgaver: z.object({
    forfalt: z.array(oppgaveSchema),
    idag: z.array(oppgaveSchema),
    uka: z.array(oppgaveSchema),
  }),
  kalender: z.object({
    idag: z.array(kalenderHendelseSchema),
    imorgen: z.array(kalenderHendelseSchema),
  }),
  nesteSteg: z.array(nesteStegSchema),
});
export type Morgenbrief = z.infer<typeof morgenbriefSchema>;
export type KalenderHendelse = z.infer<typeof kalenderHendelseSchema>;
export type KategoriKey = (typeof KATEGORI_KEYS)[number];

async function lesJson<T>(filnavn: string, schema: z.ZodType<T>): Promise<T | null> {
  try {
    const raw = await readFile(join(AK_BRAIN_DIR, filnavn), "utf-8");
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function hentPauseKort(): Promise<PauseKort | null> {
  return lesJson("pause-kort.json", pauseKortSchema);
}

export async function hentMorgenbrief(): Promise<Morgenbrief | null> {
  return lesJson("morgenbrief-data.json", morgenbriefSchema);
}
