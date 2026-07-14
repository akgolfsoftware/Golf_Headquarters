// Batch AI-plan-generator. Genererer planforslag for N spillere og køer dem
// i AiPlanGeneration-tabellen (synlig i /admin/approvals som plan-forslag).
// POST { playerIds: string[], prompt?: string }
// Maks 20 spillere per kall — større batch → kjør flere kall.

import { NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { genererPlan } from "@/lib/ai-plan/generate";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAKS_BATCH = 20;

type Body = {
  playerIds?: string[];
  prompt?: string;
};

export async function POST(req: Request) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON." }, { status: 400 });
  }

  const playerIds = (body.playerIds ?? []).filter((id) => typeof id === "string" && id.length > 0);
  if (playerIds.length === 0) {
    return NextResponse.json({ error: "playerIds mangler eller tom." }, { status: 400 });
  }
  if (playerIds.length > MAKS_BATCH) {
    return NextResponse.json(
      { error: `Maks ${MAKS_BATCH} spillere per batch-kall. Send flere kall for større lister.` },
      { status: 400 },
    );
  }

  const brukerPrompt =
    body.prompt?.trim() ||
    "Lag en 4-ukers treningsplan tilpasset spillerens nivå og tilgjengelige fasiliteter.";

  // Tilgangssjekk per spiller — coachen kan ha tilgang til noen, ikke alle,
  // i en gammel/feil-limt liste. Uautoriserte rapporteres som feil, resten kjøres.
  const tilgangsResultat = await Promise.all(
    playerIds.map(async (playerId) => ({
      playerId,
      harTilgang: await harCoachTilgangTilSpiller(coach, playerId),
    })),
  );
  const autoriserte = tilgangsResultat.filter((t) => t.harTilgang).map((t) => t.playerId);
  const uautoriserteFeil = tilgangsResultat
    .filter((t) => !t.harTilgang)
    .map((t) => ({ playerId: t.playerId, error: "Du har ikke tilgang til denne spilleren." }));

  // Generer for autoriserte spillere — kjøres i parallell for å holde total-tid nede.
  // Hver generering tar ~5–15 sek; med 20 spillere: ~15–30 sek totalt.
  const resultater = await Promise.allSettled(
    autoriserte.map((playerId) =>
      genererPlan({ userId: playerId, coachId: coach.id, brukerPrompt }),
    ),
  );

  const ok: { playerId: string; generationId: string; templateId: string | null }[] = [];
  const feil: { playerId: string; error: string }[] = [...uautoriserteFeil];

  for (let i = 0; i < resultater.length; i++) {
    const r = resultater[i];
    const playerId = autoriserte[i];
    if (r.status === "fulfilled") {
      ok.push({
        playerId,
        generationId: r.value.generationId,
        templateId: r.value.templateId,
      });
    } else {
      feil.push({
        playerId,
        error: r.reason instanceof Error ? r.reason.message : "Ukjent feil",
      });
    }
  }

  return NextResponse.json({ ok, feil, total: playerIds.length });
}
