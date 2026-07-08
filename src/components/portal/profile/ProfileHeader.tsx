"use client";

/**
 * ProfileHeader — avatar, navn, handicap og klubb for PlayerHQ-profilen.
 *
 * Bruker golfdata Avatar + DS-tokens. Meta-linja bygges av ekte felter
 * (HCP · hjemmeklubb · e-post) og vises i mono/uppercase-eyebrow-stil.
 */

import { Eyebrow, Avatar } from "@/components/athletic/golfdata";
import type { User } from "@/generated/prisma/client";

export type ProfileHeaderProps = {
  user: Pick<User, "name" | "email" | "avatarUrl" | "hcp" | "homeClub">;
};


function hcpTekst(hcp: number | null): string {
  if (hcp == null) return "—";
  return hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const metaDeler: string[] = [];
  if (user.hcp != null) metaDeler.push(`HCP ${hcpTekst(user.hcp)}`);
  if (user.homeClub) metaDeler.push(user.homeClub);
  if (user.email) metaDeler.push(user.email);

  return (
    <header className="flex items-center gap-4">
      <Avatar src={user.avatarUrl ?? undefined} name={user.name} size="xl" />
      <div className="min-w-0">
        <Eyebrow as="span">{metaDeler.join(" · ").toUpperCase()}</Eyebrow>
        <h1 className="mt-2 truncate font-display text-3xl font-bold leading-tight tracking-tight text-foreground">
          {user.name}
        </h1>
        <p className="mt-2 truncate font-mono text-xs text-muted-foreground">
          {user.email}
        </p>
      </div>
    </header>
  );
}
