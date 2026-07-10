/**
 * PlayerHQ · Trening · Tester · Ny egen test
 *
 * 5-stegs wizard for å opprette en custom TestDefinition. Spilleren
 * (eller coach) definerer testen, måleenhet, mål-verdi og synlighet.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EgenTestWizard } from "./wizard";

export const dynamic = "force-dynamic";

export default async function NyEgenTestPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  return (
    <div className="space-y-6 pb-20 md:space-y-8 md:pb-0">
      <div>
        <Link
          href="/portal/tren/tester"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={12} strokeWidth={1.75} /> Tilbake til tester
        </Link>
      </div>

      <PageHeader
        eyebrow="PlayerHQ · /portal/tren/tester/ny/egen"
        titleLead="Lag en"
        titleItalic="egen test"
        titleTrail={user.name ? `, ${user.name.split(" ")[0]}.` : "."}
        sub="Fem steg — navn, protokoll, måleenhet, synlighet og forhåndsvisning."
      />

      <EgenTestWizard rolle={user.role} />
    </div>
  );
}
