import { createHash } from "node:crypto";
import { z } from "zod";
import { AkFormelLeseSchema } from "@/lib/domain/workbench/schemas";

const Id = z.string().min(1).max(200);

export const SamlingsOktSchema = z.object({
  sourceSessionId: Id,
  updatedAt: z.iso.datetime(),
  date: z.iso.date(),
  startMinute: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().min(1).max(720),
  title: z.string().min(1).max(200),
  pyramid: z.string().min(1).max(40),
  blockType: z.string().min(1).max(40),
  environment: z.string().max(80).nullable(),
  practiceType: z.string().max(80).nullable(),
  skillArea: z.string().max(80).nullable(),
  pressureLevel: z.string().max(80).nullable(),
  pPosisjoner: z.array(z.string().max(80)).max(50),
  location: z.string().max(160).nullable(),
  maalsetning: z.string().max(500).nullable(),
  drills: z.array(z.object({
    id: Id,
    title: z.string().min(1).max(200),
    description: z.string().max(5000).nullable(),
    durationMinutes: z.number().int().min(1).max(600),
    // Bevar historiske JSON-felt når planen kopieres til spillerens Workbench.
    akFormel: AkFormelLeseSchema.passthrough(),
    techniqueFocus: z.string().max(200).nullable(),
    sortOrder: z.number().int().min(0),
    sourceId: Id.nullable(),
    exerciseId: Id.nullable(),
    positionTaskId: Id.nullable(),
    repType: z.string().max(40).nullable(),
    repAntall: z.number().int().nullable(),
    repMinutter: z.number().int().nullable(),
    repSett: z.number().int().nullable(),
    repReps: z.number().int().nullable(),
    planRepsUtenBall: z.number().int().nullable(),
    planRepsLavFart: z.number().int().nullable(),
    planRepsAuto: z.number().int().nullable(),
  }).strict()).max(100),
}).strict();

export const SamlingsprogramSchema = z.object({
  versjon: z.literal(1),
  samling: z.object({
    id: Id,
    groupId: Id,
    tittel: z.string().min(1).max(200),
    beskrivelse: z.string().max(2000).nullable(),
    sted: z.string().max(160).nullable(),
    fra: z.iso.datetime(),
    til: z.iso.datetime(),
    kind: z.enum(["SAMLING", "HELDAGSSAMLING"]),
    updatedAt: z.iso.datetime(),
  }).strict(),
  oktversjon: z.string().regex(/^[a-f0-9]{64}$/),
  okter: z.array(SamlingsOktSchema).min(1).max(100),
}).strict();

export type Samlingsprogram = z.infer<typeof SamlingsprogramSchema>;

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function hashSamlingsprogram(value: Omit<Samlingsprogram, "oktversjon">): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

export function samlingsInvitasjonId(scheduleId: string, playerId: string, version: string): string {
  const digest = createHash("sha256").update(`${scheduleId}:${playerId}:${version}`).digest("hex").slice(0, 48);
  return `gathering-invite-${digest}`;
}

/** Samme id som ordinær gruppepublisering, slik at en økt aldri kopieres dobbelt. */
export function samlingsOktKopiId(sourceSessionId: string, playerId: string): string {
  const digest = createHash("sha256").update(`${sourceSessionId}:${playerId}`).digest("hex");
  return `wb-group-copy-${digest}`;
}

export function datoIOslo(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
