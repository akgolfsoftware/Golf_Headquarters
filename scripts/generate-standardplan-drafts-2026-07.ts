// Genererer standardplan-UTKAST (approved: false) for alle (NgfKategori × LPhase)-
// kombinasjoner som PlanTemplateSession-innhold, klare for menneskelig review i
// /admin/plan-templates. Struktur/tall er deterministiske (standard-fordeling.ts);
// AI (Claude Sonnet) fyller kun inn titler, fokus og drill-valg fra eksisterende
// øvelsesbank — ukjente drill-id-er forkastes ved validering.
//
// Kjøring:
//   npx tsx scripts/generate-standardplan-drafts-2026-07.ts            # alle 36
//   npx tsx scripts/generate-standardplan-drafts-2026-07.ts --dry      # kun skjelett, ingen AI/skriving
//   npx tsx scripts/generate-standardplan-drafts-2026-07.ts --kombo G:GRUNN
//   npx tsx scripts/generate-standardplan-drafts-2026-07.ts --maks 3
//
// Idempotent: hopper over kombinasjoner der «Standardplan <KAT> · <FASE>» finnes
// (unik på [kategori, lPhase, name]).

import Anthropic from "@anthropic-ai/sdk";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import * as dotenv from "dotenv";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import type { NgfKategori, LPhase, PyramidArea } from "../src/generated/prisma/client";
import {
  byggStandardSkjelett,
  STANDARD_PYRAMIDE,
  STANDARD_OKT_ANTALL,
  FASE_BESKRIVELSE,
  type SkjelettOkt,
} from "../src/lib/plan-engine/standard-fordeling";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }) });

// Rå SDK direkte (ikke @/lib/anthropic — unngår app-importkjede i script-kontekst).
// Rå SDK håndterer ANTHROPIC_BASE_URL uten /v1 selv (jf. .claude/rules/gotchas.md).
const MODELL = "claude-sonnet-4-6";

const KATEGORIER: NgfKategori[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const FASER: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING"];
const SKILL_AREAS = ["TEE_TOTAL", "TILNAERMING", "AROUND_GREEN", "PUTTING", "SPILL"] as const;
const ENVIRONMENTS = ["RANGE", "BANE", "STUDIO", "HJEM", "SIMULATOR", "GYM"] as const;

// Sonnet-priser (USD per million tokens) — kun for kost-logging.
const PRIS_INN = 3;
const PRIS_UT = 15;

// ---------- Zod-kontrakt for AI-svaret ----------

const DrillValgSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().min(1).max(20).optional(),
  reps: z.number().int().min(1).max(200).optional(),
  csTarget: z.number().min(30).max(110).optional(),
  notes: z.string().max(200).optional(),
});

const OktSvarSchema = z.object({
  ukeNr: z.number().int().min(1).max(4),
  dagNr: z.number().int().min(1).max(7),
  title: z.string().min(3).max(120),
  focus: z.string().min(3).max(240),
  skillArea: z.enum(SKILL_AREAS).nullable(),
  environment: z.enum(ENVIRONMENTS),
  drills: z.array(DrillValgSchema).min(1).max(4),
});

const PlanSvarSchema = z.object({
  okter: z.array(OktSvarSchema).min(1),
});

type PlanSvar = z.infer<typeof PlanSvarSchema>;

// Fagkoder som ALDRI skal ut til spillere (klarspråk-regelen), + ordbok-regelen.
const FAGKODE_REGEX = /\b(PR[1-5]|CS\d{2,3}|M[0-5]|P([1-9]|10)|L_[A-ZÆØÅ]+)\b/;
const FORBUDT_TEKST = /kort spill/i;

// ---------- Drill-katalog ----------

interface DrillRad {
  id: string;
  name: string;
  pyramidArea: PyramidArea;
  skillArea: string | null;
  environment: string[];
  durationMin: number | null;
  defaultSets: number | null;
  defaultReps: number | null;
  csTargetByKategori: unknown;
  treningstype: string | null;
}

