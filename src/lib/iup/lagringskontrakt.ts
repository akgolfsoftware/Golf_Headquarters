import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { hentIupKilde, lesIupBesvarelse, type IupBesvarelse } from "./utviklingssjekk";
import { hentSesongevalueringKilde, lesSesongevaluering, type IupSesongevaluering } from "./sesongevaluering";

const Kommando = z.object({
  type: z.enum(["UTVIKLINGSSJEKK", "SESONGEVALUERING"]),
  periodeStart: z.iso.date(),
  periodeSlutt: z.iso.date(),
  forventetRevisjon: z.number().int().min(0).max(2147483646),
  requestId: z.uuid().transform((id) => id.toLowerCase()),
  besvarelse: z.unknown(),
}).strict();

export type IupLagringskommando = z.infer<typeof Kommando>;
export type ValidertIupLagring = Omit<IupLagringskommando, "besvarelse"> & {
  besvarelse: IupBesvarelse | IupSesongevaluering;
  niva: string;
  kildeSha256: string;
  requestHash: string;
};

function kanoniskJson(verdi: unknown): string {
  if (Array.isArray(verdi)) return `[${verdi.map(kanoniskJson).join(",")}]`;
  if (verdi !== null && typeof verdi === "object") {
    return `{${Object.entries(verdi).sort(([a], [b]) => a.localeCompare(b, "en")).map(([k, v]) => `${JSON.stringify(k)}:${kanoniskJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(verdi);
}

/** Avleder eierskapsfrie metadata fra validert payload, aldri fra klientens ekstra felt. */
export function lesIupLagring(input: unknown): { ok: true; data: ValidertIupLagring } | { ok: false; melding: string } {
  const parsed = Kommando.safeParse(input);
  if (!parsed.success) return { ok: false, melding: "Ugyldig lagringsforespørsel." };
  const p = parsed.data;
  if (p.periodeStart > p.periodeSlutt) return { ok: false, melding: "Periodens sluttdato kan ikke komme før startdatoen." };
  const lest = p.type === "UTVIKLINGSSJEKK" ? lesIupBesvarelse(p.besvarelse) : lesSesongevaluering(p.besvarelse);
  if (!lest.ok) return { ok: false, melding: lest.melding };
  const besvarelse = lest.data;
  if ("sesongStart" in besvarelse && (besvarelse.sesongStart !== p.periodeStart || besvarelse.sesongSlutt !== p.periodeSlutt)) {
    return { ok: false, melding: "Besvarelsen og lagringen må gjelde samme sesong." };
  }
  const niva = "niva" in besvarelse ? besvarelse.niva : "ALLE";
  const kilde = p.type === "UTVIKLINGSSJEKK" ? hentIupKilde(besvarelse.versjon) : hentSesongevalueringKilde(besvarelse.versjon);
  const normalisert = { ...p, besvarelse };
  return {
    ok: true,
    data: { ...normalisert, niva, kildeSha256: kilde.sha256, requestHash: createHash("sha256").update(kanoniskJson(normalisert)).digest("hex") },
  };
}
