import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Circle,
  Package,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { extractClubs } from "@/lib/sg-hub/extract-shots";
import { requireCoachForPlayer } from "@/lib/sg-hub/coach-access";

const CLUB_ORDER = [
  "Driver", "1W", "3W", "5W", "7W",
  "1i", "2i", "3i", "4i", "5i", "6i", "7i", "8i", "9i",
  "PW", "AW", "GW", "SW", "LW", "PT",
];

function sortClubs(clubs: string[]): string[] {
  return [...clubs].sort((a, b) => {
    const ai = CLUB_ORDER.indexOf(a);
    const bi = CLUB_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default async function CoachHubPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  const user = await requirePortalUser();
  const { spillerId } = await params;
  const { player } = await requireCoachForPlayer(user, spillerId);

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: player.id },
    select: { rawJson: true },
  });

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }
  const clubs = sortClubs([...clubSet]);

  const base = `/portal/mal/sg-hub/coach/${spillerId}`;

  return (
    <div className="space-y-8">
      <Link
        href="/portal/mal/sg-hub"
        className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tilbake til SG Hub
      </Link>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
          Coach-modus
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          Du ser{" "}
          <em className="font-normal italic">{player.name}</em>{" "}
          sin SG Hub
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Alle innsikter og data tilhører spilleren. Du kan legge til
          shot-annotasjoner som spilleren ser.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="TrackMan-økter" value={sessions.length} />
        <StatCard label="Køller registrert" value={clubs.length} />
        <StatCard label="Spillerens tier" value={player.tier} isText />
      </div>

      <section>
        <h3 className="mb-4 font-semibold">Per-kølle analyse</h3>
        {clubs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Spilleren har ingen TrackMan-data ennå.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {clubs.map((club) => (
              <Link
                key={club}
                href={`${base}/${encodeURIComponent(club)}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                <Circle className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                <span className="font-mono text-sm font-semibold">{club}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground/40 transition-colors group-hover:text-primary" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-4 font-semibold">Verktøy</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href={`${base}/equipment`}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <Package className="mb-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            <h4 className="text-sm font-semibold">Equipment Fit</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Per-kølle helsesjekk på launch, spin og smash.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  isText = false,
}: {
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-2 font-semibold ${isText ? "text-lg" : "text-3xl tabular-nums"}`}
      >
        {value}
      </p>
    </div>
  );
}
