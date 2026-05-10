import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type ChatMelding = { role?: string; content?: string; ts?: string };

export default async function CoachNotes() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return (
      <p className="text-sm text-muted-foreground">
        Krever Pro-abonnement.
      </p>
    );
  }

  const sesjoner = await prisma.coachingSession.findMany({
    where: { userId: user.id, kind: "DIRECT" },
    include: { coach: { select: { name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const notater = sesjoner.flatMap((s) => {
    const meldinger = Array.isArray(s.messages) ? (s.messages as ChatMelding[]) : [];
    return meldinger
      .filter((m) => m.role === "coach" && typeof m.content === "string")
      .map((m) => ({
        sesjonId: s.id,
        coach: s.coach.name,
        content: m.content!,
        ts: m.ts ?? s.updatedAt.toISOString(),
      }));
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          Notater fra coach
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {notater.length === 0
            ? "Ingen direkte notater enda."
            : `${notater.length} notater fra coachen din.`}
        </p>
      </div>

      {notater.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Når en coach sender deg en direkte melding, dukker den opp her.
        </div>
      ) : (
        <ul className="space-y-3">
          {notater.map((n, i) => (
            <li
              key={`${n.sesjonId}-${i}`}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-foreground">{n.coach}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(n.ts).toLocaleDateString("nb-NO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground">{n.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
