/**
 * /admin/handlingssenter — AgencyOS Handlingssenter
 *
 * Hybrid terminal design: Kanban / Tabell / Liste view-toggle + detail panel.
 * Data fra OppgaveCache (Notion-sync). Statisk layout m/ klient-side
 * interaksjon overlatt til HandlingsenterClient.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { HandlingssenterClient, type OppgaveRad } from "./handlingssenter-client";

export const dynamic = "force-dynamic";

const KOLONNE_MAP: Record<string, OppgaveRad["col"]> = {
  "Å gjøre": "todo",
  Todo: "todo",
  TODO: "todo",
  Pågår: "doing",
  "In progress": "doing",
  DOING: "doing",
  Ferdig: "done",
  Done: "done",
  DONE: "done",
  Kø: "backlog",
  Backlog: "backlog",
  BACKLOG: "backlog",
  Blokkert: "backlog",
  BLOKKERT: "backlog",
};

const PRIORITET_MAP: Record<string, OppgaveRad["priKey"]> = {
  Haster: "high",
  Høy: "high",
  High: "high",
  HIGH: "high",
  Normal: "mid",
  Medium: "mid",
  MID: "mid",
  Lav: "low",
  Low: "low",
  LOW: "low",
};

function kolOf(status: string | null): OppgaveRad["col"] {
  if (!status) return "todo";
  return KOLONNE_MAP[status] ?? "todo";
}

function priOf(prio: string | null): OppgaveRad["priKey"] {
  if (!prio) return "mid";
  return PRIORITET_MAP[prio] ?? "mid";
}

function priLabel(k: OppgaveRad["priKey"]): string {
  return k === "high" ? "Haster" : k === "mid" ? "Normal" : "Lav";
}

function statusLabel(col: OppgaveRad["col"]): string {
  return (
    { todo: "Å gjøre", doing: "Pågår", done: "Ferdig", backlog: "Kø" }[col] ??
    "Kø"
  );
}

function fmtDue(d: Date | null): string {
  if (!d) return "—";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (tDay.getTime() === today.getTime()) return "i dag";
  if (tDay.getTime() === tomorrow.getTime()) return "i morgen";
  return `${d.getDate()}. ${["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"][d.getMonth()]}`;
}

export default async function HandlingssenterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const raw = await prisma.oppgaveCache
    .findMany({
      orderBy: [{ forfaller: "asc" }, { notionLastEdited: "desc" }],
      take: 200,
    })
    .catch(() => []);

  // Map til OppgaveRad — én rad per oppgave.
  const oppgaver: OppgaveRad[] = raw.map((o) => {
    const col = kolOf(o.status);
    const priKey = priOf(o.prioritet);
    const tildelt = o.tildeltNavn[0] ?? null;
    const initials = tildelt
      ? tildelt
          .split(/\s+/)
          .filter(Boolean)
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "AK";

    // Tag avledet fra selskap-array (første selskap) eller «PLAN» som fallback.
    const selskapRå = o.selskap[0] ?? null;
    const tag =
      selskapRå
        ?.split(/[\s\-/]+/)
        .slice(-1)[0]
        ?.toUpperCase()
        .slice(0, 4) ?? "PLAN";

    return {
      id: o.id,
      title: o.tittel,
      player: tildelt ?? "Alle",
      av: initials,
      pri: priLabel(priKey),
      priKey,
      tag,
      due: fmtDue(o.forfaller),
      status: statusLabel(col),
      col,
      desc: o.notater ?? o.lenke ?? "Ingen beskrivelse.",
    };
  });

  const openCount = oppgaver.filter((o) => o.col !== "done").length;
  const doneToday = oppgaver.filter((o) => o.col === "done").length;

  // Fallback til demo-data om Notion ikkje er koblet til.
  const data: OppgaveRad[] =
    oppgaver.length > 0
      ? oppgaver
      : [
          {
            id: "d0",
            title: "Send ukesplan til Øyvind",
            player: "Øyvind Rohjan",
            av: "ØR",
            pri: "Haster",
            priKey: "high",
            tag: "ARG",
            due: "i dag",
            status: "Å gjøre",
            col: "todo",
            desc: "Ukesplan for uke 25 inkl. wedge-stige og banespill.",
          },
          {
            id: "d1",
            title: "Gjennomgå TrackMan — Emma",
            player: "Emma Haugen",
            av: "EH",
            pri: "Høy",
            priKey: "high",
            tag: "OTT",
            due: "i dag",
            status: "Å gjøre",
            col: "todo",
            desc: "Session fra 17. juni. Se etter angle of attack og smash factor.",
          },
          {
            id: "d2",
            title: "Skriv coach-notat etter økt",
            player: "Jonas Strand",
            av: "JS",
            pri: "Normal",
            priKey: "mid",
            tag: "PUTT",
            due: "i dag",
            status: "Pågår",
            col: "doing",
            desc: "Fullfør notat fra tirsdagsøkt. Fokus: distance control 50–80 m.",
          },
          {
            id: "d3",
            title: "Book test-uke for stallen",
            player: "Alle",
            av: "AK",
            pri: "Normal",
            priKey: "mid",
            tag: "PLAN",
            due: "20. jun",
            status: "Ferdig",
            col: "done",
            desc: "Koordiner med NGF-anlegg. 8–12 spillere, varighet 2 dager.",
          },
          {
            id: "d4",
            title: "Oppfølging — Mathilde inaktiv",
            player: "Mathilde Ruud",
            av: "MR",
            pri: "Haster",
            priKey: "high",
            tag: "FYS",
            due: "i dag",
            status: "Å gjøre",
            col: "todo",
            desc: "7 dager uten aktivitet. Ring og sjekk status.",
          },
          {
            id: "d5",
            title: "Planlegg Q3-perioden",
            player: "Alle",
            av: "AK",
            pri: "Lav",
            priKey: "low",
            tag: "PLAN",
            due: "25. jun",
            status: "Kø",
            col: "backlog",
            desc: "Årsplan Q3: turneringer, treningsleir og FYS-test.",
          },
          {
            id: "d6",
            title: "Oppdater SG-mål for Øyvind",
            player: "Øyvind Rohjan",
            av: "ØR",
            pri: "Normal",
            priKey: "mid",
            tag: "SG",
            due: "22. jun",
            status: "Kø",
            col: "backlog",
            desc: "Revider SG-mål basert på siste 10 runder. OTT +0,8 → +1,0.",
          },
          {
            id: "d7",
            title: "TrackMan-kalibrering studio",
            player: "Alle",
            av: "AK",
            pri: "Lav",
            priKey: "low",
            tag: "TM",
            due: "24. jun",
            status: "Kø",
            col: "backlog",
            desc: "Bestill tekniker. Siste kalibrering: 3 mnd siden.",
          },
        ];

  return (
    <HandlingssenterClient
      oppgaver={data}
      openCount={openCount || data.filter((o) => o.col !== "done").length}
      doneToday={doneToday || data.filter((o) => o.col === "done").length}
    />
  );
}
