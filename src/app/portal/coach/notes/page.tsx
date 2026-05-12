import { MessageCircle, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type ChatMelding = { role?: string; content?: string; ts?: string };

export default async function CoachNotes() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="PlayerHQ · Coach"
          titleLead="Krever"
          titleItalic="Pro"
          sub="Notater fra coach er en del av Pro-abonnementet."
        />
      </div>
    );
  }

  const sesjoner = await prisma.coachingSession.findMany({
    where: { userId: user.id, kind: "DIRECT" },
    include: { coach: { select: { name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const notater = sesjoner.flatMap((s) => {
    const meldinger = Array.isArray(s.messages)
      ? (s.messages as ChatMelding[])
      : [];
    return meldinger
      .filter((m) => m.role === "coach" && typeof m.content === "string")
      .map((m) => ({
        sesjonId: s.id,
        coach: s.coach.name,
        coachInitial: s.coach.name.charAt(0).toUpperCase(),
        content: m.content!,
        ts: m.ts ?? s.updatedAt.toISOString(),
      }));
  });

  // Tell nye siste 7 dager
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const nyeIUken = notater.filter((n) => new Date(n.ts).getTime() > sevenDaysAgo).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Coach · Notater"
        titleLead={notater.length === 0 ? "Ingen" : `${notater.length}`}
        titleItalic={notater.length === 0 ? "notater enda" : "notater"}
        titleTrail={notater.length > 1 ? "fra coach" : undefined}
        sub={
          notater.length === 0
            ? "Når coachen sender deg en direkte melding, dukker den opp her."
            : nyeIUken > 0
              ? `Sist: ${formatTs(notater[0].ts)} · ${nyeIUken} nye denne uka`
              : `Sist: ${formatTs(notater[0].ts)}`
        }
      />

      {notater.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          titleItalic="Ingen notater"
          titleTrail="enda"
          sub="Notater fra coachen din vises her så fort de sendes."
        />
      ) : (
        <ul className="space-y-3">
          {notater.map((n, i) => (
            <article
              key={`${n.sesjonId}-${i}`}
              className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <header className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
                  {n.coachInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold leading-none">
                      {n.coach}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      · {formatTs(n.ts)}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Hovedcoach
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                  <MessageSquare size={11} strokeWidth={1.5} />
                  Tilbakemelding
                </span>
              </header>
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                {n.content}
              </p>
            </article>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatTs(ts: string): string {
  return new Date(ts).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
