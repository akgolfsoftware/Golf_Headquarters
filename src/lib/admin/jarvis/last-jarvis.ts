/**
 * Jarvis (AG-19) — lastere for kjøringslista i Kø og for Caddie-samtalen.
 *
 * Bare lesing, bortsett fra `hentEllerOpprettSamtale`, som gjenbruker
 * `getOrCreateActiveConversation` (finnes fra før; oppretter én rad i
 * eksisterende tabell `caddie_conversations` første gang, ingen skjemaendring).
 * Tidspunkt formateres alltid i Europe/Oslo (gotchas.md §Tid og datoer).
 */

import { prisma } from "@/lib/prisma";
import { AGENT_INFO, kanoniskSlug } from "@/lib/agencyos/agent-registry";
import { getOrCreateActiveConversation } from "@/lib/caddie/conversation";
import { lagSnippet } from "./kjoring-snippet";

export type JarvisKjoring = {
  id: string;
  agentSlug: string;
  navn: string;
  /** «29.09 06:00», Oslo-tid. */
  naar: string;
  varighet: string;
  ok: boolean;
  /** Kort utdrag av det kjøringen leverte, eller feilmeldingen. Null = ingen tekst lagret. */
  utdrag: string | null;
  href: string;
};

export type JarvisSamtaleMelding = {
  id: string;
  rolle: "coach" | "caddie";
  tid: string;
  tekst: string;
};

export type JarvisSamtaleData = {
  conversationId: string;
  historikk: JarvisSamtaleMelding[];
  /** Utkast Caddie har laget som venter på ditt svar. */
  utkastVenter: number;
};

const OSLO_KORT = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

export function formaterKjoringTid(d: Date): string {
  return OSLO_KORT.format(d).replace(",", "");
}

export function formaterVarighet(ms: number): string {
  return `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
}

/** De 15 siste agentkjøringene (alle agenter), nyeste først. */
export async function lastJarvisKjoringer(): Promise<JarvisKjoring[]> {
  const rader = await prisma.agentRun.findMany({ orderBy: { createdAt: "desc" }, take: 15 });
  return rader.map((r) => {
    const slug = kanoniskSlug(r.agentName);
    const ok = r.status !== "ERROR";
    const utdrag = ok ? lagSnippet((r.output as Record<string, unknown> | null) ?? null) : r.error;
    return {
      id: r.id,
      agentSlug: slug,
      navn: AGENT_INFO[slug]?.navn ?? r.agentName,
      naar: formaterKjoringTid(r.createdAt),
      varighet: formaterVarighet(r.duration),
      ok,
      utdrag,
      href: `/admin/agents/${slug}`,
    };
  });
}

/**
 * Samtalen for en administrator: nyeste åpne samtale (eller en fersk), de 40
 * siste meldingene og antall ubehandlede utkast. Kalles bare for ADMIN —
 * `/api/caddie/*` avviser alle andre.
 */
export async function hentEllerOpprettSamtale(userId: string): Promise<JarvisSamtaleData> {
  const samtale = await getOrCreateActiveConversation(userId);
  const [meldinger, utkastVenter] = await Promise.all([
    prisma.caddieMessage.findMany({
      where: { userId, conversationId: samtale.id, role: { in: ["user", "assistant"] } },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { id: true, role: true, content: true, createdAt: true },
    }),
    prisma.caddieDraft.count({ where: { userId, conversationId: samtale.id, status: "PENDING" } }),
  ]);
  const historikk: JarvisSamtaleMelding[] = meldinger
    .filter((m) => m.content.trim().length > 0)
    .reverse()
    .map((m) => ({
      id: m.id,
      rolle: m.role === "user" ? "coach" : "caddie",
      tid: formaterKjoringTid(m.createdAt),
      tekst: m.content,
    }));
  return { conversationId: samtale.id, historikk, utkastVenter };
}
