/**
 * Testdag i AgencyOS (AG-15, designløftet 20.10.2026): valgene for «Planlegg testdag»,
 * én testdag med stasjoner og spillere, og én deltaker til «Registrer test».
 *
 * Tilgang: coachen eier gruppa eller er aktivt COACH-medlem (editableGroupWhere), samme
 * regel som lagringen (saveTnTestSomCoach). ADMIN ser alle. Testene er bare de en trener
 * kan føre (trenerKanFore: Teknikk og PEI); resten fører spilleren selv i PlayerHQ.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { editableGroupWhere } from "@/lib/workbench/group-scope";
import { TN_CATALOG, tnProtocol, type TnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnFormat, type TnResult, type TnValues } from "@/lib/portal-tester/tn-scoring";
import { TnSessionSchema } from "@/lib/portal-tester/tn-session";
import { TESTBATTERI, trenerKanFore, type BatteriDel } from "@/lib/portal-tester/testbatteri";

type Viewer = { id: string; role: string };

export type StasjonsTest = { protokollId: string; navn: string; del: BatteriDel; slag: number };

/** Testene en coach kan legge på en testdag: batteritester trenere fører, ikke sperret i katalogen. */
export function stasjonsTester(): StasjonsTest[] {
  return TESTBATTERI.flatMap((b) => b.protokoller.flatMap((id): StasjonsTest[] => {
    const p = TN_CATALOG.find((x) => x.id === id);
    if (!p || p.blocked || p.variableCount || !trenerKanFore({ protokollId: id })) return [];
    return [{ protokollId: id, navn: b.protokoller.length > 1 ? p.name : b.navn, del: b.del, slag: p.rows.length }];
  }));
}

export async function lastTestdagValg(viewer: Viewer) {
  const grupper = await prisma.group.findMany({
    where: editableGroupWhere(viewer),
    orderBy: { name: "asc" },
    select: { id: true, name: true, _count: { select: { members: { where: { role: "PLAYER", endedAt: null } } } } },
  });
  return { grupper: grupper.map((g) => ({ id: g.id, navn: g.name, antall: g._count.members })), tester: stasjonsTester() };
}

const tid = (d: Date) => new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" }).format(d);
const dato = (d: Date) => new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" }).format(d);

export type TestdagVisning = {
  id: string;
  tittel: string;
  sted: string | null;
  dato: string;
  klokke: string;
  gruppe: string;
  stasjoner: {
    id: string; navn: string; status: string;
    deltakere: { id: string; spiller: string; status: "PENDING" | "DONE" | "SKIPPED" | "ABSENT"; resultat: string | null }[];
  }[];
};

/** Én testdag (arrangement) med stasjonene og spillerne. null når coachen ikke har tilgang. */
export async function lastTestdag(viewer: Viewer, eventId: string): Promise<TestdagVisning | null> {
  const ev = await prisma.testDayEvent.findFirst({
    where: { id: eventId, organizer: editableGroupWhere(viewer) },
    select: {
      id: true, title: true, location: true, scheduledAt: true, organizer: { select: { name: true } },
      stations: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true, title: true, status: true, testDefinition: { select: { name: true } },
          participants: { orderBy: { order: "asc" }, select: { id: true, status: true, player: { select: { name: true } }, result: { select: { score: true, details: true } } } },
        },
      },
    },
  });
  if (!ev) return null;
  return {
    id: ev.id, tittel: ev.title, sted: ev.location, dato: dato(ev.scheduledAt), klokke: tid(ev.scheduledAt), gruppe: ev.organizer.name,
    stasjoner: ev.stations.map((s) => ({
      id: s.id, navn: s.testDefinition.name, status: s.status,
      deltakere: s.participants.map((p) => {
        const d = p.result?.details as Partial<TnResult> | null;
        return { id: p.id, spiller: p.player.name ?? "Uten navn", status: p.status, resultat: p.result && d?.unit ? tnFormat({ value: p.result.score, unit: d.unit }) : null };
      }),
    })),
  };
}

export type RegistreringData = {
  deltakerId: string;
  spiller: string;
  status: "PENDING" | "DONE" | "SKIPPED" | "ABSENT";
  protokoll: TnProtocol;
  testdag: { eventId: string | null; stasjonId: string; tittel: string; aktiv: boolean };
  utkast: { revision: number; values: TnValues; notes: string } | null;
  resultat: string | null;
  andre: { id: string; spiller: string; status: string }[];
  nesteId: string | null;
};

/** Én deltaker til «Registrer test». null når coachen ikke har tilgang eller protokollen ikke kan føres. */
export async function lastRegistrering(viewer: Viewer, deltakerId: string): Promise<RegistreringData | null> {
  const d = await prisma.testDayParticipant.findFirst({
    where: { id: deltakerId, testDay: { group: editableGroupWhere(viewer) } },
    select: {
      id: true, status: true, player: { select: { name: true } },
      session: { select: { scoringData: true } },
      result: { select: { score: true, details: true } },
      testDay: {
        select: {
          id: true, eventId: true, title: true, status: true,
          testDefinition: { select: { scoringRule: true, protocol: true } },
          participants: { orderBy: { order: "asc" }, select: { id: true, status: true, player: { select: { name: true } } } },
        },
      },
    },
  });
  if (!d) return null;
  const protokollId = (d.testDay.testDefinition.protocol as { protocolId?: string } | null)?.protocolId ?? "";
  const protokoll = tnProtocol(protokollId, undefined, d.testDay.testDefinition.scoringRule ?? "");
  if (!protokoll || !trenerKanFore({ protokollId })) return null;
  const parsed = d.session ? TnSessionSchema.safeParse(d.session.scoringData) : null;
  const utkast = parsed?.success && parsed.data.protocolId === protokoll.id && parsed.data.count === protokoll.rows.length
    ? { revision: parsed.data.revision, values: parsed.data.values, notes: parsed.data.notes } : null;
  const detaljer = d.result?.details as Partial<TnResult> | null;
  const naboer = d.testDay.participants;
  const i = naboer.findIndex((n) => n.id === d.id);
  return {
    deltakerId: d.id, spiller: d.player.name ?? "Uten navn", status: d.status, protokoll,
    testdag: { eventId: d.testDay.eventId, stasjonId: d.testDay.id, tittel: d.testDay.title, aktiv: d.testDay.status === "ACTIVE" },
    utkast,
    resultat: d.result && detaljer?.unit ? tnFormat({ value: d.result.score, unit: detaljer.unit }) : null,
    andre: naboer.map((n) => ({ id: n.id, spiller: n.player.name ?? "Uten navn", status: n.status })),
    nesteId: naboer.slice(i + 1).find((n) => n.status === "PENDING")?.id ?? naboer.slice(0, i).find((n) => n.status === "PENDING")?.id ?? null,
  };
}
