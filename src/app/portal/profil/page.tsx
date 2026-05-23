/**
 * PlayerHQ — Min Profil (`/portal/profil`)
 *
 * Spillerens profilside med:
 * - Grunnleggende info (navn, HCP, rolle)
 * - Fasilitetsprofil — hvilke treningsfasiliteter spiller har tilgang til
 *
 * Fasilitetene brukes av «Mine anlegg»-filteret i drill-biblioteket og
 * AI-mal-byggeren for å foreslå kun gjennomførbare drills.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { FasilitetSelector } from "./fasilitet-selector";
import { MapPin, User } from "lucide-react";

export default async function ProfilPage() {
  const authUser = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      hcp: true,
      role: true,
      tier: true,
      tilgjengeligeFasiliteter: true,
    },
  });

  if (!dbUser) return null;

  const fasiliteter = (dbUser.tilgjengeligeFasiliteter ?? []) as string[];
  const hcpFormatert =
    dbUser.hcp != null
      ? dbUser.hcp > 0
        ? `+${dbUser.hcp}`
        : `${dbUser.hcp}`
      : "–";

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <PageHeader
        eyebrow="SPILLERPROFIL"
        titleLead="Profil:"
        titleItalic={dbUser.name ?? "Ukjent"}
        sub={`HCP ${hcpFormatert} · ${dbUser.tier === "PRO" ? "Pro-abonnement" : "Gratis"}`}
      />

      {/* Grid: grunninfo + fasiliteter */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

        {/* ── Grunnleggende info ── */}
        <section
          aria-labelledby="grunninfo-heading"
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <h2
              id="grunninfo-heading"
              className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              Spillerinfo
            </h2>
          </div>

          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs text-muted-foreground">Navn</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {dbUser.name ?? "–"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">E-post</dt>
              <dd className="mt-0.5 text-sm text-foreground">{dbUser.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Handicap</dt>
              <dd className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-foreground">
                {hcpFormatert}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Abonnement</dt>
              <dd className="mt-0.5">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                    dbUser.tier === "PRO"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {dbUser.tier}
                </span>
              </dd>
            </div>
          </dl>

          {fasiliteter.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Fasiliteter registrert
              </p>
              <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-foreground">
                {fasiliteter.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">av 14 mulige</p>
            </div>
          )}
        </section>

        {/* ── Fasilitetsprofil ── */}
        <section
          aria-labelledby="fasiliteter-heading"
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <h2
              id="fasiliteter-heading"
              className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              Treningsfasiliteter
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Velg hva du har tilgang til på treningsstedet ditt. Brukes til å filtrere
            drill-biblioteket slik at kun gjennomførbare øvelser vises.
          </p>

          <div className="mt-6">
            <FasilitetSelector initial={fasiliteter} />
          </div>
        </section>
      </div>
    </div>
  );
}
