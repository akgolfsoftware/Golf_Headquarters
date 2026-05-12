import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { PageHeader } from "@/components/shared/page-header";
import { HelseForm } from "./helse-form";

export default async function HelsePage() {
  const user = await requirePortalUser();
  const prefs = lesPreferences(user);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Helse"
        titleLead="Kroppen din,"
        titleItalic="dataen din"
        sub="Manuelle helse-data brukes til å justere treningsbelastning. Apple Health og Garmin-integrasjoner kommer i v2."
      />

      <section className="rounded-lg border border-border bg-card p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Integrasjoner
        </span>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Integration navn="Apple Health" beskrivelse="iOS Health-data automatisk" />
          <Integration navn="Garmin" beskrivelse="Hvilepuls + søvn fra klokke" />
        </div>
      </section>

      <HelseForm initial={(prefs as unknown as { helse?: { restingHr?: number; sleep?: number } }).helse ?? {}} />
    </div>
  );
}

function Integration({ navn, beskrivelse }: { navn: string; beskrivelse: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{navn}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          v2
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{beskrivelse}</p>
    </div>
  );
}
