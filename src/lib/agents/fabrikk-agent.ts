// fabrikk: leser ubehandlede funn fra radar-agenten (RadarFunn) og lar Claude
// vurdere om funnet har treningsverdi. Har det det, genereres en HELT EGEN
// øvelse/test inspirert av temaet — aldri kopiert tekst/video fra kilden —
// grundet i masterbrain sin CANON-fasit (nivå A-K, pyramidefordeling,
// LTAD-fase). Forslaget lagres som CaddieDraft med samme toolName som
// drill-forslag-agent, så det dukker opp i den EKSISTERENDE godkjenningskøen
// på /admin/drills/forslag uten noen ny UI. Radar-funnet markeres behandlet
// uansett utfall (relevant, irrelevant eller feilet) — hver rad behandles kun én gang.

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { anthropic, modelFor, AI_MAX_TOKENS, isAiEnabled } from "@/lib/ai/client";
import { PyramidArea, SkillArea, NgfKategori } from "@/generated/prisma/enums";
import { DRILL_DRAFT_TOOL } from "./drill-forslag-agent";
import { masterbrain } from "@/lib/masterbrain";

export const AGENT_NAME = "fabrikk";

const BATCH_STORRELSE = 8;

type CanonKategori = {
  id: string;
  handicap_equivalent: string;
  description: string;
  ltad_phase: string;
  pyramid_default: Record<string, number>;
};

function canonSammendrag(): string {
  const cats = masterbrain.canonMethodology.categories as unknown as Record<string, CanonKategori>;
  return Object.values(cats)
    .map((k) => {
      const p = k.pyramid_default;
      return `${k.id} (${k.handicap_equivalent}): ${k.description} — pyramide FYS${p.FYS}/TEK${p.TEK}/SLAG${p.SLAG}/SPILL${p.SPILL}/TURN${p.TURN}, LTAD-fase ${k.ltad_phase}`;
    })
    .join("\n");
}

const SYSTEM = `
Du er Fabrikk-agent for AK Golf HQ. Du får en kort tittel + sammendrag fra en
nyhetsartikkel eller YouTube-video som REN INSPIRASJON — aldri kopier
formuleringer eller innhold derfra. Du skriver en helt egen, ny norsk
treningsøvelse/test inspirert av temaet.

Vurder FØRST om ideen faktisk har treningsverdi (en konkret drill, test eller
treningsmetode). Utstyrsomtaler, turneringsresultater, klassifiserte annonser
og lignende har det IKKE. Har den ikke treningsverdi, svar KUN med:
{"relevant": false}

Har den treningsverdi, svar KUN med gyldig JSON på nøyaktig denne formen:
{
  "relevant": true,
  "navn": "kort norsk navn",
  "beskrivelse": "1-3 setninger om hva spilleren gjør og hvorfor",
  "pyramidArea": "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN",
  "skillArea": "TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING" | "SPILL" | null,
  "durationMin": heltall minutter,
  "minKategori": "A".."L" | null,
  "maxKategori": "A".."L" | null,
  "begrunnelse": "1 setning: hvorfor treningsrelevant og hvem den passer for"
}

CANON-fasit (AK Golf sitt ferdighetsrammeverk, A=nybegynner..K=elite) — bruk
denne til å sette et realistisk minKategori/maxKategori-spenn:
${canonSammendrag()}

Norsk bokmål. Ingen emoji. Ingen tekst utenfor JSON-objektet.
`.trim();

const ForslagSchema = z.discriminatedUnion("relevant", [
  z.object({ relevant: z.literal(false) }),
  z.object({
    relevant: z.literal(true),
    navn: z.string().trim().min(1).max(120),
    beskrivelse: z.string().trim().min(1),
    pyramidArea: z.nativeEnum(PyramidArea),
    skillArea: z.nativeEnum(SkillArea).nullable(),
    durationMin: z.number().int().positive().max(180),
    minKategori: z.nativeEnum(NgfKategori).nullable(),
    maxKategori: z.nativeEnum(NgfKategori).nullable(),
    begrunnelse: z.string().trim().min(1),
  }),
]);
type Forslag = z.infer<typeof ForslagSchema>;

function parseForslag(tekst: string): Forslag | null {
  const start = tekst.indexOf("{");
  const slutt = tekst.lastIndexOf("}");
  if (start === -1 || slutt === -1 || slutt <= start) return null;
  let raa: unknown;
  try {
    raa = JSON.parse(tekst.slice(start, slutt + 1));
  } catch {
    return null;
  }
  const parsed = ForslagSchema.safeParse(raa);
  return parsed.success ? parsed.data : null;
}

export async function runFabrikk(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    if (!isAiEnabled() || !anthropic) {
      return { output: { status: "ai-av", melding: "Anthropic-nøkkel er ikke satt." } };
    }

    const funn = await prisma.radarFunn.findMany({
      where: { behandlet: false },
      orderBy: { funnetAt: "asc" },
      take: BATCH_STORRELSE,
    });

    if (funn.length === 0) {
      return { output: { status: "ingen-nye-funn", melding: "Ingen ubehandlede radar-funn." } };
    }

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", deletedAt: null },
      select: { id: true },
    });

    let forslagLagret = 0;
    let irrelevante = 0;
    let feilet = 0;

    for (const f of funn) {
      try {
        const res = await anthropic.messages.create({
          model: modelFor(AGENT_NAME),
          max_tokens: AI_MAX_TOKENS,
          system: SYSTEM,
          messages: [
            {
              role: "user",
              content: `Tittel: ${f.tittel}\nKilde: ${f.kildeNavn} (${f.kilde})\nSammendrag: ${f.sammendrag ?? "(ingen)"}\nLenke: ${f.url}`,
            },
          ],
        });
        const tekst = res.content
          .filter((b) => b.type === "text")
          .map((b) => (b.type === "text" ? b.text : ""))
          .join("\n")
          .trim();
        const parsed = parseForslag(tekst);
        if (!parsed) {
          feilet++;
          continue;
        }
        if (!parsed.relevant) {
          irrelevante++;
          continue;
        }

        for (const admin of admins) {
          await prisma.caddieDraft.create({
            data: {
              userId: admin.id,
              conversationId: "fabrikk-agent",
              toolCallId: `fabrikk_${f.id}_${admin.id.slice(-6)}`,
              toolName: DRILL_DRAFT_TOOL,
              toolInput: {
                name: parsed.navn,
                description: parsed.beskrivelse,
                pyramidArea: parsed.pyramidArea,
                skillArea: parsed.skillArea,
                durationMin: parsed.durationMin,
                minKategori: parsed.minKategori,
                maxKategori: parsed.maxKategori,
                videoUrl: f.kilde === "youtube" ? f.url : null,
                kildeUrl: f.url,
                kildeNavn: f.kildeNavn,
                begrunnelse: parsed.begrunnelse,
                radarFunnId: f.id,
              },
              previewText: `${parsed.navn} — inspirert av «${f.tittel}» (${f.kildeNavn})`,
              status: "PENDING",
            },
          });
        }
        forslagLagret++;
      } catch (err) {
        console.error("fabrikk-agent: generering feilet for", f.id, err);
        feilet++;
      }
    }

    await prisma.radarFunn.updateMany({
      where: { id: { in: funn.map((f) => f.id) } },
      data: { behandlet: true },
    });

    return {
      output: {
        status: "ok",
        funnVurdert: funn.length,
        forslagLagret,
        irrelevante,
        feilet,
        coacher: admins.length,
      },
    };
  });
}
