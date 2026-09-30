import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";

/** Felles for alle Innboks-fanene: spillerens coach og antall uleste varsler. */
export async function innboksKontekst(userId: string): Promise<{ coachId: string | null; coachNavn: string | null; uleste: number }> {
  const [enrollering, uleste] = await Promise.all([
    prisma.playerEnrollment.findFirst({
      where: { userId, endedAt: null, coachId: { not: null } },
      include: { coach: { select: { id: true, name: true } } },
      orderBy: { enrolledAt: "desc" },
    }),
    getUnreadNotifications(userId, 1).then((d) => d.count).catch(() => 0),
  ]);
  return { coachId: enrollering?.coach?.id ?? null, coachNavn: enrollering?.coach?.name ?? null, uleste };
}

type ChatMelding = { role?: string; content?: string; ts?: string };
const OSLO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });

/** Alle meldinger mellom spilleren og coachen, eldste først. Ingen tråd gir tom liste. */
export async function hentMeldingsTrad(userId: string, coachId: string | null) {
  if (!coachId) return [];
  const sesjoner = await prisma.coachingSession.findMany({
    where: { userId, coachId, kind: "DIRECT" },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { id: true, createdAt: true, messages: true },
  });
  return sesjoner.flatMap((s) => {
    const liste = Array.isArray(s.messages) ? (s.messages as ChatMelding[]) : [];
    return liste
      .filter((m) => typeof m.content === "string" && m.content.trim() !== "")
      .map((m, i) => {
        const d = m.ts ? new Date(m.ts) : s.createdAt;
        const tid = Number.isNaN(d.getTime()) ? "—" : OSLO.format(d).replace(", ", " · ").replace("/", ".");
        return { id: `${s.id}-${i}`, meg: m.role === "user", tekst: m.content as string, tid };
      });
  });
}
