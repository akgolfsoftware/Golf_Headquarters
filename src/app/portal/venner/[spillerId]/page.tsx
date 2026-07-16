/**
 * /portal/venner/[spillerId] — B39, venn-profil (Strava-mønsteret).
 *
 * Egen rute, bevisst ATSKILT fra /portal/spiller/[spillerId] (som i dag viser
 * en spillers FULLE profil — Plan + Coaching-historikk — for enhver innlogget
 * portal-bruker, brukt fra akademi-leaderboardet). Denne siden viser KUN en
 * venns hero + aktivitetsfeed (AT en økt/runde skjedde) — aldri plan, fagkoder,
 * SG-tall eller coach-notater (B29). Krever et bekreftet (ACCEPTED)
 * venneforhold — 404 ellers, i stedet for å lekke at brukeren finnes.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, EyeOff, Activity } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { hentVennProfil } from "@/lib/venner/actions";
import { FjernVennKnapp } from "./FjernVennKnapp";

export const dynamic = "force-dynamic";

function formatterDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export default async function VennProfilPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  await requirePortalUser();
  const { spillerId } = await params;

  const data = await hentVennProfil(spillerId);
  if (!data) notFound();

  const { venn, feed, synligAv } = data;
  const vennSub = [
    venn.kategori ? `Kategori ${venn.kategori}` : null,
    venn.hcp != null ? `HCP ${venn.hcp.toString().replace(".", ",")}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 pb-20 sm:px-6">
      <Link
        href="/portal/venner"
        className="inline-flex h-11 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        Venner
      </Link>

      <PlayerHero
        eyebrow="PlayerHQ · Venn"
        titleLead="Venn"
        titleItalic={venn.name.split(" ")[0]}
        titleTrail={venn.name.split(" ").slice(1).join(" ") || undefined}
        sub={vennSub || undefined}
        actions={<FjernVennKnapp vennUserId={venn.id} />}
      />

      <section className="space-y-2">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Aktivitet
        </h2>
        {!synligAv ? (
          <EmptyState
            icon={EyeOff}
            titleItalic={venn.name.split(" ")[0]}
            titleTrail="deler ikke økter ennå"
            sub="Denne spilleren har ikke skrudd på synlige økter for venner."
          />
        ) : feed.length === 0 ? (
          <EmptyState
            icon={Activity}
            titleItalic="Ingen"
            titleTrail="aktivitet ennå"
            sub="Ingen fullførte økter eller runder registrert ennå."
          />
        ) : (
          <div className="space-y-2">
            {feed.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-none">{a.tittel}</div>
                  <div className="mt-1 text-[11.5px] text-muted-foreground">{a.detalj}</div>
                </div>
                <div className="shrink-0 text-[10.5px] text-muted-foreground">
                  {formatterDato(a.dato)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        <EyeOff size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-primary" />
        <span>
          Du ser kun AT {venn.name.split(" ")[0]} har trent — ingen plan, mål eller tall er delt.
        </span>
      </div>
    </div>
  );
}
