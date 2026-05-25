/**
 * Server-helper: getCaddieInsights
 *
 * Genererer 3 AI-aktige innsikter for Player Workbench, basert på
 * spillerens siste 7 dager med trening + runder + aktive mål.
 *
 * Foreløpig: data-drevne hardkodede regler (deterministiske observasjoner).
 * TODO: Når Caddie-agenten (`src/lib/ai/agents/caddie.ts`) eksponerer en
 * `analyzeWorkbench(userId)`-funksjon, bytt ut regelmotoren med ekte
 * LLM-kall. Foundation er klar, men full chat-loop er for tungt for et
 * dashboard som lastes på hver besøk.
 *
 * Returnerer alltid eksakt 3 insights (HANDLING, OBSERVASJON, MAAL).
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import {
  vurderPyramide,
  type PyramidFordeling,
  type PyramidKategori,
  type PyramidOkt,
} from "@/lib/domain/pyramid-weighting";
import type { AiInsight } from "@/components/portal/workbench/ai-insights-row";

// Default ideell pyramide (samme som i week-progress).
const DEFAULT_IDEAL: PyramidFordeling = {
  fys: 0.30,
  tek: 0.30,
  slag: 0.25,
  spill: 0.10,
  turn: 0.05,
};

const NAVN_KORT: Record<PyramidKategori, string> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};

const NAVN_LANG: Record<PyramidKategori, string> = {
  FYS: "fysisk trening",
  TEK: "teknisk trening",
  SLAG: "slagøvelser",
  SPILL: "spilltrening",
  TURN: "turneringsspill",
};

// ---------- Hjelpere ----------

function startenAvUken(): Date {
  const dato = new Date();
  dato.setDate(dato.getDate() - 6);
  dato.setHours(0, 0, 0, 0);
  return dato;
}

/**
 * Finner kategorien med størst negativt avvik (mest under-trent).
 */
function finnUndertrent(
  avvik: PyramidFordeling,
): { kategori: PyramidKategori; prosentpoeng: number } | null {
  const liste: Array<{ kategori: PyramidKategori; verdi: number }> = [
    { kategori: "FYS", verdi: avvik.fys },
    { kategori: "TEK", verdi: avvik.tek },
    { kategori: "SLAG", verdi: avvik.slag },
    { kategori: "SPILL", verdi: avvik.spill },
    { kategori: "TURN", verdi: avvik.turn },
  ];

  // Sorter på mest negativ (under-trent).
  liste.sort((a, b) => a.verdi - b.verdi);

  const verst = liste[0];
  if (verst.verdi >= -0.05) return null; // ingen tydelig under-trening

  return {
    kategori: verst.kategori,
    prosentpoeng: Math.round(Math.abs(verst.verdi) * 100),
  };
}

/**
 * Finner kategorien med størst positivt avvik (mest over-trent).
 */
function finnOvertrent(
  avvik: PyramidFordeling,
): { kategori: PyramidKategori; prosentpoeng: number } | null {
  const liste: Array<{ kategori: PyramidKategori; verdi: number }> = [
    { kategori: "FYS", verdi: avvik.fys },
    { kategori: "TEK", verdi: avvik.tek },
    { kategori: "SLAG", verdi: avvik.slag },
    { kategori: "SPILL", verdi: avvik.spill },
    { kategori: "TURN", verdi: avvik.turn },
  ];

  liste.sort((a, b) => b.verdi - a.verdi);

  const mest = liste[0];
  if (mest.verdi <= 0.05) return null;

  return {
    kategori: mest.kategori,
    prosentpoeng: Math.round(mest.verdi * 100),
  };
}

// ---------- Insight-byggere ----------

function bygHandling(
  okterDenneUken: number,
  vurdering: { faktisk: PyramidFordeling; ideal: PyramidFordeling; avvik: PyramidFordeling },
): AiInsight {
  if (okterDenneUken === 0) {
    return {
      type: "HANDLING",
      eyebrow: "Handling",
      body: "Du har ingen økter registrert siste 7 dager. Plan en kort økt i dag for å holde rytmen.",
      cta: { label: "Plan ny økt", href: "/portal/tren/ny-okt" },
    };
  }

  const undertrent = finnUndertrent(vurdering.avvik);
  const overtrent = finnOvertrent(vurdering.avvik);

  if (overtrent && undertrent) {
    return {
      type: "HANDLING",
      eyebrow: "Handling",
      body: `Du har trent mye ${NAVN_KORT[overtrent.kategori]} (${overtrent.prosentpoeng}pp over) og lite ${NAVN_KORT[undertrent.kategori]}. Foreslår en ${NAVN_LANG[undertrent.kategori]}-økt i morgen.`,
      cta: { label: "Plan økt", href: "/portal/tren/ny-okt" },
    };
  }

  if (undertrent) {
    return {
      type: "HANDLING",
      eyebrow: "Handling",
      body: `${NAVN_LANG[undertrent.kategori]} mangler ${undertrent.prosentpoeng}pp fra målet. Foreslår en ${NAVN_KORT[undertrent.kategori]}-økt i morgen.`,
      cta: { label: "Plan økt", href: "/portal/tren/ny-okt" },
    };
  }

  return {
    type: "HANDLING",
    eyebrow: "Handling",
    body: `${okterDenneUken} økter denne uka — fordelingen følger planen. Hold rytmen og logg dagens drill.`,
    cta: { label: "Logg drill", href: "/portal/tren" },
  };
}