async function hentDrillKatalog(
  kategori: NgfKategori,
  fase: LPhase,
  omrader: PyramidArea[],
): Promise<DrillRad[]> {
  const kIdx = KATEGORIER.indexOf(kategori);
  const alle = await prisma.exerciseDefinition.findMany({
    where: { pyramidArea: { in: omrader } },
    select: {
      id: true, name: true, pyramidArea: true, skillArea: true,
      environment: true, durationMin: true, defaultSets: true, defaultReps: true,
      csTargetByKategori: true, treningstype: true,
      minKategori: true, maxKategori: true, lPhases: true,
    },
    orderBy: { name: "asc" },
  });
  const passerNivaa = alle.filter((d) => {
    const min = d.minKategori ? KATEGORIER.indexOf(d.minKategori) : 0;
    const max = d.maxKategori ? KATEGORIER.indexOf(d.maxKategori) : KATEGORIER.length - 1;
    return kIdx >= min && kIdx <= max;
  });
  // Foretrekk drills tagget med riktig periode-fase (tom liste = universell).
  const prioritert = [
    ...passerNivaa.filter((d) => d.lPhases.includes(fase)),
    ...passerNivaa.filter((d) => d.lPhases.length === 0),
    ...passerNivaa.filter((d) => d.lPhases.length > 0 && !d.lPhases.includes(fase)),
  ];
  // Maks 25 per pyramideområde — holder prompten kompakt.
  const perOmrade = new Map<string, number>();
  const ut: DrillRad[] = [];
  for (const d of prioritert) {
    const n = perOmrade.get(d.pyramidArea) ?? 0;
    if (n >= 25) continue;
    perOmrade.set(d.pyramidArea, n + 1);
    ut.push(d);
  }
  return ut;
}

// ---------- AI-kall ----------

const TOOL_NAVN = "lever_standardplan";

function byggPrompt(
  kategori: NgfKategori,
  fase: LPhase,
  skjelett: SkjelettOkt[],
  katalog: DrillRad[],
): string {
  const pyr = STANDARD_PYRAMIDE[kategori];
  const slots = skjelett
    .map(
      (s) =>
        `uke ${s.ukeNr}, dag ${s.dagNr} (${s.ukeType}): område ${s.pyramidArea}, ${s.varighetMin} min`,
    )
    .join("\n");
  const drills = katalog
    .map((d) => {
      const cs = d.csTargetByKategori ? ` csTargetByKategori=${JSON.stringify(d.csTargetByKategori)}` : "";
      return `- id=${d.id} «${d.name}» område=${d.pyramidArea} skillArea=${d.skillArea ?? "-"} miljø=[${d.environment.join(",")}] varighet=${d.durationMin ?? "-"} sets=${d.defaultSets ?? "-"} reps=${d.defaultReps ?? "-"}${cs}`;
    })
    .join("\n");

  return `Du fyller inn innhold i en STANDARD TRENINGSPLAN for AK Golf Academy.

MÅLGRUPPE: spillernivå kategori ${kategori} (NGF-skala A=world elite … L=nybegynner).
PERIODE: ${fase} — ${FASE_BESKRIVELSE[fase]}
PYRAMIDEFORDELING (fast, ikke endre): FYS ${pyr.FYS}% · TEK ${pyr.TEK}% · SLAG ${pyr.SLAG}% · SPILL ${pyr.SPILL}% · TURN ${pyr.TURN}%
ØKTER PER UKE: ${STANDARD_OKT_ANTALL[kategori][fase]} (uke 4 er deload med færre/kortere økter).

SKJELETTET er fast bestemt — du skal levere NØYAKTIG én økt per slot under, med samme ukeNr/dagNr:
${slots}

For hver økt leverer du:
- title: kort norsk økt-navn i klarspråk (maks 120 tegn)
- focus: én setning om hva økten skal oppnå (maks 240 tegn)
- skillArea: TEE_TOTAL | TILNAERMING | AROUND_GREEN | PUTTING | SPILL — eller null for rene FYS-økter
- environment: RANGE | BANE | STUDIO | HJEM | SIMULATOR | GYM — velg et miljø drillene faktisk kan kjøres i
- drills: 1–4 drills fra katalogen under. Bruk KUN id-er fra katalogen. Sett sets/reps der drillen har standardverdier, og csTarget for kategori ${kategori} der csTargetByKategori finnes.

REGLER:
- Norsk bokmål. ALDRI fagkoder i title/focus (ingen M0–M5, PR1–PR5, CS-tall, P1–P10, L_-faser).
- Skriv «nærspill», aldri «kort spill».
- Minst én putting-økt (skillArea PUTTING) per uke.
- Deload-uka (uke 4) skal ha roligere titler/fokus — restitusjon og vedlikehold.
- Velg drills som matcher øktas pyramideområde.

DRILL-KATALOG:
${drills}

Lever svaret via verktøyet ${TOOL_NAVN}.`;
}

const TOOL_SCHEMA = {
  name: TOOL_NAVN,
  description: "Lever den utfylte standardplanen som strukturert JSON.",
  input_schema: {
    type: "object" as const,
    properties: {
      okter: {
        type: "array",
        items: {
          type: "object",
          properties: {
            ukeNr: { type: "integer" },
            dagNr: { type: "integer" },
            title: { type: "string" },
            focus: { type: "string" },
            skillArea: { type: ["string", "null"], enum: [...SKILL_AREAS, null] },
            environment: { type: "string", enum: [...ENVIRONMENTS] },
            drills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  exerciseId: { type: "string" },
                  sets: { type: "integer" },
                  reps: { type: "integer" },
                  csTarget: { type: "number" },
                  notes: { type: "string" },
                },
                required: ["exerciseId"],
              },
            },
          },
          required: ["ukeNr", "dagNr", "title", "focus", "skillArea", "environment", "drills"],
        },
      },
    },
    required: ["okter"],
  },
};

