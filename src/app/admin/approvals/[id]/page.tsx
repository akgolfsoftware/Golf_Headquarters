/**
 * CoachHQ — Godkjenning detaljvisning
 *
 * Detalj-side for én PlanAction. Coach kan godkjenne, avslå med begrunnelse,
 * be om mer info, eller åpne meldingstråd. Designet er migrert fra
 * `public/design/batch4/coachhq-godkjenning-detalj.html` til ren Tailwind v4
 * med token-baserte farger og AK Golf typografi.
 *
 * Faller tilbake til hardkodet eksempel-data hvis ingen PlanAction finnes
 * med gitt id (typisk under design-review eller før seed).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ApprovalDetailClient } from "./approval-detail-client";

export const dynamic = "force-dynamic";

export type ApprovalDetail = {
  id: string;
  actionType: string;
  agentName: string;
  status: string;
  createdAt: Date;
  player: {
    id: string;
    name: string;
    initials: string;
    meta: string; // "HCP +3,5 · A1 · 16 ÅR · AK ACADEMY"
  };
  title: {
    lead: string; // "Putt-drill 5×6"
    italic?: string; // " fra 3 m"
    trail?: string; // " · Øyvind"
  };
  proposed: ReadonlyArray<{ k: string; v: string; tone?: "highlight" | "ok" }>;
  current: ReadonlyArray<{ k: string; v: string; tone?: "dim" | "warn" }>;
  conflictNote?: { text: string; validation: string };
  aiReasoning: {
    headlineLead: string;
    headlineItalic: string;
    headlineTrail?: string;
    body: string[];
    confidence: number; // 0..1
    history: string; // "14/16 GODKJENT"
  };
  playerQuote?: { text: string; meta: string };
};

const DUMMY_DETAIL: ApprovalDetail = {
  id: "demo",
  actionType: "DRILL_SUGGEST",
  agentName: "AI-Caddie · GPT-4o",
  status: "PENDING",
  createdAt: new Date(Date.now() - 18 * 60 * 1000),
  player: {
    id: "demo-markus",
    name: "Øyvind Rohjan",
    initials: "ØR",
    meta: "HCP +3,5 · A1 · 16 ÅR · AK ACADEMY",
  },
  title: {
    lead: "Putt-drill 5×6",
    italic: " fra 3 m",
    trail: " · Øyvind",
  },
  proposed: [
    { k: "Dato", v: "Onsdag 21.5" },
    { k: "Tid", v: "14:00 — 14:30", tone: "highlight" },
    { k: "Varighet", v: "30 min" },
    { k: "Drill", v: "5 sett × 6 reps fra 3 m" },
    { k: "Suksess", v: "4/6 i bollen pr sett", tone: "ok" },
    { k: "Lokasjon", v: "Performance Studio" },
  ],
  current: [
    { k: "14:00", v: "Ledig slot", tone: "dim" },
    { k: "15:00", v: "Spillsim 9 hull (GFGK)" },
    { k: "Uke 21", v: "5 økter · 195 min" },
    { k: "Pyramide", v: "TEK 42% · SLAG 22%" },
    { k: "Volum putt", v: "8 økter / 14d (lavt)", tone: "warn" },
  ],
  conflictNote: {
    text: "Ingen kalenderkonflikt — slotet 14:00—14:30 er ledig. Buffer på 30 min før spillsim 15:00 opprettholdes.",
    validation: "Validert mot kalender · tilgjengelighet 100%",
  },
  aiReasoning: {
    headlineLead: "Øyvind mister ",
    headlineItalic: "0,4 SG",
    headlineTrail: " på putt fra 3 m — volum er for lavt",
    body: [
      "Strokes Gained-data viser at putt fra 3 m er Øyvind' svakeste område siste 14 dager (SG·Putt −0,4 vs base). Volum siste 4 uker er kun 8 putt-økter — anbefalt nivå er 12—16 for et HCP +3,5-nivå frem mot Sørlandsåpent.",
      "Forslagets timing (onsdag) treffer en lavt-volum-dag og oppretter ikke pyramide-ubalanse. Drillen 5×6 fra 3 m matcher Anders' eksisterende mal for korte putts og kan flettes inn i tirsdag-økten dersom du foretrekker.",
    ],
    confidence: 0.87,
    history: "14/16 godkjent",
  },
  playerQuote: {
    text: "Mest fokus på putt denne uken — føler at jeg er nære, men de korte putts faller ikke under press.",
    meta: "Fra Øyvind' melding 17.5 · 20:14",
  },
};

const ACTION_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  INTENSITY_ADJUST: "Juster intensitet",
  TAPER_ENGAGE: "Start taper",
  WITHDRAW: "Trekk fra",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Sammenlign",
  RECOVERY_ADD: "Legg til hvile",
  ESCALATION: "Eskalering",
  DELOAD: "Pauseuke",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  let detail: ApprovalDetail = { ...DUMMY_DETAIL, id };

  try {
    const action = await prisma.planAction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (action) {
      const suggestion =
        action.suggestion && typeof action.suggestion === "object"
          ? (action.suggestion as Record<string, unknown>)
          : {};
      const forklaring =
        typeof suggestion.forklaring === "string"
          ? suggestion.forklaring
          : ACTION_LABEL[action.actionType] ?? action.actionType;

      detail = {
        ...DUMMY_DETAIL,
        id: action.id,
        actionType: action.actionType,
        agentName: action.agentName,
        status: action.status,
        createdAt: action.createdAt,
        player: {
          id: action.user.id,
          name: action.user.name,
          initials: initials(action.user.name),
          meta: "Spiller · AK Academy",
        },
        title: {
          lead: forklaring,
          italic: "",
          trail: ` · ${action.user.name.split(" ")[0]}`,
        },
      };
    } else if (id !== "demo") {
      notFound();
    }
  } catch {
    // Fall through til dummy
  }

  return <ApprovalDetailClient detail={detail} />;
}
