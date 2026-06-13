"use client";

import Image from "next/image";
import Link from "next/link";
import { Trophy, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/app/portal/actions";

type DashboardHeroProps = {
  user: DashboardData["user"];
  greeting: string;
  nextTournament: DashboardData["nextTournament"];
  className?: string;
};

export function DashboardHero({ user, greeting, nextTournament, className }: DashboardHeroProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl md:rounded-[24px] min-h-[220px] md:min-h-[280px]",
        className,
      )}
    >
      <Image
        src="/images/akgolf/AK-Golf-Academy-1.webp"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 1280px"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/55 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-between p-5 md:min-h-[280px] md:p-8">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
              PlayerHQ
            </p>
          </div>
          <Link
            href="/portal/meg"
            className="flex items-center gap-3 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 backdrop-blur-sm transition hover:bg-black/30"
          >
            <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-xs font-bold">{user.initialer}</span>
              )}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-background">{user.name}</p>
              {user.hcp != null && (
                <p className="font-mono text-[10px] text-background/70">HCP {user.hcp.toFixed(1)}</p>
              )}
            </div>
          </Link>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-[-0.025em] text-background md:text-4xl lg:text-5xl">
              {greeting}, <span className="italic text-accent">{user.fornavn}</span>.
            </h1>
            <p className="mt-2 max-w-md text-sm text-background/80">
              Her er din daglige oversikt. Sjekk dagens økt, ukens progresjon og neste turnering.
            </p>
          </div>

          {nextTournament ? (
            <Link
              href={nextTournament.href}
              className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/25 p-3 backdrop-blur-sm transition hover:bg-black/35"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
                <Trophy size={18} strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                  Neste turnering
                </p>
                <p className="text-sm font-semibold text-background">{nextTournament.name}</p>
                <p className="font-mono text-[10px] text-background/70">
                  {nextTournament.daysLeft} dager igjen
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/25 p-3 backdrop-blur-sm">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-background/10 text-background">
                <TrendingDown size={18} strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                  Neste turnering
                </p>
                <p className="text-sm font-semibold text-background">Ingen planlagt</p>
                <p className="font-mono text-[10px] text-background/70">Legg til i Workbench</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
