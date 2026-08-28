/**
 * Server-lastere for AgenticOS-flatene (T12 visuell).
 * Ærlige tomrom — ingen oppdiktede kjørende runs eller runtime-helse.
 */

import { prisma } from "@/lib/prisma";
import { planActionKoWhere } from "@/lib/admin/ko-telling";
import {
  buildDiffPreview,
  planActionSuggestionSchema,
} from "@/lib/admin/plan-action-diff";
import { handlingstypeLabel } from "@/lib/labels/handlingstyper";
import { AGENT_INFO, MANUELLE_AGENTER, kanoniskSlug } from "@/lib/agencyos/agent-registry";
import {
  agenticosKlokke,
  agenticosNaTekst,
  areaForAgent,
  areaLabel,
  godkjennMerkeFor,
  GODKJENN_MERKE_LABEL,
  selskapTilArea,
  type AgenticosAreaId,
  type GodkjennMerke,
} from "@/lib/agencyos/agenticos-ia";

export type AgenticosNeste =
  | {
      kind: "godkjenn";
      id: string;
      tittel: string;
      meta: string;
      beskrivelse: string;
    }
  | {
      kind: "klar";
      slug: string;
      tittel: string;
      meta: string;
      beskrivelse: string;
      kanKjore: boolean;
    };

export type AgenticosFeilAgent = {
  navn: string;
  slug: string;
  detaljHref: string;
};

export type AgenticosCockpitData = {
  naTekst: string;
  neste: AgenticosNeste | null;
  venterPaDeg: number;
  klarCount: number;
  pagarCount: number;
  researchCount: number;
  godkjentIDag: number;
  feilende: AgenticosFeilAgent[];
  runtimeLinje: string;
};

export type AgenticosKoRad = {
  id: string;
  tittel: string;
  meta: string;
  filterTekst: string;
  href: string;
  kjorSlug: string | null;
  prikk: boolean;
  merke: string | null;
  merkeWarn: boolean;
  lenkeLabel: string;
};

export type AgenticosKoData = {
  klar: AgenticosKoRad[];
  pagar: AgenticosKoRad[];
  venter: AgenticosKoRad[];
  researchCount: number;
  kanKjore: boolean;
};

export type AgenticosGodkjennRad = {
  id: string;
  tittel: string;
  meta: string;
  beskrivelse: string;
  diff: string | null;
  merke: GodkjennMerke;
  merkeLabel: string;
  naar: string;
  agentNavn: string;
};

export type AgenticosGodkjennData = {
  rader: AgenticosGodkjennRad[];
  godkjentIDag: number;
};

export type AgenticosProjectRad = {
  id: string;
  tittel: string;
  meta: string;
  href: string;
  area: AgenticosAreaId;
};

export type AgenticosProjectsData = {
  grupper: { area: AgenticosAreaId; label: string; rader: AgenticosProjectRad[] }[];
  tomme: string;
};

type Viewer = { id: string; role: string };

function startOfLocalDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function tittelFraSuggestion(actionType: string, suggestion: unknown, fallbackNavn: string): {
  tittel: string;
  detalj: string;
} {
  const parsed = planActionSuggestionSchema.safeParse(suggestion);
  const data = parsed.success ? parsed.data : null;
  const tittel =
    data && (data.title ?? data.tittel)
      ? String(data.title ?? data.tittel)
      : `${handlingstypeLabel(actionType)} · ${fallbackNavn}`;
  const detalj =
    data && (data.forklaring ?? data.detail)
      ? String(data.forklaring ?? data.detail)
      : "Skriver ingenting før du godkjenner resultatet.";
  return { tittel, detalj };
}

