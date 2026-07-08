"use client";

/**
 * ProfileHeader — avatar, navn, handicap og klubb for PlayerHQ-profilen.
 *
 * Bruker AthleticAvatar + DS-tokens. Meta-linja bygges av ekte felter
 * (HCP · hjemmeklubb · e-post) og vises i mono/uppercase-eyebrow-stil.
 */

import type { User } from "@/generated/prisma/client";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticAvatar } from "@/components/athletic/avatar";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export type ProfileHeaderProps = {
  user: Pick<User, "name" | "email" | "avatarUrl" | "hcp" | "homeClub">;
};

function initialer(navn: string): string {
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return "—";
  if (deler.length === 1) return deler[0].slice(0, 2).toUpperCase();
  return (deler[0][0] + deler[deler.length - 1][0]).toUpperCase();
}

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
      <AthleticAvatar
        src={user.avatarUrl}
        initials={initialer(user.name)}
        borderColor="card"
        className="h-[72px] w-[72px] border-0 text-2xl shadow-none"
      />
      <div className="min-w-0">
        <AthleticEyebrow>{metaDeler.join(" · ").toUpperCase()}</AthleticEyebrow>
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
