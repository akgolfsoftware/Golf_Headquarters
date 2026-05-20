import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { AppFeedbackForm } from "./app-feedback-form";
import { FeedbackHistorikk } from "./feedback-historikk";

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ takk?: string }>;
}) {
  await requirePortalUser();
  const sp = await searchParams;

  return (
    <div className="mx-auto w-full max-w-[640px] space-y-8 pb-20 md:space-y-12 md:pb-0">
      <PageHeader
        eyebrow="Tilbakemelding · 30 sek"
        titleLead="Hva synes du om"
        titleItalic="PlayerHQ"
        titleTrail="?"
        sub="Vi leser hver eneste tilbakemelding. Bug, forslag eller bare ros — alt teller."
      />

      {sp?.takk === "1" && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
          Takk for tilbakemeldingen. Du gjør PlayerHQ bedre.
        </div>
      )}

      <AppFeedbackForm />

      <FeedbackHistorikk />
    </div>
  );
}
