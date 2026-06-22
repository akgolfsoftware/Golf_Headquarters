import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { KontaktSupportForm } from "./kontakt-support-form";

export default async function KontaktSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const user = await requirePortalUser();
  const sp = await searchParams;

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-8 px-4 sm:px-6">
      <PageHeader
        eyebrow="Støtte · Direkte kontakt"
        titleLead="Kontakt"
        titleItalic="support"
        sub="Beskriv problemet du opplever, så får vi det riktig første gang. Jo mer kontekst — desto raskere svar."
      />

      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground shadow-sm">
        <span className="relative inline-block h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
          <span className="absolute inset-0 rounded-full bg-success" />
        </span>
        <span>Svartid</span>
        <span className="font-bold text-foreground">~4 timer</span>
        <span className="h-3 w-px bg-border" />
        <span>Hverdager</span>
        <span className="font-bold text-foreground">08:00–17:00</span>
      </div>

      {sp?.ticket && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-foreground">
          Melding sendt. Ticket-ID <span className="font-mono font-semibold">#{sp.ticket}</span>. Du får svar på e-post.
        </div>
      )}

      <KontaktSupportForm
        bruker={{
          navn: user.name ?? "",
          epost: user.email ?? "",
        }}
      />
    </div>
  );
}
