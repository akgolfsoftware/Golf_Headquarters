// Workspace-queries — henter tasks fra OppgaveCache og mapper til
// SampleTask-format som workspace-UI bruker. Faller tilbake til
// SAMPLE_TASKS når ingen NotionConnection finnes (utvikling/onboarding).

import { prisma } from "@/lib/prisma";
import {
  SAMPLE_TASKS,
  type SampleTask,
} from "@/components/workspace/sample-data";
import type {
  CompanyKind,
  PrioKind,
  StatusKind,
  VisibilityKind,
} from "@/components/workspace/primitives";

// ---------- Tildelt-matching ----------

/**
 * Genererer mulige navne-varianter for tekst-match mot Notion `tildeltNavn`.
 * Eksempel: "Markus Røinås Pedersen" →
 *   ["Markus Røinås Pedersen", "Markus Pedersen", "Markus R. Pedersen"]
 */
export function getNameVariants(name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed) return [];
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return [trimmed];
  const first = parts[0];
  const last = parts[parts.length - 1];
  const middles = parts.slice(1, -1);
  const out = new Set<string>([trimmed, `${first} ${last}`]);
  if (middles.length > 0) {
    const initials = middles.map((m) => `${m[0]?.toUpperCase()}.`).join(" ");
    out.add(`${first} ${initials} ${last}`);
  }
  return Array.from(out);
}

// ---------- Henter tasks ----------

type CachedTaskRow = Awaited<
  ReturnType<typeof prisma.oppgaveCache.findMany>
>[number];

export async function getTasksForUser(userId: string): Promise<SampleTask[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });
  if (!user) return [];

  // Sjekk om ADMIN har koblet til Notion
  const adminConnection = await prisma.notionConnection.findFirst({
    where: { user: { role: "ADMIN" } },
    select: { id: true },
  });

  if (!adminConnection) {
    // Ingen Notion-tilkobling — bruk sample-data som fallback
    return SAMPLE_TASKS;
  }

  let cached: CachedTaskRow[];

  if (user.role === "ADMIN") {
    cached = await prisma.oppgaveCache.findMany({
      where: { databaseLink: { connectionId: adminConnection.id } },
      orderBy: { notionLastEdited: "desc" },
      take: 200,
    });
  } else {
    // Server-side tekst-filtrering på tildeltNavn
    const variants = getNameVariants(user.name);
    if (variants.length === 0) return [];
    cached = await prisma.oppgaveCache.findMany({
      where: {
        databaseLink: { connectionId: adminConnection.id },
        tildeltNavn: { hasSome: variants },
      },
      orderBy: { notionLastEdited: "desc" },
      take: 200,
    });
  }

  return cached.map(mapCachedToSample);
}

// ---------- Mapping ----------

function mapCachedToSample(c: CachedTaskRow, idx: number = 0): SampleTask {
  const status = mapStatus(c.status);
  const prio = mapPrio(c.prioritet);
  const company = mapCompany(c.selskap);
  const vis = mapVisibility(c.selskap);
  return {
    id: hashId(c.id) || idx + 1,
    title: c.tittel,
    project: { company, name: c.selskap[0] ?? undefined },
    prio,
    due: formatDue(c.forfaller),
    today: isToday(c.forfaller),
    vis,
    source: "N",
    brenner: prio === "BRENNER",
    done: status === "DONE",
    status,
    assigned: c.tildeltNavn.map(toInitials),
    est: "—",
  };
}

function mapStatus(status: string | null): StatusKind {
  const s = (status ?? "").toUpperCase();
  if (s.includes("FERDIG") || s === "DONE") return "DONE";
  if (s.includes("PÅGÅR") || s.includes("PAGAR") || s === "DOING" || s === "IN_PROGRESS")
    return "DOING";
  if (s.includes("VENTER") || s === "BLOKKERT" || s === "BLOCKED") return "BLOKKERT";
  return "TODO";
}

function mapPrio(prio: string | null): PrioKind {
  const p = (prio ?? "").toUpperCase();
  if (p.includes("P1") || p.includes("BRENNER") || p.includes("HØY") || p.includes("HOY"))
    return p.includes("BRENNER") ? "BRENNER" : "HOY";
  if (p.includes("P2") || p.includes("MED")) return "MED";
  if (p.includes("P3") || p.includes("LAV")) return "LAV";
  return "MED";
}

function mapCompany(selskap: string[]): CompanyKind {
  const first = (selskap[0] ?? "").toUpperCase();
  if (first.includes("MULLIGAN")) return "MULLIGAN";
  if (first.includes("WANG")) return "WANG";
  if (first.includes("SKARP")) return "SKARP";
  if (first.includes("PRIVAT")) return "PRIVAT";
  return "AK";
}

function mapVisibility(selskap: string[]): VisibilityKind {
  const upper = selskap.map((s) => s.toUpperCase());
  if (upper.some((s) => s.includes("PRIVAT"))) return "PRIVAT";
  if (upper.some((s) => s.includes("JUNIOR"))) return "JUNIOR";
  if (upper.some((s) => s.includes("MULLIGAN") || s.includes("WANG") || s.includes("SKARP")))
    return "SELSKAP";
  return "AK";
}

function formatDue(date: Date | null): string {
  if (!date) return "—";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "I dag";
  if (diffDays === 1) return "I morgen";
  if (diffDays === -1) return "I går";
  const dayNames = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
  const dd = String(target.getDate()).padStart(2, "0");
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  if (diffDays > 0 && diffDays < 7) {
    return `${dayNames[target.getDay()]} ${dd}.${mm}`;
  }
  return `${dd}.${mm}`;
}

function isToday(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function hashId(cuid: string): number {
  let hash = 0;
  for (let i = 0; i < cuid.length; i++) {
    hash = (hash * 31 + cuid.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
