// AgencyOS · Caddie — full chat-UI med samtale-historikk, approval-kø og foreslåtte spørsmål.
// Mock-data inntil AI SDK kobles på (M19). Komponentene følger samme API som
// `useChat` fra `@ai-sdk/react` for å gjøre overgangen sømløs.

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { CaddiePageShell } from "./caddie-page-shell";

export const dynamic = "force-dynamic";

export default async function CaddieTabPage() {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AgencyOS · Caddie"
        titleLead="Caddie"
        titleItalic="hjelper deg"
        sub="Direkte chat, godkjennings-kø og foreslåtte spørsmål."
        actions={
          <span className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            Aktiv · mock-modus
          </span>
        }
      />

      <CaddiePageShell />
    </div>
  );
}
