"use client";

/**
 * ConnectedAccounts — viser status for kontoer/integrasjoner.
 *
 * Supabase-auth-leverandøren vises som tilkoblet. TrackMan og andre
 * integrasjoner vises som "kommer snart" inntil dedikerte modeller finnes.
 */

import { CheckCircle2, Link2, XCircle } from "lucide-react";

export type ConnectedAccountsProps = {
  /** Auth-leverandør fra Supabase, f.eks. "email" | "google" | "apple". */
  provider: string;
};

type AccountRow = {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  soon?: boolean;
};

function providerLabel(provider: string): string {
  const map: Record<string, string> = {
    email: "E-post og passord",
    google: "Google",
    apple: "Apple",
    github: "GitHub",
  };
  return map[provider.toLowerCase()] ?? provider;
}

export function ConnectedAccounts({ provider }: ConnectedAccountsProps) {
  const accounts: AccountRow[] = [
    {
      id: "supabase",
      name: "AK Golf-konto",
      description: providerLabel(provider),
      connected: true,
    },
    {
      id: "trackman",
      name: "TrackMan",
      description: "Launch-monitor-data",
      connected: false,
      soon: true,
    },
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-bold tracking-[-0.015em] text-foreground">
          Tilkoblede kontoer
        </h2>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Integrasjoner
        </p>
      </div>

      <div className="divide-y divide-border">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex min-h-14 items-center gap-4 px-4 py-2"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
              <Link2
                className="size-5"
                strokeWidth={1.75}
                aria-hidden
              />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold tracking-[-0.005em] text-foreground">
                {account.name}
              </span>
              <span className="mt-px block font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                {account.description}
                {account.soon && " · Kommer snart"}
              </span>
            </span>
            {account.connected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-success">
                <CheckCircle2 className="h-3 w-3" strokeWidth={2} aria-hidden />
                Tilkoblet
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                <XCircle className="h-3 w-3" strokeWidth={2} aria-hidden />
                Ikke tilkoblet
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
