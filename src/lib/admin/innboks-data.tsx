/**
 * Data-loader for AgencyOS Innboks (/admin/innboks).
 * Henter ekte Prisma-data og mapper til InboxScreenProps.
 *
 * Trådkilde: CoachingSession (kind=DIRECT) — de faktiske samtalene mellom
 * coach og spiller/foresatt. Hver tråd berikes med spiller-kontekst
 * (tier, hcp, hjemmeklubb, neste booking, SG-signal, treningstimer 30 d,
 * pyramide-signal) for kontekst-panelet til høyre.
 *
 * Følger samme mønster som src/lib/agencyos/daily-brief-data.tsx:
 *   Prisma → mappede props-typer → presentasjons-komponent leser kun props.
 */

import { prisma } from "@/lib/prisma";
import type {
  InboxScreenProps,
  InboxThread,
  InboxMessage,
  ThreadDot,
  ContextKpi,
} from "@/components/admin/innboks/inbox-screen";

type ChatMelding = { role?: string; content?: string; ts?: string };

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hhmm(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

/** Kort relativ tid for trådliste ("i dag 06:18", "i går 21:14", "man 09:12"). */
function whenLabel(d: Date, now: Date): string {
  if (d.toDateString() === now.toDateString()) return `i dag ${hhmm(d)}`;
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return `i går ${hhmm(d)}`;
  const seksDager = new Date(now);
  seksDager.setDate(seksDager.getDate() - 6);
  if (d.getTime() >= seksDager.getTime()) {
    return d.toLocaleDateString("nb-NO", { weekday: "short" }).replace(".", "");
  }
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

/** Dato-skille i samtalen ("I dag", "I går", "torsdag 29. mai"). */
function dayLabel(iso: string | undefined, now: Date): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (d.toDateString() === now.toDateString()) return "I dag";
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "I går";
  return d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" });
}

/**
 * Fargeprikk = hastegrad, ikke kategori (jf. design-prompt: rød=haster/ulest,
 * gul=nytt, grønn=info). Utledet fra trådens reelle tilstand:
 *  - rød:  ulest + siste melding > 12 t gammel (ventet lenge → handle i dag)
 *  - gul:  ulest, fersk (nytt, ditt svar venter)
 *  - grønn: lest / siste melding er fra coach (info, ingen handling)
 */
function dotForThread(unread: boolean, sisteTs: Date | null, now: Date): ThreadDot {
  if (!unread) return "green";
  if (!sisteTs) return "yellow";
  const timer = (now.getTime() - sisteTs.getTime()) / 3_600_000;
  return timer >= 12 ? "red" : "yellow";
}

export async function loadInboxScreen(
  coach: { id: string; name: string | null },
  selectedThreadId: string | null,
): Promise<InboxScreenProps> {
  const now = new Date();

  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);

  // Alle DIRECT-tråder (faktiske samtaler) — samme kilde som /admin/messages.
  const rawThreads = await prisma.coachingSession.findMany({
    where: { kind: "DIRECT" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          tier: true,
          hcp: true,
          homeClub: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 60,
  });

  // Hvilke spillere har en (godkjent) foresatt? → "Foresatte"-filteret.
  const spillerIds = Array.from(new Set(rawThreads.map((t) => t.user.id)));
  const foresattRelasjoner =
    spillerIds.length > 0
      ? await prisma.parentRelation.findMany({
          where: { childId: { in: spillerIds }, approved: true },
          select: { childId: true },
        })
      : [];
  const harForesatt = new Set(foresattRelasjoner.map((r) => r.childId));

  const threads: InboxThread[] = rawThreads.map((t) => {
    const meldinger = (Array.isArray(t.messages) ? t.messages : []) as ChatMelding[];
    const siste = meldinger[meldinger.length - 1];
    const sisteFraSpiller = siste?.role === "user";
    const sisteTs = siste?.ts ? new Date(siste.ts) : null;
    return {
      id: t.id,
      playerId: t.user.id,
      name: t.user.name,
      initials: initials(t.user.name),
      avatarUrl: t.user.avatarUrl,
      preview: siste?.content?.trim() || "Ingen meldinger ennå",
      when: whenLabel(t.updatedAt, now),
      unread: sisteFraSpiller,
      dot: dotForThread(sisteFraSpiller, sisteTs, now),
      hasGuardian: harForesatt.has(t.user.id),
    };
  });

  const unreadCount = threads.filter((t) => t.unread).length;

  // Aktiv tråd: query-param hvis gyldig, ellers første i listen.
  const activeId =
    (selectedThreadId && threads.some((t) => t.id === selectedThreadId)
      ? selectedThreadId
      : threads[0]?.id) ?? null;

  const activeRaw = activeId ? rawThreads.find((t) => t.id === activeId) ?? null : null;

  let conversation: InboxScreenProps["conversation"] = null;

  if (activeRaw) {
    const spiller = activeRaw.user;
    const meldinger = (Array.isArray(activeRaw.messages) ? activeRaw.messages : []) as ChatMelding[];

    // Meldingsbobler — coach/assistant = utgående, ellers innkommende.
    const messages: InboxMessage[] = meldinger.map((m, i) => ({
      id: `${activeRaw.id}-${i}`,
      direction: m.role === "coach" || m.role === "assistant" ? "out" : "in",
      author: m.role === "assistant" ? "AI-coach" : m.role === "coach" ? "Du" : spiller.name,
      text: m.content ?? "",
      time: m.ts ? hhmm(new Date(m.ts)) : "",
      dayLabel: dayLabel(m.ts, now),
    }));

    // Kontekst-data fra ekte Prisma — ingen oppdiktede tall.
    const [nesteBooking, sgSignal, treningSessions, pyramideSignal] = await Promise.all([
      prisma.booking.findFirst({
        where: { userId: spiller.id, startAt: { gte: now }, status: { in: ["CONFIRMED", "PENDING"] } },
        orderBy: { startAt: "asc" },
        include: { serviceType: { select: { name: true } } },
      }),
      prisma.signal.findFirst({
        where: { userId: spiller.id, kind: "SG_TOTAL" },
        orderBy: { computedAt: "desc" },
      }),
      prisma.trainingPlanSession.findMany({
        where: { plan: { userId: spiller.id }, scheduledAt: { gte: tretti, lt: now } },
        select: { durationMin: true },
      }),
      prisma.signal.findFirst({
        where: { userId: spiller.id, kind: "PYRAMID_AREA" },
        orderBy: { computedAt: "desc" },
      }),
    ]);

    const timer30d = Math.round(
      treningSessions.reduce((s, x) => s + (x.durationMin ?? 0), 0) / 60,
    );

    const sg = sgSignal?.value ?? null;
    const pyramidePct =
      pyramideSignal?.value != null ? Math.round(pyramideSignal.value * 100) : null;

    const kpis: ContextKpi[] = [
      {
        label: "TIMER 30 D",
        value: timer30d > 0 ? `${timer30d} t` : "—",
        tone: "neutral",
      },
      {
        label: "SG 7 D",
        value: sg != null ? `${sg >= 0 ? "+" : ""}${sg.toFixed(1).replace(".", ",")}` : "—",
        tone: sg == null ? "neutral" : sg >= 0 ? "up" : "down",
      },
      {
        label: "PYRAMIDE",
        value: pyramidePct != null ? `${pyramidePct} %` : "—",
        tone: "neutral",
      },
    ];

    // ELITE er dødt enum → vis som PRO (betalt). Kun GRATIS vises som gratis.
    const tierLabel = spiller.tier === "GRATIS" ? "GRATIS" : "PRO";
    const metaParts = [spiller.homeClub, `${tierLabel}-medlem`].filter(Boolean) as string[];

    conversation = {
      threadId: activeRaw.id,
      headerWhen: whenLabel(activeRaw.updatedAt, now),
      messages,
      context: {
        playerId: spiller.id,
        name: spiller.name,
        initials: initials(spiller.name),
        avatarUrl: spiller.avatarUrl,
        meta: metaParts.join(" · "),
        nextSession: nesteBooking
          ? {
              when: whenLabel(nesteBooking.startAt, now),
              title: nesteBooking.serviceType?.name ?? "Økt",
            }
          : null,
        kpis,
      },
    };
  }

  return {
    coachName: coach.name ?? "Coach",
    coachInitials: initials(coach.name),
    threadCount: threads.length,
    unreadCount,
    threads,
    activeThreadId: activeId,
    conversation,
  };
}