/** Valider AI-svar mot skjelett + katalog. Returnerer feil-liste (tom = OK). */
function validerSvar(svar: PlanSvar, skjelett: SkjelettOkt[], katalog: DrillRad[]): string[] {
  const feil: string[] = [];
  const gyldigeIder = new Set(katalog.map((d) => d.id));
  const slotNokkel = (u: number, d: number) => `${u}:${d}`;
  const forventet = new Set(skjelett.map((s) => slotNokkel(s.ukeNr, s.dagNr)));
  const levert = new Set(svar.okter.map((o) => slotNokkel(o.ukeNr, o.dagNr)));

  for (const n of forventet) if (!levert.has(n)) feil.push(`Mangler økt for slot uke:dag ${n}`);
  for (const n of levert) if (!forventet.has(n)) feil.push(`Ukjent slot uke:dag ${n} (ikke i skjelettet)`);
  if (svar.okter.length !== skjelett.length)
    feil.push(`Antall økter ${svar.okter.length} ≠ skjelett ${skjelett.length}`);

  for (const o of svar.okter) {
    for (const d of o.drills) {
      if (!gyldigeIder.has(d.exerciseId)) feil.push(`Ukjent drill-id ${d.exerciseId} i uke ${o.ukeNr} dag ${o.dagNr}`);
    }
    const tekst = `${o.title} ${o.focus}`;
    if (FAGKODE_REGEX.test(tekst)) feil.push(`Fagkode i tekst («${tekst.match(FAGKODE_REGEX)?.[0]}») uke ${o.ukeNr} dag ${o.dagNr}`);
    if (FORBUDT_TEKST.test(tekst)) feil.push(`«kort spill» brukt (skal være «nærspill») uke ${o.ukeNr} dag ${o.dagNr}`);
  }

  // Fast metodikk-regel: minst én putting-økt per uke (skillArea PUTTING på
  // økta, eller minst én drill med skillArea PUTTING).
  const puttingDrillIder = new Set(katalog.filter((d) => d.skillArea === "PUTTING").map((d) => d.id));
  const uker = new Set(skjelett.map((s) => s.ukeNr));
  for (const uke of uker) {
    const ukensOkter = svar.okter.filter((o) => o.ukeNr === uke);
    const harPutting = ukensOkter.some(
      (o) => o.skillArea === "PUTTING" || o.drills.some((d) => puttingDrillIder.has(d.exerciseId)),
    );
    if (!harPutting) feil.push(`Uke ${uke} mangler putting-økt (minst én per uke, uansett nivå)`);
  }
  return feil;
}

interface Kostnad {
  inn: number;
  ut: number;
}

async function genererMedAi(
  klient: Anthropic,
  kategori: NgfKategori,
  fase: LPhase,
  skjelett: SkjelettOkt[],
  katalog: DrillRad[],
  kost: Kostnad,
): Promise<PlanSvar> {
  const basisPrompt = byggPrompt(kategori, fase, skjelett, katalog);
  let feilFraForrige: string[] = [];

  for (let forsok = 1; forsok <= 2; forsok++) {
    const prompt =
      feilFraForrige.length === 0
        ? basisPrompt
        : `${basisPrompt}\n\nFORRIGE FORSØK HADDE FEIL — rett disse:\n${feilFraForrige.map((f) => `- ${f}`).join("\n")}`;

    const res = await klient.messages.create({
      model: MODELL,
      max_tokens: 8192,
      tools: [TOOL_SCHEMA],
      tool_choice: { type: "tool", name: TOOL_NAVN },
      messages: [{ role: "user", content: prompt }],
    });
    kost.inn += res.usage.input_tokens;
    kost.ut += res.usage.output_tokens;

    const toolBlock = res.content.find((b) => b.type === "tool_use");
    if (!toolBlock || toolBlock.type !== "tool_use") {
      feilFraForrige = ["Svaret manglet tool_use-blokk"];
      continue;
    }
    const parsed = PlanSvarSchema.safeParse(toolBlock.input);
    if (!parsed.success) {
      feilFraForrige = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).slice(0, 10);
      continue;
    }
    const valideringsFeil = validerSvar(parsed.data, skjelett, katalog);
    if (valideringsFeil.length > 0) {
      feilFraForrige = valideringsFeil.slice(0, 10);
      continue;
    }
    return parsed.data;
  }
  throw new Error(`Validering feilet etter 2 forsøk: ${feilFraForrige.join("; ")}`);
}

