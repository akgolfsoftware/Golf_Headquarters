/**
 * Oppgaver — datalasting per fane (MASTERPLAN 15.2).
 *
 * Prosjekter og «Tildelt meg» er flyttet ORDRETT ut av sidene de kom fra
 * (`/admin/workspace/prosjekter` og `/admin/handlingssenter`) — samme kilder,
 * samme mapping, samme sortering. Rutiner er ny (beslutning 6.6).
 *
 * Kun den aktive fanen lastes. Tellingene er egne, billige count-spørringer.
 */

import { prisma } from "@/lib/prisma";
import { SAMPLE_PEOPLE } from "@/components/workspace/sample-data";
import { getProjectsForUser } from "@/lib/notion/queries";
import type { WorkspaceProsjektKort } from "@/components/admin/v2/workspace/AdminWorkspaceProsjekterTrainLock";
import type {
  AdminHandlingssenterData,
  HandlingRad,
  HandlingKol,
  HandlingPri,
} from "@/components/admin/v2/AdminHandlingssenterV2";
import type { OppgaveFane, OppgaveFaneId } from "./faner";

// ── Prosjekter (fra /admin/workspace/prosjekter, uendret) ──────────────────

export type ProsjektFilter = "alle" | "aktive" | "pause" | "arkiv";

export function erProsjektFilter(s: string | undefined): s is ProsjektFilter {
  return s !== undefined && ["alle", "aktive", "pause", "arkiv"].includes(s);
}

export async function lastProsjekter(): Promise<WorkspaceProsjektKort[]> {
  const projects = await getProjectsForUser();
  return projects.map((p) => ({
    id: p.id,
    tittel: p.title,
    beskrivelse: p.desc,
    selskap: p.company,
    synlighet: p.vis,
    status: p.status,
    open: p.open,
    doing: p.doing,
    done: p.done,
    total: p.total,
    pct: p.pct,
    due: p.due,
    tildeltNavn: p.assigned.map((k) => SAMPLE_PEOPLE[k]?.name ?? k),
  }));
}

// ── Tildelt meg (fra /admin/handlingssenter, uendret) ──────────────────────

const KOLONNE_MAP: Record<string, HandlingKol> = {
  "Å gjøre": "todo", Todo: "todo", TODO: "todo",
  Pågår: "doing", "In progress": "doing", DOING: "doing",
  Ferdig: "done", Done: "done", DONE: "done",
  Kø: "backlog", Backlog: "backlog", BACKLOG: "backlog",
  Blokkert: "backlog", BLOKKERT: "backlog",
};

const PRIORITET_MAP: Record<string, HandlingPri> = {
  Haster: "high", Høy: "high", High: "high", HIGH: "high",
  Normal: "mid", Medium: "mid", MID: "mid",
  Lav: "low", Low: "low", LOW: "low",
};

const kolOf = (s: string | null): HandlingKol => (s ? (KOLONNE_MAP[s] ?? "todo") : "todo");
const priOf = (p: string | null): HandlingPri => (p ? (PRIORITET_MAP[p] ?? "mid") : "mid");
const priLabel = (k: HandlingPri) => (k === "high" ? "Haster" : k === "mid" ? "Normal" : "Lav");
const statusLabel = (c: HandlingKol) =>
  ({ todo: "Å gjøre", doing: "Pågår", done: "Ferdig", backlog: "Kø" })[c] ?? "Kø";

const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
function fmtDue(d: Date | null): string {
  if (!d) return "—";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (t.getTime() === today.getTime()) return "i dag";
  if (t.getTime() === tomorrow.getTime()) return "i morgen";
  return `${d.getDate()}. ${MND[d.getMonth()]}`;
}

export async function lastTildeltMeg(): Promise<AdminHandlingssenterData> {
  const raw = await prisma.oppgaveCache
    .findMany({ orderBy: [{ forfaller: "asc" }, { notionLastEdited: "desc" }], take: 200 })
    .catch(() => []);

  const oppgaver: HandlingRad[] = raw.map((o) => {
    const col = kolOf(o.status);
    const priKey = priOf(o.prioritet);
    const tildelt = o.tildeltNavn[0] ?? null;
    const selskapRå = o.selskap[0] ?? null;
    const tag = selskapRå?.split(/[\s\-/]+/).slice(-1)[0]?.toUpperCase().slice(0, 4) ?? "PLAN";
    return {
      id: o.id,
      tittel: o.tittel,
      spiller: tildelt ?? "Alle",
      priKey,
      priLabel: priLabel(priKey),
      tag,
      due: fmtDue(o.forfaller),
      statusLabel: statusLabel(col),
      col,
      desc: o.notater ?? o.lenke ?? "Ingen beskrivelse.",
    };
  });

  const t = new Date();
  const mnd = ["januar", "februar", "mars", "april", "mai", "juni", "juli",
    "august", "september", "oktober", "november", "desember"][t.getMonth()];
  return { dato: `${t.getDate()}. ${mnd}`, oppgaver };
}

// ── Rutiner (ny — beslutning 6.6) ──────────────────────────────────────────

export type RutineRad = {
  id: string;
  tittel: string;
  detalj: string | null;
  frekvens: string;
  naar: string | null;
  automatiserbar: boolean;
  sistUtfort: Date | null;
};

export async function lastRutiner(userId: string): Promise<RutineRad[]> {
  return prisma.driftRutine
    .findMany({
      where: { userId, aktiv: true },
      orderBy: [{ frekvens: "asc" }, { tittel: "asc" }],
      select: {
        id: true, tittel: true, detalj: true, frekvens: true,
        naar: true, automatiserbar: true, sistUtfort: true,
      },
    })
    .catch(() => []);
}

// ── Tellinger til fanepillene ──────────────────────────────────────────────

export async function oppgaveFaneTellinger(
  userId: string,
  synlige: OppgaveFane[],
): Promise<Partial<Record<OppgaveFaneId, number>>> {
  const vis = new Set(synlige.map((f) => f.id));
  const ut: Partial<Record<OppgaveFaneId, number>> = {};

  await Promise.all([
    vis.has("prosjekter")
      ? getProjectsForUser()
          .then((p) => { ut.prosjekter = p.length; })
          .catch(() => {})
      : null,
    vis.has("rutiner")
      ? prisma.driftRutine
          .count({ where: { userId, aktiv: true } })
          .then((n) => { ut.rutiner = n; })
          .catch(() => {})
      : null,
    vis.has("tildelt")
      ? prisma.oppgaveCache
          .count()
          .then((n) => { ut.tildelt = n; })
          .catch(() => {})
      : null,
  ]);

  return ut;
}
