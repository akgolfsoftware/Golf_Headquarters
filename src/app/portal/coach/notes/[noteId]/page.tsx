import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type ChatMelding = { role?: string; content?: string; ts?: string };

export default async function NoteDetalj({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const user = await requirePortalUser();
  const { noteId } = await params;

  if (user.tier === "GRATIS") {
    return <p className="text-sm text-muted-foreground">Krever Pro-abonnement.</p>;
  }

  const sesjon = await prisma.coachingSession.findUnique({
    where: { id: noteId },
    include: { coach: { select: { name: true, email: true } } },
  });
  if (!sesjon) notFound();
  if (sesjon.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") {
    notFound();
  }

  const meldinger = Array.isArray(sesjon.messages)
    ? (sesjon.messages as ChatMelding[])
    : [];

  return (
    <div className="space-y-6">
      <Link
        href="/portal/coach/notes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Alle notater
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {sesjon.kind === "AI" ? "AI-coach" : "Direkte"} · {sesjon.coach.name}
        </span>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight">
          Samtale fra{" "}
          {sesjon.createdAt.toLocaleDateString("nb-NO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </h2>
      </header>

      {meldinger.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen meldinger i denne samtalen ennå.
        </p>
      ) : (
        <ul className="space-y-3">
          {meldinger.map((m, i) => {
            const erBruker = m.role === "user";
            return (
              <li
                key={i}
                className={`flex ${erBruker ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    erBruker
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content ?? ""}</p>
                  {m.ts && (
                    <p
                      className={`mt-1 font-mono text-[10px] ${
                        erBruker ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(m.ts).toLocaleString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {sesjon.kind === "DIRECT" && (
        <Link
          href="/portal/coach/melding"
          className="inline-block rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Send ny melding
        </Link>
      )}
    </div>
  );
}
