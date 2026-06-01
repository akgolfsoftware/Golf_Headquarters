/**
 * PlayerHQ · Trening · Turnering — Detalj
 *
 * Detaljvisning for én enkelt turnering. Henter ekte data via
 * loadTurneringDetalj (Tournament + spillerens TournamentEntry +
 * TournamentResult-historikk). Tomt/manglende felt utelates — aldri falske
 * tall (se data-loaderen for det ærlige data-prinsippet).
 *
 * Port av public/design-handover/playerhq/components-turnering-detalj.html
 * (mobile-first 430px). Auth-guard beholdt.
 */

import Link from "next/link";
import { ChevronLeft, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadTurneringDetalj } from "@/lib/portal-turnering/turnering-detalj-data";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { TurneringDetaljScreen } from "@/components/portal/turnering-detalj/turnering-detalj-screen";

export const dynamic = "force-dynamic";

export default async function TurneringDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const data = await loadTurneringDetalj(user.id, id);

  if (!data) {
    return (
      <div className="space-y-6 pb-20">
        <Link
          href="/portal/tren/turneringer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Tilbake til turneringer
        </Link>
        <PageHeader
          eyebrow="PlayerHQ · Tren · Turnering"
          titleLead="Turnering"
          titleItalic="ikke funnet"
          sub="Vi fant ingen turnering med denne ID-en."
        />
        <EmptyState
          icon={Trophy}
          titleItalic="Ingen"
          titleTrail="turnering tilgjengelig"
          sub="Turneringen ble ikke funnet eller du har ikke tilgang."
          cta={
            <Link
              href="/portal/tren/turneringer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
            >
              Se alle turneringer
            </Link>
          }
        />
      </div>
    );
  }

  return <TurneringDetaljScreen data={data} />;
}
