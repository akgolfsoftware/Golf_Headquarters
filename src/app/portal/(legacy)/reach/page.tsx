/**
 * PlayerHQ · Reach & Engagement (P2)
 *
 * Spiller-side for synlighet, connections, personvern og activity-feed.
 *
 * Det finnes ingen DB-modell for visninger, connections eller aktivitets-feed
 * ennå (verken synlighet, følgere eller engasjement er persistert). Tidligere
 * viste siden hardkodede eksempel-tall og påståtte personer som «likte» runder
 * — det er fjernet. Inntil modellen finnes viser siden en ærlig tom-tilstand.
 */
import Link from "next/link";
import { Inbox, Lock } from "lucide-react";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function ReachPage() {
  await requirePortalUser();

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 sm:px-6">
      <PageHeader
        eyebrow="PlayerHQ · /portal/reach"
        titleLead="Hvem ser"
        titleItalic="reisen"
        titleTrail="din?"
        sub="Synlighet, connections og personvern. Du bestemmer hva som deles og med hvem."
        actions={
          <Link
            href="/portal/meg/innstillinger"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Lock size={14} strokeWidth={1.75} />
            Personvern
          </Link>
        }
      />

      <section className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
          <Inbox size={22} strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-[20px] font-medium italic tracking-tight">
          Ingen reach-data ennå
        </h2>
        <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
          Synlighet, connections og aktivitet kobles til når funksjonen er klar.
          Inntil da har du ingen delt aktivitet å vise.
        </p>
      </section>
    </div>
  );
}