export async function lastAgenticosCockpit(user: Viewer): Promise<AgenticosCockpitData> {
  const idag = startOfLocalDay();
  const sju = new Date(idag);
  sju.setDate(sju.getDate() - 7);
  const ettDogn = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [pending, pendingCount, godkjentIDag, signaler7d, sisteFeil, kjoringerIdag] = await Promise.all([
    prisma.planAction.findMany({
      where: planActionKoWhere(user),
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
    prisma.planAction.count({ where: planActionKoWhere(user) }),
    prisma.planAction.count({
      where: { status: "ACCEPTED", decidedAt: { gte: idag }, decidedById: user.id },
    }),
    prisma.signal.count({ where: { computedAt: { gte: sju } } }),
    prisma.agentRun.findMany({
      where: { status: "ERROR", createdAt: { gte: ettDogn } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.agentRun.count({ where: { createdAt: { gte: idag } } }),
  ]);

  const forste = pending[0];
  let neste: AgenticosNeste | null = null;
  if (forste) {
    const slug = kanoniskSlug(forste.agentName);
    const { tittel, detalj } = tittelFraSuggestion(forste.actionType, forste.suggestion, forste.user.name ?? "spiller");
    neste = {
      kind: "godkjenn",
      id: forste.id,
      tittel,
      meta: `${areaLabel(areaForAgent(slug))} · ${AGENT_INFO[slug]?.navn ?? forste.agentName}`,
      beskrivelse: detalj,
    };
  } else if (MANUELLE_AGENTER[0]) {
    const slug = MANUELLE_AGENTER[0];
    const info = AGENT_INFO[slug];
    neste = {
      kind: "klar",
      slug,
      tittel: info?.navn ?? slug,
      meta: `${areaLabel(areaForAgent(slug))} · Claude`,
      beskrivelse: info?.beskrivelse ?? "Kjører når du sier ja. Skriver ingenting uten godkjenning.",
      kanKjore: user.role === "ADMIN",
    };
  }

  const sett = new Set<string>();
  const feilende: AgenticosFeilAgent[] = [];
  for (const r of sisteFeil) {
    const slug = kanoniskSlug(r.agentName);
    if (sett.has(slug)) continue;
    sett.add(slug);
    feilende.push({
      navn: AGENT_INFO[slug]?.navn ?? r.agentName,
      slug,
      detaljHref: `/admin/agents/${slug}`,
    });
  }

  return {
    naTekst: agenticosNaTekst(),
    neste,
    venterPaDeg: pendingCount,
    klarCount: MANUELLE_AGENTER.length,
    pagarCount: 0,
    researchCount: signaler7d,
    godkjentIDag,
    feilende,
    runtimeLinje: kjoringerIdag === 0 ? "Ingen kjøringer i dag" : `${kjoringerIdag} kjøringer i dag`,
  };
}

export async function lastAgenticosKo(user: Viewer): Promise<AgenticosKoData> {
  const pending = await prisma.planAction.findMany({
    where: planActionKoWhere(user),
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const idag = startOfLocalDay();
  const sju = new Date(idag);
  sju.setDate(sju.getDate() - 7);
  const researchCount = await prisma.signal.count({ where: { computedAt: { gte: sju } } });

  const klar: AgenticosKoRad[] = MANUELLE_AGENTER.map((slug) => {
    const info = AGENT_INFO[slug];
    const area = areaLabel(areaForAgent(slug));
    return {
      id: slug,
      tittel: info?.navn ?? slug,
      meta: `${area} · Claude`,
      filterTekst: area,
      href: `/admin/agents/${slug}`,
      kjorSlug: user.role === "ADMIN" ? slug : null,
      prikk: false,
      merke: null,
      merkeWarn: false,
      lenkeLabel: "Åpne",
    };
  });

  const venter: AgenticosKoRad[] = pending.map((a) => {
    const slug = kanoniskSlug(a.agentName);
    const merke = godkjennMerkeFor(a.actionType);
    const { tittel } = tittelFraSuggestion(a.actionType, a.suggestion, a.user.name ?? "spiller");
    const area = areaLabel(areaForAgent(slug));
    return {
      id: a.id,
      tittel,
      meta: GODKJENN_MERKE_LABEL[merke],
      filterTekst: area,
      href: `/admin/agenticos/godkjenn?sak=${a.id}`,
      kjorSlug: null,
      prikk: false,
      merke: GODKJENN_MERKE_LABEL[merke],
      merkeWarn: merke === "plan" || merke === "kunnskap" || merke === "task",
      lenkeLabel: merke === "plan" ? "Se resultat" : merke === "utkast" ? "Se forslag" : "Se resultat",
    };
  });

  return {
    klar,
    pagar: [],
    venter,
    researchCount,
    kanKjore: user.role === "ADMIN",
  };
}

export async function lastAgenticosGodkjenn(user: Viewer): Promise<AgenticosGodkjennData> {
  const idag = startOfLocalDay();
  const [pending, godkjentIDag] = await Promise.all([
    prisma.planAction.findMany({
      where: planActionKoWhere(user),
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.planAction.count({
      where: { status: "ACCEPTED", decidedAt: { gte: idag }, decidedById: user.id },
    }),
  ]);

  const rader: AgenticosGodkjennRad[] = [];
  for (const a of pending) {
    const slug = kanoniskSlug(a.agentName);
    const merke = godkjennMerkeFor(a.actionType);
    const { tittel, detalj } = tittelFraSuggestion(a.actionType, a.suggestion, a.user.name ?? "spiller");
    const diff = await buildDiffPreview(a.actionType, a.suggestion, a.userId, a.planId);
    rader.push({
      id: a.id,
      tittel,
      meta: `${areaLabel(areaForAgent(slug))} · ${AGENT_INFO[slug]?.navn ?? a.agentName}`,
      beskrivelse: detalj,
      diff,
      merke,
      merkeLabel: GODKJENN_MERKE_LABEL[merke],
      naar: `ferdig ${agenticosKlokke(a.createdAt)}`,
      agentNavn: AGENT_INFO[slug]?.navn ?? a.agentName,
    });
  }

  return { rader, godkjentIDag };
}

export async function lastAgenticosProjects(): Promise<AgenticosProjectsData> {
  const raderDb = await prisma.prosjektCache.findMany({
    orderBy: { notionLastEdited: "desc" },
    take: 40,
  });

  const rader: AgenticosProjectRad[] = raderDb.map((p) => {
    const selskap = p.selskap[0] ?? "";
    const area = selskapTilArea(selskap);
    const open = p.oppgaverOpen;
    const doing = p.oppgaverDoing;
    return {
      id: p.id,
      tittel: p.navn,
      meta:
        doing > 0
          ? `${open + doing + p.oppgaverDone} tasks · ${doing} kjører`
          : `${open + doing + p.oppgaverDone} tasks`,
      href: "/admin/workspace",
      area,
    };
  });

  const grupper = (["AKADEMI", "PRODUKT", "AGENTICOS", "OKONOMI", "INNHOLD", "PERSONLIG", "DRIFT"] as AgenticosAreaId[])
    .map((area) => ({
      area,
      label: areaLabel(area),
      rader: rader.filter((r) => r.area === area),
    }))
    .filter((g) => g.rader.length > 0);

  const tommeNavn = (["PERSONLIG", "DRIFT"] as AgenticosAreaId[])
    .filter((a) => !grupper.some((g) => g.area === a))
    .map((a) => areaLabel(a));

  return {
    grupper,
    tomme: tommeNavn.length > 0 ? `${tommeNavn.join(" · ")} — ingen aktive prosjekter` : "",
  };
}

export async function lastAgenticosGodkjennCount(user: Viewer): Promise<number> {
  return prisma.planAction.count({ where: planActionKoWhere(user) });
}

export async function lastAgenticosRuntimeLinje(): Promise<string> {
  const n = await lastAgenticosKjoringerIdag();
  return n === 0 ? "Ingen kjøringer i dag" : `${n} kjøringer i dag`;
}

export async function lastAgenticosKjoringerIdag(): Promise<number> {
  const idag = startOfLocalDay();
  return prisma.agentRun.count({ where: { createdAt: { gte: idag } } });
}
