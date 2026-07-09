/**
 * v2-preview: AgencyOS Handlingssenter (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/handlingssenter-flaten: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme OppgaveCache-loader/mapping
 * (Notion-sync). Ærlig tom tilstand når cachen er tom — ingen demo-data.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminHandlingssenterV2,
  type AdminHandlingssenterData,
  type HandlingRad,
  type HandlingKol,
  type HandlingPri,
} from "@/components/admin/v2/AdminHandlingssenterV2";

export const dynamic = "force-dynamic";

const KOLONNE_MAP: Record<string, HandlingKol> = {
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

const PRIORITET_MAP: Record<string, HandlingPri> = {
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

function kolOf(status: string | null): HandlingKol {
  if (!status) return "todo";
  return KOLONNE_MAP[status] ?? "todo";
}
function priOf(prio: string | null): HandlingPri {
  if (!prio) return "mid";
  return PRIORITET_MAP[prio] ?? "mid";
}
function priLabel(k: HandlingPri): string {
  return k === "high" ? "Haster" : k === "mid" ? "Normal" : "Lav";
}
function statusLabel(col: HandlingKol): string {
  return { todo: "Å gjøre", doing: "Pågår", done: "Ferdig", backlog: "Kø" }[col] ?? "Kø";
}

const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
function fmtDue(d: Date | null): string {
  if (!d) return "—";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (tDay.getTime() === today.getTime()) return "i dag";
  if (tDay.getTime() === tomorrow.getTime()) return "i morgen";
  return `${d.getDate()}. ${MND[d.getMonth()]}`;
}

export default async function V2HandlingssenterPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const raw = await prisma.oppgaveCache
    .findMany({
      orderBy: [{ forfaller: "asc" }, { notionLastEdited: "desc" }],
      take: 200,
    })
    .catch(() => []);

  const oppgaver: HandlingRad[] = raw.map((o) => {
    const col = kolOf(o.status);
    const priKey = priOf(o.prioritet);
    const tildelt = o.tildeltNavn[0] ?? null;

    const selskapRå = o.selskap[0] ?? null;
    const tag =
      selskapRå?.split(/[\s\-/]+/).slice(-1)[0]?.toUpperCase().slice(0, 4) ?? "PLAN";

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

  const today = new Date();
  const dato = `${today.getDate()}. ${["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"][today.getMonth()]}`;

  const data: AdminHandlingssenterData = { dato, oppgaver };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminHandlingssenterV2 data={data} />
    </V2Shell>
  );
}
