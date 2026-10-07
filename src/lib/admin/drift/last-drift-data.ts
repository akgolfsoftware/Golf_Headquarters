/**
 * AG-24 Drift: ekte data fra basen (sletteforespørsler, revisjonslogg, feillogg).
 * Bare for admin. Ingen metadata eller feilmeldingers rådata eksponeres utover
 * en kort, avkortet melding; persondata i revisjonsloggen vises ikke.
 */

import { prisma } from "@/lib/prisma";
import type {
  AG24Data,
  AuditHendelse,
  FeilloggRad,
  GdprForesporsel,
} from "@/components/admin/precision/AG24Drift";

const DAG_MS = 24 * 60 * 60 * 1000;

const tidFmt = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
const datoFmt = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function gdprStatus(status: string): GdprForesporsel["st"] | null {
  if (status === "OPEN") return "Venter";
  if (status === "APPROVED") return "Godkjent";
  if (status === "EXECUTED") return "Slettet";
  return null;
}

export function feilNivaa(severity: string): FeilloggRad["lvl"] {
  if (severity === "fatal" || severity === "error") return "Feil";
  if (severity === "warn") return "Advarsel";
  return "Info";
}

/** Slår sammen like feil (samme sted og melding) til én rad med antall. */
export function grupperFeil(
  rader: Array<{ id: string; createdAt: Date; severity: string; context: string; message: string }>,
): FeilloggRad[] {
  const grupper = new Map<string, FeilloggRad>();
  for (const r of rader) {
    const melding = r.message.length > 200 ? `${r.message.slice(0, 200)} …` : r.message;
    const nokkel = `${r.context}\u0000${melding}`;
    const eksisterende = grupper.get(nokkel);
    if (eksisterende) {
      eksisterende.n += 1;
    } else {
      grupper.set(nokkel, {
        id: r.id,
        t: tidFmt.format(r.createdAt),
        lvl: feilNivaa(r.severity),
        where: r.context,
        msg: melding,
        n: 1,
      });
    }
  }
  return [...grupper.values()];
}

export async function lastDriftData(): Promise<AG24Data> {
  const siste7 = new Date(Date.now() - 7 * DAG_MS);

  const [saker, audit, feil] = await Promise.all([
    prisma.moderationCase
      .findMany({
        where: { type: "GDPR_SLETTING", status: { in: ["OPEN", "APPROVED", "EXECUTED"] } },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
      .catch(() => []),
    prisma.auditLog
      .findMany({
        where: { createdAt: { gte: siste7 } },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { actor: { select: { name: true } } },
      })
      .catch(() => []),
    prisma.errorLog
      .findMany({
        where: { createdAt: { gte: siste7 } },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, createdAt: true, severity: true, context: true, message: true },
      })
      .catch(() => []),
  ]);

  const brukerIder = [...new Set(saker.flatMap((s) => [s.userId, s.reporterId]).filter((x): x is string => !!x))];
  const brukere =
    brukerIder.length > 0
      ? await prisma.user
          .findMany({ where: { id: { in: brukerIder } }, select: { id: true, name: true, role: true } })
          .catch(() => [])
      : [];
  const navn = new Map(brukere.map((b) => [b.id, b]));

  const gdpr: GdprForesporsel[] = saker.flatMap((s) => {
    const st = gdprStatus(s.status);
    if (!st) return [];
    const spiller = navn.get(s.userId);
    const innmelder = s.reporterId ? navn.get(s.reporterId) : null;
    return [
      {
        id: s.id,
        who: spiller?.name ?? "Ukjent bruker",
        role: spiller ? (spiller.role === "PARENT" ? "Forelder" : "Spiller") : "—",
        by: !s.reporterId ? "—" : s.reporterId === s.userId ? "Brukeren selv" : (innmelder?.name ?? "—"),
        at: datoFmt.format(s.createdAt),
        due: datoFmt.format(new Date(s.createdAt.getTime() + 30 * DAG_MS)),
        scope: s.begrunnelse?.trim() || "—",
        st,
        doneAt: st === "Slettet" && s.resolvedAt ? tidFmt.format(s.resolvedAt) : undefined,
      },
    ];
  });

  const auditRader: AuditHendelse[] = audit.map((a) => ({
    id: a.id,
    t: tidFmt.format(a.createdAt),
    who: a.actor?.name ?? "System",
    what: a.action,
    obj: a.target ?? "—",
  }));

  return { gdpr, audit: auditRader, errors: grupperFeil(feil) };
}
