import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type ChatMelding = { role?: string; content?: string; ts?: string };

export default async function AdminMessages() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sesjoner = await prisma.coachingSession.findMany({
    include: {
      user: { select: { id: true, name: true } },
      coach: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const direct = sesjoner.filter((s) => s.kind === "DIRECT");
  const ai = sesjoner.filter((s) => s.kind === "AI");

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Meldinger
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Coaching</em>-tråder
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Alle samtaler på tvers av spillere, sortert etter siste oppdatering.
        </p>
      </header>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
          Direkte ({direct.length})
        </h3>
        {direct.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Ingen direkte-samtaler.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {direct.map((s) => {
              const meldinger = Array.isArray(s.messages)
                ? (s.messages as ChatMelding[])
                : [];
              const siste = meldinger[meldinger.length - 1];
              return (
                <li key={s.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/admin/elever/${s.user.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {s.user.name}
                    </Link>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {s.updatedAt.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                      })}{" "}
                      ·{" "}
                      {s.updatedAt.toLocaleTimeString("nb-NO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {siste?.content && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      <span className="font-mono text-[10px] uppercase tracking-[0.10em]">
                        {siste.role}:{" "}
                      </span>
                      {siste.content}
                    </p>
                  )}
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {meldinger.length} meldinger
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
          AI-coach ({ai.length})
        </h3>
        {ai.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Ingen AI-samtaler.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {ai.slice(0, 20).map((s) => {
              const meldinger = Array.isArray(s.messages)
                ? (s.messages as ChatMelding[])
                : [];
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <Link
                    href={`/admin/elever/${s.user.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {s.user.name}
                  </Link>
                  <span className="font-mono text-xs text-muted-foreground">
                    {meldinger.length} meldinger ·{" "}
                    {s.updatedAt.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
