import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { NyMeldingClient } from "./ny-melding-client";

export default async function NyMeldingPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  const coacher = await prisma.user.findMany({
    where: { role: "COACH" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 4,
  });

  const mottakere = coacher.length
    ? coacher.map((c, i) => ({
        id: c.id,
        name: c.name,
        role: i === 0 ? "Hovedcoach" : i === 1 ? "Fysio" : i === 2 ? "Mentor" : "Sub-coach",
        kind: (i === 0 ? "coach" : i === 1 ? "fysio" : i === 2 ? "mentor" : "team") as
          | "coach"
          | "fysio"
          | "mentor"
          | "team",
        status: (i % 2 === 0 ? "online" : "away") as "online" | "away" | undefined,
      }))
    : [
        { id: "hans", name: "Hans Brennum", role: "Hovedcoach", kind: "coach" as const, status: "online" as const },
        { id: "linn", name: "Linn Knutsen", role: "Fysio", kind: "fysio" as const, status: "away" as const },
        { id: "espen", name: "Espen Søvik", role: "Mentor", kind: "mentor" as const, status: "online" as const },
        { id: "anders", name: "Anders K.", role: "Sub-coach", kind: "team" as const, status: undefined },
      ];

  void user;

  return (
    <div className="min-h-screen bg-background pb-32 text-foreground">
      <nav className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 sm:gap-4 sm:px-8 sm:py-[18px]">
        <Link
          href="/portal/coach/melding"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Meldinger
        </Link>
        <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground sm:inline">
          /portal / coach / melding / <span className="font-semibold text-foreground">ny</span>
        </span>
      </nav>

      <main className="mx-auto max-w-[880px] space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
        <div className="space-y-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Ny utgående · utkast
          </span>
          <h1 className="font-display text-2xl font-semibold leading-[1.05] -tracking-[0.02em] sm:text-3xl md:text-[40px]">
            Ny <em className="font-display italic font-normal text-primary">melding</em>
          </h1>
          <p className="max-w-[600px] text-[14.5px] text-muted-foreground">
            Skriv til hovedcoach, fysio eller mentor. Utkast lagres automatisk hvert femte sekund
            — du kan komme tilbake senere.
          </p>
        </div>

        <NyMeldingClient mottakere={mottakere} />
      </main>
    </div>
  );
}