function bygObservasjon(opts: {
  sgPuttSnitt: number | null;
  sgTotalSnitt: number | null;
  antallRunder: number;
}): AiInsight {
  const { sgPuttSnitt, sgTotalSnitt, antallRunder } = opts;

  if (antallRunder === 0) {
    return {
      type: "OBSERVASJON",
      eyebrow: "Observasjon",
      body: "Ingen runder loggført siste 7 dager. Spill en runde og logg SG for å låse opp innsikt om hvor du taper slag.",
      cta: { label: "Logg runde", href: "/portal/golf/ny-runde" },
    };
  }

  // Finn svakeste SG-område hvis vi har data.
  if (sgPuttSnitt !== null && sgPuttSnitt < -0.5) {
    const verdi = sgPuttSnitt.toFixed(1);
    return {
      type: "OBSERVASJON",
      eyebrow: "Observasjon",
      body: `SG Putt ${verdi} siste ${antallRunder} runder — taper slag på greenen. Sett av tid til gate-drill og avstandskontroll.`,
      cta: { label: "Se SG-detalj", href: "/portal/analysere" },
    };
  }

  if (sgTotalSnitt !== null) {
    const verdi = sgTotalSnitt > 0 ? `+${sgTotalSnitt.toFixed(1)}` : sgTotalSnitt.toFixed(1);
    const retning = sgTotalSnitt >= 0 ? "over" : "under";
    return {
      type: "OBSERVASJON",
      eyebrow: "Observasjon",
      body: `SG Total ${verdi} siste ${antallRunder} runder — du ligger ${retning} benchmark. Følg trenden i analyse-tab.`,
      cta: { label: "Se SG-detalj", href: "/portal/analysere" },
    };
  }

  return {
    type: "OBSERVASJON",
    eyebrow: "Observasjon",
    body: `${antallRunder} runder loggført, men ingen SG-data enda. Bruk per-slag-loggen for å låse opp innsikt.`,
    cta: { label: "Logg slag", href: "/portal/golf" },
  };
}

function bygMaal(opts: {
  aktivtMaal: { title: string; targetDate: Date | null } | null;
}): AiInsight {
  const { aktivtMaal } = opts;

  if (!aktivtMaal) {
    return {
      type: "MAAL",
      eyebrow: "Mål",
      body: "Du har ingen aktive mål. Sett et konkret HCP- eller SG-mål for å låse retningen for treningen din.",
      cta: { label: "Sett mål", href: "/portal/meg/mal" },
    };
  }

  if (!aktivtMaal.targetDate) {
    return {
      type: "MAAL",
      eyebrow: "Mål",
      body: `Aktivt mål: ${aktivtMaal.title}. Sett en dato for å gjøre målet konkret.`,
      cta: { label: "Se fremgang", href: "/portal/meg/mal" },
    };
  }

  const dagerIgjen = Math.ceil(
    (aktivtMaal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (dagerIgjen < 0) {
    return {
      type: "MAAL",
      eyebrow: "Mål",
      body: `Målfristen for "${aktivtMaal.title}" har passert. Vurder å oppdatere eller fornye målet.`,
      cta: { label: "Se mål", href: "/portal/meg/mal" },
    };
  }

  return {
    type: "MAAL",
    eyebrow: "Mål",
    body: `${aktivtMaal.title} — ${dagerIgjen} ${dagerIgjen === 1 ? "dag" : "dager"} igjen til frist.`,
    cta: { label: "Se fremgang", href: "/portal/meg/mal" },
  };
}

// ---------- Hovedfunksjon ----------

export async function getCaddieInsights(userId: string): Promise<AiInsight[]> {
  const fra = startenAvUken();
  const til = new Date();

  // Hent økter + drills siste 7 dager.
  const okter = await prisma.trainingSessionV2.findMany({
    where: { studentId: userId, startTime: { gte: fra, lte: til } },
    select: { drills: { select: { pyramide: true } } },
  });

  const pyramidOkter: PyramidOkt[] = okter.flatMap((o) =>
    o.drills.map((d) => ({ pyramid: d.pyramide })),
  );
  const vurdering = vurderPyramide(DEFAULT_IDEAL, pyramidOkter);

  // Hent runder siste 7 dager — beregn SG-snitt hvis vi har data.
  const runder = await prisma.round.findMany({
    where: { userId, playedAt: { gte: fra, lte: til } },
    select: { sgTotal: true, sgPutt: true },
  });

  const sgTotaler = runder
    .map((r) => r.sgTotal)
    .filter((v): v is number => v !== null);
  const sgPutts = runder
    .map((r) => r.sgPutt)
    .filter((v): v is number => v !== null);

  const sgTotalSnitt =
    sgTotaler.length > 0
      ? sgTotaler.reduce((a, b) => a + b, 0) / sgTotaler.length
      : null;
  const sgPuttSnitt =
    sgPutts.length > 0
      ? sgPutts.reduce((a, b) => a + b, 0) / sgPutts.length
      : null;

  // Hent eldste aktive mål med frist (mest presserende).
  const aktivtMaal = await prisma.goal.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: [{ targetDate: "asc" }, { createdAt: "desc" }],
    select: { title: true, targetDate: true },
  });

  return [
    bygHandling(okter.length, vurdering),
    bygObservasjon({
      sgPuttSnitt,
      sgTotalSnitt,
      antallRunder: runder.length,
    }),
    bygMaal({ aktivtMaal }),
  ];
}
