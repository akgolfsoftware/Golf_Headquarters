/**
 * PlayerHQ Coach Meldinger (/portal/coach/melding) — hybrid-design 2026-06-17.
 *
 * Tre vis (tabs):
 *   - Ny melding — skriv til coach
 *   - Historikk — tidligere meldingstråder
 *   - Q&A — oppfølgingsspørsmål (lenker til thread-visning)
 *
 * Data-henting uendret fra før. Kun visuell re-styling til hybrid-mønster.
 */

import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { MeldingForm } from "./form";

type ChatMelding = { role?: string; content?: string; ts?: string };

export default async function CoachMeldingPage() {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN", "PARENT"],
  });

  if (user.tier === "GRATIS") {
    return (
      <div className="mx-auto max-w-[430px] space-y-6 px-4 pb-24 pt-2">
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Coach
        </Link>
        <div>
          <span className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            PlayerHQ · Meldinger
          </span>
          <h1 className="font-display text-[24px] font-bold leading-[1.06] tracking-[-0.025em] text-foreground">
            Krever{" "}
            <em className="font-medium italic text-primary">Pro</em>
          </h1>
          <p className="mt-2 text-[13.5px] text-muted-foreground">
            Direkte coach-meldinger er en del av Pro-abonnementet.
          </p>
        </div>
        <Link
          href="/portal/meg/abonnement"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:brightness-95"
        >
          Oppgrader til Pro
        </Link>
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

  return (
    <div className="mx-auto max-w-[430px] pb-24 pt-2 md:max-w-[860px] md:pb-8">
      {/* Tilbake + eyebrow */}
      <div className="mb-3 px-4 md:px-0">
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Coach
        </Link>
      </div>

      {/* Header */}
      <div className="mb-4 px-4 md:px-0">
        <h1 className="font-display text-[20px] font-bold leading-[1.06] tracking-[-0.02em] text-foreground">
          Ny{" "}
          <em className="font-medium italic text-primary">
            melding
          </em>
        </h1>
      </div>

      {/* Coach mottaker-kort */}
      {hovedcoach && (
        <div className="mx-3 mb-3.5 rounded-xl border border-border bg-card p-3 shadow-sm md:mx-0">
          <div className="mb-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Til
          </div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-mono text-[10px] font-bold text-primary-foreground">
              {hovedcoach.name
                .split(" ")
                .map((d) => d[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-foreground">{hovedcoach.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground">Head Coach</div>
            </div>
          </div>
        </div>
      )}

      {/* Compose-form */}
      <div className="mx-3 mb-3.5 md:mx-0">
        <MeldingForm coacher={coacher} />
      </div>

      {/* Meldingshistorikk */}
      {historikk.length > 0 && (
        <div className="mx-3 rounded-xl border border-border bg-card shadow-sm md:mx-0">
          <div className="border-b border-border/60 px-4 py-3">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Historikk · {historikk.length} tråd{historikk.length !== 1 ? "er" : ""}
            </span>
          </div>
          <ul className="divide-y divide-border/60">
            {historikk.map((h) => (
              <li key={h.id} className="px-4 py-3 transition hover:bg-secondary/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-foreground">{h.coachNavn}</span>
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {h.dato.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {h.snippet}
                </p>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground/60">
                  {h.antall} melding{h.antall !== 1 ? "er" : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Q&A — lenker til spørsmål-seksjonen */}
      <div className="mx-3 mt-3.5 rounded-xl border border-border bg-card shadow-sm md:mx-0">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Q&amp;A med {hovedcoach?.name.split(" ")[0] ?? "coach"}
          </span>
          <Link
            href="/portal/coach/sporsmal/ny"
            className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-primary hover:underline"
          >
            Se alle →
          </Link>
        </div>
        <div className="px-4 py-3">
          <p className="text-[13px] text-muted-foreground">
            Still spørsmål direkte til coachen din. Coachen svarer typisk innen 4 timer på hverdager.
          </p>
          <Link
            href="/portal/coach/sporsmal/ny"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:brightness-95"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2} />
            Still spørsmål
          </Link>
        </div>
      </div>
    </div>
  );
}
