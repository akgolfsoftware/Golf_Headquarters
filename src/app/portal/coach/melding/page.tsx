import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MessageSquare, Clock } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { MeldingForm } from "./form";

type ChatMelding = { role?: string; content?: string; ts?: string };

export default async function CoachMeldingPage() {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN", "PARENT"],
  });

  if (user.tier === "GRATIS") {
    return (
      <div className="mx-auto max-w-[860px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            PlayerHQ · Coach
          </span>
          <h1 className="font-display text-3xl font-semibold italic leading-tight -tracking-[0.01em]">
            Krever <em className="italic font-medium text-primary">Pro</em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Direkte coach-meldinger er en del av Pro-abonnementet.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <Link
            href="/portal/meg/abonnement"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Oppgrader til Pro
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    );
  }

  const [coacher, sesjoner] = await Promise.all([
    prisma.user.findMany({
      where: { role: "COACH" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.coachingSession.findMany({
      where: { userId: user.id, kind: "DIRECT" },
      include: { coach: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  const historikk = sesjoner.map((s) => {
    const meldinger = Array.isArray(s.messages)
      ? (s.messages as ChatMelding[])
      : [];
    const sisteMelding = meldinger.at(-1);
    const snippet =
      typeof sisteMelding?.content === "string"
        ? sisteMelding.content.slice(0, 80) +
          (sisteMelding.content.length > 80 ? "…" : "")
        : "Ingen meldinger";
    return {
      id: s.id,
      coachNavn: s.coach.name,
      antall: meldinger.length,
      snippet,
      dato: s.updatedAt,
    };
  });

  const hovedcoach = coacher[0];
  const fornavn = hovedcoach?.name.split(" ")[0] ?? "coach";
  const initialer = hovedcoach
    ? hovedcoach.name
        .split(" ")
        .map((d) => d[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CO";

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <div className="mx-auto max-w-[1080px] px-4 py-6 sm:px-6 sm:py-8">
        {/* Tilbake + PageHeader */}
        <div className="mb-8 space-y-4">
          <Link
            href="/portal/coach"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Tilbake
          </Link>
          <PageHeader
            eyebrow="PlayerHQ · Ny melding"
            titleLead="Ny melding"
            titleItalic={`til ${fornavn}`}
            sub="Skriv direkte til coachen din. Svartid typisk innen 4 timer på hverdager."
            actions={
              hovedcoach ? (
                <div className="flex items-center gap-4 rounded-full border border-border bg-card px-4 py-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {initialer}
                  </div>
                  <div className="text-[12.5px] leading-tight">
                    <div className="font-semibold">{hovedcoach.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      Hovedcoach
                    </div>
                  </div>
                </div>
              ) : undefined
            }
          />
        </div>

        {/* To-panel layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Venstre: meldingshistorikk */}
          <aside className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Historikk
              </span>
            </div>

            {historikk.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center">
                <MessageSquare
                  size={24}
                  strokeWidth={1.5}
                  className="mx-auto text-muted-foreground/40"
                />
                <p className="mt-4 text-xs text-muted-foreground">
                  Ingen meldingshistorikk ennå
                </p>
              </div>
            ) : (
              <ul className="overflow-hidden rounded-lg border border-border bg-card">
                {historikk.map((h) => (
                  <li
                    key={h.id}
                    className="border-b border-border/60 px-4 py-4 last:border-b-0 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-semibold text-foreground">
                        {h.coachNavn}
                      </span>
                      <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] tabular-nums text-muted-foreground">
                        <Clock size={10} strokeWidth={1.5} />
                        {h.dato.toLocaleDateString("nb-NO", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground line-clamp-2">
                      {h.snippet}
                    </p>
                    <div className="mt-1.5 font-mono text-[10px] text-muted-foreground/70">
                      {h.antall} melding{h.antall !== 1 ? "er" : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {historikk.length > 0 && (
              <Link
                href="/portal/coach/notes"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
              >
                Se alle notater
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </Link>
            )}
          </aside>

          {/* Høyre: compose */}
          <main>
            <MeldingForm coacher={coacher} />
          </main>
        </div>
      </div>
    </div>
  );
}