// ---------- Skriving ----------

async function skrivUtkast(
  kategori: NgfKategori,
  fase: LPhase,
  skjelett: SkjelettOkt[],
  svar: PlanSvar,
): Promise<void> {
  const pyr = STANDARD_PYRAMIDE[kategori];
  const skjelettVedSlot = new Map(skjelett.map((s) => [`${s.ukeNr}:${s.dagNr}`, s]));

  await prisma.planTemplate.create({
    data: {
      name: `Standardplan ${kategori} · ${fase}`,
      description: `${FASE_BESKRIVELSE[fase]} AI-generert utkast (${MODELL}) over deterministisk skjelett — krever godkjenning før bruk.`,
      kategori,
      lPhase: fase,
      varighetUker: 4,
      ukentligOktAntall: STANDARD_OKT_ANTALL[kategori][fase],
      disciplinFordeling: {
        FYS: pyr.FYS / 100,
        TEK: pyr.TEK / 100,
        SLAG: pyr.SLAG / 100,
        SPILL: pyr.SPILL / 100,
        TURN: pyr.TURN / 100,
      },
      approved: false,
      sessions: {
        create: svar.okter.map((o) => {
          const slot = skjelettVedSlot.get(`${o.ukeNr}:${o.dagNr}`);
          if (!slot) throw new Error(`Slot ${o.ukeNr}:${o.dagNr} mangler i skjelett`);
          return {
            ukeNr: o.ukeNr,
            dagNr: o.dagNr,
            title: o.title,
            varighetMin: slot.varighetMin,
            pyramidArea: slot.pyramidArea,
            skillArea: o.skillArea,
            environment: o.environment,
            focus: o.focus,
            drillsJson: o.drills as unknown as Prisma.InputJsonValue,
          };
        }),
      },
    },
  });
}

// ---------- Hovedløp ----------

function parseArgs(): { dry: boolean; kombo: string | null; maks: number } {
  const args = process.argv.slice(2);
  const komboIdx = args.indexOf("--kombo");
  const maksIdx = args.indexOf("--maks");
  return {
    dry: args.includes("--dry"),
    kombo: komboIdx >= 0 ? args[komboIdx + 1] : null,
    maks: maksIdx >= 0 ? Number(args[maksIdx + 1]) : Infinity,
  };
}

async function main() {
  const { dry, kombo, maks } = parseArgs();
  const klient = dry ? null : new Anthropic({ apiKey: kravEnv("ANTHROPIC_API_KEY") });
  const kost: Kostnad = { inn: 0, ut: 0 };
  let generert = 0;
  let hoppet = 0;
  let feilet = 0;

  for (const kategori of KATEGORIER) {
    for (const fase of FASER) {
      if (kombo && kombo !== `${kategori}:${fase}`) continue;
      if (generert >= maks) break;

      const navn = `Standardplan ${kategori} · ${fase}`;
      const finnes = await prisma.planTemplate.findFirst({ where: { name: navn }, select: { id: true } });
      if (finnes) {
        hoppet++;
        continue;
      }

      const skjelett = byggStandardSkjelett(kategori, fase);
      if (dry) {
        console.log(`\n[DRY] ${navn}: ${skjelett.length} økter`);
        for (const s of skjelett) console.log(`  uke ${s.ukeNr} dag ${s.dagNr} ${s.pyramidArea} ${s.varighetMin}min (${s.ukeType})`);
        generert++;
        continue;
      }

      const omrader = [...new Set(skjelett.map((s) => s.pyramidArea))];
      const katalog = await hentDrillKatalog(kategori, fase, omrader);
      if (katalog.length < 5) {
        console.warn(`⚠ ${navn}: kun ${katalog.length} drills i katalogen — hopper over (for tynt grunnlag).`);
        feilet++;
        continue;
      }

      try {
        const svar = await genererMedAi(klient!, kategori, fase, skjelett, katalog, kost);
        await skrivUtkast(kategori, fase, skjelett, svar);
        generert++;
        console.log(`✓ ${navn}: ${svar.okter.length} økter, ${katalog.length} drills i katalog`);
      } catch (e) {
        feilet++;
        console.error(`✗ ${navn}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }

  const kostUsd = (kost.inn / 1e6) * PRIS_INN + (kost.ut / 1e6) * PRIS_UT;
  console.log(
    `\nFerdig: ${generert} generert, ${hoppet} fantes fra før, ${feilet} feilet.` +
      (dry ? "" : ` Tokens: ${kost.inn} inn / ${kost.ut} ut ≈ $${kostUsd.toFixed(2)}.`),
  );
}

function kravEnv(navn: string): string {
  const v = process.env[navn];
  if (!v) throw new Error(`${navn} mangler i .env.local`);
  return v;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
