/**
 * /admin/talent/wagr-import — Manuell import av WAGR-spillerprofil.
 *
 * Anders/Markus åpner wagr.com, finner spilleren, og limer inn data her.
 * Server action validerer + lagrer som WagrSnapshot. Hvis email-feltet
 * matcher en User i basen, kobles snapshotet automatisk.
 *
 * Auto-scraping kommer i Sprint J via Playwright/Chrome MCP.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { ImportForm } from "./import-form";

export default async function WagrImportPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Hent alle PLAYER-brukere som kan kobles
  const spillere = await prisma.user.findMany({
    where: { role: "PLAYER" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Talent · WAGR-import"
        titleLead="Importer fra"
        titleItalic="wagr.com"
        sub="Lim inn URL eller manuelt data fra spillerens WAGR-profil. NGF-kategori beregnes automatisk."
      />

      <ImportForm spillere={spillere} />

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Slik finner du dataene
        </h2>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-mono text-foreground">1.</span> Åpne{" "}
            <a
              href="https://www.wagr.com/mens-ranking"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              wagr.com/mens-ranking
            </a>{" "}
            og søk på navn (eller filtrer på land).
          </li>
          <li>
            <span className="font-mono text-foreground">2.</span> Klikk på
            spillerprofilen — URL-en ser ut som{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
              /playerprofile/{`{slug}`}
            </code>
            .
          </li>
          <li>
            <span className="font-mono text-foreground">3.</span> Kopier disse
            verdiene fra siden:{" "}
            <span className="font-medium text-foreground">
              Rank, Point average, Divisor
            </span>{" "}
            (over hovedtabellen) og evt. Wins / Top 10 / Best Rank fra
            statistikk-blokken.
          </li>
          <li>
            <span className="font-mono text-foreground">4.</span> Lim inn under,
            og snapshotet lagres med NGF-kategori auto-beregnet.
          </li>
        </ol>
      </section>
    </div>
  );
}
